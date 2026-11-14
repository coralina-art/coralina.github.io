# Site Coralina

Site estático (HTML + CSS + JS puro, sem build) hospedado no GitHub Pages — domínio em `CNAME`.
Os produtos vêm todos de **um arquivo de dados**; as páginas só os exibem.

## Estrutura

```
index.html          Home
atelie.html         Loja do Ateliê (resina)        → atelie.html?cat=chaveiros
papelaria.html      Loja da Papelaria              → papelaria.html?cat=eventos
produto.html        Página de produto              → produto.html?p=<slug>
data/
  catalogo.js       ★ TODOS os produtos, categorias e textos (edite aqui)
assets/
  css/style.css     Estilos. Cores e fontes ficam nas variáveis do topo (:root)
  js/               layout.js (menu, busca, rodapé) · home.js · loja.js · produto.js
  img/
    brand/          coral.png, coral@3x.png (logo, só o coral) e favicon.png
    produtos/
      atelie/<categoria>/<slug>.jpg
      papelaria/<categoria>/<slug>.jpg
```

**Papelaria “Em breve”:** a loja está desativada pela linha `"em_breve": true` da Papelaria em
`data/catalogo.js`. Enquanto ela existir, os produtos/categorias da Papelaria somem do menu, busca e home,
e `papelaria.html` mostra a página “Em breve”. Para reativar, apague essa linha (e restaure o conteúdo
de `papelaria.html` a partir do `atelie.html`, trocando `atelie` por `papelaria`).

Fluxo de compra: todo botão “Quero Encomendar” abre o catálogo do WhatsApp
(`meta.link_catalogo` em `data/catalogo.js`). Em cada produto há também um link
“Perguntar sobre este produto” com mensagem pronta (`link_compra_mensagem`).

## Adicionar um produto

1. Coloque a foto em `assets/img/produtos/<loja>/<categoria>/<slug>.jpg` (proporção 4:5, ex.: 1200×1500).
2. Em `data/catalogo.js`, dentro de `"produtos"`, copie um produto parecido e ajuste:

```js
{
 "slug": "chaveiro-novo",            // único, sem acento/espaço; é o nome do arquivo da foto
 "nome": "Chaveiro Novo",
 "descricao": "Texto curto do produto.",
 "tamanho": "4 cm",                  // ou null
 "personalizacao": "Nome ou foto",   // ou null
 "tags": ["oceans"],                 // oceans | flores-naturais | atacado  (ou [])
 "sazonal": false,
 "preco_tipo": "fixo",               // fixo | a_partir_de | encomenda
 "preco": 29.99,                     // null se for encomenda
 "preco_exibicao": "R$ 29,99",       // "Faça sua encomenda" se for encomenda
 "opcoes_de_preco": [ { "rotulo": "Frente e verso", "preco": 34.99, "preco_exibicao": "R$ 34,99" } ],
 "atacado": null,                    // ou { "preco": 24.99, "texto": "Acima de 10 unidades: R$ 24,99 cada" }
 "quantidade_minima": null,
 "link_compra": "https://wa.me/c/558299960787",
 "link_compra_mensagem": "https://wa.me/558299960787?text=Ol%C3%A1!%20Vim%20pelo%20site%20e%20quero%20encomendar%3A%20Chaveiro%20Novo.",
 "loja": "atelie",                   // atelie | papelaria
 "categoria": "chaveiros",           // slug de uma categoria da mesma loja
 "imagem": "assets/img/produtos/atelie/chaveiros/chaveiro-novo.jpg",
 "destaque": false                   // true = aparece em “Destaques” na home
}
```

## Outras alterações

- **Preço sem valor** → use `"preco_tipo": "encomenda"`, `"preco": null`, `"preco_exibicao": "Faça sua encomenda"`.
- **Nova categoria** → adicione em `"categorias"` (`slug`, `loja`, `nome`, `descricao`).
- **Cores e fontes** → variáveis no início de `assets/css/style.css`.
- **Produtos da home “Destaques”** → campo `"destaque": true`.

## Testar localmente

```
python -m http.server 8000
```
e abra http://localhost:8000 (abrir o `index.html` direto também funciona).

## Planilha

A planilha de origem dos dados (`produtos-site.xlsx`) fica em
`../catalog-coralina-atelie-papelaria-personalizada/`. O site não lê a planilha:
se ela for atualizada, o `data/catalogo.js` precisa ser atualizado também.
