# Mercado Pago no checkout (Pix + cartão)

Como funciona:

1. O cliente monta o carrinho, preenche nome, WhatsApp e endereço e escolhe **Pix** ou **Cartão**.
2. O site manda o carrinho para o *Worker* (um pequeno servidor gratuito na Cloudflare).
3. O Worker **recalcula o total com os preços do `index.html` + frete fixo de R$ 50** (o cliente não consegue alterar o valor), cria o pedido no Mercado Pago e devolve o link de pagamento. No Mercado Pago aparece só "Pedido Buy Club" e o valor total, sem o nome dos produtos.
4. O cliente paga no Mercado Pago (Pix ou cartão em até 12x) e volta para o site com a mensagem "Pagamento aprovado".
5. Quando o pagamento é aprovado, o Mercado Pago avisa o Worker, e o Worker manda para o seu **WhatsApp** o nome, WhatsApp do cliente, CPF, endereço completo e os itens do pedido.

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

## Passo 3 — Receber os pedidos pagos no seu WhatsApp

O aviso chega no seu WhatsApp por meio do **CallMeBot**, um serviço gratuito que só manda mensagem para o número que autorizou.

1. Abra <https://www.callmebot.com/blog/free-api-whatsapp-messages/> e salve nos contatos o número do CallMeBot que aparece lá.
2. Pelo WhatsApp que vai receber os pedidos, mande para esse contato a mensagem: `I allow callmebot to send me messages`
3. Ele responde com a sua **apikey** (um número).
4. No Worker, adicione mais duas variáveis:

   | Nome | Tipo | Valor |
   |---|---|---|
   | `WHATSAPP_PHONE` | Text | seu WhatsApp com 55 + DDD, ex.: `5541987439214` |
   | `CALLMEBOT_APIKEY` | Secret | a apikey que o CallMeBot mandou |

Exemplo do aviso que chega:

```
✅ PAGAMENTO APROVADO — pedido BCMWMWVA9BGKN
Valor pago: R$ 2.494,00 (Pix)
Produtos: R$ 2.444,00 + frete R$ 50,00

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

Além disso, quando o cliente volta ao site depois de pagar, aparece o botão verde **Enviar pedido no WhatsApp**, que abre a conversa com você já com o pedido e os dados de entrega. Os mesmos dados também ficam guardados no pagamento dentro do Mercado Pago.

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

## Passo 4b — Frete por CEP com o Melhor Envio (opcional)

Sem isso, o frete continua fixo (`SHIPPING_FEE`). Com isso, o cliente digita o CEP no checkout e escolhe entre as opções (SEDEX, PAC etc.) com preço e prazo. O Worker recalcula o frete escolhido na hora de cobrar, então o valor não pode ser alterado no navegador.

1. No Melhor Envio: **Integrações** → **Permissões de acesso** → **Gerar novo token**, com a permissão `shipping-calculate`. Copie o token.
2. Cole o `worker.js` novo no Worker (**Edit code** → colar → **Deploy**).
3. No Worker, **Settings** → **Variables and Secrets**:

   | Nome | Tipo | Valor |
   |---|---|---|
   | `MELHOR_ENVIO_TOKEN` | Secret | o token do Melhor Envio |
   | `ME_FROM_CEP` | Text | CEP de onde as encomendas saem, ex.: `80000000` |
   | `ME_BOX_CM` | Text | (opcional) medidas da caixa em cm "altura,largura,comprimento"; padrão `4,12,17` |
   | `ME_BASE_WEIGHT_KG` | Text | peso da caixa vazia em kg, ex.: `0.2` |
   | `ME_ITEM_WEIGHT_KG` | Text | peso de cada unidade em kg, ex.: `0.05` |
   | `ME_SERVICES` | Text | (opcional) serviços mostrados; padrão `1,2,3,31` (Correios PAC e SEDEX, Jadlog .Package, Loggi Express), `todos` mostra tudo |
   | `ME_EXTRA_FEE` | Text | (opcional) valor somado a cada frete, ex.: `5` para embalagem |
   | `ME_CONTACT` | Text | (opcional) e-mail de contato técnico que o Melhor Envio pede |

O frete só liga quando `MELHOR_ENVIO_TOKEN` e `ME_FROM_CEP` estão preenchidos. Para voltar ao frete fixo, basta apagar o token.

## Passo 5 — Testar

Faça uma compra real pequena com Pix e confira se: você foi levado ao Mercado Pago, voltou ao site com "Pagamento aprovado" e recebeu o aviso no seu WhatsApp. Depois é só estornar pelo painel do Mercado Pago, se quiser.

---

## Observações

- **Preços**: o Worker lê os preços direto do `index.html` do GitHub (atualiza a cada ~5 minutos). Mudou o preço no site, mudou no pagamento. Produtos com valor "sob consulta" não podem ser pagos pelo Mercado Pago (o site pede para finalizar pelo WhatsApp).
- **Atacado**: o preço de 5 un / 10 un exige pelo menos 5 / 10 unidades daquele produto no carrinho.
- **Frete**: com o Melhor Envio ligado (passo 4b), é calculado pelo CEP. Sem ele, é fixo de R$ 50,00 para qualquer endereço, já somado no total. Para mudar, altere `SHIPPING_FEE` no `index.html` e crie a variável `SHIPPING_FEE` no Worker com o mesmo valor.
- **Parcelamento**: até 12x; os juros das parcelas seguem a configuração da sua conta Mercado Pago.

### Entrega expressa na capital de SP

Para CEPs do município de São Paulo (01000-000 a 05999-999 e 08000-000 a 08499-999), o Worker acrescenta a opção "Entrega expressa SP": até 3 horas após o pedido, rastreio pelo WhatsApp, valor fixo de R$ 50 (mude com a variável `SP_EXPRESS_FEE`). Ela vem selecionada por padrão; com frete grátis New Life, a opção grátis fica em primeiro.
