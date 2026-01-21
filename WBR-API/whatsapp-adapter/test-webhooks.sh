#!/bin/bash

# Script de teste de webhooks

BASE_URL="http://localhost:3000"

echo "🧪 WhatsApp Adapter Webhook Testing"
echo "===================================="
echo ""

# Health check
echo "1️⃣ Health Check"
curl -s -X GET "$BASE_URL/health" | jq .
echo -e "\n"

# Criar sessão
echo "2️⃣ Criar Sessão"
SESSION_RESPONSE=$(curl -s -X POST "$BASE_URL/whatsapp/sessions" \
  -H "Content-Type: application/json" \
  -d '{"sessionId": "test-session-1"}')
echo "$SESSION_RESPONSE" | jq .
echo -e "\n"

# Listar sessões
echo "3️⃣ Listar Sessões"
curl -s -X GET "$BASE_URL/whatsapp/sessions" | jq .
echo -e "\n"

# Simular webhook de mensagem recebida
echo "4️⃣ Simular Webhook de Mensagem Recebida"
curl -s -X POST "$BASE_URL/webhook/messages" \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "test-session-1",
    "event": "message.received",
    "data": {
      "from": "5511999999999@c.us",
      "to": "5511888888888@c.us",
      "body": "Olá! Esta é uma mensagem de teste",
      "timestamp": '$(date +%s)',
      "isGroupMsg": false,
      "type": "chat",
      "hasMedia": false,
      "contactName": "John Doe"
    }
  }' | jq .
echo -e "\n"

# Simular webhook de confirmação
echo "5️⃣ Simular Webhook de Confirmação (ACK)"
curl -s -X POST "$BASE_URL/webhook/messages" \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "test-session-1",
    "event": "message.ack",
    "data": {
      "messageId": "true_5511999999999@c.us_11111111111",
      "ack": 3,
      "timestamp": '$(date +%s)'
    }
  }' | jq .
echo -e "\n"

# Verificar fila de retry
echo "6️⃣ Verificar Fila de Retry"
curl -s -X GET "$BASE_URL/webhook/retry-queue" | jq .
echo -e "\n"

echo "✅ Testes concluídos!"
