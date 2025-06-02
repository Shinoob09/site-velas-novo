// scripts/main.js
import './firebase.js';
import { carregarProdutos } from './produtos.js';
import { configurarCarrinho } from './carrinho.js';

document.addEventListener('DOMContentLoaded', () => {
  carregarProdutos();
  configurarCarrinho();
});
