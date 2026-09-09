# Graph Report - iforeman-story  (2026-09-09)

## Corpus Check
- 4 files · ~4,980 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 34 nodes · 61 edges · 9 communities (7 shown, 2 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.5)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `86ae9137`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- script.js
- Tiga Kisah dari Babylon
- renderKisah
- iforeman-push.sh
- el
- splitParagraf_
- assembleContent
- getKisah_

## God Nodes (most connected - your core abstractions)
1. `el()` - 7 edges
2. `renderKisah()` - 7 edges
3. `render()` - 7 edges
4. `renderKomentarItem()` - 6 edges
5. `renderBenangMerah()` - 5 edges
6. `assembleContent()` - 5 edges
7. `Tiga Kisah dari Babylon` - 5 edges
8. `renderInline()` - 4 edges
9. `observeAnim()` - 4 edges
10. `ornament()` - 4 edges

## Surprising Connections (you probably didn't know these)
- `renderBenangMerah()` --calls--> `renderInline()`  [EXTRACTED]
  Tiga-Kisah-Babylon/script.js → Tiga-Kisah-Babylon/script.js  _Bridges community 2 → community 4_
- `gagal()` --calls--> `el()`  [EXTRACTED]
  Tiga-Kisah-Babylon/script.js → Tiga-Kisah-Babylon/script.js  _Bridges community 4 → community 0_
- `render()` --calls--> `renderKisah()`  [EXTRACTED]
  Tiga-Kisah-Babylon/script.js → Tiga-Kisah-Babylon/script.js  _Bridges community 2 → community 0_
- `assembleContent()` --calls--> `getKisah_()`  [EXTRACTED]
  apps-script/code.gs.js → apps-script/code.gs.js  _Bridges community 8 → community 7_
- `getKisah_()` --calls--> `splitParagraf_()`  [EXTRACTED]
  apps-script/code.gs.js → apps-script/code.gs.js  _Bridges community 8 → community 6_

## Import Cycles
- None detected.

## Communities (9 total, 2 thin omitted)

### Community 0 - "script.js"
Cohesion: 0.60
Nodes (5): gagal(), initAnimObserver(), muat(), render(), renderNav()

### Community 1 - "Tiga Kisah dari Babylon"
Cohesion: 0.33
Nodes (5): Benang Merah dari Tiga Kisah, Kisah Kedua: Idin, Sang Guru Tua, dan Bel yang Tidak Peduli, Kisah Ketiga: Ur-Nanshe dan Kebun yang Tak Pernah Dilihat, Kisah Pertama: Naran dan Sungai yang Tidak Peduli, Tiga Kisah dari Babylon

### Community 2 - "renderKisah"
Cohesion: 0.60
Nodes (5): formatTimestamp(), handleKomentarSubmit(), renderInline(), renderKisah(), renderKomentarItem()

### Community 4 - "el"
Cohesion: 0.67
Nodes (4): el(), observeAnim(), ornament(), renderBenangMerah()

### Community 6 - "splitParagraf_"
Cohesion: 0.67
Nodes (3): getBenangMerah_(), parseJSON_(), splitParagraf_()

### Community 7 - "assembleContent"
Cohesion: 0.67
Nodes (3): assembleContent(), doGet(), getMeta_()

## Knowledge Gaps
- **5 isolated node(s):** `iforeman-push.sh script`, `Kisah Pertama: Naran dan Sungai yang Tidak Peduli`, `Kisah Kedua: Idin, Sang Guru Tua, dan Bel yang Tidak Peduli`, `Kisah Ketiga: Ur-Nanshe dan Kebun yang Tak Pernah Dilihat`, `Benang Merah dari Tiga Kisah`
  These have ≤1 connection - possible missing edges or undocumented components.
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `render()` connect `script.js` to `renderKisah`, `el`?**
  _High betweenness centrality (0.012) - this node is a cross-community bridge._
- **Why does `el()` connect `el` to `script.js`, `renderKisah`?**
  _High betweenness centrality (0.010) - this node is a cross-community bridge._
- **What connects `iforeman-push.sh script`, `Kisah Pertama: Naran dan Sungai yang Tidak Peduli`, `Kisah Kedua: Idin, Sang Guru Tua, dan Bel yang Tidak Peduli` to the rest of the system?**
  _5 weakly-connected nodes found - possible documentation gaps or missing edges._