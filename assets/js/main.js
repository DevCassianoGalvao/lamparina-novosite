/* ==========================================================================
   LAMPARINA HUB — interações
   ========================================================================== */
(() => {
  "use strict";

  /* ---------- Conteúdo configurável ---------- */
  // Logos de clientes (assets/img/marcas)
  const MARCAS = [
    ["algimi", "Algimi Florestal"], ["ldex", "LDEX Vidros de Segurança"], ["lugs", "Lug's Santarém"],
    ["medplan", "Medplan Corretora"], ["zum", "Zum"], ["camarao-barroso", "Camarão Barroso"],
    ["ecoville", "Ecoville Brasil"], ["maxsushi", "Max Sushi"], ["h-olhos", "H. Olhos"],
    ["bubble-box", "Bubble Box"], ["mining-ventures", "Mining Ventures Minatz"],
  ];
  // Cases da página Resultados — preencher quando houver material real e autorizado.
  // { logo: "assets/img/marcas/x.webp", cliente: "", segmento: "", tempo: "", camada: "aquisicao"|"presenca"|"comercial", antes: "", resultado: "", citacao: "" }
  const CASES = [];
  // Endpoint do formulário de contato (deixe vazio enquanto não houver integração)
  const FORM_ENDPOINT = "api/contato.php";

  /* ---------- Utilidades ---------- */
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const hasGSAP = typeof window.gsap !== "undefined";
  const root = document.documentElement;
  const rand = (a, b) => a + Math.random() * (b - a);
  const store = {
    get(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} },
  };
  const inView = (el, cb, opts = { rootMargin: "0px 0px -10% 0px" }) => {
    if (!("IntersectionObserver" in window)) { cb(true); return; }
    const io = new IntersectionObserver((es) => es.forEach((e) => cb(e.isIntersecting)), opts);
    io.observe(el);
  };

  if (hasGSAP && window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

  /* ---------- Smooth scroll ---------- */
  let lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new Lenis({ duration: 1.1, smoothWheel: true });
    if (hasGSAP && window.ScrollTrigger) {
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add((t) => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
    } else {
      const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }
  }
  const scrollToEl = (el) => {
    if (lenis) lenis.scrollTo(el, { offset: -100 });
    else el.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
  };
  $$("[data-scroll]").forEach((a) => a.addEventListener("click", (e) => {
    const t = $(a.getAttribute("href"));
    if (t) { e.preventDefault(); scrollToEl(t); }
  }));
  // âncora vinda de outra página (ex.: o-que-fazemos.html#presenca)
  if (location.hash && /^#[\w-]+$/.test(location.hash)) {
    const t = $(location.hash);
    if (t) setTimeout(() => scrollToEl(t), 450);
  }

  /* ---------- Nav ---------- */
  const nav = $("#nav");
  const onScroll = () => nav && nav.classList.toggle("is-scrolled", window.scrollY > 24);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
  const burger = $("#burger");
  if (burger) burger.addEventListener("click", () => {
    const open = nav.classList.toggle("is-open");
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
  });
  const links = $("#navLinks");
  if (links) {
    const hl = $(".nav__hover", links);
    $$("a", links).forEach((a) => a.addEventListener("mouseenter", () => {
      hl.style.width = a.offsetWidth + "px";
      hl.style.transform = `translateX(${a.parentElement.offsetLeft - 4}px)`;
      hl.style.opacity = "1";
    }));
    links.addEventListener("mouseleave", () => { hl.style.opacity = "0"; });
  }

  /* ---------- Transição entre páginas ---------- */
  const pt = $("#pt");
  const hasIntro = root.classList.contains("has-intro");
  if (pt && !hasIntro && !reduce) {
    pt.classList.add("is-in");
    setTimeout(() => pt.classList.remove("is-in"), 800);
  }
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href]");
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0 || a.target === "_blank") return;
    const href = a.getAttribute("href");
    if (!/^[\w-]+\.html(#[\w-]+)?$/.test(href)) return; // só páginas internas
    const [file] = href.split("#");
    const here = (location.pathname.split("/").pop() || "index.html");
    if (file === here && href.includes("#")) {
      const t = $("#" + href.split("#")[1]);
      if (t) { e.preventDefault(); scrollToEl(t); return; }
    }
    if (reduce || !pt) return;
    e.preventDefault();
    pt.classList.remove("is-in");
    pt.classList.add("is-out");
    setTimeout(() => { location.href = href; }, 420);
  });
  window.addEventListener("pageshow", (e) => { if (e.persisted && pt) pt.classList.remove("is-out", "is-in"); });

  /* ---------- Split de palavras ---------- */
  const splitWords = (el, cls) => {
    const walk = (node) => {
      Array.from(node.childNodes).forEach((n) => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach((w) => {
            if (!w) return;
            if (/^\s+$/.test(w)) { frag.appendChild(document.createTextNode(w)); return; }
            if (cls === "mask") {
              const m = document.createElement("span"); m.className = "reveal-mask";
              const i = document.createElement("span"); i.textContent = w; m.appendChild(i); frag.appendChild(m);
            } else {
              const s = document.createElement("span"); s.className = "w"; s.textContent = w; frag.appendChild(s);
            }
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1) walk(n);
      });
    };
    walk(el);
  };

  /* ---------- Hero ---------- */
  const heroTitle = $("[data-hero-title]");
  if (heroTitle && hasGSAP && !reduce) splitWords(heroTitle, "mask");
  const heroIn = () => {
    if (!hasGSAP || reduce) return;
    const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
    if (heroTitle) tl.from($$(".reveal-mask > span", heroTitle), { yPercent: 115, duration: 1.2, stagger: 0.06, delay: 0.1, onComplete: () => $$(".reveal-mask", heroTitle).forEach((m) => m.classList.add("is-done")) }, 0);
    const heroItems = $$("[data-hero]");
    const before = heroTitle ? heroItems.filter((el) => el.compareDocumentPosition(heroTitle) & Node.DOCUMENT_POSITION_FOLLOWING) : [];
    const after = heroItems.filter((el) => !before.includes(el));
    if (before.length) tl.from(before, { y: 16, opacity: 0, duration: 0.8, stagger: 0.06 }, 0);
    tl.from(after, { y: 24, opacity: 0, duration: 1, stagger: 0.1 }, 0.55);
    const stage = $("[data-stage]");
    if (stage) {
      tl.from(stage, { y: 80, opacity: 0, duration: 1.6 }, 0.45);
      tl.from($$("[data-float]"), { scale: 0.8, opacity: 0, duration: 1, stagger: 0.15, ease: "back.out(1.6)" }, 1.1);
    }
  };

  /* ---------- Intro com logotipo ---------- */
  const intro = $("#intro");
  if (hasIntro && intro) {
    if (!hasGSAP) { root.classList.remove("has-intro"); heroIn(); }
    else {
      store.set("lp-intro", "1");
      if (lenis) lenis.stop();
      const img = $(".intro__logo img", intro), scan = $(".intro__scan", intro), spark = $(".intro__spark", intro);
      const pct = $("#introPct"), counter = { v: 0 };
      const tl = gsap.timeline({
        onComplete: () => { root.classList.remove("has-intro"); intro.remove(); if (lenis) lenis.start(); },
      });
      tl.to(spark, { scale: 1.6, duration: 0.35, ease: "power2.out" })
        .to(spark, { scale: 0.9, duration: 0.12, ease: "power1.inOut" })
        .to(spark, { scale: 1.25, duration: 0.14, ease: "power1.inOut" })
        .to(".intro__glow", { opacity: 1, scale: 1, duration: 1.2, ease: "power2.out" }, 0.2)
        .to(counter, { v: 100, duration: 1.6, ease: "power2.inOut", onUpdate: () => { pct.textContent = String(Math.round(counter.v)).padStart(3, "0"); } }, 0.2)
        .to(".intro__bar i", { scaleX: 1, duration: 1.6, ease: "power2.inOut" }, 0.2)
        .set(scan, { opacity: 1 }, 0.55)
        .fromTo(scan, { left: "0%" }, { left: "100%", duration: 1.05, ease: "power2.inOut" }, 0.55)
        .fromTo(img, { clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0% 0 0)", duration: 1.05, ease: "power2.inOut" }, 0.55)
        .to(scan, { opacity: 0, duration: 0.2 }, 1.55)
        .to(spark, { scale: 0, opacity: 0, duration: 0.4 }, 1.5)
        .to(".intro__logo", { scale: 1.04, duration: 0.6, ease: "power2.out" }, 1.6)
        .to([".intro__center", ".intro__meta", ".intro__glow"], { opacity: 0, duration: 0.4, ease: "power2.in" }, 2.05)
        .to(".intro__panel--t", { yPercent: -100, duration: 0.9, ease: "expo.inOut" }, 2.3)
        .to(".intro__panel--b", { yPercent: 100, duration: 0.9, ease: "expo.inOut" }, 2.3)
        .add(heroIn, 2.15);
      intro.addEventListener("click", () => tl.progress(0.95));
    }
  } else {
    heroIn();
  }

  /* ---------- App inclina e assenta com o scroll ---------- */
  const app = $("[data-app]");
  if (app && hasGSAP && window.ScrollTrigger && !reduce) {
    gsap.fromTo(app, { rotateX: 22, scale: 0.94 }, {
      rotateX: 0, scale: 1, ease: "none",
      scrollTrigger: { trigger: app, start: "top 95%", end: "top 30%", scrub: true },
    });
  }

  /* ---------- Reveal on scroll ---------- */
  if (hasGSAP && window.ScrollTrigger && !reduce) {
    $$("[data-split]").filter((h) => !h.closest("[data-seq]")).forEach((h) => {
      splitWords(h, "mask");
      gsap.from($$(".reveal-mask > span", h), {
        yPercent: 115, duration: 1.1, ease: "expo.out", stagger: 0.04,
        onComplete: () => $$(".reveal-mask", h).forEach((m) => m.classList.add("is-done")),
        scrollTrigger: { trigger: h, start: "top 85%" },
      });
    });
    // sequências: container entra, depois os itens na ordem do HTML (título palavra por palavra)
    $$("[data-seq]").forEach((box) => {
      const tl = gsap.timeline({ defaults: { ease: "expo.out" }, scrollTrigger: { trigger: box, start: "top 80%" } });
      tl.from(box, { y: 40, opacity: 0, duration: 1, clearProps: "transform,opacity" }, 0);
      let t = 0.25;
      $$("[data-seq-item]", box).forEach((it) => {
        if (it.hasAttribute("data-split")) {
          splitWords(it, "mask");
          const w = $$(".reveal-mask > span", it);
          tl.from(w, { yPercent: 115, duration: 1, stagger: 0.05, onComplete: () => $$(".reveal-mask", it).forEach((m) => m.classList.add("is-done")) }, t);
          t += 0.35 + w.length * 0.05;
        } else {
          tl.from(it, { y: 18, opacity: 0, duration: 0.8, clearProps: "transform,opacity" }, t);
          t += 0.18;
        }
      });
    });
    ScrollTrigger.batch("[data-reveal]", {
      start: "top 88%",
      onEnter: (els) => gsap.from(els, { y: 40, opacity: 0, duration: 1.1, ease: "expo.out", stagger: 0.09, clearProps: "transform,opacity" }),
      once: true,
    });
    $$("[data-words]").forEach((p) => {
      splitWords(p, "w");
      const ws = $$(".w", p);
      gsap.to(ws, {
        opacity: 1, ease: "none", stagger: 0.1,
        scrollTrigger: { trigger: p, start: "top 82%", end: "bottom 45%", scrub: 0.6 },
      });
    });
    $$("[data-manifesto] .strike").forEach((s) => {
      gsap.to(s, { "--s": 1, ease: "power2.out", duration: 0.9, scrollTrigger: { trigger: s, start: "top 70%" } });
    });
  } else {
    $$("[data-manifesto] .strike").forEach((s) => s.style.setProperty("--s", 1));
  }

  /* ---------- Spotlight nos cards e botões ---------- */
  if (fine) {
    $$("[data-spot], .btn--primary, .btn--green").forEach((el) => {
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        el.style.setProperty("--mx", `${e.clientX - r.left}px`);
        el.style.setProperty("--my", `${e.clientY - r.top}px`);
      });
    });
  }

  /* ---------- Botões magnéticos ---------- */
  if (fine && !reduce) {
    $$("[data-magnetic]").forEach((b) => {
      b.addEventListener("pointermove", (e) => {
        const r = b.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) * 0.18, y = (e.clientY - r.top - r.height / 2) * 0.28;
        b.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
      });
      b.addEventListener("pointerleave", () => { b.style.transform = ""; });
    });
  }

  /* ---------- Brasas (canvas do hero) ---------- */
  $$("[data-embers]").forEach((cv) => {
    if (reduce) return;
    const ctx = cv.getContext("2d");
    let w, h, dpr, parts = [], run = false;
    const size = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = cv.clientWidth; h = cv.clientHeight;
      cv.width = w * dpr; cv.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const make = (initial) => ({
      x: w / 2 + (Math.random() - 0.5) * Math.min(w, 1200) * (0.35 + Math.random() * 0.65),
      y: initial ? rand(0, h) : h + 10,
      r: rand(0.6, 2.1), vy: rand(0.15, 0.55), vx: rand(-0.12, 0.12),
      a: rand(0.25, 0.9), t: rand(0, 6.28), f: rand(0.01, 0.03),
    });
    const init = () => { size(); const n = Math.round(Math.min(90, w / 14)); parts = Array.from({ length: n }, () => make(true)); };
    const tick = () => {
      if (!run) return;
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";
      for (const p of parts) {
        p.t += p.f; p.y -= p.vy; p.x += p.vx + Math.sin(p.t) * 0.25;
        const life = Math.max(0, Math.min(1, p.y / h));
        const al = p.a * life * (0.6 + 0.4 * Math.sin(p.t * 3));
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 5);
        g.addColorStop(0, `rgba(255,190,120,${al})`);
        g.addColorStop(0.35, `rgba(255,100,10,${al * 0.55})`);
        g.addColorStop(1, "rgba(255,90,0,0)");
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 5, 0, 6.283); ctx.fill();
        if (p.y < -10) Object.assign(p, make(false));
      }
      requestAnimationFrame(tick);
    };
    init();
    window.addEventListener("resize", init);
    inView(cv, (v) => { if (v && !run) { run = true; tick(); } else if (!v) run = false; }, { rootMargin: "0px" });
  });

  /* ---------- Chama (CTA) ---------- */
  $$("[data-flame]").forEach((el) => {
    el.innerHTML = `<svg viewBox="0 0 54 54" width="54" height="54" aria-hidden="true" style="overflow:visible">
      <defs><radialGradient id="fg${Math.random().toString(36).slice(2, 6)}" cx="50%" cy="72%" r="60%"><stop offset="0" stop-color="#FFE0B8"/><stop offset=".45" stop-color="#FF8800"/><stop offset="1" stop-color="#FF5A00"/></radialGradient></defs>
      <circle cx="27" cy="34" r="26" fill="rgba(255,90,0,.18)" class="fl-glow"/>
      <path class="fl-body" d="M27 3c4 9 15 15 15 29a15 15 0 0 1-30 0c0-7 4-12 7-16 1 5 3 7 5 8-1-8 0-15 3-21Z"/>
    </svg>`;
    const path = $(".fl-body", el), id = $("radialGradient", el).id;
    path.setAttribute("fill", `url(#${id})`);
    if (hasGSAP && !reduce) {
      gsap.to(path, { scaleY: 1.08, scaleX: 0.95, skewX: 2, transformOrigin: "50% 100%", duration: 0.35, repeat: -1, yoyo: true, ease: "sine.inOut" });
      gsap.to($(".fl-glow", el), { opacity: 0.5, scale: 1.15, transformOrigin: "50% 50%", duration: 0.9, repeat: -1, yoyo: true, ease: "sine.inOut" });
    }
  });

  /* ---------- Pipeline (kanban animado) ---------- */
  const kanban = $("[data-kanban]");
  if (kanban) {
    const NAMES = [
      ["Clínica", "C", "Meta Ads"], ["Loja de eletrônico", "L", "Google Ads"], ["Prestador de serviço", "P", "Indicação"],
      ["Clínica odontológica", "C", "Meta Ads"], ["Assistência técnica", "A", "Google Ads"], ["Clínica de estética", "C", "Meta Ads"],
      ["Loja de celular", "L", "Google Ads"], ["Energia solar", "E", "Meta Ads"], ["Fisioterapia", "F", "Indicação"],
    ];
    const cols = $$(".kcol", kanban);
    const pct = [18, 45, 72, 100];
    let ni = 0;
    const card = (col) => {
      const [n, i, t] = NAMES[ni++ % NAMES.length];
      const el = document.createElement("div");
      el.className = "kcard" + (col === 3 ? " kcard--won" : "");
      el.innerHTML = `<div class="kcard__top"><span class="kcard__av">${i}</span><span class="kcard__t">${n}</span></div>
        <div class="kcard__tags"><span class="tag tag--o">${t}</span></div>
        <div class="kcard__bar"><i style="width:${pct[col]}%"></i></div>`;
      return el;
    };
    const counts = () => cols.forEach((c) => { $("[data-count]", c).textContent = $$(".kcard", c).length; });
    [3, 2, 2, 1].forEach((n, c) => { for (let k = 0; k < n; k++) cols[c].appendChild(card(c)); });
    counts();
    const flip = (els, mutate) => {
      const first = new Map(els.map((e) => [e, e.getBoundingClientRect()]));
      mutate();
      els.forEach((e) => {
        if (!e.isConnected) return;
        const a = first.get(e), b = e.getBoundingClientRect();
        const dx = a.left - b.left, dy = a.top - b.top;
        if (dx || dy) e.animate([{ transform: `translate(${dx}px,${dy}px)` }, { transform: "none" }], { duration: 700, easing: "cubic-bezier(.2,.7,.1,1)" });
      });
    };
    let running = false;
    // celular: o quadro mostra 2 colunas e desliza pra direita/esquerda acompanhando o card
    const mobile = matchMedia("(max-width: 760px)");
    let pan = 0, seqCol = 0;
    const setPan = (p) => {
      if (!mobile.matches) { kanban.style.transform = ""; pan = 0; return false; }
      p = Math.max(0, Math.min(2, p));
      if (p === pan && kanban.style.transform) return false;
      pan = p;
      kanban.style.transform = `translateX(${-cols[p].offsetLeft}px)`;
      return true;
    };
    mobile.addEventListener?.("change", () => setPan(pan));
    setPan(0);
    const step = () => {
      if (!running) return;
      // no celular segue as colunas em ordem (0→1, 1→2, 2→3) pra o quadro deslizar; no desktop é aleatório
      let from;
      if (mobile.matches) {
        from = seqCol; let guard = 0;
        while (!$$(".kcard", cols[from]).length && guard++ < 3) from = (from + 1) % 3;
        seqCol = (from + 1) % 3;
      } else from = [2, 1, 0].filter((c) => $$(".kcard", cols[c]).length)[Math.floor(Math.random() * 2)] ?? 0;
      const moved = setPan(from);
      if (moved) { setTimeout(() => doMove(from), 750); return; }
      doMove(from);
    };
    const doMove = (from) => {
      if (!running) return;
      const mover = $(".kcard", cols[from]);
      if (mover) {
        const all = $$(".kcard", kanban);
        flip(all, () => {
          const to = from + 1;
          cols[to].insertBefore(mover, $(".kcard", cols[to]));
          $(".kcard__bar i", mover).style.width = pct[to] + "%";
          if (to === 3) {
            mover.classList.add("kcard--won");
            mover.animate([{ boxShadow: "0 0 0 1px #FF5A00, 0 0 30px rgba(255,90,0,.6)" }, { boxShadow: "0 0 0 1px transparent" }], { duration: 1400 });
          }
          if ($$(".kcard", cols[3]).length > 3) $$(".kcard", cols[3]).pop().remove();
          if ($$(".kcard", cols[0]).length < 2) {
            const nc = card(0); cols[0].appendChild(nc);
            nc.animate([{ opacity: 0, transform: "translateY(-10px)" }, { opacity: 1, transform: "none" }], { duration: 500 });
          }
          ["1", "2"].forEach((c) => { while ($$(".kcard", cols[c]).length > 3) $$(".kcard", cols[c]).pop().remove(); });
        });
        counts();
      }
      setTimeout(step, 1500);
    };
    if (!reduce) inView(kanban, (v) => { if (v && !running) { running = true; setTimeout(step, hasIntro ? 3200 : 1200); } else if (!v) running = false; });
  }

  /* ---------- Home: artes das camadas ---------- */
  const leads = $("[data-leads]");
  if (leads) {
    const L = [["Clínica", "C", "Meta Ads"], ["Loja de eletrônico", "L", "Google Ads"], ["Prestador de serviço", "P", "Meta Ads"], ["Clínica odontológica", "C", "Google Ads"]];
    let k = 0, on = false;
    const row = () => {
      const [n, i, t] = L[k++ % L.length];
      const el = document.createElement("div");
      el.className = "lead-row";
      el.innerHTML = `<span class="kcard__av">${i}</span><b>${n}</b><span class="tag tag--o">${t}</span>`;
      return el;
    };
    for (let j = 0; j < 3; j++) leads.appendChild(row());
    const loop = () => {
      if (!on) return;
      const el = row();
      leads.prepend(el);
      el.animate([{ opacity: 0, transform: "translateY(-14px) scale(.96)" }, { opacity: 1, transform: "none" }], { duration: 600, easing: "cubic-bezier(.2,.7,.1,1)" });
      const rows = $$(".lead-row", leads);
      if (rows.length > 3) {
        const last = rows[rows.length - 1];
        last.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 300 }).onfinish = () => last.remove();
      }
      setTimeout(loop, 1900);
    };
    if (!reduce) inView(leads, (v) => { if (v && !on) { on = true; setTimeout(loop, 900); } else if (!v) on = false; });
    const bars = $$("[data-week] i");
    bars.forEach((b, i) => { b.style.height = `${28 + i * 7.5}%`; });
    if (hasGSAP && !reduce) gsap.from(bars, { scaleY: 0, duration: 0.9, stagger: 0.06, ease: "expo.out", scrollTrigger: window.ScrollTrigger ? { trigger: leads, start: "top 85%" } : undefined });
  }

  const brand = $("[data-brand]");
  if (brand && hasGSAP && !reduce) {
    const lbl = $("[data-brand-size]"), o = { s: 0.6 };
    const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.8, paused: true });
    tl.set(o, { s: 0.6 })
      .to(o, { s: 1, duration: 1.4, ease: "expo.inOut", onUpdate: () => { brand.style.transform = `scale(${o.s})`; lbl.textContent = Math.round(o.s * 100) + "%"; } }, 0.6)
      .to({}, { duration: 1.6 })
      .to(o, { s: 0.6, duration: 0.9, ease: "power2.inOut", onUpdate: () => { brand.style.transform = `scale(${o.s})`; lbl.textContent = Math.round(o.s * 100) + "%"; } });
    brand.style.transform = "scale(.6)"; lbl.textContent = "60%";
    inView(brand, (v) => (v ? tl.play() : tl.pause()));
  }

  const deal = $("[data-deal]");
  if (deal) {
    const sts = $$(".st", deal), sls = $$(".sl", deal), badge = $("[data-deal-badge]", deal);
    const seq = []; sts.forEach((s, i) => { seq.push(s); if (sls[i]) seq.push(sls[i]); });
    let i = 0, on = false;
    const tick = () => {
      if (!on) return;
      if (i < seq.length) { seq[i].classList.add("on"); i++; if (i === seq.length) { badge.textContent = "FECHADO"; badge.classList.add("won"); } setTimeout(tick, 420); }
      else { setTimeout(() => { seq.forEach((s) => s.classList.remove("on")); badge.textContent = "PROPOSTA"; badge.classList.remove("won"); i = 0; setTimeout(tick, 700); }, 1800); }
    };
    if (reduce) { seq.forEach((s) => s.classList.add("on")); badge.textContent = "FECHADO"; badge.classList.add("won"); }
    else inView(deal, (v) => { if (v && !on) { on = true; tick(); } else if (!v) on = false; });
  }

  /* ---------- Marquee de logos ---------- */
  const tile = ([f, n]) => `<div class="logo-tile"><img src="assets/img/marcas/${f}.webp" alt="${n}" width="480" height="320" loading="lazy"></div>`;
  $$("[data-marquee]").forEach((m) => {
    const a = MARCAS.slice(0, 6), b = MARCAS.slice(5).concat(MARCAS.slice(0, 1));
    const row = (arr, rev) => `<div class="marquee__row${rev ? " marquee__row--rev" : ""}">${arr.concat(arr, arr).map(tile).join("")}${arr.concat(arr, arr).map(tile).join("")}</div>`;
    m.innerHTML = row(a, false) + row(b, true);
  });
  const wall = $("[data-logowall]");
  if (wall) {
    wall.innerHTML = MARCAS.map(tile).join("");
    if (hasGSAP && window.ScrollTrigger && !reduce) gsap.from($$(".logo-tile", wall), { y: 30, opacity: 0, duration: 0.9, stagger: 0.05, ease: "expo.out", scrollTrigger: { trigger: wall, start: "top 88%" } });
  }

  /* ---------- Radar de Santarém (home) ---------- */
  $$("[data-geo]").forEach((cv) => {
    const ctx = cv.getContext("2d");
    let S, dpr, run = false, t0 = performance.now();
    const blips = Array.from({ length: 26 }, () => { const a = rand(0, 6.283), r = Math.sqrt(Math.random()) * 0.92; return { a, r, s: rand(1, 2.2) }; });
    const size = () => { dpr = Math.min(devicePixelRatio || 1, 2); S = cv.clientWidth; cv.width = cv.height = S * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
    const draw = (now) => {
      const t = (now - t0) / 1000, c = S / 2, R = S / 2 - 2;
      ctx.clearRect(0, 0, S, S);
      // grade de pontos dentro do círculo
      const step = S / 26;
      for (let x = step / 2; x < S; x += step) for (let y = step / 2; y < S; y += step) {
        const d = Math.hypot(x - c, y - c) / R; if (d > 1) continue;
        ctx.fillStyle = `rgba(255,240,230,${0.16 * (1 - d * 0.7)})`; ctx.fillRect(x - 0.8, y - 0.8, 1.6, 1.6);
      }
      // anéis
      ctx.lineWidth = 1;
      [0.33, 0.66, 1].forEach((k) => { ctx.strokeStyle = "rgba(255,240,230,.08)"; ctx.beginPath(); ctx.arc(c, c, R * k, 0, 6.283); ctx.stroke(); });
      // varredura
      const ang = (t * 0.9) % 6.283;
      if (ctx.createConicGradient) {
        const g = ctx.createConicGradient(ang - 1.2, c, c);
        g.addColorStop(0, "rgba(255,90,0,0)"); g.addColorStop(0.19, "rgba(255,90,0,.22)"); g.addColorStop(0.191, "rgba(255,90,0,0)"); g.addColorStop(1, "rgba(255,90,0,0)");
        ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(c, c); ctx.arc(c, c, R, 0, 6.283); ctx.fill();
      }
      ctx.strokeStyle = "rgba(255,136,0,.7)"; ctx.beginPath(); ctx.moveTo(c, c); ctx.lineTo(c + Math.cos(ang) * R, c + Math.sin(ang) * R); ctx.stroke();
      // blips iluminados pela varredura
      blips.forEach((b) => {
        let diff = (ang - b.a) % 6.283; if (diff < 0) diff += 6.283;
        const glow = Math.max(0, 1 - diff / 2.2);
        const x = c + Math.cos(b.a) * b.r * R, y = c + Math.sin(b.a) * b.r * R;
        ctx.fillStyle = `rgba(255,${120 + 80 * glow},${40 + 80 * glow},${0.15 + glow * 0.85})`;
        ctx.beginPath(); ctx.arc(x, y, b.s + glow * 1.5, 0, 6.283); ctx.fill();
      });
      // pulso central (Santarém)
      const p = (t % 2) / 2;
      ctx.strokeStyle = `rgba(255,90,0,${1 - p})`; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(c, c, 6 + p * 46, 0, 6.283); ctx.stroke();
      ctx.fillStyle = "#FF5A00"; ctx.shadowColor = "#FF5A00"; ctx.shadowBlur = 18; ctx.beginPath(); ctx.arc(c, c, 5, 0, 6.283); ctx.fill(); ctx.shadowBlur = 0;
      if (run) requestAnimationFrame(draw);
    };
    size(); window.addEventListener("resize", size);
    if (reduce) { draw(performance.now()); return; }
    inView(cv, (v) => { if (v && !run) { run = true; requestAnimationFrame(draw); } else if (!v) run = false; }, { rootMargin: "0px" });
  });

  /* ---------- Efeito Represa (simulador) ---------- */
  const dam = $("[data-dam]");
  if (dam) {
    const cv = $("[data-dam-canvas]", dam), ctx = cv.getContext("2d");
    const GX = [0.27, 0.52, 0.77];
    const blocked = [false, false, false];
    const btns = $$("[data-gate]", dam), lbls = $$("[data-lbl]", dam);
    lbls.forEach((l, i) => { l.style.left = GX[i] * 100 + "%"; });
    let auto = true, autoI = 0;
    const sync = () => {
      btns.forEach((b, i) => b.setAttribute("aria-pressed", String(blocked[i])));
      lbls.forEach((l, i) => l.classList.toggle("is-blocked", blocked[i]));
    };
    const toggle = (i) => { auto = false; blocked[i] = !blocked[i]; sync(); };
    btns.forEach((b) => b.addEventListener("click", () => toggle(+b.dataset.gate)));
    lbls.forEach((l) => l.addEventListener("click", () => toggle(+l.dataset.lbl)));
    const AUTO = [[], [0], [], [1], [], [2]];
    const autoStep = () => {
      if (!auto) return;
      autoI = (autoI + 1) % AUTO.length;
      blocked.fill(false); AUTO[autoI].forEach((i) => (blocked[i] = true)); sync();
      setTimeout(autoStep, AUTO[autoI].length ? 3200 : 1900);
    };

    let W, H, dpr, run = false, ps = [];
    const size = () => { dpr = Math.min(devicePixelRatio || 1, 2); W = cv.clientWidth; H = cv.clientHeight; cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
    const top = () => Math.min(100, H * 0.3), bot = () => H - 26;
    const spawn = () => ({ x: -10, y: rand(top() + 10, bot() - 10), vx: rand(1.1, 1.9), r: rand(1.4, 2.8), ph: rand(0, 6.28), held: -1, hx: 0 });
    const queue = [0, 0, 0];
    const frame = () => {
      if (!run) return;
      ctx.clearRect(0, 0, W, H);
      const T = top(), B = bot();
      // canal
      ctx.strokeStyle = "rgba(255,240,230,.07)"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(0, T); ctx.lineTo(W, T); ctx.moveTo(0, B); ctx.lineTo(W, B); ctx.stroke();
      // escurece trecho a jusante de comporta travada
      const firstBlock = blocked.indexOf(true);
      if (firstBlock > -1) {
        const gx = GX[firstBlock] * W;
        const g = ctx.createLinearGradient(gx, 0, W, 0);
        g.addColorStop(0, "rgba(0,0,0,.0)"); g.addColorStop(0.05, "rgba(0,0,0,.35)"); g.addColorStop(1, "rgba(0,0,0,.5)");
        ctx.fillStyle = g; ctx.fillRect(gx, T, W - gx, B - T);
      }
      // comportas
      GX.forEach((gxr, i) => {
        const gx = gxr * W;
        if (blocked[i]) {
          ctx.fillStyle = "rgba(255,90,0,.95)"; ctx.shadowColor = "#FF5A00"; ctx.shadowBlur = 24;
          ctx.fillRect(gx - 3, T - 8, 6, B - T + 16); ctx.shadowBlur = 0;
        } else {
          ctx.setLineDash([4, 6]); ctx.strokeStyle = "rgba(61,220,132,.45)"; ctx.lineWidth = 1.5;
          ctx.beginPath(); ctx.moveTo(gx, T - 8); ctx.lineTo(gx, B + 8); ctx.stroke(); ctx.setLineDash([]);
        }
      });
      // saída
      const outG = ctx.createRadialGradient(W, (T + B) / 2, 0, W, (T + B) / 2, 160);
      const flowing = firstBlock === -1 ? 1 : 0.15;
      outG.addColorStop(0, `rgba(255,136,0,${0.35 * flowing})`); outG.addColorStop(1, "rgba(255,136,0,0)");
      ctx.fillStyle = outG; ctx.fillRect(W - 160, T, 160, B - T);
      // partículas
      for (let k = 0; k < 2; k++) if (Math.random() < 0.6) ps.push(spawn());
      queue.fill(0);
      ctx.globalCompositeOperation = "lighter";
      for (const p of ps) {
        p.ph += 0.05;
        // encontra a próxima comporta à frente
        let gateAhead = -1;
        for (let i = 0; i < 3; i++) if (p.x < GX[i] * W) { gateAhead = i; break; }
        if (gateAhead > -1 && blocked[gateAhead]) {
          const gx = GX[gateAhead] * W;
          const q = queue[gateAhead]++;
          const stopX = gx - 8 - Math.min(gx - 20, q * 0.55) - (p.r * 2);
          if (p.x < stopX) p.x += p.vx; else { p.x += (stopX - p.x) * 0.1; }
          p.y += Math.sin(p.ph) * 0.15;
        } else {
          p.x += p.vx * (1 + (gateAhead === -1 ? 0.4 : 0)); p.y += Math.sin(p.ph) * 0.35;
        }
        p.y = Math.max(T + 4, Math.min(B - 4, p.y));
        const passed = gateAhead === -1 ? 3 : gateAhead;
        const heat = passed / 3;
        const a = 0.55 + heat * 0.4;
        ctx.fillStyle = `rgba(255,${90 + heat * 120},${heat * 120},${a})`;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r + heat * 0.6, 0, 6.283); ctx.fill();
      }
      ctx.globalCompositeOperation = "source-over";
      ps = ps.filter((p) => p.x < W + 20);
      if (ps.length > 1400) ps.splice(0, ps.length - 1400);
      requestAnimationFrame(frame);
    };
    size(); window.addEventListener("resize", size);
    sync();
    if (!reduce) inView(cv, (v) => {
      if (v && !run) { run = true; requestAnimationFrame(frame); if (auto) setTimeout(autoStep, 1600); }
      else if (!v) run = false;
    }, { rootMargin: "0px" });
  }

  /* ---------- Placas empilhadas (camadas) ---------- */
  const plates = $("[data-plates]");
  if (plates) {
    const pl = $$(".plate", plates);
    const set = (n) => pl.forEach((p, i) => { p.classList.toggle("is-on", i < n); p.classList.toggle("is-off", i >= n); });
    set(1);
    const cards = $$("[data-camada]");
    cards.forEach((c, idx) => {
      const n = +c.dataset.camada;
      if (hasGSAP && window.ScrollTrigger) {
        ScrollTrigger.create({ trigger: c, start: "top 62%", onEnter: () => set(n), onLeaveBack: () => set(Math.max(1, n - 1)) });
        const next = cards[idx + 1];
        if (next && !reduce) {
          gsap.fromTo(c, { scale: 1, filter: "brightness(1)" }, { scale: 0.93, filter: "brightness(0.38)", ease: "none",
            scrollTrigger: { trigger: next, start: "top 85%", end: () => `top ${(innerWidth > 900 ? 112 : 84) + (idx + 1) * (innerWidth > 900 ? 22 : 14)}px`, scrub: true } });
        }
      } else inView(c, (v) => { if (v) set(n); }, { rootMargin: "-45% 0px -45% 0px" });
    });
    if (hasGSAP && !reduce) gsap.to(plates, { y: -12, duration: 3, repeat: -1, yoyo: true, ease: "sine.inOut" });
  }

  /* ---------- Terminal (Quem Somos) ---------- */
  const term = $("[data-terminal]");
  if (term) {
    let lines = [];
    try { lines = JSON.parse(term.dataset.lines); } catch (e) {}
    const render = (full) => {
      term.innerHTML = "";
      lines.forEach((l) => {
        const d = document.createElement("div");
        d.className = "tline" + (full ? " done" : "");
        d.innerHTML = `<span class="p">›</span><span class="tx">${full ? l : ""}</span><span class="ok">✓ ok</span>`;
        term.appendChild(d);
      });
    };
    if (reduce) render(true);
    else {
      render(false);
      let started = false;
      inView(term, (v) => {
        if (!v || started) return; started = true;
        const rows = $$(".tline", term);
        const caret = document.createElement("span"); caret.className = "caret";
        let li = 0, ci = 0;
        const type = () => {
          if (li >= rows.length) { $(".tx", rows[rows.length - 1]).appendChild(caret); return; }
          const tx = $(".tx", rows[li]);
          tx.appendChild(caret);
          if (ci < lines[li].length) { caret.before(lines[li][ci++]); setTimeout(type, rand(22, 55)); }
          else { rows[li].classList.add("done"); li++; ci = 0; setTimeout(type, 380); }
        };
        type();
      });
    }
  }

  /* ---------- Contador (+22 especialistas) ---------- */
  $$("[data-count-to]").forEach((el) => {
    const to = +el.dataset.countTo;
    if (reduce || !hasGSAP) return;
    el.textContent = "0";
    let done = false;
    inView(el, (v) => {
      if (!v || done) return; done = true;
      const o = { v: 0 };
      gsap.to(o, { v: to, duration: 1.6, ease: "power2.out", delay: 0.2, onUpdate: () => { el.textContent = Math.round(o.v); } });
    });
  });

  /* ---------- Odômetro de seis dígitos ---------- */
  const digits = $("[data-digits]");
  if (digits) {
    const rolls = [];
    for (let i = 0; i < 6; i++) {
      if (i === 3) { const s = document.createElement("span"); s.className = "sep"; s.textContent = "."; digits.appendChild(s); }
      const d = document.createElement("span"); d.className = "digit";
      d.innerHTML = `<span>${"0123456789".split("").map((n) => `<i>${n}</i>`).join("")}</span>`;
      digits.appendChild(d); rolls.push($("span", d));
    }
    const setNum = (n, dur) => {
      const s = String(n).padStart(6, "0");
      rolls.forEach((r, i) => {
        r.style.transition = dur ? `transform ${dur + i * 0.12}s cubic-bezier(.2,.7,.1,1)` : "none";
        r.style.transform = `translateY(-${+s[i]}em)`;
      });
    };
    setNum(100000, 0);
    if (!reduce) {
      let on = false;
      const loop = () => { if (!on) return; setNum(Math.floor(rand(100000, 999999)), 1.1); setTimeout(loop, 2600); };
      inView(digits, (v) => { if (v && !on) { on = true; loop(); } else if (!v) on = false; });
    }
  }

  /* ---------- Resultados: cases + filtro ---------- */
  const casesEl = $("[data-cases]");
  if (casesEl) {
    const NOMES = { aquisicao: "Aquisição", presenca: "Presença", comercial: "Comercial" };
    const esc = (s) => String(s || "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
    const draw = (f) => {
      casesEl.innerHTML = CASES.filter((c) => !f || c.camada === f).map((c) => `
        <article class="card case" data-spot>
          ${c.logo ? `<img src="${esc(c.logo)}" alt="${esc(c.cliente)}" style="height:48px;width:auto;border-radius:8px">` : ""}
          <span class="mono" style="color:var(--dim)">${esc(c.segmento)}${c.tempo ? " · " + esc(c.tempo) : ""}</span>
          <span class="tag tag--o" style="align-self:flex-start">${NOMES[c.camada] || ""}</span>
          <p style="color:var(--mute)">${esc(c.antes)}</p>
          <p style="font-family:var(--ff-display);font-size:1.4rem;font-weight:600;letter-spacing:-.02em">${esc(c.resultado)}</p>
          ${c.citacao ? `<p style="color:var(--mute);font-style:italic">“${esc(c.citacao)}”</p>` : ""}
        </article>`).join("");
    };
    draw("");
    $$("[data-filter]").forEach((b) => b.addEventListener("click", () => {
      const on = b.getAttribute("aria-pressed") !== "true";
      $$("[data-filter]").forEach((x) => x.setAttribute("aria-pressed", "false"));
      b.setAttribute("aria-pressed", String(on));
      draw(on ? b.dataset.filter : "");
    }));
  }

  /* ---------- Formulário de contato ---------- */
  const form = $("#contatoForm");
  if (form) {
    const tel = $("#f-whats", form);
    tel.addEventListener("input", () => {
      const d = tel.value.replace(/\D/g, "").slice(0, 11);
      let v = d;
      if (d.length > 2) v = `(${d.slice(0, 2)}) ${d.slice(2)}`;
      if (d.length > 7) v = `(${d.slice(0, 2)}) ${d.slice(2, d.length - 4)}-${d.slice(-4)}`;
      tel.value = v;
    });
    const btn = $("button[type=submit]", form);
    const original = btn.innerHTML;
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      let ok = true;
      ["#f-nome", "#f-empresa"].forEach((s) => { const el = $(s, form); const bad = !el.value.trim(); el.classList.toggle("is-invalid", bad); if (bad) ok = false; });
      const badTel = tel.value.replace(/\D/g, "").length < 10; tel.classList.toggle("is-invalid", badTel); if (badTel) ok = false;
      const fat = $("input[name=faturamento]:checked", form); $("#f-fat").classList.toggle("is-invalid", !fat); if (!fat) ok = false;
      if (!ok) {
        btn.animate([{ transform: "translateX(0)" }, { transform: "translateX(-6px)" }, { transform: "translateX(6px)" }, { transform: "translateX(0)" }], { duration: 300 });
        const first = $(".is-invalid", form); if (first) (first.matches("input") ? first : $("input", first)).focus();
        return;
      }
      const data = Object.fromEntries(new FormData(form));
      btn.disabled = true;
      btn.innerHTML = "Enviando…";
      let sent = !FORM_ENDPOINT;
      try {
        if (FORM_ENDPOINT) {
          const r = await fetch(FORM_ENDPOINT, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
          const j = await r.json().catch(() => ({}));
          sent = r.ok && j.ok !== false;
        }
      } catch (err) { sent = false; }
      if (!sent) {
        btn.classList.add("is-error");
        btn.innerHTML = "Não foi possível enviar. Tente pelo WhatsApp.";
        setTimeout(() => { btn.disabled = false; btn.classList.remove("is-error"); btn.innerHTML = original; }, 5000);
        return;
      }
      btn.classList.add("is-sent");
      btn.innerHTML = `Enviado ${'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>'}`;
      setTimeout(() => { form.reset(); btn.disabled = false; btn.classList.remove("is-sent"); btn.innerHTML = original; }, 4000);
    });
    $$(".input", form).forEach((i) => i.addEventListener("input", () => i.classList.remove("is-invalid")));
    $$("input[name=faturamento]", form).forEach((i) => i.addEventListener("change", () => $("#f-fat").classList.remove("is-invalid")));
  }

  if (hasGSAP && window.ScrollTrigger) window.addEventListener("load", () => ScrollTrigger.refresh());
})();
