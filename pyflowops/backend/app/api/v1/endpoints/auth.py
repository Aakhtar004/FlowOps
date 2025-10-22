import structlog
from datetime import datetime, timedelta, timezone
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import settings
from app.db.database import get_db, transaction
from app.models.plan_model import User
from app.schemas.plan_schema import UserCreate, UserLogin, User as UserSchema, Token


class AuthenticationError(Exception):
    """Excepción base para errores de autenticación."""
    pass


class UserNotFoundError(AuthenticationError):
    """Usuario no encontrado."""
    pass


class InvalidPasswordError(AuthenticationError):
    """Contraseña incorrecta."""
    pass

router = APIRouter(prefix="/auth", tags=["Authentication"])

# Configuración de seguridad
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verificar contraseña."""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Obtener hash de contraseña."""
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Crear token de acceso JWT."""
    to_encode = data.copy()
    # Claims canónicos con zona horaria UTC
    issued_at = datetime.now(timezone.utc)
    if expires_delta:
        expire = issued_at + expires_delta
    else:
        expire = issued_at + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

    # Incluir 'exp' e 'iat' como timezone-aware
    to_encode.update({"exp": expire, "iat": issued_at})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


def get_user_by_username(db: Session, username: str) -> Optional[User]:
    """Obtener usuario por nombre de usuario."""
    logger = structlog.get_logger()
    logger.info("Querying user by username", username=username)
    user = db.query(User).filter(User.username == username).first()
    logger.info("User query result", found=user is not None)
    return user


def get_user_by_id(db: Session, user_id: int) -> Optional[User]:
    """Obtener usuario por ID (numérico)."""
    logger = structlog.get_logger()
    logger.info("Querying user by id", user_id=user_id)
    user = db.query(User).filter(User.id == user_id).first()
    logger.info("User query result", found=user is not None)
    return user


def authenticate_user(db: Session, username: str, password: str) -> User:
    """Autenticar usuario."""
    logger = structlog.get_logger()
    logger.info("Authenticating user", username=username)
    user = get_user_by_username(db, username)
    if not user:
        logger.warning("User not found during authentication", username=username)
        raise UserNotFoundError("Este usuario no se encuentra registrado")
    verified = verify_password(password, user.hashed_password)
    if not verified:
        logger.warning("Invalid password for user", username=username)
        raise InvalidPasswordError("La contraseña es incorrecta")
    logger.info("User authenticated successfully", username=username)
    return user


async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    """Obtener usuario actual desde el token JWT (sub = ID)."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No se pudieron validar las credenciales",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        sub_val = payload.get("sub")
        if sub_val is None:
            raise credentials_exception
        try:
            user_id = int(str(sub_val))
        except Exception:
            # El sub no es numérico, no coincide con el nuevo contrato
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = get_user_by_id(db, user_id)
    if user is None:
        raise credentials_exception
    
    return user


async def get_current_active_user(current_user: User = Depends(get_current_user)) -> User:
    """Obtener usuario actual activo."""
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Usuario inactivo")
    return current_user


@router.post("/register", response_model=UserSchema, status_code=status.HTTP_201_CREATED)
async def register_user(user_data: UserCreate, db: Session = Depends(get_db)):
    """
    Registrar un nuevo usuario.
    """
    logger = structlog.get_logger()
    logger.info("User registration attempt", username=user_data.username, email=user_data.email)

    # Verificar si el usuario ya existe
    if get_user_by_username(db, user_data.username):
        logger.warning("Registration failed - username already exists", username=user_data.username)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El nombre de usuario ya está registrado"
        )

    # Verificar si el email ya existe
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        logger.warning("Registration failed - email already exists", email=user_data.email)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El email ya está registrado"
        )

    # Crear nuevo usuario
    hashed_password = get_password_hash(user_data.password)
    user = User(
        username=user_data.username,
        email=user_data.email,
        full_name=user_data.full_name,
        hashed_password=hashed_password,
        is_active=user_data.is_active
    )

    with transaction(db):
        db.add(user)

    logger.info("User registered successfully", username=user.username, user_id=user.id)
    return user


@router.post("/login", response_model=Token)
async def login_user(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """
    Iniciar sesión y obtener token de acceso.
    """
    logger = structlog.get_logger()
    logger.info("Login attempt", username=form_data.username)
    try:
        user = authenticate_user(db, form_data.username, form_data.password)
    except UserNotFoundError as e:
        logger.warning("Login failed - user not found", username=form_data.username)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
            headers={"WWW-Authenticate": "Bearer"},
        )
    except InvalidPasswordError as e:
        logger.warning("Login failed - invalid password", username=form_data.username)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    # Emitir JWT con 'sub' como ID numérico y claims adicionales para trazabilidad
    access_token = create_access_token(
        data={
            "sub": str(user.id),
            "username": user.username,
            "email": user.email,
        },
        expires_delta=access_token_expires,
    )

    logger.info("Login successful", username=user.username, user_id=user.id)
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }


@router.get("/me", response_model=UserSchema)
async def read_users_me(current_user: User = Depends(get_current_active_user)):
    """
    Obtener información del usuario actual.
    """
    logger = structlog.get_logger()
    logger.info("User profile accessed", user_id=current_user.id, username=current_user.username)
    return current_user


@router.post("/logout")
async def logout_user(current_user: User = Depends(get_current_active_user)):
    """
    Cerrar sesión (en el frontend se debe eliminar el token).
    """
    return {"message": "Sesión cerrada exitosamente"}
