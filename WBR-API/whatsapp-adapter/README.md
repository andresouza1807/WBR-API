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

## Contribuindo

Pull requests são bem-vindos!

## Licença

ISC

## Suporte

Para problemas e dúvidas, abra uma issue no repositório.
