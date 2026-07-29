# Switcher Deportivo V11.0.0 — Replay Profesional Asistido

V11 conserva la funcionalidad de V10.1: tres cámaras, Director con PROGRAM/PREVIEW, CUT/AUTO/FADE/BLACK, cambio limpio entre cámaras, Broadcast a pantalla completa, overlay transparente, Firebase, Cloudflare TURN, Audio Follow Video y salida para PRISM Live Mobile.

## Nuevo replay asistido

El Director mantiene un buffer local de PREVIEW de la cámara que está en PROGRAM. Broadcast mantiene su propio buffer para la señal pública.

Flujo:

1. Espera a que `PREVIEW BUFFER` y `BROADCAST BUFFER` indiquen al menos 4 segundos.
2. Selecciona duración, velocidad y el punto final de la jugada.
3. Pulsa **PREVIEW**. Solo el operador ve la repetición; Facebook continúa en LIVE.
4. Si la jugada es correcta, pulsa **ENVIAR AL AIRE**.
5. Broadcast hace FADE, muestra `REPLAY`, reproduce la repetición y regresa automáticamente a LIVE.
6. **VOLVER A LIVE** interrumpe la repetición inmediatamente.

La fuente estable de replay es PROGRAM. Al cambiar PROGRAM se reinicia el buffer para evitar mezclar dos cámaras en una misma repetición.

## Publicación en GitHub Pages

Sube todo el contenido de este ZIP a la raíz del repositorio y reemplaza los archivos existentes. Usa `v=1100` en todas las URL.

- CAM1: `/cam/index.html?cam=cam1&game=partido1&v=1100&code=CODIGO`
- CAM2: `/cam/index.html?cam=cam2&game=partido1&v=1100&code=CODIGO`
- CAM3: `/cam/index.html?cam=cam3&game=partido1&v=1100&code=CODIGO`
- Director: `/director/index.html?game=partido1&v=1100&code=CODIGO`
- Diagnóstico: `/broadcast/index.html?game=partido1&v=1100&debug=1&code=CODIGO`
- PRISM: `/broadcast/index.html?game=partido1&v=1100&code=CODIGO`

## Prueba previa

Antes del partido, mantén una cámara en PROGRAM durante 30 segundos, revisa un PREVIEW de 10 segundos a ×0.5, envíalo al aire y confirma el regreso automático a LIVE. Después prueba un cambio de cámara y repite el proceso.
