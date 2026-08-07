# V28.0 — Restauración del Director móvil V27 + controles de béisbol + módulos aislados

Esta versión parte directamente de V27, cuyo panel rápido era el diseño aceptado, y evita reconstrucciones posteriores.

Cambios limitados:
- Conserva la distribución visual V27 del panel rápido.
- Reserva altura real dentro del recuadro blanco para BOLAS, STRIKES, OUTS y BASES.
- Normaliza nombres de deporte (baseball/beisbol/béisbol) para no ocultar accidentalmente los controles de béisbol.
- Bolas/strikes/outs escriben en `switcher/{game}/baseballState` con transacciones.
- Bases 1B/2B/3B alternan individualmente y se iluminan en amarillo; LIMPIAR BASES las vacía.
- Producción, Replay, Gráficos, Medios y Sistema abren el Director avanzado en modo `mobileModule=1`, que oculta PROGRAM/PREVIEW/cámaras/navegación y deja visible únicamente el módulo solicitado.
- El botón VOLVER AL PANEL RÁPIDO es una barra compacta de 38 px y regresa a `mobile-v280.html`.
- Se conserva la PWA del Director y se actualiza su caché a V28.
