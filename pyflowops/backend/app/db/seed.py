import structlog
from typing import List, Dict

from app.db.database import SessionLocal
from app.models.plan_model import User
from app.core.config import settings
from app.api.v1.endpoints.auth import get_password_hash

logger = structlog.get_logger()


def _parse_initial_users(env_value: str) -> List[Dict]:
    """
    Parse INITIAL_USERS env string into a list of dicts.
    Format: "user:email:pass[:full_name][:is_superuser];..."
    Example: "alice:alice@example.com:secret123:Alice Example:true;bob:bob@example.com:secret123"
    """
    users: List[Dict] = []
    if not env_value:
        return users

    entries = [x.strip() for x in env_value.split(';') if x.strip()]
    for e in entries:
        parts = [p.strip() for p in e.split(':')]
        if len(parts) < 3:
            logger.warning("Skipping INITIAL_USERS entry - not enough parts", entry=e)
            continue
        username, email, password = parts[:3]
        full_name = parts[3] if len(parts) >= 4 else None
        is_superuser = False
        if len(parts) >= 5:
            try:
                is_superuser = parts[4].lower() in ["true", "1", "yes"]
            except Exception:
                is_superuser = False
        users.append({
            "username": username,
            "email": email,
            "password": password,
            "full_name": full_name,
            "is_superuser": is_superuser,
        })
    return users


def seed_initial_users() -> None:
    """Seed initial users at application startup.

    - Reads `settings.INITIAL_USERS` for configurable users.
    - Falls back to a small default set if not provided.
    - Skips users that already exist by username or email.
    """
    db = SessionLocal()
    try:
        seed_list = _parse_initial_users(getattr(settings, 'INITIAL_USERS', ''))
        if not seed_list:
            seed_list = [
                {"username": "alice", "email": "alice@example.com", "password": "secret123", "full_name": "Alice Example", "is_superuser": False},
                {"username": "bob", "email": "bob@example.com", "password": "secret123", "full_name": "Bob Example", "is_superuser": False},
            ]

        created_count = 0
        for u in seed_list:
            exists = db.query(User).filter((User.username == u["username"]) | (User.email == u["email"]))
            if exists.first():
                logger.info("Seed user exists, skipping", username=u["username"], email=u["email"])
                continue

            user = User(
                username=u["username"],
                email=u["email"],
                full_name=u.get("full_name"),
                hashed_password=get_password_hash(u["password"]),
                is_active=True,
                is_superuser=u.get("is_superuser", False),
            )
            db.add(user)
            created_count += 1

        if created_count > 0:
            db.commit()
            logger.info("Seeded initial users", count=created_count)
        else:
            logger.info("No new users to seed")
    except Exception as e:
        db.rollback()
        logger.error("Error seeding initial users", error=str(e))
    finally:
        db.close()