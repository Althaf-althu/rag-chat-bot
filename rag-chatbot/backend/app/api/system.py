import os
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.schemas import SystemStatusResponse
from app.services.vector_service import VectorStoreService
from app.models.db_models import DBActiveDocument

router = APIRouter(tags=["System Framework Services Engine"])

@router.get("/health")
def liveness_ping_probe():
    return {"status": "healthy"}

@router.get("/status", response_model=SystemStatusResponse)
def gather_system_performance_metrics(db: Session = Depends(get_db), vector_service: VectorStoreService = Depends()):
    db_healthy = True
    total_docs = 0
    try:
        total_docs = db.query(DBActiveDocument).count()
    except Exception:
        db_healthy = False
        
    vector_healthy = True
    try:
        vector_service.get_stats()
    except Exception:
        vector_healthy = False
        
    return SystemStatusResponse(
        llm_model=os.getenv("HF_MODEL_ID", "mistralai/Mistral-7B-Instruct-v0.3"),
        embedding_model=os.getenv("EMBEDDING_MODEL", "sentence-transformers/all-MiniLM-L6-v2"),
        vector_store_healthy=vector_healthy,
        database_healthy=db_healthy,
        total_indexed_documents=total_docs
    )