
import { getEl } from './dom-utils.js';
import { adicionarAoCarrinho } from './carrinho.js';

let produtoSelecionado = null;
const modal = getEl("modal");

export function configurarModal() {
  modal?.addEventListener("click", (e) => {
    if (e.target === modal) fecharModal();
  });

  window.adicionarAoCarrinho = adicionarAoCarrinho;
}

export function mostrarDetalhes(index) {
  const p = window.produtos[index];
  if (!p) return;

  produtoSelecionado = p;
  getEl("modal-titulo").textContent = p.nome;
  getEl("modal-desc").textContent = p.desc;
  getEl("modal-preco").textContent = `R$ ${p.preco.toFixed(2)}`;
  const img = getEl("modal-img");
  img.src = p.imagem;
  img.alt = p.nome;

  modal.style.display = "flex";
  document.body.style.overflow = "hidden";
}

export function fecharModal() {
  modal.style.display = "none";
  document.body.style.overflow = "auto";
}

export function getProdutoSelecionado() {
  return produtoSelecionado;
}
