
import { getEl, sanitizeInput } from './dom-utils.js';
import { getCarrinhoAtual, limparCarrinho } from './carrinho.js';

export function configurarPedido() {
  const form = document.getElementById("form-pedido");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nome = sanitizeInput(getEl("nome")?.value.trim() || "");
    const endereco = sanitizeInput(getEl("endereco")?.value.trim() || "");
    const telefone = sanitizeInput(getEl("telefone")?.value.trim() || "");
    const carrinho = getCarrinhoAtual();

    if (!nome || !endereco || !telefone || Object.keys(carrinho).length === 0) {
      alert("Preencha todos os campos e adicione itens ao carrinho.");
      return;
    }

    const pedido = {
      nome,
      endereco,
      telefone,
      carrinho,
      total: Object.values(carrinho).reduce((acc, i) => acc + i.preco * i.quantidade, 0),
      data: new Date().toISOString()
    };

    try {
      await enviarParaFirebase(pedido);
      await enviarParaTelegram(pedido);
      limparCarrinho();
      window.location.href = "confirmacao.html";
    } catch (err) {
      console.error("Erro ao enviar pedido:", err);
      alert("Erro ao finalizar pedido. Tente novamente.");
    }
  });
}

async function enviarParaFirebase(pedido) {
const firebaseConfig = {
  apiKey: "AIzaSyAvw9i4bV-Zq0PVEGumiAvZ1HIuNe7MVTE",
  authDomain: "site-de-velas.firebaseapp.com",
  projectId: "site-de-velas",
  storageBucket: "site-de-velas.firebasestorage.app",
  messagingSenderId: "629570686928",
  appId: "1:629570686928:web:201bee3ec50397298e73d5",
  measurementId: "G-BBSTRLNK0M"
}

  if (!window.firebase) {
    alert("Firebase não carregado.");
    throw new Error("Firebase SDK ausente.");
  }

  if (!window.firebase.apps?.length) {
    window.firebase.initializeApp(firebaseConfig);
  }

  const db = window.firebase.firestore();
  await db.collection("pedidos").add(pedido);
}

async function enviarParaTelegram(pedido) {
  const BOT_TOKEN = "7635965015:AAGcOEt7lMgxmlG8C8FxPhCh2vDMnIk5Rpg";
  const CHAT_ID = "5688730032";

  const texto = `
🛒 *Novo Pedido VerdiLume* 🕯️
👤 *Nome:* ${pedido.nome}
📞 *Telefone:* ${pedido.telefone}
🏠 *Endereço:* ${pedido.endereco}

${Object.values(pedido.carrinho).map(i =>
    `• ${i.nome} × ${i.quantidade} = R$ ${(i.preco * i.quantidade).toFixed(2)}`
  ).join("\n")}

💰 *Total:* R$ ${pedido.total.toFixed(2)}
🕐 *Data:* ${new Date(pedido.data).toLocaleString()}
`.trim();

  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: CHAT_ID,
      text: texto,
      parse_mode: "Markdown"
    })
  });
}
