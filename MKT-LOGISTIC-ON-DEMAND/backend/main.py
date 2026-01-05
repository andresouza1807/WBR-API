from fastapi import FastAPI
from app.api.loads import router as loads_router

app = FastAPI(title="TESTE API - PPC", version="1.0.0")

app.include_router(loads_router)
