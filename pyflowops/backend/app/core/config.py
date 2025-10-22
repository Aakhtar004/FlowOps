from typing import List
from pydantic_settings import BaseSettings
from pydantic import field_validator


class Settings(BaseSettings):
    """
    Configuración de la aplicación usando Pydantic Settings.
    Las variables de entorno sobrescriben los valores por defecto.
    """
    
    # Configuración básica de la aplicación
    PROJECT_NAME: str = "PyFlowOps - Plan Estratégico TI"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    DEBUG: bool = True
    
    # Configuración de la base de datos
    DATABASE_URL: str = "postgresql://admin:admin123@localhost:5432/pyflowops"
    
    # Configuración del pool de base de datos para producción
    DATABASE_POOL_SIZE: int = 30
    DATABASE_MAX_OVERFLOW: int = 50
    DATABASE_POOL_TIMEOUT: int = 120
    DATABASE_POOL_RECYCLE: int = 3600
    
    # Configuración de seguridad
    SECRET_KEY: str = "58e3d823c81bcf8b4e2897a72c24344a"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    
    # Configuración de WebSocket para producción
    WEBSOCKET_MAX_CONNECTIONS_PER_USER: int = 3
    WEBSOCKET_CONNECTION_TIMEOUT: int = 1800
    WEBSOCKET_RATE_LIMIT_PER_MINUTE: int = 60
    
    # Configuración de CORS
    CORS_ORIGINS: str = "http://frontend:3000,http://localhost:5173,http://127.0.0.1:3000,http://127.0.0.1:5173,http://localhost:3000,https://j7j1tg9h-3000.brs.devtunnels.ms"

    # Usuarios iniciales de seeding (formato: "user:email:pass[:full][:is_superuser];...")
    INITIAL_USERS: str = ""
    
    @field_validator('CORS_ORIGINS')
    @classmethod
    def parse_cors_origins(cls, v):
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(',')]
        return v
    
    class Config:
        env_file = ".env"
        case_sensitive = True


# Instancia global de configuración
settings = Settings()
