#!/usr/bin/env python3
"""
Build data/sources.csv for the 3CRR JVLA Legacy Survey website.

Input : the project spreadsheet exported as CSV — the full 3CRR catalogue
        (172 rows) with positions in B1950.
Output: data/sources.csv — all 172 catalogue entries, positions precessed to
        J2000, with the 73 programme targets flagged and their observing times
        given as on-source minutes.

Programme selection:  z < 1  AND  LAS < 240 arcsec  AND  "Not compact" == yes
                      -> 73 sources, 345.0 h including overheads.

Usage:  python3 tools/build_sources.py "3CRR - Desired 1.csv" data/sources.csv
"""

import sys
import pandas as pd
from astropy.coordinates import SkyCoord, FK4, FK5
import astropy.units as u

# The spreadsheet stores time *including* JVLA overheads; the website shows
# on-source time. 0.6 is the overhead ratio used in the proposal.
OVERHEAD_RATIO = 0.6

LAS_LIMIT = 240.0   # arcsec
Z_LIMIT = 1.0

BANDS = [
    ("l_a", "Total time L-A", "Existing L-A"),
    ("l_b", "Total time L-B", "Existing L-B"),
    ("l_c", "Total time L-C", "Existing L-C"),
    ("c_a", "Total time C-A", "Existing C-A"),
    ("c_b", "Total time C-B", "Existing C-B"),
    ("c_c", "Total Time C-C", "Existing C-C"),
    ("c_d", "Total Time C-D", "Existing C-D"),
]

OUT_COLS = (["name", "ra_j2000", "dec_j2000", "z", "s178_jy", "alpha",
             "las_arcsec", "size_kpc", "in_sample", "excluded"]
            + [b[0] for b in BANDS] + ["notes"])


def as_float(v):
    try:
        return float(str(v).strip())
    except (TypeError, ValueError):
        return None


def exclusion_reason(z, las, compact):
    """Short, single reason why a catalogue entry is not a programme target."""
    if z is None or z >= Z_LIMIT:
        return "z ≥ 1"
    if las is None:
        return "No LAS tabulated"
    if las >= LAS_LIMIT:
        return "LAS ≥ 240″"
    if compact:
        return "Compact"
    return ""


def main(src, dst):
    df = pd.read_csv(src)
    df.columns = [c.strip() for c in df.columns]

    df["LAS"] = pd.to_numeric(df["LAS (arcsec)"], errors="coerce")
    df["Z"] = pd.to_numeric(df["Redshift"], errors="coerce")
    compact = df["Not compact"].astype(str).str.strip().str.lower() != "yes"

    in_sample = (df["Z"] < Z_LIMIT) & (df["LAS"] < LAS_LIMIT) & (~compact)
    if in_sample.sum() != 73:
        print(f"WARNING: selection returned {in_sample.sum()} sources, expected 73",
              file=sys.stderr)

    # ---- B1950 (FK4) -> J2000 (FK5), for every catalogue entry -----------
    coords = SkyCoord(
        ra=df["RA (B1950)"].str.strip().tolist(),
        dec=df["Dec (B1950)"].str.strip().tolist(),
        unit=(u.hourangle, u.deg),
        frame=FK4(equinox="B1950", obstime="B1950"),
    ).transform_to(FK5(equinox="J2000"))

    out = pd.DataFrame()
    out["name"] = df["3CRR Name"].str.strip()
    out["ra_j2000"] = coords.ra.to_string(unit=u.hour, sep=":", precision=2, pad=True)
    out["dec_j2000"] = coords.dec.to_string(unit=u.deg, sep=":", precision=1,
                                            pad=True, alwayssign=True)
    out["z"] = df["Z"].map(lambda v: "" if pd.isna(v) else f"{v:.3f}")
    out["s178_jy"] = df["178 MHz flux (Jy)"]
    out["alpha"] = df["Sp index"]
    out["las_arcsec"] = df["LAS"].map(lambda v: "" if pd.isna(v) else f"{v:g}")
    out["size_kpc"] = df["Size (kpc)"].map(
        lambda v: "" if str(v).strip() in ("--", "nan", "") else str(v).strip())

    out["in_sample"] = in_sample.map(lambda b: "yes" if b else "no")
    out["excluded"] = [
        "" if s else exclusion_reason(None if pd.isna(z) else z,
                                      None if pd.isna(l) else l,
                                      c)
        for s, z, l, c in zip(in_sample, df["Z"], df["LAS"], compact)
    ]

    # ---- per band/array cell, programme targets only ---------------------
    # A number is on-source minutes for a new observation; "archival" means
    # usable data already exist; empty means not required for that source.
    # Entries outside the programme are left blank: the spreadsheet's time
    # columns for z >= 1 rows are a wish list, not this allocation.
    for key, tcol, ecol in BANDS:
        vals = []
        for (_, r), member in zip(df.iterrows(), in_sample):
            if not member:
                vals.append("")
                continue
            minutes = as_float(r[tcol])
            existing = str(r[ecol]).strip().upper() == "TRUE"
            if minutes:
                onsource = minutes * OVERHEAD_RATIO
                vals.append(f"{onsource:g}" if abs(onsource - round(onsource)) > 0.05
                            else f"{round(onsource):g}")
            elif existing:
                vals.append("archival")
            else:
                vals.append("")
        out[key] = vals

    out["notes"] = ""

    total_h = sum(
        as_float(r[b[1]]) or 0
        for (_, r), member in zip(df.iterrows(), in_sample) if member
        for b in BANDS
    ) / 60.0
    print(f"{len(out)} catalogue entries, {int(in_sample.sum())} programme targets, "
          f"{total_h:.1f} h including overheads ({total_h * OVERHEAD_RATIO:.1f} h on source)")

    out[OUT_COLS].to_csv(dst, index=False)
    print(f"wrote {dst}")


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else "3CRR - Desired 1.csv",
         sys.argv[2] if len(sys.argv) > 2 else "data/sources.csv")
