export function exibirModalProduto(produto) {
  const modal = document.getElementById("modal-detalhes");
  modal.innerHTML = `
    <div class="modal-content">
      <span class="fechar-modal">&times;</span>
      <h2>${produto.nome}</h2>
      <img src="${produto.imagem}" alt="${produto.nome}">
      <p>${produto.desc}</p>
      <p><strong>Preço:</strong> R$ ${produto.preco.toFixed(2)}</p>
      <button onclick="adicionarCarrinhoDireto('${produto.nome}', ${produto.preco})">
        Adicionar ao Carrinho
      </button>
    </div>
  `;
  modal.style.display = "block";

  modal.querySelector(".fechar-modal").onclick = () => {
    modal.style.display = "none";
  };
}

// opcional, pode estar no carrinho.js
window.adicionarCarrinhoDireto = (nome, preco) => {
  const item = {
    nome,
    preco,
    quantidade: 1
  };
  const carrinho = JSON.parse(localStorage.getItem("carrinho")) || {};
  carrinho[nome] = item;
  localStorage.setItem("carrinho", JSON.stringify(carrinho));
  alert("Item adicionado ao carrinho!");
};
