# Graph Report - iforeman-story  (2026-09-08)

## Corpus Check
- 9 files · ~12,900 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 92 nodes · 150 edges · 9 communities (8 shown, 1 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.5)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `0da09737`
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
- code.gs.js
- story_saver.py

## God Nodes (most connected - your core abstractions)
1. `StorySaverWindow` - 23 edges
2. `StoryBrowserWindow` - 13 edges
3. `el()` - 5 edges
4. `render()` - 5 edges
5. `assembleContent()` - 5 edges
6. `scan_folders()` - 5 edges
7. `sync_inline_script()` - 5 edges
8. `Tiga Kisah dari Babylon` - 5 edges
9. `renderKisah()` - 4 edges
10. `renderBenangMerah()` - 4 edges

## Surprising Connections (you probably didn't know these)
- `StoryBrowserWindow` --uses--> `StorySaverWindow`  [INFERRED]
  story_browser.py → story_saver.py

## Import Cycles
- None detected.

## Communities (9 total, 1 thin omitted)

### Community 0 - "script.js"
Cohesion: 0.47
Nodes (9): bacaInline(), el(), gagal(), muat(), ornament(), render(), renderBenangMerah(), renderInline() (+1 more)

### Community 1 - "Tiga Kisah dari Babylon"
Cohesion: 0.33
Nodes (5): Benang Merah dari Tiga Kisah, Kisah Kedua: Idin, Sang Guru Tua, dan Bel yang Tidak Peduli, Kisah Ketiga: Ur-Nanshe dan Kebun yang Tak Pernah Dilihat, Kisah Pertama: Naran dan Sungai yang Tidak Peduli, Tiga Kisah dari Babylon

### Community 2 - "StoryBrowserWindow"
Cohesion: 0.19
Nodes (7): _apply_theme(), Window utama: daftar cerita + search + edit., Scan folders di background thread supaya UI tidak freeze., Tampilkan folder yang cocok dengan filter ke dalam listbox., Kembalikan ringkasan singkat: '3 kisah, 12 paragraf'., Apply dark OLED theme using clam base + manual overrides., StoryBrowserWindow

### Community 4 - "path_utils.py"
Cohesion: 0.27
Nodes (9): get_folder_path(), is_safe_folder_name(), Subfolder LANGSUNG di dalam root ini yang berisi content.json., Nama folder aman: non-kosong, bukan '.'/'..', tanpa separator path., Kembalikan path absolut <folder>/content.json, atau None kalau folder invalid /…, Kembalikan path absolut ke folder, atau None kalau invalid., resolve_content_path(), scan_folders() (+1 more)

### Community 5 - "StorySaverWindow"
Cohesion: 0.16
Nodes (8): Window edit satu cerita., Load content.json ke self.data., Render seluruh form dari self.data., Add a simple text field bound to self.data[key]., Add a kisah card: id + judul + paragraf list + penutup., Render paragraf list di dalam container. Setiap paragraf punya teks (Text…, Add benang merah section: judul + paragraf list., StorySaverWindow

### Community 6 - "sync_inline_script"
Cohesion: 0.33
Nodes (4): Tulis self.data balik ke content.json, lalu sync inline script., _index_html_path(), Update inline <script id=\"content-data\"> di index.html jika ada. SAFETY:…, sync_inline_script()

### Community 7 - "code.gs.js"
Cohesion: 0.46
Nodes (6): assembleContent(), doGet(), getBenangMerah_(), getKisah_(), getMeta_(), parseJSON_()

### Community 10 - "story_saver.py"
Cohesion: 0.22
Nodes (8): _apply_theme(), _auto_resize_text(), main(), Resize Text widget height to fit content, minimum min_height lines., Apply dark styling to a native tk.Text widget., Apply dark OLED theme using clam base + manual overrides., Standalone test: edit Tiga-Kisah-Babylon., _style_text_widget()

## Knowledge Gaps
- **5 isolated node(s):** `iforeman-push.sh script`, `Kisah Pertama: Naran dan Sungai yang Tidak Peduli`, `Kisah Kedua: Idin, Sang Guru Tua, dan Bel yang Tidak Peduli`, `Kisah Ketiga: Ur-Nanshe dan Kebun yang Tak Pernah Dilihat`, `Benang Merah dari Tiga Kisah`
  These have ≤1 connection - possible missing edges or undocumented components.
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `StorySaverWindow` connect `StorySaverWindow` to `StoryBrowserWindow`, `story_saver.py`, `path_utils.py`, `sync_inline_script`?**
  _High betweenness centrality (0.319) - this node is a cross-community bridge._
- **Why does `StoryBrowserWindow` connect `StoryBrowserWindow` to `path_utils.py`, `StorySaverWindow`?**
  _High betweenness centrality (0.162) - this node is a cross-community bridge._
- **Why does `sync_inline_script()` connect `sync_inline_script` to `story_saver.py`?**
  _High betweenness centrality (0.048) - this node is a cross-community bridge._
- **What connects `iforeman-push.sh script`, `Kisah Pertama: Naran dan Sungai yang Tidak Peduli`, `Kisah Kedua: Idin, Sang Guru Tua, dan Bel yang Tidak Peduli` to the rest of the system?**
  _5 weakly-connected nodes found - possible documentation gaps or missing edges._