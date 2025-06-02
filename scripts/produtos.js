// scripts/produtos.js
export async function carregarProdutos() {
  const listaProdutos = document.getElementById("lista-produtos");
  if (!listaProdutos) return;
  try {
    const snapshot = await db.collection("produtos").get();
    const produtos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    listaProdutos.innerHTML = produtos
      .map(prod => `
        <div class="produto">
          <img src="${prod.imagem}" alt="${prod.nome}" />
          <h3>${prod.nome}</h3>
          <p>R$ ${prod.preco.toFixed(2)}</p>
          <button onclick="adicionarAoCarrinho('${prod.id}', '${prod.nome}', ${prod.preco})">Comprar</button>
        </div>
      `)
      .join("");
  } catch (e) {
    console.error("Erro ao carregar produtos:", e);
  }
}
