FROM python:3.14.4 

WORKDIR /app 

COPY pyproject.toml poetry.lock ./

RUN pip install poetry && poetry install --no-root --no-dev

COPY app/ ./app/

    CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]

## docker build -t mi-app .