#!/usr/bin/env python3
"""Audit every post's caption, music, and video coverage as the room will
display it. Re-run any time; exits nonzero if known-fixable gaps remain.
"""
import json, os, re, sys

try:
    import yaml
except ImportError:
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "pyyaml"])
    import yaml

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE_JSON = os.path.join(REPO, "_site", "room-posts.json")

FILLER = [re.compile(r"^instagram post$", re.I),
          re.compile(r"^@\S+\s*[·•\-–]\s*[\d\-/.]+$"),
          re.compile(r"^photo from @", re.I)]


def load_yaml(name):
    try:
        v = yaml.safe_load(open(os.path.join(REPO, "_data", name)))
        return v or {}
    except FileNotFoundError:
        return {}


def main():
    data = json.load(open(SITE_JSON))
    posts = data["posts"]
    captions = load_yaml("post_captions.yml")
    songs = load_yaml("post_music.yml")
    meta = load_yaml("post_music_meta.yml")
    ig_dir = os.path.join(REPO, "images", "instagram")

    def sc_of(p):
        m = re.search(r"/([^/]+)\.[a-z0-9]+$", p.get("image") or "", re.I)
        return m.group(1) if m else None

    def caption_status(p, sc):
        title = (p.get("title") or "").strip()
        is_filler = any(rx.match(title) for rx in FILLER) or not title
        if "instagram" not in (p.get("tags") or []):
            return "writing(book)"
        if sc and sc in captions:
            return "full(ig)"
        body = (p.get("body") or "")
        body = re.sub(r"@[\w.]+\s*·[^\n]*$", "", body, flags=re.M)
        body = re.sub(r"[ \t]+\n", "\n", body)
        body = re.sub(r"\n{3,}", "\n\n", body).strip()
        if body and len(body) > len(title):
            # suspicious if body itself looks clipped at the old 120-char cap
            return "body(SUSPECT)" if 110 <= len(body) <= 125 and not body[-1] in "。.!?！？」)』*" else "body"
        if is_filler:
            return "date-only"
        return "title(SUSPECT-63)" if len(title) == 63 else "title"

    def music_status(sc, swept):
        if not sc:
            return "-"
        if os.path.exists(os.path.join(REPO, "audio", f"{sc}.mp3")):
            return "full-mp3"
        if sc in meta:
            return "local-excerpt"
        if sc in songs:
            return "query-only(NEEDS-EXCERPT)"
        return "none(swept: no song)" if swept else "UNSWEPT"

    def video_status(sc):
        if not sc:
            return "-"
        vids = [f for f in os.listdir(ig_dir) if f.startswith(sc) and f.endswith(".mp4")]
        return f"{len(vids)} file(s)" if vids else "no-local-video"

    from collections import Counter
    cap_c, mus_c = Counter(), Counter()
    problems = []
    for p in posts:
        sc = sc_of(p)
        swept = sc in captions if sc else False
        cs = caption_status(p, sc)
        ms = music_status(sc, swept)
        cap_c[cs] += 1
        mus_c[ms] += 1
        if "SUSPECT" in cs or "NEEDS" in ms:
            problems.append((sc, cs, ms, (p.get("title") or "")[:40]))

    print("== caption coverage =="); [print(f"  {k}: {v}") for k, v in cap_c.most_common()]
    print("== music coverage ==");   [print(f"  {k}: {v}") for k, v in mus_c.most_common()]
    vids_present = sum(1 for f in os.listdir(ig_dir) if f.endswith(".mp4"))
    print(f"== post video files on disk: {vids_present}")
    if problems:
        print(f"\n== actionable now ({len(problems)}) ==")
        for sc, cs, ms, t in problems[:30]:
            print(f"  {sc}: caption={cs} music={ms} | {t}")
    unswept = mus_c.get("UNSWEPT", 0)
    print(f"\nverdict: {unswept} posts await the Instagram sweep; "
          f"{len(problems)} fixable right now")
    sys.exit(1 if problems else 0)


if __name__ == "__main__":
    main()
