from typing import List, Optional, Any
from datetime import timezone

import strawberry
from strawberry.fastapi import GraphQLRouter
from strawberry.types import Info

from .context import get_context, require_user
from app.db.database import SessionLocal
from app.services.plan_service import PlanService
from app.models.plan_model import StrategicPlan, PlanUser, User as UserModel
from sqlalchemy.orm import Session


@strawberry.type
class User:
    id: strawberry.ID
    email: str
    name: Optional[str]


# Eliminados Enums de GraphQL para roles/estados; se usarán strings tolerantes


@strawberry.type
class Notification:
    id: strawberry.ID
    type: str
    message: str
    plan_id: Optional[strawberry.ID]
    from_user_id: Optional[strawberry.ID]
    invitation_id: Optional[strawberry.ID] = None
    status: Optional[str] = None
    created_at: Optional[str] = None


@strawberry.type
class PlanCollaborator:
    id: strawberry.ID
    role: str
    status: str
    user: User


@strawberry.type
class InvitationResponse:
    message: str
    invitation_id: strawberry.ID


@strawberry.type
class SimpleResponse:
    message: str


@strawberry.type
class Query:
    @strawberry.field
    async def whoami(self, info: Info) -> Optional[User]:
        user = info.context.get("user")
        if not user:
            return None
        return User(id=str(user.get("sub")), email=user.get("email", ""), name=user.get("name"))

    @strawberry.field
    async def planCollaborators(self, info: Info, plan_id: strawberry.ID) -> List[PlanCollaborator]:  # noqa: N803
        user = require_user(info)
        db: Session = SessionLocal()
        try:
            # Resolver ID del usuario (sub puede ser username o id)
            def _safe_parse_int(val: Any) -> Optional[int]:
                try:
                    return int(str(val))
                except Exception:
                    return None

            def _resolve_user_id(sub_val: Any, db_sess: Session) -> int:
                parsed = _safe_parse_int(sub_val)
                if parsed is not None:
                    return parsed
                u = db_sess.query(UserModel).filter(UserModel.username == str(sub_val)).first()
                if not u:
                    raise Exception(f"Usuario no encontrado para sub: {sub_val}")
                return int(u.id)

            me_id = _resolve_user_id(user.get("sub"), db)
            plan_int = _safe_parse_int(plan_id)
            if plan_int is None:
                raise Exception(f"planId inválido: {plan_id}")
            collaborators = PlanService.get_plan_users(db, plan_int, me_id)
            result: List[PlanCollaborator] = []
            for pu in collaborators:
                u = pu.user
                try:
                    result.append(PlanCollaborator(
                        id=str(pu.id),
                        role=str(pu.role),
                        status=str(pu.status),
                        user=User(id=str(u.id), email=u.email, name=(u.full_name or None))
                    ))
                except Exception:
                    # Capturar cualquier excepcion que rompa el mapeo y saltar ese elemento
                    continue
            return result
        finally:
            db.close()

    @strawberry.field
    async def notifications(self, info: Info) -> List[Notification]:
        user = require_user(info)
        db: Session = SessionLocal()
        try:
            # Resolver ID del usuario
            def _safe_parse_int(val: Any) -> Optional[int]:
                try:
                    return int(str(val))
                except Exception:
                    return None

            def _resolve_user_id(sub_val: Any, db_sess: Session) -> int:
                parsed = _safe_parse_int(sub_val)
                if parsed is not None:
                    return parsed
                u = db_sess.query(UserModel).filter(UserModel.username == str(sub_val)).first()
                if not u:
                    raise Exception(f"Usuario no encontrado para sub: {sub_val}")
                return int(u.id)

            me_id = _resolve_user_id(user.get("sub"), db)
            notes = PlanService.get_user_notifications(db, me_id)
            result: List[Notification] = []
            for n in notes:
                # Normalizar fecha a ISO 8601 en UTC
                dt = getattr(n, 'created_at', None)
                if dt is not None:
                    try:
                        dt_utc = dt.astimezone(timezone.utc) if getattr(dt, 'tzinfo', None) else dt.replace(tzinfo=timezone.utc)
                        created_iso = dt_utc.isoformat()
                    except Exception:
                        created_iso = dt.isoformat() if hasattr(dt, 'isoformat') else str(dt)
                else:
                    created_iso = None

                result.append(Notification(
                    id=str(n.id),
                    type=n.type,
                    message=n.message,
                    plan_id=(str(n.related_plan_id) if n.related_plan_id is not None else None),
                    from_user_id=None,
                    invitation_id=(str(n.invitation_id) if getattr(n, 'invitation_id', None) is not None else None),
                    status=(str(n.status) if getattr(n, 'status', None) is not None else None),
                    created_at=created_iso
                ))
            return result
        finally:
            db.close()


@strawberry.type
class Mutation:
    @strawberry.mutation
    async def invite_user(self, info: Info, plan_id: strawberry.ID, email: str) -> InvitationResponse:
        """Invite a user to a plan by email."""
        user = require_user(info)
        db: Session = SessionLocal()
        try:
            def _safe_parse_int(val: Any) -> Optional[int]:
                try:
                    return int(str(val))
                except Exception:
                    return None

            def _resolve_user_id(sub_val: Any, db_sess: Session) -> int:
                parsed = _safe_parse_int(sub_val)
                if parsed is not None:
                    return parsed
                u = db_sess.query(UserModel).filter(UserModel.username == str(sub_val)).first()
                if not u:
                    raise Exception(f"Usuario no encontrado para sub: {sub_val}")
                return int(u.id)

            owner_id = _resolve_user_id(user.get("sub"), db)
            plan_int = _safe_parse_int(plan_id)
            if plan_int is None:
                raise Exception(f"planId inválido: {plan_id}")
            invitation = PlanService.invite_user_to_plan(db, plan_int, owner_id, email)
            if not invitation:
                raise Exception("No se pudo enviar la invitación")
            
            return InvitationResponse(message="Invitación enviada correctamente", invitation_id=str(invitation.id))
        finally:
            db.close()

    @strawberry.mutation
    async def respond_invitation(self, info: Info, plan_id: strawberry.ID, invitation_id: strawberry.ID, accept: bool = True) -> SimpleResponse:
        """Accept or reject a plan invitation."""
        user = require_user(info)
        db: Session = SessionLocal()
        try:
            def _safe_parse_int(val: Any) -> Optional[int]:
                try:
                    return int(str(val))
                except Exception:
                    return None

            def _resolve_user_id(sub_val: Any, db_sess: Session) -> int:
                parsed = _safe_parse_int(sub_val)
                if parsed is not None:
                    return parsed
                u = db_sess.query(UserModel).filter(UserModel.username == str(sub_val)).first()
                if not u:
                    raise Exception(f"Usuario no encontrado para sub: {sub_val}")
                return int(u.id)

            user_id = _resolve_user_id(user.get("sub"), db)
            inv_int = _safe_parse_int(invitation_id)
            plan_int = _safe_parse_int(plan_id)
            if inv_int is None:
                raise Exception(f"invitationId inválido: {invitation_id}")
            if plan_int is None:
                raise Exception(f"planId inválido: {plan_id}")
            ok = PlanService.respond_to_invitation(db, inv_int, user_id, accept)
            if not ok:
                raise Exception("Invitación no encontrada o ya procesada")
            
            return SimpleResponse(message=("Invitación aceptada correctamente" if accept else "Invitación rechazada"))
        finally:
            db.close()

    @strawberry.mutation
    async def update_collaborator_role(self, info: Info, plan_id: strawberry.ID, user_id: strawberry.ID, role: str) -> SimpleResponse:
        user = require_user(info)
        db: Session = SessionLocal()
        try:
            def _safe_parse_int(val: Any) -> Optional[int]:
                try:
                    return int(str(val))
                except Exception:
                    return None

            def _resolve_user_id(sub_val: Any, db_sess: Session) -> int:
                parsed = _safe_parse_int(sub_val)
                if parsed is not None:
                    return parsed
                u = db_sess.query(UserModel).filter(UserModel.username == str(sub_val)).first()
                if not u:
                    raise Exception(f"Usuario no encontrado para sub: {sub_val}")
                return int(u.id)

            me_id = _resolve_user_id(user.get("sub"), db)
            plan_int = _safe_parse_int(plan_id)
            user_int = _safe_parse_int(user_id)
            if plan_int is None:
                raise Exception(f"planId inválido: {plan_id}")
            if user_int is None:
                raise Exception(f"userId inválido: {user_id}")
            ok = PlanService.update_plan_user_role(db, plan_int, me_id, user_int, role)
            if not ok:
                raise Exception("No se pudo actualizar el rol del colaborador")
            return SimpleResponse(message="Rol actualizado correctamente")
        finally:
            db.close()

    @strawberry.mutation
    async def remove_collaborator(self, info: Info, plan_id: strawberry.ID, user_id: strawberry.ID) -> SimpleResponse:
        user = require_user(info)
        db: Session = SessionLocal()
        try:
            def _safe_parse_int(val: Any) -> Optional[int]:
                try:
                    return int(str(val))
                except Exception:
                    return None

            def _resolve_user_id(sub_val: Any, db_sess: Session) -> int:
                parsed = _safe_parse_int(sub_val)
                if parsed is not None:
                    return parsed
                u = db_sess.query(UserModel).filter(UserModel.username == str(sub_val)).first()
                if not u:
                    raise Exception(f"Usuario no encontrado para sub: {sub_val}")
                return int(u.id)

            me_id = _resolve_user_id(user.get("sub"), db)
            plan_int = _safe_parse_int(plan_id)
            user_int = _safe_parse_int(user_id)
            if plan_int is None:
                raise Exception(f"planId inválido: {plan_id}")
            if user_int is None:
                raise Exception(f"userId inválido: {user_id}")
            ok = PlanService.remove_user_from_plan(db, plan_int, me_id, user_int)
            if not ok:
                raise Exception("No se pudo remover el colaborador")
            return SimpleResponse(message="Colaborador removido correctamente")
        finally:
            db.close()

    @strawberry.mutation
    async def mark_notification_read(self, info: Info, notification_id: strawberry.ID) -> SimpleResponse:
        user = require_user(info)
        db: Session = SessionLocal()
        try:
            def _safe_parse_int(val: Any) -> Optional[int]:
                try:
                    return int(str(val))
                except Exception:
                    return None

            def _resolve_user_id(sub_val: Any, db_sess: Session) -> int:
                parsed = _safe_parse_int(sub_val)
                if parsed is not None:
                    return parsed
                u = db_sess.query(UserModel).filter(UserModel.username == str(sub_val)).first()
                if not u:
                    raise Exception(f"Usuario no encontrado para sub: {sub_val}")
                return int(u.id)

            me_id = _resolve_user_id(user.get("sub"), db)
            notif_int = _safe_parse_int(notification_id)
            if notif_int is None:
                raise Exception(f"notificationId inválido: {notification_id}")

            ok = PlanService.mark_notification_read(db, notif_int, me_id)
            if not ok:
                raise Exception("No se pudo marcar la notificación como leída")
            return SimpleResponse(message="Notificación marcada como leída")
        finally:
            db.close()


try:
    from strawberry.schema.config import StrawberryConfig
except Exception as e:
    import structlog
    logger = structlog.get_logger()
    logger.error(
        "Failed to import StrawberryConfig; GraphQL auto_camel_case unavailable",
        error=str(e)
    )
    raise

schema = strawberry.Schema(
    query=Query, mutation=Mutation,
    config=StrawberryConfig(auto_camel_case=True)
)

graphql_router = GraphQLRouter(
    schema,
    context_getter=get_context,
    debug=True,
)