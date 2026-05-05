#!/usr/bin/env python3
"""
Fetches the latest photos from @sleepychunk via Instagram's internal API,
saves them to images/instagram/, and writes _data/instagram.yml so the
footer gallery displays them. Run locally (not from GitHub Actions) since
Instagram blocks datacenter IPs.
"""

import json
import os
import subprocess
import sys
import yaml

try:
    import requests
except ImportError:
    subprocess.check_call([sys.executable, "-m", "pip", "install", "requests"])
    import requests

INSTAGRAM_USERNAME = "sleepychunk"
OUTPUT_DIR = "images/instagram"
DATA_FILE = "_data/instagram.yml"
MAX_POSTS = 12
REPO_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

HEADERS = {
    "x-ig-app-id": "936619743392459",
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    ),
}


def load_existing():
    path = os.path.join(REPO_DIR, DATA_FILE)
    if not os.path.exists(path):
        return []
    with open(path, encoding="utf-8") as f:
        return (yaml.safe_load(f) or {}).get("photos", [])


def fetch_posts():
    url = f"https://www.instagram.com/api/v1/users/web_profile_info/?username={INSTAGRAM_USERNAME}"
    r = requests.get(url, headers=HEADERS, timeout=30)
    r.raise_for_status()
    edges = r.json()["data"]["user"]["edge_owner_to_timeline_media"]["edges"]
    return edges[:MAX_POSTS]


def sync():
    out_dir = os.path.join(REPO_DIR, OUTPUT_DIR)
    data_path = os.path.join(REPO_DIR, DATA_FILE)
    os.makedirs(out_dir, exist_ok=True)
    os.makedirs(os.path.join(REPO_DIR, "_data"), exist_ok=True)

    existing = load_existing()
    existing_codes = {p["shortcode"] for p in existing if p.get("shortcode")}

    try:
        edges = fetch_posts()
    except Exception as e:
        print(f"Failed to fetch posts: {e}")
        sys.exit(1)

    new_photos = []
    for edge in edges:
        node = edge["node"]
        shortcode = node.get("shortcode", "")
        if shortcode in existing_codes:
            continue

        img_url = node.get("display_url", "")
        filename = f"{shortcode}.jpg"
        filepath = os.path.join(out_dir, filename)

        if not os.path.exists(filepath) and img_url:
            try:
                r = requests.get(img_url, headers=HEADERS, timeout=30)
                r.raise_for_status()
                with open(filepath, "wb") as f:
                    f.write(r.content)
                print(f"Downloaded: {filename}")
            except Exception as e:
                print(f"Failed to download {filename}: {e}")
                continue

        caption = ""
        edges_cap = node.get("edge_media_to_caption", {}).get("edges", [])
        if edges_cap:
            caption = edges_cap[0]["node"]["text"][:120].replace("\n", " ")

        new_photos.append({
            "url": f"/{OUTPUT_DIR}/{filename}",
            "alt": caption or "photo from @sleepychunk",
            "shortcode": shortcode,
        })

    all_photos = new_photos + [p for p in existing if p.get("shortcode") not in {x["shortcode"] for x in new_photos}]
    all_photos = all_photos[:MAX_POSTS]

    with open(data_path, "w", encoding="utf-8") as f:
        yaml.dump({"photos": all_photos}, f, default_flow_style=False, allow_unicode=True)

    print(f"Synced {len(new_photos)} new photo(s). Total: {len(all_photos)}.")
    return len(new_photos)


def git_commit_if_changed():
    result = subprocess.run(
        ["git", "-C", REPO_DIR, "status", "--porcelain", OUTPUT_DIR, DATA_FILE],
        capture_output=True, text=True,
    )
    if not result.stdout.strip():
        print("No changes to commit.")
        return
    subprocess.run(["git", "-C", REPO_DIR, "config", "user.email", "cedarma02@gmail.com"], check=True)
    subprocess.run(["git", "-C", REPO_DIR, "config", "user.name", "Ningshan Ma"], check=True)
    subprocess.run(["git", "-C", REPO_DIR, "add", OUTPUT_DIR, DATA_FILE], check=True)
    subprocess.run(["git", "-C", REPO_DIR, "commit", "-m", "Sync Instagram photos from @sleepychunk"], check=True)
    subprocess.run(["git", "-C", REPO_DIR, "push"], check=True)
    print("Pushed changes.")


if __name__ == "__main__":
    sync()
    git_commit_if_changed()
