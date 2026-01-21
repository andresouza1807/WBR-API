# WhatsApp Adapter

WhatsApp adapter para integração com WBR API. Permite gerenciar múltiplas sessões WhatsApp e enviar/receber mensagens.

## Características

- ✅ Múltiplas sessões WhatsApp simultâneas
- ✅ Envio de mensagens de texto e mídia
- ✅ Recebimento de mensagens em tempo real
- ✅ Gerenciamento de contatos
- ✅ Suporte a grupos
- ✅ Webhooks para notificações
- ✅ Docker ready

## Pré-requisitos

- Node.js 16+
- npm ou yarn
- Chromium (para WhatsApp Web.js)

## Instalação

```bash
# Clone ou copie o projeto
cd whatsapp-adapter

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env

# Inicie o servidor
npm run dev

# Se houver o erro "sh: 1: nodemon: not found"
npm install --save-dev nodemon
```

## Configuração

Edite o arquivo `.env` com suas configurações:

```env
NODE_ENV=development
PORT=3000
API_URL=http://localhost:3000
LOG_LEVEL=info
```

## API Endpoints

### Sessões

#### Criar uma nova sessão

```bash
POST /whatsapp/sessions
Content-Type: application/json

{
  "sessionId": "session-1"
}
```

#### Obter código QR

```bash
GET /whatsapp/sessions/{sessionId}/qr
```

#### Status da sessão

```bash
GET /whatsapp/sessions/{sessionId}/status
```

#### Listar todas as sessões

```bash
GET /whatsapp/sessions
```

#### Destruir sessão

```bash
DELETE /whatsapp/sessions/{sessionId}
```

### Mensagens

#### Enviar mensagem

```bash
POST /whatsapp/sessions/{sessionId}/send-message
Content-Type: application/json

{
  "phoneNumber": "5511999999999",
  "message": "Olá, tudo bem?"
}
```

#### Enviar mídia

```bash
POST /whatsapp/sessions/{sessionId}/send-media
Content-Type: application/json

{
  "phoneNumber": "5511999999999",
  "mediaPath": "/path/to/file.jpg",
  "caption": "Aqui está a imagem"
}
```

### Contatos

#### Obter informações do contato

```bash
GET /whatsapp/sessions/{sessionId}/contact/{phoneNumber}
```

## Docker

```bash
# Build da imagem
docker build -t whatsapp-adapter .

# Executar container
docker run -p 3000:3000 \
  -v $(pwd)/sessions:/app/sessions \
  --env-file .env \
  whatsapp-adapter
```

## Estrutura de Arquivos

```
src/
├── app.js                 # Configuração Express
├── server.js              # Servidor principal
├── config/
│   └── env.js            # Variáveis de ambiente
├── session/
│   └── session.manager.js # Gerenciamento de sessões
├── routes/
│   └── whatsapp.routes.js # Rotas da API
├── services/
│   └── whatsapp.service.js # Lógica de negócio
└── events/
    └── message.handler.js  # Tratamento de mensagens
sessions/                  # Armazenamento de autenticação
```

## Fluxo de Uso

1. **Criar sessão**: `POST /whatsapp/sessions`
2. **Escanear QR**: Obter QR code e scannear com WhatsApp
3. **Enviar mensagens**: Usar endpoints de envio
4. **Receber webhooks**: Mensagens chegam via webhook
5. **Destruir sessão**: Quando não precisar mais

## Tratamento de Mensagens

Mensagens recebidas são automaticamente enviadas para o webhook configurado:

```json
{
  "sessionId": "session-1",
  "from": "5511999999999@c.us",
  "to": "5511888888888@c.us",
  "body": "Texto da mensagem",
  "timestamp": "2024-01-20T10:30:00Z",
  "isGroupMsg": false,
  "type": "chat",
  "hasMedia": false
}
```

## Logs

O servidor loga todas as operações. Configure o nível de log em `.env`:

```env
LOG_LEVEL=debug  # debug, info, warn, error
```

## Troubleshooting

### QR Code não aparece

- Verifique se o Chromium está instalado
- Tente recriar a sessão
- Confira os logs para mais detalhes

### Autenticação falha

- Delete a pasta `sessions/{sessionId}`
- Recrie a sessão
- Escaneie o novo QR code

### Conexão perdida

- O adapter tenta reconectar automaticamente
- Verifique a conexão com a internet
- Confira os logs

## Performance

- Suporta múltiplas sessões simultâneas
- Recomendado: máximo 5-10 sessões por instância
- Para mais, use múltiplas instâncias com load balancer

## Segurança

- Sempre use `.env` para variáveis sensíveis
- Nunca commitar `.env` no git
- Usar HTTPS em produção
- Implementar autenticação nas rotas

## Webhooks

O adapter suporta webhooks para integração com sua API. As mensagens recebidas são automaticamente enviadas para o URL configurado.

### Configuração

Defina no `.env`:

```env
WEBHOOK_URL=http://localhost:3001/api/webhooks/messages
WEBHOOK_TIMEOUT=10000
WEBHOOK_RETRIES=3
WEBHOOK_RETRY_DELAY=5000
```

### Recebimento de Mensagens

#### Endpoint

```bash
POST /webhook/messages
```

#### Payload de Mensagem Recebida

```json
{
  "sessionId": "test-session-1",
  "event": "message.received",
  "data": {
    "from": "5511999999999@c.us",
    "to": "5511888888888@c.us",
    "body": "Olá! Esta é uma mensagem",
    "timestamp": "2024-01-20T10:30:00Z",
    "isGroupMsg": false,
    "type": "chat",
    "hasMedia": false,
    "contactName": "John Doe"
  }
}
```

#### Payload de Confirmação (ACK)

```json
{
  "sessionId": "test-session-1",
  "event": "message.ack",
  "data": {
    "messageId": "true_5511999999999@c.us_11111111111",
    "ack": 3,
    "timestamp": "2024-01-20T10:30:00Z"
  }
}
```

### Fila de Retry

Quando um webhook falha, o adapter adiciona à fila de retry e tenta novamente automaticamente.

#### Verificar Status da Fila

```bash
GET /webhook/retry-queue
```

Response:

```json
{
  "queueSize": 2,
  "items": [
    {
      "from": "5511999999999@c.us",
      "retryCount": 1,
      "nextRetry": "2024-01-20T10:35:00Z"
    }
  ]
}
```

#### Processar Fila Manualmente

```bash
POST /webhook/retry-queue/process
```

#### Limpar Fila

```bash
DELETE /webhook/retry-queue
```

### Testing

Execute o script de teste:

```bash
chmod +x test-webhooks.sh
./test-webhooks.sh
```

Ou use curl manualmente:

```bash
curl -X POST http://localhost:3000/webhook/messages \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "test-session-1",
    "event": "message.received",
    "data": {
      "from": "5511999999999@c.us",
      "to": "5511888888888@c.us",
      "body": "Teste de webhook",
      "timestamp": "'$(date +%s)'",
      "isGroupMsg": false,
      "type": "chat",
      "hasMedia": false
    }
  }'
```

## Contribuindo

Pull requests são bem-vindos!

## Licença

ISC

## Suporte

Para problemas e dúvidas, abra uma issue no repositório.
