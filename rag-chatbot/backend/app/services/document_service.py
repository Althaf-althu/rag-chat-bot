import os
from PyPDF2 import PdfReader
import pdfplumber
from docx import Document as DocxDocument
from langchain_text_splitters import RecursiveCharacterTextSplitter

from app.utils.helpers import clean_extracted_text

class DocumentProcessingService:
    @staticmethod
    def extract_text(file_path: str, file_ext: str) -> str:
        text = ""
        if file_ext == ".pdf":
            # Hybrid framework extracting via pdfplumber cascading down to PyPDF2
            try:
                with pdfplumber.open(file_path) as pdf:
                    for page in pdf.pages:
                        extracted = page.extract_text()
                        if extracted:
                            text += extracted + "\n"
            except Exception:
                reader = PdfReader(file_path)
                for page in reader.pages:
                    text += page.extract_text() or ""
        elif file_ext == ".docx":
            doc = DocxDocument(file_path)
            text = "\n".join([p.text for p in doc.paragraphs])
        elif file_ext in [".txt", ".md"]:
            with open(file_path, "r", encoding="utf-8") as f:
                text = f.read()
        else:
            raise ValueError(f"Extension type unsupported parsing target: {file_ext}")
        
        return clean_extracted_text(text)

    @staticmethod
    def chunk_text(text: str, chunk_size: int = 512, overlap: int = 50) -> list[str]:
        splitter = RecursiveCharacterTextSplitter(
            chunk_size=chunk_size,
            chunk_overlap=overlap,
            length_function=len
        )
        return splitter.split_text(text)