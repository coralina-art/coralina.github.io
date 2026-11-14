/* Coralina — layout compartilhado: cabeçalho (menu + busca), rodapé e funções de cards.
   Depende de data/catalogo.js (window.CATALOGO). */
(function () {
  "use strict";
  const C = window.CATALOGO;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  /* ---------- lojas "em breve" ----------
     Lojas marcadas com "em_breve": true em data/catalogo.js ficam desativadas:
     seus produtos e categorias somem do site (menu, busca, home) e aparecem como "Em breve".
     Para reativar, apague a linha "em_breve" da loja. */
  const EM_BREVE = new Set(C.lojas.filter((l) => l.em_breve).map((l) => l.slug));
  const emBreve = (loja) => EM_BREVE.has(loja);
  C.produtos = C.produtos.filter((p) => !emBreve(p.loja));
  C.categorias = C.categorias.filter((c) => !emBreve(c.loja));

  /* ---------- ícones ---------- */
  const I = {
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>',
    menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    chev: '<svg class="chev" viewBox="0 0 12 8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M1 1l5 5 5-5"/></svg>',
    arrow: '<svg viewBox="0 0 24 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M1 6h21M17 1l5 5-5 5"/></svg>',
    filter: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 6h16M7 12h10M10 18h4"/></svg>',
    instagram: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>',
  };

  /* ---------- dados ---------- */
  const lojaBySlug = Object.fromEntries(C.lojas.map((l) => [l.slug, l]));
  const catBySlug = Object.fromEntries(C.categorias.map((c) => [c.slug, c]));
  const prodBySlug = Object.fromEntries(C.produtos.map((p) => [p.slug, p]));
  const catsOf = (loja) => C.categorias.filter((c) => c.loja === loja);
  const prodsOf = (loja, cat) => C.produtos.filter((p) => p.loja === loja && (!cat || p.categoria === cat));
  const lojaUrl = (loja, params) => {
    const q = new URLSearchParams(params || {}).toString();
    return `${loja}.html${q ? "?" + q : ""}`;
  };
  const prodUrl = (p) => `produto.html?p=${encodeURIComponent(p.slug)}`;

  /* ---------- preço e cards ---------- */
  function priceHTML(p) {
    if (p.preco_tipo === "encomenda") return `<span class="price-order">${esc(C.meta.texto_encomenda)}</span>`;
    if (p.preco_tipo === "a_partir_de") return `<span class="price-from">A partir de</span> ${esc(p.preco_exibicao.replace("A partir de ", ""))}`;
    return esc(p.preco_exibicao);
  }
  const buyLabel = () => "Quero Encomendar";
  const chatUrl = () => `https://wa.me/${C.meta.whatsapp}`;
  function badgesHTML(p) {
    const b = [];
    if (p.tags.includes("oceans")) b.push('<span class="badge badge--oceans">Oceans</span>');
    if (p.sazonal) b.push('<span class="badge badge--sazonal">Sazonal</span>');
    if (p.tags.includes("atacado")) b.push('<span class="badge">Atacado</span>');
    if (p.tags.includes("flores-naturais")) b.push('<span class="badge">Flores naturais</span>');
    return b.length ? `<div class="badges">${b.slice(0, 2).join("")}</div>` : "";
  }
  function cardHTML(p) {
    return `<article class="card">
      <a class="card-media" href="${prodUrl(p)}" tabindex="-1" aria-hidden="true">
        <img src="${esc(p.imagem)}" alt="" loading="lazy" width="640" height="800">${badgesHTML(p)}
      </a>
      <div class="card-body">
        <a class="card-title" href="${prodUrl(p)}">${esc(p.nome)}</a>
        <p class="card-price">${priceHTML(p)}</p>
      </div>
      <a class="btn btn--sm ${p.preco_tipo === "encomenda" ? "btn--lilac" : ""}" href="${esc(p.link_compra)}" target="_blank" rel="noopener">${buyLabel(p)}</a>
    </article>`;
  }

  /* ---------- cabeçalho ---------- */
  const TILES = { atelie: ["kit-encanto", "bandeja-florescer"], papelaria: ["convites", "caixa-cenario"] };
  const HIGHLIGHTS = {
    atelie: [["Coleção Oceans", { tag: "oceans" }], ["Feito com flores naturais", { tag: "flores-naturais" }], ["Atacado", { tag: "atacado" }]],
    papelaria: [["Pedidos para eventos", { cat: "eventos" }], ["Embalagens", { cat: "embalagens" }]],
  };

  function megaHTML(loja) {
    const l = lojaBySlug[loja];
    const cats = catsOf(loja).map((c) => `<li><a href="${lojaUrl(loja, { cat: c.slug })}">${esc(c.nome)}</a></li>`).join("");
    const hi = HIGHLIGHTS[loja].map(([t, q]) => `<li><a href="${lojaUrl(loja, q)}">${esc(t)}</a></li>`).join("");
    const tiles = TILES[loja].map((s) => prodBySlug[s]).filter(Boolean)
      .map((p) => `<a class="tile" href="${prodUrl(p)}"><img src="${esc(p.imagem)}" alt="" loading="lazy"><span>${esc(p.nome)}</span></a>`).join("");
    return `<div class="mega"><div class="wrap mega-inner">
      <div><h4>Categorias</h4><ul><li><a href="${lojaUrl(loja)}">Ver tudo</a></li>${cats}</ul></div>
      <div><h4>Destaques</h4><ul>${hi}</ul></div>
      <div class="mega-tiles">${tiles}</div></div></div>`;
  }

  const soonTag = '<span class="soon-tag">Em breve</span>';

  function drawerHTML() {
    const group = (loja) => emBreve(loja)
      ? `<span class="d-link d-link--soon">${esc(lojaBySlug[loja].nome)} ${soonTag}</span>`
      : `<details><summary>${esc(lojaBySlug[loja].nome)} ${I.chev}</summary><ul>
      <li><a href="${lojaUrl(loja)}">Ver tudo</a></li>
      ${catsOf(loja).map((c) => `<li><a href="${lojaUrl(loja, { cat: c.slug })}">${esc(c.nome)}</a></li>`).join("")}</ul></details>`;
    return `<div class="drawer-head"><a class="brand" href="index.html"><img src="assets/img/brand/coral.png" alt="Coralina — início"></a>
      <button class="icon-btn" data-close-drawer aria-label="Fechar menu">${I.close}</button></div>
      <div class="drawer-body">${group("atelie")}${group("papelaria")}
      <a class="d-link" href="${lojaUrl("atelie", { tag: "oceans" })}">Coleção Oceans</a>
      <a class="d-link" href="index.html#como-funciona">Como encomendar</a>
      <a class="btn btn--block" href="${chatUrl()}" target="_blank" rel="noopener">Falar no Whatsapp</a></div>`;
  }

  function navLoja(loja, current) {
    const nome = esc(lojaBySlug[loja].nome);
    if (emBreve(loja)) return `<li><span class="nav-link nav-link--soon" aria-disabled="true">${nome} ${soonTag}</span></li>`;
    return `<li class="has-mega"><a class="nav-link" href="${lojaUrl(loja)}"${current}>${nome} ${I.chev}</a>${megaHTML(loja)}</li>`;
  }

  function renderHeader() {
    const host = $("#site-header");
    if (!host) return;
    const page = document.body.dataset.page;
    const cur = (loja) => (document.body.dataset.loja === loja ? ' aria-current="page"' : "");
    host.outerHTML = `
      <div class="topbar">Feito à mão, sob encomenda · <strong>Frete para todo Brasil (Em Breve)</strong></div>
      <header class="site-header">
        <div class="wrap bar">
          <a class="brand" href="index.html"><img src="assets/img/brand/coral.png" alt="Coralina — início" width="52" height="56"></a>
          <ul class="nav" aria-label="Principal">
            ${navLoja("atelie", cur("atelie"))}
            ${navLoja("papelaria", cur("papelaria"))}
            <li><a class="nav-link" href="${lojaUrl("atelie", { tag: "oceans" })}">Coleção Oceans</a></li>
            <li><a class="nav-link" href="index.html#como-funciona">Como encomendar</a></li>
          </ul>
          <div class="header-actions">
            <button class="icon-btn" data-open-search aria-label="Buscar produtos">${I.search}</button>
            <a class="btn btn--sm" href="${chatUrl()}" target="_blank" rel="noopener">Falar no Whatsapp</a>
            <button class="icon-btn menu-toggle" data-open-drawer aria-label="Abrir menu">${I.menu}</button>
          </div>
        </div>
      </header>
      <nav class="drawer" id="drawer" aria-label="Menu">${drawerHTML()}</nav>
      <div class="search" id="search" role="dialog" aria-modal="true" aria-label="Buscar produtos">
        <div class="search-box">
          <div class="search-field">${I.search}<input id="search-input" type="search" placeholder="Buscar produtos…" autocomplete="off" aria-label="Buscar produtos">
            <button class="icon-btn" data-close-search aria-label="Fechar busca">${I.close}</button></div>
          <div id="search-results" class="search-results" aria-live="polite"></div>
        </div>
      </div>`;
    void page;
  }

  /* ---------- rodapé ---------- */
  function renderFooter() {
    const host = $("#site-footer");
    if (!host) return;
    const ig = C.meta.instagram;
    host.outerHTML = `<footer class="site-footer"><div class="wrap">
      <div class="footer-top">
        <div class="footer-brand"><img src="assets/img/brand/coral.png" alt="Coralina"><p>Ateliê de resina e papelaria personalizada. Criando memórias com resina e papel.</p></div>
        <div><h4>Ateliê</h4><ul>${catsOf("atelie").map((c) => `<li><a href="${lojaUrl("atelie", { cat: c.slug })}">${esc(c.nome)}</a></li>`).join("")}</ul></div>
        <div><h4>Papelaria</h4><ul>${emBreve("papelaria") ? "<li><span class=\"footer-soon\">Em breve</span></li>" : catsOf("papelaria").map((c) => `<li><a href="${lojaUrl("papelaria", { cat: c.slug })}">${esc(c.nome)}</a></li>`).join("")}</ul></div>
        <div><h4>Fale com a gente</h4><ul>
          <li><a href="${esc(C.meta.link_catalogo)}" target="_blank" rel="noopener">Catálogo no WhatsApp</a></li>
          <li><a href="https://wa.me/${esc(C.meta.whatsapp)}" target="_blank" rel="noopener">Conversar no WhatsApp</a></li>
          <li><a href="https://www.instagram.com/${esc(ig.atelie)}" target="_blank" rel="noopener">Instagram Ateliê</a></li>
          <li><a href="https://www.instagram.com/${esc(ig.papelaria)}" target="_blank" rel="noopener">Instagram Papelaria</a></li></ul></div>
      </div>
      <div class="footer-bottom"><span>© ${new Date().getFullYear()} Coralina — feito com carinho.</span><span>Pedidos finalizados pelo WhatsApp</span></div>
    </div></footer>`;
  }

  /* ---------- menu mobile e busca ---------- */
  function setupInteractions() {
    const drawer = $("#drawer");
    $$("[data-open-drawer]").forEach((b) => b.addEventListener("click", () => { drawer.classList.add("open"); document.body.style.overflow = "hidden"; }));
    $$("[data-close-drawer]").forEach((b) => b.addEventListener("click", closeDrawer));
    function closeDrawer() { drawer.classList.remove("open"); document.body.style.overflow = ""; }

    const search = $("#search"), input = $("#search-input"), out = $("#search-results");
    const openSearch = () => { search.classList.add("open"); document.body.style.overflow = "hidden"; input.focus(); renderSearch(""); };
    const closeSearch = () => { search.classList.remove("open"); document.body.style.overflow = ""; };
    $$("[data-open-search]").forEach((b) => b.addEventListener("click", openSearch));
    $$("[data-close-search]").forEach((b) => b.addEventListener("click", closeSearch));
    search.addEventListener("click", (e) => { if (e.target === search) closeSearch(); });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") { closeSearch(); closeDrawer(); }
      if (e.key === "/" && !/input|textarea|select/i.test(document.activeElement.tagName)) { e.preventDefault(); openSearch(); }
    });
    const norm = (s) => String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
    function renderSearch(q) {
      q = norm(q.trim());
      if (!q) {
        out.innerHTML = `<p class="search-hint">Pesquise por produto, material ou categoria.</p><div class="chip-row">${catsOf("atelie").concat(catsOf("papelaria")).map((c) => `<a class="pill" href="${lojaUrl(c.loja, { cat: c.slug })}">${esc(c.nome)}</a>`).join("")}</div>`;
        return;
      }
      const terms = q.split(/\s+/);
      const hits = C.produtos.filter((p) => {
        const hay = norm([p.nome, p.descricao, catBySlug[p.categoria].nome, lojaBySlug[p.loja].nome, p.tags.join(" ")].join(" "));
        return terms.every((t) => hay.includes(t));
      }).slice(0, 12);
      out.innerHTML = hits.length
        ? hits.map((p) => `<a href="${prodUrl(p)}"><img src="${esc(p.imagem)}" alt="" loading="lazy"><span><strong>${esc(p.nome)}</strong><small>${esc(catBySlug[p.categoria].nome)} · ${p.preco_tipo === "encomenda" ? esc(C.meta.texto_encomenda) : esc(p.preco_exibicao)}</small></span></a>`).join("")
        : `<p class="search-hint">Nada encontrado para “${esc(q)}”. Tente outra palavra ou <a href="${esc(C.meta.link_catalogo)}" target="_blank" rel="noopener">veja o catálogo no WhatsApp</a>.</p>`;
    }
    input.addEventListener("input", () => renderSearch(input.value));

    // mega-menu acessível por teclado/toque
    $$(".has-mega > a.nav-link").forEach((a) => a.addEventListener("focus", () => a.parentElement.classList.add("open")));
    $$(".has-mega").forEach((li) => li.addEventListener("focusout", (e) => { if (!li.contains(e.relatedTarget)) li.classList.remove("open"); }));
  }

  window.Coralina = { C, $, $$, esc, I, emBreve, chatUrl, lojaBySlug, catBySlug, prodBySlug, catsOf, prodsOf, lojaUrl, prodUrl, priceHTML, buyLabel, badgesHTML, cardHTML };
  renderHeader();
  renderFooter();
  setupInteractions();
})();
