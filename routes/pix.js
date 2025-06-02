const express = require("express");
const axios = require("axios");
const router = express.Router();

router.post("/gerar-pix", async (req, res) => {
  const { nome, valor } = req.body;

  if (!nome || !valor) {
    return res.status(400).json({ error: "Nome e valor são obrigatórios" });
  }

  try {
    const response = await axios.post(
      "https://api.openpix.com.br/api/openpix/charge",
      {
        value: Math.round(parseFloat(valor) * 100),
        correlationID: `verdi-${Date.now()}`,
        buyer: {
          name: nome
        }
      },
      {
        headers: {
          "Content-Type": "application/json",
          "X-Api-Key": process.env.OPENPIX_API_KEY
        }
      }
    );

    const { qrCodeImage, brCode } = response.data.charge;
    res.json({
      qrCode: qrCodeImage,
      copiaCola: brCode
    });
  } catch (err) {
    console.error("Erro ao gerar Pix:", err?.response?.data || err.message);
    res.status(500).json({ error: "Falha ao gerar Pix" });
  }
});

module.exports = router;
