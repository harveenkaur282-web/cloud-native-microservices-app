from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import Base, engine
from app import models, routes
Base.metadata.create_all(bind=engine)
app = FastAPI(
    title="Mini E-commerce User Service",
    version="0.1.0"
)
app.include_router(routes.router)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
    "http://localhost:3000",
    "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {
    "message": "THIS IS THE NEW CODE"
    }

@app.get("/api/v1/health")
def health_check():
    return {
        "status": "healthy",
        "version": "0.1.0"
    }


