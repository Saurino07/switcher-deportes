# Switcher Deportivo V15.2 Broadcast UI — Estabilidad PRISM

Conserva la interfaz profesional de V15 y corrige CAM1 Master para ScreenCast:

- PWA fullscreen real al abrir desde el icono instalado.
- Botones de instalación/pantalla completa ocultos y visibles al tocar la pantalla.
- Perfil térmico predeterminado 854×480 a 15 FPS.
- Canvas interno limitado para reducir GPU y temperatura.
- Micrófono final controlado por PRISM, evitando conflicto con Chrome.
- Audio de CAM2/CAM3 reproducido como sonido del dispositivo.
- Service Worker actualizado a cache v1510.

## Audio correcto
En PRISM ScreenCast activa **Micrófono** para narración y **Sonido del dispositivo** para escuchar las cámaras remotas y videos. No actives el micrófono del navegador salvo que solo necesites enviarlo al Director.

## Pantalla completa
Instala CAM1 Master y ábrelo desde su icono. Chrome normal no puede garantizar ocultar su barra al regresar desde PRISM. En PRISM usa **View Screen Full** y orientación horizontal antes de iniciar.

Usa `v=1520`.
