// scripts/produtos.js
export async function carregarProdutos() {
  const listaProdutos = document.getElementById("lista-produtos");
  if (!listaProdutos) return;

  try {
    const snapshot = await db.collection("produtos").get();
    const produtos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    listaProdutos.innerHTML = produtos.map(produto => `
      <div class="produto">
        <img src="${produto.imagem}" alt="${produto.nome}" />
        <h3>${produto.nome}</h3>
        <p>R$ ${produto.preco.toFixed(2)}</p>
        <button class="botao-comprar" onclick="adicionarAoCarrinho('${produto.id}', '${produto.nome}', ${produto.preco})">Comprar</button>
      </div>
    `).join('');
  } catch (e) {
    console.error("Erro ao carregar produtos:", e);
  }
}
