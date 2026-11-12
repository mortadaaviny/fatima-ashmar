// Supabase Edge Function "ai": relays chat and analysis requests to Claude.
// The Anthropic key lives in a Supabase secret, never in the website.
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (o: unknown, status = 200) =>
  new Response(JSON.stringify(o), { status, headers: { ...CORS, "content-type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  try {
    const key = Deno.env.get("ANTHROPIC_API_KEY");
    if (!key) return json({ error: "ANTHROPIC_API_KEY is not set" }, 500);
    const { messages, images = [] } = await req.json();
    if (!Array.isArray(messages) || !messages.length) return json({ error: "bad request" }, 400);

    const msgs: any[] = messages.slice(-14).map((m: any) => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: String(m.content ?? "").slice(0, 60000),
    }));
    const last = msgs[msgs.length - 1];
    if (images.length && last.role === "user") {
      last.content = [
        ...images.slice(0, 8).map((i: any) => ({
          type: "image",
          source: { type: "base64", media_type: i.media_type || "image/jpeg", data: i.data },
        })),
        { type: "text", text: last.content },
      ];
    }

    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({
        model: Deno.env.get("AI_MODEL") ?? "claude-sonnet-5-5",
        max_tokens: 3000,
        messages: msgs,
      }),
    });
    const d = await r.json();
    if (!r.ok) return json({ error: d?.error?.message ?? "upstream error" }, 502);
    const text = (d.content ?? []).filter((b: any) => b.type === "text").map((b: any) => b.text).join("");
    return json({ text });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
