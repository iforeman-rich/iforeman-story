# Graph Report - iforeman-story  (2026-09-06)

## Corpus Check
- 7 files · ~12,567 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 64 nodes · 122 edges · 10 communities (7 shown, 3 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `8c5e0ac3`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- script.js
- Tiga Kisah dari Babylon
- loadFolder
- iforeman-push.sh
- editor.js
- Handler
- sync_inline_script
- resolve_content_path
- server.py
- scan_folders

## God Nodes (most connected - your core abstractions)
1. `h()` - 7 edges
2. `buildControl()` - 7 edges
3. `buildArrayEditor()` - 7 edges
4. `Handler` - 7 edges
5. `buildArrayItem()` - 6 edges
6. `resolve_content_path()` - 6 edges
7. `el()` - 5 edges
8. `render()` - 5 edges
9. `renderField()` - 5 edges
10. `buildObjectEditor()` - 5 edges

## Surprising Connections (you probably didn't know these)
- `loadFolders()` --calls--> `h()`  [EXTRACTED]
  editor.js → editor.js  _Bridges community 4 → community 2_
- `resolve_content_path()` --calls--> `scan_folders()`  [EXTRACTED]
  server.py → server.py  _Bridges community 10 → community 8_

## Import Cycles
- None detected.

## Communities (10 total, 3 thin omitted)

### Community 0 - "script.js"
Cohesion: 0.47
Nodes (9): bacaInline(), el(), gagal(), muat(), ornament(), render(), renderBenangMerah(), renderInline() (+1 more)

### Community 1 - "Tiga Kisah dari Babylon"
Cohesion: 0.33
Nodes (5): Benang Merah dari Tiga Kisah, Kisah Kedua: Idin, Sang Guru Tua, dan Bel yang Tidak Peduli, Kisah Ketiga: Ur-Nanshe dan Kebun yang Tak Pernah Dilihat, Kisah Pertama: Naran dan Sungai yang Tidak Peduli, Tiga Kisah dari Babylon

### Community 2 - "loadFolder"
Cohesion: 0.31
Nodes (9): apiGet(), apiPost(), collectValue(), loadFolder(), loadFolders(), onSave(), parseErrorResponse(), readScalar() (+1 more)

### Community 4 - "editor.js"
Cohesion: 0.31
Nodes (14): blankValueOf(), buildArrayEditor(), buildArrayItem(), buildControl(), buildObjectEditor(), describeType(), h(), isLongString() (+6 more)

### Community 6 - "sync_inline_script"
Cohesion: 0.67
Nodes (3): _index_html_path(), Update inline <script id=\"content-data\"> di index.html jika ada. - Jika…, sync_inline_script()

### Community 8 - "resolve_content_path"
Cohesion: 0.50
Nodes (4): is_safe_folder_name(), Nama folder aman: non-kosong, bukan '.'/'..', tanpa separator path., Kembalikan path absolut <folder>/content.json, atau None kalau folder invalid /…, resolve_content_path()

### Community 9 - "server.py"
Cohesion: 0.67
Nodes (3): find_free_port(), json_bytes(), main()

## Knowledge Gaps
- **5 isolated node(s):** `iforeman-push.sh script`, `Kisah Pertama: Naran dan Sungai yang Tidak Peduli`, `Kisah Kedua: Idin, Sang Guru Tua, dan Bel yang Tidak Peduli`, `Kisah Ketiga: Ur-Nanshe dan Kebun yang Tak Pernah Dilihat`, `Benang Merah dari Tiga Kisah`
  These have ≤1 connection - possible missing edges or undocumented components.
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Handler` connect `Handler` to `resolve_content_path`, `server.py`?**
  _High betweenness centrality (0.025) - this node is a cross-community bridge._
- **Why does `sync_inline_script()` connect `sync_inline_script` to `resolve_content_path`, `server.py`?**
  _High betweenness centrality (0.016) - this node is a cross-community bridge._
- **Why does `resolve_content_path()` connect `resolve_content_path` to `server.py`, `scan_folders`, `Handler`?**
  _High betweenness centrality (0.013) - this node is a cross-community bridge._
- **What connects `iforeman-push.sh script`, `Kisah Pertama: Naran dan Sungai yang Tidak Peduli`, `Kisah Kedua: Idin, Sang Guru Tua, dan Bel yang Tidak Peduli` to the rest of the system?**
  _5 weakly-connected nodes found - possible documentation gaps or missing edges._