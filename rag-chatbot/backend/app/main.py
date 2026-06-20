import os
from dotenv import load_dotenv
load_dotenv()
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from app.database.connection import engine, Base
from app.api import chat, documents, system
from app.services.logging_service import LoggingService

# Verify Directories Exist
for path in ["./uploads", "./logs", "./chroma_db"]:
    if not os.path.exists(path):
        os.makedirs(path, exist_ok=True)

Base.metadata.create_all(bind=engine)

logger = LoggingService()

limiter = Limiter(key_func=get_remote_address, default_limits=["60/minute"])
app = FastAPI(title="Production RAG Backend Engine Engine", version="1.0.0")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

origins = [org.strip() for org in os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def log_and_trace_context(request: Request, call_next):
    import uuid
    request_id = request.headers.get("X-Request-ID", str(uuid.uuid4()))
    logger.info(f"Incoming Request: {request.method} {request.url.path} | Request ID: {request_id}")
    try:
        response = await call_next(request)
        response.headers["X-Request-ID"] = request_id
        return response
    except Exception as e:
        logger.error(f"Unhandled system trace crash: {str(e)}", exc_info=True)
        return JSONResponse(
            status_code=500,
            content={"detail": "An internal system breakdown verified on runtime execution logs."}
        )

app.include_router(system.router, prefix="/api")
app.include_router(documents.router, prefix="/api")
app.include_router(chat.router, prefix="/api")