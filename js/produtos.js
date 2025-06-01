import { exibirModalProduto } from './modal.js';

export async function renderizarProdutos() {
  const container = document.getElementById("produtos-container");
  container.innerHTML = "";

  const snapshot = await firebase.firestore().collection("produtos").get();
  snapshot.forEach(doc => {
    const data = doc.data();
    const card = document.createElement("div");
    card.className = "produto-card";

    card.innerHTML = `
      <img src="${data.imagem}" alt="${data.nome}">
      <h3>${data.nome}</h3>
      <p>R$ ${data.preco.toFixed(2)}</p>
      <button class="btn-detalhes" data-id="${doc.id}">Ver Detalhes</button>
    `;

    container.appendChild(card);
  });

  // Configura o evento de detalhes
  document.querySelectorAll(".btn-detalhes").forEach(btn => {
    btn.addEventListener("click", async () => {
      const id = btn.getAttribute("data-id");
      const doc = await firebase.firestore().collection("produtos").doc(id).get();
      exibirModalProduto(doc.data());
    });
  });
}
