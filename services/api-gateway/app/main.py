from dotenv import load_dotenv

load_dotenv()


from fastapi import FastAPI
from app.routes import router


app = FastAPI(
    title="CloudCart API Gateway",
    version="0.1.0"
)


app.include_router(router)


@app.get("/")
def root():
    return {
        "message":"API Gateway running"
    }


@app.get("/health")
def health():
    return {
        "status":"healthy"
    }