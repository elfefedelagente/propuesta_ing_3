from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from typing import Optional
from sqlalchemy import or_

from app.core.database import get_db
from app.models.cliente import Cliente
from app.schemas.cliente import ClienteCreate, ClienteOut, ClienteUpdate

# prefix antepone /clientes a todas las rutas de este archivo así el @router.post("/") 
# termina siendo en realidad POST /clientes/
# Es para agrúpar visualmente en la documentación automática (/docs).
router = APIRouter(prefix="/clientes", tags=["clientes"])

# Listar
@router.get("/", response_model=list[ClienteOut])
def listar_clientes(
    busqueda: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Cliente) # db.query(Cliente) --> SELECT * FROM clientes

    if busqueda:
        patron = f"%{busqueda}%"
        query = query.filter(

            or_( 
            # or_ arma un WHERE (nombre ILIKE ... 
            #                OR apellido ILIKE ... 
            #                OR dni ILIKE ...). 
            # Sin esto, encadenar tres .filter() seguidos actuaría como AND, no OR 
            # para machear los tres a la vez.
                Cliente.nombre.like(patron),
                Cliente.apellido.like(patron),
                Cliente.dni.like(patron),
            )
        )

    return query.all()

# Crear
@router.post("/", response_model=ClienteOut, status_code=201)
def crear_cliente(cliente: ClienteCreate, db: Session = Depends(get_db)):
    nuevo_cliente = Cliente(**cliente.model_dump()) # **cliente desempaqueta argumentos nombrados al constructor del modelo SQLAlchemy.
    db.add(nuevo_cliente)

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="El cliente ya se encuentra registrado (DNI duplicado)"
        )

    db.refresh(nuevo_cliente)
    return nuevo_cliente

# Modificar
@router.put("/{cliente_id}", response_model=ClienteOut)
def modificar_cliente(cliente_id: int, datos: ClienteUpdate, db: Session = Depends(get_db)):
    cliente = db.query(Cliente).filter(Cliente.id == cliente_id).first( )

    if cliente is None:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")

    if datos.dni != cliente.dni:
        existe = db.query(Cliente).filter(    
            Cliente.dni == datos.dni,
            Cliente.id != cliente_id,
            Cliente.estado == True
        ).first()
        if existe:
            raise HTTPException(status_code=409, detail="El cliente ya se encuentra registrado (DNI duplicado)")

    for campo, valor in datos.model_dump().items():
        setattr(cliente, campo, valor)
    db.commit()
    db.refresh(cliente)
    return cliente

# Baja Lógica
@router.patch("/dni/{dni}/baja", response_model=ClienteOut)
def baja_cliente(dni: str, db: Session = Depends(get_db)):
    cliente = db.query(Cliente).filter(Cliente.dni == dni).first()
    if cliente is None:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")

    cliente.estado = False
    db.commit()
    db.refresh(cliente)
    return cliente