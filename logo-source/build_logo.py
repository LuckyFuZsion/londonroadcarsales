"""Builds the site logo assets from logo-source.jpg (lockup on the left, symbol on the right).

Run from the project root:  python logo-source/build_logo.py
Outputs go to public/. Needs Pillow, numpy and opencv-python.
"""
import cv2
import numpy as np
from PIL import Image

SRC = "logo-source/logo-source.jpg"
OUT = "public"
SPLIT_LEFT_END = 1290   # the thin divider line sits at x ~ 1315
SPLIT_RIGHT_START = 1340


def load_rgba(box):
    img = np.array(Image.open(SRC).convert("RGB"))
    x0, x1 = box
    return img[:, x0:x1].astype(np.float32)


def extract(box, pad_ratio=0.0):
    """Returns (rgba uint8 array, green_rgb, grey_rgb) cropped tight to the ink."""
    rgb = load_rgba(box)
    minc = rgb.min(axis=2)
    alpha = np.clip((235.0 - minc) / (235.0 - 95.0), 0, 1)

    # Solid-colour classification: green vs charcoal
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    is_green = (g > r + 14) & (g > b + 6)
    solid = alpha > 0.98
    green_rgb = np.median(rgb[solid & is_green], axis=0).round().astype(np.uint8) if (solid & is_green).any() else None
    grey_sel = solid & ~is_green
    grey_rgb = np.median(rgb[grey_sel], axis=0).round().astype(np.uint8) if grey_sel.any() else None

    out = np.zeros(rgb.shape[:2] + (4,), np.uint8)
    out[..., 3] = (alpha * 255).round().astype(np.uint8)
    if green_rgb is not None:
        out[is_green & (alpha > 0)] = np.append(green_rgb, 0)
    if grey_rgb is not None:
        out[~is_green & (alpha > 0)] = np.append(grey_rgb, 0)
    out[..., 3] = (alpha * 255).round().astype(np.uint8)

    ys, xs = np.where(alpha > 0.5)
    y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
    return out[y0:y1, x0:x1], green_rgb, grey_rgb


def hexof(rgb):
    return "#%02x%02x%02x" % tuple(int(v) for v in rgb)


def trace(rgba, rgb_match, scale=4, eps=0.7):
    """Traces pixels of one colour class into an SVG path string (even-odd fill)."""
    h, w = rgba.shape[:2]
    a = rgba[..., 3].astype(np.float32) / 255.0
    sel = np.all(np.abs(rgba[..., :3].astype(int) - np.array(rgb_match, int)) < 6, axis=2) & (a > 0)
    cover = np.where(sel, a, 0).astype(np.float32)
    # spread antialiased edge pixels of the other class so shapes meet cleanly
    big = cv2.resize(cover, (w * scale, h * scale), interpolation=cv2.INTER_CUBIC)
    big = cv2.GaussianBlur(big, (0, 0), scale * 0.35)
    mask = (big > 0.5).astype(np.uint8) * 255
    contours, hier = cv2.findContours(mask, cv2.RETR_CCOMP, cv2.CHAIN_APPROX_NONE)
    parts = []
    for c in contours:
        if cv2.contourArea(c) < 4 * scale * scale:
            continue
        ap = cv2.approxPolyDP(c, eps * scale / 4, True).reshape(-1, 2) / scale
        parts.append("M" + " L".join(f"{x:.2f} {y:.2f}" for x, y in ap) + " Z")
    return " ".join(parts)


def write_svg(path, rgba, green, grey):
    h, w = rgba.shape[:2]
    paths = []
    for rgb in (grey, green):
        if rgb is None:
            continue
        d = trace(rgba, rgb)
        if d:
            paths.append(f'<path fill="{hexof(rgb)}" fill-rule="evenodd" d="{d}"/>')
    svg = f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}">' + "".join(paths) + "</svg>"
    open(path, "w", encoding="utf-8").write(svg)


def save_png(rgba, path, width=None, pad=0):
    im = Image.fromarray(rgba, "RGBA")
    if width:
        ratio = width / im.width
        im = im.resize((width, round(im.height * ratio)), Image.LANCZOS)
    if pad:
        canvas = Image.new("RGBA", (im.width + 2 * pad, im.height + 2 * pad), (0, 0, 0, 0))
        canvas.paste(im, (pad, pad), im)
        im = canvas
    im.save(path)
    return im


def square(symbol_rgba, size, bg, pad_frac=0.16, tint=None):
    im = Image.fromarray(symbol_rgba, "RGBA")
    if tint is not None:
        arr = np.array(im)
        arr[..., :3] = tint
        im = Image.fromarray(arr, "RGBA")
    inner = round(size * (1 - 2 * pad_frac))
    ratio = inner / max(im.size)
    im = im.resize((max(1, round(im.width * ratio)), max(1, round(im.height * ratio))), Image.LANCZOS)
    canvas = Image.new("RGBA", (size, size), bg)
    canvas.paste(im, ((size - im.width) // 2, (size - im.height) // 2), im)
    return canvas


def main():
    lock, g1, k1 = extract((0, SPLIT_LEFT_END))
    sym, g2, _ = extract((SPLIT_RIGHT_START, 2000))
    print("lockup", lock.shape, "green", g1, "grey", k1)
    print("symbol", sym.shape, "green", g2)

    save_png(lock, f"{OUT}/logo.png", width=1200)
    save_png(sym, f"{OUT}/logo-symbol.png", width=512)
    write_svg(f"{OUT}/logo.svg", lock, g1, k1)
    write_svg(f"{OUT}/logo-symbol.svg", sym, g2, None)
    write_svg(f"{OUT}/icon.svg", sym, g2, None)

    # Favicons: light tab = green symbol on transparent; dark tab = lighter green
    square(sym, 32, (0, 0, 0, 0), pad_frac=0.04).save(f"{OUT}/icon-light-32x32.png")
    square(sym, 32, (0, 0, 0, 0), pad_frac=0.04, tint=(122, 181, 149)).save(f"{OUT}/icon-dark-32x32.png")
    # Apple touch icon: opaque white background
    square(sym, 180, (255, 255, 255, 255), pad_frac=0.2).convert("RGB").save(f"{OUT}/apple-icon.png")
    square(sym, 192, (255, 255, 255, 255), pad_frac=0.2).convert("RGB").save(f"{OUT}/icon-192.png")
    square(sym, 512, (255, 255, 255, 255), pad_frac=0.2).convert("RGB").save(f"{OUT}/icon-512.png")
    ico_src = square(sym, 256, (0, 0, 0, 0), pad_frac=0.04)
    ico_src.save(f"{OUT}/favicon.ico", sizes=[(16, 16), (32, 32), (48, 48)])

    # Social share image 1200x630, lockup on white
    og = Image.new("RGB", (1200, 630), (255, 255, 255))
    lk = Image.fromarray(lock, "RGBA")
    target_w = 900
    lk = lk.resize((target_w, round(lk.height * target_w / lk.width)), Image.LANCZOS)
    og.paste(lk, ((1200 - lk.width) // 2, (630 - lk.height) // 2), lk)
    og.save(f"{OUT}/og-image.png", optimize=True)


main()
