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

import json
import os
import sys
import threading
import tkinter as tk
from tkinter import ttk, messagebox

from path_utils import CONTENT_FILENAME, ROOT_DIR, scan_folders

# ── Theme constants ───────────────────────────────────────────────────
_BG = "#0a0a0a"
_BG_FIELD = "#1a1a1a"
_FG = "#e0e0e0"
_FG_DIM = "#888888"
_ACCENT = "#00bfa5"
_BORDER = "#2a2a2a"
_FONT_BODY = ("DejaVu Sans", 10)
_FONT_LABEL = ("DejaVu Sans", 11, "bold")
_FONT_LIST = ("DejaVu Sans Mono", 11)
_FONT_SECTION = ("DejaVu Sans", 12, "bold")


def _apply_theme(root):
    """Apply dark OLED theme using clam base + manual overrides."""
    style = ttk.Style(root)
    style.theme_use("clam")

    # Global
    style.configure(".", background=_BG, foreground=_FG, borderwidth=0,
                     relief="flat", font=_FONT_BODY)
    style.map(".", background=[("active", _BG_FIELD)])

    # Frames
    style.configure("TFrame", background=_BG)
    style.configure("TLabelframe", background=_BG, foreground=_FG,
                     bordercolor=_BORDER, relief="flat")
    style.configure("TLabelframe.Label", background=_BG, foreground=_FG_DIM,
                     font=_FONT_LABEL)

    # Labels
    style.configure("TLabel", background=_BG, foreground=_FG, font=_FONT_BODY)
    style.configure("Title.TLabel", background=_BG, foreground=_FG,
                     font=_FONT_SECTION)
    style.configure("Accent.TLabel", background=_BG, foreground=_ACCENT)

    # Buttons
    style.configure("TButton", background=_BG_FIELD, foreground=_FG,
                     padding=(12, 6), borderwidth=1, relief="flat",
                     font=_FONT_BODY)
    style.map("TButton",
              background=[("active", _ACCENT), ("!active", _BG_FIELD)],
              foreground=[("active", "#ffffff"), ("!active", _FG)])

    # Accent button (e.g. Edit)
    style.configure("Accent.TButton", background=_ACCENT, foreground="#ffffff",
                     padding=(14, 7), font=_FONT_BODY)
    style.map("Accent.TButton",
              background=[("active", "#00d4b8"), ("!active", _ACCENT)])

    # Entry
    style.configure("TEntry", fieldbackground=_BG_FIELD, foreground=_FG,
                     insertcolor=_FG, borderwidth=1, relief="flat",
                     padding=(6, 4))
    style.map("TEntry",
              fieldbackground=[("focus", "#222222")],
              bordercolor=[("focus", _ACCENT)])

    # Scrollbar — borderwidth must be >= 1 so clam can render arrow
    # pixmaps without creating a zero-dimension image (X_CreatePixmap
    # BadValue 0x0).  borderwidth=1 keeps the look minimal.
    style.configure("Vertical.TScrollbar", background=_BG_FIELD,
                     troughcolor=_BG, borderwidth=1, relief="flat",
                     arrowcolor=_FG_DIM)
    style.map("Vertical.TScrollbar",
              background=[("active", _FG_DIM)])

    # Separator
    style.configure("TSeparator", background=_BORDER)

    # Listbox (native tk — style via config)
    # Listbox native tk styling via option_add.
    # Note: *Listbox.borderWidth and *Listbox.highlightThickness are NOT
    # overridden here — clam's internal rendering needs the default border
    # area to avoid X_CreatePixmap BadValue(0x0) on some X servers.
    root.option_add("*Listbox.background", _BG_FIELD)
    root.option_add("*Listbox.foreground", _FG)
    root.option_add("*Listbox.selectBackground", _ACCENT)
    root.option_add("*Listbox.selectForeground", "#ffffff")
    root.option_add("*Listbox.activeForeground", _ACCENT)

    root.configure(bg=_BG)


class StoryBrowserWindow:
    """Window utama: daftar cerita + search + edit."""

    def __init__(self, root):
        self.root = root
        self.root.title("Browser Cerita — iforeman-story")
        self.root.geometry("560x560")
        self.root.minsize(420, 380)
        _apply_theme(root)

        self.folders = []  # list nama folder valid

        self._build_ui()
        self._load_and_refresh()

    # ── UI ────────────────────────────────────────────────────────────

    def _build_ui(self):
        # Top frame: search + refresh
        top = ttk.Frame(self.root, padding=(12, 12, 12, 8))
        top.pack(fill=tk.X)

        ttk.Label(top, text="Filter:").pack(side=tk.LEFT)
        self.search_var = tk.StringVar()
        self.search_var.trace_add("write", lambda *_: self._populate_list())
        self.search_entry = ttk.Entry(top, textvariable=self.search_var, width=28)
        self.search_entry.pack(side=tk.LEFT, padx=(6, 8), fill=tk.X, expand=True)
        self.search_entry.focus_set()

        self.refresh_btn = ttk.Button(top, text="⟳", width=3, command=self._load_and_refresh)
        self.refresh_btn.pack(side=tk.LEFT)

        # Listbox + scrollbar
        list_frame = ttk.Frame(self.root, padding=(12, 0, 12, 12))
        list_frame.pack(fill=tk.BOTH, expand=True)

        self.listbox = tk.Listbox(
            list_frame,
            activestyle="underline",
            font=_FONT_LIST,
            highlightthickness=0,
            selectborderwidth=0,
            relief="flat",
        )
        self.listbox.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)

        scrollbar = ttk.Scrollbar(list_frame, orient=tk.VERTICAL, command=self.listbox.yview)
        scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
        self.listbox.config(yscrollcommand=scrollbar.set)

        # Double-click → edit
        self.listbox.bind("<Double-Button-1>", lambda e: self._edit_selected())

        # Bottom frame: edit button + count
        bottom = ttk.Frame(self.root, padding=(12, 8, 12, 12))
        bottom.pack(fill=tk.X)

        self.edit_btn = ttk.Button(
            bottom, text="Edit", style="Accent.TButton",
            command=self._edit_selected, state=tk.DISABLED,
        )
        self.edit_btn.pack(side=tk.LEFT)

        self.count_label = ttk.Label(bottom, text="0 cerita", foreground=_FG_DIM)
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
                data = json.load(f)
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
        _apply_theme(saver_root)
        StorySaverWindow(saver_root, folder_name)


def main():
    root = tk.Tk()
    app = StoryBrowserWindow(root)
    root.mainloop()


if __name__ == "__main__":
    main()
