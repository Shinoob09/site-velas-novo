// scripts/carrinho.js
import { z } from 'https://cdn.skypack.dev/zod';

const schema = z.object({
  nome: z.string().min(3),
  endereco: z.string().min(5),
  telefone: z.string().min(10),
});

let carrinho = JSON.parse(localStorage.getItem("carrinho")) || {};

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

function salvarCarrinho() {
  localStorage.setItem("carrinho", JSON.stringify(carrinho));
  renderizarCarrinho();
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

95  window.confirmarPagamento = async () => {
96    const nome = document.getElementById("input-nome").value.trim();
97    const endereco = document.getElementById("input-endereco").value.trim();
98    const telefone = document.getElementById("input-telefone").value.trim();
99    const total = Object.values(carrinho)
100      .reduce((acc, i) => acc + i.preco * i.quantidade, 0)
101      .toFixed(2);
102    const itens = Object.values(carrinho)
103      .map(i => `${i.quantidade}x ${i.nome} (R$${i.preco.toFixed(2)})`)
104      .join(", ");
105    const pedidoObj = { nome, endereco, telefone, itens, total, data: new Date().toISOString() };
106    try {
107      // Salva no Firestore
108      await db.collection("pedidos").add(pedidoObj);
109      // Envia Telegram
110      const mensagem = `
111 🧾 *Novo Pedido VerdiLume*
112 👤 *Nome:* ${nome}
113 🏠 *Endereço:* ${endereco}
114 📞 *Telefone:* ${telefone}
115 📦 *Itens:* ${itens}
116 💰 *Total:* R$${total}
117  `;
118      const url = `https://api.telegram.org/botSEU_TOKEN_AQUI/sendMessage?chat_id=SEU_CHAT_ID&text=${encodeURIComponent(mensagem)}&parse_mode=Markdown`;
119      fetch(url).catch(console.error);
120      // Limpa carrinho e redireciona
121      localStorage.removeItem("carrinho");
122      window.location.href = "confirmacao.html";
123    } catch (err) {
124      console.error(err);
125      alert("Erro ao processar o pedido.");
126    }
127  };
128

