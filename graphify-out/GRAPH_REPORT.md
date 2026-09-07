# Graph Report - iforeman-story  (2026-09-07)

## Corpus Check
- 8 files · ~11,655 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 76 nodes · 122 edges · 11 communities (6 shown, 5 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.5)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `906c8445`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- script.js
- Tiga Kisah dari Babylon
- StoryBrowserWindow
- iforeman-push.sh
- path_utils.py
- StorySaverWindow
- sync_inline_script
- ._render_form
- ._render_paragraf_list
- ._add_field
- ._add_benang_section

## God Nodes (most connected - your core abstractions)
1. `StorySaverWindow` - 23 edges
2. `StoryBrowserWindow` - 13 edges
3. `el()` - 5 edges
4. `render()` - 5 edges
5. `scan_folders()` - 5 edges
6. `sync_inline_script()` - 5 edges
7. `Tiga Kisah dari Babylon` - 5 edges
8. `renderKisah()` - 4 edges
9. `renderBenangMerah()` - 4 edges
10. `muat()` - 4 edges

## Surprising Connections (you probably didn't know these)
- `StoryBrowserWindow` --uses--> `StorySaverWindow`  [INFERRED]
  story_browser.py → story_saver.py

## Import Cycles
- None detected.

## Communities (11 total, 5 thin omitted)

### Community 0 - "script.js"
Cohesion: 0.47
Nodes (9): bacaInline(), el(), gagal(), muat(), ornament(), render(), renderBenangMerah(), renderInline() (+1 more)

### Community 1 - "Tiga Kisah dari Babylon"
Cohesion: 0.33
Nodes (5): Benang Merah dari Tiga Kisah, Kisah Kedua: Idin, Sang Guru Tua, dan Bel yang Tidak Peduli, Kisah Ketiga: Ur-Nanshe dan Kebun yang Tak Pernah Dilihat, Kisah Pertama: Naran dan Sungai yang Tidak Peduli, Tiga Kisah dari Babylon

### Community 2 - "StoryBrowserWindow"
Cohesion: 0.22
Nodes (5): Tampilkan folder yang cocok dengan filter ke dalam listbox., Kembalikan ringkasan singkat: '3 kisah, 12 paragraf'., Window utama: daftar cerita + search + edit., Scan folders di background thread supaya UI tidak freeze., StoryBrowserWindow

### Community 4 - "path_utils.py"
Cohesion: 0.27
Nodes (9): get_folder_path(), is_safe_folder_name(), Subfolder LANGSUNG di dalam root ini yang berisi content.json., Nama folder aman: non-kosong, bukan '.'/'..', tanpa separator path., Kembalikan path absolut <folder>/content.json, atau None kalau folder invalid /…, Kembalikan path absolut ke folder, atau None kalau invalid., resolve_content_path(), scan_folders() (+1 more)

### Community 5 - "StorySaverWindow"
Cohesion: 0.32
Nodes (3): Window edit satu cerita., Load content.json ke self.data., StorySaverWindow

### Community 6 - "sync_inline_script"
Cohesion: 0.22
Nodes (6): main(), Standalone test: edit Tiga-Kisah-Babylon., Tulis self.data balik ke content.json, lalu sync inline script., _index_html_path(), Update inline <script id=\"content-data\"> di index.html jika ada. SAFETY:…, sync_inline_script()

## Knowledge Gaps
- **5 isolated node(s):** `iforeman-push.sh script`, `Kisah Pertama: Naran dan Sungai yang Tidak Peduli`, `Kisah Kedua: Idin, Sang Guru Tua, dan Bel yang Tidak Peduli`, `Kisah Ketiga: Ur-Nanshe dan Kebun yang Tak Pernah Dilihat`, `Benang Merah dari Tiga Kisah`
  These have ≤1 connection - possible missing edges or undocumented components.
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `StorySaverWindow` connect `StorySaverWindow` to `StoryBrowserWindow`, `path_utils.py`, `sync_inline_script`, `._render_form`, `._render_paragraf_list`, `._add_field`, `._add_benang_section`?**
  _High betweenness centrality (0.395) - this node is a cross-community bridge._
- **Why does `StoryBrowserWindow` connect `StoryBrowserWindow` to `path_utils.py`, `StorySaverWindow`?**
  _High betweenness centrality (0.211) - this node is a cross-community bridge._
- **What connects `iforeman-push.sh script`, `Kisah Pertama: Naran dan Sungai yang Tidak Peduli`, `Kisah Kedua: Idin, Sang Guru Tua, dan Bel yang Tidak Peduli` to the rest of the system?**
  _5 weakly-connected nodes found - possible documentation gaps or missing edges._