import pytest
import io

@pytest.mark.asyncio
async def test_health_check_endpoint(client):
    response = await client.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy"}

@pytest.mark.asyncio
async def test_invalid_file_upload(client):
    files = {"file": ("malicious.exe", io.BytesIO(b"binary content"), "application/x-msdownload")}
    response = await client.post("/api/documents/upload", files=files)
    assert response.status_code == 400
    assert "File extension" in response.json()["detail"]