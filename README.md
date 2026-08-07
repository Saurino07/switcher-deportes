# Switcher Deportivo V26

Reconstrucción funcional del Director móvil. Esta versión sustituye la navegación móvil anterior por un panel rápido estable y un panel avanzado embebido. También añade compatibilidad para los controles de béisbol bajo `switcher/{game}/baseballState` cuando las reglas de Firebase impiden escribir en `gameState`.

## V25.0 Director móvil validado

Esta entrega reemplaza el panel móvil V20 y corrige transiciones, bases, conteos, tarjetas y controles numéricos.

# Switcher Deportivo V25.0

Director móvil corregido, tablero deportivo organizado, regreso al panel rápido e instalación PWA del Director.

Consulta `docs/ACTUALIZACION_V18_1.md`.

## V25.0 Sports Platform

# Switcher Deportivo V25.0 Sports Platform

Plataforma multideporte basada en V16.2. Deportes incluidos: béisbol, fútbol, básquetbol, voleibol y fútbol americano. Conserva cámaras, Director, replay, escenas, medios, T-Bar, PWA, salida dual del marcador, Firebase y TURN.

# Switcher Deportivo V25.0 — Motor gráfico con salida dual

V16 conserva CAM1 Master, CAM2, CAM3, Director Broadcast UI, Replay, escenas, T-Bar, comerciales, entrevistas, Firebase y TURN.

## Salida del marcador

En Director > Producción > Configuración de escenas y salida gráfica puedes elegir:

1. **Integrado en CAM1 Master**: el marcador se dibuja sobre la salida capturada por PRISM Screencast. No agregues otro marcador en PRISM.
2. **Directamente en PRISM Web Widget**: CAM1 Master oculta su marcador y PRISM lo muestra mediante `prism-overlay/index.html`. El Web Widget debe ocupar todo el lienzo; solo el marcador será visible.

El tamaño, posición y márgenes se aplican igual en las dos salidas. El valor recomendado es 25–28%, esquina superior izquierda.

## URLs

- CAM1 Master: `/cam1-master/index.html?game=partido1&v=2600&code=TU_CODIGO`
- CAM2: `/cam/index.html?cam=cam2&game=partido1&v=2600&code=TU_CODIGO`
- CAM3: `/cam/index.html?cam=cam3&game=partido1&v=2600&code=TU_CODIGO`
- Director: `/director/index.html?game=partido1&v=2600&code=TU_CODIGO`
- Overlay PRISM: `/prism-overlay/index.html?game=partido1&v=2600&code=TU_CODIGO`

## Recomendación térmica

Para partidos largos utiliza CAM1 Master en 480p/15 FPS, Replay apagado cuando no se use, PRISM en 540p o 720p/30 según temperatura, brillo moderado y sin funda gruesa.

## Validación

Se verificaron sintaxis JavaScript, referencias de versión, rutas internas, manifiesto y contenido del ZIP. La prueba final de PRISM/Android debe realizarse en los teléfonos reales.
