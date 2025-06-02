import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// Simulação de geração de pagamento (PIX/cartão)
app.post('/api/checkout', (req, res) => {
  try {
    const { nome, endereco, telefone, total } = req.body;
    if (!nome || !endereco || !telefone || !total) {
      return res.status(400).json({ error: 'Dados incompletos' });
    }
    console.log("Simulando pagamento:", req.body);
    return res.json({
      message: "Pagamento simulado com sucesso.",
      init_point: "https://example.com/pagamento-fake",
      qr_code_base64: "data:image/png;base64,FAKE_QRCODE"
    });
  } catch (error) {
    console.error("Erro ao processar checkout:", error);
    res.status(500).json({ error: 'Erro no servidor' });
  }
});

// Simulação de cancelamento
app.post('/api/cancelar-pedido', (req, res) => {
  try {
    console.log("Simulando cancelamento de pedido...");
    return res.json({ status: "cancelado", message: "Pedido cancelado com sucesso (simulado)." });
  } catch (error) {
    console.error("Erro ao cancelar pedido:", error);
    res.status(500).json({ error: 'Erro no servidor' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT} (modo simulado)`);
});