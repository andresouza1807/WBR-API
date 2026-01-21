# 📚 Swagger/OpenAPI Documentation

O WhatsApp Adapter API possui documentação interativa completa usando Swagger/OpenAPI 3.0.

## 🚀 Acessar Documentação

Depois de iniciar o servidor:

```bash
cd whatsapp-adapter
npm run dev
```

Abra seu navegador e acesse:

**<http://localhost:3000/api-docs>**

## 📖 O que você encontrará

A documentação Swagger inclui:

### ✅ Endpoints Documentados

**Sessões WhatsApp**

- `POST /whatsapp/sessions` - Criar nova sessão
- `GET /whatsapp/sessions` - Listar todas as sessões
- `GET /whatsapp/sessions/{sessionId}/status` - Status da sessão
- `GET /whatsapp/sessions/{sessionId}/qr` - Obter código QR
- `DELETE /whatsapp/sessions/{sessionId}` - Destruir sessão

**Mensagens**

- `POST /whatsapp/sessions/{sessionId}/send-message` - Enviar mensagem de texto
- `POST /whatsapp/sessions/{sessionId}/send-media` - Enviar mídia (imagem, vídeo, etc)

**Contatos**

- `GET /whatsapp/sessions/{sessionId}/contact/{phoneNumber}` - Obter info do contato

**Webhooks**

- `POST /webhook/messages` - Receber eventos de mensagens
- `GET /webhook/retry-queue` - Ver fila de retry
- `DELETE /webhook/retry-queue` - Limpar fila
- `POST /webhook/retry-queue/process` - Processar fila manualmente

### 📋 Para cada endpoint

- ✅ Descrição completa
- ✅ Parâmetros (path, query, body)
- ✅ Esquemas de request/response
- ✅ Códigos de status HTTP
- ✅ Exemplos de valores

## 🧪 Testar Endpoints Direto no Swagger

1. Abra **<http://localhost:3000/api-docs>**
2. Clique no endpoint que quer testar
3. Clique em **"Try it out"**
4. Preencha os parâmetros
5. Clique em **"Execute"**
6. Veja a resposta em tempo real

## 📦 Dependências Instaladas

```json
{
  "swagger-jsdoc": "^6.2.8",
  "swagger-ui-express": "^5.0.0"
}
```

## 🔧 Configuração

A configuração do Swagger está em:

- [src/config/swagger.js](src/config/swagger.js) - Definição OpenAPI
- [src/app.js](src/app.js) - Integração com Express
- [src/routes/whatsapp.routes.js](src/routes/whatsapp.routes.js) - Documentação dos endpoints
- [src/routes/webhook.routes.js](src/routes/webhook.routes.js) - Documentação de webhooks

## 📝 Exemplo de Uso

**Criar uma sessão WhatsApp:**

1. Na documentação Swagger, procure por `POST /whatsapp/sessions`
2. Clique em "Try it out"
3. No campo Request Body, insira:

```json
{
  "sessionId": "session-1"
}
```

4. Clique em "Execute"
2. Você receberá uma resposta com sucesso

## 🔗 URLs Úteis

- **API Docs**: <http://localhost:3000/api-docs>
- **Health Check**: <http://localhost:3000/health>
- **Root**: <http://localhost:3000/>

## 📚 Mais Informações

- [OpenAPI Specification](https://swagger.io/specification/)
- [Swagger UI Documentation](https://swagger.io/tools/swagger-ui/)
- [swagger-jsdoc Documentation](https://github.com/Surnet/swagger-jsdoc)

## 🤝 Contribuir

Se encontrar falta de documentação em algum endpoint, abra uma issue ou pull request!
