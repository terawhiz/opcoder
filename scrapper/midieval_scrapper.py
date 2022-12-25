#!/usr/bin/env python
from bs4 import BeautifulSoup
import requests
import json
import sys

URL = "http://ref.x86asm.net/coder64.html"
state = {
    "head": [],
    "head_title": [],
    "body": []
}


def tableToJSON(table):
    thead = table.find_all("th")
    head = ""
    head_title = ""
    for i in range(0, len(thead)):
        # print(i, thead[i].text.strip())
        head = thead[i].text.strip().encode().replace(
            b'\xc2\xa0', b' ').decode()
        head_title = thead[i]["title"]
        if (head not in state['head']) and (head_title not in state['head_title']):
            state["head"] += [head]
            state["head_title"] += [head_title]

    rows = table.find_all('tbody')
    for i in range(0, len(rows)):
        temp = {}
        cells = rows[i].tr.find_all('td')
        j = 0
        # print(len(cells))
        # break
        while (j < len(cells)):
            # print(state["head"][j] + "-->" +  cells[j].text.strip())
            cell_data = cells[j].text.strip()

            # print(cell_data)
            # if cell_data == "":
            #     print('empty')
            temp[state['head'][j]] = cell_data
            j += 1
        state['body'] += [temp]


def makeSoup(url):
    r = requests.get(url, stream=True)
    r.raw.decode_content = True
    if (r.status_code == 200):
        soup = BeautifulSoup(r.raw, 'html.parser')
        return soup


def main():
    print("[*] Cooking")
    soup = makeSoup(URL)
    tables = soup.find_all("table")
    tableToJSON(tables[0])      # 1-byte instructions
    tableToJSON(tables[1])      # 2-byte instructions
    print(state[0])
    jstate = json.dumps(state, indent=4)
    print("[*] Extracted goodies")
    try:
        filename = sys.argv[1]
    except IndexError:
        filename = "nice.json"
    print(f"[*] Dumping to {filename}")
    with open(filename, 'w') as f:
        f.write(jstate)
    print("[+] Done.")
    return 0


if __name__ == "__main__":
    main()
