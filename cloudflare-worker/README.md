# Worker TURN V11.0.0

Reemplaza TODO el código del Worker por `src-index.js` y despliega una sola vez.

Variables y secretos requeridos:

- `SWITCHER_ACCESS_CODE`: tu código privado nuevo.
- `TURN_KEY_ID`: UID de la TURN key (32 caracteres), no el nombre de la key.
- `TURN_KEY_API_TOKEN`: token/secret de 64 caracteres entregado al crear la TURN key.
- `TURN_TTL_SECONDS`: `43200` (opcional, 12 horas).
- `ALLOWED_ORIGINS`: `https://saurino07.github.io,https://switcher-deportes.netlify.app`

Prueba de salud:

`https://switcher-beisbol-turn.deporte-total.workers.dev/health`

Debe devolver `version: 9.0.2`.
