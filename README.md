# Lamparina Hub — site institucional

HTML/CSS/JS estático, 5 páginas. Sem build obrigatório.

- `index.html`, `o-que-fazemos.html`, `quem-somos.html`, `resultados.html`, `contato.html` — páginas geradas
- `assets/css/style.css` — tokens e componentes
- `assets/js/main.js` — intro do logo, transições, animações, simulador Efeito Represa, filtro, formulário
- `src/build.py` + `src/pages/*.html` — fonte das páginas (nav e rodapé compartilhados). Edite em `src/pages` e rode `python3 src/build.py`.

Bibliotecas via CDN: GSAP 3.12.5 + ScrollTrigger (cdnjs), Lenis 1.1.13 (jsDelivr). Fontes: Host Grotesk, Inter, Geist Mono (Google Fonts).

## Pendências (procure por `TODO` / `data-todo`)
- Função de cada pessoa do time (Quem Somos)
- Link da Política de Privacidade
- Cases da página Resultados: preencher o array `CASES` em `assets/js/main.js` (o filtro por camada já funciona)

## Formulário de contato (PHP + Brevo)

O formulário da página Contato envia para `api/contato.php`, que manda o e-mail pela API transacional do Brevo.

1. No servidor, copie `.env.example` para `.env` e preencha `BREVO_API_KEY` (os outros campos já vêm preenchidos).
   - De preferência deixe o `.env` **um nível acima da pasta pública** do site. O script procura lá primeiro e depois na raiz do site.
   - Se ficar na raiz do site, o `.htaccess` já bloqueia o acesso (Apache). No Nginx, adicione: `location ~ /\.env { deny all; }`
2. O remetente (`MAIL_FROM_EMAIL`) precisa estar verificado no Brevo — `noreply@lamparinahub.com` já está.
3. Requisitos: PHP 8.0+ com a extensão cURL.
4. Opcional: preencha `ALLOWED_ORIGINS` com o domínio do site para aceitar envios só dele.

Proteções incluídas: validação no servidor, campo invisível anti-robô (honeypot) e limite de 5 envios a cada 10 minutos por IP.

## Publicação em www.lamparinahub.com

- Suba todos os arquivos para a pasta pública do domínio (ex.: `public_html`). A pasta `src/` é só pra gerar as páginas e fica bloqueada pelo `.htaccess`.
- O `.htaccess` (Apache/cPanel) já força HTTPS, redireciona `lamparinahub.com` → `www.lamparinahub.com` mantendo o caminho (ex.: `/raiox/`), ativa compressão e cache e bloqueia arquivos ocultos.
- **Instale o SSL antes** (AutoSSL/Let's Encrypt no cPanel). Sem certificado, o redirecionamento pra HTTPS derruba o site.
- Se a landing `/raiox/` estiver no mesmo servidor, mantenha a pasta dela; o site novo não mexe nela.
- Depois de publicar: cadastre `https://www.lamparinahub.com/sitemap.xml` no Google Search Console.
- Se o domínio mudar, troque `SITE` em `src/build.py`, rode `python3 src/build.py` e ajuste o `.htaccess` e o `ALLOWED_ORIGINS` do `.env`.
