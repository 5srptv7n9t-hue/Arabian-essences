#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Descarga automatica de recursos graficos para el juego "El Camino / Potrero":
  - Banderas PNG de los paises disponibles.
  - Escudos PNG de todos los clubes.
  - Logos PNG de las competencias (Libertadores, Champions, Mundial, ligas, etc.).

Fuentes (abiertas):
  - Banderas: flagcdn.com (PNG por codigo de pais). Fallback: repo flag-icons
    (GitHub, SVG -> PNG con cairosvg) para redes que bloquean flagcdn.
  - Escudos y competencias: TheSportsDB (API abierta de futbol, key gratis "3").
    Busca por nombre y baja el badge/logo oficial.

Uso:
    python3 descargar_recursos.py

Todo se guarda dentro de esta carpeta 'recursos_juego':
    recursos_juego/banderas/     ar.png, br.png, ...
    recursos_juego/escudos/      boca-juniors.png, river-plate.png, ...
    recursos_juego/competencias/ champions-league.png, ...
    recursos_juego/_reporte.json (que se bajo y que falto)

NOTA LEGAL (leer LICENCIAS.txt): las banderas son de uso libre. Los escudos de
club y los logos de competencias son MARCAS REGISTRADAS / con copyright de cada
entidad. Se descargan para uso personal/desarrollo de tu juego; no los
redistribuyas comercialmente sin los derechos correspondientes.
"""

import os, re, sys, json, time, unicodedata, urllib.parse, urllib.request

# ----------------------------------------------------------------------------
# Rutas
# ----------------------------------------------------------------------------
AQUI = os.path.dirname(os.path.abspath(__file__))
JUEGO = os.path.dirname(AQUI)                     # carpeta potrero/
DIR_BANDERAS = os.path.join(AQUI, "banderas")
DIR_ESCUDOS = os.path.join(AQUI, "escudos")
DIR_COMPETENCIAS = os.path.join(AQUI, "competencias")
for d in (DIR_BANDERAS, DIR_ESCUDOS, DIR_COMPETENCIAS):
    os.makedirs(d, exist_ok=True)

SPORTSDB_KEY = os.environ.get("SPORTSDB_KEY", "3")   # "3" = key de prueba gratis
UA = "Mozilla/5.0 (PotreroAssetBot; juego personal)"
PAUSA = float(os.environ.get("POTRERO_PAUSA", "0.4"))   # segundos entre requests
INTENTOS = int(os.environ.get("POTRERO_INTENTOS", "3")) # reintentos por descarga

# ----------------------------------------------------------------------------
# 1) Leer los datos reales del juego (para no repetir listas)
# ----------------------------------------------------------------------------
def leer(archivo):
    with open(os.path.join(JUEGO, archivo), encoding="utf-8") as f:
        return f.read()

def parse_nations():
    txt = leer("data/01-naciones.js")
    m = re.search(r"const NATIONS\s*=\s*(\[[^\]]*\])", txt)
    return json.loads(m.group(1))

def parse_leagues():
    txt = leer("data/02-ligas.js")
    ini = txt.index("const LEAGUES")
    fin = txt.index("};", ini)
    blk = txt[ini:fin]
    blk = re.sub(r"//.*", "", blk)                       # sacar comentarios
    ligas, clubes = [], []
    for m in re.finditer(r'"([^"]+)"\s*:\s*\[([^\]]*)\]', blk):
        ligas.append(m.group(1))
        clubes += re.findall(r'"([^"]+)"', m.group(2))
    # sin duplicados, conservando orden
    clubes = list(dict.fromkeys(clubes))
    return ligas, clubes

NATIONS = parse_nations()
LIGAS, CLUBES = parse_leagues()

# Competencias (torneos) del juego + ligas domesticas
TORNEOS = [
    "Copa Libertadores", "Copa Sudamericana", "Champions League", "Europa League",
    "Mundial de Clubes", "Copa Intercontinental", "Copa del Mundo", "Copa América",
    "Eurocopa", "Nations League", "Juegos Olímpicos",
]
COMPETENCIAS = TORNEOS + LIGAS

# ----------------------------------------------------------------------------
# 2) Mapas de nombres
# ----------------------------------------------------------------------------
# pais -> codigo ISO (flagcdn / flag-icons). Inglaterra usa la subdivision gb-eng.
ISO = {
    "Argentina":"ar","Brasil":"br","Uruguay":"uy","Colombia":"co","España":"es",
    "Francia":"fr","Inglaterra":"gb-eng","Portugal":"pt","Italia":"it","Alemania":"de",
    "Países Bajos":"nl","México":"mx","Chile":"cl","Croacia":"hr","Nigeria":"ng",
    "Japón":"jp","Marruecos":"ma","Senegal":"sn","Estados Unidos":"us","Bélgica":"be",
}

# Nombre del club en el juego -> nombre para buscar en TheSportsDB (solo los que difieren)
ALIAS_CLUB = {
    "Man United":"Manchester United","Bayern":"Bayern Munich","Inter":"Inter Milan",
    "Milan":"AC Milan","Marsella":"Olympique Marseille","Mónaco":"AS Monaco",
    "Lyon":"Olympique Lyonnais","Niza":"OGC Nice","Estrasburgo":"RC Strasbourg",
    "Newell's":"Newell's Old Boys","Vélez":"Velez Sarsfield","Racing":"Racing Club",
    "Estudiantes":"Estudiantes L.P.","Huracán":"Huracan","Talleres":"Talleres Cordoba",
    "Atlético":"Atletico Madrid","Betis":"Real Betis","Athletic":"Athletic Bilbao",
    "Girona":"Girona FC","Sevilla":"Sevilla","Napoli":"SSC Napoli","Roma":"AS Roma",
    "Lazio":"SS Lazio","Atalanta":"Atalanta","Torino":"Torino","Bologna":"Bologna",
    "Leipzig":"RB Leipzig","Leverkusen":"Bayer Leverkusen","Frankfurt":"Eintracht Frankfurt",
    "Stuttgart":"VfB Stuttgart","Union Berlin":"Union Berlin","Schalke 04":"Schalke 04",
    "Hamburgo":"Hamburger SV","Dortmund":"Borussia Dortmund","Wolfsburg":"VfL Wolfsburg",
    "PSG":"Paris Saint-Germain","Lens":"RC Lens","Lille":"Lille OSC","Rennes":"Stade Rennais",
    "São Paulo":"Sao Paulo","Grêmio":"Gremio","Vasco":"Vasco da Gama","Atlético-MG":"Atletico Mineiro",
    "Chivas":"Guadalajara Chivas","América":"Club America","Cruz Azul":"Cruz Azul",
    "Pumas":"Pumas UNAM","Tigres":"Tigres UANL","Santos":"Santos Laguna",
    "Ajax":"Ajax","PSV":"PSV Eindhoven","AZ Alkmaar":"AZ Alkmaar","Twente":"FC Twente",
    "Sporting":"Sporting CP","Braga":"SC Braga","Vitória SC":"Vitoria Guimaraes",
    "Al-Hilal":"Al Hilal","Al-Nassr":"Al Nassr","Al-Ittihad":"Al Ittihad",
    "Al-Ahli":"Al Ahli Saudi","Al-Ettifaq":"Al Ettifaq","Al-Ittihad ":"Al Ittihad",
    "Inter Miami":"Inter Miami","LA Galaxy":"LA Galaxy","NY Red Bulls":"New York Red Bulls",
    "Seattle":"Seattle Sounders","Cincinnati":"FC Cincinnati","Austin FC":"Austin FC",
}

# Competencia del juego -> nombre de "liga" en TheSportsDB
ALIAS_COMP = {
    "Copa Libertadores":"CONMEBOL Libertadores","Copa Sudamericana":"CONMEBOL Sudamericana",
    "Champions League":"UEFA Champions League","Europa League":"UEFA Europa League",
    "Mundial de Clubes":"FIFA Club World Cup","Copa del Mundo":"FIFA World Cup",
    "Copa América":"CONMEBOL Copa America","Eurocopa":"UEFA Euro","Nations League":"UEFA Nations League",
    "Juegos Olímpicos":"Olympics Football","Copa Intercontinental":"FIFA Club World Cup",
    "Argentina — Primera División":"Argentinian Primera Division",
    "Inglaterra — Premier League":"English Premier League",
    "Inglaterra — Championship (2ª)":"English League Championship",
    "España — LaLiga":"Spanish La Liga","España — LaLiga 2 (2ª)":"Spanish La Liga 2",
    "Italia — Serie A":"Italian Serie A","Italia — Serie B (2ª)":"Italian Serie B",
    "Alemania — Bundesliga":"German Bundesliga","Alemania — 2. Bundesliga (2ª)":"German 2. Bundesliga",
    "Francia — Ligue 1":"French Ligue 1","Brasil — Brasileirão":"Brazilian Serie A",
    "Países Bajos — Eredivisie":"Dutch Eredivisie","Portugal — Primeira Liga":"Portuguese Primeira Liga",
    "EE.UU. — MLS":"American Major League Soccer","México — Liga MX":"Mexican Primera League",
    "Arabia — Saudi Pro League":"Saudi Pro League",
}

# ----------------------------------------------------------------------------
# 3) Utilidades
# ----------------------------------------------------------------------------
def slug(s):
    s = unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode("ascii")
    s = re.sub(r"[^A-Za-z0-9]+", "-", s).strip("-").lower()
    return s or "x"

def http_get(url, binario=False, intentos=None):
    if intentos is None: intentos = INTENTOS
    ultimo = None
    for i in range(intentos):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA})
            with urllib.request.urlopen(req, timeout=25) as r:
                data = r.read()
            return data if binario else data.decode("utf-8", "replace")
        except Exception as e:
            ultimo = e
            time.sleep(0.6 * (i + 1))
    raise ultimo

def bajar_binario(url, destino):
    data = http_get(url, binario=True)
    if not data or len(data) < 200:      # respuesta vacia / placeholder
        raise ValueError("respuesta muy chica (%d bytes)" % len(data or b""))
    with open(destino, "wb") as f:
        f.write(data)
    return len(data)

# ----------------------------------------------------------------------------
# 4) Descargas
# ----------------------------------------------------------------------------
reporte = {"banderas": {}, "escudos": {}, "competencias": {}, "faltantes": []}

def descargar_bandera(pais):
    iso = ISO.get(pais)
    destino = os.path.join(DIR_BANDERAS, (iso or slug(pais)) + ".png")
    if os.path.exists(destino):
        reporte["banderas"][pais] = "ya-estaba"
        return True
    if not iso:
        reporte["faltantes"].append("bandera:" + pais); return False
    # 1) flagcdn (PNG directo)
    try:
        bajar_binario("https://flagcdn.com/w320/%s.png" % iso, destino)
        reporte["banderas"][pais] = "flagcdn"
        return True
    except Exception as e1:
        pass
    # 2) fallback: flag-icons (SVG en GitHub) -> PNG con cairosvg
    try:
        import cairosvg
        svg = http_get("https://raw.githubusercontent.com/lipis/flag-icons/main/flags/4x3/%s.svg" % iso, binario=True)
        cairosvg.svg2png(bytestring=svg, write_to=destino, output_width=320)
        reporte["banderas"][pais] = "flag-icons(svg->png)"
        return True
    except Exception as e2:
        reporte["banderas"][pais] = "ERROR: %s" % e2
        reporte["faltantes"].append("bandera:" + pais)
        return False

def _sportsdb_badge_equipo(nombre):
    q = urllib.parse.quote(nombre)
    j = json.loads(http_get("https://www.thesportsdb.com/api/v1/json/%s/searchteams.php?t=%s" % (SPORTSDB_KEY, q)))
    equipos = j.get("teams") or []
    for t in equipos:
        badge = t.get("strBadge") or t.get("strTeamBadge")
        if badge:
            return badge + "/preview" if not badge.endswith("/preview") else badge, t.get("strTeam")
    return None, None

def descargar_escudo(club):
    destino = os.path.join(DIR_ESCUDOS, slug(club) + ".png")
    if os.path.exists(destino):
        reporte["escudos"][club] = "ya-estaba"; return True
    consulta = ALIAS_CLUB.get(club, club)
    try:
        badge, encontrado = _sportsdb_badge_equipo(consulta)
        if not badge:
            reporte["escudos"][club] = "sin-resultado"
            reporte["faltantes"].append("escudo:" + club); return False
        # el badge suele traer sufijo /preview (mini). Pedimos el grande sin /preview.
        url_grande = badge.replace("/preview", "")
        try:
            bajar_binario(url_grande, destino)
        except Exception:
            bajar_binario(badge, destino)
        reporte["escudos"][club] = "thesportsdb (%s)" % (encontrado or consulta)
        return True
    except Exception as e:
        reporte["escudos"][club] = "ERROR: %s" % e
        reporte["faltantes"].append("escudo:" + club); return False

_LIGAS_CACHE = None
def _sportsdb_todas_las_ligas():
    global _LIGAS_CACHE
    if _LIGAS_CACHE is None:
        j = json.loads(http_get("https://www.thesportsdb.com/api/v1/json/%s/all_leagues.php" % SPORTSDB_KEY))
        _LIGAS_CACHE = j.get("leagues") or []
    return _LIGAS_CACHE

def descargar_competencia(comp):
    destino = os.path.join(DIR_COMPETENCIAS, slug(comp) + ".png")
    if os.path.exists(destino):
        reporte["competencias"][comp] = "ya-estaba"; return True
    objetivo = ALIAS_COMP.get(comp, comp.split("—")[-1].strip())
    try:
        ligas = _sportsdb_todas_las_ligas()
        idliga = None
        obj = objetivo.lower()
        for L in ligas:
            nombres = [ (L.get("strLeague") or "").lower(), (L.get("strLeagueAlternate") or "").lower() ]
            if any(obj == n or (obj and obj in n) for n in nombres):
                idliga = L.get("idLeague"); break
        if not idliga:
            reporte["competencias"][comp] = "sin-match (%s)" % objetivo
            reporte["faltantes"].append("competencia:" + comp); return False
        det = json.loads(http_get("https://www.thesportsdb.com/api/v1/json/%s/lookupleague.php?id=%s" % (SPORTSDB_KEY, idliga)))
        info = (det.get("leagues") or [{}])[0]
        url = info.get("strBadge") or info.get("strLogo")
        if not url:
            reporte["competencias"][comp] = "sin-imagen"
            reporte["faltantes"].append("competencia:" + comp); return False
        bajar_binario(url, destino)
        reporte["competencias"][comp] = "thesportsdb (%s)" % (info.get("strLeague") or objetivo)
        return True
    except Exception as e:
        reporte["competencias"][comp] = "ERROR: %s" % e
        reporte["faltantes"].append("competencia:" + comp); return False

# ----------------------------------------------------------------------------
# 5) Correr
# ----------------------------------------------------------------------------
def barra(hechos, total):
    return "%d/%d" % (hechos, total)

def main():
    print("== Descargando recursos del juego ==")
    print("Paises: %d | Clubes: %d | Competencias: %d\n" % (len(NATIONS), len(CLUBES), len(COMPETENCIAS)))

    print("-> Banderas")
    ok = 0
    for i, p in enumerate(NATIONS, 1):
        if descargar_bandera(p): ok += 1
        print("   %s %-18s %s" % (barra(i, len(NATIONS)), p, reporte["banderas"].get(p, "")))
        time.sleep(PAUSA)
    print("   banderas OK: %d/%d\n" % (ok, len(NATIONS)))

    print("-> Escudos de clubes")
    ok = 0
    for i, c in enumerate(CLUBES, 1):
        if descargar_escudo(c): ok += 1
        print("   %s %-22s %s" % (barra(i, len(CLUBES)), c, reporte["escudos"].get(c, "")))
        time.sleep(PAUSA)
    print("   escudos OK: %d/%d\n" % (ok, len(CLUBES)))

    print("-> Logos de competencias")
    ok = 0
    for i, comp in enumerate(COMPETENCIAS, 1):
        if descargar_competencia(comp): ok += 1
        print("   %s %-34s %s" % (barra(i, len(COMPETENCIAS)), comp, reporte["competencias"].get(comp, "")))
        time.sleep(PAUSA)
    print("   competencias OK: %d/%d\n" % (ok, len(COMPETENCIAS)))

    with open(os.path.join(AQUI, "_reporte.json"), "w", encoding="utf-8") as f:
        json.dump(reporte, f, ensure_ascii=False, indent=2)

    faltan = len(reporte["faltantes"])
    print("== Listo. Guardado en: %s ==" % AQUI)
    print("Faltantes: %d (ver _reporte.json)" % faltan)
    if faltan:
        print("Sugerencia: revisá ALIAS_CLUB / ALIAS_COMP para afinar los nombres que no matchearon.")

if __name__ == "__main__":
    main()
