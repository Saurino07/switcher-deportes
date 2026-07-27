# Switcher Deportivo V9 — GitHub Pages

## Arquitectura estable

CAM1/CAM2/CAM3 transmiten por WebRTC. El Director recibe las cámaras para PREVIEW y PROGRAM. Broadcast se conecta directamente a la cámara seleccionada en PROGRAM; no existe relay por canvas ni una segunda codificación en el Director.

## Publicación

1. Descomprime el ZIP.
2. En GitHub abre el repositorio `Saurino07/switcher-deportes`.
3. Pulsa **uploading an existing file**.
4. Arrastra todos los archivos y carpetas que están dentro de la carpeta V9, no el ZIP.
5. Escribe `Publicar V9 final` y pulsa **Commit changes**.
6. Ve a **Settings > Pages**.
7. En **Build and deployment**, selecciona **Deploy from a branch**.
8. Branch: `main`; carpeta: `/ (root)`; pulsa **Save**.
9. Espera unos minutos. La URL será `https://saurino07.github.io/switcher-deportes/`.

## URLs

- CAM1: `https://saurino07.github.io/switcher-deportes/cam/?cam=cam1&game=partido1&v=900&code=TU_CODIGO`
- CAM2: `https://saurino07.github.io/switcher-deportes/cam/?cam=cam2&game=partido1&v=900&code=TU_CODIGO`
- CAM3: `https://saurino07.github.io/switcher-deportes/cam/?cam=cam3&game=partido1&v=900&code=TU_CODIGO`
- Director: `https://saurino07.github.io/switcher-deportes/director/?game=partido1&v=900&code=TU_CODIGO`
- Broadcast diagnóstico: `https://saurino07.github.io/switcher-deportes/broadcast/?game=partido1&v=900&debug=1&code=TU_CODIGO`
- PRISM: `https://saurino07.github.io/switcher-deportes/broadcast/?game=partido1&v=900&code=TU_CODIGO`

## Prueba obligatoria

1. Inicia CAM1.
2. Abre Director y coloca CAM1 en PROGRAM.
3. Abre Broadcast diagnóstico.
4. Confirma `V9 · CAM1 · VIDEO AL AIRE` y la imagen real.
5. Cambia a CAM2 y CAM3.
6. Déjalo funcionando 10 minutos.
7. Después carga la URL sin `debug=1` como Widget Web en PRISM.

## Nota

GitHub Pages puede tardar en publicar cada commit, pero no usa créditos de Netlify.
