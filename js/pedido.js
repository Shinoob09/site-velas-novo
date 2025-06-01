
import { getEl, sanitizeInput } from './dom-utils.js';
import { getCarrinhoAtual, limparCarrinho } from './carrinho.js';
import { db } from "./firebase-config.js";
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

async function enviarParaFirebase(pedidoObj) {
  try {
    const docRef = await addDoc(collection(db, "pedidos"), pedidoObj);
    console.log("Pedido gravado com ID:", docRef.id);
  } catch (erro) {
    console.error("Erro ao gravar pedido no Firestore:", erro);
    throw erro;
  }
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
🕐 *Data:* ${new Date(pedido.data).toLocaleString("pt-BR")}
  `.trim();

  try {
    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: texto,
        parse_mode: "Markdown"
      })
    });
    const data = await response.json();
    if (!data.ok) {
      console.warn("Telegram retornou erro:", data);
      throw new Error("Falha ao enviar mensagem para Telegram");
    }
  } catch (erro) {
    console.error("Erro no envio para Telegram:", erro);
    throw erro;
  }
}

export function configurarPedido() {
  const form = getEl("form-pedido");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nome = sanitizeInput(getEl("nome")?.value.trim() || "");
    const endereco = sanitizeInput(getEl("endereco")?.value.trim() || "");
    const telefone = sanitizeInput(getEl("telefone")?.value.trim() || "");
    const carrinho = getCarrinhoAtual();

    if (!nome || !endereco || !telefone || Object.keys(carrinho).length === 0) {
      alert("⚠️ Preencha todos os campos e adicione itens ao carrinho.");
      return;
    }

    const pedidoObj = {
      nome,
      endereco,
      telefone,
      carrinho,
      total: Object.values(carrinho).reduce((soma, i) => soma + i.preco * i.quantidade, 0),
      data: new Date().toISOString()
    };

    try {
      await enviarParaFirebase(pedidoObj);
      await enviarParaTelegram(pedidoObj);
      limparCarrinho();
      window.location.href = "confirmacao.html";
    } catch (erro) {
      console.error("Erro ao processar pedido:", erro);
      alert("Erro ao finalizar pedido. Tente novamente.");
    }
  });
}
