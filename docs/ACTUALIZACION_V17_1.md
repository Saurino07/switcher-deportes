# V17.9 — Corrección del compositor multideporte

## Causa del defecto
V17 cargaba el marcador de béisbol dentro de un iframe anidado (`CAM1 Master → sports-overlay → overlay`). El CSS de tamaño y posición se aplicaba al contenedor exterior, pero no alcanzaba el marcador interno. El resultado era un marcador de tamaño original, recortado y desbordado.

## Corrección
- Béisbol se carga directamente desde `overlay/index.html`.
- Los demás deportes se cargan desde `sports-overlay/index.html`.
- CAM1 Master y PRISM cambian automáticamente de renderer al cambiar el deporte.
- Solo se escala el marcador principal; el lienzo del overlay permanece a pantalla completa.
- Se eliminó el iframe anidado de la ruta activa de béisbol.
- Caché y versión actualizadas a 17.1 / 1720.
