from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import StaticPool
from contextlib import contextmanager
from typing import Generator
from app.core.config import settings

def get_engine():
    """Obtener motor de base de datos con configuración optimizada para producción."""
    if "sqlite" in settings.DATABASE_URL:
        return create_engine(
            settings.DATABASE_URL,
            poolclass=StaticPool,
            connect_args={"check_same_thread": False},
            echo=settings.DEBUG
        )
    else:
        # Configuración optimizada para PostgreSQL en producción
        return create_engine(
            settings.DATABASE_URL,
            pool_size=30,  # Aumentado de 5 default
            max_overflow=50,  # Aumentado de 10 default  
            pool_timeout=120,  # Aumentado timeout a 2 minutos
            pool_recycle=3600,  # Reciclar conexiones cada hora
            pool_pre_ping=True,  # Verificar conexiones antes de usar
            echo=settings.DEBUG,
            # Configuraciones adicionales para estabilidad
            pool_reset_on_return='commit',
            connect_args={
                "options": "-c statement_timeout=30000"  # 30 segundos timeout por query
            }
        )

# Crear motor de base de datos
engine = get_engine()

# Crear sesión de base de datos
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base para los modelos
Base = declarative_base()


def get_db():
    """
    Generador de dependencias para obtener una sesión de base de datos.
    Garantiza que la sesión se cierre correctamente después de su uso.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@contextmanager
def transaction(db: Session) -> Generator[Session, None, None]:
    """
    Context manager para manejar transacciones de base de datos.
    Garantiza rollback automático en caso de error.
    """
    try:
        yield db
        db.commit()
    except Exception as e:
        db.rollback()
        raise e


def create_tables():
    """
    Crear todas las tablas de la base de datos.
    Utilizar con precaución en producción.
    """
    Base.metadata.create_all(bind=engine)
