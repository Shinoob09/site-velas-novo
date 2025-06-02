// api/gerar-pix.js
import axios from 'axios'
import { v4 as uuidv4 } from 'uuid'

const OPENPIX_TOKEN = 'SUA_OPENPIX_API_KEY_AQUI'

export default async function handler(req, res) {
  try {
    const { nome, valor } = req.body

    const payload = {
      correlationID: uuidv4(),
      value: Number(valor),
      comment: `Compra de ${nome}`,
      expiresIn: 3600, // 1h
      payer: {
        name: nome || 'Cliente',
      }
    }

    const response = await axios.post(
      'https://api.openpix.com.br/api/v1/charge',
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': OPENPIX_TOKEN
        }
      }
    )

    const { brCode, qrCodeImage, id } = response.data.charge

    return res.status(200).json({
      copiaCola: brCode,
      qrCode: qrCodeImage,
      transacaoId: id
    })

  } catch (err) {
    console.error('[OPENPIX] Erro ao gerar cobrança:', err.response?.data || err.message)
    return res.status(500).json({ error: 'Erro ao gerar Pix com OpenPix' })
  }
}
