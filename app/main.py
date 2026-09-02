from fastapi import FastAPI
from app.routers import cliente, producto, ventas

app = FastAPI(tittle="Sistema de Clientes, Productos y Ventas")

app.include_router(cliente.router)
app.include_router(producto.router)
app.include_router(ventas.router)

@app.get("/")
def read_root():
    return {"mensaje": "Conexión exitosa"}