#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
story_browser.py — Window utama browser cerita (Tkinter).

Scan semua subfolder langsung di dalam iforeman-story/ yang punya
content.json + index.html (folder valid = "cerita"), tampilkan sebagai list
dengan search/filter dan tombol refresh.

Double-click / tombol "Edit" pada satu cerita membuka story_saver.py's
window untuk folder itu.

Arsitektur mengikuti pola NotesBrowserWindow di ~/HomeLab/Notes/notes.py:
    - muat_data / _populate_list / _cari_note / _update_count
"""

import os
import sys
import threading
import tkinter as tk
from tkinter import ttk, messagebox

from path_utils import CONTENT_FILENAME, ROOT_DIR, scan_folders


class StoryBrowserWindow:
    """Window utama: daftar cerita + search + edit."""

    def __init__(self, root):
        self.root = root
        self.root.title("Browser Cerita — iforeman-story")
        self.root.geometry("520x520")
        self.root.minsize(400, 350)

        self.folders = []  # list nama folder valid

        self._build_ui()
        self._load_and_refresh()

    # ── UI ────────────────────────────────────────────────────────────

    def _build_ui(self):
        # Top frame: search + refresh
        top = ttk.Frame(self.root, padding=8)
        top.pack(fill=tk.X)

        ttk.Label(top, text="Filter:").pack(side=tk.LEFT)
        self.search_var = tk.StringVar()
        self.search_var.trace_add("write", lambda *_: self._populate_list())
        self.search_entry = ttk.Entry(top, textvariable=self.search_var, width=30)
        self.search_entry.pack(side=tk.LEFT, padx=(4, 8), fill=tk.X, expand=True)
        self.search_entry.focus_set()

        self.refresh_btn = ttk.Button(top, text="⟳", width=3, command=self._load_and_refresh)
        self.refresh_btn.pack(side=tk.LEFT)

        # Listbox + scrollbar
        list_frame = ttk.Frame(self.root, padding=(8, 0, 8, 8))
        list_frame.pack(fill=tk.BOTH, expand=True)

        self.listbox = tk.Listbox(list_frame, activestyle="underline", font=("monospace", 12))
        self.listbox.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)

        scrollbar = ttk.Scrollbar(list_frame, orient=tk.VERTICAL, command=self.listbox.yview)
        scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
        self.listbox.config(yscrollcommand=scrollbar.set)

        # Double-click → edit
        self.listbox.bind("<Double-Button-1>", lambda e: self._edit_selected())

        # Bottom frame: edit button + count
        bottom = ttk.Frame(self.root, padding=8)
        bottom.pack(fill=tk.X)

        self.edit_btn = ttk.Button(bottom, text="Edit", command=self._edit_selected, state=tk.DISABLED)
        self.edit_btn.pack(side=tk.LEFT)

        self.count_label = ttk.Label(bottom, text="0 cerita")
        self.count_label.pack(side=tk.RIGHT)

        # Bind selection
        self.listbox.bind("<<ListboxSelect>>", self._on_select)

    # ── Load & populate ───────────────────────────────────────────────

    def _load_and_refresh(self):
        """Scan folders di background thread supaya UI tidak freeze."""
        self.refresh_btn.config(state=tk.DISABLED)
        self.count_label.config(text="Memuat…")

        def _scan():
            folders = scan_folders()
            self.root.after(0, self._on_scan_done, folders)

        threading.Thread(target=_scan, daemon=True).start()

    def _on_scan_done(self, folders):
        self.folders = folders
        self.refresh_btn.config(state=tk.NORMAL)
        self._populate_list()

    def _populate_list(self):
        """Tampilkan folder yang cocok dengan filter ke dalam listbox."""
        query = self.search_var.get().strip().lower()
        filtered = [f for f in self.folders if query in f.lower()]

        self.listbox.delete(0, tk.END)
        for f in filtered:
            # Tampilkan juga jumlah paragraf sebagai info ringkas
            info = self._folder_summary(f)
            self.listbox.insert(tk.END, f"  {f}  —  {info}")

        self._update_count(len(filtered))
        self.edit_btn.config(state=tk.DISABLED)

    def _folder_summary(self, folder_name):
        """Kembalikan ringkasan singkat: '3 kisah, 12 paragraf'."""
        content_path = os.path.join(ROOT_DIR, folder_name, CONTENT_FILENAME)
        try:
            with open(content_path, "r", encoding="utf-8") as f:
                data = __import__("json").load(f)
            kisah = data.get("kisah", [])
            total_p = sum(len(k.get("paragraf", [])) for k in kisah)
            return f"{len(kisah)} kisah, {total_p} paragraf"
        except Exception:
            return "?"

    def _update_count(self, count):
        total = len(self.folders)
        if count == total:
            self.count_label.config(text=f"{total} cerita")
        else:
            self.count_label.config(text=f"{count}/{total} cerita")

    def _on_select(self, event):
        sel = self.listbox.curselection()
        self.edit_btn.config(state=tk.NORMAL if sel else tk.DISABLED)

    # ── Edit ──────────────────────────────────────────────────────────

    def _edit_selected(self):
        sel = self.listbox.curselection()
        if not sel:
            return
        # Extract folder name from display text "  name  —  summary"
        display = self.listbox.get(sel[0])
        folder_name = display.split("—")[0].strip()

        # Import & open story_saver window
        from story_saver import StorySaverWindow

        saver_root = tk.Toplevel(self.root)
        StorySaverWindow(saver_root, folder_name)


def main():
    root = tk.Tk()
    app = StoryBrowserWindow(root)
    root.mainloop()


if __name__ == "__main__":
    main()
