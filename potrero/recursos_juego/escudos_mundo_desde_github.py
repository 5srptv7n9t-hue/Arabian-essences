#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Trae escudos REALES de clubes de TODO el mundo + logos de las ligas, desde el
repo open source:
    https://github.com/diegosy12/Escudos_Futbol_2025-26   (PNG por pais/liga)

Copia a:
    recursos_juego/escudos/<slug-del-club>.png
    recursos_juego/competencias/<slug-de-la-liga>.png   (logo de cada liga)

Empareja SOLO dentro de la carpeta de la liga correspondiente. Cubre Argentina
(1a a 4a), Brasil, Mexico, USA, Arabia y las grandes ligas europeas. Los clubes
que no matcheen siguen con el escudo GENERADO del juego.

No trae competencias internacionales (Champions, Libertadores, etc.): ese repo
solo tiene ligas domesticas.

Uso:  python3 escudos_mundo_desde_github.py
NOTA LEGAL: escudos/logos son marcas registradas. Uso personal/desarrollo.
"""
import os, re, sys, shutil, subprocess, tempfile, unicodedata

AQUI = os.path.dirname(os.path.abspath(__file__))
JUEGO = os.path.dirname(AQUI)
OUT_ESC = os.path.join(AQUI, "escudos");       os.makedirs(OUT_ESC, exist_ok=True)
OUT_COMP = os.path.join(AQUI, "competencias"); os.makedirs(OUT_COMP, exist_ok=True)
REPO_URL = "https://github.com/diegosy12/Escudos_Futbol_2025-26.git"

# liga del juego -> carpeta de clubes en el repo
LIGA_CARPETA = {
    "Argentina — Primera División":        "Argentina/primeradivisionarg",
    "Argentina — Primera Nacional (2ª)":   "Argentina/primeranacional",
    "Argentina — Primera B Metro (3ª)":    "Argentina/primerab",
    "Argentina — Primera C (4ª)":          "Argentina/primerac",
    "Inglaterra — Premier League":         "Inglaterra/premier",
    "Inglaterra — Championship (2ª)":      "Inglaterra/championship",
    "España — LaLiga":                     "España/laliga",
    "España — LaLiga 2 (2ª)":              "España/segundadivisionesp",
    "Italia — Serie A":                    "Italia/seriea",
    "Italia — Serie B (2ª)":               "Italia/serieb",
    "Alemania — Bundesliga":               "Alemania/bundesliga",
    "Alemania — 2. Bundesliga (2ª)":       "Alemania/bundesliga 2",
    "Francia — Ligue 1":                   "Francia/Ligue 1",
    "Brasil — Brasileirão":                "Brasil/seriea",
    "Países Bajos — Eredivisie":           "Paises Bajos/Eredivise",
    "Portugal — Primeira Liga":            "Portugal/Liga portugal",
    "EE.UU. — MLS":                        "Estados Unidos",
    "México — Liga MX":                    "Mexico/liga mx",
    "Arabia — Saudi Pro League":           "Arabia saudi",
}
# liga del juego -> logo de liga en el repo (carpeta Ligas/)
LIGA_LOGO = {
    "Argentina — Primera División":"liga_argentina.png",
    "Argentina — Primera Nacional (2ª)":"primera_nacional_b.png",
    "Inglaterra — Premier League":"premier_league.png",
    "Inglaterra — Championship (2ª)":"championship.png",
    "España — LaLiga":"la_liga.png","España — LaLiga 2 (2ª)":"liga_hypermotion.png",
    "Italia — Serie A":"serie_a.png","Italia — Serie B (2ª)":"serie_b.png",
    "Alemania — Bundesliga":"bundesliga.png","Alemania — 2. Bundesliga (2ª)":"bundesliga_2.png",
    "Francia — Ligue 1":"ligue_1.png","Brasil — Brasileirão":"seria_a_brasil.png",
    "Países Bajos — Eredivisie":"eredivisie.png","Portugal — Primeira Liga":"liga_portugal.png",
    "EE.UU. — MLS":"mls.png","México — Liga MX":"liga_mx.png","Arabia — Saudi Pro League":"saudi_pro_league.png",
}
# pistas para clubes con nombre distinto al del archivo
ALIAS = {
    "Newell's":"newells","Vélez":"velez","Defensa y Justicia":"defensa",
    "San Martín SJ":"sanmartinsj","Estudiantes RC":"estudiantesrc","Gimnasia Mendoza":"gimnasiamendoza",
    "Chaco For Ever":"chaco","Deportivo Morón":"moron","Nueva Chicago":"nueva",
    "Almirante Brown":"almirante","Argentino de Quilmes":"argquilmes","Talleres RE":"",
    "Los Andes":"losandes","Real Pilar":"realpilar","Puerto Nuevo":"puertonuevo",
    "Central Ballester":"centralballester","Sportivo Barracas":"sportivobarracas",
    "Deportivo Español":"depespanol","Man United":"manchesterunited","Atlético":"atlmadrid",
    "Man City":"manchestercity","São Paulo":"saopaulo","Atlético-MG":"atlmineiro",
    "Inter Miami":"intermiami","LA Galaxy":"losangelesgalaxy","NY Red Bulls":"newyork",
    "Al-Hilal":"hilal","Al-Nassr":"nassr","Al-Ittihad":"ittihad","Al-Ahli":"ahli","Al-Ettifaq":"ettifaq",
    "América":"america","Chivas":"guadalajara","Cruz Azul":"cruzazul",
    "Rennes":"rennais","Düsseldorf":"fortuna_dusseldorf","LAFC":"losangeles",
    "Racing Santander":"racingsantander","Sporting Gijón":"sporting",
    "Vitória SC":"","Boavista":"",  # no siempre estan
}

def normkey(s):
    s = unicodedata.normalize("NFKD", s).encode("ascii","ignore").decode("ascii").lower()
    return re.sub(r"[^a-z0-9]", "", s)
def tokens(s):
    s = unicodedata.normalize("NFKD", s).encode("ascii","ignore").decode("ascii").lower()
    return [t for t in re.split(r"[^a-z0-9]+", s) if t]
def slug(s):
    s = unicodedata.normalize("NFKD", s).encode("ascii","ignore").decode("ascii")
    return re.sub(r"[^A-Za-z0-9]+","-", s).strip("-").lower() or "x"

def match_file(club, files):
    # files: lista de (ruta, nombre_sin_ext)
    hint = ALIAS.get(club, None)
    gk = normkey(hint) if hint else normkey(club)
    if hint == "": return None      # marcado como "no disponible"
    gtok = tokens(hint if hint else club)
    best, bsc = None, 0.0
    for ruta, nom in files:
        fk = normkey(nom)
        if not fk: continue
        sc = 0.0
        if fk == gk: sc = 1.0
        elif len(fk) >= 4 and gk.startswith(fk): sc = 0.92
        elif len(gk) >= 4 and fk.startswith(gk): sc = 0.88
        elif gtok and fk == normkey(gtok[0]) and len(fk) >= 4: sc = 0.82
        else:
            # 3-gramas
            a={gk[i:i+3] for i in range(max(0,len(gk)-2))}; b={fk[i:i+3] for i in range(max(0,len(fk)-2))}
            if a and b:
                j=len(a&b)/len(a|b); sc=0.6+0.3*j if j>0.5 else 0.0
        if sc > bsc: best, bsc = ruta, sc
    return best if bsc >= 0.8 else None

def parse_leagues():
    txt = open(os.path.join(JUEGO,"data/02-ligas.js"),encoding="utf-8").read()
    ini = txt.index("const LEAGUES"); fin = txt.index("};",ini)
    blk = re.sub(r"//.*","",txt[ini:fin]); d={}
    for m in re.finditer(r'"([^"]+)"\s*:\s*\[([^\]]*)\]', blk):
        d[m.group(1)] = re.findall(r'"([^"]+)"', m.group(2))
    return d

def main():
    tmp = tempfile.mkdtemp(prefix="escudos_")
    print("Clonando", REPO_URL, "...")
    r = subprocess.run(["git","clone","--depth","1",REPO_URL,tmp], stdout=subprocess.DEVNULL, stderr=subprocess.PIPE)
    if r.returncode != 0:
        print("No se pudo clonar:", r.stderr.decode()[:200]); sys.exit(1)
    leagues = parse_leagues()
    nuevos=0; ligas_ok=0; sin=[]
    for liga, clubes in leagues.items():
        carp = LIGA_CARPETA.get(liga); ruta = os.path.join(tmp, carp) if carp else None
        if ruta and os.path.isdir(ruta):
            files=[(os.path.join(ruta,f), os.path.splitext(f)[0]) for f in os.listdir(ruta) if f.lower().endswith(".png")]
            for club in clubes:
                dest = os.path.join(OUT_ESC, slug(club)+".png")
                if os.path.exists(dest): continue        # respetar lo ya bajado (p.ej. luukhopman)
                m = match_file(club, files)
                if m: shutil.copyfile(m, dest); nuevos+=1
                else: sin.append(club)
        # logo de liga
        lf = LIGA_LOGO.get(liga)
        if lf:
            src=os.path.join(tmp,"Ligas",lf)
            if os.path.exists(src): shutil.copyfile(src, os.path.join(OUT_COMP, slug(liga)+".png")); ligas_ok+=1
    shutil.rmtree(tmp, ignore_errors=True)
    print("Escudos nuevos copiados: %d" % nuevos)
    print("Logos de liga copiados: %d" % ligas_ok)
    print("Clubes sin match (usan generado): %d" % len(sin))
    if sin: print("  " + ", ".join(sin[:60]))

if __name__ == "__main__":
    main()
