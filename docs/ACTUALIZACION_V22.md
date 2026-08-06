# V22 Director móvil independiente

Esta versión reemplaza el panel móvil heredado por una página independiente (`director/mobile.html`) sin CSS acumulado. El Director normal redirige automáticamente a esta página en teléfonos, preservando `game`, `code` y `v`.

La interfaz móvil conserva PROGRAM, PREVIEW, CAM1–CAM3, transición, duración Fade, stinger, replay rápido, marcador, tarjetas, reloj, B/S/O, bases y accesos al control completo. El motor Director original se ejecuta en un iframe oculto para conservar WebRTC y la lógica existente; la interfaz limpia replica los streams reales.
