from fastapi import Depends
from app.services.embedding_service import EmbeddingService
from app.services.vector_service import VectorStoreService

class RetrievalService:
    def __init__(self, embed_service: EmbeddingService = Depends(), vector_service: VectorStoreService = Depends()):
        self.embed_service = embed_service
        self.vector_service = vector_service

    def retrieve_context(self, query: str, top_k: int = 5) -> tuple[str, list[str]]:
        query_vector = self.embed_service.embed_query(query)
        results = self.vector_service.query_similarity(query_vector, top_k=top_k)
        
        chunks = results.get("documents", [[]])[0]
        metadatas = results.get("metadatas", [[]])[0]
        
        context_blocks = []
        citations = set()
        
        for idx, chunk in enumerate(chunks):
            source = metadatas[idx].get("filename", "Unknown Document") if idx < len(metadatas) else "Unknown Document"
            citations.add(source)
            context_blocks.append(f"--- Context Source Block: {source} ---\n{chunk}")
            
        full_context = "\n\n".join(context_blocks)
        return full_context, list(citations)