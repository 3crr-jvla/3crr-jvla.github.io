/* ============================================================
   Renders data/sources.csv into the sample table.
   You should not need to edit this file — edit data/sources.csv instead.
   ============================================================ */

(function () {
  "use strict";

  var COLUMNS = [
    { key: "name",        label: "Source" },
    { key: "iau_name",    label: "IAU name" },
    { key: "ra_j2000",    label: "RA (J2000)" },
    { key: "dec_j2000",   label: "Dec (J2000)" },
    { key: "z",           label: "z",            numeric: true },
    { key: "size_arcsec", label: "Size (″)",     numeric: true },
    { key: "fr_class",    label: "FR" },
    { key: "arrays",      label: "Arrays" },
    { key: "status",      label: "Status" },
    { key: "notes",       label: "Notes" }
  ];

  var tbody   = document.getElementById("source-rows");
  var thead   = document.getElementById("source-head");
  var search  = document.getElementById("search");
  var statusF = document.getElementById("status-filter");
  var countEl = document.getElementById("count");
  var errEl   = document.getElementById("table-error");

  var rows = [];
  var sortKey = "name";
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

  function buildHead() {
    thead.innerHTML = "";
    COLUMNS.forEach(function (col) {
      var th = document.createElement("th");
      th.textContent = col.label;
      th.style.cursor = "pointer";
      th.title = "Click to sort";
      if (col.key === sortKey) th.textContent += sortAsc ? "  ▲" : "  ▼";
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
    var s = statusF.value;

    var list = rows.filter(function (r) {
      if (s && r.status !== s) return false;
      if (!q) return true;
      return COLUMNS.some(function (col) {
        return (r[col.key] || "").toLowerCase().indexOf(q) !== -1;
      });
    });

    var col = COLUMNS.filter(function (c) { return c.key === sortKey; })[0] || COLUMNS[0];
    list.sort(function (a, b) {
      var av = a[sortKey] || "", bv = b[sortKey] || "";
      if (col.numeric) {
        var an = parseFloat(av), bn = parseFloat(bv);
        if (isNaN(an) && isNaN(bn)) return 0;
        if (isNaN(an)) return 1;
        if (isNaN(bn)) return -1;
        return sortAsc ? an - bn : bn - an;
      }
      return sortAsc ? av.localeCompare(bv, undefined, { numeric: true })
                     : bv.localeCompare(av, undefined, { numeric: true });
    });
    return list;
  }

  function render() {
    var list = visibleRows();
    tbody.innerHTML = "";

    list.forEach(function (r) {
      var tr = document.createElement("tr");
      COLUMNS.forEach(function (col) {
        var td = document.createElement("td");
        td.textContent = r[col.key] ? r[col.key] : "—";
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });

    countEl.textContent = list.length === rows.length
      ? rows.length + " sources"
      : list.length + " of " + rows.length + " sources";
  }

  function fillStatusFilter() {
    var seen = {};
    rows.forEach(function (r) { if (r.status) seen[r.status] = true; });
    Object.keys(seen).sort().forEach(function (s) {
      var o = document.createElement("option");
      o.value = s; o.textContent = s;
      statusF.appendChild(o);
    });
  }

  fetch("data/sources.csv", { cache: "no-store" })
    .then(function (r) {
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.text();
    })
    .then(function (text) {
      rows = parseCSV(text);
      fillStatusFilter();
      buildHead();
      render();
      search.addEventListener("input", render);
      statusF.addEventListener("change", render);
    })
    .catch(function (e) {
      errEl.hidden = false;
      errEl.textContent =
        "Could not load data/sources.csv (" + e.message + "). " +
        "If you are previewing this page by double-clicking the file on your own computer, " +
        "browsers block local file reads — the table will work once the site is on GitHub Pages.";
    });
})();
