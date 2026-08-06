# V23.0 Director móvil reconstruido

Esta versión reemplaza por completo la página móvil del Director. No usa los estilos móviles acumulados de V17–V22.

## Diseño principal
- PROGRAM y PREVIEW visibles simultáneamente.
- CAM1, CAM2 y CAM3 en una sola fila.
- Selección de cámara, transición actual y duración FADE en el lateral derecho.
- Replay rápido y stinger en la misma fila de cámaras.
- Tablero deportivo en una sola franja: visitante / periodo-reloj / local.
- Bolas, strikes, outs y bases visibles en béisbol.
- CUT, AUTO, FADE, BLACK, REPLAY y CONTROL COMPLETO siempre visibles.

## Ajuste al dispositivo
El layout usa 100dvh y proporciones de grid. No escala una imagen fija ni aplica transformaciones globales, por lo que se adapta al área real disponible del navegador en horizontal.

## Correcciones
- El panel blanco ya no usa posiciones absolutas para marcador, logos o +1 gol/carrera.
- Las bases son diamantes reales y cambian a amarillo al activarse.
- El panel Stinger conserva imagen y botón PROBAR TRANSICIÓN.
- FADE tiene control - / valor / +.
- Bolas, strikes y outs actualizan Firebase mediante transacciones.
- La vista móvil usa archivos propios mobile.html, director-mobile-v230.css y mobile-v230.js.
