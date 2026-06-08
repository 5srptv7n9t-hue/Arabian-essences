/* ============================================================
 *  Netlify Function · Mercado Pago Checkout Pro
 *  ------------------------------------------------------------
 *  Crea una "preferencia" de pago en el servidor para que el
 *  Access Token NUNCA viaje al frontend.
 *
 *  Configurá en Netlify (Site settings → Environment variables):
 *    MP_ACCESS_TOKEN   = APP_USR-xxxxxxxx...   (tu token productivo o de prueba)
 *    SITE_URL          = https://tu-dominio.netlify.app   (opcional, para back_urls)
 *
 *  El front llama a:  POST /.netlify/functions/crear-preferencia
 *  con body JSON: { items:[{title, quantity, unit_price}], payer, nota }
 *  y recibe: { init_point, id }  →  redirige al usuario a init_point.
 * ============================================================ */

const MP_API = "https://api.mercadopago.com/checkout/preferences";

// Cabeceras CORS (por si el front se sirve desde otro origen / preview).
const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};

exports.handler = async (event) => {
  // Preflight CORS
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: cors, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers: cors, body: JSON.stringify({ error: "Método no permitido" }) };
  }

  const token = process.env.MP_ACCESS_TOKEN;
  if (!token) {
    // Mientras no cargues el token, el front cae elegantemente a WhatsApp.
    return {
      statusCode: 500,
      headers: cors,
      body: JSON.stringify({ error: "MP_ACCESS_TOKEN no configurado en Netlify." }),
    };
  }

  let data;
  try {
    data = JSON.parse(event.body || "{}");
  } catch {
    return { statusCode: 400, headers: cors, body: JSON.stringify({ error: "JSON inválido" }) };
  }

  // Validación mínima de los ítems.
  const items = Array.isArray(data.items) ? data.items : [];
  if (!items.length) {
    return { statusCode: 400, headers: cors, body: JSON.stringify({ error: "Carrito vacío" }) };
  }

  const site = process.env.SITE_URL || "";

  // Cuerpo de la preferencia (Checkout Pro).
  const preference = {
    items: items.map((it) => ({
      title: String(it.title || "Perfume Arabian Essence").slice(0, 250),
      quantity: Math.max(1, parseInt(it.quantity, 10) || 1),
      unit_price: Number(it.unit_price) || 0,
      currency_id: "ARS",
    })),
    payer: data.payer && data.payer.name ? { name: String(data.payer.name).slice(0, 80) } : undefined,
    metadata: { nota: (data.nota || "").slice(0, 500) },
    statement_descriptor: "ARABIAN ESSENCE",
    binary_mode: true,
    back_urls: site
      ? {
          success: `${site}/?pago=ok`,
          failure: `${site}/?pago=error`,
          pending: `${site}/?pago=pendiente`,
        }
      : undefined,
    auto_return: site ? "approved" : undefined,
  };

  try {
    const res = await fetch(MP_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(preference),
    });

    const json = await res.json();

    if (!res.ok) {
      return {
        statusCode: res.status,
        headers: cors,
        body: JSON.stringify({ error: json.message || "Error creando la preferencia", detail: json }),
      };
    }

    // init_point = checkout productivo · sandbox_init_point = pruebas
    return {
      statusCode: 200,
      headers: cors,
      body: JSON.stringify({
        id: json.id,
        init_point: json.init_point,
        sandbox_init_point: json.sandbox_init_point,
      }),
    };
  } catch (err) {
    return {
      statusCode: 502,
      headers: cors,
      body: JSON.stringify({ error: "No se pudo contactar a Mercado Pago", detail: String(err) }),
    };
  }
};
