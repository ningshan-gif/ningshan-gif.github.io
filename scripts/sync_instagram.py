#!/usr/bin/env python3
"""
Scrapes the latest photos from public Instagram viewer (imginn.com)
for @sleepychunk, saves them to images/instagram/, and writes
_data/instagram.yml so the footer gallery displays them automatically.
"""

import os
import re
import subprocess
import sys
import yaml

try:
    import requests
    from bs4 import BeautifulSoup
except ImportError:
    subprocess.check_call([sys.executable, "-m", "pip", "install", "requests", "beautifulsoup4"])
    import requests
    from bs4 import BeautifulSoup

INSTAGRAM_USERNAME = "sleepychunk"
OUTPUT_DIR = "images/instagram"
DATA_FILE = "_data/instagram.yml"
MAX_POSTS = 12

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "en-US,en;q=0.9",
}


def load_existing():
    if not os.path.exists(DATA_FILE):
        return []
    with open(DATA_FILE, encoding="utf-8") as f:
        return (yaml.safe_load(f) or {}).get("photos", [])


def scrape_posts():
    url = f"https://imginn.com/{INSTAGRAM_USERNAME}/"
    r = requests.get(url, headers=HEADERS, timeout=30)
    r.raise_for_status()
    soup = BeautifulSoup(r.text, "html.parser")

    posts = []
    for item in soup.select(".item"):
        img_tag = item.select_one("img")
        link_tag = item.select_one("a[href]")
        if not img_tag:
            continue

        img_url = img_tag.get("data-src") or img_tag.get("src", "")
        if not img_url or "jpg" not in img_url:
            continue

        # Extract shortcode from the post link e.g. /p/ABC123/
        shortcode = ""
        if link_tag:
            m = re.search(r"/p/([^/]+)/", link_tag["href"])
            if m:
                shortcode = m.group(1)

        caption = img_tag.get("alt", "photo from @sleepychunk")[:120]
        posts.append({"img_url": img_url, "shortcode": shortcode, "caption": caption})

        if len(posts) >= MAX_POSTS:
            break

    return posts


def sync():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    os.makedirs("_data", exist_ok=True)

    existing = load_existing()
    existing_codes = {p["shortcode"] for p in existing if p.get("shortcode")}

    try:
        scraped = scrape_posts()
    except Exception as e:
        print(f"Scrape failed: {e}")
        sys.exit(1)

    if not scraped:
        print("No posts found — page structure may have changed.")
        sys.exit(1)

    new_photos = []
    for post in scraped:
        shortcode = post["shortcode"]
        filename = f"{shortcode}.jpg" if shortcode else f"{len(new_photos)}.jpg"
        filepath = os.path.join(OUTPUT_DIR, filename)

        if shortcode and shortcode in existing_codes:
            continue

        if not os.path.exists(filepath):
            try:
                r = requests.get(post["img_url"], headers=HEADERS, timeout=30)
                r.raise_for_status()
                with open(filepath, "wb") as f:
                    f.write(r.content)
                print(f"Downloaded: {filename}")
            except Exception as e:
                print(f"Failed to download {filename}: {e}")
                continue

        new_photos.append({
            "url": f"/{filepath}",
            "alt": post["caption"],
            "shortcode": shortcode,
        })

    all_photos = new_photos + [p for p in existing if p.get("shortcode") not in {x["shortcode"] for x in new_photos}]
    all_photos = all_photos[:MAX_POSTS]

    with open(DATA_FILE, "w", encoding="utf-8") as f:
        yaml.dump({"photos": all_photos}, f, default_flow_style=False, allow_unicode=True)

    print(f"Synced {len(new_photos)} new photo(s). Total: {len(all_photos)}.")


def git_commit_if_changed():
    result = subprocess.run(
        ["git", "status", "--porcelain", OUTPUT_DIR, DATA_FILE],
        capture_output=True, text=True,
    )
    if not result.stdout.strip():
        print("No changes to commit.")
        return
    subprocess.run(["git", "config", "user.email", "cedarma02@gmail.com"], check=True)
    subprocess.run(["git", "config", "user.name", "Ningshan Ma"], check=True)
    subprocess.run(["git", "add", OUTPUT_DIR, DATA_FILE], check=True)
    subprocess.run(["git", "commit", "-m", "Sync Instagram photos from @sleepychunk"], check=True)
    subprocess.run(["git", "push"], check=True)
    print("Pushed changes.")


if __name__ == "__main__":
    sync()
    git_commit_if_changed()
