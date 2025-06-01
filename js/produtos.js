import { db } from "./firebase-config.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

export async function renderizarProdutos() {
  const container = document.getElementById("lista-produtos");
  const querySnapshot = await getDocs(collection(db, "produtos"));
  const produtos = [];

  querySnapshot.forEach((doc) => {
    const data = doc.data();
    produtos.push(data);

    const card = document.createElement("div");
    card.className = "produto";
    card.innerHTML = `
      <img src="${data.imagem}" alt="${data.nome}" loading="lazy">
      <h3>${data.nome}</h3>
      <p>R$ ${data.preco.toFixed(2)}</p>
      <button class="botao-comprar" onclick="mostrarDetalhes(${produtos.length - 1})">Ver Detalhes</button>
    `;
    container.appendChild(card);
  });

  window.produtosGlobal = produtos;
}
