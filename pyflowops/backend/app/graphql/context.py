from typing import Any, Dict, Optional

import structlog
from fastapi import Request
from jose import jwt, JWTError
from jose.exceptions import ExpiredSignatureError
from strawberry.types import Info

from app.core.config import settings


JWT_SECRET = settings.SECRET_KEY
JWT_ALG = settings.ALGORITHM 


async def get_context(
    request: Any = None,
    connection_params: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """Context getter for HTTP requests only (WebSocket support removed).

    Reads the Authorization header from HTTP requests.
    """
    token = None
    # HTTP: Authorization header
    try:
        if request is not None and hasattr(request, "headers"):
            auth_header = request.headers.get("Authorization")
            if auth_header and isinstance(auth_header, str) and auth_header.lower().startswith("bearer "):
                token = auth_header.split(" ", 1)[1]
    except Exception:
        pass

    user = None
    if token:
        logger = structlog.get_logger()
        try:
            user = jwt.decode(
                token,
                JWT_SECRET,
                algorithms=[JWT_ALG],
                # Producción segura: verificación de expiración con tolerancia al reloj
                options={
                    "verify_signature": True,
                    # Mantener verificación de expiración activa
                    "verify_exp": True,
                    # Mantener tolerancia frente a claims opcionales
                    "verify_nbf": False,
                    "verify_iat": False,
                    "verify_aud": False,
                },
                leeway=5,  # 5s de tolerancia ante desincronización de reloj
            )
        except ExpiredSignatureError as e:
            # Observabilidad: token expirado
            logger.warning("JWT expired during context decoding", error=str(e))
            user = None
        except JWTError as e:
            # Observabilidad: error genérico de JWT
            logger.warning("JWT decode error during context decoding", error=str(e))
            user = None
    # Exponer user_id derivado de 'sub' si es numérico (nuevo contrato)
    user_id: Optional[int] = None
    if user and isinstance(user, dict) and user.get("sub") is not None:
        try:
            user_id = int(str(user.get("sub")))
        except Exception:
            user_id = None

    return {"user": user, "user_id": user_id}


def require_user(info: Info) -> Dict[str, Any]:
    user = info.context.get("user")
    if not user:
        raise PermissionError("Authentication required")
    return user