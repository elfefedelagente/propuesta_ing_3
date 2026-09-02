## Configuracion de la base de datos --> traduce clases Python a tablas SQL
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy import event
from app.core.config import settings

engine = create_engine(
    settings.DATABASE_URL,
    connect_args={"check_same_thread": False}  # Solo para SQLite
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base() # Clase que va a contener las tablas con los metadatos

@event.listens_for(engine, "connect")
def foreing_key_pragma(dbapi_connection, connection_record):
    cursor = dbapi_connection.cursor()
    cursor.execute("PRAGMA foreign_keys=ON") # Los pragmas es la forma de configurar comportamiento interno (activa checkeo de integridad referencial en SQLite)
    cursor.close()

def get_db():
    db = SessionLocal()
    try:
        yield db # dependency injection de FastAPI.
    finally:
        db.close()