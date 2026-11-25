/**
 * Buy Club US — backend do Mercado Pago (Cloudflare Worker)
 *
 * Rotas:
 *   POST /checkout  → recebe o carrinho + dados do cliente, recalcula o total com os
 *                     preços oficiais do site e cria uma preferência no Mercado Pago
 *                     (Checkout Pro com Pix ou cartão). Devolve o link de pagamento.
 *   POST /frete     → recebe { cep, items } e devolve as opções de frete do Melhor Envio
 *                     (SEDEX, PAC etc.) com preço e prazo. Sem token configurado, devolve
 *                     { enabled: false } e o site usa o frete fixo.
 *   POST /webhook   → recebe a notificação do Mercado Pago, consulta o pagamento na API
 *                     e, quando aprovado, envia nome + endereço + itens para o seu WhatsApp.
 *   GET  /          → teste rápido ("ok").
 *
 * Variáveis (Cloudflare → Worker → Settings → Variables and Secrets):
 *   MP_ACCESS_TOKEN     (secret, obrigatório)  Access Token de produção do Mercado Pago
 *   SITE_URL            (obrigatório)          ex.: https://buyclub.us
 *   CATALOG_URL         (opcional)             de onde ler os preços; padrão: index.html do GitHub
 *   WHATSAPP_PHONE      (obrigatório p/ aviso) seu WhatsApp com DDI e DDD, ex.: 5541987439214
 *   CALLMEBOT_APIKEY    (secret, obrigatório p/ aviso) chave do CallMeBot que libera mensagens para esse número
 *   SHIPPING_FEE        (opcional)             frete fixo em reais; padrão 50 (usado quando não há Melhor Envio)
 *   MELHOR_ENVIO_TOKEN  (secret, opcional)     token do Melhor Envio; liga o cálculo de frete por CEP
 *   ME_FROM_CEP         (obrigatório c/ token) CEP de onde as encomendas saem
 *   ME_BOX_CM           (opcional)             medidas da caixa em cm "altura,largura,comprimento"; padrão "4,12,17"
 *   ME_BASE_WEIGHT_KG   (opcional)             peso da caixa vazia em kg; padrão 0.15
 *   ME_ITEM_WEIGHT_KG   (opcional)             peso de cada unidade em kg; padrão 0.05
 *   ME_SERVICES         (opcional)             IDs dos serviços do Melhor Envio; padrão "1,2,3,31" (Correios PAC e SEDEX, Jadlog .Package, Loggi Express); "todos" mostra tudo
 *   ME_EXTRA_FEE        (opcional)             valor somado a cada opção de frete (embalagem/manuseio); padrão 0
 *   ME_CONTACT          (opcional)             contato técnico enviado no User-Agent, ex.: um e-mail seu
 *   ME_SANDBOX          (opcional)             "1" para usar o ambiente de testes do Melhor Envio
 *   FREE_SHIP_CATEGORY  (opcional)             marca com frete grátis; padrão "newlife"
 *   FREE_SHIP_MIN_UNITS (opcional)             unidades dessa marca para ganhar frete grátis; padrão 3 (0 desliga)
 *   MP_WEBHOOK_SECRET   (secret, opcional)     "assinatura secreta" dos webhooks do Mercado Pago
 *   ORDERS              (KV, opcional)         evita aviso duplicado e guarda os pedidos pagos
 */

const DEFAULT_CATALOG_URL = 'https://raw.githubusercontent.com/ofakenot/buyclub/main/index.html';
const WHOLESALE_MIN = { atacado5: 5, atacado10: 10 };
const TYPE_LABEL = { varejo: 'Varejo', atacado5: 'Atacado (mín. 5)', atacado10: 'Atacado (mín. 10)' };
const CATALOG_TTL_MS = 5 * 60 * 1000;
const DEFAULT_SHIPPING_FEE = 50;
const DEFAULT_ME_SERVICES = '1,2,3,31'; // Correios PAC, Correios SEDEX, Jadlog .Package, Loggi Express
const DEFAULT_BOX_CM = '4,12,17';      // caixa de envio (altura, largura, comprimento)

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
      if (url.pathname === '/frete' && request.method === 'POST') {
        return json(await quoteShipping(request, env), 200, cors);
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
  if (!isValidCpf(customer.cpf)) throw new UserError('Informe um CPF válido. A transportadora exige o documento do destinatário.');

  const lines = await buildLines(body.items, env);
  const subtotal = round2(lines.reduce((s, l) => s + l.unit * l.qty, 0));
  const ship = await resolveShipping(env, customer.cep, lines, subtotal, body.shipping && body.shipping.service);
  const shipping = ship.price;
  const total = round2(subtotal + shipping);

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
    // No Mercado Pago aparece só o valor total do pedido (produtos + frete), sem o nome dos produtos.
    items: [{
      id: orderId,
      title: `Pedido Buy Club ${orderId}`,
      category_id: 'others',
      quantity: 1,
      currency_id: 'BRL',
      unit_price: total
    }],
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
      subtotal: String(subtotal),
      shipping: String(shipping),
      shipping_label: ship.label,
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


async function buildLines(items, env) {
  const catalog = await getCatalog(env);
  const lines = [];
  for (const raw of items) {
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
  return lines;
}

/* ------------------------------------------------------------------ */
/* Frete: Melhor Envio                                                  */
/* ------------------------------------------------------------------ */

// Frete grátis: a partir de N unidades da marca (New Life). No frete fixo zera o valor;
// no Melhor Envio a opção mais barata sai de graça e as outras mantêm o preço.
export function hasFreeShipping(env, lines) {
  const category = env.FREE_SHIP_CATEGORY || 'newlife';
  const min = Number(env.FREE_SHIP_MIN_UNITS ?? 3);
  if (!(min > 0)) return false;
  return lines.filter(l => l.product.category === category).reduce((s, l) => s + l.qty, 0) >= min;
}
function applyFreeShipping(options) {
  return options.map((o, i) => (i === 0 ? { ...o, price: 0, free: true } : o));
}

function shippingEnabled(env) { return !!(env.MELHOR_ENVIO_TOKEN && digits(env.ME_FROM_CEP).length === 8); }
function flatShipping(env) { return round2(Number(env.SHIPPING_FEE ?? DEFAULT_SHIPPING_FEE) || 0); }

// Capital de São Paulo: entrega expressa própria (motoboy), valor fixo e até 3 horas.
// Faixas de CEP do município de São Paulo: 01000-000 a 05999-999 e 08000-000 a 08499-999.
export function isSpCapital(cep) {
  const n = Number(digits(cep).slice(0, 8));
  return (n >= 1000000 && n <= 5999999) || (n >= 8000000 && n <= 8499999);
}
function spExpressOption(env) {
  return { id: 'sp3h', company: 'Buy Club', name: 'Entrega expressa SP', price: round2(Number(env.SP_EXPRESS_FEE ?? 50) || 0), express: true, eta: 'até 3 horas após o pedido', tracking: 'whatsapp' };
}
// Monta as opções para o CEP: transportadoras (Melhor Envio) + expressa na capital.
async function shippingOptions(env, cep, lines, subtotal) {
  const free = hasFreeShipping(env, lines);
  let options = [];
  try { options = await melhorEnvioQuote(env, cep, lines, subtotal); }
  catch (err) { if (!isSpCapital(cep)) throw err; }
  if (options.length && free) options = applyFreeShipping(options);
  if (isSpCapital(cep)) {
    const express = spExpressOption(env);
    // padrão na capital é a expressa; com frete grátis, a opção grátis continua em primeiro
    options = free && options.length ? [options[0], express, ...options.slice(1)] : [express, ...options];
  }
  return options;
}

async function quoteShipping(request, env) {
  if (!shippingEnabled(env)) return { enabled: false, flat: flatShipping(env) };
  const body = await request.json().catch(() => null);
  const cep = digits(body && body.cep).slice(0, 8);
  if (cep.length !== 8) throw new UserError('CEP inválido.');
  if (!body || !Array.isArray(body.items) || !body.items.length || body.items.length > 50) throw new UserError('Carrinho vazio.');
  const lines = await buildLines(body.items, env);
  const subtotal = round2(lines.reduce((s, l) => s + l.unit * l.qty, 0));
  const options = await shippingOptions(env, cep, lines, subtotal);
  if (!options.length) throw new UserError('Não encontramos frete para esse CEP. Fale com a gente pelo WhatsApp.');
  return { enabled: true, options };
}

// No checkout o preço do frete é sempre recalculado aqui, nunca aceito do navegador.
async function resolveShipping(env, cep, lines, subtotal, service) {
  const free = hasFreeShipping(env, lines);
  if (!shippingEnabled(env)) return free ? { price: 0, label: 'Frete grátis (New Life)' } : { price: flatShipping(env), label: 'Frete fixo' };
  if (!service) throw new UserError('Escolha uma opção de frete.');
  const options = await shippingOptions(env, cep, lines, subtotal);
  const chosen = options.find(o => String(o.id) === String(service));
  if (!chosen) throw new UserError('Essa opção de frete não está disponível para o CEP. Escolha outra.');
  if (chosen.express) return { price: chosen.price, label: `${chosen.name} (${chosen.eta}, rastreio pelo WhatsApp)` };
  return { price: chosen.price, label: `${chosen.company} ${chosen.name} (${chosen.daysMin && chosen.daysMax && chosen.daysMin !== chosen.daysMax ? `${chosen.daysMin} a ${chosen.daysMax}` : chosen.days} dias úteis)${chosen.free ? ' — grátis' : ''}` };
}

export function shippingPackage(env, lines) {
  const [h, w, l] = String(env.ME_BOX_CM || DEFAULT_BOX_CM).split(',').map(Number);
  const units = lines.reduce((s, x) => s + x.qty, 0);
  const weight = (Number(env.ME_BASE_WEIGHT_KG ?? 0.15) || 0) + units * (Number(env.ME_ITEM_WEIGHT_KG ?? 0.05) || 0);
  return { height: h || 4, width: w || 12, length: l || 17, weight: Math.max(0.1, round2(weight)) };
}

async function melhorEnvioQuote(env, cep, lines, subtotal) {
  const base = env.ME_SANDBOX === '1' ? 'https://sandbox.melhorenvio.com.br' : 'https://melhorenvio.com.br';
  const payload = {
    from: { postal_code: digits(env.ME_FROM_CEP) },
    to: { postal_code: cep },
    package: shippingPackage(env, lines),
    options: { insurance_value: subtotal, receipt: false, own_hand: false },
    ...(String(env.ME_SERVICES || DEFAULT_ME_SERVICES).toLowerCase() === 'todos' ? {} : { services: String(env.ME_SERVICES || DEFAULT_ME_SERVICES) })
  };
  const res = await fetch(`${base}/api/v2/me/shipment/calculate`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${env.MELHOR_ENVIO_TOKEN}`,
      'User-Agent': `Buy Club (${env.ME_CONTACT || 'buyclub.us'})`
    },
    body: JSON.stringify(payload)
  });
  const data = await res.json().catch(() => null);
  if (!res.ok || !Array.isArray(data)) {
    console.error('Melhor Envio error', res.status, JSON.stringify(data));
    throw new UserError('Não foi possível calcular o frete agora. Tente de novo em instantes.');
  }
  return parseQuotes(data, Number(env.ME_EXTRA_FEE) || 0);
}

function deliveryRange(o) {
  const r = o.custom_delivery_range || o.delivery_range || {};
  const min = Number(r.min) || null, max = Number(r.max) || null;
  return min && max ? { daysMin: min, daysMax: max } : {};
}

export function parseQuotes(data, extra = 0) {
  return data
    .filter(o => o && !o.error && Number(o.custom_price ?? o.price) > 0)
    .map(o => ({
      id: o.id,
      name: String(o.name || ''),
      company: String((o.company && o.company.name) || ''),
      price: round2(Number(o.custom_price ?? o.price) + extra),
      days: Number(o.custom_delivery_time ?? o.delivery_time) || null,
      ...deliveryRange(o)
    }))
    .sort((a, b) => a.price - b.price);
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
    items: m.items || '',
    subtotal: m.subtotal || '',
    shipping: m.shipping || '',
    shippingLabel: m.shipping_label || ''
  };

  if (env.ORDERS) {
    await env.ORDERS.put(key, JSON.stringify(order), { expirationTtl: 60 * 60 * 24 * 365 });
  }
  await notifyWhatsApp(env, order);
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

export function buildOrderMessage(o) {
  return [
    `✅ *PAGAMENTO APROVADO* — pedido ${o.orderId}`,
    `Valor pago: R$ ${brl(o.amount)} (${o.method})`,
    o.subtotal ? `Produtos: R$ ${brl(o.subtotal)} + frete R$ ${brl(o.shipping || 0)}` : null,
    o.shippingLabel ? `Envio: ${o.shippingLabel}` : null,
    `ID Mercado Pago: ${o.paymentId}`,
    '',
    '📦 *ENVIAR PARA*',
    `Nome: ${o.recipient}`,
    `WhatsApp: ${o.phone}`,
    o.email ? `E-mail: ${o.email}` : null,
    o.cpf ? `CPF: ${o.cpf}` : null,
    `Endereço: ${o.address}, nº ${o.number}${o.complement ? ` — ${o.complement}` : ''}`,
    `Bairro: ${o.neighborhood}`,
    `Cidade/UF: ${o.city}`,
    `CEP: ${o.cep}`,
    '',
    '🛒 *ITENS*',
    ...String(o.items).split(' | ').filter(Boolean).map(i => `• ${i}`)
  ].filter(l => l !== null).join('\n');
}

async function notifyWhatsApp(env, o) {
  const text = buildOrderMessage(o);
  if (!env.WHATSAPP_PHONE || !env.CALLMEBOT_APIKEY) {
    console.log('Pagamento aprovado (WhatsApp não configurado):\n' + text);
    return;
  }
  const url = `https://api.callmebot.com/whatsapp.php?phone=${encodeURIComponent(digits(env.WHATSAPP_PHONE))}&text=${encodeURIComponent(text)}&apikey=${encodeURIComponent(env.CALLMEBOT_APIKEY)}`;
  const res = await fetch(url);
  if (!res.ok) console.error('whatsapp (callmebot) error', res.status, await res.text());
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
  return new Response(JSON.stringify(data), { status, headers: { ...headers, 'Content-Type': 'application/json', 'X-Content-Type-Options': 'nosniff', 'Cache-Control': 'no-store' } });
}
export function isValidCpf(value) {
  const d = digits(value);
  if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false;
  const dv = len => { let sum = 0; for (let i = 0; i < len; i++) sum += Number(d[i]) * (len + 1 - i); const r = (sum * 10) % 11; return r === 10 ? 0 : r; };
  return dv(9) === Number(d[9]) && dv(10) === Number(d[10]);
}
function clean(v, max) { return String(v == null ? '' : v).replace(/\s+/g, ' ').trim().slice(0, max); }
function digits(v) { return String(v == null ? '' : v).replace(/\D/g, ''); }
function round2(n) { return Math.round(n * 100) / 100; }
function brl(n) { return Number(n).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
