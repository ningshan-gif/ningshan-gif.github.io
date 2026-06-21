#!/usr/bin/env python3
"""
Fetches the latest posts from @sleepychunk via Instagram's internal API.
Downloads all media (photos + videos) and generates Jekyll post markdown files.
Run locally since Instagram blocks datacenter IPs.
"""

import os
import subprocess
import sys
import yaml
from datetime import datetime, timezone

try:
    import requests
except ImportError:
    subprocess.check_call([sys.executable, "-m", "pip", "install", "requests"])
    import requests

INSTAGRAM_USERNAME = "sleepychunk"
IMG_DIR   = "images/instagram"
DATA_FILE = "_data/instagram.yml"
POSTS_DIR = "_posts"
MAX_POSTS = 12
REPO_DIR  = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

HEADERS = {
    "x-ig-app-id": "936619743392459",
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    ),
}


# ── helpers ──────────────────────────────────────────────────────────────────

def download(url, path):
    """Download url → path if path doesn't exist yet. Returns True on success."""
    if os.path.exists(path):
        return True
    try:
        r = requests.get(url, headers=HEADERS, timeout=60)
        r.raise_for_status()
        with open(path, "wb") as f:
            f.write(r.content)
        print(f"  ↓ {os.path.basename(path)}")
        return True
    except Exception as e:
        print(f"  ✗ {os.path.basename(path)}: {e}")
        return False


def caption_text(node):
    edges = node.get("edge_media_to_caption", {}).get("edges", [])
    return edges[0]["node"]["text"] if edges else ""


def media_items(node):
    """Return list of {is_video, img_url, vid_url} for a post node."""
    sidecar = node.get("edge_sidecar_to_children", {}).get("edges", [])
    if sidecar:
        return [
            {
                "is_video": c["node"].get("is_video", False),
                "img_url":  c["node"].get("display_url", ""),
                "vid_url":  c["node"].get("video_url", ""),
            }
            for c in sidecar
        ]
    return [
        {
            "is_video": node.get("is_video", False),
            "img_url":  node.get("display_url", ""),
            "vid_url":  node.get("video_url", ""),
        }
    ]


# ── main sync ─────────────────────────────────────────────────────────────────

def sync():
    img_dir   = os.path.join(REPO_DIR, IMG_DIR)
    data_path = os.path.join(REPO_DIR, DATA_FILE)
    posts_dir = os.path.join(REPO_DIR, POSTS_DIR)

    os.makedirs(img_dir, exist_ok=True)
    os.makedirs(os.path.join(REPO_DIR, "_data"), exist_ok=True)
    os.makedirs(posts_dir, exist_ok=True)

    # Load existing shortcodes so we skip already-downloaded posts
    existing = []
    if os.path.exists(data_path):
        with open(data_path, encoding="utf-8") as f:
            existing = (yaml.safe_load(f) or {}).get("photos", [])
    existing_codes = {p["shortcode"] for p in existing if p.get("shortcode")}

    # Fetch feed
    api_url = (
        f"https://www.instagram.com/api/v1/users/web_profile_info/"
        f"?username={INSTAGRAM_USERNAME}"
    )
    try:
        r = requests.get(api_url, headers=HEADERS, timeout=30)
        r.raise_for_status()
        edges = r.json()["data"]["user"]["edge_owner_to_timeline_media"]["edges"][:MAX_POSTS]
    except Exception as e:
        print(f"Failed to fetch feed: {e}")
        sys.exit(1)

    new_photos = []

    for edge in edges:
        node      = edge["node"]
        shortcode = node.get("shortcode", "")
        if not shortcode or shortcode in existing_codes:
            continue

        print(f"\nPost: {shortcode}")

        # Date
        ts = node.get("taken_at_timestamp", 0)
        dt = datetime.fromtimestamp(ts, tz=timezone.utc) if ts else datetime.now(tz=timezone.utc)
        date_str    = dt.strftime("%Y-%m-%d")
        date_pretty = dt.strftime("%B %-d, %Y")

        cap = caption_text(node)
        short_cap = cap[:120].replace("\n", " ")

        # Download all media items
        items   = media_items(node)
        gallery = []   # list of dicts: {html_tag, src}

        for idx, item in enumerate(items):
            suffix = "" if idx == 0 else f"_{idx + 1}"
            thumb_fn = f"{shortcode}{suffix}.jpg"
            thumb_path = os.path.join(img_dir, thumb_fn)

            if item["img_url"]:
                download(item["img_url"], thumb_path)

            if item["is_video"] and item["vid_url"]:
                vid_fn   = f"{shortcode}{suffix}.mp4"
                vid_path = os.path.join(img_dir, vid_fn)
                download(item["vid_url"], vid_path)
                gallery.append({
                    "tag":    "video",
                    "src":    f"/{IMG_DIR}/{vid_fn}",
                    "poster": f"/{IMG_DIR}/{thumb_fn}",
                })
            else:
                gallery.append({
                    "tag": "img",
                    "src": f"/{IMG_DIR}/{thumb_fn}",
                })

        cover = f"/{IMG_DIR}/{shortcode}.jpg"

        # Build gallery HTML
        lines = []
        for m in gallery:
            if m["tag"] == "video":
                lines.append(
                    f'    <video src="{m["src"]}" poster="{m["poster"]}"'
                    f' loop playsinline preload="none" loading="lazy"></video>'
                )
            else:
                lines.append(f'    <img src="{m["src"]}" loading="lazy">')

        gallery_html = "\n".join(lines)

        # Post title: first non-empty line of caption (≤60 chars), fallback to date
        title_raw = ""
        for line in cap.splitlines():
            line = line.strip()
            if line:
                title_raw = line[:60]
                break
        safe_title = (title_raw or f"@sleepychunk · {date_str}").replace('"', '\\"')

        # Create Jekyll markdown post (skip if already exists)
        post_fn   = f"{date_str}-instagram-{shortcode.lower()}.markdown"
        post_path = os.path.join(posts_dir, post_fn)

        if not os.path.exists(post_path):
            post_body = f"""---
layout: post
title: "{safe_title}"
date: {date_str} 00:00:00 +0000
image: '{cover}'
tags: [photography, instagram]
---



<div class="gallery-box">
  <div class="gallery">
{gallery_html}
  </div>
</div>

*[@sleepychunk](https://www.instagram.com/p/{shortcode}/) · {date_pretty}*
"""
            with open(post_path, "w", encoding="utf-8") as f:
                f.write(post_body)
            print(f"  ✎ {post_fn}")

        new_photos.append({
            "url":       cover,
            "alt":       short_cap or "photo from @sleepychunk",
            "shortcode": shortcode,
        })

    # Update _data/instagram.yml
    all_photos = new_photos + [
        p for p in existing
        if p.get("shortcode") not in {x["shortcode"] for x in new_photos}
    ]
    all_photos = all_photos[:MAX_POSTS]

    with open(data_path, "w", encoding="utf-8") as f:
        yaml.dump({"photos": all_photos}, f, default_flow_style=False, allow_unicode=True)

    print(f"\nSynced {len(new_photos)} new post(s). Total in feed: {len(all_photos)}.")
    return len(new_photos)


def git_commit_if_changed():
    changed = subprocess.run(
        ["git", "-C", REPO_DIR, "status", "--porcelain"],
        capture_output=True, text=True,
    ).stdout.strip()
    if not changed:
        print("No changes to commit.")
        return
    subprocess.run(["git", "-C", REPO_DIR, "config", "user.email", "cedarma02@gmail.com"], check=True)
    subprocess.run(["git", "-C", REPO_DIR, "config", "user.name",  "Ningshan Ma"],          check=True)
    subprocess.run(["git", "-C", REPO_DIR, "add", IMG_DIR, DATA_FILE, POSTS_DIR], check=True)
    subprocess.run(["git", "-C", REPO_DIR, "commit", "-m", "Sync Instagram photos, videos & posts"], check=True)
    subprocess.run(["git", "-C", REPO_DIR, "push"], check=True)
    print("Pushed changes.")


if __name__ == "__main__":
    sync()
    git_commit_if_changed()
