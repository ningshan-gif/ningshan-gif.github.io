#!/usr/bin/env python3
"""Resolve every song in _data/post_music.yml to an iTunes preview, download the
~30s excerpt into audio/previews/<shortcode>.m4a, and write clean display
metadata (title/artist/file) to _data/post_music_meta.yml.
Safe to re-run: skips already-downloaded previews. Run after the song map grows.
"""
import json, os, re, subprocess, sys, time, urllib.parse

try:
    import yaml
except ImportError:
    subprocess.check_call([sys.executable, "-m", "pip", "install", "pyyaml"])
    import yaml

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MAP_PATH = os.path.join(REPO, "_data", "post_music.yml")
META_PATH = os.path.join(REPO, "_data", "post_music_meta.yml")
PREV_DIR = os.path.join(REPO, "audio", "previews")
UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"


def search(term, country):
    url = (f"https://itunes.apple.com/search?media=music&limit=1&country={country}"
           f"&term={urllib.parse.quote(term)}")
    r = subprocess.run(["curl", "-s", url, "--max-time", "20"], capture_output=True, text=True)
    try:
        res = json.loads(r.stdout).get("results", [])
    except Exception:
        return None
    if res and res[0].get("previewUrl"):
        return {"url": res[0]["previewUrl"],
                "title": res[0].get("trackName", ""),
                "artist": res[0].get("artistName", "")}
    return None


def main():
    songs = yaml.safe_load(open(MAP_PATH)) or {}
    try:
        meta = yaml.safe_load(open(META_PATH)) or {}
    except FileNotFoundError:
        meta = {}
    os.makedirs(PREV_DIR, exist_ok=True)
    added = 0
    for code, q in songs.items():
        dest = os.path.join(PREV_DIR, f"{code}.m4a")
        if code in meta and os.path.exists(dest) and os.path.getsize(dest) > 10000:
            continue
        cjk = re.search(r"[぀-ヿ㐀-鿿]", q)
        stores = ["tw", "jp", "us"] if cjk else ["us", "tw", "jp"]
        hit = None
        for c in stores:
            hit = search(q, c)
            if hit:
                break
            time.sleep(2.2)
        if not hit:
            print(f"MISS {code}: {q}")
            continue
        subprocess.run(["curl", "-s", "-H", f"User-Agent: {UA}", hit["url"],
                        "-o", dest, "--max-time", "60"])
        if os.path.exists(dest) and os.path.getsize(dest) > 10000:
            meta[code] = {"title": hit["title"], "artist": hit["artist"],
                          "file": f"/audio/previews/{code}.m4a"}
            added += 1
            print(f"OK   {code}: {hit['title']} — {hit['artist']}")
        else:
            print(f"DLFAIL {code}")
        time.sleep(3.0)
    yaml.safe_dump(meta, open(META_PATH, "w"), allow_unicode=True, sort_keys=True)
    print(f"\npreviews: +{added}, meta total {len(meta)}")


if __name__ == "__main__":
    main()
