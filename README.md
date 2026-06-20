# RAG Chatbot

A full-stack Retrieval-Augmented Generation (RAG) chatbot application. This project allows users to upload documents (like PDFs), processes them into a vector database, and uses a Large Language Model (LLM) via Hugging Face to answer questions based on the uploaded document's context.

## 🌟 Features

- **Document Ingestion**: Upload PDFs and text documents seamlessly.
- **Context-Aware AI Chat**: The chatbot references your uploaded documents to provide accurate, grounded answers.
- **Modern UI**: A responsive, dark-mode friendly frontend built with React, Vite, and Tailwind CSS.
- **FastAPI Backend**: A high-performance Python backend managing vector embeddings, retrieval, and LLM inference.
- **Hugging Face Integration**: Uses `InferenceClient` to communicate with powerful models like `meta-llama/Llama-3.1-8B-Instruct`.

## 🛠️ Tech Stack

**Frontend:**
- React 18
- TypeScript
- Vite
- Tailwind CSS

**Backend:**
- FastAPI & Uvicorn
- ChromaDB (Vector Database)
- Sentence Transformers (for text embeddings)
- Hugging Face Hub (LLM Inference API)
- PyPDF2 / pdfplumber (Document parsing)

## 📋 Prerequisites

- **Node.js** (v18+ recommended) for the frontend
- **Python** (v3.10+ recommended) for the backend
- **Hugging Face API Key**: You will need a free API token from [Hugging Face](https://huggingface.co/settings/tokens) to run the inference model.

---

## 🚀 Getting Started

The project is split into two directories: `rag-chatbot/backend` and `rag-chatbot/frontend`. You will need to run both concurrently to use the application.

### 1. Backend Setup

Open a terminal and navigate to the backend directory:
```bash
cd rag-chatbot/backend
```

Create a virtual environment and activate it:
```bash
# macOS/Linux
python3 -m venv venv
source venv/bin/activate

# Windows
python -m venv venv
.\venv\Scripts\activate
```

Install the required dependencies:
```bash
pip install -r requirements.txt
```

Set up your Environment Variables:
Create a `.env` file in the `rag-chatbot/backend` directory with the following contents:
```env
HF_API_KEY=your_hugging_face_token_here
HF_MODEL_ID=meta-llama/Llama-3.1-8B-Instruct
```

Start the FastAPI server:
```bash
uvicorn app.main:app --reload
```
The backend will now be running at `http://localhost:8000`.

### 2. Frontend Setup

Open a *new* terminal window and navigate to the frontend directory:
```bash
cd rag-chatbot/frontend
```

Install the Node modules:
```bash
npm install
```

Start the Vite development server:
```bash
npm run dev
```

The frontend will start on `http://localhost:5173`. Open this URL in your browser to start chatting!

---

## 💡 Usage

1. **Upload a Document**: Open the web app and click on "Document Manager" or "Upload" to select a PDF file.
2. **Wait for Processing**: The backend will chunk your document and generate vector embeddings using `sentence-transformers`, storing them locally in ChromaDB.
3. **Ask Questions**: Once processed, go to the Chat interface and ask questions. The app will fetch relevant context from your document and pass it to the Hugging Face model to generate a custom answer!
