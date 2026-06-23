# Video "giro" — Erba Pura

Genera un video vertical (1080×1920) del frasco **Erba Pura** con un leve
vaivén/giro, compuesto sobre el podio de hielo, para usar en redes o en la
tienda Arabian Essence.

## Pipeline (`giro.py`)
1. **Recorta** el fondo de cada foto en `frames_in/` con `rembg`
   (modelo `isnet-general-use` + alpha matting — conserva la tapa dorada).
2. **Compone** cada frasco sobre `fondo.jpg` con vaivén vertical y un leve
   parpadeo de brillo.
3. **Renderiza** `giro_erbapura.mp4` con el ffmpeg que trae `imageio-ffmpeg`.

## Uso
```bash
pip install rembg pillow numpy onnxruntime imageio-ffmpeg
cd video_giro
python3 giro.py
```

## Estructura
- `frames_in/` — fotos fuente del frasco (distintos ángulos).
- `fondo.jpg` — fondo / podio de hielo.
- `frascos_png/`, `frames_out/` — artefactos intermedios (ignorados por git).
- `giro_erbapura.mp4` — video final.

## Parámetros (arriba en `giro.py`)
- `ESCALA` — tamaño del frasco respecto al alto del lienzo.
- `LOOPS` / `HOLD_FRAMES` — duración y suavidad del vaivén.
- `MODEL` — modelo de rembg para el recorte.

## Notas
- Las fotos fuente son tomas a mano sobre fondo casero; el recorte automático
  deja un pequeño resto de dedo en la base que el bloque de hielo oculta.
- Para un giro 360° real conviene fotografiar el frasco sobre base giratoria,
  fondo plano y sin mano, con ~12–24 ángulos equiespaciados.
