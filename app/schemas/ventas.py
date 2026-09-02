from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict, field_validator

class VentaDetalleCreate(BaseModel):
    producto_id: int
    cantidad: int = Field(gt=0, description="Debe ser mayor a 0")


class VentaCreate(BaseModel):
    cliente_id: int
    items: list[VentaDetalleCreate]

    @field_validator("items")
    @classmethod
    def validar_items_no_vacio(cls, valor: list[VentaDetalleCreate]) -> list[VentaDetalleCreate]:
        if len(valor) == 0:
            raise ValueError("La venta debe tener al menos un ítem")
        return valor


class VentaDetalleOut(BaseModel):
    id: int
    producto_id: int
    cantidad: int
    precio_unitario: float

    model_config = ConfigDict(from_attributes=True)


class VentaOut(BaseModel):
    id: int
    cliente_id: int
    fecha: datetime
    total: float
    estado: str
    detalles: list[VentaDetalleOut]

    model_config = ConfigDict(from_attributes=True)

class VentaUpdate(BaseModel):
    items: list[VentaDetalleCreate]

    @field_validator("items")
    @classmethod
    def validar_items_no_vacio(cls, valor: list[VentaDetalleCreate]) -> list[VentaDetalleCreate]:
        if len(valor) == 0:
            raise ValueError("La venta debe tener al menos un ítem")
        return valor