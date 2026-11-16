#!/usr/bin/env python3
"""Generate the Station Atlas PNG icons without external image libraries.

The design mirrors static/favicon.svg: an amber rounded tile with a dark train
front. Run from the repository root: python3 tools/generate-icons.py
"""
import struct
import zlib
from pathlib import Path

AMBER = (251, 191, 36, 255)
INK = (6, 10, 18, 255)
CLEAR = (0, 0, 0, 0)


def rounded_rect(x, y, w, h, r, px, py):
    if not (x <= px <= x + w and y <= py <= y + h):
        return False
    cx = min(max(px, x + r), x + w - r)
    cy = min(max(py, y + r), y + h - r)
    return (px - cx) ** 2 + (py - cy) ** 2 <= r * r


def circle(cx, cy, r, px, py):
    return (px - cx) ** 2 + (py - cy) ** 2 <= r * r


def color_at(px, py):
    # Work in a 64x64 design space.
    if not rounded_rect(0, 0, 64, 64, 16, px, py):
        return CLEAR
    if rounded_rect(17, 11, 30, 37, 7, px, py):
        # Train body: amber window and details punched out of the dark shape.
        if rounded_rect(22, 17, 20, 13, 3, px, py):
            return AMBER
        if circle(25, 39, 3, px, py) or circle(39, 39, 3, px, py):
            return AMBER
        if rounded_rect(28, 44, 8, 2.5, 1.25, px, py):
            return AMBER
        return INK
    if rounded_rect(18, 51, 10, 3, 1.5, px, py) or rounded_rect(
        36, 51, 10, 3, 1.5, px, py
    ):
        return INK
    return AMBER


def chunk(kind, data):
    return (
        struct.pack(">I", len(data))
        + kind
        + data
        + struct.pack(">I", zlib.crc32(kind + data) & 0xFFFFFFFF)
    )


def write_png(path, size):
    raw = bytearray()
    scale = 64 / size
    for row in range(size):
        raw.append(0)  # filter: none
        for col in range(size):
            px = (col + 0.5) * scale
            py = (row + 0.5) * scale
            raw.extend(color_at(px, py))

    png = (
        b"\x89PNG\r\n\x1a\n"
        + chunk(b"IHDR", struct.pack(">IIBBBBB", size, size, 8, 6, 0, 0, 0))
        + chunk(b"IDAT", zlib.compress(bytes(raw), 9))
        + chunk(b"IEND", b"")
    )
    Path(path).write_bytes(png)
    print(f"wrote {path} ({len(png)} bytes)")


if __name__ == "__main__":
    write_png("static/favicon.png", 128)
    write_png("static/icon-512.png", 512)
