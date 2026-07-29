#!/usr/bin/env python3
"""
Separa potrero.html (monolitico) en modulos SIN cambiar comportamiento.

Reglas:
 - Se carga como scripts CLASICOS en orden (no ES modules): preserva globals
   y los onclick inline del HTML.
 - La concatenacion de los .js, en el orden de index.html, reproduce EXACTO
   el contenido del <script> original (verificado por sha256).
 - Cada .js emitido es JS sintacticamente valido por si mismo (verificado con
   `node --check`). Los marcadores de seccion que caen en medio de una
   estructura se fusionan con su vecino para no romper el parseo.
"""
import re, os, sys, hashlib, subprocess, tempfile

SRC = sys.argv[1]
OUT = sys.argv[2]

with open(SRC, "r", encoding="utf-8") as f:
    html = f.read()

m_style = re.search(r"<style[^>]*>(.*?)</style>", html, re.S)
m_script = re.search(r"<script[^>]*>(.*?)</script>", html, re.S)
assert m_style and m_script, "no se encontraron style/script"
css = m_style.group(1)
js = m_script.group(1)

marker_re = re.compile(r"/\*\s*={2,}[^*\n]*={2,}\s*\*/")
starts = [mm.start() for mm in marker_re.finditer(js)]
assert starts, "no hay marcadores de seccion"
prelude = js[:starts[0]]

raw_chunks = []
for i, s in enumerate(starts):
    e = starts[i + 1] if i + 1 < len(starts) else len(js)
    raw_chunks.append(js[s:e])

def title_of(chunk):
    t = marker_re.match(chunk).group(0)
    return re.sub(r"[/*=]", "", t).strip().lower()

# nombre destino segun el titulo de la PRIMERA seccion del archivo emitido
MAP = [
    ("datos",                       "data/01-naciones.js"),
    ("ligas",                       "data/02-ligas.js"),
    ("stats",                       "data/03-posiciones.js"),
    ("economía: nivel de club",     "economy/01-clubes-sueldos.js"),
    ("ruedas de prensa",            "events/01-prensa-data.js"),
    ("economía: gastos",            "economy/02-gastos-inversiones.js"),
    ("estado",                      "engine/01-estado.js"),
    ("editor inicial",              "engine/02-editor.js"),
    ("hold to repeat",              "ui/01-hold-repeat.js"),
    ("talento oculto",              "engine/03-talento.js"),
    ("crear",                       "engine/04-crear.js"),
    ("ovr ponderado",               "engine/05-ovr.js"),
    ("contratos y sueldo",          "economy/03-contratos.js"),
    ("panel + sp",                  "ui/02-panel.js"),
    ("minijuegos de finales",       "minigames/01-minijuegos.js"),
    ("motor de turnos",             "engine/06-turnos.js"),
    ("lesiones",                    "engine/07-lesiones.js"),
    ("eventos",                     "events/02-eventos.js"),
    ("transferencias",              "engine/08-transferencias.js"),
    ("finales de club",             "engine/09-finales-club.js"),
    ("torneos de selección",        "engine/10-seleccion.js"),
    ("rueda de prensa",             "events/03-prensa-turno.js"),
    ("oferta de jeque",             "economy/04-jeque.js"),
    ("arquero",                     "events/04-arquero.js"),
    ("avance",                      "engine/11-temporada.js"),
    ("progresión automática",       "engine/12-progresion.js"),
    ("retiro",                      "engine/13-retiro.js"),
    ("toast + init",                "ui/03-toast-init.js"),
    ("pantalla de finanzas",        "economy/05-finanzas.js"),
    ("representante",               "economy/06-representante.js"),
    ("modales",                     "ui/04-modales.js"),
]
assert len(raw_chunks) == len(MAP), f"chunks={len(raw_chunks)} != map={len(MAP)}"

def dest_for(title):
    for needle, dest in MAP:
        if needle in title:
            return dest
    raise SystemExit("sin mapeo para: " + title)

def node_check_ok(code):
    with tempfile.NamedTemporaryFile("w", suffix=".js", delete=False, encoding="utf-8") as tf:
        tf.write(code)
        tmp = tf.name
    try:
        r = subprocess.run(["node", "--check", tmp], capture_output=True, text=True)
        return r.returncode == 0
    finally:
        os.unlink(tmp)

# --- acumular chunks hasta que el buffer sea JS valido; ahi emitir archivo ---
emitted = []  # (dest, content, [titles])
buf = ""
buf_titles = []
buf_first_title = None
for chunk in raw_chunks:
    t = title_of(chunk)
    if not buf:
        buf_first_title = t
    buf += chunk
    buf_titles.append(t)
    if node_check_ok(buf):
        dest = dest_for(buf_first_title)
        emitted.append((dest, buf, buf_titles))
        buf = ""
        buf_titles = []
        buf_first_title = None
# resto (no deberia quedar, pero por las dudas)
if buf:
    if not node_check_ok(buf):
        raise SystemExit("resto final no parsea: " + str(buf_titles))
    emitted.append((dest_for(buf_first_title), buf, buf_titles))

# --- sub-split: separar archivos que quedaron mezclados, cortando en limites
# de sentencia top-level (verificado con node --check). Cada anchor es el
# comienzo (a inicio de linea) de un nuevo archivo. La concatenacion de las
# partes == el archivo original (byte a byte). ---
SUBSPLIT = {
    # el bloque de economia arrastro los arrays de datos de eventos/prensa,
    # porque el comentario "RUEDAS DE PRENSA" cae DENTRO del array EVENTS.
    "economy/01-clubes-sueldos.js": [
        ("\nconst EVENTS = [",            "data/04-eventos.js"),
        ("\nconst EVENTS_RANDOM = [",     "data/05-eventos-random.js"),
        ("\nconst PRESS_CONFERENCES = [", "data/06-prensa.js"),
    ],
}

def apply_subsplit(dest, content):
    """Devuelve [(dest, content), ...] respetando el orden y byte-identico."""
    anchors = SUBSPLIT.get(dest)
    if not anchors:
        return [(dest, content)]
    # localizar cada anchor en el contenido
    cuts = [(0, dest)]
    for pat, newdest in anchors:
        idx = content.find(pat)
        if idx == -1:
            raise SystemExit(f"anchor no encontrado en {dest}: {pat!r}")
        cuts.append((idx + 1, newdest))  # +1: el \n queda con la parte previa
    cuts.sort()
    parts = []
    for i, (start, nd) in enumerate(cuts):
        end = cuts[i + 1][0] if i + 1 < len(cuts) else len(content)
        piece = content[start:end]
        if not node_check_ok(piece):
            raise SystemExit(f"sub-parte no parsea: {nd}")
        parts.append((nd, piece))
    # verificar byte-identidad de la union
    assert "".join(p for _, p in parts) == content, "subsplit rompio bytes"
    return parts

# evitar colisiones de nombre (si dos bloques mapean al mismo dest)
seen = {}
final = []
_expanded = []
for dest, content, titles in emitted:
    for nd, npart in apply_subsplit(dest, content):
        _expanded.append((nd, npart, titles))
emitted = _expanded
for dest, content, titles in emitted:
    if dest in seen:
        base, ext = os.path.splitext(dest)
        seen[dest] += 1
        dest = f"{base}-{seen[dest]}{ext}"
    else:
        seen[dest] = 0
    final.append((dest, content, titles))

# --- escribir ---
os.makedirs(OUT, exist_ok=True)
with open(os.path.join(OUT, "styles.css"), "w", encoding="utf-8") as f:
    f.write(css)
for dest, content, _ in final:
    p = os.path.join(OUT, dest)
    os.makedirs(os.path.dirname(p), exist_ok=True)
    with open(p, "w", encoding="utf-8") as f:
        f.write(content)

# --- index.html ---
ordered = [d for d, _, _ in final]
scripts_block = "\n".join(f'  <script src="{d}"></script>' for d in ordered)
new_html = html[:m_style.start()] + '<link rel="stylesheet" href="styles.css">' + html[m_style.end():]
m_script2 = re.search(r"<script[^>]*>.*?</script>", new_html, re.S)
new_html = new_html[:m_script2.start()] + scripts_block + new_html[m_script2.end():]
with open(os.path.join(OUT, "index.html"), "w", encoding="utf-8") as f:
    f.write(new_html)

# --- verificacion byte-identica ---
recombined = prelude + "".join(c for _, c, _ in final)
h_orig = hashlib.sha256(js.encode()).hexdigest()
h_new = hashlib.sha256(recombined.encode()).hexdigest()
print("archivos JS emitidos:", len(final))
print("JS reconstruido:", "IDENTICO" if h_orig == h_new else "!!! DIFERENTE !!!", h_orig[:12])
print()
for dest, content, titles in final:
    merged = f"  (fusiona {len(titles)}: {', '.join(titles)})" if len(titles) > 1 else ""
    print(f"  {dest:42s} {len(content):>7d} b{merged}")
