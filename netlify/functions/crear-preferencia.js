exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN;
  if (!ACCESS_TOKEN) {
    return { statusCode: 500, body: JSON.stringify({ error: "Falta MP_ACCESS_TOKEN" }) };
  }

  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: "JSON invalido" }) };
  }

  const title      = String(body.title || "Producto Arabian Essence").slice(0, 250);
  const quantity   = Math.max(1, Math.min(99, parseInt(body.quantity, 10) || 1));
  const unit_price = Number(body.unit_price);
  const buyer_name = String(body.buyer_name || "").slice(0, 120);
  const note       = String(body.note || "").slice(0, 500);

  if (!Number.isFinite(unit_price) || unit_price <= 0) {
    return { statusCode: 400, body: JSON.stringify({ error: "Precio invalido" }) };
  }

  const SITE_URL = process.env.URL || `https://${event.headers.host}`;

  const preference = {
    items: [
      { title, quantity, unit_price, currency_id: "ARS" },
    ],
    back_urls: {
      success: `${SITE_URL}/?pago=ok`,
      pending: `${SITE_URL}/?pago=pendiente`,
      failure: `${SITE_URL}/?pago=error`,
    },
    auto_return: "approved",
    statement_descriptor: "ARABIAN ESSENCE",
    external_reference: `AE-${Date.now()}`,
    metadata: { buyer_name, note },
  };

  try {
    const mpRes = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${ACCESS_TOKEN}`,
      },
      body: JSON.stringify(preference),
    });

    const data = await mpRes.json();

    if (!mpRes.ok) {
      return { statusCode: 502, body: JSON.stringify({ error: "Error de Mercado Pago", detail: data }) };
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        init_point: data.init_point,
        sandbox_init_point: data.sandbox_init_point,
        id: data.id,
      }),
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: "Fallo al crear la preferencia", detail: String(err) }) };
  }
};
