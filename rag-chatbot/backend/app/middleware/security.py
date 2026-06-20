import os
from fastapi import HTTPException, UploadFile

ALLOWED_EXTENSIONS = {'.pdf', '.docx', '.txt', '.md'}
ALLOWED_MIME_TYPES = {
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'text/markdown'
}

def validate_uploaded_file(file: UploadFile):
    max_bytes = int(os.getenv("MAX_FILE_SIZE", 10485760))
    
    # Validation step 1: Verify explicit runtime extension patterns
    _, ext = os.path.splitext(file.filename.lower())
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"File extension matching criteria rejected target: '{ext}'")

    # Validation step 2: Match content explicit headers
    if file.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(status_code=400, detail=f"Explicit content runtime signature mismatch: '{file.content_type}'")
        
    # Validation step 3: Size restrictions assessment
    file.file.seek(0, os.SEEK_END)
    size = file.file.tell()
    file.file.seek(0) # Reset tracking descriptors
    
    if size > max_bytes:
        raise HTTPException(status_code=413, detail=f"Maximum allocation barrier breached payload scale limit: {max_bytes} bytes.")