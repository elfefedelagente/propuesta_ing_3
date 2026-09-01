from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime
from app.core.database import Base

class Producto(Base):
    __tablename__ = "productos"

    id = Column(Integer, primary_key=True, index=True)
    sku = Column(String, unique=True, index=True, nullable=False) # requisito de tp
    nombre = Column(String, nullable=False)
    marca = Column(String, nullable=False)
    descripcion = Column(String, nullable=True)
    precio = Column(Float, nullable=False)
    stock = Column(Integer, nullable=False)
    estado = Column(Boolean, default=True, nullable=False)