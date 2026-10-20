/* OPTIONAL: lets the Altus chatbot answer ANY question with Claude.
   Never put an API key in the website. Keep it here, on a server.

   Setup (Cloudflare Workers, free tier is fine):
   1. Create a Worker and paste this file.
   2. Settings > Variables: add secret ANTHROPIC_API_KEY and variable ALLOWED_ORIGIN (e.g. https://yourdomain.ge).
   3. Copy the Worker URL, then add this line to index.html before chat.js:
      <script>window.ALTUS_CHAT = { endpoint: "https://YOUR-WORKER.workers.dev" };</script>
*/
const SYSTEM = `You are the concierge for Altus Transfers & Tours, a private chauffeur and tour company in Georgia (the country), based in Batumi, serving Tbilisi, Kutaisi, Batumi, Kazbegi, Svaneti and Kakheti.
Fleet: Mercedes-Benz V-Class V250d 2019 (up to 7 guests, full luggage), Mercedes-Benz C43 AMG 2016 (up to 3, 2 cases), Jeep Wrangler Rubicon 2017 (up to 4, 2 cases, mountain 4x4), Toyota Camry 2025 (up to 3, 2 cases).
Services: airport concierge and transfers with flight tracking, bespoke wine tours in Kakheti, 4x4 alpine expeditions to Kazbegi and Svaneti, custom private tours.
Rules: be warm, concise and professional (under 120 words). Recommend destinations based on the guest's interests. Never invent prices, discounts, policies or availability: say the team confirms these within hours. For bookings or anything uncertain, point to WhatsApp +995 592 804 401 or the inquiry form. Answer general Georgia travel questions helpfully and honestly. Politely decline unrelated requests.`;

export default {
  async fetch(req, env) {
    const cors = {
      'Access-Control-Allow-Origin': env.ALLOWED_ORIGIN || '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    };
    if (req.method === 'OPTIONS') return new Response(null, { headers: cors });
    if (req.method !== 'POST') return new Response('Method not allowed', { status: 405, headers: cors });
    try {
      const { messages } = await req.json();
      const clean = (messages || []).slice(-10)
        .filter(m => (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
        .map(m => ({ role: m.role, content: m.content.slice(0, 1000) }));
      if (!clean.length || clean[clean.length - 1].role !== 'user') throw new Error('bad input');
      const r = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'x-api-key': env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
        body: JSON.stringify({ model: 'claude-haiku-5-5', max_tokens: 400, system: SYSTEM, messages: clean })
      });
      const d = await r.json();
      const reply = (d.content || []).filter(b => b.type === 'text').map(b => b.text).join('\n');
      return new Response(JSON.stringify({ reply }), { headers: { ...cors, 'Content-Type': 'application/json' } });
    } catch (e) {
      return new Response(JSON.stringify({ reply: '' }), { status: 200, headers: { ...cors, 'Content-Type': 'application/json' } });
    }
  }
};
