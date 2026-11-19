# Mercado Pago no checkout (Pix + cartão)

Como funciona:

1. O cliente monta o carrinho, preenche nome, WhatsApp e endereço e escolhe **Pix** ou **Cartão**.
2. O site manda o carrinho para o *Worker* (um pequeno servidor gratuito na Cloudflare).
3. O Worker **recalcula o total com os preços do `index.html`** (o cliente não consegue alterar o valor), cria o pedido no Mercado Pago e devolve o link de pagamento.
4. O cliente paga no Mercado Pago (Pix ou cartão em até 12x) e volta para o site com a mensagem "Pagamento aprovado".
5. Quando o pagamento é aprovado, o Mercado Pago avisa o Worker, e o Worker manda para o seu **Telegram** o nome, WhatsApp, CPF, endereço completo e os itens do pedido.

USDT e Criptomoeda continuam indo para o WhatsApp como antes.

> Enquanto `MP_API_URL` estiver vazio no `index.html`, **nada muda no site**: Pix e Cartão continuam indo para o WhatsApp.

---

## Passo 1 — Pegar o Access Token do Mercado Pago

1. Entre em <https://www.mercadopago.com.br/developers/panel/app> com a conta que vai receber.
2. **Criar aplicação** → tipo de pagamento online → produto **Checkout Pro**.
3. Abra a aplicação → **Credenciais de produção** → copie o **Access Token** (começa com `APP_USR-`).
   Não coloque esse token no `index.html` nem mande para ninguém.

## Passo 2 — Criar o Worker na Cloudflare (grátis)

1. Crie uma conta em <https://dash.cloudflare.com> (se ainda não tiver).
2. Menu **Workers & Pages** → **Create** → **Create Worker** → nome `buyclub-pagamentos` → **Deploy**.
3. Clique em **Edit code**, apague tudo e cole o conteúdo do arquivo [`worker.js`](worker.js). Clique em **Deploy**.
4. Volte ao Worker → **Settings** → **Variables and Secrets** → adicione:

   | Nome | Tipo | Valor |
   |---|---|---|
   | `MP_ACCESS_TOKEN` | Secret | o token do passo 1 |
   | `SITE_URL` | Text | `https://buyclub.us` |

5. Copie o endereço do Worker (algo como `https://buyclub-pagamentos.SEU-USUARIO.workers.dev`). Abrindo esse endereço no navegador deve aparecer `ok`.

## Passo 3 — Receber os pedidos pagos no Telegram

1. No Telegram, fale com **@BotFather** → `/newbot` → escolha um nome → ele te dá um **token** do bot.
2. Abra o seu bot e mande qualquer mensagem (ex.: "oi").
3. No navegador, abra `https://api.telegram.org/botSEU_TOKEN/getUpdates` e procure `"chat":{"id": 123456789` — esse número é o seu **chat id**.
4. No Worker, adicione mais duas variáveis:

   | Nome | Tipo | Valor |
   |---|---|---|
   | `TELEGRAM_BOT_TOKEN` | Secret | token do BotFather |
   | `TELEGRAM_CHAT_ID` | Text | o número do chat id |

Exemplo do aviso que chega:

```
✅ PAGAMENTO APROVADO — pedido BCMWMWO74DX6Y
Valor: R$ 2.444,00 (Pix)

📦 ENVIAR PARA
Nome: Ana Maria Souza
WhatsApp: (11) 99999-9999
Endereço: Praça da Sé, nº 10
Bairro: Sé
Cidade/UF: São Paulo / SP
CEP: 01001000

🛒 ITENS
• 2x New Life — Retatrutide 120mg (Varejo) R$ 897,00
• 1x LIPOLESS — Lipoless 15mg - 4 vials (Varejo) R$ 650,00
```

Os mesmos dados também ficam no painel do Mercado Pago, dentro de cada venda.

### Opcional — evitar aviso repetido

O Mercado Pago às vezes notifica o mesmo pagamento mais de uma vez. Para receber só um aviso por venda:
Cloudflare → **Storage & Databases** → **KV** → crie um namespace `buyclub-pedidos` → no Worker, **Settings** → **Bindings** → **Add** → KV namespace, nome da variável `ORDERS`.

## Passo 4 — Ligar o site ao Worker

No `index.html`, procure a linha:

```js
const MP_API_URL = '';
```

e coloque o endereço do Worker:

```js
const MP_API_URL = 'https://buyclub-pagamentos.SEU-USUARIO.workers.dev';
```

Suba o `index.html` no GitHub. Em cerca de 1 minuto o site já mostra o botão azul **Pagar com Mercado Pago** quando o cliente escolhe Pix ou Cartão.

## Passo 5 — Testar

Faça uma compra real pequena com Pix e confira se: você foi levado ao Mercado Pago, voltou ao site com "Pagamento aprovado" e recebeu o aviso no Telegram. Depois é só estornar pelo painel do Mercado Pago, se quiser.

---

## Observações

- **Preços**: o Worker lê os preços direto do `index.html` do GitHub (atualiza a cada ~5 minutos). Mudou o preço no site, mudou no pagamento. Produtos com valor "sob consulta" não podem ser pagos pelo Mercado Pago (o site pede para finalizar pelo WhatsApp).
- **Atacado**: o preço de 5 un / 10 un exige pelo menos 5 / 10 unidades daquele produto no carrinho.
- **Frete**: continua "a combinar" e não entra no valor cobrado.
- **Parcelamento**: até 12x; os juros das parcelas seguem a configuração da sua conta Mercado Pago.
