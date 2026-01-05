from fastapi import FastAPI
from contextlib import asynccontextmanager

from app.core.database import init_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize the database when the application starts
    print("Initializing database...")
    init_db()
    yield
    # Perform any necessary cleanup here when the application shuts down
    print("Shutting down application...")

app = FastAPI(lifespan=lifespan)


@app.get("/")
async def read_root():
    return {"message": "Welcome to the HEAVEN!"}
