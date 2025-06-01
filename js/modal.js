function getEl(id) {
  return document.getElementById(id);
}

export function mostrarDetalhes(index) {
  const p = window.produtosGlobal[index];
  if (!p) return;

  getEl("modal-titulo").textContent = p.nome;
  getEl("modal-desc").textContent = p.desc;
  getEl("modal-preco").textContent = `R$ ${p.preco.toFixed(2)}`;
  getEl("modal-img").src = p.img;
  getEl("modal-img").alt = p.nome;
  getEl("modal").style.display = "block";
}

export function fecharModal() {
  getEl("modal").style.display = "none";
}

// Tornar global para uso em onclick HTML
window.mostrarDetalhes = mostrarDetalhes;
window.fecharModal = fecharModal;
