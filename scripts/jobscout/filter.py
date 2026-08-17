"""
    python3 filter.py                    # text digest, new postings only
    python3 filter.py --all              # text digest, everything matching
    python3 filter.py --reset            # forget history, re-baseline
    python3 filter.py --json --out PATH  # write full list as JSON for the web UI
"""
import json, re, sys, urllib.request, urllib.error
from datetime import datetime, timezone
from pathlib import Path

HERE = Path(__file__).parent
STATE = HERE / "seen.json"

MAX_AGE_DAYS = 60
SHOW_ALL = "--all" in sys.argv
RESET = "--reset" in sys.argv
AS_JSON = "--json" in sys.argv

# --out PATH ; defaults to ./jobs.json
OUT = HERE / "jobs.json"
if "--out" in sys.argv:
    i = sys.argv.index("--out")
    if i + 1 >= len(sys.argv):
        sys.exit("error: --out needs a path")
    OUT = Path(sys.argv[i + 1]).expanduser()

# --- location ---------------------------------------------------------------
REMOTE_WORD = re.compile(r"\bremote\b|\bdistributed\b|\banywhere\b|\bwork from home\b", re.I)

US_OK = re.compile(r"\bunited states\b|\bu\.?s\.?a?\b|\busca\b|\bamericas\b"
                   r"|\bnorth america\b|\bflorida\b|\banywhere\b", re.I)

FOREIGN = re.compile(
    r"\b(india|canada|israel|united kingdom|uk|germany|australia|japan|singapore"
    r"|netherlands|france|serbia|korea|denmark|sweden|switzerland|mexico|brazil"
    r"|costa rica|italy|spain|china|hong kong|indonesia|thailand|finland|poland"
    r"|ireland|argentina|colombia|belgium|chile|peru|uruguay|portugal|romania"
    r"|czech|bulgaria|ukraine|nigeria|kenya|egypt|philippines|vietnam|malaysia"
    r"|taiwan|new zealand|emea|apac|latam"
    r"|bangalore|bengaluru|mumbai|london|berlin|munich|paris|amsterdam"
    r"|tokyo|sydney|melbourne|toronto|vancouver|calgary|seoul|belgrade|madrid"
    r"|milan|stockholm|aarhus|zurich|shenzhen)\b", re.I)

# region-locked remote — you must already live there, so useless from Miami
US_STATE = re.compile(
    r"\b(california|washington|oregon|colorado|texas|new york|massachusetts"
    r"|virginia|maryland|illinois|georgia|pennsylvania|north carolina|minnesota"
    r"|ohio|michigan|tennessee|arizona|utah|nevada|new jersey"
    r"|bay area|sf bay|pacific northwest)\b", re.I)


def classify_location(loc):
    """'yes' | 'maybe' | 'no'. 'maybe' = remote but no country stated."""
    best = "no"
    for seg in re.split(r";", loc):
        if not REMOTE_WORD.search(seg):
            continue
        if US_OK.search(seg):
            return "yes"
        if FOREIGN.search(seg):
            continue
        if US_STATE.search(seg):
            continue
        best = "maybe"
    return best


# --- title ------------------------------------------------------------------
# NB: no seniority filter. "L2" at one company is "Senior" at another;
# only the job description can settle it.
IS_ENG = re.compile(
    r"\b(software|backend|back-end|frontend|full[\s-]?stack|platform|infrastructure"
    r"|systems?|site reliability|sre|distributed)\b.*\bengineer"
    r"|\bengineer\b.*\b(software|backend|platform|infrastructure)\b"
    r"|\bmember of technical staff\b", re.I)

NOT_ENG = re.compile(
    r"\b(community|devrel|developer relations|solutions?|sales|support|success"
    r"|it systems|media|field|partner|customer|marketing|recruit)\b"
    r"|\b(manager|director|head of|vp|chief)\b", re.I)

IS_ML  = re.compile(r"\bmachine learning\b|\bml\b|\bgenai\b|\bdeep learning\b|\bmlops\b", re.I)
IS_SEC = re.compile(r"\bsecurity\b|\bappsec\b|\binfosec\b|\bcryptograph"
                    r"|\bvulnerability\b|\bciam\b", re.I)


def age_days(iso):
    if not iso:
        return None
    try:
        dt = datetime.fromisoformat(iso.replace("Z", "+00:00"))
    except ValueError:
        return None
    return (datetime.now(timezone.utc) - dt).total_seconds() / 86400


def fetch(url):
    req = urllib.request.Request(url, headers={"User-Agent": "jobscout/0.1"})
    with urllib.request.urlopen(req, timeout=20) as r:
        return json.loads(r.read().decode())


# --- adapters ---------------------------------------------------------------
# Each returns dicts in ONE common shape: {uid, title, location, url, posted}

def from_greenhouse(token):
    data = fetch(f"https://boards-api.greenhouse.io/v1/boards/{token}/jobs")
    return [{
        "uid": f"gh:{token}:{j['id']}",
        "title": j.get("title", ""),
        "location": (j.get("location") or {}).get("name", ""),
        "url": j.get("absolute_url", ""),
        "posted": j.get("first_published") or j.get("updated_at") or "",
    } for j in data.get("jobs", [])]


def from_lever(token):
    data = fetch(f"https://api.lever.co/v0/postings/{token}?mode=json")
    out = []
    for j in data or []:
        ms = j.get("createdAt")
        posted = (datetime.fromtimestamp(ms / 1000, timezone.utc).isoformat()
                  if isinstance(ms, (int, float)) else "")
        out.append({
            "uid": f"lv:{token}:{j.get('id')}",
            "title": j.get("text", ""),
            "location": (j.get("categories") or {}).get("location", "") or "",
            "url": j.get("hostedUrl", ""),
            "posted": posted,
        })
    return out


def from_ashby(token):
    data = fetch(f"https://api.ashbyhq.com/posting-api/job-board/{token}")
    out = []
    for j in data.get("jobs", []):
        loc = j.get("location") or ""
        # Ashby splits the remote flag out of the location string
        if j.get("isRemote") and "remote" not in loc.lower():
            loc = f"Remote - {loc}" if loc else "Remote"
        out.append({
            "uid": f"ab:{token}:{j.get('id')}",
            "title": j.get("title", ""),
            "location": loc,
            "url": j.get("jobUrl") or j.get("applyUrl") or "",
            "posted": j.get("publishedAt") or "",
        })
    return out


ADAPTERS = {"greenhouse": from_greenhouse, "lever": from_lever, "ashby": from_ashby}


def get(ats, token):
    try:
        return ADAPTERS[ats](token)
    except urllib.error.HTTPError as e:
        print(f"  ! {ats}:{token}: HTTP {e.code}", file=sys.stderr)
    except Exception as e:
        print(f"  ! {ats}:{token}: {type(e).__name__}", file=sys.stderr)
    return []


def role_ok(title):
    if not IS_ENG.search(title) or NOT_ENG.search(title):
        return False
    return not (IS_ML.search(title) or IS_SEC.search(title))


def verdict(p):
    if not role_ok(p["title"]):
        return None
    age = age_days(p["posted"])            # missing dates are KEPT
    if age is not None and age > MAX_AGE_DAYS:
        return None
    loc = classify_location(p["location"])
    return loc if loc in ("yes", "maybe") else None


# --- state ------------------------------------------------------------------
def load_seen():
    if RESET or not STATE.exists():
        return {}
    try:
        with open(STATE) as f:
            return json.load(f)
    except Exception:
        print("  ! seen.json unreadable, starting fresh", file=sys.stderr)
        return {}


def save_seen(seen):
    with open(STATE, "w") as f:
        json.dump(seen, f, indent=0, sort_keys=True)


def show(bucket, heading):
    print(f"\n{'=' * 68}\n{heading}  ({len(bucket)})\n{'=' * 68}\n")
    for p in bucket:
        age_s = f"{p['ageDays']:>3}d" if p["ageDays"] is not None else "  ?"
        flag = "* " if p["isNew"] else "  "
        print(f"{flag}{age_s}  {p['company']:<16} {p['title']}")
        print(f"        {p['location']}")
        print(f"        {p['url']}\n")


# --- run --------------------------------------------------------------------
with open(HERE / "companies.json") as f:
    config = json.load(f)

seen = load_seen()
today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
first_run = not seen

matches = []          # EVERY currently-matching posting, new or not
for ats, tokens in config.items():
    for token in tokens:
        postings = get(ats, token)
        ny = nm = nnew = 0
        for p in postings:
            v = verdict(p)
            if not v:
                continue
            is_new = p["uid"] not in seen
            seen.setdefault(p["uid"], today)
            age = age_days(p["posted"])
            matches.append({
                "id": p["uid"],
                "title": p["title"],
                "company": token,
                "location": p["location"],
                "url": p["url"],
                "posted": p["posted"],
                "ageDays": round(age) if age is not None else None,
                "remote": v,              # "yes" | "maybe"
                "isNew": is_new,
            })
            ny, nm = ny + (v == "yes"), nm + (v == "maybe")
            nnew += is_new
        print(f"  {ats[:2]}/{token:<22} {len(postings):>4} jobs -> "
              f"{ny} yes, {nm} maybe, {nnew} new", file=sys.stderr)

matches.sort(key=lambda p: p["posted"] or "", reverse=True)

save_seen(seen)

if AS_JSON:
    OUT.parent.mkdir(parents=True, exist_ok=True)
    payload = {
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "count": len(matches),
        "jobs": matches,
    }
    with open(OUT, "w") as f:
        json.dump(payload, f, indent=2)
        f.write("\n")
    print(f"\nWrote {len(matches)} jobs to {OUT}")
    sys.exit(0)

# text digest
visible = matches if SHOW_ALL else [p for p in matches if p["isNew"]]
yes = [p for p in visible if p["remote"] == "yes"]
maybe = [p for p in visible if p["remote"] == "maybe"]

if first_run:
    print(f"\nFirst run — recording {len(matches)} postings as your baseline.")
    print("From now on, plain `python3 filter.py` shows only what's new.")

if yes:
    show(yes, "REMOTE - US")
if maybe:
    show(maybe, "REMOTE - COUNTRY UNSTATED (check by hand)")
if not yes and not maybe:
    print("\nNothing new since last run.\n")