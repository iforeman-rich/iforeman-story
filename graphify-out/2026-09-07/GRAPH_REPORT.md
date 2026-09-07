# Graph Report - iforeman-story  (2026-09-07)

## Corpus Check
- 7 files · ~13,013 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 60 nodes · 117 edges · 12 communities (9 shown, 3 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 2 edges (avg confidence: 0.5)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `07c816ba`
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
- onAnyChange
- resolve_content_path
- server.py
- scan_folders
- renderRootEditor

## God Nodes (most connected - your core abstractions)
1. `loadFolder()` - 8 edges
2. `renderRootEditor()` - 7 edges
3. `Handler` - 7 edges
4. `h()` - 6 edges
5. `setStatus()` - 6 edges
6. `onAnyChange()` - 6 edges
7. `resolve_content_path()` - 6 edges
8. `el()` - 5 edges
9. `render()` - 5 edges
10. `renderBenangMerahSection()` - 5 edges

## Surprising Connections (you probably didn't know these)
- `renderRootEditor()` --indirect_call--> `onAnyChange()`  [INFERRED]
  editor.js → editor.js  _Bridges community 12 → community 7_
- `loadFolders()` --calls--> `h()`  [EXTRACTED]
  editor.js → editor.js  _Bridges community 12 → community 2_
- `collectStoryData()` --calls--> `setStatus()`  [EXTRACTED]
  editor.js → editor.js  _Bridges community 2 → community 4_
- `onAnyChange()` --calls--> `refreshForm()`  [EXTRACTED]
  editor.js → editor.js  _Bridges community 2 → community 7_
- `resolve_content_path()` --calls--> `scan_folders()`  [EXTRACTED]
  server.py → server.py  _Bridges community 10 → community 8_

## Import Cycles
- None detected.

## Communities (12 total, 3 thin omitted)

### Community 0 - "script.js"
Cohesion: 0.47
Nodes (9): bacaInline(), el(), gagal(), muat(), ornament(), render(), renderBenangMerah(), renderInline() (+1 more)

### Community 1 - "Tiga Kisah dari Babylon"
Cohesion: 0.33
Nodes (5): Benang Merah dari Tiga Kisah, Kisah Kedua: Idin, Sang Guru Tua, dan Bel yang Tidak Peduli, Kisah Ketiga: Ur-Nanshe dan Kebun yang Tak Pernah Dilihat, Kisah Pertama: Naran dan Sungai yang Tidak Peduli, Tiga Kisah dari Babylon

### Community 2 - "loadFolder"
Cohesion: 0.53
Nodes (6): apiGet(), loadFolder(), loadFolders(), refreshForm(), setStatus(), statusDefault()

### Community 4 - "editor.js"
Cohesion: 0.60
Nodes (5): apiPost(), collectStoryData(), onSave(), parseErrorResponse(), readParagrafListFromDom()

### Community 6 - "sync_inline_script"
Cohesion: 0.67
Nodes (3): _index_html_path(), Update inline <script id=\"content-data\"> di index.html jika ada. - Jika…, sync_inline_script()

### Community 7 - "onAnyChange"
Cohesion: 0.50
Nodes (4): applyParagrafAction(), attachKisahDelegation(), attachParagrafDelegation(), onAnyChange()

### Community 8 - "resolve_content_path"
Cohesion: 0.50
Nodes (4): is_safe_folder_name(), Nama folder aman: non-kosong, bukan '.'/'..', tanpa separator path., Kembalikan path absolut <folder>/content.json, atau None kalau folder invalid /…, resolve_content_path()

### Community 9 - "server.py"
Cohesion: 0.67
Nodes (3): find_free_port(), json_bytes(), main()

### Community 12 - "renderRootEditor"
Cohesion: 0.80
Nodes (5): h(), renderBenangMerahSection(), renderKisahList(), renderParagrafList(), renderRootEditor()

## Knowledge Gaps
- **5 isolated node(s):** `iforeman-push.sh script`, `Kisah Pertama: Naran dan Sungai yang Tidak Peduli`, `Kisah Kedua: Idin, Sang Guru Tua, dan Bel yang Tidak Peduli`, `Kisah Ketiga: Ur-Nanshe dan Kebun yang Tak Pernah Dilihat`, `Benang Merah dari Tiga Kisah`
  These have ≤1 connection - possible missing edges or undocumented components.
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Handler` connect `Handler` to `resolve_content_path`, `server.py`?**
  _High betweenness centrality (0.028) - this node is a cross-community bridge._
- **Why does `sync_inline_script()` connect `sync_inline_script` to `resolve_content_path`, `server.py`?**
  _High betweenness centrality (0.019) - this node is a cross-community bridge._
- **Why does `resolve_content_path()` connect `resolve_content_path` to `server.py`, `scan_folders`, `Handler`?**
  _High betweenness centrality (0.015) - this node is a cross-community bridge._
- **What connects `iforeman-push.sh script`, `Kisah Pertama: Naran dan Sungai yang Tidak Peduli`, `Kisah Kedua: Idin, Sang Guru Tua, dan Bel yang Tidak Peduli` to the rest of the system?**
  _5 weakly-connected nodes found - possible documentation gaps or missing edges._