# Guia de Clean Code, DDD e Normas de Código

## 📋 Visão Geral
Este guia estabelece os padrões de qualidade de código, Domain-Driven Design (DDD) e melhores práticas para o projeto MKT Logistic On-Demand.

---

## 🧹 Clean Code

### 1. Nomenclatura Clara
```python
# ❌ RUIM
def func(x):
    return x * 2

# ✅ BOM
def calculate_load_volume_with_margin(weight_kg: int) -> float:
    """Calculate load volume with 20% safety margin."""
    return weight_kg * 1.2
```

### 2. Funções Pequenas e Focadas
- Cada função deve fazer **UMA** coisa bem
- Máximo 30 linhas de código
- Máximo 3-4 parâmetros
- Use `Depends()` para injeção de dependência

```python
# ✅ BOM: Função pequena e focada
@router.post("/loads/", response_model=LoadResponse)
def create_load(
    load_data: LoadCreate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Create a new load for the company."""
    load = Load(
        company_id=current_user.company_id,
        created_by=current_user.id,
        **load_data.model_dump()
    )
    session.add(load)
    session.commit()
    session.refresh(load)
    return load
```

### 3. Evitar Código Comentado
- Delete código comentado, use Git para histórico
- Comentários devem explicar **POR QUÊ**, não **O QUÊ**

```python
# ❌ RUIM
# user = session.exec(statement).first()
# if not user:
#     return {"status": "error"}

# ✅ BOM
user = session.exec(statement).first()
if not user:
    raise HTTPException(status_code=404, detail="User not found")
```

### 4. Constantes e Magic Numbers
- Use constantes para valores fixos
- Mantenha em `app/core/events.py` ou `app/core/constants.py`

```python
# ❌ RUIM
if user.role == "admin":
    pass

# ✅ BOM
from app.core.events import UserRole

if user.role == UserRole.ADMIN:
    pass
```

### 5. Tratamento de Erros Apropriado
- Use exceções específicas do FastAPI
- Sempre retorne mensagens de erro claras

```python
# ✅ BOM
if not load:
    raise HTTPException(
        status_code=404,
        detail="Load not found"
    )
```

### 6. Type Hints Obrigatórios
- Todas as funções devem ter type hints
- Use sintaxe moderna: `str | None` em vez de `Optional[str]`

```python
# ❌ RUIM
def get_load(load_id):
    pass

# ✅ BOM
def get_load(load_id: UUID) -> Load | None:
    """Fetch a load by ID."""
    return session.get(Load, load_id)
```

### 7. Docstrings
- Docstrings em funções públicas
- Use formato Google ou NumPy
- Descreva parâmetros, retorno e exceções

```python
# ✅ BOM
def apply_for_load(
    load_id: UUID,
    proposed_price: float | None = None,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
) -> LoadInterest:
    """
    Apply for a load as a transporter.
    
    Args:
        load_id: ID of the load to apply for
        proposed_price: Proposed price for the load
        session: Database session
        current_user: Current authenticated user
        
    Returns:
        LoadInterest: Created load interest
        
    Raises:
        HTTPException: If load not found or already applied
    """
    pass
```

### 8. Evitar Variáveis Não Utilizadas
```python
# ❌ RUIM
def get_current_user(token: str, session: Session) -> User:
    user_id = payload.get("sub")
    company_id = payload.get("company_id")  # Nunca usado
    roles = payload.get("roles")  # Nunca usado
    
# ✅ BOM
def get_current_user(token: str, session: Session) -> User:
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token")
```

---

## 🏗️ Domain-Driven Design (DDD)

### 1. Estrutura de Camadas

```
app/
├── core/              # Configuração, segurança, banco de dados
│   ├── config.py
│   ├── database.py
│   ├── security.py
│   └── events.py      # Constantes de domínio
│
├── models/            # Entidades de banco de dados
│   ├── user.py
│   ├── load.py
│   └── carrier.py
│
├── schemas/           # DTOs (Data Transfer Objects)
│   ├── user.py
│   └── load.py
│
├── api/               # Endpoints HTTP
│   ├── loads.py
│   ├── auth.py
│   └── deps.py        # Dependências
│
├── services/          # Lógica de negócio (Services)
│   └── event_logger.py
│
└── repositories/      # Acesso a dados (a implementar)
    └── load_repository.py
```

### 2. Entidades (Models)
- Representam conceitos centrais do domínio
- Não devem conter lógica de negócio complexa
- Devem ser independentes de infraestrutura

```python
# ✅ BOM
class Load(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    company_id: UUID = Field(foreign_key="company.id")
    title: str
    description: str | None = None
    weight_kg: int
    volume_m3: float
    status: str = "open"  # Use constantes
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
```

### 3. Value Objects
- Imutáveis, sem identidade
- Encapsulam comportamento relacionado

```python
# ✅ A IMPLEMENTAR - Exemplo
from pydantic import BaseModel

class LoadDimensions(BaseModel):
    """Value Object para dimensões da carga."""
    weight_kg: int
    volume_m3: float
    
    def is_overweight(self, max_weight: int) -> bool:
        return self.weight_kg > max_weight
```

### 4. Agregados
- Coleção de entidades que mudam juntas
- `Load` é um agregado com `LoadInterest`

```python
# ✅ BOM - Transação atômica
def accept_interest(interest_id: str, session: Session):
    """Accept load interest - transação atômica."""
    interest = session.exec(select(LoadInterest).where(...)).first()
    load = session.get(Load, interest.load_id)
    
    # Muda o agregado inteiro atomicamente
    interest.status = "ACCEPTED"
    load.status = "ASSIGNED"
    load.assigned_transporter_id = interest.transporter_id
    
    session.add(interest)
    session.add(load)
    session.commit()
```

### 5. Repositories (a implementar)
- Abstração para acesso a dados
- Separa lógica de negócio da persistência

```python
# ✅ A IMPLEMENTAR
class LoadRepository:
    def __init__(self, session: Session):
        self.session = session
    
    def find_by_id(self, load_id: UUID) -> Load | None:
        return self.session.get(Load, load_id)
    
    def find_by_company(self, company_id: UUID) -> list[Load]:
        return self.session.exec(
            select(Load).where(Load.company_id == company_id)
        ).all()
```

### 6. Domain Events
- Notificações de mudanças importantes
- Implementar sistema de eventos

```python
# ✅ A IMPLEMENTAR
class DomainEvent:
    """Base class for domain events."""
    event_type: str
    timestamp: datetime = Field(default_factory=datetime.now)
    
class LoadCreatedEvent(DomainEvent):
    event_type = "load_created"
    load_id: UUID
    company_id: UUID
```

---

## 📐 Padrões de Código

### 1. Nomeação de Variáveis
```python
# ❌ RUIM
d = datetime.now()
u = session.exec(statement).first()
li = []

# ✅ BOM
current_timestamp = datetime.now()
user = session.exec(statement).first()
load_interests = []
```

### 2. Booleanos
```python
# ❌ RUIM
if load.status == "open":
if load.status != "assigned":

# ✅ BOM
is_open = load.status == LoadStatus.OPEN
is_assigned = load.status == LoadStatus.ASSIGNED
```

### 3. Loops e Condicionais
```python
# ❌ RUIM
for item in items:
    if item:
        do_something(item)

# ✅ BOM
active_items = [item for item in items if item.is_active]
for item in active_items:
    process_item(item)
```

### 4. Função/Método Puro
- Sem efeitos colaterais quando possível
- Testável e previsível

```python
# ✅ BOM
def calculate_load_volume_m3(weight_kg: int) -> float:
    """Pure function - sem efeitos colaterais."""
    return weight_kg * 0.05  # 50kg = 2.5m³ esperado
```

---

## 🧪 Testes

### 1. Estrutura de Testes
```
tests/
├── unit/
│   ├── test_models.py
│   └── test_schemas.py
└── integration/
    ├── test_loads_api.py
    └── test_auth_api.py
```

### 2. Exemplo de Teste
```python
# ✅ BOM
def test_create_load_success(client, db_session, current_user):
    """Test creating a load successfully."""
    load_data = LoadCreate(
        title="Test Load",
        weight_kg=100,
        volume_m3=5.0
    )
    
    response = client.post(
        "/loads/",
        json=load_data.model_dump(),
        headers={"Authorization": f"Bearer {token}"}
    )
    
    assert response.status_code == 200
    assert response.json()["title"] == "Test Load"
```

---

## ✅ Checklist de Código

Antes de fazer commit:

- [ ] Sem imports não utilizados
- [ ] Sem código comentado
- [ ] Todos os type hints presentes
- [ ] Docstrings em funções públicas
- [ ] Mensagens de erro claras
- [ ] Constantes utilizadas em vez de magic numbers
- [ ] Nomes de variáveis claros
- [ ] Máximo 30 linhas por função
- [ ] Sem variáveis não utilizadas
- [ ] Testes escritos para novas funcionalidades

---

## 📚 Referências

- [Clean Code by Robert C. Martin](https://www.oreilly.com/library/view/clean-code-a/9780136083238/)
- [Domain-Driven Design](https://www.domainlanguage.com/ddd/)
- [FastAPI Best Practices](https://fastapi.tiangolo.com/deployment/concepts/)
- [Python PEP 8](https://www.python.org/dev/peps/pep-0008/)

---

## 🔄 Próximos Passos

1. Implementar Pattern Repository
2. Criar camada de Services para lógica de negócio
3. Implementar Domain Events
4. Adicionar testes unitários
5. Adicionar testes de integração
6. Configurar CI/CD com linting automático
