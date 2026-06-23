"""
giro_erbapura.py — Video de "giro" (vaivén) del frasco Erba Pura
para Arabian Essence.

Pipeline:
  1) Recorta el fondo de cada foto del frasco (rembg).
  2) Compone cada frasco sobre el fondo (podio de hielo) con un leve
     vaivén vertical + parpadeo de brillo.
  3) Renderiza un MP4 vertical (1080x1920) con ffmpeg.

ffmpeg: se usa el binario que trae imageio-ffmpeg (no requiere ffmpeg
del sistema).
"""

from rembg import remove, new_session
from PIL import Image, ImageEnhance, ImageOps
import imageio_ffmpeg
import os, math, subprocess

# ---------- CONFIG ----------
W, H = 1080, 1920
FONDO = "fondo.jpg"
IN_DIR = "frames_in"
PNG_DIR = "frascos_png"
OUT_DIR = "frames_out"
VIDEO = "giro_erbapura.mp4"
LOOPS = 2          # vueltas completas (ida y vuelta)
HOLD_FRAMES = 6    # frames por foto (mas alto = mas lento/suave)
ESCALA = 0.55      # alto del frasco respecto al alto del lienzo
ROTATE = 0         # grados extra; las fotos ya quedan verticales via EXIF
MODEL = "isnet-general-use"  # conserva la tapa dorada reflectante mejor que u2net
FPS = 24
# ----------------------------

FFMPEG = imageio_ffmpeg.get_ffmpeg_exe()


def main():
    # 1) RECORTAR
    os.makedirs(PNG_DIR, exist_ok=True)
    session = new_session(MODEL)
    for f in sorted(os.listdir(IN_DIR)):
        if not f.lower().endswith((".jpg", ".jpeg", ".png")):
            continue
        inp = Image.open(f"{IN_DIR}/{f}")
        inp = ImageOps.exif_transpose(inp).convert("RGBA")  # endereza segun EXIF
        if ROTATE:
            inp = inp.rotate(ROTATE, expand=True)
        out = remove(
            inp, session=session, alpha_matting=True,
            alpha_matting_foreground_threshold=240,
            alpha_matting_background_threshold=10,
            alpha_matting_erode_size=10,
        )
        out = out.crop(out.getbbox())  # recorta al contorno del frasco
        name = os.path.splitext(f)[0]
        out.save(f"{PNG_DIR}/{name}.png")
        print(f"recortado: {name}.png")

    # 2) COMPONER
    os.makedirs(OUT_DIR, exist_ok=True)
    fondo = Image.open(FONDO).convert("RGBA").resize((W, H))
    frascos = [Image.open(f"{PNG_DIR}/{f}").convert("RGBA")
               for f in sorted(os.listdir(PNG_DIR)) if f.endswith(".png")]

    if not frascos:
        raise SystemExit("No hay PNGs en frascos_png/")

    seq = []
    for _ in range(LOOPS):
        seq += frascos + frascos[::-1]

    idx = 0
    for fr in seq:
        for _ in range(HOLD_FRAMES):
            frame = fondo.copy()
            ratio = (H * ESCALA) / fr.height
            nw, nh = int(fr.width * ratio), int(fr.height * ratio)
            fr_s = fr.resize((nw, nh))

            t = idx / 6.0
            offset_y = int(math.sin(t) * 12)
            b = 1.0 + 0.08 * math.sin(t * 1.5)
            fr_s = ImageEnhance.Brightness(fr_s).enhance(b)

            px = (W - nw) // 2
            py = (H - nh) // 2 + offset_y
            frame.alpha_composite(fr_s, (px, py))
            frame.convert("RGB").save(f"{OUT_DIR}/f_{idx:04d}.jpg", quality=92)
            idx += 1
        print(f"frames compuestos: {idx}")

    print(f"total {idx} frames")

    # 3) RENDER
    subprocess.run([
        FFMPEG, "-y", "-framerate", str(FPS),
        "-i", f"{OUT_DIR}/f_%04d.jpg",
        "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "18",
        "-vf", "scale=1080:1920",
        VIDEO
    ], check=True)

    print(f"listo: {VIDEO}")


if __name__ == "__main__":
    main()
