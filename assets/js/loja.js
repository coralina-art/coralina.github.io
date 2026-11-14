/* Coralina — página de coleção (atelie.html / papelaria.html).
   Filtros e ordenação ficam na URL (?cat=&tag=&preco=&ordem=), então dá para compartilhar o link. */
(function () {
  "use strict";
  const { C, $, $$, esc, I, lojaBySlug, catBySlug, catsOf, prodsOf, lojaUrl, cardHTML } = window.Coralina;
  const loja = document.body.dataset.loja;
  const L = lojaBySlug[loja];
  const params = new URLSearchParams(location.search);
  const state = {
    cat: catBySlug[params.get("cat")] && catBySlug[params.get("cat")].loja === loja ? params.get("cat") : "",
    tags: (params.get("tag") || "").split(",").filter((t) => C.tags[t]),
    preco: ["com", "encomenda"].includes(params.get("preco")) ? params.get("preco") : "",
    ordem: ["menor", "maior", "nome"].includes(params.get("ordem")) ? params.get("ordem") : "",
  };

  const all = prodsOf(loja);
  const tagsAvailable = Object.keys(C.tags).filter((t) => all.some((p) => p.tags.includes(t)));

  function filtered() {
    let list = all.filter((p) =>
      (!state.cat || p.categoria === state.cat) &&
      state.tags.every((t) => p.tags.includes(t)) &&
      (!state.preco || (state.preco === "encomenda") === (p.preco_tipo === "encomenda")));
    const price = (p) => (p.preco == null ? Infinity : p.preco);
    if (state.ordem === "menor") list = list.slice().sort((a, b) => price(a) - price(b));
    if (state.ordem === "maior") list = list.slice().sort((a, b) => (b.preco == null ? -1 : b.preco) - (a.preco == null ? -1 : a.preco));
    if (state.ordem === "nome") list = list.slice().sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
    return list;
  }

  function syncUrl() {
    const q = new URLSearchParams();
    if (state.cat) q.set("cat", state.cat);
    if (state.tags.length) q.set("tag", state.tags.join(","));
    if (state.preco) q.set("preco", state.preco);
    if (state.ordem) q.set("ordem", state.ordem);
    history.replaceState(null, "", location.pathname + (q.toString() ? "?" + q : ""));
  }

  function renderHead() {
    const cat = state.cat && catBySlug[state.cat];
    const tag = state.tags.length === 1 ? C.tags[state.tags[0]] : null;
    const title = cat ? cat.nome : tag && !state.cat ? tag.nome : L.titulo;
    const intro = cat ? cat.descricao : tag && !state.cat ? (tag.texto || L.descricao) : L.descricao;
    document.title = cat || (tag && !state.cat) ? `${title} — ${L.titulo}` : $("#coll-title").dataset.titulo || L.titulo;
    const crumbs = [["Início", "index.html"], [L.nome, cat ? lojaUrl(loja) : null]];
    if (cat) crumbs.push([cat.nome, null]);
    $("#breadcrumb").innerHTML = "<ol>" + crumbs.map(([t, h]) => `<li>${h ? `<a href="${h}">${esc(t)}</a>` : `<span aria-current="page">${esc(t)}</span>`}</li>`).join("") + "</ol>";
    $("#coll-title").textContent = title;
    $("#coll-intro").textContent = intro;
    const pill = (label, cat, n) => `<a class="pill" href="${lojaUrl(loja, cat ? { cat } : {})}" ${(state.cat || "") === (cat || "") ? 'aria-current="true"' : ""} data-cat="${esc(cat || "")}">${esc(label)} <small>${n}</small></a>`;
    $("#pills").innerHTML = pill("Tudo", "", all.length) + catsOf(loja).map((c) => pill(c.nome, c.slug, prodsOf(loja, c.slug).length)).join("");
  }

  function renderGrid() {
    const list = filtered();
    $("#count").textContent = `${list.length} ${list.length === 1 ? "produto" : "produtos"}`;
    $("#grid").innerHTML = list.length ? list.map(cardHTML).join("")
      : `<div class="empty" style="grid-column:1/-1"><h2>Nada por aqui</h2><p>Nenhum produto com esses filtros. <button class="link-arrow" style="background:none;border:0;padding:0" data-clear>Limpar filtros</button></p></div>`;
    const n = state.tags.length + (state.preco ? 1 : 0);
    const badge = $("#filter-n");
    badge.textContent = n; badge.hidden = !n;
    const clear = $("[data-clear]");
    if (clear) clear.addEventListener("click", clearFilters);
  }

  function renderFilters() {
    $("#f-tags").innerHTML = tagsAvailable.map((t) => `<label class="check"><input type="checkbox" name="tag" value="${t}" ${state.tags.includes(t) ? "checked" : ""}>${esc(C.tags[t].nome)}</label>`).join("");
    $$("input[name=preco]").forEach((r) => (r.checked = r.value === state.preco));
    $("#sort").value = state.ordem;
  }

  function update() { syncUrl(); renderHead(); renderGrid(); }
  function clearFilters() { state.tags = []; state.preco = ""; renderFilters(); update(); }

  /* eventos */
  $("#pills").addEventListener("click", (e) => {
    const a = e.target.closest("a[data-cat]");
    if (!a) return;
    e.preventDefault();
    state.cat = a.dataset.cat;
    update();
  });
  $("#f-tags").addEventListener("change", () => { state.tags = $$("input[name=tag]:checked").map((i) => i.value); update(); });
  $$("input[name=preco]").forEach((r) => r.addEventListener("change", () => { state.preco = r.value; update(); }));
  $("#sort").addEventListener("change", (e) => { state.ordem = e.target.value; update(); });
  $("#f-clear").addEventListener("click", clearFilters);
  const panel = $("#filters"), scrim = $("#scrim");
  const setPanel = (open) => { panel.classList.toggle("open", open); scrim.classList.toggle("open", open); };
  $("#filter-open").addEventListener("click", () => setPanel(true));
  $$("[data-close-filters]").forEach((b) => b.addEventListener("click", () => setPanel(false)));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") setPanel(false); });

  $("#filter-open").insertAdjacentHTML("afterbegin", I.filter);
  renderFilters();
  update();
})();
