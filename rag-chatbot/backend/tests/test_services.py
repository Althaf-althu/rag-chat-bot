import pytest
import os
from app.services.document_service import DocumentProcessingService
from app.services.embedding_service import EmbeddingService

def test_document_chunking_logic():
    sample_text = "This is a sample sentence repeated several times to test text chunking strategies. " * 20
    chunks = DocumentProcessingService.chunk_text(sample_text, chunk_size=100, overlap=10)
    assert len(chunks) > 1
    assert all(isinstance(c, str) for c in chunks)

def test_embedding_service_shape():
    service = EmbeddingService()
    test_str = "Evaluate standard embedding returns vector dimensionality correctness."
    vector = service.embed_query(test_str)
    assert isinstance(vector, list)
    assert len(vector) == 384 # MiniLM dimensions