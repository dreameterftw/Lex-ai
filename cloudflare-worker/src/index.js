const JSON_HEADERS = {
  "Content-Type": "application/json;charset=UTF-8",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type,Authorization"
};

const jsonResponse = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: JSON_HEADERS });

const parseJson = async (request) => {
  try {
    return await request.json();
  } catch {
    return null;
  }
};

const proxyJson = async (url, apiKey, body) => {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  return new Response(await response.text(), {
    status: response.status,
    headers: JSON_HEADERS
  });
};

const handleChat = async (request, env) => {
  const body = await parseJson(request);
  if (!body) return jsonResponse({ error: "Request body must be JSON" }, 400);
  if (!env.GROQ_API_KEY) return jsonResponse({ error: "GROQ_API_KEY is not configured" }, 500);

  return proxyJson("https://api.groq.com/openai/v1/chat/completions", env.GROQ_API_KEY, body);
};

const handleEmail = async (request, env) => {
  const body = await parseJson(request);
  if (!body) return jsonResponse({ error: "Request body must be JSON" }, 400);
  if (!env.RESEND_API_KEY) return jsonResponse({ error: "RESEND_API_KEY is not configured" }, 500);

  return proxyJson("https://api.resend.com/emails", env.RESEND_API_KEY, body);
};

const handleOptions = () => new Response(null, { status: 204, headers: JSON_HEADERS });

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/+$/, "");

    if (request.method === "OPTIONS") return handleOptions();
    if (path === "/api/chat" && request.method === "POST") {
      return handleChat(request, env);
    }
    if (path === "/api/email" && request.method === "POST") {
      return handleEmail(request, env);
    }

    return jsonResponse({ error: "Route not found" }, 404);
  }
};
