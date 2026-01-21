# 🚀 Instruções do Server - WhatsApp Adapter

## Iniciar o Server

### Opção 1: Modo Desenvolvimento (Com Nodemon - Auto-reload)
```bash
cd /home/andre-souza/Desktop/Vscode/WBR-API/whatsapp-adapter
npm run dev
```
- Server rodará em modo desenvolvimento
- Qualquer mudança nos arquivos vai reiniciar automaticamente
- Use **CTRL+C** para parar

### Opção 2: Modo Background (Recomendado para Produção)
```bash
cd /home/andre-souza/Desktop/Vscode/WBR-API/whatsapp-adapter
nohup npm run dev > server.log 2>&1 &
```
- Server rodará em background (não para com CTRL+C)
- Logs salvos em `server.log`
- Pode usar o terminal para outros comandos

### Opção 3: Modo Produção
```bash
cd /home/andre-souza/Desktop/Vscode/WBR-API/whatsapp-adapter
npm start
```
- Inicia diretamente sem nodemon

---

## Parar o Server

### Opção 1: Se estiver em Modo Desenvolvimento
```bash
# Apenas pressione CTRL+C no terminal onde o server está rodando
^C
```

### Opção 2: Se estiver em Background (nohup)
```bash
# Matar todos os processos npm/node
pkill -f "npm run dev"

# Ou matar um processo específico pelo PID
kill -9 <PID>

# Ou matar tudo na porta 3000
lsof -ti:3000 | xargs kill -9
```

### Opção 3: Listar Processos Rodando
```bash
ps aux | grep "npm run dev" | grep -v grep
```

---

## Verificar Status do Server

### Health Check
```bash
curl -s http://localhost:3000/health
```
**Resposta esperada:**
```json
{"status":"ok","environment":"development","timestamp":"2026-01-21T03:30:02.175Z"}
```

### Listar Sessões Ativas
```bash
curl -s http://localhost:3000/whatsapp/sessions
```

### Verificar se Porta 3000 Está em Uso
```bash
lsof -i :3000
```

---

## Acessar os Endpoints

### 🎨 Dashboard (GUI)
```
http://localhost:3000
```
- Interface visual para gerenciar sessões WhatsApp
- Criar novas sessões
- Visualizar QR codes
- Monitorar status

### 📖 API Documentation (Swagger)
```
http://localhost:3000/api-docs
```
- Documentação interativa de todos os endpoints
- Testar endpoints direto no navegador

### ❤️ Health Check
```
http://localhost:3000/health
```
- Verifica se o server está respondendo

### 🔍 Sessões WhatsApp
```
http://localhost:3000/whatsapp/sessions
```
- Lista todas as sessões ativas

---

## Ver Logs do Server

### Logs em Tempo Real (Modo Dev)
```bash
# Já aparecem no terminal onde o server está rodando
```

### Logs do Background (nohup)
```bash
# Ver últimas 50 linhas
tail -50 /home/andre-souza/Desktop/Vscode/WBR-API/whatsapp-adapter/server.log

# Ver todo o arquivo
cat /home/andre-souza/Desktop/Vscode/WBR-API/whatsapp-adapter/server.log

# Acompanhar em tempo real
tail -f /home/andre-souza/Desktop/Vscode/WBR-API/whatsapp-adapter/server.log
```

---

## Instalação de Dependências

Se for preciso reinstalar as dependências:
```bash
cd /home/andre-souza/Desktop/Vscode/WBR-API/whatsapp-adapter
npm install
```

---

## Variáveis de Ambiente

Criar arquivo `.env` na raiz do projeto:
```bash
# Porta
PORT=3000

# Ambiente
NODE_ENV=development

# WhatsApp
WHATSAPP_HEADLESS=true

# Webhook
WEBHOOK_URL=http://seu-webhook.com/webhook
WEBHOOK_TIMEOUT=5000
WEBHOOK_RETRY_ATTEMPTS=3
```

---

## Troubleshooting

### ❌ Erro: "Port 3000 already in use"
```bash
# Matar processo na porta 3000
lsof -ti:3000 | xargs kill -9
```

### ❌ Erro: "Cannot find module"
```bash
# Reinstalar dependências
npm install
```

### ❌ Server parou inesperadamente
```bash
# Verificar logs
tail -50 server.log

# Reiniciar
npm run dev
```

### ❌ Sessão não conecta
- Verificar QR code no dashboard
- Confirmado que QR foi escaneado no WhatsApp?
- Conexão de internet está OK?
- WhatsApp precisa estar instalado no telefone

---

## Comandos Úteis

```bash
# Verificar versão do Node
node --version

# Verificar versão do npm
npm --version

# Listar portas em uso
netstat -tuln | grep 3000

# Restart do server (se em background)
pkill -f "npm run dev" && sleep 2 && nohup npm run dev > server.log 2>&1 &

# Limpar cache do npm
npm cache clean --force
```

---

## 📝 Resumo Rápido

| Ação | Comando |
|------|---------|
| **Iniciar (Dev)** | `npm run dev` |
| **Iniciar (Background)** | `nohup npm run dev > server.log 2>&1 &` |
| **Parar** | `CTRL+C` ou `pkill -f "npm run dev"` |
| **Health Check** | `curl http://localhost:3000/health` |
| **Dashboard** | http://localhost:3000 |
| **Swagger Docs** | http://localhost:3000/api-docs |
| **Ver Logs** | `tail -f server.log` |

---

**Última atualização:** 21/01/2026
**Versão do Server:** 1.0.0
**Ambiente:** Node.js + Express + WhatsApp Web.js
