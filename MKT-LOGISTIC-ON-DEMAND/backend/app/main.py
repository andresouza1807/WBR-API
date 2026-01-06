from fastapi import FastAPI
from contextlib import asynccontextmanager
from uuid import uuid4

from app.core.database import init_db
from app.api.load_interest import router as load_interest_router
from app.core.security import create_access_token
from app.schemas.auth_login import Loginrequest


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize the database when the application starts
    print("Initializing database...")
    init_db()
    yield
    # Perform any necessary cleanup here when the application shuts down
    print("Shutting down application...")

app = FastAPI(lifespan=lifespan)

app.include_router(load_interest_router,
                   prefix="/load_interest")


@app.get("/")
async def read_root():
    return {"message": "Welcome to the HEAVEN!"}


@app.post("/auth/login")
async def login(payload: Loginrequest):
    user_payload = {
        "user_id": str(uuid4()),
        "company_id": str(uuid4()),
        "roles": "empresa"
    }

    token = create_access_token(user_payload)

    return {
        "access_token": token,
        "token_type": "bearer"
    }

    # return {"message": "Login successful"}


# @app.get("/health")
# async def health_check():
#     return {"status": "ok"}


# @app.get("/version")
# async def get_version():
#     return {"version": "1.0.0"}


# @app.get("/status")
# async def get_status():
#     return {"status": "running"}


# @app.get("/load_interest")
# async def load_interest_status():
#     return {"load_interest": "active"}
