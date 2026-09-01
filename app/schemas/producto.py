from pydantic import BaseModel, Field, ConfigDict

class ProductoBase(BaseModel):
    sku:str
    nombre:str
    marca:str
    descripcion: str | None = None
    precio: float = Field(gt=0, description="El precio debe ser mayor a 0") # gt=0 --> greater than 0
    stock: int = Field(gt=0, description="El stock no puede ser negativo")

class ProductoCreate(ProductoBase):
    pass

class ProductoUpdate(ProductoBase): 
    pass

class ProductoOut(ProductoBase):
    id: int
    estado: bool

    model_config = ConfigDict(from_attributes=True)