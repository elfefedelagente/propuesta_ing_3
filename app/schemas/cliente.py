import re
from pydantic import BaseModel, EmailStr, field_validator, ConfigDict

PATRON_SOLO_LETRAS = re.compile(r"^[A-Za-zÁÉÍÓÚÑáéíóúñ\s]+$")
PATRON_TELEFONO = re.compile(r"^[0-9\-]+$")


class ClienteBase(BaseModel):
    dni: str
    nombre: str
    apellido: str
    email: EmailStr
    telefono: str

    @field_validator("nombre", "apellido")
    @classmethod
    def validar_solo_letras(cls, valor: str) -> str:
        if not PATRON_SOLO_LETRAS.match(valor):
            raise ValueError("El campo solo debe contener letras")
        return valor

    @field_validator("telefono")
    @classmethod
    def validar_telefono(cls, valor: str) -> str:
        if not PATRON_TELEFONO.match(valor):
            raise ValueError("El formato de teléfono es incorrecto")
        return valor


class ClienteCreate(ClienteBase):
    pass


class ClienteUpdate(ClienteBase):
    pass


class ClienteOut(ClienteBase):
    id: int
    estado: bool

    model_config = ConfigDict(from_attributes=True)