# app/routers/ventas.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from datetime import datetime
from typing import Optional

from app.core.database import get_db
from app.models.cliente import Cliente
from app.models.producto import Producto
from app.models.ventas import Venta, VentaDetalle
from app.schemas.ventas import VentaCreate, VentaOut, VentaUpdate

router = APIRouter(prefix="/ventas", tags=["ventas"])

@router.post("/", response_model=VentaOut, status_code=201)
def crear_venta(venta_data: VentaCreate, db: Session = Depends(get_db)):
    cliente = db.query(Cliente).filter(Cliente.id == venta_data.cliente_id).first()
    if cliente is None:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    if cliente.estado is False:
        raise HTTPException(
            status_code=409,
            detail="No se pueden emitir ventas a clientes dados de baja"
        )

    nueva_venta = Venta(cliente_id=cliente.id, estado="Confirmada")
    db.add(nueva_venta)
    db.flush()  # necesito nueva_venta.id antes de crear los detalles

    total = 0.0

    for item in venta_data.items:
        producto = db.query(Producto).filter(Producto.id == item.producto_id).first()

        if producto is None:
            db.rollback()
            raise HTTPException(
                status_code=404,
                detail=f"Producto {item.producto_id} no encontrado"
            )

        if producto.stock < item.cantidad:
            db.rollback()
            raise HTTPException(
                status_code=409,
                detail=f"No hay stock suficiente para '{producto.nombre}' "
                       f"(disponible: {producto.stock}, solicitado: {item.cantidad})"
            )

        producto.stock -= item.cantidad
        subtotal = producto.precio * item.cantidad
        total += subtotal

        detalle = VentaDetalle(
            venta_id=nueva_venta.id,
            producto_id=producto.id,
            cantidad=item.cantidad,
            precio_unitario=producto.precio,
        )
        db.add(detalle)

    nueva_venta.total = round(total, 2)
    db.commit()
    db.refresh(nueva_venta)
    return nueva_venta

# Listar
@router.get("/", response_model=list[VentaOut])
def listar_ventas(
    dni_cliente: Optional[str] = None,
    fecha_desde: Optional[datetime] = None,
    fecha_hasta: Optional[datetime] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Venta).options(joinedload(Venta.detalles))

    if dni_cliente:
        query = query.join(Cliente).filter(Cliente.dni == dni_cliente)

    if fecha_desde:
        query = query.filter(Venta.fecha >= fecha_desde)

    if fecha_hasta:
        query = query.filter(Venta.fecha <= fecha_hasta)

    return query.all()

# Anular venta
@router.patch("/{venta_id}/anular", response_model=VentaOut)
def anular_venta(venta_id: int, db: Session = Depends(get_db)):
    venta = db.query(Venta).options(joinedload(Venta.detalles)).filter(Venta.id == venta_id).first()
    if venta is None:
        raise HTTPException(status_code=404, detail="Venta no encontrada")

    if venta.estado == "Anulada":
        raise HTTPException(status_code=409, detail="La venta ya se encuentra anulada")

    for detalle in venta.detalles:
        producto = db.query(Producto).filter(Producto.id == detalle.producto_id).first()
        if producto:
            producto.stock += detalle.cantidad

    venta.estado = "Anulada"
    db.commit()
    db.refresh(venta)
    return venta

# Modificar venta
@router.put("/{venta_id}", response_model=VentaOut)
def modificar_venta(venta_id: int, venta_data: VentaUpdate, db: Session = Depends(get_db)):
    venta = db.query(Venta).options(joinedload(Venta.detalles)).filter(Venta.id == venta_id).first()
    if venta is None:
        raise HTTPException(status_code=404, detail="Venta no encontrada")

    if venta.estado == "Anulada":
        raise HTTPException(
            status_code=409,
            detail="No se puede modificar una venta anulada"
        )

    # Mapa de lo que YA tenía la venta: producto_id -> cantidad
    detalles_actuales = {d.producto_id: d for d in venta.detalles}
    # Mapa de lo que el cliente pide que quede: producto_id -> cantidad nueva
    items_nuevos = {item.producto_id: item.cantidad for item in venta_data.items}

    # Paso 1: productos que estaban y ya NO están -> devolver stock completo
    for producto_id, detalle in list(detalles_actuales.items()):
        if producto_id not in items_nuevos:
            producto = db.query(Producto).filter(Producto.id == producto_id).first()
            if producto:
                producto.stock += detalle.cantidad
            db.delete(detalle)

    # Paso 2: validar stock
    for producto_id, cantidad_nueva in items_nuevos.items():
        producto = db.query(Producto).filter(Producto.id == producto_id).first()
        if producto is None:
            db.rollback()
            raise HTTPException(status_code=404, detail=f"Producto {producto_id} no encontrado")

        detalle_previo = detalles_actuales.get(producto_id)
        cantidad_previa = detalle_previo.cantidad if detalle_previo else 0
        diferencia = cantidad_nueva - cantidad_previa

        # diferencia > 0: pide más que antes -> hay que descontar esa diferencia del stock
        if diferencia > 0 and producto.stock < diferencia:
            db.rollback()
            raise HTTPException(
                status_code=409,
                detail=f"No hay stock suficiente para '{producto.nombre}' "
                       f"(disponible: {producto.stock}, adicional requerido: {diferencia})"
            )

    # Paso 3: aplicar los cambios ya validados
    total = 0.0
    for producto_id, cantidad_nueva in items_nuevos.items():
        producto = db.query(Producto).filter(Producto.id == producto_id).first()
        detalle_previo = detalles_actuales.get(producto_id)
        cantidad_previa = detalle_previo.cantidad if detalle_previo else 0
        diferencia = cantidad_nueva - cantidad_previa

        producto.stock -= diferencia  # si diferencia es negativa, esto SUMA stock

        if detalle_previo:
            detalle_previo.cantidad = cantidad_nueva
        else:
            nuevo_detalle = VentaDetalle(
                venta_id=venta.id,
                producto_id=producto.id,
                cantidad=cantidad_nueva,
                precio_unitario=producto.precio,
            )
            db.add(nuevo_detalle)

        precio = detalle_previo.precio_unitario if detalle_previo else producto.precio
        total += precio * cantidad_nueva

    venta.total = round(total, 2)
    db.commit()
    db.refresh(venta)
    return venta