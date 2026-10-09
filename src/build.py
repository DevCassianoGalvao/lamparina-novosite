#!/usr/bin/env python3
"""Gera as 5 páginas do site a partir de layout + corpos em src/pages/*.html.
Uso: python3 src/build.py  (gera os .html na raiz do projeto)"""
import pathlib, re

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / "src" / "pages"

RAIOX = "https://lamparinahub.com/raiox/"  # landing (não usada nos botões)
FORM = "contato.html#contatoForm"  # destino de todos os botões
WHATS = "https://wa.me/5593984128030"
INSTA = "https://instagram.com/lamparina.hub/"

PAGES = [
    # arquivo, rótulo no menu, <title>, meta description
    ("index.html", "Home", "Lamparina Hub", "Estruturamos o comercial de empresas que já faturam bem, mas ainda dependem de sorte, indicação ou vendedor bom de improviso."),
    ("o-que-fazemos.html", "O Que Fazemos", "O Que Fazemos · Lamparina Hub", "Diagnóstico primeiro. Estrutura depois. Aquisição, Presença e Comercial."),
    ("quem-somos.html", "Quem Somos", "Quem Somos · Lamparina Hub", "A Lamparina nasceu no Norte do País. A gente vende o que já usou pra crescer."),
    ("resultados.html", "Resultados", "Resultados · Lamparina Hub", "Quem já destravou o comercial com a Lamparina."),
    ("contato.html", "Contato", "Contato · Lamparina Hub", "Vamos descobrir onde seu comercial trava. Resposta em até 24h."),
]

ICONS = {
    'arrow': '<svg class="arr" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    'down': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 5v14M6 13l6 6 6-6"/></svg>',
    'whats': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.5 12a8.5 8.5 0 0 1-12.6 7.4L3.5 20.5l1.1-4.2A8.5 8.5 0 1 1 20.5 12Z"/><path d="M9.3 8.4c.3-.3.7-.3.9.1l.7 1.5c.1.3 0 .6-.2.8l-.5.5c.5 1.1 1.4 2 2.5 2.5l.5-.5c.2-.2.5-.3.8-.2l1.5.7c.4.2.4.6.1.9l-.6.6c-.6.6-1.5.8-2.3.5a7.8 7.8 0 0 1-4.2-4.2c-.3-.8-.1-1.7.5-2.3z"/></svg>',
    'insta': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><path d="M17.5 6.5h.01"/></svg>',
    'check': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
    'checkc': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M8 12.3l2.8 2.8L16.2 9.6"/></svg>',
    'target': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><path d="M12 12h.01"/></svg>',
    'spark': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/></svg>',
    'handshake': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 17l6-6 4 4 8-8"/><path d="M15 7h6v6"/></svg>',
    'pin': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21s-7-6.1-7-11.5A7 7 0 0 1 19 9.5C19 14.9 12 21 12 21Z"/><circle cx="12" cy="9.5" r="2.5"/></svg>',
    'mail': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="3"/><path d="m4 7 8 6 8-6"/></svg>',
    'doc': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5M10 13h6M10 17h6"/></svg>',
    'lead': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 4h18l-7 8.5V19l-4 2v-8.5z"/></svg>',
    'clinic': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="4"/><path d="M12 8v8M8 12h8"/></svg>',
    'device': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="6" y="2.5" width="12" height="19" rx="3"/><path d="M11 18.5h2"/></svg>',
    'team': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="9" cy="8" r="3.2"/><circle cx="17" cy="9" r="2.4"/><path d="M3 20c.8-3.4 3.2-5.2 6-5.2s5.2 1.8 6 5.2M15.5 14.5c2.6 0 4.5 1.6 5.2 4.5"/></svg>',
}

def icon(name): return ICONS[name]

def cur(f, active):
    return ' aria-current="page"' if f == active else ''

def nav(active):
    links = "".join(
        f'<li><a href="{f}"{cur(f, active)}>{label}</a></li>'
        for f, label, *_ in PAGES
    )
    mob = "".join(
        f'<a href="{f}"{cur(f, active)}>{label}<span class="accent">→</span></a>'
        for f, label, *_ in PAGES
    )
    return f'''
<header class="nav" id="nav">
  <div class="nav__inner">
    <a class="nav__logo" href="index.html" aria-label="Lamparina Hub, página inicial"><img src="assets/img/logo.webp" alt="Agência Lamparina" width="900" height="346"></a>
    <ul class="nav__links" id="navLinks"><span class="nav__hover" aria-hidden="true"></span>{links}</ul>
    <div class="nav__right">
      <a class="btn btn--green btn--sm nav__cta-desk" href="{FORM}" data-magnetic>Sessão Estratégica {icon("arrow")}</a>
      <button class="nav__burger" id="burger" aria-label="Abrir menu" aria-expanded="false" aria-controls="navMobile"><span></span><span></span><span></span></button>
    </div>
  </div>
  <nav class="nav__mobile" id="navMobile" aria-label="Menu">{mob}<a class="btn btn--green" href="{FORM}">Sessão Estratégica {icon("arrow")}</a></nav>
</header>'''

def footer():
    links = "".join(f'<li><a href="{f}">{label}</a></li>' for f, label, *_ in PAGES)
    return f'''
<footer class="footer">
  <div class="footer__giant" aria-hidden="true"><img src="assets/img/logo.webp" alt="" loading="lazy"></div>
  <div class="wrap">
    <div class="footer__grid">
      <div class="footer__brand">
        <img src="assets/img/logo.webp" alt="Agência Lamparina" width="900" height="346" loading="lazy">
        <!-- TODO: endereço completo -->
        <p>Norte do País<br>CNPJ 57.928.216/0001-39</p>
        <span class="kommo"><i></i>Parceiro Kommo</span>
      </div>
      <div>
        <h4>Menu</h4>
        <ul>{links}</ul>
      </div>
      <div>
        <h4>Redes sociais</h4>
        <div class="social">
          <a href="{INSTA}" aria-label="Instagram" rel="noopener">{icon("insta")}</a>
          <a href="{WHATS}" aria-label="WhatsApp" rel="noopener">{icon("whats")}</a>
        </div>
      </div>
    </div>
    <div class="footer__bottom">
      <span>© 2026 Lamparina Hub</span>
      <!-- TODO: link da Política de Privacidade (texto precisa de revisão jurídica) -->
      <a href="#" data-todo="privacidade">Política de Privacidade</a>
    </div>
  </div>
</footer>'''

def layout(fname, title, desc, body, intro=False):
    intro_html = '''
<div class="intro" id="intro" aria-hidden="true">
  <div class="intro__panel intro__panel--t"></div>
  <div class="intro__panel intro__panel--b"></div>
  <div class="intro__glow"></div>
  <div class="intro__center">
    <div class="intro__logo">
      <img src="assets/img/logo.webp" alt="">
      <span class="intro__spark"></span>
      <span class="intro__scan"></span>
    </div>
  </div>
  <div class="intro__meta">
    <div class="intro__bar"><i></i></div>
    <div class="intro__row mono"><span>Norte do País</span><b id="introPct">000</b></div>
  </div>
</div>''' if intro else ""
    return f'''<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{title}</title>
<meta name="description" content="{desc}">
<meta name="theme-color" content="#0A0A0A">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Host+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600&family=Geist+Mono:wght@400;500&display=swap">
<link rel="stylesheet" href="assets/css/style.css">
<script>try{{if({str(intro).lower()}&&!sessionStorage.getItem("lp-intro")&&!matchMedia("(prefers-reduced-motion: reduce)").matches)document.documentElement.classList.add("has-intro")}}catch(e){{}}</script>
</head>
<body data-page="{fname.replace('.html','')}">
{intro_html}
<div class="pt" id="pt" aria-hidden="true"><div class="pt__bg"></div><div class="pt__line"></div></div>
{nav(fname)}
<main id="main">
{body}
</main>
{footer()}
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/lenis@1.1.13/dist/lenis.min.js"></script>
<script src="assets/js/main.js"></script>
</body>
</html>
'''

def cta(title, sub, btn, href=FORM):
    return f'''<section class="section section--tight">
  <div class="wrap">
    <div class="cta-band" data-seq>
      <div class="cta-band__flame" data-flame data-seq-item></div>
      <h2 class="cta-band__title" data-split data-seq-item>{title}</h2>
      <p class="cta-band__sub" data-seq-item>{sub}</p>
      <a class="btn btn--primary btn--lg cta-band__btn" href="{href}" data-magnetic data-seq-item>{btn} {icon("arrow")}</a>
    </div>
  </div>
</section>'''

def render(text):
    text = re.sub(r"\{\{cta:([^|]+)\|([^|]+)\|([^}]+)\}\}", lambda m: cta(m.group(1), m.group(2), m.group(3)), text)
    # {{icon:name}} e {{raiox}} etc.
    text = re.sub(r"\{\{icon:(\w+)\}\}", lambda m: icon(m.group(1)), text)
    return text.replace("{{form}}", FORM).replace("{{raiox}}", RAIOX).replace("{{whats}}", WHATS).replace("{{insta}}", INSTA)

for fname, label, title, desc in PAGES:
    body = render((SRC / fname).read_text(encoding="utf-8"))
    out = layout(fname, title, desc, body, intro=(fname == "index.html"))
    (ROOT / fname).write_text(out, encoding="utf-8")
    print("ok", fname)
