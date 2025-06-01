function getEl(id) {
  return document.getElementById(id);
}

export function mostrarDetalhes(index) {
  const p = window.produtosGlobal[index];
  if (!p) return;

  getEl("modal-titulo").textContent = p.nome;
  getEl("modal-desc").textContent = p.desc;
  getEl("modal-preco").textContent = `R$ ${p.preco.toFixed(2)}`;
  getEl("modal-img").src = p.imagem;
  getEl("modal").style.display = "block";
}

export function fecharModal() {
  getEl("modal").style.display = "none";
}

window.mostrarDetalhes = mostrarDetalhes;
window.fecharModal = fecharModal;
