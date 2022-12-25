#!/usr/bin/env python
import pandas as pd
import json
import sys

URL = "http://ref.x86asm.net/coder64.html"
state = {
    "head": [],
    "body": []
}


df = pd.read_html(URL)

df[0].columns = df[0].columns.str.replace(r'\s', ' ', regex=True)
df[1].columns = df[1].columns.str.replace(r'\s', ' ', regex=True)

jj = df[0].to_json(orient='records')
ff = df[1].to_json(orient='records')

state["body"] = json.loads(jj)+json.loads(ff)
state["head"] = list(df[0].keys())

jstate = json.dumps(state, indent=4).replace("null", '""')


try:
    filename = sys.argv[1]
except IndexError:
    filename = "nice.json"

print(f"[*] Dumping to {filename}")
with open(filename, 'w') as f:
    f.write(jstate)
print("[+] Done.")
