// scripts/carrinho.js
import { z } from 'https://cdn.jsdelivr.net/npm/zod@3.21.4/dist/zod.esm.min.js';

const schema = z.object({
  nome: z.string().min(3),
  endereco: z.string().min(5),
  telefone: z.string().min(10),
});

let carrinho = JSON.parse(localStorage.getItem("carrinho")) || {};

function salvarCarrinho() {
  localStorage.setItem("carrinho", JSON.stringify(carrinho));
  renderizarCarrinho();
}

export function configurarCarrinho() {
  renderizarCarrinho();
}

function renderizarCarrinho() {
  const lista = document.getElementById("itens-carrinho");
  const totalDisplay = document.getElementById("total-carrinho");
  const contador = document.getElementById("contador-carrinho");
  lista.innerHTML = "";
  let total = 0, count = 0;
  Object.values(carrinho).forEach(item => {
    const li = document.createElement("li");
    li.innerHTML = `
      <div><strong>${item.nome}</strong><small> R$ ${item.preco.toFixed(2)} × ${item.quantidade}</small></div>
      <div>
        <button onclick="alterarQuantidade('${item.id}', -1)">−</button>
        <button onclick="alterarQuantidade('${item.id}', 1)">+</button>
      </div>
    `;
    lista.appendChild(li);
    total += item.preco * item.quantidade;
    count += item.quantidade;
  });
  totalDisplay.textContent = total.toFixed(2);
  contador.textContent = count;
}

window.adicionarAoCarrinho = (id, nome, preco) => {
  if (carrinho[id]) carrinho[id].quantidade++;
  else carrinho[id] = { id, nome, preco, quantidade: 1 };
  salvarCarrinho();
};

window.alterarQuantidade = (id, delta) => {
  if (!carrinho[id]) return;
  carrinho[id].quantidade += delta;
  if (carrinho[id].quantidade <= 0) delete carrinho[id];
  salvarCarrinho();
};

window.abrirFormulario = () => {
  document.getElementById("modal-form").style.display = "flex";
};

window.fecharFormulario = () => {
  document.getElementById("modal-form").style.display = "none";
};

document.getElementById("formulario-pagamento")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const nome = document.getElementById("input-nome").value.trim();
  const endereco = document.getElementById("input-endereco").value.trim();
  const telefone = document.getElementById("input-telefone").value.trim();
  const parsed = schema.safeParse({ nome, endereco, telefone });
  if (!parsed.success) {
    alert("Preencha corretamente os campos!");
    return;
  }
  const total = Object.values(carrinho).reduce((acc, i) => acc + i.preco * i.quantidade, 0).toFixed(2);
  try {
    // Gerar PIX via PixGerar
    const response = await fetch("https://api-pixgerar.onrender.com/api/qrcode", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nome,
        valor: total,
        chave: "19994717011",
        cidade: "Campinas",
        infoAdicional: "VerdiLume"
      })
    });
    const data = await response.json();
    if (!data.qrcode || !data.pix) throw new Error("Erro ao gerar PIX");
    document.getElementById("qrcode-img").src = data.qrcode;
    document.getElementById("pix-copia").textContent = data.pix;
    document.getElementById("area-pix").style.display = "block";
  } catch (err) {
    console.error(err);
    alert("Falha ao gerar PIX.");
  }
});

window.confirmarPagamento = async () => {
  const nome = document.getElementById("input-nome").value.trim();
  const endereco = document.getElementById("input-endereco").value.trim();
  const telefone = document.getElementById("input-telefone").value.trim();
  const total = Object.values(carrinho).reduce((acc, i) => acc + i.preco * i.quantidade, 0).toFixed(2);
  const itens = Object.values(carrinho).map(i => `${i.quantidade}x ${i.nome} (R$${i.preco.toFixed(2)})`).join(", ");
  const pedidoObj = { nome, endereco, telefone, itens, total, data: new Date().toISOString() };
  try {
    // Salvar no Firestore
    await db.collection("pedidos").add(pedidoObj);
    // Enviar Telegram
    const mensagem = `
🧾 *Novo Pedido VerdiLume*
👤 *Nome:* ${nome}
🏠 *Endereço:* ${endereco}
📞 *Telefone:* ${telefone}
📦 *Itens:* ${itens}
💰 *Total:* R$${total}
    `;
    const url = `https://api.telegram.org/bot7635965015:AAGcOEt7lMgxmlG8C8FxPhCh2vDMnIk5Rpg/sendMessage?chat_id=5688730032&text=${encodeURIComponent(mensagem)}&parse_mode=Markdown`;
    fetch(url).catch(console.error);
    // Limpar carrinho e redirecionar
    localStorage.removeItem("carrinho");
    window.location.href = "confirmacao.html";
  } catch (err) {
    console.error(err);
    alert("Erro ao processar o pedido.");
  }
};
