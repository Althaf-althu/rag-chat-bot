from sqlalchemy.orm import sessionmaker
from app.database.connection import engine

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    database = SessionLocal()
    try:
        yield database
    finally:
        database.close()