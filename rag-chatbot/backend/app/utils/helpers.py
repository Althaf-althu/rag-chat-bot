import re
import os

def sanitize_filename(filename: str) -> str:
    """Strip out components attempting arbitrary path traversal."""
    filename = os.path.basename(filename)
    filename = re.sub(r'[^\w\.\-]', '_', filename)
    return filename

def clean_extracted_text(text: str) -> str:
    """Normalize whitespace artifacts out of document extractions."""
    if not text:
        return ""
    text = re.sub(r'\s+', ' ', text)
    return text.strip()