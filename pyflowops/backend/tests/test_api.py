import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.db.database import get_db, Base

# Base de datos de prueba en memoria
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    """Override de la dependencia de base de datos para pruebas."""
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)


@pytest.fixture(scope="module")
def setup_database():
    """Configurar base de datos para pruebas."""
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


def test_root_endpoint(setup_database):
    """Probar endpoint raíz."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "message" in data
    assert "version" in data


def test_health_check(setup_database):
    """Probar endpoint de verificación de salud."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"


def test_user_registration(setup_database):
    """Probar registro de usuario."""
    user_data = {
        "username": "testuser",
        "email": "test@example.com",
        "password": "testpassword123",
        "full_name": "Test User"
    }
    response = client.post("/api/v1/auth/register", json=user_data)
    assert response.status_code == 201
    data = response.json()
    assert data["username"] == user_data["username"]
    assert data["email"] == user_data["email"]


def test_user_login(setup_database):
    """Probar login de usuario."""
    # Primero registrar un usuario
    user_data = {
        "username": "loginuser",
        "email": "login@example.com",
        "password": "loginpassword123",
        "full_name": "Login User"
    }
    client.post("/api/v1/auth/register", json=user_data)
    
    # Luego hacer login
    login_data = {
        "username": "loginuser",
        "password": "loginpassword123"
    }
    response = client.post("/api/v1/auth/login", data=login_data)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_create_strategic_plan(setup_database):
    """Probar creación de plan estratégico."""
    # Registrar y hacer login
    user_data = {
        "username": "planuser",
        "email": "plan@example.com",
        "password": "planpassword123",
        "full_name": "Plan User"
    }
    client.post("/api/v1/auth/register", json=user_data)
    
    login_data = {
        "username": "planuser",
        "password": "planpassword123"
    }
    login_response = client.post("/api/v1/auth/login", data=login_data)
    token = login_response.json()["access_token"]
    
    # Crear plan estratégico
    plan_data = {
        "title": "Plan Estratégico de Prueba",
        "description": "Descripción de prueba"
    }
    headers = {"Authorization": f"Bearer {token}"}
    response = client.post("/api/v1/plans/", json=plan_data, headers=headers)
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == plan_data["title"]


def test_unauthorized_access(setup_database):
    """Probar acceso no autorizado."""
    response = client.get("/api/v1/plans/")
    assert response.status_code == 401
