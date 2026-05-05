#!/usr/bin/env python3
"""
Downloads the latest photos from a public Instagram account (@sleepychunk)
and saves them to images/instagram/. Also writes _data/instagram.yml so
the footer gallery can display them automatically.
"""

import os
import subprocess
import sys
import yaml

try:
    import instaloader
    import requests
except ImportError:
    subprocess.check_call([sys.executable, "-m", "pip", "install", "instaloader", "requests"])
    import instaloader
    import requests

INSTAGRAM_USERNAME = "sleepychunk"
OUTPUT_DIR = "images/instagram"
DATA_FILE = "_data/instagram.yml"
MAX_POSTS = 12  # how many photos to keep in the gallery


def load_existing(data_file):
    if not os.path.exists(data_file):
        return []
    with open(data_file, encoding="utf-8") as f:
        data = yaml.safe_load(f) or {}
    return data.get("photos", [])


def sync():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    os.makedirs("_data", exist_ok=True)

    existing = load_existing(DATA_FILE)
    existing_codes = {p["shortcode"] for p in existing if "shortcode" in p}

    L = instaloader.Instaloader(
        download_pictures=False,
        download_videos=False,
        download_video_thumbnails=False,
        download_geotags=False,
        download_comments=False,
        save_metadata=False,
        quiet=True,
    )

    try:
        profile = instaloader.Profile.from_username(L.context, INSTAGRAM_USERNAME)
    except Exception as e:
        print(f"Could not load profile @{INSTAGRAM_USERNAME}: {e}")
        sys.exit(1)

    new_photos = []
    count = 0

    for post in profile.get_posts():
        if count >= MAX_POSTS:
            break
        if post.typename not in ("GraphImage", "GraphSidecar"):
            continue

        shortcode = post.shortcode
        filename = f"{post.date_utc.strftime('%Y%m%d')}_{shortcode}.jpg"
        filepath = os.path.join(OUTPUT_DIR, filename)

        if shortcode not in existing_codes and not os.path.exists(filepath):
            # Download the image directly
            img_url = post.url
            try:
                r = requests.get(img_url, timeout=30,
                                 headers={"User-Agent": "Mozilla/5.0"})
                r.raise_for_status()
                with open(filepath, "wb") as f:
                    f.write(r.content)
                print(f"Downloaded: {filename}")
            except Exception as e:
                print(f"Failed to download {filename}: {e}")
                count += 1
                continue

        caption = (post.caption or "")[:120].replace("\n", " ")
        new_photos.append({
            "url": f"/{filepath}",
            "alt": caption or "photo from @sleepychunk",
            "shortcode": shortcode,
            "date": post.date_utc.isoformat(),
        })
        count += 1

    # Merge: new photos first, then existing, keep MAX_POSTS total
    all_photos = new_photos + [p for p in existing if p.get("shortcode") not in {x["shortcode"] for x in new_photos}]
    all_photos = all_photos[:MAX_POSTS]

    with open(DATA_FILE, "w", encoding="utf-8") as f:
        yaml.dump({"photos": all_photos}, f, default_flow_style=False, allow_unicode=True)

    print(f"Synced {len(new_photos)} new photo(s). Total in gallery: {len(all_photos)}.")
    return len(new_photos)


def git_commit_if_changed():
    result = subprocess.run(
        ["git", "status", "--porcelain", OUTPUT_DIR, DATA_FILE],
        capture_output=True, text=True
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
