# V12 · CAM1 integrada con PRISM Live

## Arquitectura

- CAM1: cámara nativa del teléfono que transmite con PRISM Live.
- CAM2 y CAM3: celulares remotos por WebRTC.
- Director: selecciona PREVIEW/PROGRAM, replay, transiciones, overlay y videos externos.
- Web Widget de PRISM: usa `broadcast/index.html?prismCam1=1`.

Cuando PROGRAM=CAM1, el widget queda transparente y se ve la cámara nativa de PRISM. Cuando PROGRAM=CAM2 o CAM3, el widget cubre la cámara local con la señal remota.

## Limitación técnica

El navegador del Web Widget no recibe los fotogramas de la cámara nativa de PRISM. Por eso el replay interno se genera para CAM2/CAM3. En CAM1 el Director puede cambiar, usar overlay, stinger, videos y volver al vivo, pero no grabar replay de la cámara local desde el navegador.

## Configuración PRISM

1. En PRISM usa la cámara trasera como fuente base.
2. Añade un Web Widget a pantalla completa, por encima de la cámara.
3. Usa la URL Broadcast V12 con `prismCam1=1`.
4. No elimines ni ocultes la cámara base de PRISM.
