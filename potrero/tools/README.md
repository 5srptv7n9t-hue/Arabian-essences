# Herramientas

Cómo se separó el juego en módulos (paso 1), de forma **reproducible y sin
perder nada**.

- `potrero-original.html` — el prototipo monolítico original (respaldo).
- `split-modules.py` — script que separa el monolito en los módulos de
  `../` (data, engine, events, economy, ui, minigames + index.html + styles.css).

El script garantiza que:
1. Cada `.js` generado es JavaScript válido por sí solo (`node --check`).
2. La concatenación de todos los `.js`, en el orden que fija `index.html`,
   reproduce **byte a byte** el `<script>` original (se compara por sha256).

Regenerar (opcional, solo si querés re-derivar desde el original):

```bash
python3 tools/split-modules.py tools/potrero-original.html .
```
