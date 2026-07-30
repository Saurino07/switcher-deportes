# Actualización V13

- Recupera CAM1 como señal WebRTC real.
- CAM1 visible en PROGRAM, PREVIEW y tarjetas de cámara.
- Replay de CAM1, CAM2 y CAM3 con buffer, miniaturas, Inicio/Final y velocidad.
- Stinger deportivo antes y después del Replay.
- Videos externos mediante URL.
- Director con distribución de escritorio en celular horizontal.
- Modo frío para reducir consumo térmico.

## Limitación del modo CAM1 nativa en PRISM

Un Web Widget no recibe los fotogramas de la cámara nativa de PRISM. Además, Android suele bloquear el acceso simultáneo de dos aplicaciones a la misma cámara. Para CAM1 real y Replay se requiere una fuente WebRTC independiente.
