/* Coralina — página de produto (produto.html?p=<slug>). */
(function () {
  "use strict";
  const { C, $, esc, I, lojaBySlug, catBySlug, prodBySlug, prodsOf, lojaUrl, priceHTML, buyLabel, cardHTML } = window.Coralina;
  const root = $("#product-root");
  const slug = new URLSearchParams(location.search).get("p");
  const p = prodBySlug[slug];

  if (!p) {
    document.title = "Produto não encontrado — Coralina";
    root.innerHTML = `<div class="empty"><h2>Não encontramos esse produto</h2><p>Ele pode ter saído do catálogo.</p>
      <a class="btn" href="atelie.html">Ver o Ateliê</a></div>`;
    return;
  }

  const loja = lojaBySlug[p.loja];
  const cat = catBySlug[p.categoria];
  document.body.classList.add("theme-" + p.loja);
  document.title = `${p.nome} — Coralina ${loja.nome}`;
  const setMeta = (sel, val) => { const m = $(sel); if (m) m.setAttribute("content", val); };
  setMeta('meta[name="description"]', p.descricao);
  setMeta('meta[property="og:title"]', `${p.nome} — Coralina`);
  setMeta('meta[property="og:description"]', p.descricao);

  const order = p.preco_tipo === "encomenda";
  const badges = []
    .concat(p.tags.map((t) => `<span class="badge ${t === "oceans" ? "badge--oceans" : ""}">${esc(C.tags[t].nome)}</span>`))
    .concat(p.sazonal ? ['<span class="badge badge--sazonal">Sazonal</span>'] : []).join("");

  const opts = [];
  if (p.preco_tipo === "fixo" && (p.opcoes_de_preco.length || p.atacado)) {
    const first = p.opcoes_de_preco[0];
    const base = first && /frente e verso/i.test(first.rotulo) ? "Somente frente" : "Unidade";
    opts.push(`<li><span>${base}</span><span>${esc(p.preco_exibicao)}</span></li>`);
  }
  p.opcoes_de_preco.forEach((o) => opts.push(`<li><span>${esc(o.rotulo)}</span><span>${esc(o.preco_exibicao)}</span></li>`));
  if (p.atacado) opts.push(`<li><span>${esc(p.atacado.texto.split(":")[0])}</span><span>${esc(p.atacado.texto.split(":")[1] || "").trim()}</span></li>`);
  if (p.quantidade_minima) opts.push(`<li><span>Quantidade mínima</span><span>${p.quantidade_minima} unidades</span></li>`);
  const optsTitle = p.opcoes_de_preco.some((o) => /página|cm/.test(o.rotulo)) ? "Escolha o modelo" : "Opções e condições";

  const specs = [["Tamanho", p.tamanho], ["Personalização", p.personalizacao]].filter(([, v]) => v);
  const oceans = p.tags.includes("oceans") ? C.tags.oceans.texto : "";

  const related = prodsOf(p.loja, p.categoria).filter((x) => x.slug !== p.slug).slice(0, 4);
  const fill = related.length < 4
    ? prodsOf(p.loja).filter((x) => x.categoria !== p.categoria && !related.includes(x)).slice(0, 4 - related.length) : [];

  root.innerHTML = `
    <nav class="breadcrumb" aria-label="Você está em"><ol>
      <li><a href="index.html">Início</a></li><li><a href="${lojaUrl(p.loja)}">${esc(loja.nome)}</a></li>
      <li><a href="${lojaUrl(p.loja, { cat: cat.slug })}">${esc(cat.nome)}</a></li><li><span aria-current="page">${esc(p.nome)}</span></li></ol></nav>
    <div class="product">
      <div class="gallery">
        <button class="gallery-main" data-zoom aria-label="Ampliar imagem de ${esc(p.nome)}">
          <img src="${esc(p.imagem)}" alt="${esc(p.nome)}" width="1000" height="1250"><span class="gallery-zoom">Ampliar</span>
        </button>
      </div>
      <div class="pinfo">
        <a class="eyebrow" href="${lojaUrl(p.loja, { cat: cat.slug })}" style="text-decoration:none">${esc(loja.nome)} · ${esc(cat.nome)}</a>
        <h1>${esc(p.nome)}</h1>
        ${badges ? `<div class="badges">${badges}</div>` : ""}
        <p class="pprice">${priceHTML(p)}</p>
        <p class="pdesc">${esc(p.descricao)}</p>
        ${opts.length ? `<div class="options"><h3>${optsTitle}</h3><ul>${opts.join("")}</ul></div>` : ""}
        ${specs.length ? `<dl class="specs">${specs.map(([k, v]) => `<dt>${k}</dt><dd>${esc(v)}</dd>`).join("")}</dl>` : ""}
        <div class="buy">
          <a class="btn" href="${esc(p.link_compra)}" target="_blank" rel="noopener">${buyLabel(p)}</a>
          <a class="btn btn--outline" href="${esc(p.link_compra_mensagem)}" target="_blank" rel="noopener">Perguntar sobre este produto</a>
        </div>
        <p class="note">${order ? "Este produto é feito sob encomenda: chame no WhatsApp para combinar valores e prazo." : "O pedido é finalizado pelo WhatsApp, onde combinamos detalhes e prazo."}</p>
        <div class="accordion">
          <details open><summary>Como encomendar</summary><div class="acc-body"><ol>
            <li>Clique em “${buyLabel(p)}” e conte o que você quer.</li>
            <li>Combinamos personalização, valores e prazo.</li>
            <li>Produzimos com carinho e entregamos a você.</li></ol></div></details>
          ${oceans ? `<details><summary>Sobre a Coleção Oceans</summary><div class="acc-body">${esc(oceans)}</div></details>` : ""}
        </div>
      </div>
    </div>
    ${related.length + fill.length ? `<section class="section" style="padding-top:2rem"><div class="section-head"><h2>Você também pode gostar</h2></div>
      <div class="grid" style="padding-top:0">${related.concat(fill).map(cardHTML).join("")}</div></section>` : ""}`;

  // lightbox
  const lb = $("#lightbox");
  $("[data-zoom]").addEventListener("click", () => { $("img", lb).src = p.imagem; $("img", lb).alt = p.nome; lb.classList.add("open"); });
  lb.addEventListener("click", () => lb.classList.remove("open"));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") lb.classList.remove("open"); });
})();
