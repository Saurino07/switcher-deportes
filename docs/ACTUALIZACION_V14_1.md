# V14.1 – Corrección de salida en PRISM Screencast

- La salida final ahora se compone en un canvas 16:9/viewport, evitando que Android/PRISM omita las superficies de video aceleradas.
- CAM1, CAM2, CAM3 y Replay se dibujan en el mismo canvas estable.
- Fondo negro forzado; ya no debe aparecer una pantalla blanca.
- Recuperación automática de CAM1 al volver de PRISM a Chrome.
- Wake Lock para evitar que la pantalla se suspenda.
- Overlay, stinger, videos externos y transiciones permanecen como capas sobre el canvas.
