# MKT Logistic On-Demand

Plataforma de Logística sob Demanda - Backend API

## 🚀 Início Rápido

### Pré-requisitos
- Python 3.11+
- PostgreSQL 14+
- pip

### Instalação

1. **Clone o repositório**
```bash
cd backend
```

2. **Crie um ambiente virtual**
```bash
python -m venv venv
source venv/bin/activate  # No Windows: venv\Scripts\activate
```

3. **Instale as dependências**
```bash
pip install -r requirements.txt
```

4. **Configure o arquivo .env**
```bash
cp .env.example .env
# Edite o .env com suas credenciais
```

5. **Execute o servidor**
```bash
uvicorn app.main:app --reload
```

A API estará disponível em `http://localhost:8000`

## 📚 Documentação da API

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 🏗️ Estrutura do Projeto

```
backend/
├── app/
│   ├── api/              # Routers (endpoints)
│   │   ├── auth.py       # Autenticação
│   │   ├── loads.py      # Cargas
│   │   ├── load_interest.py  # Interesse em Cargas
│   │   ├── carriers.py   # Transportadoras
│   │   └── deps.py       # Dependências
│   ├── core/
│   │   ├── config.py     # Configurações
│   │   ├── database.py   # Banco de dados
│   │   ├── security.py   # Segurança/JWT
│   │   └── events.py     # Tipos de eventos
│   ├── models/           # Modelos SQLModel
│   ├── schemas/          # Schemas Pydantic
│   ├── services/         # Serviços
│   └── main.py          # Aplicação FastAPI
├── scripts/              # Scripts utilitários
├── tests/               # Testes
├── alembic/             # Migrations
├── requirements.txt     # Dependências
├── .env                 # Variáveis de ambiente
└── Dockerfile          # Docker
```

## 🔐 Autenticação

A API usa JWT (JSON Web Tokens) para autenticação.

### Login
```bash
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

### Resposta
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer"
}
```

### Usando o Token
```bash
Authorization: Bearer <token>
```

## 📊 Principais Endpoints

### Autenticação
- `POST /auth/login` - Fazer login
- `POST /auth/register` - Registrar novo usuário
- `GET /auth/me` - Obter dados do usuário autenticado

### Cargas
- `GET /loads` - Listar cargas
- `POST /loads` - Criar carga
- `GET /loads/{load_id}` - Obter detalhes da carga
- `PATCH /loads/{load_id}` - Atualizar carga
- `DELETE /loads/{load_id}` - Deletar carga

### Interesse em Cargas
- `POST /load_interest/{load_id}/interest` - Manifestar interesse em carga
- `GET /load_interest/{load_id}/interests` - Listar interessados em carga
- `POST /load_interest/accept` - Aceitar interesse

## 🔧 Configuração do Banco de Dados

### Variáveis de Ambiente (.env)
```
DATABASE_URL=postgresql://user:password@localhost:5432/mkt_logistic
SECRET_KEY=sua-chave-secreta-aqui
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
```

### Migrations (Alembic)
```bash
# Criar migration
alembic revision --autogenerate -m "Descrição"

# Aplicar migrations
alembic upgrade head
```

## 🐳 Docker

### Build
```bash
docker build -t mkt-logistic:latest .
```

### Run
```bash
docker-compose up
```

## ✅ Correções Implementadas

- ✅ Removida credenciais hardcoded
- ✅ Corrigido bug de autenticação (User.password_hash → user.password_hash)
- ✅ Corrigido query SQL de LoadInterest
- ✅ Completado função event_logger com commit
- ✅ Registrados todos os routers
- ✅ Corrigida configuração Pydantic (model_config)
- ✅ Adicionados endpoints CRUD completos para Loads
- ✅ Adicionado endpoint de registro
- ✅ Criados schemas Pydantic

## 🐛 Problemas Conhecidos / TODO

- [ ] Implementar Alembic migrations
- [ ] Adicionar testes unitários
- [ ] Implementar paginação
- [ ] Adicionar validações de negócio
- [ ] Implementar soft delete
- [ ] Adicionar rate limiting
- [ ] Implementar cache

## 📝 Licença

MIT
