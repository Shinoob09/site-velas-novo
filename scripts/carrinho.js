// scripts/carrinho.js
import { z } from 'https://cdn.skypack.dev/zod';

const schema = z.object({
  nome: z.string().min(3),
  endereco: z.string().min(5),
  telefone: z.string().min(10),
});

let carrinho = JSON.parse(localStorage.getItem("carrinho")) || {};

function renderizarCarrinho() {
  // Pega referências ao DOM (agora obrigatoriamente só após DOMContentLoaded)
  const lista = document.getElementById("itens-carrinho");
  const totalDisplay = document.getElementById("total-carrinho");
  const contador = document.getElementById("contador-carrinho");

  // Se algum destes retornar null, significa que o HTML não definiu o id corretamente
  if (!lista || !totalDisplay || !contador) {
    console.error("Elementos do carrinho não encontrados no DOM!");
    return;
  }

  lista.innerHTML = "";
  let total = 0;
  let count = 0;

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

function salvarCarrinho() {
  localStorage.setItem("carrinho", JSON.stringify(carrinho));
  renderizarCarrinho();
}

window.adicionarAoCarrinho = (id, nome, preco) => {
  if (carrinho[id]) {
    carrinho[id].quantidade++;
  } else {
    carrinho[id] = { id, nome, preco, quantidade: 1 };
  }
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
  const itens = Object.values(carrinho)
    .map(i => `${i.quantidade}x ${i.nome} (R$${i.preco.toFixed(2)})`)
    .join(", ");
  const pedidoObj = { nome, endereco, telefone, itens, total, data: new Date().toISOString() };

  try {
    await db.collection("pedidos").add(pedidoObj);

    // Monta mensagem sem usar template literal multilinha (sem backticks)
    const mensagem =
      "🧾 *Novo Pedido VerdiLume*\\n" +
      "👤 *Nome:* " + nome + "\\n" +
      "🏠 *Endereço:* " + endereco + "\\n" +
      "📞 *Telefone:* " + telefone + "\\n" +
      "📦 *Itens:* " + itens + "\\n" +
      "💰 *Total:* R$" + total;

    const botToken = "7635965015:AAGcOEt7lMgxmlG8C8FxPh2vDMnIk5Rpg";
    const chatId = "5688730032";
    const url =
      "https://api.telegram.org/bot" +
      botToken +
      "/sendMessage?chat_id=" +
      chatId +
      "&text=" + encodeURIComponent(mensagem) +
      "&parse_mode=Markdown";

    fetch(url).catch(console.error);

    localStorage.removeItem("carrinho");
    window.location.href = "confirmacao.html";
  } catch (err) {
    console.error(err);
    alert("Erro ao processar o pedido.");
  }
};

export function configurarCarrinho() {
  renderizarCarrinho();
}
