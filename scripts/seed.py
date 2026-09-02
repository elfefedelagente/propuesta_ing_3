import random
from datetime import datetime, timedelta
from faker import Faker
from app.core.database import Base, engine, SessionLocal
from app.models import Cliente, Producto, Venta, VentaDetalle 

fake = Faker("es_AR")

CANTIDAD_CLIENTES = 1000
CANTIDAD_PRODUCTOS = 200
CANTIDAD_VENTAS = 300


def crear_clientes(db, cantidad: int) -> list[Cliente]:
    clientes = []
    dnis_usados = set()

    while len(clientes) < cantidad:
        dni = str(fake.unique.random_number(digits=8, fix_len=True))
        if dni in dnis_usados:
            continue
        dnis_usados.add(dni)

        cliente = Cliente(
            dni=dni,
            nombre=fake.first_name(),
            apellido=fake.last_name(),
            email=fake.unique.email(),
            telefono=fake.numerify("11-####-####"),
            estado=random.choice([True, True, True, False]),  # 75% activos
        )
        clientes.append(cliente)

    db.bulk_save_objects(clientes, return_defaults=True)
    db.commit()
    return db.query(Cliente).all()


def crear_productos(db, cantidad: int) -> list[Producto]:
    productos = []
    for i in range(cantidad):
        producto = Producto(
            sku=f"SKU-{i+1:05d}",
            nombre=fake.word().capitalize() + " " + fake.word().capitalize(),
            marca=fake.company(),
            descripcion=fake.sentence(nb_words=6),
            precio=round(random.uniform(500, 50000), 2),
            stock=random.randint(0, 200),
            estado=random.choice([True, True, True, False]),
        )
        productos.append(producto)

    db.bulk_save_objects(productos, return_defaults=True)
    db.commit()
    return db.query(Producto).all()


def crear_ventas(db, cantidad: int, clientes: list[Cliente], productos: list[Producto]):
    clientes_activos = [c for c in clientes if c.estado]
    productos_activos = [p for p in productos if p.estado and p.stock > 0]

    for _ in range(cantidad):
        cliente = random.choice(clientes_activos)
        items_disponibles = random.sample(
            productos_activos, k=min(random.randint(1, 4), len(productos_activos))
        )

        venta = Venta(
            cliente_id=cliente.id,
            fecha=fake.date_time_between(start_date="-1y", end_date="now"),
            estado="Confirmada",
        )
        db.add(venta)
        db.flush()  # asigna venta.id sin cerrar la transacción

        total = 0
        for producto in items_disponibles:
            cantidad_vendida = random.randint(1, min(3, producto.stock or 1))
            subtotal = cantidad_vendida * producto.precio
            total += subtotal

            detalle = VentaDetalle(
                venta_id=venta.id,
                producto_id=producto.id,
                cantidad=cantidad_vendida,
                precio_unitario=producto.precio,
            )
            db.add(detalle)

        venta.total = round(total, 2)

    db.commit()


def main():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        print("Generando clientes...")
        clientes = crear_clientes(db, CANTIDAD_CLIENTES)

        print("Generando productos...")
        productos = crear_productos(db, CANTIDAD_PRODUCTOS)

        print("Generando ventas...")
        crear_ventas(db, CANTIDAD_VENTAS, clientes, productos)

        print(f"Listo: {len(clientes)} clientes, {len(productos)} productos, {CANTIDAD_VENTAS} ventas.")
    finally:
        db.close()


if __name__ == "__main__":
    main()