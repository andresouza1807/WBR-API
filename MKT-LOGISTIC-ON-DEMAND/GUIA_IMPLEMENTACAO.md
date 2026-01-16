# 🛠️ Guia de Implementação - Próximas Fases

## Fase 3: Refatoração com DDD

### 1. Implementar Repository Pattern

#### Arquivo: `app/repositories/base_repository.py`
```python
from abc import ABC, abstractmethod
from typing import Generic, TypeVar, List
from uuid import UUID
from sqlmodel import Session

T = TypeVar('T')

class BaseRepository(ABC, Generic[T]):
    \"\"\"Base repository for all domain entities.\"\"\"
    
    def __init__(self, session: Session, model_class):
        self.session = session
        self.model_class = model_class
    
    def find_by_id(self, entity_id: UUID) -> T | None:
        \"\"\"Find entity by ID.\"\"\"
        return self.session.get(self.model_class, entity_id)
    
    def find_all(self) -> List[T]:
        \"\"\"Find all entities.\"\"\"
        from sqlmodel import select
        return self.session.exec(select(self.model_class)).all()
    
    def create(self, entity: T) -> T:
        \"\"\"Create a new entity.\"\"\"
        self.session.add(entity)
        self.session.commit()
        self.session.refresh(entity)
        return entity
    
    def update(self, entity: T) -> T:
        \"\"\"Update an entity.\"\"\"
        self.session.add(entity)
        self.session.commit()
        self.session.refresh(entity)
        return entity
    
    def delete(self, entity: T) -> None:
        \"\"\"Delete an entity.\"\"\"
        self.session.delete(entity)
        self.session.commit()
```

#### Arquivo: `app/repositories/load_repository.py`
```python
from uuid import UUID
from sqlmodel import Session, select
from app.repositories.base_repository import BaseRepository
from app.models.load import Load

class LoadRepository(BaseRepository[Load]):
    \"\"\"Repository for Load entity.\"\"\"
    
    def __init__(self, session: Session):
        super().__init__(session, Load)
    
    def find_by_company(self, company_id: UUID) -> list[Load]:
        \"\"\"Find loads by company ID.\"\"\"
        statement = select(Load).where(Load.company_id == company_id)
        return self.session.exec(statement).all()
    
    def find_by_status(self, status: str) -> list[Load]:
        \"\"\"Find loads by status.\"\"\"
        statement = select(Load).where(Load.status == status)
        return self.session.exec(statement).all()
    
    def find_open_loads(self, company_id: UUID) -> list[Load]:
        \"\"\"Find open loads for a company.\"\"\"
        from app.core.events import LoadStatus
        statement = select(Load).where(
            Load.company_id == company_id,
            Load.status == LoadStatus.OPEN
        )
        return self.session.exec(statement).all()
```

---

### 2. Implementar Domain Services

#### Arquivo: `app/services/load_service.py`
```python
from uuid import UUID
from sqlmodel import Session
from app.models.load import Load
from app.models.user import User
from app.repositories.load_repository import LoadRepository
from app.schemas.load import LoadCreate, LoadUpdate
from app.services.event_logger import log_event
from app.core.events import EventType, LoadStatus

class LoadService:
    \"\"\"Business logic for Load entity.\"\"\"
    
    def __init__(self, session: Session):
        self.session = session
        self.repository = LoadRepository(session)
    
    def create_load(
        self,
        load_data: LoadCreate,
        current_user: User
    ) -> Load:
        \"\"\"
        Create a new load.
        
        Args:
            load_data: Load data
            current_user: Current authenticated user
            
        Returns:
            Created Load
            
        Raises:
            ValidationError: If load data is invalid
        \"\"\"
        # Validate business rules
        self._validate_load_data(load_data)
        
        # Create load
        load = Load(
            company_id=current_user.company_id,
            created_by=current_user.id,
            **load_data.model_dump()
        )
        
        # Persist
        created_load = self.repository.create(load)
        
        # Log event
        log_event(
            session=self.session,
            company_id=current_user.company_id,
            user_id=current_user.id,
            entity_id=created_load.id,
            entity_type="load",
            event_type=EventType.LOAD_CREATED,
            payload={
                \"title\": created_load.title,
                \"weight_kg\": created_load.weight_kg,
                \"volume_m3\": created_load.volume_m3,
            },
        )
        
        return created_load
    
    def get_load(self, load_id: UUID, company_id: UUID) -> Load:
        \"\"\"Get load by ID with company validation.\"\"\"
        load = self.repository.find_by_id(load_id)
        if not load or load.company_id != company_id:
            raise ValueError(\"Load not found\")
        return load
    
    def list_company_loads(self, company_id: UUID) -> list[Load]:
        \"\"\"List all loads for a company.\"\"\"
        return self.repository.find_by_company(company_id)
    
    def _validate_load_data(self, load_data: LoadCreate) -> None:
        \"\"\"Validate load data according to business rules.\"\"\"
        # Example validations
        if load_data.weight_kg <= 0:
            raise ValueError(\"Weight must be greater than 0\")
        
        if load_data.volume_m3 <= 0:
            raise ValueError(\"Volume must be greater than 0\")
        
        if load_data.weight_kg > 50000:  # Max weight per load
            raise ValueError(\"Weight exceeds maximum limit (50,000 kg)\")
```

---

### 3. Implementar Domain Events

#### Arquivo: `app/core/domain_events.py`
```python
from dataclasses import dataclass, asdict
from uuid import UUID
from datetime import datetime
from abc import ABC

@dataclass
class DomainEvent(ABC):
    \"\"\"Base class for domain events.\"\"\"
    aggregate_id: UUID
    event_type: str
    timestamp: datetime = None
    
    def __post_init__(self):
        if self.timestamp is None:
            self.timestamp = datetime.now()
    
    def to_dict(self) -> dict:
        \"\"\"Convert event to dictionary.\"\"\"
        return asdict(self)

@dataclass
class LoadCreatedEvent(DomainEvent):
    \"\"\"Event triggered when a load is created.\"\"\"
    event_type: str = \"load.created\"
    company_id: UUID = None
    title: str = None
    weight_kg: int = None
    volume_m3: float = None

@dataclass
class LoadInterestAcceptedEvent(DomainEvent):
    \"\"\"Event triggered when load interest is accepted.\"\"\"
    event_type: str = \"load.interest_accepted\"
    transporter_id: UUID = None
    proposed_price: float = None

@dataclass
class LoadInTransitEvent(DomainEvent):
    \"\"\"Event triggered when load changes to in_transit status.\"\"\"
    event_type: str = \"load.in_transit\"
    transporter_id: UUID = None
    estimated_delivery: datetime = None

class DomainEventPublisher:
    \"\"\"Publish domain events.\"\"\"
    
    _subscribers = {}
    
    @classmethod
    def subscribe(cls, event_type: str, handler):
        \"\"\"Subscribe to an event type.\"\"\"
        if event_type not in cls._subscribers:
            cls._subscribers[event_type] = []
        cls._subscribers[event_type].append(handler)
    
    @classmethod
    def publish(cls, event: DomainEvent):
        \"\"\"Publish an event to all subscribers.\"\"\"
        handlers = cls._subscribers.get(event.event_type, [])
        for handler in handlers:
            handler(event)
```

---

### 4. Refatorar Endpoints com Services

#### Arquivo: `app/api/loads.py` (Refatorado)
```python
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session

from app.models.user import User
from app.core.database import get_session
from app.api.deps import get_current_user
from app.services.load_service import LoadService
from app.schemas.load import LoadCreate, LoadUpdate, LoadResponse

router = APIRouter(prefix=\"/loads\", tags=[\"Loads\"])

def get_load_service(session: Session = Depends(get_session)) -> LoadService:
    \"\"\"Dependency to get LoadService.\"\"\"
    return LoadService(session)

@router.get(\"/\", response_model=list[LoadResponse])
def list_loads(
    current_user: User = Depends(get_current_user),
    service: LoadService = Depends(get_load_service)
):
    \"\"\"List all loads for the current company.\"\"\"
    return service.list_company_loads(current_user.company_id)

@router.post(\"/\", response_model=LoadResponse)
def create_load(
    load_data: LoadCreate,
    current_user: User = Depends(get_current_user),
    service: LoadService = Depends(get_load_service)
):
    \"\"\"Create a new load.\"\"\"
    try:
        return service.create_load(load_data, current_user)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get(\"/{load_id}\", response_model=LoadResponse)
def get_load(
    load_id: str,
    current_user: User = Depends(get_current_user),
    service: LoadService = Depends(get_load_service)
):
    \"\"\"Get a specific load.\"\"\"
    try:
        return service.get_load(load_id, current_user.company_id)
    except ValueError:
        raise HTTPException(status_code=404, detail=\"Load not found\")
```

---

### 5. Estrutura de Testes

#### Arquivo: `tests/unit/test_load_service.py`
```python
import pytest
from uuid import uuid4
from sqlmodel import Session, create_engine, SQLModel
from sqlmodel.pool import StaticPool

from app.models.load import Load
from app.models.user import User
from app.models.company import Company
from app.services.load_service import LoadService
from app.schemas.load import LoadCreate

@pytest.fixture
def db_session():
    \"\"\"Create in-memory SQLite database for testing.\"\"\"
    engine = create_engine(
        \"sqlite:///:memory:\",
        connect_args={\"check_same_thread\": False},
        poolclass=StaticPool,
    )
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        yield session

@pytest.fixture
def test_company(db_session):
    \"\"\"Create a test company.\"\"\"
    company = Company(name=\"Test Company\")
    db_session.add(company)
    db_session.commit()
    db_session.refresh(company)
    return company

@pytest.fixture
def test_user(db_session, test_company):
    \"\"\"Create a test user.\"\"\"
    user = User(
        name=\"Test User\",
        email=\"test@example.com\",
        password_hash=\"hashed_password\",
        company_id=test_company.id
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user

def test_create_load_success(db_session, test_user):
    \"\"\"Test creating a load successfully.\"\"\"
    service = LoadService(db_session)
    load_data = LoadCreate(
        title=\"Test Load\",
        weight_kg=100,
        volume_m3=5.0
    )
    
    load = service.create_load(load_data, test_user)
    
    assert load.id is not None
    assert load.title == \"Test Load\"
    assert load.weight_kg == 100
    assert load.company_id == test_user.company_id

def test_create_load_invalid_weight(db_session, test_user):
    \"\"\"Test creating a load with invalid weight.\"\"\"
    service = LoadService(db_session)
    load_data = LoadCreate(
        title=\"Test Load\",
        weight_kg=-100,  # Invalid
        volume_m3=5.0
    )
    
    with pytest.raises(ValueError):
        service.create_load(load_data, test_user)

def test_list_company_loads(db_session, test_user):
    \"\"\"Test listing company loads.\"\"\"
    service = LoadService(db_session)
    
    # Create multiple loads
    for i in range(3):
        load_data = LoadCreate(
            title=f\"Load {i}\",
            weight_kg=100 * (i + 1),
            volume_m3=5.0 * (i + 1)
        )
        service.create_load(load_data, test_user)
    
    loads = service.list_company_loads(test_user.company_id)
    assert len(loads) == 3
```

---

## 🚀 Passos para Implementação

### 1. Criar a Estrutura de Repositories
```bash
mkdir -p backend/app/repositories
touch backend/app/repositories/__init__.py
touch backend/app/repositories/base_repository.py
touch backend/app/repositories/load_repository.py
touch backend/app/repositories/user_repository.py
```

### 2. Implementar Services
```bash
mkdir -p backend/app/services
touch backend/app/services/load_service.py
touch backend/app/services/user_service.py
touch backend/app/services/load_interest_service.py
```

### 3. Refatorar Endpoints
```bash
# Atualizar app/api/loads.py
# Atualizar app/api/load_interest.py
# Atualizar app/api/auth.py
```

### 4. Implementar Testes
```bash
mkdir -p backend/tests
touch backend/tests/__init__.py
mkdir -p backend/tests/unit
mkdir -p backend/tests/integration
touch backend/tests/conftest.py
touch backend/tests/unit/test_load_service.py
touch backend/tests/integration/test_loads_api.py
```

### 5. Executar Testes
```bash
cd backend
pytest -v
pytest --cov=app tests/
```

---

## 📝 Checklist de Implementação

- [ ] Criar base_repository.py
- [ ] Criar load_repository.py
- [ ] Criar load_service.py
- [ ] Refatorar loads.py endpoints
- [ ] Criar domain_events.py
- [ ] Implementar event publisher
- [ ] Criar testes unitários
- [ ] Refatorar load_interest.py
- [ ] Implementar load_interest_service.py
- [ ] Criar testes de integração
- [ ] Documentar APIs (Swagger)
- [ ] Configurar CI/CD (GitHub Actions/GitLab CI)

---

## 🎓 Recursos Adicionais

1. **SQLAlchemy Repository Pattern**
   - https://github.com/sqlalchemy/sqlalchemy

2. **FastAPI Dependency Injection**
   - https://fastapi.tiangolo.com/tutorial/dependencies/

3. **Domain-Driven Design Implementation**
   - https://dddpy.readthedocs.io/

4. **pytest for FastAPI**
   - https://fastapi.tiangolo.com/advanced/testing-dependencies/

---

**Próximo passo:** Escolha qual padrão implementar primeiro (Repositories, Services ou Testes)
