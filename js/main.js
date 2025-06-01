
import { inicializarCarrinho } from './carrinho.js';
import { renderizarProdutos } from './produtos.js';
import { configurarModal } from './modal.js';
import { configurarPedido } from './pedido.js';

document.addEventListener('DOMContentLoaded', async () => {
  await renderizarProdutos();
  inicializarCarrinho();
  configurarModal();
  configurarPedido();
});
