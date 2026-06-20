import os
from sentence_transformers import SentenceTransformer

class EmbeddingService:
    _model_instance = None

    def __init__(self):
        model_name = os.getenv("EMBEDDING_MODEL", "sentence-transformers/all-MiniLM-L6-v2")
        cache_dir = "./saved_models"
        if EmbeddingService._model_instance is None:
            EmbeddingService._model_instance = SentenceTransformer(model_name, cache_folder=cache_dir)
        self.model = EmbeddingService._model_instance

    def embed_query(self, text: str) -> list[float]:
        embedding = self.model.encode(text)
        return embedding.tolist()

    def embed_documents(self, texts: list[str]) -> list[list[float]]:
        embeddings = self.model.encode(texts)
        return embeddings.tolist()