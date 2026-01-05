from contextlib import asynccontextmanager
from fastapi import FastAPI

from app.api.auth import router as auth_router
from app.api.auth import router as loads_router
from app.core.database import init_db  # Importe sua função aqui


@asynccontextmanager
async def lifespan(app: FastAPI):
    # O código aqui roda quando o app liga
    init_db()
    yield
    # O código aqui roda quando o app desliga

app = FastAPI(
    title="Plataforma Privada de Cargas",
    lifespan=lifespan
)

app.include_router(auth_router)
app.include_router(loads_router)
