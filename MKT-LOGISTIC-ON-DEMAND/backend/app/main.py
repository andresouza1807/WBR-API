from fastapi import FastAPI

from app.api.auth import router as auth_router
from app.api.loads import router as loads_router

app = FastAPI(title="Plataforma Privada de Cargas")

app.include_router(auth_router)
app.include_router(loads_router)


@app.get("/")
def healthcheck():
    return {"status": "ok"}
