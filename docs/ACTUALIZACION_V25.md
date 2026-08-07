# V25 — Director móvil reconstruido y PWA restaurada

Cambios principales:
- Director móvil único: `director/mobile-v250.html`.
- CSS único: `css/director-mobile-v250.css`.
- JS móvil único: `js/director/mobile-v250.js`.
- Filas del Director usan unidades `fr`, no porcentajes + gaps, evitando recortes verticales.
- Tablero deportivo reorganizado para mantener visitante / periodo-reloj / local completos.
- Instalación PWA restaurada con botón visible `INSTALAR APP`.
- Manifest V25 con `display: standalone`, orientación landscape y `start_url` versionado.
- Service Worker del Director V25 usa recursos V25; versiones anteriores apuntaban a recursos de otra versión.
- Separación de cachés: el SW raíz ya no elimina cachés del Director y viceversa.
- Código y partido se recuerdan en `localStorage` para el arranque instalado.
