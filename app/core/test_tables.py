from app.core.database import Base, engine
from app import models  # dispara el import de __init__.py -> registra Cliente

Base.metadata.create_all(bind=engine)
print("Tablas creadas:", list(Base.metadata.tables.keys()))