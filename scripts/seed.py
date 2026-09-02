# scripts/seed.py
import random
from datetime import datetime

from faker import Faker

from app.core.database import Base, engine, SessionLocal
from app import models
from app.models.cliente import Cliente
from app.models.producto import Producto
from app.models.ventas import Venta, VentaDetalle

fake = Faker("es_AR")

CANTIDAD_CLIENTES = 60
CANTIDAD_VENTAS = 25

PRODUCTOS = [
    ("Yerba mate", "La Merced", "Yerba mate con palo x 1kg", 4200, 80),
    ("Azúcar", "Ledesma", "Azúcar blanca refinada x 1kg", 1800, 120),
    ("Fideos tallarín", "Matarazzo", "Fideos secos x 500g", 950, 150),
    ("Aceite de girasol", "Natura", "Aceite de girasol x 1.5L", 3600, 60),
    ("Arroz largo fino", "Gallo Oro", "Arroz x 1kg", 2100, 100),
    ("Leche entera", "La Serenísima", "Leche entera larga vida x 1L", 1500, 200),
    ("Café molido", "Cabrales", "Café tostado y molido x 250g", 5200, 40),
    ("Galletitas dulces", "Bagley", "Galletitas rellenas x 150g", 1300, 90),
    ("Papel higiénico", "Elite", "Pack x 4 rollos", 2800, 70),
    ("Detergente líquido", "Magistral", "Detergente concentrado x 750ml", 2400, 55),
    ("Jabón en polvo", "Skip", "Jabón en polvo x 800g", 4700, 45),
    ("Shampoo", "Sedal", "Shampoo reparación x 350ml", 3100, 65),
    ("Pasta dental", "Colgate", "Pasta dental x 90g", 1600, 85),
    ("Manteca", "Sancor", "Manteca x 200g", 2300, 50),
    ("Queso cremoso", "La Paulina", "Queso cremoso x 500g", 5800, 30),
    ("Harina 0000", "Blancaflor", "Harina de trigo x 1kg", 1400, 110),
    ("Puré de tomate", "Arcor", "Puré de tomate x 520g", 1200, 130),
    ("Vinagre de alcohol", "La Cabaña", "Vinagre x 500ml", 900, 75),
    ("Sal fina", "Celusal", "Sal fina x 500g", 700, 140),
    ("Cerveza rubia", "Quilmes", "Pack x 6 latas 473ml", 4900, 60),
]


def crear_clientes(db, cantidad: int) -> list[Cliente]:
    clientes = []
    for _ in range(cantidad):
        cliente = Cliente(
            dni=str(fake.unique.random_number(digits=8, fix_len=True)),
            nombre=fake.first_name(),
            apellido=fake.last_name(),
            email=fake.unique.email(),
            telefono=fake.numerify("11-####-####"),
            estado=random.choice([True, True, True, False]),
        )
        clientes.append(cliente)

    db.bulk_save_objects(clientes, return_defaults=True)
    db.commit()
    return db.query(Cliente).all()


def crear_productos(db) -> list[Producto]:
    productos = []
    for i, (nombre, marca, descripcion, precio, stock) in enumerate(PRODUCTOS, start=1):
        producto = Producto(
            sku=f"SKU-{i:05d}",
            nombre=nombre,
            marca=marca,
            descripcion=descripcion,
            precio=precio,
            stock=stock,
            estado=True,
        )
        productos.append(producto)

    db.bulk_save_objects(productos, return_defaults=True)
    db.commit()
    return db.query(Producto).all()


def crear_ventas(db, cantidad: int, clientes: list[Cliente], productos: list[Producto]):
    clientes_activos = [c for c in clientes if c.estado]

    for _ in range(cantidad):
        cliente = random.choice(clientes_activos)
        items = random.sample(productos, k=min(random.randint(1, 4), len(productos)))

        venta = Venta(
            cliente_id=cliente.id,
            fecha=fake.date_time_between(start_date="-6M", end_date="now"),
            estado="Confirmada",
            total=0,
        )
        db.add(venta)
        db.flush()

        total = 0.0
        for producto in items:
            cantidad_vendida = random.randint(1, min(3, producto.stock))
            subtotal = cantidad_vendida * producto.precio
            total += subtotal
            producto.stock -= cantidad_vendida

            db.add(VentaDetalle(
                venta_id=venta.id,
                producto_id=producto.id,
                cantidad=cantidad_vendida,
                precio_unitario=producto.precio,
            ))

        venta.total = round(total, 2)

    db.commit()


def main():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        print("Generando clientes...")
        clientes = crear_clientes(db, CANTIDAD_CLIENTES)

        print("Generando productos...")
        productos = crear_productos(db)

        print("Generando ventas...")
        crear_ventas(db, CANTIDAD_VENTAS, clientes, productos)

        print(f"Listo: {len(clientes)} clientes, {len(productos)} productos, {CANTIDAD_VENTAS} ventas.")
    finally:
        db.close()


if __name__ == "__main__":
    main()