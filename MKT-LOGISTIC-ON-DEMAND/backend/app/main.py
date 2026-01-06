from fastapi import FastAPI
from contextlib import asynccontextmanager

from app.core.database import init_db
from app.api.load_interest import router as load_interest_router


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
async def login():

    return {"message": "Login successful"}


@app.get("/health")
async def health_check():
    return {"status": "ok"}


@app.get("/version")
async def get_version():
    return {"version": "1.0.0"}


@app.get("/status")
async def get_status():
    return {"status": "running"}


@app.get("/load_interest")
async def load_interest_status():
    return {"load_interest": "active"}
