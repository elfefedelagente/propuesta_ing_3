# Centraliza la configuración de la app (URL de la base de datos, nombre del proyecto, si estás en modo debug, etc.)
# para que ningún otro módulo tenga valores "hardcodeados" sueltos por el código.

from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "Sistema de Clientes, Productos y Ventas"
    DATABASE_URL: str = "sqlite:///./app/core/database.db"

    model_config = SettingsConfigDict(env_file=".env")

settings = Settings()