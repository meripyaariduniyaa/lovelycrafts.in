import { NextResponse } from 'next/server';
import { templates } from '@/lib/templates';
import { getTemplatePricing } from '@/lib/pricing';
import { CONTACT_EMAIL } from '@/lib/seo';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MODEL = process.env.HUGGINGFACE_CHAT_MODEL || 'openai/gpt-oss-20b:fastest';
const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 10;
const MAX_MESSAGES = 10;
const MAX_MESSAGE_LENGTH = 800;
const MAX_HISTORY_LENGTH = 4_000;
const requestWindows = new Map();

function isRateLimited(ip) {
  const now = Date.now();
  for (const [key, window] of requestWindows) {
    if (window.expiresAt <= now) requestWindows.delete(key);
  }
  if (requestWindows.size > 5_000) requestWindows.clear();

  const current = requestWindows.get(ip);
  if (!current || current.expiresAt <= now) {
    requestWindows.set(ip, { count: 1, expiresAt: now + WINDOW_MS });
    return false;
  }
  current.count += 1;
  return current.count > MAX_REQUESTS_PER_WINDOW;
}

function fallbackReply(text) {
  const normalized = text.toLowerCase();
  if (/link|order|payment|paid|पैसे|लिंक|पेमेंट|ऑर्डर/.test(normalized)) {
    return `I can help with general guidance, but I can’t look up orders or private gifts here. Check your inbox and spam folder for the gift link. If it still hasn’t arrived or a payment looks wrong, please contact us at ${CONTACT_EMAIL} or visit /contact with your Order ID.`;
  }
  if (/price|cost|कितना|कीमत|दाम/.test(normalized)) {
    return 'LovelyCrafts has five ready-to-personalize experiences. Prices can vary, so I’ll show the latest catalog prices below. Tell me the occasion and I can narrow them down.';
  }
  return 'I can help you find a gift, compare the current templates and prices, or point you to support. Tell me who the gift is for and what you’re celebrating. You can also browse the full collection at /templates.';
}

function recommendationIds(text) {
  const value = text.toLowerCase();
  const ids = [];
  if (/birthday|जन्मदिन|बर्थडे/.test(value)) ids.push('birthday');
  if (/anniversary|वर्षगांठ|सालगिरह/.test(value)) ids.push('anniversary');
  if (/sorry|apolog|माफ़ी|माफी/.test(value)) ids.push('emotional-apology');
  if (/miss you|long.distance|दूर|याद आ/.test(value)) ids.push('i-miss-you');
  if (/girlfriend|boyfriend|partner|proposal|romance|प्रपोज|प्यार|पार्टनर/.test(value)) ids.push('proposal');
  if (/price|cost|कितना|कीमत|दाम|price list|prices/.test(value)) ids.push('birthday', 'proposal', 'anniversary');
  if (/custom|personal|custom template|कस्टम|अपना/.test(value) && ids.length === 0) {
    ids.push(...templates.slice(0, 3).map((template) => template.id));
  }
  return [...new Set(ids)].slice(0, 3);
}

function parseAssistantResponse(content, lastUserText) {
  const raw = String(content || '').trim();
  const unfenced = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  try {
    const parsed = JSON.parse(unfenced);
    return {
      reply: String(parsed.reply || '').trim() || fallbackReply(lastUserText),
      templateIds: Array.isArray(parsed.templateIds) ? parsed.templateIds : recommendationIds(lastUserText),
    };
  } catch {
    return { reply: raw || fallbackReply(lastUserText), templateIds: recommendationIds(lastUserText) };
  }
}

export async function POST(request) {
  const ip = request.headers.get('x-vercel-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || 'unknown';

  if (isRateLimited(ip)) {
    return NextResponse.json({ error: 'Anya is getting lots of questions. Please try again in a minute.' }, { status: 429 });
  }

  const contentLength = Number(request.headers.get('content-length') || 0);
  if (contentLength > 12_000) {
    return NextResponse.json({ error: 'Please shorten your message and try again.' }, { status: 413 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Please send a valid chat message.' }, { status: 400 });
  }

  const messages = body?.messages;
  if (!Array.isArray(messages) || messages.length < 1 || messages.length > MAX_MESSAGES) {
    return NextResponse.json({ error: 'Please send up to 10 recent chat messages.' }, { status: 400 });
  }

  let totalLength = 0;
  const safeMessages = [];
  for (const message of messages) {
    if (!message || !['user', 'assistant'].includes(message.role) || typeof message.content !== 'string') {
      return NextResponse.json({ error: 'That chat message could not be read.' }, { status: 400 });
    }
    const content = message.content.trim();
    totalLength += content.length;
    if (!content || content.length > MAX_MESSAGE_LENGTH || totalLength > MAX_HISTORY_LENGTH) {
      return NextResponse.json({ error: 'Please shorten your message and try again.' }, { status: 400 });
    }
    safeMessages.push({ role: message.role, content });
  }

  const lastUserText = [...safeMessages].reverse().find((message) => message.role === 'user')?.content;
  if (!lastUserText) return NextResponse.json({ error: 'Please enter a message for Anya.' }, { status: 400 });

  const pricing = await getTemplatePricing();
  const activeTemplates = templates
    .filter((template) => pricing[template.id]?.enabled !== false)
    .map((template) => ({
      id: template.id,
      title: template.title,
      category: template.category,
      audience: template.audience,
      description: template.description,
      features: template.features,
      price: pricing[template.id]?.price ?? template.price,
    }));

  const systemMessage = {
    role: 'system',
    content: `You are Anya, LovelyCrafts' warm, helpful gift assistant. Reply in the language and style of the visitor: English, Hindi, or Hinglish. Keep replies friendly, concise (under 100 words), and grounded ONLY in these facts. If a fact is not listed, say you are unsure and offer the contact page. Never invent prices, discounts, features, custom-template capabilities, availability, order status, delivery status, or account data. You cannot inspect private gifts or orders. For missing gift links or payment issues, ask the visitor to check inbox/spam and contact ${CONTACT_EMAIL} or visit /contact with their Order ID. Prices below are current INR one-time prices. The FAQ says recipients open private gift links in a browser without installing an app; templates can be personalized with details and photos; the public experience is intended to be shareable by link. Published refund terms allow refunds for confirmed technical delivery failure or duplicate transactions reported within 48 hours, subject to the policy at /refund. Do not claim a WhatsApp support phone is available.\n\nCURRENT ACTIVE CATALOG: ${JSON.stringify(activeTemplates)}\n\nReturn ONLY valid JSON with exactly these keys: {"reply":"your visitor-facing response","templateIds":["valid template id",...]}. Include zero to three relevant IDs from the current active catalog when useful. Never include URLs, prices, or HTML in templateIds.`,
  };

  let assistantResult = { reply: fallbackReply(lastUserText), templateIds: recommendationIds(lastUserText) };
  if (process.env.HUGGINGFACE_API_KEY) {
    try {
      const response = await fetch('https://router.huggingface.co/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [systemMessage, ...safeMessages.slice(-8)],
          temperature: 0.35,
          max_tokens: 450,
          stream: false,
        }),
        signal: AbortSignal.timeout(12_000),
        cache: 'no-store',
      });
      if (!response.ok) throw new Error(`Hugging Face chat returned ${response.status}`);
      const result = await response.json();
      assistantResult = parseAssistantResponse(result?.choices?.[0]?.message?.content, lastUserText);
    } catch (error) {
      console.error('[Anya] AI response unavailable; using guided fallback.', error?.message || error);
    }
  }

  const validIds = new Set(activeTemplates.map((template) => template.id));
  const templateIds = [...new Set(assistantResult.templateIds)].filter((id) => validIds.has(id)).slice(0, 3);
  const recommendations = templateIds.map((id) => {
    const template = templates.find((item) => item.id === id);
    return { id, title: template.title, category: template.category, emoji: template.emoji, price: pricing[id]?.price ?? template.price };
  });

  return NextResponse.json({ reply: assistantResult.reply.slice(0, 1_000), recommendations });
}
