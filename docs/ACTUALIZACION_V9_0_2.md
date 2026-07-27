# Actualización definitiva V9.0.2

## 1. Cloudflare Worker (obligatorio primero)

1. Abre `switcher-beisbol-turn` → Edit code.
2. Reemplaza todo por `cloudflare-worker/src-index.js`.
3. Deploy.
4. Verifica `/health` y confirma `version: 9.0.2`.

El error HTTP 400 `invalid argument` se debía a enviar `customIdentifier` al endpoint `generate-ice-servers`. V9.0.2 envía únicamente `{ "ttl": 43200 }`.

## 2. GitHub Pages

Sube el contenido interno de este paquete a la raíz del repositorio y confirma reemplazo.

## 3. URLs

- CAM1: `/cam/index.html?cam=cam1&game=partido1&v=902&code=CODIGO`
- Director: `/director/index.html?game=partido1&v=902&code=CODIGO`
- Diagnóstico: `/broadcast/index.html?game=partido1&v=902&debug=1&code=CODIGO`
- PRISM: `/broadcast/index.html?game=partido1&v=902&code=CODIGO`
