#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Trae escudos REALES de clubes desde el repo open source (PNG transparente):
    https://github.com/luukhopman/football-logos   (la web football-logos.cc)

Clona el repo y copia a recursos_juego/escudos/<slug>.png los clubes del juego
que existan ahi, matcheando SOLO dentro de la liga correspondiente para no
confundir equipos. Cubre las grandes ligas europeas (Premier, LaLiga, Serie A,
Bundesliga, Ligue 1, Eredivisie, Liga Portugal). Los clubes que no esten (p.ej.
Sudamerica, MLS, Liga MX, Arabia, divisiones de ascenso) siguen usando el
escudo GENERADO del juego.

Uso:
    python3 escudos_desde_github.py

NOTA LEGAL (LICENCIAS.txt): los escudos son marcas registradas de cada club.
Uso personal / desarrollo. No redistribuir comercialmente sin permiso.
"""
import os, re, sys, json, shutil, subprocess, tempfile, unicodedata

AQUI = os.path.dirname(os.path.abspath(__file__))
JUEGO = os.path.dirname(AQUI)
OUT = os.path.join(AQUI, "escudos")
os.makedirs(OUT, exist_ok=True)
REPO_URL = "https://github.com/luukhopman/football-logos.git"

# liga del juego -> carpeta del repo (las que el repo tiene)
LIGA_REPO = {
    "Inglaterra — Premier League": "England - Premier League",
    "España — LaLiga": "Spain - LaLiga",
    "Italia — Serie A": "Italy - Serie A",
    "Alemania — Bundesliga": "Germany - Bundesliga",
    "Francia — Ligue 1": "France - Ligue 1",
    "Países Bajos — Eredivisie": "Netherlands - Eredivisie",
    "Portugal — Primeira Liga": "Portugal - Liga Portugal",
}
ALIAS = {
    "Man United":"Manchester United","Bayern":"Bayern Munich","Inter":"Inter Milan",
    "Milan":"AC Milan","Atlético":"Atletico Madrid","Betis":"Real Betis",
    "Athletic":"Athletic Bilbao","Marsella":"Marseille","Mónaco":"Monaco","Lyon":"Lyon",
    "Niza":"Nice","Estrasburgo":"Strasbourg","Dortmund":"Borussia Dortmund",
    "PSG":"Paris Saint Germain","Napoli":"Napoli","Sporting":"Sporting CP",
    "PSV":"PSV Eindhoven","Ajax":"Ajax","Benfica":"Benfica","Porto":"Porto",
}
STOP = {"fc","afc","cfc","cf","sc","ac","bc","ss","ssc","as","rc","cd","ud","cp",
        "vfb","vfl","rb","ogc","de","la","el","calcio","club","1909","1907","1899",
        "1913","1846","football","hove","albion","fk","the","losc","tsg","04"}

def norm(s):
    s = unicodedata.normalize("NFKD", s).encode("ascii","ignore").decode("ascii").lower()
    s = re.sub(r"[^a-z0-9 ]", " ", s)
    return {t for t in s.split() if t and t not in STOP}

def slug(s):
    s = unicodedata.normalize("NFKD", s).encode("ascii","ignore").decode("ascii")
    return re.sub(r"[^A-Za-z0-9]+","-", s).strip("-").lower() or "x"

def parse_leagues():
    txt = open(os.path.join(JUEGO,"data/02-ligas.js"),encoding="utf-8").read()
    ini = txt.index("const LEAGUES"); fin = txt.index("};",ini)
    blk = re.sub(r"//.*","",txt[ini:fin]); d={}
    for m in re.finditer(r'"([^"]+)"\s*:\s*\[([^\]]*)\]', blk):
        d[m.group(1)] = re.findall(r'"([^"]+)"', m.group(2))
    return d

def best(club, candidatos):
    qt = norm(ALIAS.get(club, club))
    if not qt: return None, 0
    mej, msc = None, 0.0
    for arch, nom in candidatos:
        ct = norm(nom); inter = qt & ct
        if not inter: continue
        sc = len(inter)/len(qt) + 0.25*len(inter)/len(ct)
        if qt <= ct or ct <= qt: sc += 0.5
        if sc > msc: mej, msc = arch, sc
    return mej, msc

def main():
    tmp = tempfile.mkdtemp(prefix="flogos_")
    print("Clonando", REPO_URL, "...")
    r = subprocess.run(["git","clone","--depth","1",REPO_URL,tmp],
                       stdout=subprocess.DEVNULL, stderr=subprocess.PIPE)
    base = os.path.join(tmp,"logos")
    if r.returncode!=0 or not os.path.isdir(base):
        print("No se pudo clonar el repo:", r.stderr.decode()[:200]); sys.exit(1)
    leagues = parse_leagues(); copiados=0; sin=[]
    for liga, clubes in leagues.items():
        carp = LIGA_REPO.get(liga)
        if not carp or not os.path.isdir(os.path.join(base,carp)): continue
        cand = [(os.path.join(base,carp,f), f[:-4]) for f in os.listdir(os.path.join(base,carp)) if f.endswith(".png")]
        for club in clubes:
            m, sc = best(club, cand)
            if m and sc>=0.75:
                shutil.copyfile(m, os.path.join(OUT, slug(club)+".png")); copiados+=1
                print("  OK  %-22s <- %s" % (club, os.path.basename(m)))
            else:
                sin.append(club)
    shutil.rmtree(tmp, ignore_errors=True)
    print("\nEscudos reales copiados: %d" % copiados)
    print("Sin escudo real (usan generado): %d" % len(sin))

if __name__ == "__main__":
    main()
