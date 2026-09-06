# Graph Report - iforeman-story  (2026-09-06)

## Corpus Check
- 4 files · ~8,940 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 18 nodes · 27 edges · 4 communities (3 shown, 1 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `353523ea`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- el
- Tiga Kisah dari Babylon
- script.js
- iforeman-push.sh

## God Nodes (most connected - your core abstractions)
1. `el()` - 5 edges
2. `render()` - 5 edges
3. `Tiga Kisah dari Babylon` - 5 edges
4. `renderKisah()` - 4 edges
5. `renderBenangMerah()` - 4 edges
6. `muat()` - 4 edges
7. `renderInline()` - 3 edges
8. `ornament()` - 3 edges
9. `gagal()` - 3 edges
10. `bacaInline()` - 2 edges

## Surprising Connections (you probably didn't know these)
- `gagal()` --calls--> `el()`  [EXTRACTED]
  Tiga-Kisah-Babylon/script.js → Tiga-Kisah-Babylon/script.js  _Bridges community 0 → community 2_

## Import Cycles
- None detected.

## Communities (4 total, 1 thin omitted)

### Community 0 - "el"
Cohesion: 0.53
Nodes (6): el(), ornament(), render(), renderBenangMerah(), renderInline(), renderKisah()

### Community 1 - "Tiga Kisah dari Babylon"
Cohesion: 0.33
Nodes (5): Benang Merah dari Tiga Kisah, Kisah Kedua: Idin, Sang Guru Tua, dan Bel yang Tidak Peduli, Kisah Ketiga: Ur-Nanshe dan Kebun yang Tak Pernah Dilihat, Kisah Pertama: Naran dan Sungai yang Tidak Peduli, Tiga Kisah dari Babylon

### Community 2 - "script.js"
Cohesion: 0.83
Nodes (3): bacaInline(), gagal(), muat()

## Knowledge Gaps
- **5 isolated node(s):** `iforeman-push.sh script`, `Kisah Pertama: Naran dan Sungai yang Tidak Peduli`, `Kisah Kedua: Idin, Sang Guru Tua, dan Bel yang Tidak Peduli`, `Kisah Ketiga: Ur-Nanshe dan Kebun yang Tak Pernah Dilihat`, `Benang Merah dari Tiga Kisah`
  These have ≤1 connection - possible missing edges or undocumented components.
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `el()` connect `el` to `script.js`?**
  _High betweenness centrality (0.018) - this node is a cross-community bridge._
- **Why does `render()` connect `el` to `script.js`?**
  _High betweenness centrality (0.018) - this node is a cross-community bridge._
- **What connects `iforeman-push.sh script`, `Kisah Pertama: Naran dan Sungai yang Tidak Peduli`, `Kisah Kedua: Idin, Sang Guru Tua, dan Bel yang Tidak Peduli` to the rest of the system?**
  _5 weakly-connected nodes found - possible documentation gaps or missing edges._