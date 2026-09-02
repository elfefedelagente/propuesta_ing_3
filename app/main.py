from fastapi import FastAPI
from app.routers import cliente, producto, ventas
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Sistema de Clientes, Productos y Ventas")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(cliente.router)
app.include_router(producto.router)
app.include_router(ventas.router)

@app.get("/")
def read_root():
    return {"mensaje": "Conexión exitosa"}