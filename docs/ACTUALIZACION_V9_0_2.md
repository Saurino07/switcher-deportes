# Actualización definitiva V11.0.0

## 1. Cloudflare Worker (obligatorio primero)

1. Abre `switcher-beisbol-turn` → Edit code.
2. Reemplaza todo por `cloudflare-worker/src-index.js`.
3. Deploy.
4. Verifica `/health` y confirma `version: 9.0.3`.

El error HTTP 400 `invalid argument` se debía a enviar `customIdentifier` al endpoint `generate-ice-servers`. V11.0.0 envía únicamente `{ "ttl": 43200 }`.

## 2. GitHub Pages

Sube el contenido interno de este paquete a la raíz del repositorio y confirma reemplazo.

## 3. URLs

- CAM1: `/cam/index.html?cam=cam1&game=partido1&v=1100&code=CODIGO`
- Director: `/director/index.html?game=partido1&v=1100&code=CODIGO`
- Diagnóstico: `/broadcast/index.html?game=partido1&v=1100&debug=1&code=CODIGO`
- PRISM: `/broadcast/index.html?game=partido1&v=1100&code=CODIGO`
