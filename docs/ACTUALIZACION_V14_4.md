# Switcher Deportivo V14.4 — CAM1 Master PWA

## Arquitectura de cuatro celulares

1. CAM1 Master + PRISM Screencast + Overlay + salida a Facebook.
2. CAM2 remota.
3. CAM3 remota.
4. Director / Switcher.

## Novedades V14.4

- CAM1 Master instalable como PWA, sin barra de direcciones al abrir desde su icono.
- Orientación horizontal y modo fullscreen.
- Botón manual para recuperar pantalla completa.
- Service Worker y caché versionada V14.4.
- Compositor Canvas estable para CAM1, CAM2, CAM3 y Replay.
- Director con escenas rápidas: Juego, Replay, Comercial, Pantalla limpia, Entrevista y Marcador.
- T-Bar manual con transición DIP a negro entre PROGRAM y PREVIEW.
- Replay profesional con buffer, miniaturas, selección Inicio/Final, Preview privado, velocidades y stinger.
- Videos externos por URL.
- Overlay reducido y profesional.
- Wake Lock, recuperación de cámara y perfiles térmicos existentes.

## Instalación PWA CAM1 Master

1. Publica todos los archivos en GitHub Pages.
2. Abre `cam1-master/index.html?game=partido1&v=1440&code=TU_CODIGO` en Chrome.
3. Pulsa **INSTALAR APP** o usa el menú de Chrome > Instalar aplicación.
4. Cierra la pestaña y abre **CAM1 Master** desde el icono instalado.
5. Pulsa INICIAR CAM1 MASTER.
6. Abre PRISM, inicia Screencast y vuelve a CAM1 Master desde aplicaciones recientes.

## Nota

La Fullscreen API requiere una acción del usuario. Por eso se incluye el botón `⛶ PANTALLA COMPLETA` como recuperación.
