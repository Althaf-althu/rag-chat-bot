import os
import chromadb
from chromadb.config import Settings

class VectorStoreService:
    def __init__(self):
        db_path = os.getenv("CHROMA_DB_PATH", "./chroma_db")
        self.client = chromadb.PersistentClient(path=db_path, settings=Settings(allow_reset=True))
        self.collection = self.client.get_or_create_collection("rag_documents")

    def add_vectors(self, ids: list[str], embeddings: list[list[float]], documents: list[str], metadatas: list[dict]):
        self.collection.add(
            ids=ids,
            embeddings=embeddings,
            documents=documents,
            metadatas=metadatas
        )

    def query_similarity(self, query_embedding: list[float], top_k: int = 5) -> dict:
        results = self.collection.query(
            query_embeddings=[query_embedding],
            n_results=top_k
        )
        return results

    def delete_by_document_id(self, doc_id: str):
        self.collection.delete(where={"document_id": doc_id})

    def reset_store(self):
        self.client.reset()
        self.collection = self.client.get_or_create_collection("rag_documents")

    def get_stats(self) -> int:
        return self.collection.count()