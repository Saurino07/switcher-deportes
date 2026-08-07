# V28 — Director móvil estable

Esta versión reemplaza la ruta móvil V26 por `director/mobile-v280.html` y elimina el iframe de módulos avanzados. Los módulos Producción, Replay, Gráficos, Medios y Sistema se abren en la página completa del Director con el panel solicitado y un botón compacto de regreso.

## Estado de béisbol
Los controles rápidos de carreras, bolas, strikes, outs, entrada y bases escriben exclusivamente bajo `switcher/{game}/baseballState`, compatible con las reglas Firebase del proyecto. El overlay conserva escucha compatible a ese nodo.

## PWA
El Director usa `director/manifest.webmanifest` y `director/service-worker.js` con caché `director-v2800` y abre `mobile-v280.html` en orientación horizontal.
