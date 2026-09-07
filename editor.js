/* ============================================================
   editor.js — Form khusus untuk edit content.json (Tiga Kisah)
   ------------------------------------------------------------
   - Tanpa library eksternal. Vanilla JS, offline-safe.
   - Schema content.json (tetap ketat, WAJIB identik saat disimpan):
       { judul: string, subjudul: string,
         kisah: [{ id, judul, paragraf: string[], paragrafPenutup: string }],
         benangMerah: { judul: string, paragraf: string[] } }
   - Dua komponen repeater:
       1) list paragraf  (dipakai di kisah dan benangMerah)
       2) list kisah     (level atas)
   - Field fix judul/subjudul: input teks biasa.
   - Interaksi repeater: tambah di akhir + hapus + naik/turun.
     Tidak ada tombol sisip-di-tengah/gap-button.
   - Event delegation: satu listener di container parent,
     membaca data-index/data-action dari elemen yang diklik.
   ============================================================ */

(function () {
  "use strict";

  // ---- elemen utama ---------------------------------------------------
  var selectEl   = document.getElementById("folder-select");
  var saveBtn    = document.getElementById("save-btn");
  var statusEl   = document.getElementById("status");
  var formArea   = document.getElementById("form-area");

  var folders      = [];
  var currentFolder = null;

  // ---- utilitas kecil -------------------------------------------------

  function h(tag, className, text) {
    var el = document.createElement(tag);
    if (className) el.className = className;
    if (text !== undefined && text !== null) el.textContent = text;
    return el;
  }

  function setStatus(msg, kind) {
    statusEl.textContent = msg || "";
    statusEl.className = "status" + (kind ? " " + kind : "");
  }

  // ---- render list paragraf -------------------------------------------

  // containerEl    : elemen yang nanti di dalamnya ada textarea list
  // paragrafArr    : array string (content.json.paragraf atau benangMerah.paragraf)
  // onChange       : dipanggil sesudah list berubah (setelah hapus/tambah/nav)
  //
  // Struktur DOM hasil render:
  //   <div class="paragraf-list">
  //     <div class="paragraf-item" data-index="0">
  //       <textarea class="paragraf-text">...</textarea>
  //       <div class="paragraf-actions">
  //         <button class="paragraf-move" data-action="up">↑</button>
  //         <button class="paragraf-move" data-action="down">↓</button>
  //         <button class="paragraf-remove" data-action="remove">Hapus</button>
  //       </div>
  //     </div>
  //     ...
  //     <button class="paragraf-add">+ Tambah paragraf</button>
  //   </div>
  //    // Sesuai desain: tidak ada elemen spacing antar-item.
  function renderParagrafList(containerEl, paragrafArr, onChange) {
    containerEl.textContent = "";

    var list = h("div", "paragraf-list");
    list.dataset.kind = "paragraf";
    list.dataset.action = "none";

    paragrafArr.forEach(function (teks, idx) {
      var item = h("div", "paragraf-item");
      item.dataset.index = String(idx);

      var textarea = h("textarea", "paragraf-text");
      textarea.rows = 2;
      textarea.value = teks || "";
      textarea.placeholder = "Paragraf " + (idx + 1) + "…";
      item.appendChild(textarea);

      var actions = h("div", "paragraf-actions");
      var upBtn    = h("button", "paragraf-move paragraf-move-up", "↑");
      upBtn.type   = "button";
      upBtn.dataset.action = "up";
      upBtn.dataset.index  = String(idx);

      var downBtn  = h("button", "paragraf-move paragraf-move-down", "↓");
      downBtn.type = "button";
      downBtn.dataset.action = "down";
      downBtn.dataset.index  = String(idx);

      var removeBtn = h("button", "paragraf-remove", "Hapus");
      removeBtn.type = "button";
      removeBtn.dataset.action = "remove";
      removeBtn.dataset.index  = String(idx);

      actions.appendChild(upBtn);
      actions.appendChild(downBtn);
      actions.appendChild(removeBtn);
      item.appendChild(actions);

      list.appendChild(item);
    });

    var addBtn = h("button", "paragraf-add", "+ Tambah paragraf");
    addBtn.type = "button";
    addBtn.dataset.action = "add";
    list.appendChild(addBtn);

    containerEl.appendChild(list);
  }

  // Handler aksi pada list paragraf.
  // Dipanggil dari onParagrafAction (event delegation).
  // `arr` dikirim dari luar agar selalu versi terbaru yang ada di memori —
  // tidak dibaca dari DOM, jadi tidak ada bug closure/in- stale index.
  function applyParagrafAction(arr, action, index) {
    if (action === "add") {
      arr.push("");
      return true; // indikasi re-render
    }

    if (isNaN(index) || index < 0 || index >= arr.length) return false;

    if (action === "remove") {
      arr.splice(index, 1);
      return true;
    }

    if (action === "up" && index > 0) {
      var tmp      = arr[index - 1];
      arr[index - 1] = arr[index];
      arr[index]    = tmp;
      return true;
    }

    if (action === "down" && index < arr.length - 1) {
      var tmp      = arr[index + 1];
      arr[index + 1] = arr[index];
      arr[index]    = tmp;
      return true;
    }

    return false;
  }

  // ---- render list kisah ----------------------------------------------

  // Struktur DOM hasil render:
  //   <div class="kisah-list">
  //     <div class="kisah-card" data-index="0">
  //       <div class="kisah-card-head">
  //         <span class="kisah-card-num">#1</span>
  //         <button class="kisah-move" data-action="up">↑</button>
  //         <button class="kisah-move" data-action="down">↓</button>
  //         <button class="kisah-remove" data-action="remove">Hapus</button>
  //       </div>
  //       <input class="kisah-id" data-field="id">
  //       <input class="kisah-judul" data-field="judul">
  //       <div class="kisah-paragraf-wrap">
  //         (renderParagrafList di dalamnya)
  //       </div>
  //       <textarea class="kisah-penutup" data-field="paragrafPenutup">...</textarea>
  //     </div>
  //     ...
  //     <button class="kisah-add">+ Tambah kisah</button>
  //   </div>
  //
  // Perhatikan:
  //   - `paragrafListEl` untuk tiap card disimpan di dataset card supaya
  //     saat card di-render ulang dari array memori, paragraf rendering juga
  //     tetap dibaca dari array memori yang sama, tidak dari DOM lama.
  function renderKisahList(containerEl, kisahArr, onChange) {
    containerEl.textContent = "";

    var list = h("div", "kisah-list");
    list.dataset.kind = "kisah";
    list.dataset.action = "none";

    kisahArr.forEach(function (kisah, idx) {
      var card = h("div", "kisah-card");
      card.dataset.index = String(idx);

      // header: no + tombol nav/hapus
      var head = h("div", "kisah-card-head");
      head.appendChild(h("span", "kisah-card-num", "#" + (idx + 1)));

      var upBtn     = h("button", "kisah-move kisah-move-up", "↑");
      upBtn.type    = "button";
      upBtn.dataset.action = "up";
      upBtn.dataset.index  = String(idx);

      var downBtn   = h("button", "kisah-move kisah-move-down", "↓");
      downBtn.type  = "button";
      downBtn.dataset.action = "down";
      downBtn.dataset.index  = String(idx);

      var removeBtn = h("button", "kisah-remove", "Hapus");
      removeBtn.type = "button";
      removeBtn.dataset.action = "remove";
      removeBtn.dataset.index  = String(idx);

      head.appendChild(upBtn);
      head.appendChild(downBtn);
      head.appendChild(removeBtn);
      card.appendChild(head);

      // id + judul: layout sejajar (id sempit, judul lebar)
      var idRow = h("div", "kisah-id-row");

      var idCol = h("div", "kisah-id-col");
      var idInput = h("input", "kisah-id");
      idInput.type = "text";
      idInput.value = kisah.id || "";
      idInput.placeholder = "naran (mis., ur-nanshe)";
      idInput.dataset.field = "id";
      idCol.appendChild(idInput);
      idRow.appendChild(idCol);

      var judulCol = h("div", "kisah-judul-col");
      var judulInput = h("input", "kisah-judul");
      judulInput.type = "text";
      judulInput.value = kisah.judul || "";
      judulInput.placeholder = "Judul kisah";
      judulInput.dataset.field = "judul";
      judulCol.appendChild(judulInput);
      idRow.appendChild(judulCol);

      card.appendChild(idRow);

      // paragraf — komponen list di dalamnya
      var paragrafWrap = h("div", "kisah-paragraf-wrap");
      renderParagrafList(paragrafWrap, kisah.paragraf || [], onChange);
      card.appendChild(paragrafWrap);

      // paragrafPenutup
      var penutupInput = h("textarea", "kisah-penutup kisah-penutup-text");
      penutupInput.rows = 2;
      penutupInput.value = kisah.paragrafPenutup || "";
      penutupInput.placeholder = "Penutup (opsional)";
      penutupInput.dataset.field = "paragrafPenutup";
      card.appendChild(penutupInput);

      list.appendChild(card);
    });

    var addBtn = h("button", "kisah-add", "+ Tambah kisah");
    addBtn.type = "button";
    addBtn.dataset.action = "add";
    list.appendChild(addBtn);

    containerEl.appendChild(list);
  }

  // ---- serialize ke objek sesuai schema content.json ------------------

  // Baca seluruh paragraf dari list DOM tertentu (dibaca fresh tiap saat
  // serialize, bukan disimpan di closure).
  function readParagrafListFromDom(listEl) {
    var arr = [];
    var items = listEl.querySelectorAll(":scope > .paragraf-item");
    items.forEach(function (item) {
      var ta = item.querySelector(".paragraf-text");
      arr.push(ta ? (ta.value || "") : "");
    });
    return arr;
  }

  // Bangun objek JSON akhir dari form.
  // Ini fungsi dedicat — tidak rekursif, tidak generic.
  function collectStoryData(rootEditor) {
    // rootEditor : elemen class "story-root" yang di-render oleh renderRootEditor()
    var judul = "";
    var subjudul = "";
    var kisah = [];
    var benangJudul = "";
    var benangParagraf = [];

    // judul / subjudul
    var judulInput = rootEditor.querySelector(".story-judul-input");
    if (judulInput) judul = judulInput.value || "";
    var subjudulInput = rootEditor.querySelector(".story-subjudul-input");
    if (subjudulInput) subjudul = subjudulInput.value || "";

    // kisah
    var cards = rootEditor.querySelectorAll(":scope > .kisah-list > .kisah-card");
    cards.forEach(function (card) {
      var idVal      = (card.querySelector(".kisah-id").value || "").trim();
      var judulVal   = (card.querySelector(".kisah-judul").value || "");
      var penutupVal = (card.querySelector(".kisah-penutup-text").value || "");

      var paragrafWrap = card.querySelector(".kisah-paragraf-wrap");
      var paragrafArr  = paragrafWrap
        ? readParagrafListFromDom(paragrafWrap.querySelector(".paragraf-list"))
        : [];

      var useId = idVal || null;

      // Guard ringan: jika id kosong/duplikat dan user memasukkan
      // id standar nanti (mis. idin, ururu, naran), tetap selesai.
      kisah.push({
        id: idVal,
        judul: judulVal,
        paragraf: paragrafArr,
        paragrafPenutup: penutupVal
      });
    });

    // Validasi ringan: jika ada id kosong/duplikat, beri hint di status
    // sebelum simpan — bukan block. Keputusan final ada di tangan user.
    if (kisah.length) {
      var usedIds = Object.create(null);
      var emptyCount = 0;
      kisah.forEach(function (k) {
        if (!k.id) {
          emptyCount += 1;
          return;
        }
        if (usedIds[k.id]) {
          // duplikat tercatat; tidak perlu lanjut hitung
          return;
        }
        usedIds[k.id] = true;
      });
      if (emptyCount || Object.keys(usedIds).length !== kisah.length) {
        var warningParts = [];
        if (emptyCount) warningParts.push(emptyCount + " kisah tanpa id");
        if (Object.keys(usedIds).length !== kisah.length) {
          warningParts.push("id duplikat");
        }
        setStatus(
          "Hati-hati: " + warningParts.join(", ") + ". " +
          "Jika mau, beri id unik sebelum simpan — nanti halaman baca pakai id sebagai anchor elemen.",
          ""
        );
      }
    }

    // benang merah
    var benangWrap = rootEditor.querySelector(".story-benang-wrap");
    if (benangWrap) {
      var benangList = benangWrap.querySelector(".paragraf-list");
      benangParagraf = benangList ? readParagrafListFromDom(benangList) : [];
      var benangJudulInput = benangWrap.querySelector(".benang-judul-input");
      benangJudul = benangJudulInput ? (benangJudulInput.value || "") : "";
    }

    return {
      judul: judul,
      subjudul: subjudul,
      kisah: kisah,
      benangMerah: {
        judul: benangJudul,
        paragraf: benangParagraf
      }
    };
  }

  // ---- render form root -----------------------------------------------

  function renderRootEditor(data) {
    formArea.textContent = "";

    var root = h("div", "story-root");
    root.dataset.kind = "story";

    // judul
    var judulRow = h("div", "story-field");
    var judulLabel = h("label", "story-field-label", "Judul");
    var judulInput = h("input", "story-judul-input");
    judulInput.type = "text";
    judulInput.value = data.judul || "";
    judulInput.placeholder = "Judul cerita";
    judulRow.appendChild(judulLabel);
    judulRow.appendChild(judulInput);
    root.appendChild(judulRow);

    // subjudul
    var subRow = h("div", "story-field");
    var subLabel = h("label", "story-field-label", "Subjudul");
    var subInput = h("input", "story-subjudul-input");
    subInput.type = "text";
    subInput.value = data.subjudul || "";
    subInput.placeholder = "Subjudul (mis. tema)";
    subRow.appendChild(subLabel);
    subRow.appendChild(subInput);
    root.appendChild(subRow);

    // list kisah
    var kisahSection = h("div", "story-section");
    var kisahLabel = h("div", "story-section-label", "Kisah (daftar)");
    kisahSection.appendChild(kisahLabel);
    renderKisahList(kisahSection, data.kisah || [], onAnyChange);
    root.appendChild(kisahSection);

    // benang merah — blok fixed
    var benangSection = h("div", "story-section");
    var benangLabel = h("div", "story-section-label", "Benang Merah");
    benangSection.appendChild(benangLabel);
    renderBenangMerahSection(benangSection, data.benangMerah || {});
    root.appendChild(benangSection);

    formArea.appendChild(root);
  }

  function renderBenangMerahSection(containerEl, benang) {
    containerEl.textContent = "";

    var judulRow = h("div", "story-field");
    var judulLabel = h("label", "story-field-label", "Judul benang merah");
    var judulInput = h("input", "benang-judul-input");
    judulInput.type = "text";
    judulInput.value = benang.judul || "";
    judulInput.placeholder = "Judul benang merah";
    judulRow.appendChild(judulLabel);
    judulRow.appendChild(judulInput);
    containerEl.appendChild(judulRow);

    var paragrafWrap = h("div");
    renderParagrafList(paragrafWrap, benang.paragraf || [], onAnyChange);
    containerEl.appendChild(paragrafWrap);
  }

  // ---- ongkos re-render keseluruhan saat ada perubahan --------------

  // Data in-memory terkini. Diperbarui tiap render ulang dan tiap aksi
  // sebelum re-render, jadi `onAnyChange` selalu punya keadaan konsisten.
  var currentData = null;

  // Pasang ulang event delegation SETIAP kali form di-render ulang.
  // Tanpa ini, setelah refreshForm() rebuild DOM, delegation listeners
  // di DOM lama ikut hilang — user tidak bisa add/remove/move kisah/paragraf.
  function attachAllDelegation() {
    var kisahList = formArea.querySelector(":scope > .story-root > .kisah-list");
    if (kisahList && currentData) {
      attachKisahDelegation(kisahList, currentData.kisah);
    }

    var benangWrap = formArea.querySelector(
      ":scope > .story-root > .story-section:last-of-type .paragraf-list"
    );
    if (benangWrap && currentData) {
      attachParagrafDelegation(benangWrap, currentData.benangMerah.paragraf);
    }
  }

  function refreshForm() {
    if (!currentData) return;
    renderRootEditor(currentData);
    attachAllDelegation();
    setStatus(statusDefault(currentFolder), "");
  }

  function onAnyChange() {
    // Callback dari renderKisahList / renderParagrafList.
    // Setelah list diubah, re-render ulang form dari currentData.
    refreshForm();
  }

  // Status default untuk form kosong (label standar) — pakai bahasa
  // yang konsisten dengan yang lain, bukan teks yang masih kasar.
  function statusDefault(folder) {
    return (
      "Tersimpan di memori — folder \u201C" + folder + "\u201D siap diedit. " +
      "Klik Simpan untuk menulis ke file."
    );
  }

  // ---- event delegation (SATU listener per container) --------------

  function attachParagrafDelegation(listEl, paragrafArr) {
    listEl.addEventListener("click", function (e) {
      var target = e.target;
      if (!target.classList.contains("paragraf-move") &&
          !target.classList.contains("paragraf-remove") &&
          !target.classList.contains("paragraf-add")) {
        return;
      }

      var action = target.dataset.action;
      var index  = target.dataset.index;

      var changed = applyParagrafAction(paragrafArr, action, index);
      if (changed) {
        onAnyChange();
      }
    });
  }

  function attachKisahDelegation(listEl, kisahArr) {
    listEl.addEventListener("click", function (e) {
      var target = e.target;
      if (!target.classList.contains("kisah-move") &&
          !target.classList.contains("kisah-remove") &&
          !target.classList.contains("kisah-add")) {
        return;
      }

      var action = target.dataset.action;
      var index  = target.dataset.index;

      if (action === "add") {
        kisahArr.push({ id: "", judul: "", paragraf: [], paragrafPenutup: "" });
        onAnyChange();
        return;
      }

      if (isNaN(index) || index < 0 || index >= kisahArr.length) return;

      if (action === "remove") {
        kisahArr.splice(index, 1);
        onAnyChange();
        return;
      }

      if (action === "up" && index > 0) {
        var tmp = kisahArr[index - 1];
        kisahArr[index - 1] = kisahArr[index];
        kisahArr[index] = tmp;
        onAnyChange();
        return;
      }

      if (action === "down" && index < kisahArr.length - 1) {
        var tmp = kisahArr[index + 1];
        kisahArr[index + 1] = kisahArr[index];
        kisahArr[index] = tmp;
        onAnyChange();
        return;
      }
    });
  }

  // ---- fetch helpers --------------------------------------------------

  function parseErrorResponse(resp) {
    return resp.text().then(function (txt) {
      try {
        var j = JSON.parse(txt);
        return new Error(j.error || ("HTTP " + resp.status));
      } catch (e) {
        return new Error("HTTP " + resp.status + ": " + txt.slice(0, 200));
      }
    });
  }

  function apiGet(url) {
    return fetch(url, { cache: "no-store" }).then(function (resp) {
      if (!resp.ok) return parseErrorResponse(resp).then(function (e) { throw e; });
      return resp.json();
    });
  }

  function apiPost(url, body) {
    return fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: body
    }).then(function (resp) {
      if (!resp.ok) return parseErrorResponse(resp).then(function (e) { throw e; });
      return resp.json();
    });
  }

  // ---- alur utama -----------------------------------------------------

  function loadFolders() {
    setStatus("Memuat daftar folder…");
    apiGet("/api/list")
      .then(function (list) {
        folders = list || [];

        selectEl.textContent = "";
        if (!folders.length) {
          var opt = h("option", null, "(tidak ada folder dengan content.json)");
          opt.disabled = true;
          selectEl.appendChild(opt);
          saveBtn.disabled = true;
          formArea.textContent = "";
          setStatus("Tidak ada subfolder ber-content.json di root ini.", "err");
          return;
        }

        folders.forEach(function (f) {
          var opt = h("option", null, f);
          opt.value = f;
          selectEl.appendChild(opt);
        });
        selectEl.value = folders[0];
        loadFolder(folders[0]);
      })
      .catch(function (e) {
        saveBtn.disabled = true;
        setStatus("Gagal memuat daftar folder: " + e.message, "err");
      });
  }

  function loadFolder(folder) {
    currentFolder = folder;
    saveBtn.disabled = true;
    formArea.textContent = "";
    setStatus("Memuat " + folder + "…");

    apiGet("/api/content?folder=" + encodeURIComponent(folder))
      .then(function (data) {
        // Normalisasi ringan supaya objeknya selalu punya shape yang diharapkan,
        // tanpa mengubah data asli di server (jika ada field yang hilang,
        // editor tetap bekerja; saat disimpan, shape yang dikirim sesuai schema).
        currentData = {
          judul: String(data.judul || ""),
          subjudul: String(data.subjudul || ""),
          kisah: (data.kisah || []).map(function (k) {
            return {
              id: String(k.id || ""),
              judul: String(k.judul || ""),
              paragraf: Array.isArray(k.paragraf) ? k.paragraf.slice() : [],
              paragrafPenutup: String(k.paragrafPenutup || "")
            };
          }),
          benangMerah: {
            judul: String((data.benangMerah && data.benangMerah.judul) || ""),
            paragraf: Array.isArray(data.benangMerah && data.benangMerah.paragraf)
              ? (data.benangMerah.paragraf).slice()
              : []
          }
        };

        renderRootEditor(currentData);
        attachAllDelegation();

        saveBtn.disabled = false;
        setStatus(statusDefault(folder), "");
      })
      .catch(function (e) {
        formArea.textContent = "";
        saveBtn.disabled = true;
        setStatus("Gagal memuat " + folder + ": " + e.message, "err");
      });
  }

  function onSave() {
    if (!currentFolder) return;

    var rootEditor = formArea.querySelector(":scope > .story-root");
    if (!rootEditor) {
      setStatus("Belum ada data untuk disimpan.", "err");
      return;
    }

    var data;
    try {
      data = collectStoryData(rootEditor);
    } catch (e) {
      setStatus("Tidak bisa menyimpan: " + e.message, "err");
      return;
    }

    // Guard pertahanan berlapis (mirror sync_inline_script.py guard):
    // tolak kirim ke server kalau kisah kosong atau benangMerah hilang.
    if (!data.kisah || !data.kisah.length) {
      setStatus(
        "BLOKIR: kisah kosong — tidak mengirim ke server. " +
        "Periksa apakah data benar-benar sudah terkumpul di form.",
        "err"
      );
      return;
    }
    if (
      !data.benangMerah ||
      !data.benangMerah.paragraf ||
      !data.benangMerah.paragraf.length
    ) {
      setStatus(
        "BLOKIR: benangMerah kosong — tidak mengirim ke server. " +
        "Pastikan benang merah sudah terisi sebelum simpan.",
        "err"
      );
      return;
    }

    var payload = JSON.stringify(data, null, 2);
    saveBtn.disabled = true;
    setStatus("Menyimpan ke " + currentFolder + "…");

    apiPost(
      "/api/content?folder=" + encodeURIComponent(currentFolder),
      payload
    )
      .then(function (res) {
        setStatus(
          "Berhasil disimpan ke " + (res.file || currentFolder + "/content.json") + ".",
          "ok"
        );
      })
      .catch(function (e) {
        setStatus("Gagal menyimpan: " + e.message, "err");
      })
      .finally(function () {
        saveBtn.disabled = false;
      });
  }

  // ---- wire up --------------------------------------------------------

  selectEl.addEventListener("change", function () {
    if (selectEl.value) loadFolder(selectEl.value);
  });

  saveBtn.addEventListener("click", onSave);

  loadFolders();
})();
