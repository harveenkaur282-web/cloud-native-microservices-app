from fastapi import FastAPI

from app.database import Base,engine
from app import models
from app.routes import router


Base.metadata.create_all(
    bind=engine
)


app = FastAPI(
    title="Inventory Service",
    version="0.1.0"
)


app.include_router(router)


@app.get("/")
def root():

    return {
        "message":"Inventory service running"
    }



@app.get("/api/v1/health")
def health():

    return {
        "status":"healthy"
    }