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
        if (ctx && ctx.waitUntil) ctx.waitUntil(handleTelegram(request, env).catch(e => console.error('telegram', e && e.stack || e)));
        else await handleTelegram(request, env);
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
  return { orderId, total, discount, coupon: coupon ? coupon.code : null, url: data.init_point };
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

async function evaluateCoupon(env, rawCode, cpf, subtotal, now = new Date()) {
  const code = String(rawCode || '').trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '').slice(0, 30);
  if (!code) throw new UserError('Digite o cupom.');
  const rule = couponTable(env)[code];
  if (!rule || rule.active === false) throw new UserError('Cupom inválido ou expirado.');
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

async function lookupOrder(request, env) {
  if (!env.MP_ACCESS_TOKEN) throw new Error('MP_ACCESS_TOKEN não configurado');
  const body = await request.json().catch(() => null) || {};
  const orderId = String(body.pedido || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 24);
  const cpf = digits(body.cpf).slice(0, 11);
  if (orderId.length < 6) throw new UserError('Digite o número do pedido (começa com BC).');
  if (!isValidCpf(cpf)) throw new UserError('Digite o CPF usado na compra.');

  const p = await mpOrder(env, orderId);
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
    tracking: env.ORDERS ? JSON.parse(await env.ORDERS.get(`envio:${orderId}`) || 'null') : null
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

async function tgSend(env, chatId, text) {
  const res = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML', disable_web_page_preview: true })
  });
  if (!res.ok) console.error('telegram sendMessage', res.status, await res.text());
}
const h = s => String(s == null ? '' : s).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));

const TG_HELP = [
  '📦 <b>Bot de rastreio Buy Club</b>',
  '',
  'Mande numa mensagem só: <b>/rastreio</b> + código de rastreio, CPF e nome do cliente. Exemplo:',
  '<code>/rastreio AB123456789BR 529.982.247-25 Ana Silva</code>',
  '',
  'O código aparece na hora na página "Meu pedido" do cliente, com o link da transportadora.',
  '• Se o cliente tiver mais de um pedido, mande também o número (BC…).',
  '• A transportadora é reconhecida pelo código. Para escolher, escreva correios, jadlog ou loggi.',
  '• Para apagar um rastreio: <code>/apagar BC…</code>'
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

export async function handleTelegram(request, env) {
  if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_SECRET) return;
  if (!sameKey(request.headers.get('X-Telegram-Bot-Api-Secret-Token'), env.TELEGRAM_SECRET)) { console.warn('telegram: secret inválido'); return; }
  const update = await request.json().catch(() => null);
  const msg = update && (update.message || update.edited_message);
  if (!msg || !msg.chat || typeof msg.text !== 'string') return;
  const chatId = msg.chat.id;
  // tira "@nomedobot" dos comandos usados em grupo
  const text = msg.text.trim().replace(/^(\/\w+)@\w+/, '$1');
  const isCommand = /^\/\w+/.test(text);
  const allowed = String(env.TELEGRAM_CHAT_IDS || '').split(',').map(x => x.trim()).filter(Boolean);
  if (!allowed.includes(String(chatId))) {
    // fora do grupo liberado: só responde a comandos, dizendo o ID para liberar
    if (isCommand) await tgSend(env, chatId, `Este bot é privado.\nO ID desta conversa é <code>${h(chatId)}</code>. Para liberar, ele precisa entrar na lista TELEGRAM_CHAT_IDS do Worker.`);
    return;
  }
  if (/^\/(start|help|ajuda)\b/i.test(text)) return tgSend(env, chatId, TG_HELP);
  // no grupo, conversa normal é ignorada: o bot só age em /rastreio, /apagar ou numa mensagem que tenha código + CPF/pedido
  const cmd = text.match(/^\/(rastreio|apagar|remover)\b\s*/i);
  if (isCommand && !cmd) return;
  const body = cmd ? text.slice(cmd[0].length) : text;
  if (!cmd) { const q = parseTrackingMessage(body); if (!(q.code && (q.cpf || q.orderId))) return; }
  if (!env.ORDERS) return tgSend(env, chatId, '⚠️ O armazenamento (KV ORDERS) não está ligado no Worker. Sem ele não dá para salvar o rastreio.');

  if (cmd && /^(apagar|remover)$/i.test(cmd[1])) {
    const del = body.match(/\bBC[A-Z0-9]{6,22}\b/i);
    if (!del) return tgSend(env, chatId, 'Mande o número do pedido: <code>/apagar BC…</code>');
    await env.ORDERS.delete(`envio:${del[0].toUpperCase()}`);
    return tgSend(env, chatId, `🗑️ Rastreio do pedido <b>${h(del[0].toUpperCase())}</b> apagado.`);
  }

  const p = parseTrackingMessage(body);
  if (!p.code || p.code.length < 8) return tgSend(env, chatId, '❌ Não achei o código de rastreio na mensagem.\n\n' + TG_HELP);
  if (!p.orderId && !p.cpf) return tgSend(env, chatId, '❌ Mande também o CPF do cliente (ou o número do pedido BC…).');

  let orderId = p.orderId;
  if (!orderId) {
    const list = JSON.parse(await env.ORDERS.get(`cpfpedidos:${p.cpf}`) || '[]');
    if (!list.length) return tgSend(env, chatId, `❌ Não achei pedido pago com o CPF ${h(p.cpf)}. Mande junto o número do pedido (BC…).`);
    if (list.length > 1) {
      const recent = await Promise.all(list.slice(0, 5).map(async id => [id, await env.ORDERS.get(`envio:${id}`)]));
      const open = recent.filter(([, t]) => !t).map(([id]) => id);
      if (open.length !== 1) return tgSend(env, chatId, `⚠️ Esse CPF tem ${list.length} pedidos: ${list.slice(0, 5).map(h).join(', ')}.\nMande de novo com o número do pedido.`);
      orderId = open[0];
    } else orderId = list[0];
  }

  const pay = await mpOrder(env, orderId);
  if (!pay) return tgSend(env, chatId, `❌ Pedido <b>${h(orderId)}</b> não encontrado no Mercado Pago.`);
  const m = pay.metadata || {};
  if (p.cpf && paymentCpf(pay) !== p.cpf) return tgSend(env, chatId, `❌ O CPF não confere com o pedido <b>${h(orderId)}</b>.`);
  const want = normName(p.name), have = normName(m.recipient);
  if (want.length && have.length && !want.every(w => have.includes(w))) {
    return tgSend(env, chatId, `❌ O nome não confere. O pedido <b>${h(orderId)}</b> está em nome de <b>${h(m.recipient)}</b>. Nada foi salvo.`);
  }
  if (pay.status !== 'approved') return tgSend(env, chatId, `⚠️ O pagamento do pedido <b>${h(orderId)}</b> está "${h(pay.status)}", não aprovado. Nada foi salvo.`);

  const carrier = detectCarrier(p.code, p.carrier);
  const info = { code: p.code, carrier, name: CARRIERS[carrier].name, url: CARRIERS[carrier].url(p.code), at: new Date().toISOString() };
  await env.ORDERS.put(`envio:${orderId}`, JSON.stringify(info), { expirationTtl: 60 * 60 * 24 * 365 });

  const site = (env.SITE_URL || 'https://buyclub.us').replace(/\/+$/, '');
  const phone = digits(m.phone);
  const waPhone = phone.length === 10 || phone.length === 11 ? '55' + phone : phone;
  const firstName = String(m.recipient || '').split(/\s+/)[0] || '';
  const waText = `Olá, ${firstName}! Seu pedido ${orderId} da Buy Club foi enviado (${info.name}).\nCódigo de rastreio: ${info.code}\nAcompanhe: ${info.url}\n\nVocê também vê tudo em ${site}/?pedido=${orderId}`;
  return tgSend(env, chatId, [
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
    discount: m.discount || ''
  };

  if (env.ORDERS) {
    await env.ORDERS.put(key, JSON.stringify(order), { expirationTtl: 60 * 60 * 24 * 365 });
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
    o.coupon && Number(o.discount) > 0 ? `Cupom: ${o.coupon} (− R$ ${brl(o.discount)})` : null,
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
