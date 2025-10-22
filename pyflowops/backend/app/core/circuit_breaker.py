"""
Circuit Breaker para proteger contra fallos en cascada de la base de datos.
"""
import time
import asyncio
from enum import Enum
from typing import Callable, Any
import structlog

logger = structlog.get_logger()

class CircuitState(Enum):
    CLOSED = "closed"
    OPEN = "open" 
    HALF_OPEN = "half_open"

class DatabaseCircuitBreaker:
    def __init__(self, failure_threshold: int = 5, recovery_timeout: int = 60, success_threshold: int = 3):
        self.failure_threshold = failure_threshold
        self.recovery_timeout = recovery_timeout
        self.success_threshold = success_threshold
        
        self.failure_count = 0
        self.success_count = 0
        self.last_failure_time = None
        self.state = CircuitState.CLOSED
        
    async def call(self, func: Callable, *args, **kwargs) -> Any:
        """Execute function with circuit breaker protection."""
        
        if self.state == CircuitState.OPEN:
            # Check if we should transition to half-open
            if self._should_attempt_reset():
                self.state = CircuitState.HALF_OPEN
                logger.info("Circuit breaker transitioning to HALF_OPEN")
            else:
                raise Exception("Circuit breaker is OPEN - Database operations temporarily blocked")
        
        try:
            # Execute the function
            if asyncio.iscoroutinefunction(func):
                result = await func(*args, **kwargs)
            else:
                result = func(*args, **kwargs)
            
            # Record success
            await self._on_success()
            return result
            
        except Exception as e:
            # Record failure
            await self._on_failure()
            raise e
    
    def _should_attempt_reset(self) -> bool:
        """Check if enough time has passed to try again."""
        if self.last_failure_time is None:
            return True
        return time.time() - self.last_failure_time >= self.recovery_timeout
    
    async def _on_success(self):
        """Handle successful operation."""
        self.failure_count = 0
        
        if self.state == CircuitState.HALF_OPEN:
            self.success_count += 1
            if self.success_count >= self.success_threshold:
                self.state = CircuitState.CLOSED
                self.success_count = 0
                logger.info("Circuit breaker reset to CLOSED - Operations restored")
    
    async def _on_failure(self):
        """Handle failed operation."""
        self.failure_count += 1
        self.last_failure_time = time.time()
        
        if self.failure_count >= self.failure_threshold:
            self.state = CircuitState.OPEN
            self.success_count = 0
            logger.error(f"Circuit breaker OPENED after {self.failure_count} failures - Blocking database operations")

# Global circuit breaker instance
db_circuit_breaker = DatabaseCircuitBreaker()