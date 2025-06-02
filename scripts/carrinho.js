import { db } from './firebase.js';
import { z } from 'https://cdn.skypack.dev/zod';

///////////////////////////
// 1. VALIDAÇÃO COM ZOD //
///////////////////////////
const schema = z.object({
  nome: z.string().min(3, "Nome deve ter ao menos 3 caracteres"),
  endereco: z.string().min(5, "Endereço deve ter ao menos 5 caracteres"),
  telefone: z.string().min(10, "Telefone deve ter ao menos 10 dígitos"),
});

//////////////////////////////////////
// 2. ESTADO INICIAL DO CARRINHO (localStorage)
//////////////////////////////////////
let carrinho = JSON.parse(localStorage.getItem("carrinho")) || {};

/////////////////////////////////////////////////
// 3. Função para desenhar o carrinho no DOM
/////////////////////////////////////////////////
function renderizarCarrinho() {
  const lista = document.getElementById("itens-carrinho");
  const totalDisplay = document.getElementById("total-carrinho");
  const contador = document.getElementById("contador-carrinho");

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
      <div>
        <strong>${item.nome}</strong>
        <small> R$ ${item.preco.toFixed(2)} × ${item.quantidade}</small>
      </div>
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

///////////////////////////////////////////////////
// 4. Função para salvar o carrinho no localStorage
///////////////////////////////////////////////////
function salvarCarrinho() {
  localStorage.setItem("carrinho", JSON.stringify(carrinho));
  renderizarCarrinho();
}

///////////////////////////////////////////////////
// 5. Expor funções globais para serem chamadas
//    diretamente via onclick no HTML
///////////////////////////////////////////////////
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
  if (carrinho[id].quantidade <= 0) {
    delete carrinho[id];
  }
  salvarCarrinho();
};

///////////////////////////////////////////////////
// 6. Função para abrir/fechar o painel do carrinho
///////////////////////////////////////////////////
window.toggleCarrinho = () => {
  const carrinhoEl = document.getElementById("carrinho");
  if (!carrinhoEl) return;

  if (Object.keys(carrinho).length === 0) {
    alert("Seu carrinho está vazio!");
    return;
  }

  carrinhoEl.style.display = carrinhoEl.style.display === "block" ? "none" : "block";
};

////////////////////////////////////
// 7. Funções para abrir/fechar o modal
////////////////////////////////////
window.abrirFormulario = () => {
  const modal = document.getElementById("modal-pagamento");
  if (modal) {
    modal.style.display = "flex";
    // Limpar mensagens de erro e estilos dos inputs
    const inputs = modal.querySelectorAll("input");
    inputs.forEach(input => {
      input.classList.remove("input-error");
      const errorEl = document.getElementById(`${input.id}-error`);
      if (errorEl) errorEl.textContent = "";
    });
  }
};

window.fecharFormulario = () => {
  const modal = document.getElementById("modal-pagamento");
  if (modal) {
    modal.style.display = "none";
  }
};

//////////////////////////////////////////////////////
// 8. Evento de submit do formulário de pagamento
//////////////////////////////////////////////////////
document.getElementById("formulario-pagamento")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nomeInput = document.getElementById("input-nome");
  const enderecoInput = document.getElementById("input-endereco");
  const telefoneInput = document.getElementById("input-telefone");

  const nome = nomeInput.value.trim();
  const endereco = enderecoInput.value.trim();
  const telefone = telefoneInput.value.trim();

  const parsed = schema.safeParse({ nome, endereco, telefone });
  if (!parsed.success) {
    // Limpar erros anteriores
    [nomeInput, enderecoInput, telefoneInput].forEach(input => {
      input.classList.remove("input-error");
      const errorEl = document.getElementById(`${input.id}-error`);
      if (errorEl) errorEl.textContent = "";
    });

    // Exibir novos erros
    parsed.error.errors.forEach(err => {
      const field = err.path[0];
      const input = document.getElementById(`input-${field}`);
      const errorEl = document.getElementById(`input-${field}-error`);
      if (input && errorEl) {
        input.classList.add("input-error");
        errorEl.textContent = err.message;
      }
    });
    return;
  }

  // Se a validação passar, prosseguir com o pagamento
  window.confirmarPagamento();
});

////////////////////////////////////////////////////////////
// 9. Função que confirma o pedido (envia para Firestore e Telegram)
////////////////////////////////////////////////////////////
window.confirmarPagamento = async () => {
  const nome = document.getElementById("input-nome").value.trim();
  const endereco = document.getElementById("input-endereco").value.trim();
  const telefone = document.getElementById("input-telefone").value.trim();
  const total = Object.values(carrinho)
    .reduce((acc, i) => acc + i.preco * i.quantidade, 0)
    .toFixed(2);

  const itens = Object.values(carrinho)
    .map(i => `${i.quantidade}x ${i.nome} (R$${i.preco.toFixed(2)})`)
    .join(", ");

  const pedidoObj = {
    nome,
    endereco,
    telefone,
    itens,
    total,
    data: new Date().toISOString()
  };

  const submitButton = document.querySelector("#formulario-pagamento button[type='submit']");
  const originalText = submitButton.textContent;

  try {
    // Exibir estado de carregamento
    submitButton.textContent = "Processando...";
    submitButton.disabled = true;

    // 1) Salva no Firestore
    await db.collection("pedidos").add(pedidoObj);

    // 2) Monta a mensagem para o Telegram
    const mensagem =
      "🧾 *Novo Pedido VerdiLume*\n" +
      "👤 *Nome:* " + nome + "\n" +
      "🏠 *Endereço:* " + endereco + "\n" +
      "📞 *Telefone:* " + telefone + "\n" +
      "📦 *Itens:* " + itens + "\n" +
      "💰 *Total:* R$" + total;

    // Usar novo token fornecido
    const botToken = "7635965015:AAGcOEt7lMgxmlG8C8FxPhCh2vDMnIk5Rpg";
    const chatIds = ["6742035614", "5688730032"]; // Dois chat_ids

    // 3) Dispara o fetch para os dois chat_ids em paralelo
    const telegramRequests = chatIds.map(chatId =>
      fetch(
        `https://api.telegram.org/bot${botToken}/sendMessage?chat_id=${chatId}&text=${encodeURIComponent(mensagem)}&parse_mode=Markdown`
      )
    );
    const telegramResponses = await Promise.all(telegramRequests);

    // Verifica se todas as respostas estão ok
    telegramResponses.forEach((response, index) => {
      if (!response.ok) {
        const errorText = response.text();
        throw new Error(`Erro na API do Telegram para chat_id ${chatIds[index]}: ${response.status} - ${errorText}`);
      }
    });

    // 4) Envia e-mail via EmailJS
    await emailjs.send("service_nr73648", "template_mht5f4y", {
      nome,
      endereco,
      telefone,
      itens,
      total
    });

    // 5) Limpa o carrinho e redireciona
    localStorage.removeItem("carrinho");
    carrinho = {};
    window.location.href = "confirmacao.html";
  } catch (err) {
    console.error("Erro ao processar o pedido:", err);
    alert(`Erro ao processar o pedido. Detalhes: ${err.message}. Tente novamente mais tarde.`);
  } finally {
    // Restaurar o botão
    submitButton.textContent = originalText;
    submitButton.disabled = false;
  }
};

///////////////////////////////////////////////////
// 10. Função exportada para ser chamada pelo main.js
///////////////////////////////////////////////////
export function configurarCarrinho() {
  renderizarCarrinho();
}