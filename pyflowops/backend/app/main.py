import json
from datetime import datetime
import structlog
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, Response
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.core.config import settings
from app.core.logging import setup_logging  # noqa: F401
from app.core.metrics import MetricsMiddleware, get_metrics
from app.db.database import create_tables, SessionLocal
from app.db.seed import seed_initial_users
from app.db.migrations import run_migrations
from app.api.v1.endpoints import auth, plan
from app.graphql.schema import graphql_router
from app.middleware.request_id import RequestIDMiddleware

# Crear aplicación FastAPI
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="API para la automatización del Plan Estratégico de TI",
    docs_url="/docs",
    redoc_url="/redoc"
)


# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Middleware para Request ID
app.add_middleware(RequestIDMiddleware)

# Middleware para métricas
app.add_middleware(MetricsMiddleware)


# Manejadores de excepciones personalizados
@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request, exc):
    """Manejador para excepciones HTTP."""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": True,
            "message": exc.detail,
            "status_code": exc.status_code
        }
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc):
    """Manejador para errores de validación."""
    return JSONResponse(
        status_code=422,
        content={
            "error": True,
            "message": "Error de validación de datos",
            "details": [str(error) for error in exc.errors()],
            "status_code": 422
        }
    )


# Eventos de inicio y cierre de la aplicación
@app.on_event("startup")
async def startup_event():
    """Eventos que se ejecutan al iniciar la aplicación."""
    # Crear tablas de la base de datos
    create_tables()
    
    # Ejecutar migraciones
    db = SessionLocal()
    try:
        run_migrations(db)
    finally:
        db.close()
    
    # Seed de usuarios iniciales (configurable por env INITIAL_USERS)
    try:
        seed_initial_users()
    except Exception as e:
        print(f"[SEED] Error al crear usuarios iniciales: {e}")
    print(f"[START] {settings.PROJECT_NAME} v{settings.VERSION} iniciado")
    print(f"[DOCS] Documentación disponible en: /docs")
    print(f"[DEBUG] Modo DEBUG: {settings.DEBUG}")


@app.on_event("shutdown")
async def shutdown_event():
    """Eventos que se ejecutan al cerrar la aplicación."""
    print(f"🛑 {settings.PROJECT_NAME} detenido")


# Rutas principales
@app.get("/")
async def root():
    """Endpoint de bienvenida."""
    return {
        "message": f"Bienvenido a {settings.PROJECT_NAME}",
        "version": settings.VERSION,
        "docs": "/docs",
        "status": "running"
    }


@app.get("/health")
async def health_check():
    """Endpoint de verificación de salud."""
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION
    }


@app.get("/metrics")
async def metrics():
    """Endpoint para métricas de Prometheus."""
    return Response(content=get_metrics(), media_type="text/plain")


# Incluir routers de la API
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(plan.router, prefix=settings.API_V1_STR)
app.include_router(graphql_router, prefix="/graphql")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG
    )
