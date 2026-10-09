# Lamparina Hub — site institucional

HTML/CSS/JS estático, 5 páginas. Sem build obrigatório.

- `index.html`, `o-que-fazemos.html`, `quem-somos.html`, `resultados.html`, `contato.html` — páginas geradas
- `assets/css/style.css` — tokens e componentes
- `assets/js/main.js` — intro do logo, transições, animações, simulador Efeito Represa, filtro, formulário
- `src/build.py` + `src/pages/*.html` — fonte das páginas (nav e rodapé compartilhados). Edite em `src/pages` e rode `python3 src/build.py`.

Bibliotecas via CDN: GSAP 3.12.5 + ScrollTrigger (cdnjs), Lenis 1.1.13 (jsDelivr). Fontes: Host Grotesk, Inter, Geist Mono (Google Fonts).

## Pendências (procure por `TODO` / `data-todo`)
- CNPJ, endereço completo e e-mail comercial (rodapé e Contato) — hoje são placeholders
- Função de cada pessoa do time (Quem Somos)
- Link da Política de Privacidade
- Cases da página Resultados: preencher o array `CASES` em `assets/js/main.js` (o filtro por camada já funciona)
- Integração do formulário: definir `FORM_ENDPOINT` em `assets/js/main.js`
- Selo "Parceiro Kommo" no rodapé: remover se a Lamparina não quiser exibir
