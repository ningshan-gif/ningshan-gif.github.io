import concurrent.futures
import hashlib
import json
from pathlib import Path
import time
import urllib.parse
import urllib.request

items = json.loads(Path('.publish-instagram/downloads.json').read_text())

def download(item):
    path = Path(item['path'])
    url = urllib.parse.urlsplit(item['url'])
    assert path.parts[0] == 'images' and '..' not in path.parts
    assert url.scheme == 'https' and url.hostname.endswith(('.cdninstagram.com', '.fbcdn.net'))
    path.parent.mkdir(parents=True, exist_ok=True)
    part = path.with_suffix(path.suffix + '.part')
    for attempt in range(3):
        try:
            digest = hashlib.sha1(f"blob {item['size']}\0".encode())
            request = urllib.request.Request(item['url'], headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(request, timeout=90) as response, part.open('wb') as output:
                while chunk := response.read(1024 * 1024):
                    output.write(chunk)
                    digest.update(chunk)
            assert part.stat().st_size == item['size'], 'Size mismatch'
            assert digest.hexdigest() == item['sha'], 'Hash mismatch'
            part.replace(path)
            print('Verified', path, flush=True)
            return
        except Exception as error:
            part.unlink(missing_ok=True)
            if attempt == 2:
                raise RuntimeError(f'{path}: {type(error).__name__}') from None
            time.sleep(2 * (attempt + 1))

with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
    list(pool.map(download, items))
print(f'Verified all {len(items)} downloads against the prepared local files.', flush=True)
