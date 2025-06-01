import { getEl } from './dom-utils.js';

let produtoSelecionado = null;

export function mostrarDetalhes(index) {
  const p = window.produtosGlobal[index];
  if (!p) return;

  produtoSelecionado = p;
  getEl("modal-titulo").textContent = p.nome;
  getEl("modal-desc").textContent = p.desc;
  getEl("modal-preco").textContent = `R$ ${p.preco.toFixed(2)}`;
  getEl("modal-img").src = p.img;
  getEl("modal").style.display = "block";
}

// Expor a função globalmente para onclick funcionar
window.mostrarDetalhes = mostrarDetalhes;
