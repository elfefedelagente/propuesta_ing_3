from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from sqlalchemy import or_
from typing import Optional

from app.core.database import get_db
from app.models.producto import Producto
from  app.schemas.producto import ProductoCreate, ProductoUpdate, ProductoOut 

router = APIRouter(prefix="/productos", tags=["productos"])

# Listar
@router.get("/", response_model=list[ProductoOut])
def listar_productos(busqueda: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Producto)

    if busqueda:
        patron = f"%{busqueda}%"
        query = query.filter(
            or_(
                Producto.sku.like(patron),
                Producto.nombre.like(patron),
            )
        )

    return query.all()

# Crear
@router.post("/", response_model=ProductoOut, status_code=201)
def crear_producto(producto: ProductoCreate, db: Session = Depends(get_db)):
    nuevo_producto = Producto(**producto.model_dump())
    db.add(nuevo_producto)

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="El producto ya se encuentra registrado (SKU duplicado)"
        )

    db.refresh(nuevo_producto)
    return nuevo_producto

# Modificar
@router.put("/sku/{sku}", response_model=ProductoOut)
def modificar_producto(sku: str, datos: ProductoUpdate, db: Session = Depends(get_db)):
    producto = db.query(Producto).filter(Producto.sku == sku).first()

    if producto is None:
        raise HTTPException(status_code=404, detail="Producto no encontrado")

    if datos.sku != producto.sku:
        existe = db.query(Producto).filter(
            Producto.sku == datos.sku,
            Producto.id != producto.id,
        ).first()

        if existe:
            raise HTTPException(
                status_code=409,
                detail="El SKU ya se encuentra registrado para otro producto"
            )
        
    for campo, valor in datos.model_dump().items():
        setattr(producto, campo, valor)        

    db.commit()
    db.refresh(producto)
    return producto

@router.patch("/sku/{sku}/baja", response_model=ProductoOut)
def baja_producto(sku: str, db: Session = Depends(get_db)):
    producto = db.query(Producto).filter(Producto.sku == sku).first()

    if producto is None:
        raise HTTPException(status_code=404, detail="Producto no encontrado")

    producto.estado = False
    db.commit()
    db.refresh(producto)
    return producto