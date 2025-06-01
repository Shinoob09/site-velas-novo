
import { mostrarDetalhes } from './modal.js';

export const produtos = window.produtos || [];

export function renderizarProdutos() {
  const lista = document.getElementById("lista-produtos");
  if (!lista || !produtos.length) return;

  lista.innerHTML = produtos.map((p, i) => `
    <div class="produto" onclick="window._detalhes(${i})">
      <img src="${p.imagem}" alt="${p.nome}" loading="lazy">
      <h3>${p.nome}</h3>
      <p>R$ ${p.preco.toFixed(2)}</p>
      <button class="botao-comprar" onclick="event.stopPropagation();window._detalhes(${i})">Ver Detalhes</button>
    </div>
  `).join('');

  window._detalhes = mostrarDetalhes;
}
