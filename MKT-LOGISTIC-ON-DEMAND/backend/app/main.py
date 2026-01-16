from fastapi import FastAPI
from contextlib import asynccontextmanager

from app.core.database import init_db
from app.api.load_interest import router as load_interest_router
from app.api.loads import router as loads_router
from app.api.auth import router as auth_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize the database when the application starts
    print("Initializing database...")
    init_db()
    yield
    # Perform any necessary cleanup here when the application shuts down
    print("Shutting down application...")

app = FastAPI(
    title="MKT Logistic On-Demand",
    description="Plataforma de Logística sob Demanda",
    version="1.0.0",
    lifespan=lifespan
)

# Register all routers
app.include_router(auth_router)
app.include_router(loads_router)
app.include_router(load_interest_router, prefix="/load_interest")


@app.get("/")
async def read_root():
    return {"message": "Welcome to MKT Logistic On-Demand Platform!"}


@app.get("/health")
async def health_check():
    return {"status": "ok"}
