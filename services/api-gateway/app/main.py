from dotenv import load_dotenv

load_dotenv()


from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import router


app = FastAPI(
    title="CloudCart API Gateway",
    version="0.1.0"
)


# CORS Middleware Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# FUTURE JWT MIDDLEWARE PLACEHOLDER
# Do not implement authentication yet.
# @app.middleware("http")
# async def jwt_auth_middleware(request, call_next):
#     # TODO: Add JWT token extraction, validation, and user context propagation
#     # authorization = request.headers.get("Authorization")
#     # if not authorization:
#     #     return JSONResponse(status_code=401, content={"detail": "Not authenticated"})
#     return await call_next(request)


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