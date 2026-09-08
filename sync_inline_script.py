#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Fungsi additive untuk menyinkronkan isi inline <script id="content-data">
di index.html sesudah content.json berhasil ditulis.

Dipanggil SATU baris dari endpoint POST /api/content (do_POST) — hanya di
Handler.save flow, tidak mengubah resolve_content_path / is_safe_folder_name
/ scan_folders / cara penulisan content.json yang ada.

Return (status: str, detail: str).
"""

# NOTE (2026-09-08): Alur ini bukan lagi satu-satunya sumber data index.html.
# index.html sekarang bisa fetch langsung dari Apps Script Web App.
# Lihat apps-script/code.gs dan WEB_APP_URL di Tiga-Kisah-Babylon/script.js.

import json
import os
import re
import sys

# Regex yang di-anchor ke tag pembuka + penutup spesifik, non-greedy di dalam.
_INLINE_OPEN = '<script id="content-data" type="application/json">'
_INLINE_CLOSE = "</script>"

# Kompilasi sekali — safe untuk pola ini karena tag pembuka dan penutupnya
# spesifik (id + type), jadi tidak risiko tersenggol <script src="script.js">.
_INLINE_RE = re.compile(
    re.escape(_INLINE_OPEN) + r"(.*?)" + re.escape(_INLINE_CLOSE),
    re.DOTALL,
)


def _index_html_path(folder_path):
    return os.path.join(folder_path, "index.html")


def sync_inline_script(folder_path, content_dict):
    """Update inline <script id=\"content-data\"> di index.html jika ada.

    SAFETY: Script ini HANYA menulis ke index.html. Tidak boleh pernah
    menulis balik ke content.json dalam kondisi apa pun.

    Guard: kalau content_dict kosong / tidak punya key 'kisah' / 'kisah'
    kosong / 'benangMerah' kosong, STOP total — jangan update index.html.
    Ini mencegah propagate data kosong ke index.html saat editor gagal
    mengumpulkan data.

    - Jika index.html tidak ada -> ('skipped_no_file', '...')
    - Jika ada tapi tidak ada tag -> ('skipped_no_tag', '...')
    - Jika ada -> isi JSON dalam tag diganti; ('updated', '...')
    - Kalau replace gagal (mis. regex tak terduga / write gagal) ->
      ('failed', pesan error).
    """
    # --- Guard: pastikan content_dict punya struktur yang valid ---
    if not isinstance(content_dict, dict):
        return ("failed", "content_dict bukan dict (%s)" % type(content_dict).__name__)

    kisah = content_dict.get("kisah")
    if not isinstance(kisah, list) or len(kisah) == 0:
        return (
            "failed",
            "GUARD: content_dict['kisah'] kosong atau tidak ada — "
            "tidak mengupdate index.html untuk mencegah data kosong terpropagasi. "
            "Periksa apakah editor berhasil mengirim data lengkap."
        )

    benang = content_dict.get("benangMerah")
    if not isinstance(benang, dict) or not benang.get("paragraf"):
        return (
            "failed",
            "GUARD: content_dict['benangMerah'] kosong atau tidak valid — "
            "tidak mengupdate index.html."
        )

    idx_path = _index_html_path(folder_path)

    if not os.path.isfile(idx_path):
        return ("skipped_no_file", "Tidak ada index.html di %s" % folder_path)

    try:
        with open(idx_path, "r", encoding="utf-8") as f:
            html = f.read()
    except OSError as e:
        return ("failed", "Gagal baca index.html: %s" % e)

    m = _INLINE_RE.search(html)
    if m is None:
        return ("skipped_no_tag", "index.html ada tapi tidak ada <script id=\"content-data\">")

    new_body = json.dumps(content_dict, ensure_ascii=False, indent=2)
    # jaga newline setelah tag pembuka persis seperti aslinya: pola (.*) tidak
    # menangkap apa yang sebelum newline pertama di dalam tag; kita ganti saja
    # isi di antara tag tanpa menyentuh whitespace di luar.
    replacement = _INLINE_OPEN + "\n" + new_body + "\n  " + _INLINE_CLOSE
    try:
        updated = _INLINE_RE.sub(replacement, html, count=1)
    except Exception as e:
        return ("failed", "Gagal replace inline script: %s" % e)

    if updated == html:
        # Tag ada tapi isinya tidak berubah (save ulang data sama) — tetap kita
        # anggap 'updated' karena operasi replace berhasil dan file akan ditulis
        # ulang (idempoten, aman).
        pass

    try:
        with open(idx_path, "w", encoding="utf-8") as f:
            f.write(updated)
    except OSError as e:
        return ("failed", "Gagal tulis index.html: %s" % e)

    return ("updated", "Inline <script id=\"content-data\"> disinkronkan")


# Kompatibilitas import: modul ini boleh di-import oleh server.py.
# (os/ json sudah di-import di server.py; kita cuma reference yang sama.)
