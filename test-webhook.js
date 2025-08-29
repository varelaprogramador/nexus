const crypto = require('crypto')

// Simula o payload do webhook do Kiwify
const webhookPayload = {
  order_id: "order_123456",
  order_status: "paid",
  customer: {
    email: "cliente@email.com", 
    first_name: "João",
    last_name: "Silva",
    mobile: "11987654321",
    CPF: "12345678900"
  },
  Product: {
    product_name: "Produto Premium"
  },
  commissions: [
    {
      order_id: "order_123456",
      product_id: "prod_789",
      product_name: "Produto Premium",
      affiliate_email: "afiliado@email.com",
      producer_email: "produtor@email.com", 
      customer_email: "cliente@email.com",
      order_status: "paid",
      sale_amount: 19700, // R$ 197,00 em centavos
      sale_currency: "BRL"
    }
  ]
}

// Simula a assinatura do webhook
const secret = "test_secret_key"
const payload = JSON.stringify(webhookPayload)
const signature = crypto.createHmac('sha256', secret).update(payload).digest('hex')

console.log('Payload:')
console.log(JSON.stringify(webhookPayload, null, 2))
console.log('\nSignature:')
console.log(signature)
console.log('\nCurl command para testar:')
console.log(`
curl -X POST http://localhost:3000/api/webhooks/kiwify \\
  -H "Content-Type: application/json" \\
  -H "X-Kiwify-Signature: ${signature}" \\
  -d '${payload}'
`)