import { db } from "./firebase-config.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { mostrarDetalhes } from "./modal.js";

export async function renderizarProdutos() {
  const lista = document.getElementById("lista-produtos");
  if (!lista) return;

  try {
    const snapshot = await getDocs(collection(db, "produtos"));
    const produtos = [];
    snapshot.forEach(doc => produtos.push({ id: doc.id, ...doc.data() }));

    if (!produtos.length) {
      lista.innerHTML = "<p style='text-align:center; color:#666;'>Nenhum produto disponível.</p>";
      return;
    }

    lista.innerHTML = produtos.map((p, i) => `
      <div class="produto" onclick="mostrarDetalhes(${i})">
        <img src="${p.imagem}" alt="${p.nome}" loading="lazy">
        <h3>${p.nome}</h3>
        <p>R$ ${p.preco.toFixed(2)}</p>
        <button class="botao-comprar" onclick="event.stopPropagation();mostrarDetalhes(${i})">Ver Detalhes</button>
      </div>
    `).join("");
    window.produtosGlobal = produtos;
  } catch (e) {
    console.error("Erro ao carregar produtos:", e);
    lista.innerHTML = "<p style='text-align:center; color:red;'>Erro ao carregar produtos.</p>";
  }
}
