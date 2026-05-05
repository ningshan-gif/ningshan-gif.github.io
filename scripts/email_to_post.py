#!/usr/bin/env python3
"""
Checks a Gmail inbox for new emails and turns them into Jekyll blog posts.

Email format:
  Subject: Your Post Title
  Body:
    image: /images/your-cover.jpg   ← optional first line to set cover image

    Your post content here...
    Markdown is supported.
"""

import imaplib
import email
import os
import re
import subprocess
from datetime import datetime
from email.header import decode_header
from email.utils import parsedate_to_datetime

GMAIL_USER = os.environ["GMAIL_USER"]
GMAIL_APP_PASSWORD = os.environ["GMAIL_APP_PASSWORD"]
ALLOWED_SENDER = os.environ.get("ALLOWED_SENDER", "cedarma02@gmail.com")
POSTS_DIR = "_posts"
DEFAULT_IMAGE = "/images/head-5.JPG"


def decode_str(s):
    parts = decode_header(s)
    result = []
    for part, enc in parts:
        if isinstance(part, bytes):
            result.append(part.decode(enc or "utf-8", errors="replace"))
        else:
            result.append(part)
    return "".join(result)


def slugify(title):
    # Keep ASCII alphanumeric; replace spaces/underscores with hyphens
    slug = title.lower()
    slug = re.sub(r"[^\w\s-]", "", slug, flags=re.ASCII)
    slug = re.sub(r"[\s_]+", "-", slug)
    slug = slug.strip("-")
    # If title was all non-ASCII (e.g. Chinese), slug will be empty
    if not slug:
        slug = datetime.utcnow().strftime("%H%M%S")
    return slug[:60]


def get_plain_body(msg):
    if msg.is_multipart():
        for part in msg.walk():
            if part.get_content_type() == "text/plain":
                charset = part.get_content_charset() or "utf-8"
                return part.get_payload(decode=True).decode(charset, errors="replace")
    else:
        charset = msg.get_content_charset() or "utf-8"
        return msg.get_payload(decode=True).decode(charset, errors="replace")
    return ""


def create_post(title, raw_body, date):
    lines = raw_body.strip().splitlines()

    # Optional first line: image: /images/something.jpg
    image = DEFAULT_IMAGE
    if lines and lines[0].strip().startswith("image:"):
        image = lines[0].split(":", 1)[1].strip()
        lines = lines[1:]

    body = "\n".join(lines).strip()
    slug = slugify(title)
    filename = f"{date.strftime('%Y-%m-%d')}-{slug}.markdown"
    filepath = os.path.join(POSTS_DIR, filename)

    # Don't overwrite
    if os.path.exists(filepath):
        print(f"Skipping (already exists): {filename}")
        return None

    # Escape quotes in title for YAML
    safe_title = title.replace('"', '\\"')

    content = (
        f'---\n'
        f'layout: post\n'
        f'title:  "{safe_title}"\n'
        f'description:\n'
        f'date:   {date.strftime("%Y-%m-%d %H:%M:%S")} +0000\n'
        f"image:  '{image}'\n"
        f'---\n\n'
        f'{body}\n'
    )

    os.makedirs(POSTS_DIR, exist_ok=True)
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)

    return filename


def main():
    mail = imaplib.IMAP4_SSL("imap.gmail.com")
    mail.login(GMAIL_USER, GMAIL_APP_PASSWORD)
    mail.select("inbox")

    # Unread emails from the allowed sender
    _, message_ids = mail.search(None, f'(UNSEEN FROM "{ALLOWED_SENDER}")')

    new_posts = []

    for msg_id in message_ids[0].split():
        _, msg_data = mail.fetch(msg_id, "(RFC822)")
        raw = msg_data[0][1]
        msg = email.message_from_bytes(raw)

        # Double-check sender
        sender = msg.get("From", "")
        if ALLOWED_SENDER not in sender:
            continue

        title = decode_str(msg.get("Subject", "Untitled")).strip()
        body = get_plain_body(msg).strip()

        try:
            date = parsedate_to_datetime(msg.get("Date", ""))
        except Exception:
            date = datetime.utcnow()

        filename = create_post(title, body, date)
        if filename:
            new_posts.append(filename)
            print(f"Created: {filename}")

        # Mark as read so it won't be processed again
        mail.store(msg_id, "+FLAGS", "\\Seen")

    mail.logout()

    if new_posts:
        subprocess.run(["git", "config", "user.email", ALLOWED_SENDER], check=True)
        subprocess.run(["git", "config", "user.name", "Ningshan Ma"], check=True)
        files = [os.path.join(POSTS_DIR, f) for f in new_posts]
        subprocess.run(["git", "add"] + files, check=True)
        count = len(new_posts)
        subprocess.run(
            ["git", "commit", "-m", f"Add {count} new post(s) via email"],
            check=True,
        )
        subprocess.run(["git", "push"], check=True)
        print(f"Pushed {count} new post(s).")
    else:
        print("No new emails to process.")


if __name__ == "__main__":
    main()
