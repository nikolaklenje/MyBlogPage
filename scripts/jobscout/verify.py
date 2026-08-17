"""Check every token in companies.json resolves.

    python3 verify.py           # report only
    python3 verify.py --prune   # report, then drop the failures
"""
import json, sys, urllib.request, urllib.error
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

HERE = Path(__file__).parent
PRUNE = "--prune" in sys.argv

URLS = {
    "greenhouse": "https://boards-api.greenhouse.io/v1/boards/{t}/jobs",
    "lever":      "https://api.lever.co/v0/postings/{t}?mode=json",
    "ashby":      "https://api.ashbyhq.com/posting-api/job-board/{t}",
}


def count(ats, token):
    url = URLS[ats].format(t=token)
    req = urllib.request.Request(url, headers={"User-Agent": "jobscout/0.1"})
    try:
        with urllib.request.urlopen(req, timeout=20) as r:
            data = json.loads(r.read().decode())
        n = len(data) if isinstance(data, list) else len(data.get("jobs", []))
        return ats, token, n
    except Exception:
        return ats, token, None


with open(HERE / "companies.json") as f:
    config = json.load(f)

pairs = [(ats, t) for ats, tokens in config.items() for t in tokens]

with ThreadPoolExecutor(max_workers=8) as ex:
    results = list(ex.map(lambda p: count(*p), pairs))

good = [r for r in results if r[2] is not None]
bad = [r for r in results if r[2] is None]

print(f"\nOK ({len(good)}):")
for ats, t, n in sorted(good, key=lambda x: -x[2]):
    print(f"   {ats:<11} {t:<26} {n:>4} jobs")

if bad:
    print(f"\nFAILED ({len(bad)}) — wrong token, or on a different provider:")
    for ats, t, _ in bad:
        print(f"   {ats:<11} {t}")

if PRUNE and bad:
    pruned = {}
    for ats, t, _ in good:
        pruned.setdefault(ats, []).append(t)
    for ats in pruned:
        pruned[ats].sort()
    with open(HERE / "companies.json", "w") as f:
        json.dump(pruned, f, indent=2)
        f.write("\n")
    print(f"\nPruned companies.json down to {len(good)} companies.")
elif bad:
    print("\nRe-run with --prune to remove the failures.")