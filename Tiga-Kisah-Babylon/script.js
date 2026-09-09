/* ============================================================
   Tiga Kisah dari Babylon — loader & renderer
   Muat data dari Apps Script Web App (WEB_APP_URL).
   ============================================================ */

(function () {
  "use strict";

  // === ISI MANUAL SETELAH DEPLOY WEB APP ===
  var WEB_APP_URL = "https://script.google.com/macros/s/AKfycbyuF83HmU0dKHCkRzs4JeTYFP7vIcIEHJFPZZZhdaDH_spBAaMI4fwXui6aSjC-Hc1oBA/exec";

  // --- utilitas teks -------------------------------------------------

  // Escaping dasar lalu konversi **tebal** (markdown) -> <strong>.
  function renderInline(texto) {
    var escaped = texto
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    return escaped.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  }

  function el(tag, className, html) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (html !== undefined) node.innerHTML = html;
    return node;
  }

  // --- ikon SVG per kisah (sungai / bel / kebun), stroke emas ---

  var IKON = {
    naran:
      '<svg class="kisah-ikon" viewBox="0 0 48 48" fill="none" aria-hidden="true" focusable="false">' +
      '<path d="M5 16 C 12 8, 20 24, 27 16 S 43 11, 43 16" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>' +
      '<path d="M5 27 C 12 19, 20 35, 27 27 S 43 22, 43 27" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>' +
      '<path d="M5 38 C 12 30, 20 46, 27 38 S 43 33, 43 38" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>' +
      "</svg>",
    idin:
      '<svg class="kisah-ikon" viewBox="0 0 48 48" fill="none" aria-hidden="true" focusable="false">' +
      '<path d="M15 26 C 15 15, 19 10, 24 10 C 29 10, 33 15, 33 26 L 33 30 L 15 30 Z" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"/>' +
      '<path d="M15 26 C 15 24.5, 33 24.5, 33 26" stroke="currentColor" stroke-width="1.4"/>' +
      '<path d="M24 30 L 24 35" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>' +
      '<circle cx="24" cy="37.5" r="2.2" stroke="currentColor" stroke-width="1.8"/>' +
      "</svg>",
    "ur-nanshe":
      '<svg class="kisah-ikon" viewBox="0 0 48 48" fill="none" aria-hidden="true" focusable="false">' +
      '<path d="M24 40 L 24 20" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>' +
      '<path d="M24 20 C 18 16, 11 15, 6 17 M24 20 C 31 15, 39 15, 43 18" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>' +
      '<path d="M24 16 C 24 10, 21 7, 17 5 M24 16 C 25 9, 28 6, 32 4" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>' +
      "</svg>"
  };

  // --- IntersectionObserver: animasi masuk viewport ---

  var _animObserver = null;

  function initAnimObserver() {
    if (_animObserver) return;
    _animObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          _animObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
  }

  function observeAnim(node) {
    if (_animObserver) _animObserver.observe(node);
  }

  // --- render halaman dari data ---

  function ornament() {
    var node = el("div", "ornament", '<span class="ornament-diamond"></span>');
    observeAnim(node);
    return node;
  }

  function renderKisah(kisah) {
    var section = el("section", "kisah");
    section.id = "kisah-" + kisah.id;

    var header = el("div", "kisah-header");
    var ikon = IKON[kisah.ikon] || IKON.naran;
    var ikonWrap = el("span", null, ikon);
    ikonWrap.classList.add("kisah-ikon-wrap");
    header.appendChild(ikonWrap);
    observeAnim(ikonWrap);
    header.appendChild(el("h2", null, renderInline(kisah.judul)));
    section.appendChild(header);
    observeAnim(header);

    kisah.paragraf.forEach(function (teks) {
      section.appendChild(el("p", null, renderInline(teks)));
    });

    if (kisah.paragrafPenutup) {
      section.appendChild(el("p", "penutup", renderInline(kisah.paragrafPenutup)));
    }

    // --- komentar section ---
    var komentarSection = el("div", "komentar-section");
    komentarSection.classList.add("fade-in-section");

    var komentarHeading = el("h3", "komentar-heading", "Komentar");
    komentarSection.appendChild(komentarHeading);

    var daftarKomentar = el("div", "daftar-komentar");
    if (kisah.komentar && kisah.komentar.length > 0) {
      kisah.komentar.forEach(function (k) {
        daftarKomentar.appendChild(renderKomentarItem(k));
      });
    } else {
      daftarKomentar.appendChild(el("p", "komentar-kosong", "Belum ada komentar. Jadilah yang pertama!"));
    }
    komentarSection.appendChild(daftarKomentar);

    // form komentar
    var form = el("form", "komentar-form");
    form.setAttribute("data-kisah-id", kisah.id);

    var namaInput = el("input", "komentar-nama");
    namaInput.setAttribute("type", "text");
    namaInput.setAttribute("placeholder", "Nama");
    namaInput.setAttribute("required", "");
    namaInput.setAttribute("maxlength", "100");
    form.appendChild(namaInput);

    var komentarTextarea = el("textarea", "komentar-textarea");
    komentarTextarea.setAttribute("placeholder", "Tulis komentar...");
    komentarTextarea.setAttribute("required", "");
    komentarTextarea.setAttribute("rows", "3");
    komentarTextarea.setAttribute("maxlength", "2000");
    form.appendChild(komentarTextarea);

    var submitBtn = el("button", "komentar-submit");
    submitBtn.setAttribute("type", "submit");
    submitBtn.textContent = "Kirim";
    form.appendChild(submitBtn);

    var errorMsg = el("p", "komentar-error");
    errorMsg.style.display = "none";
    form.appendChild(errorMsg);

    form.addEventListener("submit", handleKomentarSubmit);
    komentarSection.appendChild(form);
    observeAnim(komentarSection);

    section.appendChild(komentarSection);
    return section;
  }

  function renderKomentarItem(k) {
    var item = el("div", "komentar-item");
    var meta = el("span", "komentar-meta");
    meta.textContent = k.nama + " — " + formatTimestamp(k.timestamp);
    item.appendChild(meta);
    item.appendChild(el("p", "komentar-text", renderInline(k.komentar)));
    return item;
  }

  function formatTimestamp(ts) {
    if (!ts) return "";
    try {
      var d = new Date(ts);
      return d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
    } catch (e) {
      return ts;
    }
  }

  function handleKomentarSubmit(e) {
    e.preventDefault();
    var form = e.target;
    var kisahId = form.getAttribute("data-kisah-id");
    var namaInput = form.querySelector(".komentar-nama");
    var textarea = form.querySelector(".komentar-textarea");
    var submitBtn = form.querySelector(".komentar-submit");
    var errorMsg = form.querySelector(".komentar-error");

    var nama = namaInput.value.trim();
    var komentar = textarea.value.trim();
    if (!nama || !komentar) return;

    submitBtn.disabled = true;
    submitBtn.textContent = "Mengirim...";
    errorMsg.style.display = "none";

    fetch(WEB_APP_URL, {
      method: "POST",
      body: new URLSearchParams({
        kisahId: kisahId,
        nama: nama,
        komentar: komentar
      })
    })
      .then(function (res) { return res.json(); })
      .then(function (data) {
        if (data.success) {
          var daftar = form.parentNode.querySelector(".daftar-komentar");
          var kosong = daftar.querySelector(".komentar-kosong");
          if (kosong) kosong.remove();
          daftar.appendChild(renderKomentarItem({
            nama: nama,
            komentar: komentar,
            timestamp: data.timestamp
          }));
          namaInput.value = "";
          textarea.value = "";
          submitBtn.disabled = false;
          submitBtn.textContent = "Kirim";
        } else {
          errorMsg.textContent = data.error || "Gagal mengirim komentar.";
          errorMsg.style.display = "";
          submitBtn.disabled = false;
          submitBtn.textContent = "Kirim";
        }
      })
      .catch(function () {
        errorMsg.textContent = "Gagal mengirim. Periksa koneksi internet Anda.";
        errorMsg.style.display = "";
        submitBtn.disabled = false;
        submitBtn.textContent = "Kirim";
      });
  }

  function renderBenangMerah(benang) {
    var section = el("section", "benang-merah");
    section.id = "benang-merah";
    section.appendChild(el("h2", null, renderInline(benang.judul)));
    benang.paragraf.forEach(function (teks) {
      section.appendChild(el("p", null, renderInline(teks)));
    });
    observeAnim(section);
    return section;
  }

  function renderNav(data) {
    var nav = document.getElementById("nav-kisah");
    if (!nav) return;

    var hasBenang = !!data.benangMerah;
    if (data.kisah.length <= 1 && !hasBenang) return;

    var links = [];
    data.kisah.forEach(function (kisah, i) {
      links.push({ href: "#kisah-" + kisah.id, label: "Kisah " + (i + 1) });
    });
    if (hasBenang) {
      links.push({ href: "#benang-merah", label: "Benang Merah" });
    }

    // desktop nav
    var desktop = el("div", "nav-desktop");
    links.forEach(function (link) {
      var a = el("a");
      a.href = link.href;
      a.textContent = link.label;
      desktop.appendChild(a);
    });
    nav.appendChild(desktop);

    // mobile nav (details/summary)
    var mobile = el("details", "nav-mobile");
    var summary = el("summary");
    summary.textContent = "Lompat ke kisah";
    mobile.appendChild(summary);
    links.forEach(function (link) {
      var a = el("a");
      a.href = link.href;
      a.textContent = link.label;
      mobile.appendChild(a);
    });
    nav.appendChild(mobile);

    nav.removeAttribute("hidden");
  }

  function render(data) {
    document.getElementById("judul-utama").textContent = data.judul;
    document.title = data.judul;
    document.getElementById("subjudul").textContent = data.subjudul;

    var konten = document.getElementById("konten");
    konten.textContent = "";

    renderNav(data);

    data.kisah.forEach(function (kisah, i) {
      konten.appendChild(renderKisah(kisah));
      if (i < data.kisah.length - 1) {
        konten.appendChild(ornament());
      }
    });

    if (data.benangMerah) {
      konten.appendChild(ornament());
      konten.appendChild(renderBenangMerah(data.benangMerah));
    }

    initAnimObserver();
  }

  function gagal(pesan) {
    var konten = document.getElementById("konten");
    konten.textContent = "";
    konten.appendChild(
      el("p", "status-loading", "Maaf, kisah gagal dimuat: " + pesan)
    );
  }

  // --- muat data: Web App only ---

  async function muat() {
    if (!WEB_APP_URL) {
      gagal("WEB_APP_URL belum dikonfigurasi.");
      return;
    }

    var data = null;
    try {
      var res = await fetch(WEB_APP_URL, { cache: "no-store" });
      if (res.ok) {
        data = await res.json();
      }
    } catch (e) {
      data = null;
    }

    if (data && data.kisah) {
      render(data);
    } else {
      gagal("Gagal memuat data dari server. Silakan coba lagi nanti.");
    }
  }

  muat();
})();
