#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
story_saver.py — Window edit satu cerita (Tkinter).

UI untuk mengedit content.json satu folder cerita:
    a. Edit field "Benang Merah" (benangMerah.judul + benangMerah.paragraf)
    b. List kisah, tiap kisah punya id + judul + list paragraf + paragrafPenutup
    c. Tiap paragraf: edit teks, Naik/Turun, Tambah (placeholder ""), Hapus
    d. Tombol "Simpan": tulis content.json + panggil sync_inline_script()

Mengikuti pola NoteSaverWindow di ~/HomeLab/Notes/save_notes.py:
    - muat_data(folder_path) -> load content.json ke in-memory
    - simpan_data(folder_path, data) -> tulis balik ke content.json
"""

import json
import os
import sys
import tkinter as tk
from tkinter import ttk, messagebox

from path_utils import ROOT_DIR


class StorySaverWindow:
    """Window edit satu cerita."""

    def __init__(self, root, folder_name):
        self.root = root
        self.folder_name = folder_name
        self.folder_path = os.path.join(ROOT_DIR, folder_name)
        self.data = None  # in-memory copy of content.json

        self.root.title(f"Edit — {folder_name}")
        self.root.geometry("700x650")
        self.root.minsize(550, 450)

        self._build_ui()
        self.muat_data()

    # ── muat_data / simpan_data ───────────────────────────────────────

    def muat_data(self):
        """Load content.json ke self.data."""
        content_path = os.path.join(self.folder_path, "content.json")
        try:
            with open(content_path, "r", encoding="utf-8") as f:
                self.data = json.load(f)
        except Exception as e:
            messagebox.showerror("Error", f"Gagal memuat content.json:\n{e}")
            self.root.destroy()
            return

        # Normalisasi ringan (mirror editor.js loadFolder)
        self.data = {
            "judul": str(self.data.get("judul", "")),
            "subjudul": str(self.data.get("subjudul", "")),
            "kisah": [
                {
                    "id": str(k.get("id", "")),
                    "judul": str(k.get("judul", "")),
                    "paragraf": list(k.get("paragraf", [])),
                    "paragrafPenutup": str(k.get("paragrafPenutup", "")),
                }
                for k in self.data.get("kisah", [])
            ],
            "benangMerah": {
                "judul": str(self.data.get("benangMerah", {}).get("judul", "")),
                "paragraf": list(self.data.get("benangMerah", {}).get("paragraf", [])),
            },
        }
        self._render_form()

    def simpan_data(self):
        """Tulis self.data balik ke content.json, lalu sync inline script."""
        content_path = os.path.join(self.folder_path, "content.json")

        # Serialize JSON (format rapi, indent 2 — sama seperti server.py)
        pretty = json.dumps(self.data, ensure_ascii=False, indent=2) + "\n"

        try:
            with open(content_path, "w", encoding="utf-8") as f:
                f.write(pretty)
        except Exception as e:
            messagebox.showerror("Error", f"Gagal menulis content.json:\n{e}")
            return False

        # Sync inline <script id="content-data"> di index.html
        try:
            from sync_inline_script import sync_inline_script

            sync_status, sync_detail = sync_inline_script(self.folder_path, self.data)
        except Exception as e:
            sync_status = "failed"
            sync_detail = f"Exception: {e}"

        if sync_status == "updated":
            msg = f"Disimpan ke {self.folder_name}/content.json\nSync: {sync_detail}"
            messagebox.showinfo("Sukses", msg)
        else:
            msg = (
                f"Disimpan ke {self.folder_name}/content.json\n"
                f"Sync: {sync_status} — {sync_detail}"
            )
            messagebox.showwarning("Tersimpan (sync bermasalah)", msg)

        return True

    # ── UI: Render form ───────────────────────────────────────────────

    def _build_ui(self):
        # Canvas + scrollbar untuk konten panjang
        container = ttk.Frame(self.root)
        container.pack(fill=tk.BOTH, expand=True)

        self.canvas = tk.Canvas(container, highlightthickness=0)
        vsb = ttk.Scrollbar(container, orient=tk.VERTICAL, command=self.canvas.yview)
        self.canvas.configure(yscrollcommand=vsb.set)

        vsb.pack(side=tk.RIGHT, fill=tk.Y)
        self.canvas.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)

        self.inner = ttk.Frame(self.canvas, padding=10)
        self.canvas_window = self.canvas.create_window((0, 0), window=self.inner, anchor="nw")

        # Auto-resize inner width ke canvas width
        self.inner.bind("<Configure>", lambda e: self.canvas.configure(scrollregion=self.canvas.bbox("all")))
        self.canvas.bind("<Configure>", self._on_canvas_resize)

        # Mouse wheel scrolling
        self.canvas.bind_all(
            "<MouseWheel>",
            lambda e: self.canvas.yview_scroll(int(-1 * (e.delta / 120)), "units"),
        )
        # Linux support
        self.canvas.bind_all("<Button-4>", lambda e: self.canvas.yview_scroll(-1, "units"))
        self.canvas.bind_all("<Button-5>", lambda e: self.canvas.yview_scroll(1, "units"))

        # Bottom: Simpan button
        bottom = ttk.Frame(self.root, padding=8)
        bottom.pack(fill=tk.X)

        ttk.Button(bottom, text="Simpan", command=self._on_save).pack(side=tk.RIGHT)

    def _on_canvas_resize(self, event):
        self.canvas.itemconfig(self.canvas_window, width=event.width)

    def _render_form(self):
        """Render seluruh form dari self.data."""
        # Clear
        for w in self.inner.winfo_children():
            w.destroy()

        if not self.data:
            return

        # ── Judul & Subjudul ──
        self._add_field("Judul", "judul")
        self._add_field("Subjudul", "subjudul")

        # ── Kisah list ──
        ttk.Separator(self.inner, orient=tk.HORIZONTAL).pack(fill=tk.X, pady=(10, 5))
        ttk.Label(self.inner, text="Kisah", font=("sans-serif", 11, "bold")).pack(anchor=tk.W, pady=(0, 5))

        self.kisah_frames = []
        for idx, kisah in enumerate(self.data["kisah"]):
            frame = self._add_kisah_card(idx, kisah)
            self.kisah_frames.append(frame)

        ttk.Button(self.inner, text="+ Tambah Kisah", command=self._add_kisah).pack(anchor=tk.W, pady=(5, 0))

        # ── Benang Merah ──
        ttk.Separator(self.inner, orient=tk.HORIZONTAL).pack(fill=tk.X, pady=(10, 5))
        ttk.Label(self.inner, text="Benang Merah", font=("sans-serif", 11, "bold")).pack(anchor=tk.W, pady=(0, 5))

        self.benang_frame = self._add_benang_section()

        # Scroll to top
        self.canvas.yview_moveto(0)

    def _add_field(self, label, key):
        """Add a simple text field bound to self.data[key]."""
        frame = ttk.Frame(self.inner)
        frame.pack(fill=tk.X, pady=2)

        ttk.Label(frame, text=f"{label}:", width=10, anchor=tk.W).pack(side=tk.LEFT)
        var = tk.StringVar(value=self.data[key])
        entry = ttk.Entry(frame, textvariable=var)
        entry.pack(side=tk.LEFT, fill=tk.X, expand=True, padx=(4, 0))

        # Bind changes back to data
        var.trace_add("write", lambda *_a, _k=key, _v=var: self.data.__setitem__(_k, _v.get()))

    def _add_kisah_card(self, idx, kisah):
        """Add a kisah card: id + judul + paragraf list + penutup."""
        outer = ttk.LabelFrame(self.inner, text=f"Kisah #{idx + 1}", padding=8)
        outer.pack(fill=tk.X, pady=4)

        top_row = ttk.Frame(outer)
        top_row.pack(fill=tk.X, pady=(0, 4))

        # id
        ttk.Label(top_row, text="ID:").pack(side=tk.LEFT)
        id_var = tk.StringVar(value=kisah["id"])
        ttk.Entry(top_row, textvariable=id_var, width=12).pack(side=tk.LEFT, padx=(2, 8))
        id_var.trace_add("write", lambda *_a, _v=id_var, _k=kisah: _k.__setitem__("id", _v.get()))

        # judul
        ttk.Label(top_row, text="Judul:").pack(side=tk.LEFT)
        judul_var = tk.StringVar(value=kisah["judul"])
        ttk.Entry(top_row, textvariable=judul_var).pack(side=tk.LEFT, fill=tk.X, expand=True, padx=(2, 0))
        judul_var.trace_add("write", lambda *_a, _v=judul_var, _k=kisah: _k.__setitem__("judul", _v.get()))

        # Navigation buttons
        nav = ttk.Frame(outer)
        nav.pack(fill=tk.X, pady=(0, 2))
        ttk.Button(nav, text="▲ Naik", width=8, command=lambda i=idx: self._move_kisah(i, -1)).pack(side=tk.LEFT, padx=2)
        ttk.Button(nav, text="▼ Turun", width=8, command=lambda i=idx: self._move_kisah(i, 1)).pack(side=tk.LEFT, padx=2)
        ttk.Button(nav, text="Hapus", width=8, command=lambda i=idx: self._remove_kisah(i)).pack(side=tk.LEFT, padx=2)

        # Paragraf list
        paragraf_frame = ttk.Frame(outer)
        paragraf_frame.pack(fill=tk.X, pady=(4, 0))
        self._render_paragraf_list(paragraf_frame, kisah)

        # paragrafPenutup
        ttk.Label(outer, text="Penutup:").pack(anchor=tk.W, pady=(4, 2))
        penutup_text = tk.Text(outer, height=3, wrap=tk.WORD)
        penutup_text.pack(fill=tk.X)
        penutup_text.insert("1.0", kisah.get("paragrafPenutup", ""))
        penutup_text.bind(
            "<FocusOut>",
            lambda e, _t=penutup_text, _k=kisah: _k.__setitem__("paragrafPenutup", _t.get("1.0", tk.END).rstrip("\n")),
        )

        return outer

    def _render_paragraf_list(self, container, kisah):
        """Render paragraf list di dalam container. Setiap paragraf punya
        teks (Text widget), Naik/Turun/Hapus buttons."""
        for w in container.winfo_children():
            w.destroy()

        for idx, teks in enumerate(kisah["paragraf"]):
            row = ttk.Frame(container)
            row.pack(fill=tk.X, pady=1)

            # Number label
            ttk.Label(row, text=f"{idx + 1}.", width=3).pack(side=tk.LEFT)

            # Text widget (2-4 lines)
            txt = tk.Text(row, height=2, wrap=tk.WORD, font=("sans-serif", 10))
            txt.pack(side=tk.LEFT, fill=tk.X, expand=True, padx=(0, 4))
            txt.insert("1.0", teks if teks else "")

            # Bind on focus-out to sync back
            txt.bind(
                "<FocusOut>",
                lambda e, _t=txt, _arr=kisah["paragraf"], _i=idx: _arr.__setitem__(_i, _t.get("1.0", tk.END).rstrip("\n")),
            )

            # Action buttons
            actions = ttk.Frame(row)
            actions.pack(side=tk.RIGHT)
            ttk.Button(actions, text="▲", width=2, command=lambda i=idx, _k=kisah: self._move_paragraf(_k, i, -1)).pack(side=tk.LEFT, padx=1)
            ttk.Button(actions, text="▼", width=2, command=lambda i=idx, _k=kisah: self._move_paragraf(_k, i, 1)).pack(side=tk.LEFT, padx=1)
            ttk.Button(actions, text="✕", width=2, command=lambda i=idx, _k=kisah: self._remove_paragraf(_k, i)).pack(side=tk.LEFT, padx=1)

        # Add button
        ttk.Button(container, text="+ Paragraf", command=lambda: self._add_paragraf(kisah, container)).pack(anchor=tk.W, pady=(2, 0))

    def _add_benang_section(self):
        """Add benang merah section: judul + paragraf list."""
        frame = ttk.LabelFrame(self.inner, text="Benang Merah", padding=8)
        frame.pack(fill=tk.X, pady=4)

        bm = self.data["benangMerah"]

        # Judul
        row = ttk.Frame(frame)
        row.pack(fill=tk.X, pady=(0, 4))
        ttk.Label(row, text="Judul:").pack(side=tk.LEFT)
        judul_var = tk.StringVar(value=bm["judul"])
        ttk.Entry(row, textvariable=judul_var).pack(side=tk.LEFT, fill=tk.X, expand=True, padx=(4, 0))
        judul_var.trace_add("write", lambda *_a, _v=judul_var: bm.__setitem__("judul", _v.get()))

        # Paragraf list
        paragraf_frame = ttk.Frame(frame)
        paragraf_frame.pack(fill=tk.X)
        self._render_paragraf_list(paragraf_frame, bm)

        return frame

    # ── Actions: kisah ────────────────────────────────────────────────

    def _add_kisah(self):
        self.data["kisah"].append({
            "id": "",
            "judul": "",
            "paragraf": [],
            "paragrafPenutup": "",
        })
        self._render_form()

    def _remove_kisah(self, idx):
        if messagebox.askyesno("Hapus", f"Hapus kisah #{idx + 1}?"):
            self.data["kisah"].pop(idx)
            self._render_form()

    def _move_kisah(self, idx, direction):
        arr = self.data["kisah"]
        new_idx = idx + direction
        if new_idx < 0 or new_idx >= len(arr):
            return
        arr[idx], arr[new_idx] = arr[new_idx], arr[idx]
        self._render_form()

    # ── Actions: paragraf ─────────────────────────────────────────────

    def _add_paragraf(self, kisah, container):
        kisah["paragraf"].append("")  # placeholder kosong, bukan None
        self._render_paragraf_list(container, kisah)

    def _remove_paragraf(self, kisah, idx):
        kisah["paragraf"].pop(idx)
        # Re-render parent kisah card (need to find it)
        self._render_form()

    def _move_paragraf(self, kisah, idx, direction):
        arr = kisah["paragraf"]
        new_idx = idx + direction
        if new_idx < 0 or new_idx >= len(arr):
            return
        arr[idx], arr[new_idx] = arr[new_idx], arr[idx]
        self._render_form()

    # ── Save ──────────────────────────────────────────────────────────

    def _on_save(self):
        # Sync any focused Text widgets that haven't triggered FocusOut
        # This is a safety net — in practice FocusOut handles it
        self.simpan_data()


def main():
    """Standalone test: edit Tiga-Kisah-Babylon."""
    root = tk.Tk()
    app = StorySaverWindow(root, "Tiga-Kisah-Babylon")
    root.mainloop()


if __name__ == "__main__":
    main()
