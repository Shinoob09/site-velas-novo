import { db } from "./firebase-config.js"; // deve ter o getFirestore(app)
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { mostrarDetalhes } from "./modal.js";

export async function renderizarProdutos() {
  const container = document.getElementById("lista-produtos");
  container.innerHTML = "";

  try {
    const querySnapshot = await getDocs(collection(db, "produtos"));
    const produtos = [];

    querySnapshot.forEach((doc, index) => {
      const data = doc.data();
      produtos.push(data);

      const card = document.createElement("div");
      card.className = "produto";

      card.innerHTML = `
        <img src="${data.imagem}" alt="${data.nome}" loading="lazy">
        <h3>${data.nome}</h3>
        <p>R$ ${data.preco.toFixed(2)}</p>
        <button class="botao-comprar" onclick="mostrarDetalhes(${index})">Ver Detalhes</button>
      `;

      container.appendChild(card);
    });

    // Salva os produtos globalmente para uso no modal
    window.produtosGlobal = produtos;
  } catch (err) {
    console.error("Erro ao carregar produtos do Firestore:", err);
    container.innerHTML = "<p>Erro ao carregar produtos.</p>";
  }
}
