#!/usr/bin/env python3
"""Append a letter to the secret room's mailbox without touching the photos.

Decrypts images/secret-enc/letters.bin with the room password, appends the
new letter (numbered after the last), and re-encrypts. The repo only ever
holds ciphertext; the password comes from the environment and is never stored.

Usage: SECRET_ROOM_PASSWORD=... python3 scripts/add_letter.py "信的内容"
       SECRET_ROOM_PASSWORD=... python3 scripts/add_letter.py --list
"""
import hashlib, json, os, secrets, subprocess, sys

try:
    from cryptography.hazmat.primitives.ciphers.aead import AESGCM
except ImportError:
    subprocess.check_call([sys.executable, "-m", "pip", "install", "cryptography"])
    from cryptography.hazmat.primitives.ciphers.aead import AESGCM

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BIN = os.path.join(REPO, "images", "secret-enc", "letters.bin")


def main():
    pw = os.environ.get("SECRET_ROOM_PASSWORD")
    if not pw:
        sys.exit("set SECRET_ROOM_PASSWORD")
    if len(sys.argv) < 2:
        sys.exit(__doc__.strip())
    key = hashlib.pbkdf2_hmac("sha256", pw.encode(), b"ningshan-room-enc-v1", 210000)
    aes = AESGCM(key)
    with open(BIN, "rb") as f:
        blob = f.read()
    try:
        payload = json.loads(aes.decrypt(blob[:12], blob[12:], None))
    except Exception:
        sys.exit("wrong password, or letters.bin is corrupt — nothing changed")
    # payload: {"greeting", "signature", "letters": [...]} (older bins were a bare list)
    if isinstance(payload, list):
        payload = {"letters": payload}
    letters = payload.setdefault("letters", [])

    if sys.argv[1] == "--list":
        for L in letters:
            print(f"第{L.get('n', '?')}封  {L.get('text', '')}")
        return

    letters.append({"n": max((L.get("n", 0) for L in letters), default=0) + 1,
                    "text": sys.argv[1]})
    data = json.dumps(payload, ensure_ascii=False).encode()
    iv = secrets.token_bytes(12)
    with open(BIN, "wb") as f:
        f.write(iv + aes.encrypt(iv, data, None))
    print(f"mailbox now holds {len(letters)} letters")


if __name__ == "__main__":
    main()
