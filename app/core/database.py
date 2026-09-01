## Configuracion de la base de datos --> traduce clases Python a tablas SQL
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

from app.core.config import settings

engine = create_engine(
    settings.DATABASE_URL,
    connect_args={"check_same_thread": False}  # Solo para SQLite
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base() # Clase que va a contener las tablas con los metadatos

def get_db():
    db = SessionLocal()
    try:
        yield db # dependency injection de FastAPI.
    finally:
        db.close()