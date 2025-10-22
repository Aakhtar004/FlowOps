import logging
import sys
from typing import Any, Dict

import structlog
from structlog.processors import JSONRenderer


def add_request_id(logger: logging.Logger, method_name: str, event_dict: Dict[str, Any]) -> Dict[str, Any]:
    """
    Processor to add request_id from structlog context to log records.
    """
    from structlog.contextvars import get_contextvars

    context = get_contextvars()
    if "request_id" in context:
        event_dict["request_id"] = context["request_id"]

    return event_dict


def setup_logging():
    """
    Configure structured logging with JSON output and request ID.
    """
    # Configure structlog
    structlog.configure(
        processors=[
            structlog.contextvars.merge_contextvars,
            add_request_id,
            structlog.processors.add_log_level,
            structlog.processors.TimeStamper(fmt="iso"),
            JSONRenderer(),
        ],
        wrapper_class=structlog.make_filtering_bound_logger(logging.INFO),
        context_class=dict,
        logger_factory=structlog.WriteLoggerFactory(),
        cache_logger_on_first_use=True,
    )

    # Configure standard logging to work with structlog
    logging.basicConfig(
        format="%(message)s",
        stream=sys.stdout,
        level=logging.INFO,
    )

    # Get the root logger and configure it
    root_logger = logging.getLogger()
    root_logger.setLevel(logging.INFO)

    # Remove any existing handlers
    for handler in root_logger.handlers[:]:
        root_logger.removeHandler(handler)

    # Add a handler that uses structlog for our app logs
    handler = logging.StreamHandler(sys.stdout)
    # Use a custom formatter that checks if it's a structlog record
    class StructlogFormatter(logging.Formatter):
        def format(self, record):
            # If it's a structlog record, just return the message
            if hasattr(record, 'name') and record.name.startswith('app'):
                return record.getMessage()
            # Otherwise, format as JSON
            return f'{{"level": "{record.levelname}", "logger": "{record.name}", "message": "{record.getMessage()}", "timestamp": "{record.created}"}}'

    handler.setFormatter(StructlogFormatter())
    root_logger.addHandler(handler)


# Initialize logging on import
setup_logging()