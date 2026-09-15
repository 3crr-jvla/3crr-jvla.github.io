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
assets/img/         Figures — from the accepted proposal, plus the LOFAR gallery
data/sources.csv    All 172 3CRR entries, with our 73 targets flagged — edit this, not the HTML
tools/build_sources.py  Regenerates data/sources.csv from the project spreadsheet
.nojekyll           Tells GitHub Pages to serve the files as-is
```

## Before publishing

Search the HTML files for **`TO DO`**. Each one is also visible on the rendered
page as an orange dashed box, so nothing can be forgotten by accident. As of
now:

- `team.html` — a contact address for the project
- `science.html` — the direct ADS link for the 3C 390.3 figure reference (currently an ADS search)
- `index.html` — the date on the Status banner, whenever the status wording changes
- `publications.html` — survey papers, as they appear
- `data.html` — release status, where the FITS images will be served from, and
  the acknowledgement text
- `index.html` — the NRAO project code, in the footer comment

## The catalogue table

`data/sources.csv` drives the Sample page: the table, its sorting and the filter
menu all come from it. It holds **all 172 3CRR entries**, with positions precessed
to J2000. The 73 programme targets are flagged and highlighted on the page;
everything else carries a short reason for exclusion.

| Column | Meaning |
|---|---|
| `name` | Source name as in the 3CRR catalogue, e.g. `3C123` |
| `ra_j2000`, `dec_j2000` | Position, sexagesimal, precessed from the catalogue's B1950 coordinates |
| `z` | Redshift |
| `s178_jy` | 178 MHz flux density, Jy |
| `alpha` | Spectral index |
| `las_arcsec` | Largest angular size, arcsec |
| `size_kpc` | Projected linear size, kpc |
| `in_sample` | `yes` for the 73 programme targets, `no` otherwise |
| `excluded` | Why an entry is not a target: `z ≥ 1`, `LAS ≥ 240″`, `Compact`, `No LAS tabulated`. Empty for targets. |
| `l_a`, `l_b`, `l_c` | L-band, A/B/C array |
| `c_a`, `c_b`, `c_c`, `c_d` | C-band, A/B/C/D array |
| `notes` | Free text, shown in the search index |

Each of the seven band/array columns holds one of three things:

- **a number** — on-source minutes for a new observation in this programme;
  rendered as a solid chip
- **`archival`** — usable data already exist in the archive; rendered as an
  outlined chip
- **empty** — not required for this source, or not a programme target

Times are **on source**, excluding JVLA overheads. The 345 hours requested in the
proposal includes a 40% overhead; on source that is 207 hours. Entries outside the
programme are left blank in these columns deliberately — the spreadsheet's time
values for z ≥ 1 rows are a wish list, not this allocation.

### Regenerating it from the spreadsheet

`tools/build_sources.py` takes the project spreadsheet (the full 172-row 3CRR
catalogue with B1950 positions and the `Total time …` / `Existing …` columns),
applies the selection, precesses every position with astropy, divides the times
by the 0.6 overhead ratio, and writes `data/sources.csv`:

```
pip install pandas astropy
python3 tools/build_sources.py "3CRR - Desired 1.csv" data/sources.csv
```

It prints the counts and the total time so you can check them against the
proposal — it should say 172 catalogue entries, 73 programme targets, 345.0 h.
Then upload the new `data/sources.csv` over the old one in the repository.

If you would rather edit by hand, the file is ordinary CSV: lines beginning with
`#` are ignored, and empty values render as a dash.

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

The images in `assets/img/` are your team's own work: most were extracted from
the accepted proposal, and the nine-panel LOFAR gallery on the Overview page
comes from the 0.3″ 144 MHz maps supplied separately (converted from PDF to JPEG,
with the plot frame and axes cropped off so the panels sit together cleanly).

To add another source to that gallery, drop a JPEG or PNG in `assets/img/`, copy
one `<div class="shot">` block in `index.html`, and update the source list and
count in the caption underneath. Each panel is displayed in a square box with the
image scaled to fit, so portrait, landscape and square maps all sit side by side
without being cropped.

## Accessibility and good practice

Every `<img>` has an `alt` description — keep this up if you add images, both
for screen readers and for the times an image fails to load. The site uses no
tracking, no cookies and no external requests other than the Google Fonts
stylesheet.
