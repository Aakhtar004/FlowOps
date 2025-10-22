import uuid
from typing import Callable
import structlog
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware


class RequestIDMiddleware(BaseHTTPMiddleware):
    """
    Middleware to add a unique request ID to each request for tracing.
    Adds X-Request-ID header to response and stores it in request state.
    """

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        # Generate unique request ID
        request_id = str(uuid.uuid4())

        # Add to request state for logging
        request.state.request_id = request_id

        # Bind request_id to structlog context
        with structlog.contextvars.bound_contextvars(request_id=request_id):
            # Call next middleware/endpoint
            response = await call_next(request)

        # Add request ID to response headers
        response.headers["X-Request-ID"] = request_id

        return response