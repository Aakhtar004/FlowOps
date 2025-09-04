from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.core.config import settings
from app.db.database import create_tables
from app.api.v1.endpoints import auth, plan

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
            "details": exc.errors(),
            "status_code": 422
        }
    )


# Eventos de inicio y cierre de la aplicación
@app.on_event("startup")
async def startup_event():
    """Eventos que se ejecutan al iniciar la aplicación."""
    # Crear tablas de la base de datos
    create_tables()
    print(f"🚀 {settings.PROJECT_NAME} v{settings.VERSION} iniciado")
    print(f"📖 Documentación disponible en: /docs")
    print(f"🔧 Modo DEBUG: {settings.DEBUG}")


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


# Incluir routers de la API
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(plan.router, prefix=settings.API_V1_STR)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG
    )
