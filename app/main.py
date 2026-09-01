from fastapi import FastAPI
from app.routers import cliente 

app = FastAPI(tittle="Sistema de Clientes, Productos y Ventas")

app.include_router(cliente.router)

@app.get("/")
def read_root():
    return {"mensaje": "Conexión exitosa"}