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
 *   POST /cupom     → recebe { code, cpf, items } e diz se o cupom vale e quanto desconta.
 *   POST /pedido    → recebe { pedido, cpf } e devolve o status do pedido (página "Meu pedido").
 *                     Consulta o Mercado Pago; só responde se o CPF bater com o do pedido.
 *   POST /telegram  → webhook do bot do Telegram: você manda "código CPF nome" (ou o número do pedido)
 *                     e o código de rastreio aparece na página "Meu pedido" do cliente.
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
 *   ORDERS              (KV, opcional)         evita aviso duplicado, guarda os pedidos pagos e os CPFs que já compraram
 *   TELEGRAM_BOT_TOKEN  (secret, opcional)     token do bot criado no @BotFather (liga o bot de rastreio)
 *   TELEGRAM_SECRET     (secret, opcional)     senha do webhook do Telegram (qualquer texto longo)
 *   TELEGRAM_CHAT_IDS   (opcional)             IDs dos grupos (ou pessoas) do Telegram onde o bot funciona, separados por vírgula
 *   COUPONS             (opcional)             cupons extras em JSON, ex.: {"JOAO10":{"pct":10},"VIP50":{"value":50,"min":300}}
 *                                              campos: pct (porcentagem) ou value (reais), min (pedido mínimo),
 *                                              until ("AAAA-MM-DD"), first (só primeira compra), active (false desliga)
 */

const DEFAULT_CATALOG_URL = 'https://raw.githubusercontent.com/ofakenot/buyclub/main/index.html';
const WHOLESALE_MIN = { atacado5: 5, atacado10: 10 };
const TYPE_LABEL = { varejo: 'Varejo', atacado5: 'Atacado (mín. 5)', atacado10: 'Atacado (mín. 10)' };
const CATALOG_TTL_MS = 5 * 60 * 1000;
const DEFAULT_SHIPPING_FEE = 50;
const DEFAULT_ME_SERVICES = '1,2,3,31'; // Correios PAC, Correios SEDEX, Jadlog .Package, Loggi Express
const DEFAULT_BOX_CM = '4,12,17';      // caixa de envio (altura, largura, comprimento)

// Cupons padrão. O desconto vale sobre os produtos (não sobre o frete).
// Para criar cupons de influenciador sem mexer no código, use a variável COUPONS.
const DEFAULT_COUPONS = {
  BEMVINDO10: { pct: 10, first: true, label: 'Primeira compra' }
};

let catalogCache = { at: 0, url: '', products: null };

export default {
  // Cron do Worker (Settings > Trigger events > Cron, a cada 15 min): avisa carrinhos abandonados
  async scheduled(event, env, ctx) {
    ctx.waitUntil(Promise.all([
      checkAbandoned(env).catch(e => console.error('abandono', e && e.stack || e)),
      checkRebuy(env).catch(e => console.error('recompra', e && e.stack || e))
    ]));
  },
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
      if (url.pathname === '/cupom' && request.method === 'POST') {
        return json(await checkCoupon(request, env), 200, cors);
      }
      if (url.pathname === '/pedido' && request.method === 'POST') {
        return json(await lookupOrder(request, env), 200, cors);
      }
      if (url.pathname === '/telegram/setup' && request.method === 'GET') {
        return json(await setupTelegram(env, url.origin), 200, cors);
      }
      if (url.pathname === '/telegram' && request.method === 'POST') {
        // Lê o corpo ANTES de responder: depois que a resposta sai, o corpo pode não estar mais disponível.
        const tgUpdate = await request.json().catch(() => null);
        const tgJob = handleTelegram(request, env, tgUpdate).catch(e => console.error('telegram', e && e.stack || e));
        if (ctx && ctx.waitUntil) ctx.waitUntil(tgJob);
        else await tgJob;
        return new Response('ok', { status: 200 });
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
  const coupon = body.coupon ? await evaluateCoupon(env, body.coupon, customer.cpf, subtotal) : null;
  const discount = coupon ? coupon.discount : 0;
  const total = round2(subtotal - discount + shipping);

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
      coupon: coupon ? coupon.code : '',
      discount: String(discount),
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
  await trackOpenCheckout(env, { orderId, at: Date.now(), recipient: customer.recipient, phone: customer.phone, city: customer.city, total, items: preference.metadata.items });
  return { orderId, total, discount, coupon: coupon ? coupon.code : null, url: data.init_point };
}

/* ------------------------------------------------------------------ */
/* Carrinho abandonado: checkout aberto que não virou pagamento        */
/* ------------------------------------------------------------------ */

const ABANDON_AFTER_MIN = 40;   // espera antes de avisar
const ABANDON_MAX_HOURS = 24;   // depois disso, descarta sem avisar

// Um registro por telefone (o último checkout). Se a pessoa tentar de novo e pagar, o aviso não sai.
async function trackOpenCheckout(env, c) {
  const phone = digits(c.phone);
  if (!env.ORDERS || phone.length < 10) return;
  try { await env.ORDERS.put(`aberto:${phone}`, JSON.stringify(c), { expirationTtl: 60 * 60 * 48 }); }
  catch (e) { console.error('aberto put', e && e.message); }
}

export function abandonedCard(c) {
  const phone = digits(c.phone);
  const waPhone = phone.length === 10 || phone.length === 11 ? '55' + phone : phone;
  const first = String(c.recipient || '').split(/\s+/)[0] || '';
  const waText = `Olá, ${first}! Vi que você começou um pedido na Buy Club (R$ ${brl(c.total)}) e não chegou a finalizar o pagamento. Posso te ajudar a concluir?`;
  const items = String(c.items || '').split(' | ').filter(Boolean).map(i => i.replace(/\s+[—–-]\s+/g, ' '));
  const mins = Math.round((Date.now() - c.at) / 60000);
  return [
    `🛒 <b>Carrinho abandonado</b> (${mins >= 60 ? `${Math.round(mins / 60)} h` : `${mins} min`})`,
    `${h(c.recipient || '')}${c.city ? ` · ${h(c.city)}` : ''}`,
    `Total: <b>R$ ${h(brl(c.total))}</b>`,
    ...items.map(i => `• ${h(i)}`),
    `WhatsApp: ${h(phone)}`,
    `Pedido: <code>${h(c.orderId)}</code>${c.status ? ` (${h(c.status)})` : ''}`,
    '',
    waPhone.length >= 12 ? `📲 <a href="https://wa.me/${waPhone}?text=${encodeURIComponent(waText)}">Chamar no WhatsApp</a>` : null
  ].filter(x => x !== null).join('\n');
}

export async function checkAbandoned(env) {
  if (!env.ORDERS || !env.TELEGRAM_BOT_TOKEN) return;
  const list = await env.ORDERS.list({ prefix: 'aberto:' });
  for (const k of list.keys) {
    const c = JSON.parse(await env.ORDERS.get(k.name) || 'null');
    if (!c || !c.at) { await env.ORDERS.delete(k.name); continue; }
    const age = Date.now() - c.at;
    if (age < ABANDON_AFTER_MIN * 60000) continue;
    await env.ORDERS.delete(k.name); // avisa uma vez só
    if (age > ABANDON_MAX_HOURS * 3600000) continue;
    let pay = null;
    try { pay = await mpOrder(env, c.orderId); } catch (e) { console.error('abandono mp', e && e.message); }
    if (pay && (pay.status === 'approved' || pay.status === 'authorized')) continue;
    c.status = pay ? ({ pending: 'Pix gerado, não pago', in_process: 'em análise', rejected: 'pagamento recusado', cancelled: 'cancelado' }[pay.status] || pay.status) : 'não chegou a pagar';
    for (const chat of tgChats(env)) {
      try { await tgPost(env, chat, 'abandono', abandonedCard(c)); } catch (e) { console.error('abandono tg', e && e.message); }
    }
  }
}

/* ------------------------------------------------------------------ */
/* Cupons de desconto                                                   */
/* ------------------------------------------------------------------ */

export function couponTable(env) {
  const table = {};
  const add = (code, rule) => {
    const key = String(code || '').trim().toUpperCase();
    if (key && rule && typeof rule === 'object') table[key] = rule;
  };
  Object.entries(DEFAULT_COUPONS).forEach(([k, v]) => add(k, v));
  if (env.COUPONS) {
    try { Object.entries(JSON.parse(env.COUPONS)).forEach(([k, v]) => add(k, v)); }
    catch (e) { console.error('COUPONS inválido (JSON)', e && e.message); }
  }
  return table;
}

export function couponDiscount(rule, subtotal) {
  const pct = Number(rule.pct) || 0;
  const value = Number(rule.value) || 0;
  const raw = pct > 0 ? subtotal * Math.min(pct, 90) / 100 : value;
  return round2(Math.max(0, Math.min(raw, subtotal)));
}

// Cupons criados pelo bot (influenciador, indicação, prêmio) ficam no KV como cupom:<CÓDIGO>
async function getCouponRule(env, code) {
  if (env.ORDERS) {
    const kv = await env.ORDERS.get(`cupom:${code}`);
    if (kv) return JSON.parse(kv);
  }
  return couponTable(env)[code] || null;
}
const couponCode = raw => String(raw || '').trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '').slice(0, 30);

async function evaluateCoupon(env, rawCode, cpf, subtotal, now = new Date()) {
  const code = couponCode(rawCode);
  if (!code) throw new UserError('Digite o cupom.');
  const rule = await getCouponRule(env, code);
  if (!rule || rule.active === false || rule.uses === 0) throw new UserError('Cupom inválido ou expirado.');
  if (rule.kind === 'indicacao' && cpf && rule.owner === cpf) throw new UserError('Este é o seu cupom de indicação. Ele vale para os seus amigos.');
  if (rule.kind === 'premio' && cpf && rule.owner && rule.owner !== cpf) throw new UserError('Este cupom é pessoal e vale só para quem ganhou.');
  if (rule.until && now.toISOString().slice(0, 10) > String(rule.until)) throw new UserError('Cupom inválido ou expirado.');
  const min = Number(rule.min) || 0;
  if (min && subtotal < min) throw new UserError(`Este cupom vale para pedidos a partir de R$ ${brl(min)} em produtos.`);
  if (rule.first && env.ORDERS && cpf && await env.ORDERS.get(`cliente:${cpf}`)) {
    throw new UserError('Este cupom vale só na primeira compra.');
  }
  const discount = couponDiscount(rule, subtotal);
  if (!(discount > 0)) throw new UserError('Cupom inválido ou expirado.');
  return {
    code,
    label: clean(rule.label, 60),
    pct: Number(rule.pct) > 0 ? Math.min(Number(rule.pct), 90) : null,
    value: Number(rule.pct) > 0 ? null : Number(rule.value) || null,
    min: min || null,
    discount
  };
}

async function checkCoupon(request, env) {
  const body = await request.json().catch(() => null);
  if (!body || !Array.isArray(body.items) || !body.items.length) throw new UserError('Carrinho vazio.');
  if (body.items.length > 50) throw new UserError('Carrinho grande demais.');
  const cpf = digits(body.cpf).slice(0, 11);
  const lines = await buildLines(body.items, env);
  const subtotal = round2(lines.reduce((s, l) => s + l.unit * l.qty, 0));
  const coupon = await evaluateCoupon(env, body.code, cpf, subtotal);
  return { ok: true, ...coupon, subtotal };
}

/* ------------------------------------------------------------------ */
/* POST /pedido — página "Meu pedido"                                   */
/* ------------------------------------------------------------------ */

const PAYMENT_RANK = { approved: 6, authorized: 5, in_process: 4, in_mediation: 4, pending: 3, refunded: 2, charged_back: 2, cancelled: 1, rejected: 1 };

function paymentCpf(p) {
  const m = (p && p.metadata) || {};
  return digits(m.cpf || (p && p.payer && p.payer.identification && p.payer.identification.number));
}

// Pagamento "principal" de um pedido no Mercado Pago (aprovado tem prioridade), ou null.
async function mpOrder(env, orderId) {
  const res = await fetch(`https://api.mercadopago.com/v1/payments/search?external_reference=${encodeURIComponent(orderId)}&sort=date_created&criteria=desc&limit=20`, {
    headers: { Authorization: `Bearer ${env.MP_ACCESS_TOKEN}` }
  });
  if (!res.ok) { console.error('payment search failed', res.status); throw new Error('Falha ao consultar o Mercado Pago'); }
  const data = await res.json().catch(() => ({}));
  const results = (Array.isArray(data.results) ? data.results : []).filter(p => p.external_reference === orderId);
  if (!results.length) return null;
  results.sort((a, b) => (PAYMENT_RANK[b.status] || 0) - (PAYMENT_RANK[a.status] || 0) || String(b.date_created).localeCompare(String(a.date_created)));
  return results[0];
}

// Pedido de teste (criado pelo bot com /pedidoteste): fica só no KV, no mesmo formato de um pagamento do Mercado Pago.
async function getOrder(env, orderId) {
  if (env.ORDERS && /^BCTESTE/.test(orderId)) {
    const t = await env.ORDERS.get(`teste:${orderId}`);
    if (t) return JSON.parse(t);
  }
  return mpOrder(env, orderId);
}

async function createTestOrder(env, cpf, name) {
  const orderId = 'BCTESTE' + Array.from(crypto.getRandomValues(new Uint8Array(4)), b => 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[b % 32]).join('');
  const now = new Date().toISOString();
  const pay = {
    status: 'approved', date_created: now, date_approved: now, transaction_amount: 0,
    payment_type_id: 'bank_transfer', installments: 1, external_reference: orderId,
    metadata: { cpf, recipient: name, city: 'São Paulo/SP', items: 'Produto de teste x1 (pedido de teste, sem cobrança)', subtotal: 0, shipping: 0, shipping_label: 'Correios PAC (teste)', phone: digits(env.WHATSAPP_PHONE || '') }
  };
  const ttl = { expirationTtl: 60 * 60 * 24 * 7 };
  await env.ORDERS.put(`teste:${orderId}`, JSON.stringify(pay), ttl);
  const list = JSON.parse(await env.ORDERS.get(`cpfpedidos:${cpf}`) || '[]').filter(id => id !== orderId);
  list.unshift(orderId);
  await env.ORDERS.put(`cpfpedidos:${cpf}`, JSON.stringify(list.slice(0, 20)));
  return orderId;
}

async function lookupOrder(request, env) {
  if (!env.MP_ACCESS_TOKEN) throw new Error('MP_ACCESS_TOKEN não configurado');
  const body = await request.json().catch(() => null) || {};
  const orderId = String(body.pedido || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 24);
  const cpf = digits(body.cpf).slice(0, 11);
  if (orderId.length < 6) throw new UserError('Digite o número do pedido (começa com BC).');
  if (!isValidCpf(cpf)) throw new UserError('Digite o CPF usado na compra.');

  const p = await getOrder(env, orderId);
  // A mesma resposta para "não existe" e "CPF não bate": não revela se o número existe.
  if (!p || paymentCpf(p) !== cpf) return { found: false };
  const m = p.metadata || {};
  return {
    found: true,
    orderId,
    status: p.status,
    createdAt: p.date_created || null,
    paidAt: p.date_approved || null,
    amount: p.transaction_amount,
    method: p.payment_type_id === 'bank_transfer' ? 'Pix' : `Cartão${p.installments > 1 ? ` ${p.installments}x` : ''}`,
    name: String(m.recipient || '').split(/\s+/)[0] || '',
    city: m.city || '',
    items: String(m.items || '').split(' | ').filter(Boolean),
    subtotal: m.subtotal || null,
    shipping: m.shipping || null,
    shippingLabel: m.shipping_label || '',
    express: /expressa/i.test(String(m.shipping_label || '')),
    coupon: m.coupon || '',
    discount: m.discount || null,
    tracking: env.ORDERS ? JSON.parse(await env.ORDERS.get(`envio:${orderId}`) || 'null') : null,
    // cupom de indicação do cliente (só para pedido aprovado, que já passou pelo webhook)
    ...(await referralInfo(env, p.status === 'approved' ? cpf : '')),
    referralPct: REFERRAL_PCT
  };
}

/* ------------------------------------------------------------------ */
/* Rastreio pelo bot do Telegram                                        */
/* ------------------------------------------------------------------ */

const CARRIERS = {
  correios: { name: 'Correios', url: c => `https://rastreamento.correios.com.br/app/index.php?objetos=${encodeURIComponent(c)}` },
  jadlog: { name: 'Jadlog', url: c => `https://www.jadlog.com.br/jadlog/tracking?cte=${encodeURIComponent(c)}` },
  loggi: { name: 'Loggi', url: c => `https://www.loggi.com/rastreador/${encodeURIComponent(c)}` }
};
const CARRIER_WORDS = { correios: 'correios', sedex: 'correios', pac: 'correios', jadlog: 'jadlog', loggi: 'loggi' };

export function detectCarrier(code, hint) {
  if (hint && CARRIERS[hint]) return hint;
  if (/^[A-Z]{2}\d{9}[A-Z]{2}$/.test(code)) return 'correios';
  if (/^\d{14}$/.test(code)) return 'jadlog';
  return 'loggi';
}

const normName = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z\s]/g, ' ').split(/\s+/).filter(w => w.length > 1);

// Lê a mensagem: "AB123456789BR 529.982.247-25 Ana Silva" (em qualquer ordem; transportadora e nº do pedido opcionais)
export function parseTrackingMessage(text) {
  let rest = ' ' + String(text || '').replace(/[\r\n,;]+/g, ' ') + ' ';
  const take = re => { const m = rest.match(re); if (m) rest = rest.replace(m[0], ' '); return m; };
  const order = take(/\bBC[A-Z0-9]{6,22}\b/i);
  let cpf = null;
  for (const m of rest.matchAll(/(?<![\d])(\d{3}\.?\d{3}\.?\d{3}-?\d{2})(?![\d])/g)) {
    if (isValidCpf(m[1])) { cpf = digits(m[1]); rest = rest.replace(m[0], ' '); break; }
  }
  let carrier = null;
  for (const [w, c] of Object.entries(CARRIER_WORDS)) {
    const re = new RegExp(`(^|\\s)${w}(\\s|$)`, 'i');
    if (re.test(rest)) { carrier = c; rest = rest.replace(re, ' '); break; }
  }
  rest = rest.replace(/(^|\s)(rastreio|codigo|código|pedido|cpf|nome)[:]?(?=\s)/gi, ' ');
  const tokens = rest.split(/\s+/).filter(Boolean);
  const codeTok = tokens.find(t => /^[A-Z]{2}\d{9}[A-Z]{2}$/i.test(t)) || tokens.find(t => /\d/.test(t) && /^[A-Z0-9-]{6,40}$/i.test(t));
  const code = codeTok ? codeTok.toUpperCase().replace(/[^A-Z0-9]/g, '') : '';
  const name = tokens.filter(t => t !== codeTok && /^[\p{L}'.-]+$/u.test(t)).join(' ');
  return { orderId: order ? order[0].toUpperCase() : '', cpf, code, carrier, name };
}

async function tgSend(env, chatId, text, thread) {
  const res = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML', disable_web_page_preview: true, ...(thread ? { message_thread_id: thread } : {}) })
  });
  const out = await res.json().catch(() => ({}));
  if (!res.ok) console.error('telegram sendMessage', res.status, JSON.stringify(out));
  // grupo que virou supergrupo: o Telegram informa o novo ID; reenvia para ele
  const moved = out && out.parameters && out.parameters.migrate_to_chat_id;
  if (moved && moved !== chatId) return tgSend(env, moved, text);
  // tópico apagado: posta no geral
  if (thread && !out.ok && /thread not found|TOPIC_DELETED|TOPIC_CLOSED/i.test(out.description || '')) {
    if (env.ORDERS) await env.ORDERS.delete(`topicos:${chatId}`).catch(() => {});
    return tgSend(env, chatId, text);
  }
  return out;
}

// Tópicos (pastas) do grupo. Se o grupo tiver Tópicos ligados e o bot puder gerenciar, ele cria cada pasta uma vez.
const TOPICS = {
  pedidos: { name: '📦 Pedidos pagos', color: 7322096 },
  abandono: { name: '🛒 Carrinhos abandonados', color: 16766590 },
  cupons: { name: '🎟️ Cupons e indicações', color: 13338331 },
  recompra: { name: '🔁 Recompra', color: 9367192 }
};
async function topicFor(env, chat, kind) {
  if (!env.ORDERS || !TOPICS[kind] || !String(chat).startsWith('-')) return undefined;
  const key = `topicos:${chat}`;
  const map = JSON.parse(await env.ORDERS.get(key) || '{}');
  if (map.off && Date.now() - map.off < 3600000) return undefined; // grupo sem tópicos: tenta de novo a cada hora
  if (map[kind]) return map[kind];
  const res = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/createForumTopic`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chat, name: TOPICS[kind].name, icon_color: TOPICS[kind].color })
  });
  const out = await res.json().catch(() => ({}));
  if (out.ok && out.result) { map[kind] = out.result.message_thread_id; delete map.off; }
  else { console.warn('createForumTopic', JSON.stringify(out)); map.off = Date.now(); }
  await env.ORDERS.put(key, JSON.stringify(map));
  return map[kind];
}
async function tgPost(env, chat, kind, text) {
  return tgSend(env, chat, text, await topicFor(env, chat, kind).catch(() => undefined));
}
const h = s => String(s == null ? '' : s).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));

const TG_HELP = [
  '📦 <b>Bot de rastreio Buy Club</b>',
  '',
  'Quando um pedido é pago, eu posto ele aqui. Depois de postar o pacote, <b>responda a mensagem do pedido só com o código de rastreio</b>. Pronto.',
  '',
  'Também dá para mandar <b>/rastreio</b> + código, CPF e nome do cliente. Exemplo:',
  '<code>/rastreio AB123456789BR 529.982.247-25 Ana Silva</code>',
  '',
  'O código aparece na hora na página "Meu pedido" do cliente, com o link da transportadora.',
  '• Se o cliente tiver mais de um pedido, mande também o número (BC…).',
  '• A transportadora é reconhecida pelo código. Para escolher, escreva correios, jadlog ou loggi.',
  '• Para apagar um rastreio: <code>/apagar BC…</code>',
  '• Para criar um pedido de teste (sem cobrança, some em 7 dias): <code>/pedidoteste</code> (opcional: CPF e nome)',
  '',
  '<b>Cupons</b>',
  '• Criar cupom de influenciador: <code>/cupom JULIA 10</code> (10%). Só na primeira compra: <code>/cupom JULIA 10 primeira</code>',
  '• Apagar: <code>/cupom JULIA apagar</code>',
  '• Ver vendas por cupom: <code>/cupons</code>',
  '',
  'Também aviso aqui os carrinhos abandonados, as indicações e a hora da recompra de cada cliente.'
].join('\n');

// Liga o webhook do bot neste Worker (abrir https://<worker>/telegram/setup uma vez depois de criar os secrets).
async function setupTelegram(env, origin) {
  if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_SECRET) return { ok: false, error: 'Crie os secrets TELEGRAM_BOT_TOKEN e TELEGRAM_SECRET no Worker.' };
  const res = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/setWebhook`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: `${origin}/telegram`, secret_token: env.TELEGRAM_SECRET, allowed_updates: ['message', 'edited_message'] })
  });
  const data = await res.json().catch(() => ({}));
  const api = m => fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/${m}`).then(r => r.json()).catch(() => ({}));
  const [me, info] = await Promise.all([api('getMe'), api('getWebhookInfo')]);
  const w = info.result || {};
  return {
    ok: !!data.ok, description: data.description || '',
    bot: me.result ? `@${me.result.username}` : (me.description || 'token inválido'),
    webhookUrl: w.url || '', pending: w.pending_update_count || 0,
    lastError: w.last_error_message || '', chatsLiberados: String(env.TELEGRAM_CHAT_IDS || '').split(',').filter(Boolean).length,
    kv: !!env.ORDERS
  };
}

// Cartão do pedido pago que o bot posta no grupo. Responder a ele com o código salva o rastreio.
// Dados de comprovante do pagamento, direto da API do Mercado Pago
export function paymentReceipt(p) {
  const card = p.card && p.card.last_four_digits;
  const brand = String(p.payment_method_id || '').replace(/^(deb|debit_?)/i, '');
  const method = p.payment_type_id === 'bank_transfer' || p.payment_method_id === 'pix' ? 'Pix'
    : `${p.payment_type_id === 'debit_card' ? 'Débito' : 'Cartão'}${brand ? ` ${brand.charAt(0).toUpperCase() + brand.slice(1)}` : ''}${card ? ` final ${card}` : ''}${p.installments > 1 ? `, ${p.installments}x` : ''}`;
  const td = p.transaction_details || {};
  const fees = (Array.isArray(p.fee_details) ? p.fee_details : []).reduce((sum, f) => sum + (Number(f.amount) || 0), 0);
  return {
    id: p.id, method,
    at: p.date_approved || p.date_created || '',
    amount: td.total_paid_amount || p.transaction_amount,
    net: td.net_received_amount != null ? td.net_received_amount : null,
    fees: fees || null,
    payer: [p.payer && p.payer.first_name, p.payer && p.payer.last_name].filter(Boolean).join(' ')
  };
}
function receiptLines(r) {
  if (!r || !r.id) return [];
  const when = r.at && !isNaN(new Date(r.at)) ? new Date(r.at).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '';
  return [
    '',
    '🧾 <b>Comprovante Mercado Pago</b>',
    `Status: aprovado${when ? ` em ${h(when)}` : ''}`,
    `Valor pago: R$ ${h(brl(r.amount))}`,
    `Forma: ${h(r.method)}`,
    r.net != null ? `Você recebe: R$ ${h(brl(r.net))}${r.fees ? ` (taxa R$ ${h(brl(r.fees))})` : ''}` : null,
    r.payer ? `Pagador: ${h(r.payer)}` : null,
    `ID do pagamento: <code>${h(r.id)}</code>`
  ];
}

// Mensagem pronta (WhatsApp) com o número do pedido para o cliente: negrito, números sozinhos na linha, sem emojis nem hífens
export function orderNumberWaText(o, site) {
  const first = String(o.recipient || '').split(/\s+/)[0] || '';
  site = String(site || 'https://buyclub.us').replace(/\/+$/, '');
  return [
    `Olá${first ? `, ${first}` : ''}! Recebemos o pagamento do seu pedido na Buy Club.`,
    `*Número do pedido*\n${o.orderId}`,
    `*Acompanhe seu pedido*\n${site}/?pedido=${o.orderId}\nPara ver, informe o número do pedido e o seu CPF.`,
    'Assim que o pedido for enviado, mandamos o código de rastreio por aqui.'
  ].join('\n\n');
}

export function tgOrderCard(o, test, site) {
  const phone = digits(o.phone);
  const waPhone = phone.length === 10 || phone.length === 11 ? '55' + phone : phone;
  const addr = [o.address && `${o.address}${o.number ? `, nº ${o.number}` : ''}${o.complement ? ` — ${o.complement}` : ''}`, o.neighborhood, o.city, o.cep && `CEP ${o.cep}`].filter(Boolean).join(' · ');
  const items = String(o.items || '').split(' | ').filter(Boolean);
  return [
    `${test ? '🧪' : '🛒'} <b>Pedido pago ${h(o.orderId)}</b>${test ? ' (TESTE, sem cobrança)' : ''}`,
    `${h(o.recipient || '')}${o.city ? ` · ${h(o.city)}` : ''}`,
    ...items.map(i => `• ${h(i)}`),
    o.shippingLabel ? `Envio: ${h(o.shippingLabel)}` : null,
    addr ? `Endereço: ${h(addr)}` : null,
    o.cpf ? `CPF: ${h(o.cpf)}` : null,
    o.phone ? `WhatsApp: ${h(o.phone)}` : null,
    ...receiptLines(o.receipt),
    '',
    waPhone.length >= 12 ? `📲 <a href="https://wa.me/${waPhone}?text=${encodeURIComponent(orderNumberWaText(o, site))}">Enviar o número do pedido ao cliente</a>` : null,
    '↩️ <i>Responda esta mensagem só com o código de rastreio.</i>'
  ].filter(x => x !== null).join('\n');
}

function tgChats(env) {
  const all = String(env.TELEGRAM_CHAT_IDS || '').split(',').map(x => x.trim()).filter(Boolean);
  const groups = all.filter(id => id.startsWith('-'));
  return groups.length ? groups : all;
}

// PDF simples (A4, Helvetica) com os dados do pagamento. Gerado aqui mesmo, sem biblioteca.
export function receiptPdf(o, test) {
  const r = o.receipt || {};
  const clean = v => String(v == null ? '' : v).replace(/[—–]/g, '-').normalize('NFC').replace(/[^\x20-\x7E\xA0-\xFF]/g, '');
  const esc = v => clean(v).replace(/[\\()]/g, m => '\\' + m);
  const ops = [];
  const text = (x, y, size, bold, str, gray) => ops.push(`${gray ? '0.45 g' : '0.1 g'} BT /${bold ? 'F2' : 'F1'} ${size} Tf ${x} ${y} Td (${esc(str)}) Tj ET`);
  const when = d => d && !isNaN(new Date(d)) ? new Date(d).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '';
  const money = n => n == null || n === '' ? '' : `R$ ${brl(n)}`;
  let y = 0;
  const rule = () => { ops.push(`0.85 G 0.8 w 40 ${y} m 555 ${y} l S`); y -= 22; };
  const section = title => { y -= 6; text(40, y, 11, true, title.toUpperCase()); y -= 10; rule(); };
  const row = (label, value) => { if (value == null || value === '') return; text(40, y, 9, false, label, true); text(190, y, 11, false, value); y -= 20; };
  // cabeçalho
  ops.push('0.07 g 0 772 595 70 re f');
  ops.push('1 g BT /F2 22 Tf 40 806 Td (BUY CLUB) Tj ET');
  ops.push(`1 g BT /F1 11 Tf 40 786 Td (${esc('Comprovante de pagamento' + (test ? ' (TESTE, sem cobrança)' : ''))}) Tj ET`);
  y = 735;
  ops.push('0.13 0.55 0.3 rg 40 ' + (y - 7) + ' 166 24 re f');
  ops.push(`1 g BT /F2 11 Tf 50 ${y} Td (PAGAMENTO APROVADO) Tj ET`);
  y -= 40;
  section('Pagamento');
  row('Pedido', o.orderId);
  row('Valor pago', money(r.amount != null ? r.amount : o.amount));
  row('Forma', r.method || o.method);
  row('Data e hora', when(r.at || o.paidAt));
  row('Taxa Mercado Pago', r.fees ? money(r.fees) : '');
  row('Valor líquido', r.net != null ? money(r.net) : '');
  row('ID do pagamento', r.id || o.paymentId);
  section('Cliente');
  row('Nome', o.recipient);
  row('CPF', o.cpf);
  row('Pagador', r.payer);
  const items = String(o.items || '').split(' | ').filter(Boolean);
  if (items.length) {
    section('Itens');
    for (const it of items.slice(0, 12)) { text(40, y, 10, false, clean(it).slice(0, 95)); y -= 17; }
    y -= 6;
  }
  section('Valores');
  row('Produtos', o.subtotal ? money(o.subtotal) : '');
  row('Frete', o.subtotal ? money(o.shipping || 0) : '');
  row('Cupom', o.coupon && Number(o.discount) > 0 ? `${o.coupon} (desconto de ${money(o.discount)})` : '');
  row('Envio', o.shippingLabel);
  row('Total', money(r.amount != null ? r.amount : o.amount));
  text(40, 60, 8, false, 'Dados obtidos da API do Mercado Pago. Confira pelo ID do pagamento no painel do Mercado Pago.', true);
  text(40, 48, 8, false, `Emitido em ${when(new Date().toISOString())} (horário de Brasília) · buyclub.us`, true);

  const stream = ops.join('\n');
  const objs = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>',
    `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`
  ];
  let pdf = '%PDF-1.4\n%\xE2\xE3\xCF\xD3\n';
  const offsets = [];
  objs.forEach((body, i) => { offsets.push(pdf.length); pdf += `${i + 1} 0 obj\n${body}\nendobj\n`; });
  const xref = pdf.length;
  pdf += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n` + offsets.map(n => String(n).padStart(10, '0') + ' 00000 n \n').join('');
  pdf += `trailer\n<< /Size ${objs.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return Uint8Array.from(pdf, c => c.charCodeAt(0) & 0xFF);
}

async function tgSendDocument(env, chatId, bytes, filename, caption, replyTo, thread) {
  const fd = new FormData();
  fd.append('chat_id', String(chatId));
  if (thread) fd.append('message_thread_id', String(thread));
  fd.append('document', new Blob([bytes], { type: 'application/pdf' }), filename);
  if (caption) fd.append('caption', caption);
  if (replyTo) fd.append('reply_to_message_id', String(replyTo));
  const res = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendDocument`, { method: 'POST', body: fd });
  if (!res.ok) console.error('telegram sendDocument', res.status, await res.text());
}

// Posta o pedido e, logo abaixo (como resposta), o PDF do comprovante
async function postOrderWithReceipt(env, chat, o, test, thread) {
  if (thread === undefined) thread = await topicFor(env, chat, 'pedidos').catch(() => undefined);
  const out = await tgSend(env, chat, tgOrderCard(o, test, env.SITE_URL), thread);
  const sent = out && out.result;
  try {
    await tgSendDocument(env, (sent && sent.chat && sent.chat.id) || chat, receiptPdf(o, test), `comprovante-${o.orderId}.pdf`, `Comprovante do pedido ${o.orderId}`, sent && sent.message_id, sent && sent.message_thread_id);
  } catch (e) { console.error('comprovante pdf', e && e.stack || e); }
}

async function notifyTelegramOrder(env, o) {
  if (!env.TELEGRAM_BOT_TOKEN) return;
  for (const chat of tgChats(env)) {
    try { await postOrderWithReceipt(env, chat, o); } catch (e) { console.error('telegram pedido', e && e.message); }
  }
}

export async function handleTelegram(request, env, parsed) {
  if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_SECRET) return;
  if (!sameKey(request.headers.get('X-Telegram-Bot-Api-Secret-Token'), env.TELEGRAM_SECRET)) { console.warn('telegram: secret inválido'); return; }
  const update = parsed !== undefined ? parsed : await request.json().catch(() => null);
  const msg = update && (update.message || update.edited_message);
  console.log('telegram update', JSON.stringify({ chat: msg && msg.chat && { id: msg.chat.id, type: msg.chat.type }, hasText: !!(msg && msg.text), keys: update ? Object.keys(update) : [] }));
  if (!msg || !msg.chat || typeof msg.text !== 'string') return;
  const chatId = msg.chat.id;
  const thread = msg.is_topic_message ? msg.message_thread_id : undefined;
  const say = text => tgSend(env, chatId, text, thread);
  // tira "@nomedobot" dos comandos usados em grupo
  const text = msg.text.trim().replace(/^(\/\w+)@\w+/, '$1');
  const isCommand = /^\/\w+/.test(text);
  const allowed = String(env.TELEGRAM_CHAT_IDS || '').split(',').map(x => x.trim()).filter(Boolean);
  if (!allowed.includes(String(chatId))) {
    // fora do grupo liberado: só responde a comandos, dizendo o ID para liberar
    if (isCommand) await say(`Este bot é privado.\nO ID desta conversa é <code>${h(chatId)}</code>. Para liberar, ele precisa entrar na lista TELEGRAM_CHAT_IDS do Worker.`);
    return;
  }
  if (/^\/(start|help|ajuda)\b/i.test(text)) return say(TG_HELP);
  if (/^\/cupons\b/i.test(text)) return say(env.ORDERS ? await couponReport(env) : '⚠️ KV ORDERS não ligado.');
  if (/^\/cupom\b/i.test(text)) return say(env.ORDERS ? await couponCommand(env, text.replace(/^\/cupom\b/i, '')) : '⚠️ KV ORDERS não ligado.');
  if (/^\/pedidoteste\b/i.test(text)) {
    if (!env.ORDERS) return say('⚠️ O armazenamento (KV ORDERS) não está ligado no Worker.');
    const t = parseTrackingMessage(text.replace(/^\/pedidoteste\b/i, ''));
    const cpf = t.cpf || '11144477735';
    const name = (t.name || 'Cliente Teste').slice(0, 60);
    const id = await createTestOrder(env, cpf, name);
    const site = (env.SITE_URL || 'https://buyclub.us').replace(/\/+$/, '');
    const cpfFmt = cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    const test = { orderId: id, recipient: name, city: 'São Paulo/SP', items: 'Produto de teste x1', shippingLabel: 'Correios PAC (teste)', cpf: cpfFmt,
      receipt: { id: 'TESTE', method: 'Pix', at: new Date().toISOString(), amount: 0, net: 0, payer: name } };
    await postOrderWithReceipt(env, chatId, test, true, thread);
    return say(`No site: ${h(site)}/?pedido=${h(id)} (CPF ${h(cpfFmt)}). Some em 7 dias.`);
  }
  // resposta a um cartão de pedido do bot: basta o código (o número do pedido vem da mensagem respondida)
  const replied = msg.reply_to_message;
  const replyOrder = !isCommand && replied && replied.from && replied.from.is_bot && String(replied.text || replied.caption || '').match(/\bBC[A-Z0-9]{6,22}\b/);
  // no grupo, conversa normal é ignorada: o bot só age em /rastreio, /apagar, numa resposta a um pedido ou numa mensagem que tenha código + CPF/pedido
  const cmd = replyOrder ? ['', 'rastreio'] : text.match(/^\/(rastreio|apagar|remover)\b\s*/i);
  if (isCommand && !cmd) return;
  const body = replyOrder ? `${replyOrder[0]} ${text}` : cmd ? text.slice(cmd[0].length) : text;
  if (!cmd) { const q = parseTrackingMessage(body); if (!(q.code && (q.cpf || q.orderId))) return; }
  if (!env.ORDERS) return say('⚠️ O armazenamento (KV ORDERS) não está ligado no Worker. Sem ele não dá para salvar o rastreio.');

  if (cmd && /^(apagar|remover)$/i.test(cmd[1])) {
    const del = body.match(/\bBC[A-Z0-9]{6,22}\b/i);
    if (!del) return say('Mande o número do pedido: <code>/apagar BC…</code>');
    await env.ORDERS.delete(`envio:${del[0].toUpperCase()}`);
    return say(`🗑️ Rastreio do pedido <b>${h(del[0].toUpperCase())}</b> apagado.`);
  }

  const p = parseTrackingMessage(body);
  if (replyOrder) p.name = ''; // na resposta, o pedido já está identificado; palavras soltas não são nome
  if (!p.code || p.code.length < 8) return say('❌ Não achei o código de rastreio na mensagem.\n\n' + TG_HELP);
  if (!p.orderId && !p.cpf) return say('❌ Mande também o CPF do cliente (ou o número do pedido BC…).');

  let orderId = p.orderId;
  if (!orderId) {
    const list = JSON.parse(await env.ORDERS.get(`cpfpedidos:${p.cpf}`) || '[]');
    if (!list.length) return say(`❌ Não achei pedido pago com o CPF ${h(p.cpf)}. Mande junto o número do pedido (BC…).`);
    if (list.length > 1) {
      const recent = await Promise.all(list.slice(0, 5).map(async id => [id, await env.ORDERS.get(`envio:${id}`)]));
      const open = recent.filter(([, t]) => !t).map(([id]) => id);
      if (open.length !== 1) return say(`⚠️ Esse CPF tem ${list.length} pedidos: ${list.slice(0, 5).map(h).join(', ')}.\nMande de novo com o número do pedido.`);
      orderId = open[0];
    } else orderId = list[0];
  }

  const pay = await getOrder(env, orderId);
  if (!pay) return say(`❌ Pedido <b>${h(orderId)}</b> não encontrado no Mercado Pago.`);
  const m = pay.metadata || {};
  if (p.cpf && paymentCpf(pay) !== p.cpf) return say(`❌ O CPF não confere com o pedido <b>${h(orderId)}</b>.`);
  const want = normName(p.name), have = normName(m.recipient);
  if (want.length && have.length && !want.every(w => have.includes(w))) {
    return say(`❌ O nome não confere. O pedido <b>${h(orderId)}</b> está em nome de <b>${h(m.recipient)}</b>. Nada foi salvo.`);
  }
  if (pay.status !== 'approved') return say(`⚠️ O pagamento do pedido <b>${h(orderId)}</b> está "${h(pay.status)}", não aprovado. Nada foi salvo.`);

  const carrier = detectCarrier(p.code, p.carrier);
  const info = { code: p.code, carrier, name: CARRIERS[carrier].name, url: CARRIERS[carrier].url(p.code), at: new Date().toISOString() };
  await env.ORDERS.put(`envio:${orderId}`, JSON.stringify(info), { expirationTtl: 60 * 60 * 24 * 365 });
  if (!/^BCTESTE/.test(orderId)) await scheduleRebuy(env, orderId, m).catch(e => console.error('recompra put', e && e.message));
  const refCode = await env.ORDERS.get(`indicacao:${digits(m.cpf)}`).catch(() => null);

  const site = (env.SITE_URL || 'https://buyclub.us').replace(/\/+$/, '');
  const phone = digits(m.phone);
  const waPhone = phone.length === 10 || phone.length === 11 ? '55' + phone : phone;
  const firstName = String(m.recipient || '').split(/\s+/)[0] || '';
  const waText = [
    `Olá, ${firstName}! Seu pedido ${orderId} da Buy Club foi enviado pela ${info.name}.`,
    `*Código de rastreio*\n${info.code}`,
    info.url ? `*Acompanhe a entrega*\n${info.url}` : '',
    `*Seu pedido no site*\n${site}/?pedido=${orderId}`,
    refCode ? `*Indique e ganhe*\nSeus amigos ganham ${REFERRAL_PCT}% na primeira compra com o seu cupom ${refCode}, e você ganha ${REFERRAL_PCT}% na próxima compra a cada amigo que comprar.\n${site}/?cupom=${refCode}` : ''
  ].filter(Boolean).join('\n\n');
  return say([
    `✅ Rastreio salvo no pedido <b>${h(orderId)}</b>`,
    `Cliente: ${h(m.recipient || '')}${m.city ? ` · ${h(m.city)}` : ''}`,
    `${h(info.name)}: <code>${h(info.code)}</code>`,
    info.url ? `Link: ${h(info.url)}` : null,
    '',
    waPhone.length >= 12 ? `📲 <a href="https://wa.me/${waPhone}?text=${encodeURIComponent(waText)}">Avisar o cliente no WhatsApp</a>` : null
  ].filter(x => x !== null).join('\n'));
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
    shippingLabel: m.shipping_label || '',
    coupon: m.coupon || '',
    discount: m.discount || '',
    receipt: paymentReceipt(payment)
  };

  if (env.ORDERS) {
    await env.ORDERS.put(key, JSON.stringify(order), { expirationTtl: 60 * 60 * 24 * 365 });
    if (digits(order.phone).length >= 10) await env.ORDERS.delete(`aberto:${digits(order.phone)}`);
    // marca o CPF como cliente (cupons de primeira compra deixam de valer para ele)
    const cpfDigits = digits(order.cpf);
    if (cpfDigits.length === 11) {
      await env.ORDERS.put(`cliente:${cpfDigits}`, String(order.orderId || payment.id));
      // pedidos pagos por CPF (o mais recente primeiro), para o admin achar o pedido só pelo CPF
      if (order.orderId) {
        const list = JSON.parse(await env.ORDERS.get(`cpfpedidos:${cpfDigits}`) || '[]').filter(id => id !== order.orderId);
        list.unshift(order.orderId);
        await env.ORDERS.put(`cpfpedidos:${cpfDigits}`, JSON.stringify(list.slice(0, 20)));
      }
    }
  }
  if (env.ORDERS) {
    try { order.referral = await afterPaidGrowth(env, order); } catch (e) { console.error('growth', e && e.stack || e); }
  }
  await notifyWhatsApp(env, order);
  await notifyTelegramOrder(env, order);
}

/* ------------------------------------------------------------------ */
/* Indique e ganhe, cupons de influenciador e recompra                  */
/* ------------------------------------------------------------------ */

const REFERRAL_PCT = 10;        // desconto do amigo (primeira compra) e prêmio de quem indicou
const REBUY_DAYS = 25;          // lembrete de recompra depois do envio
const randCode = n => Array.from(crypto.getRandomValues(new Uint8Array(n)), b => 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[b % 32]).join('');
const nameCode = name => String(name || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase().replace(/[^A-Z]/g, ' ').trim().split(/\s+/)[0].slice(0, 8) || 'AMIGO';

// Cupom de indicação do cliente (cria na primeira compra paga)
export async function referralCodeFor(env, cpf, name, phone) {
  if (!env.ORDERS || String(cpf || '').length !== 11) return '';
  const have = await env.ORDERS.get(`indicacao:${cpf}`);
  if (have) return have;
  let code = '';
  for (let i = 0; i < 5 && !code; i++) {
    const c = nameCode(name) + randCode(3);
    if (!(await env.ORDERS.get(`cupom:${c}`))) code = c;
  }
  if (!code) return '';
  await env.ORDERS.put(`cupom:${code}`, JSON.stringify({ pct: REFERRAL_PCT, first: true, kind: 'indicacao', label: `Indicação de ${String(name || '').split(/\s+/)[0]}`, owner: cpf, ownerName: name || '', ownerPhone: digits(phone) }));
  await env.ORDERS.put(`indicacao:${cpf}`, code);
  return code;
}

async function bumpCouponStats(env, code, amount) {
  const key = `stats:cupom:${code}`;
  const st = JSON.parse(await env.ORDERS.get(key) || '{"orders":0,"total":0}');
  st.orders += 1; st.total = round2(st.total + (Number(amount) || 0)); st.last = new Date().toISOString();
  await env.ORDERS.put(key, JSON.stringify(st));
}

// Roda quando um pagamento é aprovado. Devolve o cupom de indicação do comprador.
async function afterPaidGrowth(env, order) {
  const cpf = digits(order.cpf);
  const code = couponCode(order.coupon);
  if (code) {
    await bumpCouponStats(env, code, order.amount);
    const rule = JSON.parse(await env.ORDERS.get(`cupom:${code}`) || 'null');
    if (rule && rule.kind === 'premio' && rule.uses > 0) {
      rule.uses -= 1;
      await env.ORDERS.put(`cupom:${code}`, JSON.stringify(rule));
    }
    if (rule && rule.kind === 'indicacao' && rule.owner && rule.owner !== cpf) {
      // quem indicou ganha um cupom de uso único
      const prize = 'PREMIO' + randCode(5);
      const until = new Date(Date.now() + 90 * 86400000).toISOString().slice(0, 10);
      await env.ORDERS.put(`cupom:${prize}`, JSON.stringify({ pct: REFERRAL_PCT, uses: 1, kind: 'premio', owner: rule.owner, ownerName: rule.ownerName, until, label: 'Prêmio por indicação' }));
      const prizes = JSON.parse(await env.ORDERS.get(`premios:${rule.owner}`) || '[]');
      prizes.unshift({ code: prize, until });
      await env.ORDERS.put(`premios:${rule.owner}`, JSON.stringify(prizes.slice(0, 30)));
      const first = String(rule.ownerName || '').split(/\s+/)[0];
      const p = rule.ownerPhone || '';
      const waPhone = p.length === 10 || p.length === 11 ? '55' + p : p;
      const waText = `Olá, ${first}! Uma pessoa que você indicou acabou de comprar na Buy Club. Como agradecimento, você ganhou ${REFERRAL_PCT}% de desconto na próxima compra com o cupom ${prize} (válido até ${until.split('-').reverse().join('/')}).`;
      for (const chat of tgChats(env)) {
        await tgPost(env, chat, 'cupons', [
          `🎁 <b>Indicação</b>: ${h(order.recipient)} comprou com o cupom <code>${h(code)}</code> de ${h(rule.ownerName)}.`,
          `${h(first)} ganhou o cupom <code>${h(prize)}</code> (${REFERRAL_PCT}% em uma compra, até ${h(until.split('-').reverse().join('/'))}).`,
          waPhone.length >= 12 ? `📲 <a href="https://wa.me/${waPhone}?text=${encodeURIComponent(waText)}">Avisar ${h(first)} no WhatsApp</a>` : null
        ].filter(Boolean).join('\n')).catch(() => {});
      }
    }
  }
  return referralCodeFor(env, cpf, order.recipient, order.phone);
}

// Para a página "Meu pedido": cupom do cliente, quantos amigos compraram e prêmios ainda disponíveis
async function referralInfo(env, cpf) {
  if (!env.ORDERS || !cpf) return { referral: '', referralCount: 0, prizes: [] };
  const referral = (await env.ORDERS.get(`indicacao:${cpf}`)) || '';
  if (!referral) return { referral: '', referralCount: 0, prizes: [] };
  const st = JSON.parse(await env.ORDERS.get(`stats:cupom:${referral}`) || 'null');
  const today = new Date().toISOString().slice(0, 10);
  const prizes = [];
  for (const pz of JSON.parse(await env.ORDERS.get(`premios:${cpf}`) || '[]').slice(0, 10)) {
    const rule = JSON.parse(await env.ORDERS.get(`cupom:${pz.code}`) || 'null');
    if (rule && rule.uses > 0 && (!rule.until || rule.until >= today)) prizes.push({ code: pz.code, until: rule.until });
  }
  return { referral, referralCount: st ? st.orders : 0, prizes };
}

// Lembrete de recompra: agendado quando o rastreio é salvo
async function scheduleRebuy(env, orderId, m) {
  const phone = digits(m.phone);
  if (!env.ORDERS || phone.length < 10) return;
  await env.ORDERS.put(`recompra:${orderId}`, JSON.stringify({ orderId, due: Date.now() + REBUY_DAYS * 86400000, name: m.recipient || '', phone, items: m.items || '' }), { expirationTtl: 60 * 60 * 24 * (REBUY_DAYS + 15) });
}

export function rebuyCard(r) {
  const first = String(r.name || '').split(/\s+/)[0];
  const waPhone = r.phone.length === 10 || r.phone.length === 11 ? '55' + r.phone : r.phone;
  const items = String(r.items || '').split(' | ').filter(Boolean).map(i => i.replace(/\s+[—–-]\s+/g, ' '));
  const waText = `Olá, ${first}! Já faz quase um mês do seu pedido na Buy Club. Quer que eu separe a sua reposição?`;
  return [
    `🔁 <b>Hora da recompra</b> (${REBUY_DAYS} dias do envio)`,
    `${h(r.name)} · pedido <code>${h(r.orderId)}</code>`,
    ...items.map(i => `• ${h(i)}`),
    waPhone.length >= 12 ? `📲 <a href="https://wa.me/${waPhone}?text=${encodeURIComponent(waText)}">Chamar no WhatsApp</a>` : null
  ].filter(Boolean).join('\n');
}

export async function checkRebuy(env) {
  if (!env.ORDERS || !env.TELEGRAM_BOT_TOKEN) return;
  const list = await env.ORDERS.list({ prefix: 'recompra:' });
  for (const k of list.keys) {
    const r = JSON.parse(await env.ORDERS.get(k.name) || 'null');
    if (!r) continue;
    if (Date.now() < r.due) continue;
    await env.ORDERS.delete(k.name);
    for (const chat of tgChats(env)) await tgPost(env, chat, 'recompra', rebuyCard(r)).catch(() => {});
  }
}

// /cupons: relatório de vendas por cupom
async function couponReport(env) {
  const list = await env.ORDERS.list({ prefix: 'stats:cupom:' });
  const rows = [];
  for (const k of list.keys) {
    const code = k.name.slice('stats:cupom:'.length);
    const st = JSON.parse(await env.ORDERS.get(k.name) || 'null');
    if (!st) continue;
    const rule = await getCouponRule(env, code) || {};
    rows.push({ code, kind: rule.kind || 'fixo', ...st });
  }
  const inf = await env.ORDERS.list({ prefix: 'cupom:' });
  const known = new Set(rows.map(r => r.code));
  for (const k of inf.keys) {
    const code = k.name.slice('cupom:'.length);
    if (known.has(code)) continue;
    const rule = JSON.parse(await env.ORDERS.get(k.name) || 'null');
    if (rule && rule.kind === 'influencer') rows.push({ code, kind: 'influencer', orders: 0, total: 0 });
  }
  if (!rows.length) return '📊 Nenhuma venda com cupom ainda.\n\nCrie um cupom de influenciador com <code>/cupom NOME 10</code>.';
  rows.sort((a, b) => b.total - a.total);
  const tag = { influencer: 'influenciador', indicacao: 'indicação', premio: 'prêmio', fixo: 'fixo' };
  return ['📊 <b>Vendas por cupom</b>', ''].concat(rows.slice(0, 40).map(r => `<code>${h(r.code)}</code> (${tag[r.kind] || h(r.kind)}): ${r.orders} ${r.orders === 1 ? 'venda' : 'vendas'} · R$ ${h(brl(r.total))}`)).join('\n');
}

// /cupom NOME 10 [primeira]  |  /cupom NOME apagar
async function couponCommand(env, args) {
  const parts = String(args || '').trim().split(/\s+/).filter(Boolean);
  const code = couponCode(parts[0]);
  if (!code || code.length < 3) return 'Use assim: <code>/cupom NOME 10</code> (10% de desconto). Para valer só na primeira compra: <code>/cupom NOME 10 primeira</code>. Para apagar: <code>/cupom NOME apagar</code>.';
  if (/^(apagar|remover|excluir)$/i.test(parts[1] || '')) {
    const rule = JSON.parse(await env.ORDERS.get(`cupom:${code}`) || 'null');
    if (!rule || rule.kind !== 'influencer') return `❌ Não achei o cupom de influenciador <code>${h(code)}</code>.`;
    await env.ORDERS.delete(`cupom:${code}`);
    return `🗑️ Cupom <code>${h(code)}</code> apagado. As vendas dele continuam no /cupons.`;
  }
  const pct = Number(String(parts[1] || '').replace(/[%,]/g, '.').replace(/\.$/, ''));
  if (!(pct > 0 && pct <= 50)) return '❌ Diga a porcentagem de 1 a 50. Exemplo: <code>/cupom NOME 10</code>';
  const existing = JSON.parse(await env.ORDERS.get(`cupom:${code}`) || 'null');
  if ((existing && existing.kind !== 'influencer') || DEFAULT_COUPONS[code]) return `❌ O código <code>${h(code)}</code> já está em uso. Escolha outro.`;
  const first = /primeira/i.test(parts.slice(2).join(' '));
  await env.ORDERS.put(`cupom:${code}`, JSON.stringify({ pct, first, kind: 'influencer', label: `Cupom ${code}` }));
  const site = (env.SITE_URL || 'https://buyclub.us').replace(/\/+$/, '');
  return [`✅ Cupom <code>${h(code)}</code> criado: ${pct}% de desconto${first ? ' na primeira compra' : ''}.`, '', `Link para o influenciador divulgar (o cupom já entra aplicado):`, `${h(site)}/?cupom=${h(code)}`, '', 'Acompanhe as vendas com /cupons.'].join('\n');
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

// Sem emojis e sem hífens; números (pedido, CPF, CEP, telefone) sozinhos na linha para copiar fácil
export function buildOrderMessage(o) {
  const num = v => String(v || '').replace(/\D/g, '');
  const field = (label, value) => value ? `*${label}*\n${value}` : '';
  const street = [o.address, o.number ? `nº ${o.number}` : ''].filter(Boolean).join(', ');
  const place = [o.neighborhood, o.city].filter(Boolean).join(', ');
  const items = String(o.items || '').split(' | ').filter(Boolean).map(i => i.replace(/\s+[—–-]\s+/g, ' '));
  return [
    `*PAGAMENTO APROVADO*\nR$ ${brl(o.amount)} no ${o.method}`,
    field('Pedido', o.orderId),
    items.length ? `*ITENS*\n${items.join('\n')}` : '',
    [
      '*VALORES*',
      o.subtotal ? `Produtos: R$ ${brl(o.subtotal)}` : null,
      o.subtotal ? `Frete: R$ ${brl(o.shipping || 0)}` : null,
      o.coupon && Number(o.discount) > 0 ? `Cupom ${o.coupon}: R$ ${brl(o.discount)} de desconto` : null,
      `Total pago: R$ ${brl(o.amount)}`,
      o.shippingLabel ? `Envio: ${String(o.shippingLabel).replace(/\s+[—–-]\s+/g, ', ')}` : null
    ].filter(Boolean).join('\n'),
    '*ENVIAR PARA*',
    field('Nome', o.recipient),
    field('CPF', num(o.cpf)),
    field('CEP', num(o.cep)),
    field('Endereço', [street, o.complement, place].filter(Boolean).join('\n')),
    field('WhatsApp', num(o.phone)),
    field('Email', o.email),
    field('ID Mercado Pago', o.paymentId)
  ].filter(Boolean).join('\n\n');
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
function sameKey(a, b) {
  const x = new TextEncoder().encode(String(a || '')), y = new TextEncoder().encode(String(b || ''));
  if (!x.length || x.length !== y.length) return false;
  let diff = 0;
  for (let i = 0; i < x.length; i++) diff |= x[i] ^ y[i];
  return diff === 0;
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
