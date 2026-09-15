/* ============================================================
   Renders data/sources.csv into the catalogue table.

   The file holds all 172 3CRR entries. Rows with in_sample = yes are the
   73 programme targets and are highlighted; the rest carry a short reason
   in the "excluded" column.

   You should not need to edit this file — edit data/sources.csv, or
   regenerate it with tools/build_sources.py.

   Each of the columns l_a, l_b, l_c, c_a, c_b, c_c, c_d holds either
     a number    on-source minutes for a new observation in this programme
     "archival"  usable data already exists in the archive
     (empty)     not required, or not a programme target
   ============================================================ */

(function () {
  "use strict";

  var L_ARRAYS = [["l_a", "A"], ["l_b", "B"], ["l_c", "C"]];
  var C_ARRAYS = [["c_a", "A"], ["c_b", "B"], ["c_c", "C"], ["c_d", "D"]];

  var COLUMNS = [
    { key: "name",        label: "Source" },
    { key: "ra_j2000",    label: "RA (J2000)" },
    { key: "dec_j2000",   label: "Dec (J2000)" },
    { key: "z",           label: "z",            numeric: true, align: "right" },
    { key: "s178_jy",     label: "S₁₇₈ (Jy)",    numeric: true, align: "right" },
    { key: "alpha",       label: "α",            numeric: true, align: "right" },
    { key: "las_arcsec",  label: "LAS (″)",      numeric: true, align: "right" },
    { key: "size_kpc",    label: "Size (kpc)",   numeric: true, align: "right" },
    { key: "_sample",     label: "Sample",       render: "sample" },
    { key: "_lband",      label: "L-band",       render: "coverage", arrays: L_ARRAYS, numeric: true },
    { key: "_cband",      label: "C-band",       render: "coverage", arrays: C_ARRAYS, numeric: true },
    { key: "_time",       label: "On source",    numeric: true, align: "right" }
  ];

  var tbody   = document.getElementById("source-rows");
  var thead   = document.getElementById("source-head");
  var search  = document.getElementById("search");
  var filter  = document.getElementById("coverage-filter");
  var countEl = document.getElementById("count");
  var errEl   = document.getElementById("table-error");

  var rows = [];
  var sortKey = "z";
  var sortAsc = true;

  /* --- minimal CSV parser that understands "quoted, fields" --- */
  function parseCSV(text) {
    var lines = text.replace(/^﻿/, "").split(/\r?\n/);
    var out = [], header = null;

    for (var i = 0; i < lines.length; i++) {
      var line = lines[i];
      if (!line.trim() || line.trim().charAt(0) === "#") continue;

      var fields = [], cur = "", inQ = false;
      for (var c = 0; c < line.length; c++) {
        var ch = line[c];
        if (inQ) {
          if (ch === '"' && line[c + 1] === '"') { cur += '"'; c++; }
          else if (ch === '"') { inQ = false; }
          else { cur += ch; }
        } else if (ch === '"') { inQ = true; }
        else if (ch === ",") { fields.push(cur.trim()); cur = ""; }
        else { cur += ch; }
      }
      fields.push(cur.trim());

      if (!header) { header = fields; continue; }
      var obj = {};
      for (var h = 0; h < header.length; h++) obj[header[h]] = fields[h] || "";
      out.push(obj);
    }
    return out;
  }

  /* --- derived fields ------------------------------------------------- */

  function cellState(v) {
    if (!v) return "none";
    if (v.toLowerCase() === "archival") return "archival";
    return parseFloat(v) > 0 ? "new" : "none";
  }

  function decorate(r) {
    var all = L_ARRAYS.concat(C_ARRAYS);
    var minutes = 0, nNew = 0, nArchival = 0;

    r._member = (r.in_sample || "").toLowerCase() === "yes";
    r._sample = r._member ? "Legacy sample" : (r.excluded || "Not in the sample");

    all.forEach(function (a) {
      var s = cellState(r[a[0]]);
      if (s === "new") { nNew++; minutes += parseFloat(r[a[0]]) || 0; }
      if (s === "archival") nArchival++;
    });

    r._time = minutes;
    r._nNew = nNew;
    r._nArchival = nArchival;
    r._lband = L_ARRAYS.filter(function (a) { return cellState(r[a[0]]) === "new"; }).length;
    r._cband = C_ARRAYS.filter(function (a) { return cellState(r[a[0]]) === "new"; }).length;
    return r;
  }

  /* --- rendering ------------------------------------------------------ */

  function coverageCell(r, arrays) {
    var span = document.createElement("span");
    span.className = "chips";
    arrays.forEach(function (a) {
      var state = cellState(r[a[0]]);
      var chip = document.createElement("span");
      chip.className = "chip chip-" + state;
      chip.textContent = a[1];
      if (state === "new") {
        chip.title = a[1] + "-array: new observation, " + r[a[0]] + " min on source";
      } else if (state === "archival") {
        chip.title = a[1] + "-array: existing archival data";
      } else {
        chip.title = a[1] + "-array: not required";
      }
      span.appendChild(chip);
    });
    return span;
  }

  function sampleCell(r) {
    var el = document.createElement("span");
    if (r._member) {
      el.className = "tag tag-sample";
      el.textContent = "Legacy sample";
      el.title = "One of the 73 targets of this JVLA Large Programme";
    } else {
      el.className = "tag tag-out";
      el.textContent = r.excluded || "Not in the sample";
      el.title = "In the 3CRR catalogue but outside this programme's selection";
    }
    return el;
  }

  function buildHead() {
    thead.innerHTML = "";
    COLUMNS.forEach(function (col) {
      var th = document.createElement("th");
      th.textContent = col.label + (col.key === sortKey ? (sortAsc ? " ▲" : " ▼") : "");
      if (col.align === "right") th.style.textAlign = "right";
      th.style.cursor = "pointer";
      th.title = "Click to sort";
      th.addEventListener("click", function () {
        if (sortKey === col.key) { sortAsc = !sortAsc; } else { sortKey = col.key; sortAsc = true; }
        buildHead();
        render();
      });
      thead.appendChild(th);
    });
  }

  function visibleRows() {
    var q = (search.value || "").toLowerCase().trim();
    var f = filter.value;

    var list = rows.filter(function (r) {
      if (f === "sample" && !r._member) return false;
      if (f === "new" && !(r._member && r._nNew > 0)) return false;
      if (f === "archival" && !(r._member && r._nNew === 0)) return false;
      if (f === "out" && r._member) return false;
      if (f === "z" && r.excluded.indexOf("z") !== 0) return false;
      if (f === "las" && r.excluded.indexOf("LAS") !== 0) return false;
      if (f === "compact" && r.excluded !== "Compact") return false;
      if (!q) return true;
      return ["name", "ra_j2000", "dec_j2000", "z", "excluded", "notes"].some(function (k) {
        return (r[k] || "").toLowerCase().indexOf(q) !== -1;
      });
    });

    var col = COLUMNS.filter(function (c) { return c.key === sortKey; })[0] || COLUMNS[0];
    list.sort(function (a, b) {
      var av = a[sortKey], bv = b[sortKey];
      if (col.numeric) {
        var an = parseFloat(av), bn = parseFloat(bv);
        if (isNaN(an) && isNaN(bn)) return 0;
        if (isNaN(an)) return 1;
        if (isNaN(bn)) return -1;
        return sortAsc ? an - bn : bn - an;
      }
      return sortAsc ? String(av).localeCompare(String(bv), undefined, { numeric: true })
                     : String(bv).localeCompare(String(av), undefined, { numeric: true });
    });
    return list;
  }

  function render() {
    var list = visibleRows();
    tbody.innerHTML = "";

    list.forEach(function (r) {
      var tr = document.createElement("tr");
      if (r._member) tr.className = "in-sample";

      COLUMNS.forEach(function (col) {
        var td = document.createElement("td");
        if (col.align === "right") td.style.textAlign = "right";

        if (col.render === "coverage") {
          if (r._member) td.appendChild(coverageCell(r, col.arrays));
          else { td.textContent = "—"; td.style.color = "var(--dim)"; }
        } else if (col.render === "sample") {
          td.appendChild(sampleCell(r));
        } else if (col.key === "_time") {
          td.textContent = r._time ? r._time + " min" : "—";
          if (!r._time) td.style.color = "var(--dim)";
        } else {
          td.textContent = r[col.key] ? r[col.key] : "—";
        }
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });

    var members = list.filter(function (r) { return r._member; }).length;
    var hours = list.reduce(function (s, r) { return s + r._time; }, 0) / 60;
    countEl.textContent =
      (list.length === rows.length ? rows.length + " catalogue entries"
                                   : list.length + " of " + rows.length + " entries") +
      " · " + members + " in the legacy sample · " + hours.toFixed(1) + " h on source";
  }

  fetch("data/sources.csv", { cache: "no-store" })
    .then(function (r) {
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.text();
    })
    .then(function (text) {
      rows = parseCSV(text).map(decorate);
      buildHead();
      render();
      search.addEventListener("input", render);
      filter.addEventListener("change", render);
    })
    .catch(function (e) {
      errEl.hidden = false;
      errEl.textContent =
        "Could not load data/sources.csv (" + e.message + "). " +
        "If you are previewing this page by double-clicking the file on your own computer, " +
        "browsers block local file reads — the table will work once the site is on GitHub Pages.";
    });
})();
