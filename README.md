# propuesta_ing_3

Propuesta de productividad dada por el jefe de trabajos prácticos de la materia Ingeniería de software 3.

Sistema de gestión de **Clientes**, **Productos** y **Ventas**, con backend en FastAPI + SQLAlchemy (SQLite) y frontend en React + Vite.

## Estructura

- `app/` — API (FastAPI): routers, modelos, schemas y configuración.
- `frontend/` — SPA en React (Vite).
- `scripts/seed.py` — genera datos de ejemplo (clientes, productos y ventas).
- `docs/modelo-dominio.md` — modelo de dominio (diagrama de clases, entidades y reglas de negocio).
- `docs/registro_horas.xlsx` — registro de tiempos de trabajo.

## Requisitos

- [Docker](https://www.docker.com/) y Docker Compose (opción recomendada, no requiere instalar nada más).
- Alternativa manual: Python 3.14+ con [Poetry](https://python-poetry.org/) y Node.js 22+.

## Ejecutar con Docker (recomendado)

Desde la raíz del proyecto:

```bash
docker compose up --build
```

Esto levanta:

- Backend (FastAPI) en [http://localhost:8000](http://localhost:8000) — docs interactivas en [http://localhost:8000/docs](http://localhost:8000/docs)
- Frontend (Vite) en [http://localhost:5173](http://localhost:5173)

El backend usa el mismo archivo `app/core/database.db` que el modo manual (se monta como volumen) — no es una base aparte. Si ya tenés datos ahí (por haber corrido el seed o la app en modo manual), Docker los va a ver tal cual. Si el archivo todavía no existe, las tablas se crean solas al arrancar, vacías.

Para cargar datos de ejemplo (clientes, productos y ventas de prueba) dentro del contenedor ya corriendo:

```bash
docker compose exec backend python scripts/seed.py
```

Para detener todo (los datos quedan en `app/core/database.db`, no se pierden):

```bash
docker compose down
```

## Ejecutar en forma manual (sin Docker)

### Backend

```bash
poetry install
poetry run uvicorn app.main:app --reload
```

La API queda disponible en [http://localhost:8000](http://localhost:8000) (docs en `/docs`). Las tablas se crean solas al arrancar.

Opcional, cargar datos de ejemplo:

```bash
poetry run python scripts/seed.py
```

### Frontend

En otra terminal:

```bash
cd frontend
npm install
npm run dev
```

La app queda disponible en [http://localhost:5173](http://localhost:5173).

> El frontend solo acepta como origen `http://localhost:5173` (configurado en el CORS del backend), así que hay que levantarlo en ese puerto exacto.
