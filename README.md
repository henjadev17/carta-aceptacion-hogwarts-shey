# Una carta para Shey

Experiencia web estática, romántica y responsive inspirada en la llegada de una carta de Hogwarts el 1 de septiembre.

## Ejecutar localmente

Desde la raíz del proyecto:

```bash
python3 -m http.server 8000
```

Antes de iniciar la web, añade tu pista como `assets/music/theme.mp3`. Después visita
`http://localhost:8000`. La música se inicia únicamente al pulsar **Abrir carta**.

## Estructura

- `content.json`: todos los textos editables de la portada y de la carta.
- `index.html`: contenido semántico de la experiencia y la carta.
- `css/styles.css`: pergamino, sobre, animaciones y adaptación responsive.
- `js/app.js`: apertura, reproducción/volumen de audio y mensaje secreto.
- `assets/music/theme.mp3`: ubicación esperada para la pista musical (debe añadirse manualmente).
