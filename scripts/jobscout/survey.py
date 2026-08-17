import json, urllib.request
from collections import Counter

TOKEN = "databricks"                                   # change me
url = f"https://boards-api.greenhouse.io/v1/boards/{TOKEN}/jobs"

req = urllib.request.Request(url, headers={"User-Agent": "jobscout/0.1"})
with urllib.request.urlopen(req, timeout=20) as resp:
    data = json.loads(resp.read().decode())

jobs = data["jobs"]
print(f"{len(jobs)} jobs total\n")

print("-- locations --")
for loc, n in Counter(j["location"]["name"] for j in jobs).most_common(20):
    print(f"{n:>3}  {loc}")

print("\n-- titles containing 'engineer' --")
for j in jobs:
    if "engineer" in j["title"].lower():
        print(f"  {j['title']}  |  {j['location']['name']}")