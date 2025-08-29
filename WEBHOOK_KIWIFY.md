# Webhook Kiwify - Criação Automática de Contas

Este documento descreve o webhook implementado para criar contas automaticamente quando o Kiwify processa pagamentos aprovados.

## Endpoint

```
POST /api/webhooks/kiwify
```

## Configuração

### Variáveis de Ambiente Necessárias

```bash
# Obrigatórias
KIWIFY_WEBHOOK_SECRET="seu_secret_do_kiwify"
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
DATABASE_URL="postgresql://..."

# Opcionais (para webhook externo)
EXTERNAL_WEBHOOK_URL="https://seu-webhook-externo.com/webhook"
EXTERNAL_WEBHOOK_TOKEN="seu_token_webhook"
```

### Headers Esperados

```
Content-Type: application/json
X-Kiwify-Signature: <assinatura_hmac_sha256>
```

## Payload Esperado

```json
{
  "order_id": "order_123456",
  "order_status": "paid",
  "customer": {
    "email": "cliente@email.com",
    "first_name": "João",
    "last_name": "Silva",
    "mobile": "11987654321",
    "CPF": "12345678900"
  },
  "Product": {
    "product_name": "Produto Premium"
  },
  "commissions": [...]
}
```

## Funcionamento

### 1. Validação de Assinatura
- Verifica a assinatura HMAC SHA-256 usando o secret configurado
- Rejeita requests com assinaturas inválidas (HTTP 401)

### 2. Processamento de Pedidos Pagos
- Só processa pedidos com `order_status: "paid"`
- Pula outros status automaticamente

### 3. Criação/Atualização de Conta Clerk
- **Novos usuários**: Cria conta com metadados:
  ```json
  {
    "publicMetadata": {
      "kiwifyOrderId": "order_123456",
      "productName": "Produto Premium",
      "subscription": "active",
      "type": "whitelabel",
      "createdFromWebhook": true
    },
    "privateMetadata": {
      "cpf": "12345678900",
      "mobile": "11987654321"
    }
  }
  ```

- **Usuários existentes**: Atualiza metadados com nova compra

### 4. Registro no Banco de Dados
- Salva registro na tabela `users` com informações básicas
- Mantém sincronização com dados do Clerk

### 5. Webhook Externo (Opcional)
- Dispara para URL configurada em `EXTERNAL_WEBHOOK_URL`
- Inclui dados do usuário criado/atualizado
- Formato do payload:
  ```json
  {
    "event": "user_created",
    "user": {
      "id": "clerk_user_id",
      "email": "cliente@email.com",
      "name": "João Silva",
      "kiwifyOrderId": "order_123456",
      "productName": "Produto Premium",
      "subscription": "active",
      "type": "whitelabel"
    },
    "timestamp": "2024-01-01T12:00:00.000Z"
  }
  ```

## Respostas da API

### Sucesso - Novo Usuário (HTTP 200)
```json
{
  "success": true,
  "message": "Account created successfully",
  "userId": "clerk_user_id",
  "orderId": "order_123456"
}
```

### Sucesso - Usuário Existente (HTTP 200)
```json
{
  "success": true,
  "message": "User already exists, metadata updated",
  "userId": "clerk_user_id", 
  "orderId": "order_123456"
}
```

### Erro - Assinatura Inválida (HTTP 401)
```json
{
  "error": "Invalid signature"
}
```

### Erro - Configuração (HTTP 500)
```json
{
  "error": "Webhook secret not configured"
}
```

## Configuração no Kiwify

1. Acesse as configurações de webhook no painel Kiwify
2. Configure a URL: `https://seu-dominio.com/api/webhooks/kiwify`
3. Configure o secret definido em `KIWIFY_WEBHOOK_SECRET`
4. Selecione os eventos de pagamento aprovado

## Logs

O webhook gera logs detalhados para monitoramento:
- Recebimento de webhooks
- Criação/atualização de usuários
- Chamadas para webhook externo
- Erros e exceções

## Teste Local

Use o arquivo `test-webhook.js` para gerar payloads de teste:

```bash
node test-webhook.js
```

Isso gerará um comando curl para testar o endpoint localmente.