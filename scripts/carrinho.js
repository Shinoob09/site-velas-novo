// scripts/carrinho.js
export function configurarCarrinho() {
  const carrinho = JSON.parse(localStorage.getItem("carrinho")) || {};
  const lista = document.getElementById("itens-carrinho");
  const totalDisplay = document.getElementById("total-carrinho");
  const contador = document.getElementById("contador-carrinho");

  function renderizarCarrinho() {
    lista.innerHTML = "";
    let total = 0;
    let count = 0;

    Object.values(carrinho).forEach(item => {
      const li = document.createElement("li");
      li.innerHTML = \`
        <div><strong>\${item.nome}</strong><small> R$ \${item.preco.toFixed(2)} × \${item.quantidade}</small></div>
        <div>
          <button onclick="alterarQuantidade('\${item.id}', -1)">−</button>
          <button onclick="alterarQuantidade('\${item.id}', 1)">+</button>
        </div>
      \`;
      lista.appendChild(li);
      total += item.preco * item.quantidade;
      count += item.quantidade;
    });

    totalDisplay.textContent = total.toFixed(2);
    contador.textContent = count;
  }

  window.alterarQuantidade = (id, delta) => {
    if (!carrinho[id]) return;
    carrinho[id].quantidade += delta;
    if (carrinho[id].quantidade <= 0) delete carrinho[id];
    localStorage.setItem("carrinho", JSON.stringify(carrinho));
    renderizarCarrinho();
  };

  window.finalizarCompra = () => {
    if (Object.keys(carrinho).length === 0) return alert("Carrinho vazio!");
    const nome = prompt("Nome:");
    const endereco = prompt("Endereço:");
    const telefone = prompt("Telefone:");

    if (!nome || !endereco || !telefone) return alert("Preencha todos os campos!");

    const total = Object.values(carrinho).reduce((acc, item) => acc + item.preco * item.quantidade, 0).toFixed(2);
    const pedido = {
      nome, endereco, telefone, total,
      itens: Object.values(carrinho).map(i => \`\${i.quantidade}x \${i.nome} (R$\${i.preco.toFixed(2)})\`).join(", ")
    };

    db.collection("pedidos").add({ ...pedido, data: new Date().toISOString() });

    const mensagem = \`
🧾 *Novo Pedido VerdiLume*
👤 *Nome:* \${nome}
🏠 *Endereço:* \${endereco}
📞 *Telefone:* \${telefone}
📦 *Itens:* \${pedido.itens}
💰 *Total:* R$\${total}
    \`;

    const url = \`https://api.telegram.org/bot7635965015:AAGcOEt7lMgxmlG8C8FxPhCh2vDMnIk5Rpg/sendMessage?chat_id=5688730032&text=\${encodeURIComponent(mensagem)}&parse_mode=Markdown\`;
    fetch(url).catch(console.error);

    localStorage.removeItem("carrinho");
    window.location.href = "confirmacao.html";
  };

  renderizarCarrinho();
}
