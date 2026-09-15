# 3CRR JVLA Legacy Survey — project website

Static website for the 3CRR JVLA Large Programme. No build step, no
dependencies: the files in this repository are the site.

**To publish it, follow [`DEPLOY.md`](DEPLOY.md).**

---

## Files

```
index.html          Overview — hero, key numbers, the three science questions
science.html        Full science case
sample.html         Selection criteria, target table, observing strategy
data.html           Data products, processing, release policy
team.html           Project members and contact
publications.html   Papers, related projects, pipelines
assets/style.css    All styling. Colours are in the :root block at the top.
assets/sample-table.js  Renders the target table from data/sources.csv
assets/img/         Figures (taken from the accepted proposal)
data/sources.csv    The target list — edit this, not the HTML
.nojekyll           Tells GitHub Pages to serve the files as-is
```

## Before publishing

Search the HTML files for **`TO DO`**. Each one is also visible on the rendered
page as an orange dashed box, so nothing can be forgotten by accident. As of
now:

- `team.html` — the real investigator list and a contact address
- `publications.html` — survey papers, as they appear
- `data.html` — release status, where the FITS images will be served from, and
  the acknowledgement text
- `index.html` — the NRAO project code, in the footer comment
- `data/sources.csv` — the real 73 targets (currently five example rows)

## The target list

`data/sources.csv` drives the Sample page: the table, the column sorting and the
status filter all come from it. Columns:

| Column | Meaning |
|---|---|
| `name` | Source name, e.g. `3C 123` |
| `iau_name` | IAU designation, e.g. `0433+295` |
| `ra_j2000`, `dec_j2000` | Position, any consistent format |
| `z` | Redshift (sorts numerically) |
| `size_arcsec` | Largest angular size in arcsec (sorts numerically) |
| `fr_class` | `I` or `II` |
| `arrays` | Arrays requested, e.g. `"A, B, C"` — quote it, it contains commas |
| `status` | Free text; drives the filter menu. Suggested: Scheduled / Observed / Calibrated / Imaged / Released |
| `notes` | Anything else worth showing |

Empty values render as a dash. Lines beginning with `#` are ignored, so you can
keep comments in the file.

If you already have the sample as an astropy table or a pandas DataFrame,
writing the file is one line:

```python
import pandas as pd

df = df.rename(columns={
    "Name": "name", "IAU": "iau_name", "RA": "ra_j2000", "Dec": "dec_j2000",
    "z": "z", "LAS": "size_arcsec", "FR": "fr_class",
})
df["arrays"] = "A, B"          # or whatever applies per source
df["status"] = "Scheduled"
df["notes"] = ""

cols = ["name", "iau_name", "ra_j2000", "dec_j2000", "z",
        "size_arcsec", "fr_class", "arrays", "status", "notes"]
df[cols].to_csv("data/sources.csv", index=False)
```

Then upload the file over the old one in the repository.

## Previewing locally

Double-clicking `index.html` works for every page except `sample.html`, where
browsers block the local file read that loads the CSV. To preview everything,
open a terminal in this folder and run:

```
python3 -m http.server 8000
```

then visit <http://localhost:8000>. Press <kbd>Ctrl</kbd>+<kbd>C</kbd> to stop.

## Changing the look

Every colour is defined once, at the top of `assets/style.css`:

```css
:root {
  --bg:     #080b12;   /* page background */
  --text:   #e9eef7;   /* body text */
  --accent: #ff8f45;   /* headings accent, buttons, links-in-nav */
  ...
}
```

Change those values and the whole site follows. Fonts are loaded from Google
Fonts in each page's `<head>`; if you prefer system fonts, delete those two
`<link>` lines and the site falls back gracefully.

## Figures

The images in `assets/img/` were extracted from the accepted proposal and are
your team's own work. Captions on the pages describe each one; update them if
you replace an image.

## Accessibility and good practice

Every `<img>` has an `alt` description — keep this up if you add images, both
for screen readers and for the times an image fails to load. The site uses no
tracking, no cookies and no external requests other than the Google Fonts
stylesheet.
