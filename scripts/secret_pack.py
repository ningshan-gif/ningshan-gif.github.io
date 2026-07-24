#!/usr/bin/env python3
"""Encrypt the secret room's photos and letters with a key derived from the
room password (PBKDF2-SHA256, salt 'ningshan-room-enc-v1', 210k iterations,
AES-256-GCM). The repo only ever holds ciphertext (.bin: 12-byte IV + data).

Usage: SECRET_ROOM_PASSWORD=... python3 scripts/secret_pack.py <jpg_dir> <letters.json>
The password is read from the environment and never stored anywhere.
"""
import hashlib, json, os, secrets, subprocess, sys

try:
    from cryptography.hazmat.primitives.ciphers.aead import AESGCM
except ImportError:
    subprocess.check_call([sys.executable, "-m", "pip", "install", "cryptography"])
    from cryptography.hazmat.primitives.ciphers.aead import AESGCM

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(REPO, "images", "secret-enc")


def main():
    pw = os.environ.get("SECRET_ROOM_PASSWORD")
    if not pw:
        sys.exit("set SECRET_ROOM_PASSWORD")
    jpg_dir, letters_path = sys.argv[1], sys.argv[2]
    key = hashlib.pbkdf2_hmac("sha256", pw.encode(), b"ningshan-room-enc-v1", 210000)
    aes = AESGCM(key)
    os.makedirs(OUT, exist_ok=True)

    def pack(data, name):
        iv = secrets.token_bytes(12)
        blob = iv + aes.encrypt(iv, data, None)
        with open(os.path.join(OUT, name), "wb") as f:
            f.write(blob)

    n = 0
    for fn in sorted(os.listdir(jpg_dir)):
        if not fn.lower().endswith(".jpg"):
            continue
        with open(os.path.join(jpg_dir, fn), "rb") as f:
            pack(f.read(), os.path.splitext(fn)[0] + ".pic.bin")
        n += 1
    with open(letters_path, "rb") as f:
        pack(f.read(), "letters.bin")
    print(f"packed {n} photos + letters into {OUT}")


if __name__ == "__main__":
    main()
