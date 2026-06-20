import os
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Set test environment flags before bootstrapping service layers
os.environ["DATABASE_URL"] = "sqlite:///./test_app.db"
os.environ["CHROMA_DB_PATH"] = "./test_chroma_db"
os.environ["UPLOAD_FOLDER"] = "./test_uploads"
os.environ["HF_API_KEY"] = "mock_test_token"

from app.database.connection import Base
from app.database.session import get_db
from app.main import app

TEST_DATABASE_URL = "sqlite:///./test_app.db"
engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="session", autouse=True)
def setup_test_directories():
    for d in ["./test_uploads", "./test_chroma_db"]:
        if not os.path.exists(d):
            os.makedirs(d, exist_ok=True)
    yield
    # Cleanup files post execution runs
    for d in ["./test_uploads", "./test_chroma_db"]:
        if os.path.exists(d):
            import shutil
            shutil.rmtree(d, ignore_errors=True)
    if os.path.exists("./test_app.db"):
        os.remove("./test_app.db")

@pytest.fixture
def db_session():
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)

@pytest.fixture
def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass
    app.dependency_overrides[get_db] = override_get_db
    from httpx import AsyncClient
    yield AsyncClient(app=app, base_url="http://test")
    app.dependency_overrides.clear()