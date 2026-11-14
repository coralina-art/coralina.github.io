/* Coralina — seções dinâmicas da home (vêm de data/catalogo.js). */
(function () {
  "use strict";
  const { C, $, esc, I, emBreve, catsOf, prodsOf, lojaUrl, prodUrl, prodBySlug, cardHTML } = window.Coralina;

  // adesivos do hero
  const st = (slug, cls) => (prodBySlug[slug] ? `<img class="sticker ${cls}" src="${esc(prodBySlug[slug].imagem)}" alt="">` : "");
  $("#hero-stickers").innerHTML = st("bandeja-florescer", "st1") + st("chaveiro-inicial-maresia", "st2");

  // miniaturas dos cards de loja
  ["atelie", "papelaria"].forEach((loja) => {
    const el = $("#thumbs-" + loja);
    if (!el || emBreve(loja)) return;
    const pick = { atelie: ["kit-encanto", "eternizacao-de-flores-g", "caneta-recarregavel-floral"], papelaria: ["convites", "caixa-cenario", "sacolas-personalizadas"] }[loja];
    el.innerHTML = pick.map((s) => prodBySlug[s]).filter(Boolean).map((p) => `<img src="${esc(p.imagem)}" alt="" loading="lazy">`).join("");
  });

  // destaques
  $("#destaques").innerHTML = C.produtos.filter((p) => p.destaque).map(cardHTML).join("");

  // categorias
  $("#categorias").innerHTML = C.categorias.map((c) => {
    const list = prodsOf(c.loja, c.slug);
    const lojaNome = C.lojas.find((l) => l.slug === c.loja).nome;
    return `<a class="cat-card" href="${lojaUrl(c.loja, { cat: c.slug })}"><img src="${esc(list[0].imagem)}" alt="" loading="lazy">
      <strong>${esc(c.nome)}</strong><small>${esc(lojaNome)} · ${list.length} ${list.length === 1 ? "item" : "itens"}</small></a>`;
  }).join("");

  // coleção Oceans
  const oc = C.produtos.filter((p) => p.tags.includes("oceans")).slice(0, 6);
  $("#oceans-items").innerHTML = oc.map((p) => `<a href="${prodUrl(p)}"><img src="${esc(p.imagem)}" alt="" loading="lazy"><span>${esc(p.nome)}</span></a>`).join("");
  $("#oceans-text").textContent = C.tags.oceans.texto;
  $("#oceans-link").href = lojaUrl("atelie", { tag: "oceans" });
})();
