import json
from urllib.parse import unquote

INPUT_FILE = 'app/src/assets/catalog.json'
OUTPUT_FILE = 'app/src/assets/catalog_decoded.json' 

def decode_urls():
    with open(INPUT_FILE, 'r', encoding='utf-8') as f:
        data = json.load(f)

    for module_code, papers in data.items():
        for paper in papers:
            if 'url' in paper:
                # unquote converts %20 to spaces, %26 to &, etc.
                paper['url'] = unquote(paper['url'])

    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=4, ensure_ascii=False)

    print(f"Success! URLs have been decoded and saved to {OUTPUT_FILE}")

if __name__ == "__main__":
    decode_urls()