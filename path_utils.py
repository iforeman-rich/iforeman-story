#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
path_utils.py — Utilitas folder & validasi path (diport dari server.py).

Menyediakan:
    scan_folders()          — subfolder langsung di root yang berisi content.json
    is_safe_folder_name()   — validasi keamanan nama folder
    resolve_content_path()  — path absolut ke content.json (dynamic allowlist)

Semua fungsi ini dipindahkan dari server.py sebelum file itu dihapus,
sehingga logic scan & validasi tetap identik.
"""

import os

CONTENT_FILENAME = "content.json"

# Root folder = lokasi file ini (sama seperti KISAH_DIR di server.py).
ROOT_DIR = os.path.dirname(os.path.abspath(__file__))


def scan_folders():
    """Subfolder LANGSUNG di dalam root ini yang berisi content.json."""
    result = []
    try:
        with os.scandir(ROOT_DIR) as it:
            for entry in it:
                if entry.is_dir(follow_symlinks=False) and os.path.isfile(
                    os.path.join(entry.path, CONTENT_FILENAME)
                ):
                    result.append(entry.name)
    except OSError:
        pass
    return sorted(result)


def is_safe_folder_name(name):
    """Nama folder aman: non-kosong, bukan '.'/'..', tanpa separator path."""
    if not name or name in (".", ".."):
        return False
    if "/" in name or "\\" in name:
        return False
    if ".." in name:  # defense-in-depth, walau separator sudah dicek
        return False
    return True


def resolve_content_path(folder):
    """
    Kembalikan path absolut <folder>/content.json, atau None kalau
    folder invalid / tidak ada di whitelist hasil scan (dynamic allowlist).
    """
    if not is_safe_folder_name(folder):
        return None
    if folder not in scan_folders():  # whitelist dinamis
        return None
    return os.path.join(ROOT_DIR, folder, CONTENT_FILENAME)


def get_folder_path(folder):
    """Kembalikan path absolut ke folder, atau None kalau invalid."""
    if not is_safe_folder_name(folder):
        return None
    if folder not in scan_folders():
        return None
    return os.path.join(ROOT_DIR, folder)
