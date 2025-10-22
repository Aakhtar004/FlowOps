from prometheus_client import Counter, Histogram, generate_latest
import time
from typing import Callable
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware


# Metrics
REQUEST_COUNT = Counter(
    'http_requests_total',
    'Total number of HTTP requests',
    ['method', 'endpoint', 'status_code']
)

REQUEST_DURATION = Histogram(
    'http_request_duration_seconds',
    'HTTP request duration in seconds',
    ['method', 'endpoint']
)

ERROR_COUNT = Counter(
    'http_errors_total',
    'Total number of HTTP errors',
    ['method', 'endpoint', 'status_code']
)


class MetricsMiddleware(BaseHTTPMiddleware):
    """
    Middleware to collect HTTP metrics.
    """

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        start_time = time.time()

        # Get endpoint path (simplified)
        endpoint = request.url.path

        try:
            response = await call_next(request)

            # Record metrics
            duration = time.time() - start_time
            REQUEST_COUNT.labels(
                method=request.method,
                endpoint=endpoint,
                status_code=response.status_code
            ).inc()

            REQUEST_DURATION.labels(
                method=request.method,
                endpoint=endpoint
            ).observe(duration)

            # Record errors (4xx and 5xx)
            if response.status_code >= 400:
                ERROR_COUNT.labels(
                    method=request.method,
                    endpoint=endpoint,
                    status_code=response.status_code
                ).inc()

            return response

        except Exception as e:
            # Record error metrics for unhandled exceptions
            duration = time.time() - start_time
            REQUEST_COUNT.labels(
                method=request.method,
                endpoint=endpoint,
                status_code=500
            ).inc()

            REQUEST_DURATION.labels(
                method=request.method,
                endpoint=endpoint
            ).observe(duration)

            ERROR_COUNT.labels(
                method=request.method,
                endpoint=endpoint,
                status_code=500
            ).inc()

            raise


def get_metrics():
    """
    Return Prometheus metrics in the expected format.
    """
    return generate_latest()