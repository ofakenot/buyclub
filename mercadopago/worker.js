/**
 * Buy Club US — backend do Mercado Pago (Cloudflare Worker)
 *
 * Rotas:
 *   POST /checkout  → recebe o carrinho + dados do cliente, recalcula o total com os
 *                     preços oficiais do site e cria uma preferência no Mercado Pago
 *                     (Checkout Pro com Pix ou cartão). Devolve o link de pagamento.
 *   POST /webhook   → recebe a notificação do Mercado Pago, consulta o pagamento na API
 *                     e, quando aprovado, envia nome + endereço + itens para o Telegram.
 *   GET  /          → teste rápido ("ok").
 *
 * Variáveis (Cloudflare → Worker → Settings → Variables and Secrets):
 *   MP_ACCESS_TOKEN     (secret, obrigatório)  Access Token de produção do Mercado Pago
 *   SITE_URL            (obrigatório)          ex.: https://buyclub.us
 *   CATALOG_URL         (opcional)             de onde ler os preços; padrão: index.html do GitHub
 *   TELEGRAM_BOT_TOKEN  (secret, opcional)     bot que avisa quando um pagamento é aprovado
 *   TELEGRAM_CHAT_ID    (opcional)             seu chat id no Telegram
 *   MP_WEBHOOK_SECRET   (secret, opcional)     "assinatura secreta" dos webhooks do Mercado Pago
 *   ORDERS              (KV, opcional)         evita aviso duplicado e guarda os pedidos pagos
 */

const DEFAULT_CATALOG_URL = 'https://raw.githubusercontent.com/ofakenot/buyclub/main/index.html';
const WHOLESALE_MIN = { atacado5: 5, atacado10: 10 };
const TYPE_LABEL = { varejo: 'Varejo', atacado5: 'Atacado (mín. 5)', atacado10: 'Atacado (mín. 10)' };
const CATALOG_TTL_MS = 5 * 60 * 1000;

let catalogCache = { at: 0, url: '', products: null };

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const cors = corsHeaders(request, env);

    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });

    try {
      if (url.pathname === '/checkout' && request.method === 'POST') {
        return json(await createCheckout(request, env), 200, cors);
      }
      if (url.pathname === '/webhook' && request.method === 'POST') {
        await handleWebhook(request, env, url, ctx);
        return new Response('ok', { status: 200 });
      }
      if (url.pathname === '/' && request.method === 'GET') {
        return new Response('ok', { status: 200, headers: cors });
      }
      return json({ error: 'Rota não encontrada' }, 404, cors);
    } catch (err) {
      const status = err instanceof UserError ? 400 : 500;
      if (status === 500) console.error(err && err.stack || err);
      return json({ error: err instanceof UserError ? err.message : 'Erro ao processar o pagamento. Tente novamente.' }, status, cors);
    }
  }
};

class UserError extends Error {}

/* ------------------------------------------------------------------ */
/* Catálogo: lê os preços diretamente do index.html do site            */
/* ------------------------------------------------------------------ */

export function parseCatalog(html) {
  const start = html.indexOf('const productData = {');
  if (start < 0) throw new Error('productData não encontrado no index.html');
  const ptStart = html.indexOf('pt: [', start);
  const ptEnd = html.indexOf('\n  en: [', ptStart);
  if (ptStart < 0 || ptEnd < 0) throw new Error('lista pt do catálogo não encontrada');
  const section = html.slice(ptStart, ptEnd);

  const removedMatch = html.match(/const REMOVED_CATEGORIES\s*=\s*\[([^\]]*)\]/);
  const removed = removedMatch ? [...removedMatch[1].matchAll(/['"]([^'"]+)['"]/g)].map(m => m[1]) : [];

  const str = String.raw`"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'`;
  const tpl = '`(?:[^`\\\\]|\\\\.)*`';
  const val = String.raw`-?\d+(?:\.\d+)?|null|undefined|${str}`;
  const re = new RegExp(
    String.raw`makeProduct\(\s*(\d+)\s*,\s*(${str})\s*,\s*(?:[A-Za-z_$][\w$]*|${str}|${tpl})\s*,\s*(${str})\s*,\s*(${str})\s*,\s*\[[^\]]*\]\s*,\s*(${val})\s*,\s*(${val})\s*,\s*(${val})`,
    'g'
  );

  const products = new Map();
  for (const m of section.matchAll(re)) {
    const id = Number(m[1]);
    const category = unquote(m[4]);
    if (removed.includes(category)) continue;
    const p10 = toNumber(m[7]);
    products.set(id, {
      id,
      name: unquote(m[2]),
      badge: unquote(m[3]),
      category,
      varejo: toNumber(m[5]),
      atacado5: toNumber(m[6]),
      atacado10: p10 !== null && p10 > 0 ? p10 : null
    });
  }
  if (!products.size) throw new Error('nenhum produto lido do catálogo');
  return products;
}

function unquote(token) {
  const body = token.slice(1, -1);
  return body.replace(/\\(.)/g, '$1');
}
function toNumber(token) {
  return /^-?\d+(\.\d+)?$/.test(token) ? Number(token) : null;
}

async function getCatalog(env) {
  const url = env.CATALOG_URL || DEFAULT_CATALOG_URL;
  if (catalogCache.products && catalogCache.url === url && Date.now() - catalogCache.at < CATALOG_TTL_MS) {
    return catalogCache.products;
  }
  const res = await fetch(url, { cf: { cacheTtl: 60 } });
  if (!res.ok) throw new Error(`catálogo indisponível (${res.status})`);
  const products = parseCatalog(await res.text());
  catalogCache = { at: Date.now(), url, products };
  return products;
}

/* ------------------------------------------------------------------ */
/* POST /checkout                                                       */
/* ------------------------------------------------------------------ */

async function createCheckout(request, env) {
  if (!env.MP_ACCESS_TOKEN) throw new Error('MP_ACCESS_TOKEN não configurado');
  const body = await request.json().catch(() => null);
  if (!body || !Array.isArray(body.items) || !body.items.length) throw new UserError('Carrinho vazio.');
  if (body.items.length > 50) throw new UserError('Carrinho grande demais.');

  const method = body.method === 'card' ? 'card' : body.method === 'pix' ? 'pix' : null;
  if (!method) throw new UserError('Escolha Pix ou cartão.');

  const c = body.customer || {};
  const customer = {
    recipient: clean(c.recipient, 120),
    phone: clean(c.phone, 30),
    email: clean(c.email, 120),
    cpf: digits(c.cpf).slice(0, 11),
    cep: digits(c.cep).slice(0, 8),
    address: clean(c.address, 160),
    number: clean(c.number, 20),
    complement: clean(c.complement, 80),
    neighborhood: clean(c.neighborhood, 80),
    city: clean(c.city, 80)
  };
  const missing = ['recipient', 'phone', 'cep', 'address', 'number', 'neighborhood', 'city'].filter(k => !customer[k]);
  if (missing.length) throw new UserError('Preencha nome, WhatsApp e endereço completo.');
  if (customer.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email)) throw new UserError('E-mail inválido.');

  const catalog = await getCatalog(env);
  const lines = [];
  for (const raw of body.items) {
    const id = Number(raw && raw.id);
    const type = raw && raw.type;
    const qty = Math.floor(Number(raw && raw.qty));
    const product = catalog.get(id);
    if (!product) throw new UserError('Um dos produtos não está mais disponível. Atualize a página.');
    if (!['varejo', 'atacado5', 'atacado10'].includes(type)) throw new UserError('Condição de preço inválida.');
    if (!Number.isFinite(qty) || qty < 1 || qty > 500) throw new UserError('Quantidade inválida.');
    const min = WHOLESALE_MIN[type] || 1;
    if (qty < min) throw new UserError(`${product.name}: atacado exige no mínimo ${min} unidades.`);
    const unit = product[type];
    if (typeof unit !== 'number' || unit <= 0) throw new UserError(`${product.name}: valor sob consulta. Finalize pelo WhatsApp.`);
    lines.push({ product, type, qty, unit });
  }
  const total = round2(lines.reduce((s, l) => s + l.unit * l.qty, 0));

  const orderId = `BC${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).slice(2, 5).toUpperCase()}`;
  const site = (env.SITE_URL || 'https://buyclub.us').replace(/\/+$/, '');
  const workerUrl = new URL(request.url).origin;
  const [firstName, ...rest] = customer.recipient.split(/\s+/);
  const phoneDigits = digits(customer.phone);

  const excluded = method === 'pix'
    ? ['ticket', 'atm', 'credit_card', 'debit_card', 'prepaid_card']
    : ['ticket', 'atm', 'bank_transfer'];

  const preference = {
    external_reference: orderId,
    statement_descriptor: 'BUYCLUB',
    items: lines.map(l => ({
      id: String(l.product.id),
      title: `${l.product.badge} — ${l.product.name}`.slice(0, 250),
      description: TYPE_LABEL[l.type],
      category_id: 'others',
      quantity: l.qty,
      currency_id: 'BRL',
      unit_price: l.unit
    })),
    payer: {
      name: firstName,
      surname: rest.join(' '),
      ...(customer.email ? { email: customer.email } : {}),
      ...(customer.cpf.length === 11 ? { identification: { type: 'CPF', number: customer.cpf } } : {}),
      ...(phoneDigits.length >= 10 ? { phone: { area_code: phoneDigits.replace(/^55/, '').slice(0, 2), number: phoneDigits.replace(/^55/, '').slice(2) } } : {}),
      address: { zip_code: customer.cep, street_name: customer.address, street_number: customer.number }
    },
    payment_methods: {
      excluded_payment_types: excluded.map(id => ({ id })),
      installments: 12
    },
    back_urls: {
      success: `${site}/?pagamento=aprovado&pedido=${orderId}`,
      pending: `${site}/?pagamento=pendente&pedido=${orderId}`,
      failure: `${site}/?pagamento=falhou&pedido=${orderId}`
    },
    auto_return: 'approved',
    notification_url: `${workerUrl}/webhook`,
    metadata: {
      order_id: orderId,
      method,
      total: String(total),
      recipient: customer.recipient,
      phone: customer.phone,
      email: customer.email,
      cpf: customer.cpf,
      cep: customer.cep,
      address: customer.address,
      number: customer.number,
      complement: customer.complement,
      neighborhood: customer.neighborhood,
      city: customer.city,
      items: lines.map(l => `${l.qty}x ${l.product.badge} — ${l.product.name} (${TYPE_LABEL[l.type]}) R$ ${brl(l.unit)}`).join(' | ')
    }
  };

  const res = await fetch('https://api.mercadopago.com/checkout/preferences', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.MP_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
      'X-Idempotency-Key': orderId
    },
    body: JSON.stringify(preference)
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.init_point) {
    console.error('Mercado Pago preference error', res.status, JSON.stringify(data));
    throw new Error('Falha ao criar preferência no Mercado Pago');
  }
  return { orderId, total, url: data.init_point };
}

/* ------------------------------------------------------------------ */
/* POST /webhook                                                        */
/* ------------------------------------------------------------------ */

async function handleWebhook(request, env, url, ctx) {
  const body = await request.json().catch(() => ({}));
  const type = body.type || body.topic || url.searchParams.get('type') || url.searchParams.get('topic');
  const paymentId = (body.data && body.data.id) || url.searchParams.get('data.id') || url.searchParams.get('id');
  if (type !== 'payment' || !paymentId) return;

  if (env.MP_WEBHOOK_SECRET && !(await validSignature(request, env.MP_WEBHOOK_SECRET, String(paymentId)))) {
    console.warn('webhook com assinatura inválida ignorado');
    return;
  }

  // A fonte da verdade é sempre a API do Mercado Pago, nunca o corpo da notificação.
  const res = await fetch(`https://api.mercadopago.com/v1/payments/${encodeURIComponent(paymentId)}`, {
    headers: { Authorization: `Bearer ${env.MP_ACCESS_TOKEN}` }
  });
  if (!res.ok) { console.error('payment lookup failed', res.status); return; }
  const payment = await res.json();
  if (payment.status !== 'approved') return;

  const key = `pago:${payment.id}`;
  if (env.ORDERS) {
    if (await env.ORDERS.get(key)) return;
  }

  const m = payment.metadata || {};
  const order = {
    orderId: m.order_id || payment.external_reference || '',
    paymentId: payment.id,
    paidAt: payment.date_approved,
    amount: payment.transaction_amount,
    method: payment.payment_type_id === 'bank_transfer' ? 'Pix' : `Cartão${payment.installments > 1 ? ` ${payment.installments}x` : ''}`,
    recipient: m.recipient || [payment.payer && payment.payer.first_name, payment.payer && payment.payer.last_name].filter(Boolean).join(' '),
    phone: m.phone || '',
    email: m.email || (payment.payer && payment.payer.email) || '',
    cpf: m.cpf || '',
    address: m.address || '',
    number: m.number || '',
    complement: m.complement || '',
    neighborhood: m.neighborhood || '',
    city: m.city || '',
    cep: m.cep || '',
    items: m.items || ''
  };

  if (env.ORDERS) {
    await env.ORDERS.put(key, JSON.stringify(order), { expirationTtl: 60 * 60 * 24 * 365 });
  }
  await notifyTelegram(env, order);
}

async function validSignature(request, secret, dataId) {
  const header = request.headers.get('x-signature') || '';
  const requestId = request.headers.get('x-request-id') || '';
  const parts = Object.fromEntries(header.split(',').map(p => p.trim().split('=')).filter(p => p.length === 2));
  if (!parts.ts || !parts.v1) return false;
  const manifest = `id:${dataId.toLowerCase()};request-id:${requestId};ts:${parts.ts};`;
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(manifest));
  const hex = [...new Uint8Array(sig)].map(b => b.toString(16).padStart(2, '0')).join('');
  return hex === parts.v1;
}

async function notifyTelegram(env, o) {
  if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) {
    console.log('Pagamento aprovado (Telegram não configurado):', JSON.stringify(o));
    return;
  }
  const text = [
    `✅ PAGAMENTO APROVADO — pedido ${o.orderId}`,
    `Valor: R$ ${brl(o.amount)} (${o.method})`,
    `ID Mercado Pago: ${o.paymentId}`,
    '',
    '📦 ENVIAR PARA',
    `Nome: ${o.recipient}`,
    `WhatsApp: ${o.phone}`,
    o.email ? `E-mail: ${o.email}` : null,
    o.cpf ? `CPF: ${o.cpf}` : null,
    `Endereço: ${o.address}, nº ${o.number}${o.complement ? ` — ${o.complement}` : ''}`,
    `Bairro: ${o.neighborhood}`,
    `Cidade/UF: ${o.city}`,
    `CEP: ${o.cep}`,
    '',
    '🛒 ITENS',
    ...String(o.items).split(' | ').map(i => `• ${i}`)
  ].filter(l => l !== null).join('\n');

  const res = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: env.TELEGRAM_CHAT_ID, text })
  });
  if (!res.ok) console.error('telegram error', res.status, await res.text());
}

/* ------------------------------------------------------------------ */

function corsHeaders(request, env) {
  const origin = request.headers.get('Origin') || '';
  const site = (env.SITE_URL || 'https://buyclub.us').replace(/\/+$/, '');
  const allowed = [site, site.replace('://', '://www.')];
  return {
    'Access-Control-Allow-Origin': allowed.includes(origin) ? origin : site,
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    Vary: 'Origin'
  };
}
function json(data, status, headers) {
  return new Response(JSON.stringify(data), { status, headers: { ...headers, 'Content-Type': 'application/json' } });
}
function clean(v, max) { return String(v == null ? '' : v).replace(/\s+/g, ' ').trim().slice(0, max); }
function digits(v) { return String(v == null ? '' : v).replace(/\D/g, ''); }
function round2(n) { return Math.round(n * 100) / 100; }
function brl(n) { return Number(n).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
