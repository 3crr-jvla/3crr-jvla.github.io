# Putting this site online with GitHub Pages

No command line, no software to install, no web development experience needed.
Everything below happens in a browser. Budget about 20 minutes for the first
time; after that, edits take a minute each.

---

## Step 0 — What you are about to get

A public web address like `https://3crr-jvla.github.io`, hosted free by GitHub,
that you control and can update by editing files in a browser. It is static —
just files being served — which is why it is fast, free forever, and will still
work in ten years with nobody maintaining it.

---

## Step 1 — Make a GitHub account and an organisation

1. If you do not have one, sign up at <https://github.com> (free).
2. Click your avatar (top right) → **Your organizations** → **New organization**
   → choose the **Free** plan.
3. Name it something short and permanent, for example `3crr-jvla`.

**Why an organisation rather than your personal account?** The site URL is
derived from the account name, and an organisation can have several owners. If
you move institution or hand the project on, the URL and the site survive. A
site at `https://yourname.github.io/...` becomes awkward the day it is not your
project any more.

Add a co-I or two as owners once it exists (organisation → **People** →
**Invite member** → set role to **Owner**).

---

## Step 2 — Create the repository

1. On the organisation page click **New repository**.
2. **Repository name:** type the organisation name followed by `.github.io` —
   so if the organisation is `3crr-jvla`, the repository is
   **`3crr-jvla.github.io`**. This exact naming is what gives you the clean
   address `https://3crr-jvla.github.io` instead of a URL with the repository
   name stuck on the end.
3. Set it to **Public**.
4. Do **not** tick "Add a README file" — you are about to upload one.
5. Click **Create repository**.

---

## Step 3 — Upload the site

1. On the empty repository page, click **uploading an existing file**
   (in the line "…or upload an existing file").
2. Unzip the site folder on your computer. Select **everything inside it** —
   `index.html`, the other `.html` files, the `assets` folder, the `data`
   folder, and the dot-file `.nojekyll` — and drag them into the browser window.

   > Make sure you drag the *contents* of the folder, not the folder itself.
   > `index.html` must end up at the top level of the repository, otherwise the
   > site will 404.

   > If your file manager hides files starting with a dot, `.nojekyll` may not
   > be visible. On macOS press <kbd>Cmd</kbd>+<kbd>Shift</kbd>+<kbd>.</kbd> in
   > Finder to show it; on Windows, View → Show → Hidden items. If you cannot
   > upload it, Step 5 explains how to create it directly on GitHub.

3. At the bottom, in the commit box, type something like `Initial site` and
   click **Commit changes**.

---

## Step 4 — Turn Pages on

1. In the repository, click **Settings** (top row of tabs).
2. In the left sidebar, click **Pages**.
3. Under **Build and deployment → Source**, choose **Deploy from a branch**.
4. Under **Branch**, choose **main** and folder **/ (root)**. Click **Save**.
5. Wait one to two minutes, then reload the Settings → Pages screen. It will
   show a green banner with your live URL. Open it.

If you see a plain, unstyled page, wait another minute and hard-refresh
(<kbd>Cmd/Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>R</kbd>) — the CSS is usually just
not cached yet.

---

## Step 5 — Create `.nojekyll` if it did not upload

GitHub Pages runs files through a blog engine called Jekyll by default, which
occasionally mangles folders. An empty file named `.nojekyll` switches that off.

1. In the repository, click **Add file** → **Create new file**.
2. Type `.nojekyll` as the filename. Leave the contents empty.
3. Click **Commit changes**.

---

## Editing the site afterwards

**To change any text:** open the `.html` file in the repository, click the
pencil icon (top right of the file view), edit, then **Commit changes** at the
bottom. The live site updates within a minute.

The HTML is plain and commented. Text you want to change sits between tags like
`<p>…</p>`; you can edit the words freely as long as you leave the angle-bracket
tags alone. Anything the team still needs to supply is wrapped in a
`<div class="todo">` block that renders as an obvious orange dashed box on the
live site — search the files for `TO DO` to find them all.

**To update the target list:** replace `data/sources.csv`. Open it in the
repository, click the pencil, paste the new contents, commit. The Sample page
rebuilds its table, sorting and status filter from that file automatically — no
HTML editing involved. See `README.md` for the column definitions and a Python
snippet that writes the file from a table you already have.

**To add an image:** go into the `assets/img` folder, click **Add file** →
**Upload files**, then reference it in a page as
`<img src="assets/img/yourfile.jpg" alt="description of the image">`.

**To preview before committing:** GitHub shows a **Preview** tab when editing
Markdown but not HTML. For HTML the safest habit is to commit, look at the live
site, and fix it if needed — every commit is reversible from the repository's
**History**.

---

## Optional: a custom domain

If your department can create a DNS record for you, you can serve the site from
something like `3crr.cam.ac.uk` or a domain you buy yourself:

1. Ask for a **CNAME** record pointing your chosen name at `3crr-jvla.github.io`.
2. In the repository, **Settings → Pages → Custom domain**, enter the domain
   and save. Tick **Enforce HTTPS** once it becomes available.

This is worth doing only if you want an institutional-looking address; the
`github.io` URL is perfectly respectable for a project site and many surveys
use one.

---

## What not to put in the repository

GitHub Pages is for the website, not the archive. Repositories are limited to
roughly 1 GB with a 100 MB cap per file, and Pages sites have a soft bandwidth
limit of 100 GB per month. **Do not upload FITS images or data cubes.** Host
those on your institutional storage, the NRAO archive, or Zenodo, and link to
them from the Data page. Small thumbnails and preview PNGs are fine.

---

## If something goes wrong

| Symptom | Cause | Fix |
|---|---|---|
| 404 at the site URL | `index.html` is inside a subfolder | Move it to the top level of the repository |
| Page loads but looks like plain text | `assets/style.css` missing or in the wrong place | Check the `assets` folder is at the top level |
| Images missing | Filename case mismatch | GitHub is case-sensitive; `3C123.jpg` ≠ `3c123.jpg` |
| Sample table empty, with an orange warning | `data/sources.csv` not uploaded | Check the `data` folder exists in the repository |
| Nothing updates after a commit | Build still running | Check the **Actions** tab for a running or failed deployment |
