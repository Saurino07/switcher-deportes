const json = (data, status = 200, origin = "*") => new Response(JSON.stringify(data), {
  status,
  headers: {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Headers": "Content-Type, X-Switcher-Code",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Cache-Control": "no-store",
    "Vary": "Origin"
  }
});

function allowedOrigin(request, env) {
  const origin = request.headers.get("Origin") || "";
  const configured = String(env.ALLOWED_ORIGINS || "")
    .split(",").map(v => v.trim()).filter(Boolean);
  if (!configured.length || configured.includes("*")) return "*";
  return configured.includes(origin) ? origin : "";
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = allowedOrigin(request, env);

    if (request.method === "OPTIONS") {
      if (!origin) return new Response(null, { status: 403 });
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": origin,
          "Access-Control-Allow-Headers": "Content-Type, X-Switcher-Code",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Max-Age": "86400",
          "Vary": "Origin"
        }
      });
    }

    if (url.pathname === "/health" && request.method === "GET") {
      return json({ ok: true, service: "switcher-turn-credentials", version: "9.0.2" }, 200, origin || "*");
    }

    if (url.pathname !== "/turn-credentials" || request.method !== "POST") {
      return json({ error: "Not found" }, 404, origin || "*");
    }

    if (!origin) return json({ error: "Origen no autorizado" }, 403, "null");

    const suppliedCode = request.headers.get("X-Switcher-Code") || "";
    if (!env.SWITCHER_ACCESS_CODE || suppliedCode !== env.SWITCHER_ACCESS_CODE) {
      return json({ error: "Código privado incorrecto" }, 401, origin);
    }

    if (!env.TURN_KEY_ID || !env.TURN_KEY_API_TOKEN) {
      return json({ error: "Faltan secretos TURN en el Worker" }, 500, origin);
    }

    // Cloudflare /generate-ice-servers acepta ttl. No se envía customIdentifier
    // porque ese campo corresponde al endpoint /generate y causa HTTP 400 aquí.
    const ttl = Math.min(Math.max(Number(env.TURN_TTL_SECONDS || 43200), 3600), 86400);
    const endpoint = `https://rtc.live.cloudflare.com/v1/turn/keys/${env.TURN_KEY_ID}/credentials/generate-ice-servers`;

    let cf;
    try {
      cf = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${env.TURN_KEY_API_TOKEN}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ ttl })
      });
    } catch (error) {
      return json({ error: "No fue posible contactar Cloudflare TURN", detail: error.message }, 502, origin);
    }

    const text = await cf.text();
    if (!cf.ok) {
      return json({
        error: "Cloudflare TURN rechazó la solicitud",
        status: cf.status,
        detail: text.slice(0, 800)
      }, 502, origin);
    }

    let data;
    try { data = JSON.parse(text); }
    catch { return json({ error: "Respuesta TURN inválida", detail: text.slice(0, 300) }, 502, origin); }

    const iceServers = (data.iceServers || []).map(server => ({
      ...server,
      urls: (Array.isArray(server.urls) ? server.urls : [server.urls])
        .filter(Boolean)
        .filter(u => !String(u).includes(":53"))
    })).filter(server => server.urls.length);

    if (!iceServers.length) {
      return json({ error: "Cloudflare no devolvió servidores ICE utilizables" }, 502, origin);
    }

    return json({ iceServers, expiresIn: ttl, issuedAt: Date.now(), version: "9.0.2" }, 201, origin);
  }
};
