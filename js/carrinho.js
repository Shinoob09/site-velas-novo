
import { getEl } from './dom-utils.js';
import { fecharModal, getProdutoSelecionado } from './modal.js';

let carrinhoAtual = {};

export function inicializarCarrinho() {
  try {
    const salvo = localStorage.getItem("carrinho");
    carrinhoAtual = salvo ? JSON.parse(salvo) : {};
  } catch (e) {
    console.warn("Erro ao carregar carrinho:", e);
    carrinhoAtual = {};
  }

  atualizarCarrinho();

  const carrinho = getEl("carrinho");
  document.addEventListener('click', (e) => {
    if (carrinho?.style.display === "block" &&
        !e.target.closest(".carrinho") &&
        !e.target.closest(".carrinho-icon")) {
      carrinho.style.display = "none";
    }
  });
}

export function adicionarAoCarrinho() {
  const produto = getProdutoSelecionado();
  if (!produto) return;
  const { id } = produto;

  if (carrinhoAtual[id]) {
    carrinhoAtual[id].quantidade++;
  } else {
    carrinhoAtual[id] = { ...produto, quantidade: 1 };
  }

  document.querySelector(".carrinho-icon")?.classList.add("pulse");
  setTimeout(() => {
    document.querySelector(".carrinho-icon")?.classList.remove("pulse");
  }, 300);

  localStorage.setItem("carrinho", JSON.stringify(carrinhoAtual));
  atualizarCarrinho();
  fecharModal();
}

function atualizarCarrinho() {
  const itens = getEl("itens-carrinho");
  const contador = getEl("contador-carrinho");
  const totalElem = getEl("total-carrinho");
  const carrinho = getEl("carrinho");

  if (!itens || !contador || !totalElem) return;

  itens.innerHTML = "";
  let total = 0;
  let count = 0;

  for (const id in carrinhoAtual) {
    const item = carrinhoAtual[id];
    const li = document.createElement("li");
    li.innerHTML = `
      <div>
        <strong>${item.nome}</strong>
        <small>R$ ${item.preco.toFixed(2)} × ${item.quantidade}</small>
      </div>
      <div>
        <button onclick="window.alterarQtd(${id}, -1)">−</button>
        <button onclick="window.alterarQtd(${id}, 1)">+</button>
        <button onclick="window.removerItem(${id})">×</button>
      </div>
    `;
    itens.appendChild(li);
    total += item.preco * item.quantidade;
    count += item.quantidade;
  }

  contador.textContent = count;
  totalElem.textContent = total.toFixed(2);
  if (count === 0 && carrinho.style.display === "block") carrinho.style.display = "none";
}

window.alterarQtd = (id, delta) => {
  const item = carrinhoAtual[id];
  if (!item) return;

  item.quantidade += delta;
  if (item.quantidade <= 0) delete carrinhoAtual[id];

  localStorage.setItem("carrinho", JSON.stringify(carrinhoAtual));
  atualizarCarrinho();
};

window.removerItem = (id) => {
  delete carrinhoAtual[id];
  localStorage.setItem("carrinho", JSON.stringify(carrinhoAtual));
  atualizarCarrinho();
};

window.toggleCarrinho = () => {
  const carrinho = getEl("carrinho");
  if (Object.keys(carrinhoAtual).length === 0) {
    carrinho.style.display = "none";
    alert("Seu carrinho está vazio!");
    return;
  }
  carrinho.style.display = carrinho.style.display === "block" ? "none" : "block";
};

export function getCarrinhoAtual() {
  return carrinhoAtual;
}

export function limparCarrinho() {
  carrinhoAtual = {};
  localStorage.removeItem("carrinho");
  atualizarCarrinho();
}
