import os
import uuid
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.schemas import DocumentSchema
from app.models.db_models import DBActiveDocument
from app.middleware.security import validate_uploaded_file
from app.utils.helpers import sanitize_filename
from app.services.document_service import DocumentProcessingService
from app.services.embedding_service import EmbeddingService
from app.services.vector_service import VectorStoreService

router = APIRouter(prefix="/documents", tags=["RAG Parsing Document Managers"])

@router.post("/upload", response_model=DocumentSchema)
def upload_and_index_document(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    embed_service: EmbeddingService = Depends(),
    vector_service: VectorStoreService = Depends()
):
    validate_uploaded_file(file)
    safe_name = sanitize_filename(file.filename)
    doc_id = str(uuid.uuid4())
    
    upload_dir = os.getenv("UPLOAD_FOLDER", "./uploads")
    saved_path = os.path.join(upload_dir, f"{doc_id}_{safe_name}")
    
    # Save payload locally
    with open(saved_path, "wb") as f:
        f.write(file.file.read())
        
    try:
        _, ext = os.path.splitext(safe_name.lower())
        raw_text = DocumentProcessingService.extract_text(saved_path, ext)
        
        if not raw_text.strip():
            raise HTTPException(status_code=400, detail="Document layout parsing returned no text.")
            
        chunks = DocumentProcessingService.chunk_text(raw_text)
        
        chunk_ids = [f"{doc_id}_{idx}" for idx in range(len(chunks))]
        embeddings = embed_service.embed_documents(chunks)
        metadatas = [{"document_id": doc_id, "filename": safe_name} for _ in chunks]
        
        vector_service.add_vectors(
            ids=chunk_ids,
            embeddings=embeddings,
            documents=chunks,
            metadatas=metadatas
        )
        
        db_doc = DBActiveDocument(
            id=doc_id,
            filename=safe_name,
            file_path=saved_path,
            file_size=os.path.getsize(saved_path),
            status="Indexed"
        )
        db.add(db_doc)
        db.commit()
        db.refresh(db_doc)
        
        return db_doc
    except Exception as e:
        if os.path.exists(saved_path):
            os.remove(saved_path)
        raise HTTPException(status_code=500, detail=f"Parsing error tracing index flow failure models: {str(e)}")

@router.get("", response_model=list[DocumentSchema])
def list_indexed_documents(db: Session = Depends(get_db)):
    return db.query(DBActiveDocument).all()

@router.delete("/{doc_id}")
def delete_document_by_id(doc_id: str, db: Session = Depends(get_db), vector_service: VectorStoreService = Depends()):
    doc = db.query(DBActiveDocument).filter(DBActiveDocument.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Requested file context matching tracking sequence not found.")
        
    try:
        vector_service.delete_by_document_id(doc_id)
        if os.path.exists(doc.file_path):
            os.remove(doc.file_path)
        db.delete(doc)
        db.commit()
        return {"detail": "Document records and tracking contexts cleared successfully."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database wipe failure trace stack sequence: {str(e)}")

@router.post("/reindex")
def reindex_all_documents(
    db: Session = Depends(get_db),
    embed_service: EmbeddingService = Depends(),
    vector_service: VectorStoreService = Depends()
):
    docs = db.query(DBActiveDocument).all()
    vector_service.reset_store()
    
    for doc in docs:
        if os.path.exists(doc.file_path):
            _, ext = os.path.splitext(doc.filename.lower())
            raw_text = DocumentProcessingService.extract_text(doc.file_path, ext)
            chunks = DocumentProcessingService.chunk_text(raw_text)
            chunk_ids = [f"{doc.id}_{idx}" for idx in range(len(chunks))]
            embeddings = embed_service.embed_documents(chunks)
            metadatas = [{"document_id": doc.id, "filename": doc.filename} for _ in chunks]
            
            vector_service.add_vectors(ids=chunk_ids, embeddings=embeddings, documents=chunks, metadatas=metadatas)
            
    return {"detail": f"Successfully reindexed {len(docs)} documents parameters across store targets."}