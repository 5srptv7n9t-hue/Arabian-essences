#!/usr/bin/env python3
"""
Empaqueta el juego modular en UN solo archivo HTML autocontenido (inline el
CSS y todos los .js en el orden de index.html). Util para compartir o subir a
un solo lugar. No cambia nada del juego.

Uso:  python3 tools/bundle.py            -> genera dist/potrero-bundle.html
      python3 tools/bundle.py salida.html
"""
import re, os, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, "dist", "potrero-bundle.html")

with open(os.path.join(ROOT, "index.html"), encoding="utf-8") as f:
    html = f.read()

# inline CSS: <link rel="stylesheet" href="styles.css"> -> <style>...</style>
def inline_css(m):
    href = m.group(1)
    with open(os.path.join(ROOT, href), encoding="utf-8") as f:
        return "<style>\n" + f.read() + "\n</style>"
html = re.sub(r'<link[^>]*href="([^"]+\.css)"[^>]*>', inline_css, html)

# juntar todos los <script src="..."> en un solo <script>
srcs = re.findall(r'<script src="([^"]+)"></script>', html)
parts = []
for s in srcs:
    with open(os.path.join(ROOT, s), encoding="utf-8") as f:
        parts.append("/* ===== " + s + " ===== */\n" + f.read())
bundle_js = "<script>\n" + "\n".join(parts) + "\n</script>"
# reemplazar el bloque completo de <script src> por el bundle
html = re.sub(r'(?:\s*<script src="[^"]+"></script>)+', "\n" + bundle_js, html, count=1)

os.makedirs(os.path.dirname(OUT), exist_ok=True)
with open(OUT, "w", encoding="utf-8") as f:
    f.write(html)
print("bundle escrito en", OUT, "(", os.path.getsize(OUT), "bytes )")
