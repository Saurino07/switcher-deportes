# Switcher Deportivo V10 Final

Versión para GitHub Pages, Firebase Realtime Database, Cloudflare TURN y PRISM Live Mobile.

## Cambio principal

El overlay de béisbol está incluido localmente en `overlay/index.html` y se carga como una capa transparente de pantalla completa sobre el video. Ya no se recorta el iframe ni se depende del fondo del dominio externo.

## Publicación

Sube el contenido interno de esta carpeta a la raíz del repositorio `Saurino07/switcher-deportes` y reemplaza los archivos existentes.

## URLs

- CAM1: `/cam/index.html?cam=cam1&game=partido1&v=1010&code=TU_CODIGO`
- CAM2: `/cam/index.html?cam=cam2&game=partido1&v=1010&code=TU_CODIGO`
- CAM3: `/cam/index.html?cam=cam3&game=partido1&v=1010&code=TU_CODIGO`
- Director: `/director/index.html?game=partido1&v=1010&code=TU_CODIGO`
- Diagnóstico: `/broadcast/index.html?game=partido1&v=1010&debug=1&code=TU_CODIGO`
- PRISM: `/broadcast/index.html?game=partido1&v=1010&code=TU_CODIGO`

## Nota sobre recursos del overlay

El marcador principal funciona con el HTML integrado. Algunas animaciones opcionales del overlay original referencian archivos de la carpeta `assets/` que no fueron incluidos en los archivos proporcionados. Esas animaciones requerirán copiar sus recursos originales a `overlay/assets/`.
