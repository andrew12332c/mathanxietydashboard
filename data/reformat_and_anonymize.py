"""
Reformat and combine all data files in the data folder, then anonymize.
Output: combined_anonymized.csv (single CSV with all sources merged, PII removed/redacted).
"""
import csv
import hashlib
import os
from pathlib import Path

# Use stdlib only (no pandas) so it runs anywhere
DATA_DIR = Path(__file__).resolve().parent
OUTPUT_FILE = DATA_DIR / "combined_anonymized.csv"

# Columns to remove (direct identifiers / not needed for analysis)
COLUMNS_TO_DROP = {
    "w1ip",           # IP address
    "w1timestamp",    # Exact timestamp (we can keep a generalized version if needed)
}

# Free-text / potentially identifying columns → replace with [REDACTED]
TEXT_COLUMNS_TO_REDACT = {
    "newsthoughts",   # Open-ended responses can identify individuals
    "newsevqual",     # Qualitative text
    "w1dogcolor",     # Sometimes contains names (e.g. "Brown", "white")
}

# Create a stable anonymized participant ID from rid (same rid → same participant_id)
def anonymize_rid(rid: str) -> str:
    if rid is None or str(rid).strip() == "":
        return ""
    s = str(rid).strip()
    h = hashlib.sha256(s.encode("utf-8")).hexdigest()[:8]
    return f"P{h.upper()}"


def read_csv_with_header(filepath: Path):
    """Read CSV; return list of dicts (first row = headers)."""
    with open(filepath, "r", encoding="utf-8", newline="") as f:
        reader = csv.DictReader(f)
        rows = list(reader)
        if not rows:
            return [], []
        return list(rows[0].keys()), rows


def read_sp25_w5(filepath: Path):
    """Read sp25w5survey-and-mathscores.csv (single header row)."""
    return read_csv_with_header(filepath)


def read_w3(filepath: Path):
    """Read sp25mathanxietyw3survey.csv (single header, key = rid)."""
    return read_csv_with_header(filepath)


def read_sp25(filepath: Path):
    """Read sp25.csv: row 0 = short names (use as header), row 1 = long descriptions (skip for data)."""
    with open(filepath, "r", encoding="utf-8", newline="") as f:
        reader = csv.reader(f)
        row0 = next(reader)
        next(reader)  # skip description row
        rows = []
        for row in reader:
            if len(row) != len(row0):
                row = row + [""] * (len(row0) - len(row))
            rows.append(dict(zip(row0, row[: len(row0)])))
    return row0, rows


def merge_on_rid(base_rows, base_key, extra_rows, extra_key="rid"):
    """Merge extra_rows into base_rows on base_key == extra_key. Modifies base_rows in place."""
    by_rid = {}
    for r in extra_rows:
        key = r.get(extra_key)
        if key is None or str(key).strip() == "":
            continue
        by_rid[str(key).strip()] = r

    for r in base_rows:
        rid = r.get(base_key)
        if rid is None:
            continue
        rid = str(rid).strip()
        if rid in by_rid:
            for k, v in by_rid[rid].items():
                if k == extra_key:
                    continue
                # Avoid overwriting with empty if base already has value
                if k not in r or (r[k] is None or str(r[k]).strip() == "") and (v is not None and str(v).strip() != ""):
                    r[k] = v
    return base_rows


def anonymize_row(row: dict, rid_column: str) -> dict:
    out = dict(row)
    rid = out.get(rid_column)
    out["participant_id"] = anonymize_rid(rid)
    # Drop identifier columns
    for col in COLUMNS_TO_DROP:
        out.pop(col, None)
    # Redact free text
    for col in TEXT_COLUMNS_TO_REDACT:
        if col in out and out[col] is not None and str(out[col]).strip():
            out[col] = "[REDACTED]"
    # Optionally generalize country if you want (e.g. only US vs non-US). Keeping as-is for now.
    return out


def get_all_headers(rows_list):
    seen = set()
    headers = []
    for rows in rows_list:
        for r in rows:
            for k in r.keys():
                if k not in seen:
                    seen.add(k)
                    headers.append(k)
    return headers


def main():
    data_dir = DATA_DIR
    w5_path = data_dir / "sp25w5survey-and-mathscores.csv"
    w3_path = data_dir / "sp25mathanxietyw3survey.csv"
    sp25_path = data_dir / "sp25.csv"

    if not w5_path.exists():
        raise FileNotFoundError(f"Expected main survey file: {w5_path}")

    # Load W5 (main survey + math scores) – this is the primary source
    w5_headers, w5_rows = read_sp25_w5(w5_path)
    print(f"Loaded {len(w5_rows)} rows from {w5_path.name}")

    # Load W3 (math anxiety) and merge on rid
    if w3_path.exists():
        _, w3_rows = read_w3(w3_path)
        print(f"Loaded {len(w3_rows)} rows from {w3_path.name}")
        merge_on_rid(w5_rows, "rid", w3_rows, "rid")
    else:
        print(f"Optional file not found: {w3_path}")

    # Optional: merge sp25 (W1-only format) for any extra columns not in w5
    if sp25_path.exists():
        sp25_headers, sp25_rows = read_sp25(sp25_path)
        print(f"Loaded {len(sp25_rows)} rows from {sp25_path.name}")
        merge_on_rid(w5_rows, "rid", sp25_rows, "rid")

    combined_rows = w5_rows

    # Anonymize each row first
    anonymized = []
    for r in combined_rows:
        a = anonymize_row(r, "rid")
        anonymized.append(a)

    # Build final header: participant_id first, then rid, then all other keys (excluding dropped)
    if not anonymized:
        final_headers = ["participant_id", "rid"]
    else:
        all_keys = list(anonymized[0].keys())
        final_headers = ["participant_id"] + [h for h in all_keys if h != "participant_id" and h not in COLUMNS_TO_DROP]
        if "rid" not in final_headers:
            final_headers.insert(1, "rid")

    # Write output
    with open(OUTPUT_FILE, "w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=final_headers, extrasaction="ignore")
        writer.writeheader()
        for row in anonymized:
            writer.writerow(row)

    print(f"Wrote {len(anonymized)} rows to {OUTPUT_FILE}")
    print("Anonymization applied:")
    print("  - participant_id: hashed from rid (stable per respondent)")
    print("  - Removed: w1ip, w1timestamp")
    print("  - Redacted (set to [REDACTED]): newsthoughts, newsevqual, w1dogcolor")


if __name__ == "__main__":
    main()
