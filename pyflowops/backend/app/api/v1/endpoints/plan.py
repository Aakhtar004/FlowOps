import structlog
from typing import List
import json
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.database import get_db
from app.models.plan_model import User
from app.schemas.plan_schema import (
    StrategicPlan, StrategicPlanCreate, StrategicPlanUpdate,
    CompanyIdentity, CompanyIdentityUpdate,
    StrategicAnalysis, StrategicAnalysisUpdate,
    AnalysisTools, AnalysisToolsUpdate,
    Strategies, StrategiesUpdate,
    ExecutiveSummary,
    IdentityUpdateRequest, SwotUpdateRequest,
    AnalysisToolsUpdateRequest, StrategiesUpdateRequest,
    PlanUser, PlanUserWithUser, Notification, InviteUserRequest, InvitationResponse
)
from app.services.plan_service import PlanService
from app.api.v1.endpoints.auth import get_current_active_user

print("Loading plan router")
router = APIRouter(prefix="/plans", tags=["Strategic Plans"])


# Endpoints para notificaciones (debe ir antes de /{plan_id} para evitar conflictos)
@router.get("/notifications", response_model=List[Notification])
async def get_user_notifications(
      current_user: User = Depends(get_current_active_user),
      db: Session = Depends(get_db)
 ):
    """
    Obtener notificaciones del usuario actual.
    """
    logger = structlog.get_logger()
    try:
        notifications = PlanService.get_user_notifications(db, current_user.id)
        logger.info("Retrieved user notifications", user_id=current_user.id, count=len(notifications))

        # Convertir objetos SQLAlchemy a modelos Pydantic
        result = []
        for notification in notifications:
            notification_dict = {
                "id": notification.id,
                "user_id": notification.user_id,
                "type": notification.type,
                "message": notification.message,
                "related_plan_id": notification.related_plan_id,
                "invitation_id": notification.invitation_id,
                "status": notification.status,
                "created_at": notification.created_at,
                "updated_at": notification.updated_at
            }
            result.append(Notification(**notification_dict))
        return result
    except Exception as e:
        logger.error("Error retrieving user notifications", user_id=current_user.id, error=str(e))
        return []


@router.put("/notifications/{notification_id}/read")
async def mark_notification_read(
   notification_id: int,
   current_user: User = Depends(get_current_active_user),
   db: Session = Depends(get_db)
):
   """
   Marcar notificación como leída.
   """
   success = PlanService.mark_notification_read(db, notification_id, current_user.id)
   if not success:
       raise HTTPException(
           status_code=status.HTTP_404_NOT_FOUND,
           detail="Notificación no encontrada"
       )
   return {"message": "Notificación marcada como leída"}


# Endpoints para obtener planes separados
@router.get("/owned")
async def get_owned_plans(
      current_user: User = Depends(get_current_active_user),
      db: Session = Depends(get_db)
  ):
    """
    Obtener planes propios del usuario.
    """
    logger = structlog.get_logger()
    try:
        plans = PlanService.get_owned_plans(db, current_user.id)
        logger.info("Retrieved owned plans", user_id=current_user.id, count=len(plans))

        # Convert to StrategicPlan models with proper datetime handling
        result = []
        for plan in plans:
            created_at = getattr(plan, 'created_at', None)
            updated_at = getattr(plan, 'updated_at', None)
            plan_dict = {
                "id": plan.id,
                "title": plan.title,
                "description": plan.description,
                "owner_id": plan.owner_id,
                "is_active": plan.is_active,
                "created_at": created_at if created_at else datetime.utcnow(),
                "updated_at": updated_at,
                "progress_percentage": getattr(plan, 'progress_percentage', 0.0),
                "status": getattr(plan, 'status', "In development")
            }
            result.append(StrategicPlan(**plan_dict))

        logger.info("Successfully processed owned plans", count=len(result))
        if not result:
            return Response(status_code=status.HTTP_204_NO_CONTENT)
        return result
    except Exception as e:
        logger.error("Error retrieving owned plans", user_id=current_user.id, error=str(e), exc_info=True)
        return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get("/shared")
async def get_shared_plans(
      current_user: User = Depends(get_current_active_user),
      db: Session = Depends(get_db)
  ):
    """
    Obtener planes compartidos con el usuario.
    """
    logger = structlog.get_logger()
    try:
        plans = PlanService.get_shared_plans(db, current_user.id)
        logger.info("Retrieved shared plans", user_id=current_user.id, count=len(plans))

        # Log details of each plan for debugging
        for i, plan in enumerate(plans):
            logger.info(f"Shared plan {i} details", plan_id=plan.id, title=plan.title, progress_percentage=getattr(plan, 'progress_percentage', None), status=getattr(plan, 'status', None))

        # Convert to StrategicPlan models with safe datetime handling
        result = []
        for plan in plans:
            created_at = getattr(plan, 'created_at', None)
            updated_at = getattr(plan, 'updated_at', None)

            # Helper to coerce various datetime representations safely
            def _coerce_dt(val, default=None):
                try:
                    from datetime import datetime
                    if isinstance(val, datetime):
                        return val
                    if isinstance(val, str):
                        try:
                            return datetime.fromisoformat(val.replace('Z', '+00:00'))
                        except Exception:
                            return default if default is not None else datetime.utcnow()
                    return val if val is not None else default
                except Exception:
                    from datetime import datetime
                    return default if default is not None else datetime.utcnow()

            created_dt = _coerce_dt(created_at, default=datetime.utcnow())
            updated_dt = _coerce_dt(updated_at, default=None)
            plan_dict = {
                "id": plan.id,
                "title": plan.title,
                "description": plan.description,
                "owner_id": plan.owner_id,
                "is_active": plan.is_active,
                "created_at": created_dt,
                "updated_at": updated_dt,
                "progress_percentage": getattr(plan, 'progress_percentage', 0.0),
                "status": getattr(plan, 'status', "In development")
            }
            result.append(StrategicPlan(**plan_dict))

        logger.info("Successfully processed shared plans", count=len(result))
        if not result:
            return Response(status_code=status.HTTP_204_NO_CONTENT)
        return result
    except Exception as e:
        logger.error("Error retrieving shared plans", user_id=current_user.id, error=str(e), exc_info=True)
        return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.post("/", response_model=StrategicPlan, status_code=status.HTTP_201_CREATED)
async def create_strategic_plan(
    plan_data: StrategicPlanCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Crear un nuevo plan estratégico.
    """
    plan = PlanService.create_strategic_plan(db, plan_data, current_user.id)  # type: ignore
    return plan


@router.get("/", response_model=List[StrategicPlan])
async def get_strategic_plans(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Obtener todos los planes estratégicos del usuario actual.
    """
    plans = PlanService.get_strategic_plans(db, current_user.id, skip, limit)  # type: ignore
    return plans




@router.get("/{plan_id}", response_model=StrategicPlan)
async def get_strategic_plan(
    plan_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Obtener un plan estratégico específico.
    """
    # Verificar acceso (owner o member accepted)
    access = PlanService.check_plan_access(db, plan_id, current_user.id)
    if not access:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes acceso a este plan"
        )

    plan = PlanService.get_strategic_plan(db, plan_id)
    if not plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Plan estratégico no encontrado"
        )
    return plan


@router.put("/{plan_id}", response_model=StrategicPlan)
async def update_strategic_plan(
    plan_id: int,
    plan_data: StrategicPlanUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Actualizar un plan estratégico (owner o colaborador aceptado).
    """
    # Verificar acceso (owner o colaborador aceptado)
    access = PlanService.check_plan_access(db, plan_id, current_user.id)
    if not access:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes acceso a este plan"
        )

    plan = PlanService.update_strategic_plan(db, plan_id, current_user.id, plan_data)  # type: ignore
    if not plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Plan estratégico no encontrado"
        )
    return plan


@router.delete("/{plan_id}")
async def delete_strategic_plan(
    plan_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Eliminar un plan estratégico (solo owner).
    """
    # Verificar que sea owner
    access = PlanService.check_plan_access(db, plan_id, current_user.id, require_owner=True)
    if not access:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo el owner puede eliminar el plan"
        )

    deleted = PlanService.delete_strategic_plan(db, plan_id, current_user.id)  # type: ignore
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Plan estratégico no encontrado"
        )
    return {"message": "Plan estratégico eliminado exitosamente"}


# Endpoints para Identidad de la Empresa
@router.put("/{plan_id}/company-identity", response_model=CompanyIdentity)
async def update_company_identity(
    plan_id: int,
    identity_data: CompanyIdentityUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Crear o actualizar la identidad de la empresa.
    """
    # Verificar acceso (owner o member accepted)
    access = PlanService.check_plan_access(db, plan_id, current_user.id)
    if not access:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes acceso a este plan"
        )

    logger = structlog.get_logger()
    logger.info("Updating company identity", plan_id=plan_id, user_id=current_user.id)
    try:
        identity = PlanService.create_or_update_company_identity(db, plan_id, current_user.id, identity_data)  # type: ignore
        if not identity:
            logger.warning("Plan not found for company identity update", plan_id=plan_id)
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Plan estratégico no encontrado"
            )
        logger.info("Company identity updated successfully", plan_id=plan_id)
        return identity
    except Exception as e:
        logger.error("Error updating company identity", plan_id=plan_id, error=str(e), exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error interno del servidor: {str(e)}"
        )


@router.get("/{plan_id}/company-identity", response_model=CompanyIdentity)
async def get_company_identity(
    plan_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Obtener la identidad de la empresa.
    """
    try:
        # Verificar acceso
        access = PlanService.check_plan_access(db, plan_id, current_user.id)
        if not access:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tienes acceso a este plan"
            )

        logger = structlog.get_logger()
        identity = PlanService.get_company_identity(db, plan_id)
        logger.info("Getting company identity", plan_id=plan_id, found=identity is not None)
        if not identity:
            # Devolver objeto vacío en lugar de 404
            from datetime import datetime
            logger.info("No identity found, returning default empty object", plan_id=plan_id)
            return CompanyIdentity(
                id=0,
                strategic_plan_id=plan_id,
                mission=None,
                vision=None,
                values=[],
                general_objectives=[],
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
        # Convertir el objeto SQLAlchemy a dict y luego a modelo Pydantic para aplicar validadores
        identity_dict = {
            "id": identity.id,
            "strategic_plan_id": identity.strategic_plan_id,
            "mission": identity.mission,
            "vision": identity.vision,
            "values": identity.values,
            "general_objectives": identity.general_objectives,
            "created_at": identity.created_at,
            "updated_at": identity.updated_at
        }
        return CompanyIdentity(**identity_dict)
    except Exception as e:
        logger = structlog.get_logger()
        logger.error("Error in get_company_identity", plan_id=plan_id, error=str(e), exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error interno del servidor: {str(e)}"
        )



# Endpoints para Análisis Estratégico
@router.put("/{plan_id}/strategic-analysis", response_model=StrategicAnalysis)
async def update_strategic_analysis(
    plan_id: int,
    analysis_data: StrategicAnalysisUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Crear o actualizar el análisis estratégico.
    """
    # Verificar acceso
    access = PlanService.check_plan_access(db, plan_id, current_user.id)
    if not access:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes acceso a este plan"
        )

    analysis = PlanService.create_or_update_strategic_analysis(db, plan_id, current_user.id, analysis_data)  # type: ignore
    if not analysis:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Plan estratégico no encontrado"
        )
    return analysis


@router.get("/{plan_id}/strategic-analysis", response_model=StrategicAnalysis)
async def get_strategic_analysis(
    plan_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Obtener el análisis estratégico.
    """
    try:
        # Verificar acceso
        access = PlanService.check_plan_access(db, plan_id, current_user.id)
        if not access:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tienes acceso a este plan"
            )

        analysis = PlanService.get_strategic_analysis(db, plan_id)
        if not analysis:
            # Devolver objeto vacío en lugar de 404
            from datetime import datetime
            return StrategicAnalysis(
                id=0,
                strategic_plan_id=plan_id,
                internal_strengths=[],
                internal_weaknesses=[],
                external_opportunities=[],
                external_threats=[],
                swot_summary=None,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
        # Convertir el objeto SQLAlchemy a dict y luego a modelo Pydantic para aplicar validadores
        analysis_dict = {
            "id": analysis.id,
            "strategic_plan_id": analysis.strategic_plan_id,
            "internal_strengths": analysis.internal_strengths,
            "internal_weaknesses": analysis.internal_weaknesses,
            "external_opportunities": analysis.external_opportunities,
            "external_threats": analysis.external_threats,
            "swot_summary": analysis.swot_summary,
            "created_at": analysis.created_at,
            "updated_at": analysis.updated_at
        }
        return StrategicAnalysis(**analysis_dict)
    except Exception as e:
        logger = structlog.get_logger()
        logger.error("Error in get_strategic_analysis", plan_id=plan_id, error=str(e), exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error interno del servidor: {str(e)}"
        )


# Endpoints para Herramientas de Análisis
@router.put("/{plan_id}/analysis-tools", response_model=AnalysisTools)
async def update_analysis_tools(
    plan_id: int,
    tools_data: AnalysisToolsUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Crear o actualizar las herramientas de análisis.
    """
    # Verificar acceso (owner o colaborador aceptado)
    access = PlanService.check_plan_access(db, plan_id, current_user.id)
    if not access:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes acceso a este plan"
        )
    tools = PlanService.create_or_update_analysis_tools(db, plan_id, current_user.id, tools_data)  # type: ignore
    if not tools:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Plan estratégico no encontrado"
        )
    return tools


@router.get("/{plan_id}/analysis-tools", response_model=AnalysisTools)
async def get_analysis_tools(
    plan_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Obtener las herramientas de análisis.
    """
    try:
        # Verificar acceso
        access = PlanService.check_plan_access(db, plan_id, current_user.id)
        if not access:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tienes acceso a este plan"
            )

        tools = PlanService.get_analysis_tools(db, plan_id)
        if not tools:
            # Devolver objeto vacío en lugar de 404
            from datetime import datetime
            return AnalysisTools(
                id=0,
                strategic_plan_id=plan_id,
                value_chain_primary={},
                value_chain_support={},
                participation_matrix={},
                porter_competitive_rivalry=None,
                porter_supplier_power=None,
                porter_buyer_power=None,
                porter_threat_substitutes=None,
                porter_threat_new_entrants=None,
                pest_political=None,
                pest_economic=None,
                pest_social=None,
                pest_technological=None,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
        # Convertir el objeto SQLAlchemy a dict y luego a modelo Pydantic para aplicar validadores
        tools_dict = {
            "id": tools.id,
            "strategic_plan_id": tools.strategic_plan_id,
            "value_chain_primary": tools.value_chain_primary,
            "value_chain_support": tools.value_chain_support,
            "participation_matrix": tools.participation_matrix,
            "porter_competitive_rivalry": tools.porter_competitive_rivalry,
            "porter_supplier_power": tools.porter_supplier_power,
            "porter_buyer_power": tools.porter_buyer_power,
            "porter_threat_substitutes": tools.porter_threat_substitutes,
            "porter_threat_new_entrants": tools.porter_threat_new_entrants,
            "pest_political": tools.pest_political,
            "pest_economic": tools.pest_economic,
            "pest_social": tools.pest_social,
            "pest_technological": tools.pest_technological,
            "created_at": tools.created_at,
            "updated_at": tools.updated_at
        }
        return AnalysisTools(**tools_dict)
    except Exception as e:
        logger = structlog.get_logger()
        logger.error("Error in get_analysis_tools", plan_id=plan_id, error=str(e), exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error interno del servidor: {str(e)}"
        )


# Endpoints para Estrategias
@router.put("/{plan_id}/strategies", response_model=Strategies)
async def update_strategies(
    plan_id: int,
    strategies_data: StrategiesUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Crear o actualizar las estrategias.
    """
    # Verificar acceso (owner o colaborador aceptado)
    access = PlanService.check_plan_access(db, plan_id, current_user.id)
    if not access:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes acceso a este plan"
        )
    strategies = PlanService.create_or_update_strategies(db, plan_id, current_user.id, strategies_data)  # type: ignore
    if not strategies:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Plan estratégico no encontrado"
        )
    return strategies


@router.get("/{plan_id}/strategies", response_model=Strategies)
async def get_strategies(
    plan_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Obtener las estrategias.
    """
    try:
        # Verificar acceso
        access = PlanService.check_plan_access(db, plan_id, current_user.id)
        if not access:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tienes acceso a este plan"
            )

        strategies = PlanService.get_strategies(db, plan_id)
        if not strategies:
            # Devolver objeto vacío en lugar de 404
            from datetime import datetime
            return Strategies(
                id=0,
                strategic_plan_id=plan_id,
                strategy_identification=[],
                game_growth=[],
                game_avoid=[],
                game_merge=[],
                game_exit=[],
                priority_strategies=[],
                implementation_timeline={},
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
        # Convertir el objeto SQLAlchemy a dict y luego a modelo Pydantic para aplicar validadores
        strategies_dict = {
            "id": strategies.id,
            "strategic_plan_id": strategies.strategic_plan_id,
            "strategy_identification": strategies.strategy_identification,
            "game_growth": strategies.game_growth,
            "game_avoid": strategies.game_avoid,
            "game_merge": strategies.game_merge,
            "game_exit": strategies.game_exit,
            "priority_strategies": strategies.priority_strategies,
            "implementation_timeline": strategies.implementation_timeline,
            "created_at": strategies.created_at,
            "updated_at": strategies.updated_at
        }
        return Strategies(**strategies_dict)
    except Exception as e:
        logger = structlog.get_logger()
        logger.error("Error in get_strategies", plan_id=plan_id, error=str(e), exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error interno del servidor: {str(e)}"
        )


# Endpoint para Resumen Ejecutivo
@router.get("/{plan_id}/executive-summary")
async def get_executive_summary(
    plan_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Generar y obtener el resumen ejecutivo del plan estratégico.
    """
    # Verificar acceso
    access = PlanService.check_plan_access(db, plan_id, current_user.id)
    if not access:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes acceso a este plan"
        )

    summary = PlanService.generate_executive_summary(db, plan_id, current_user.id)  # type: ignore
    if not summary:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Plan estratégico no encontrado"
        )
    return summary


# Endpoints simplificados para el frontend
@router.put("/{plan_id}/identity")
async def update_plan_identity(
    plan_id: int,
    identity_data: IdentityUpdateRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Actualizar la identidad empresarial con formato simplificado.
    """
    # Verificar acceso
    access = PlanService.check_plan_access(db, plan_id, current_user.id)
    if not access:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes acceso a este plan"
        )

    try:
        # Convertir strings a listas si es necesario
        values_list = [v.strip() for v in identity_data.values.split('\n') if v.strip()] if identity_data.values else None

        # Parsear objectives string a general_objectives
        general_objectives_list = None
        if identity_data.objectives:
            objectives_lines = [line.strip() for line in identity_data.objectives.split('\n') if line.strip()]
            general_objectives_list = [{"text": obj, "specific_objectives": []} for obj in objectives_lines]

        # Crear el objeto CompanyIdentityUpdate
        update_data = CompanyIdentityUpdate(
            mission=identity_data.mission,
            vision=identity_data.vision,
            values=values_list,
            general_objectives=general_objectives_list
        )

        # Llamar al servicio real
        result = PlanService.create_or_update_company_identity(
            db, plan_id, current_user.id, update_data  # type: ignore
        )

        if result is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Plan estratégico no encontrado"
            )

        return {"message": "Identidad empresarial actualizada correctamente"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error al actualizar identidad: {str(e)}"
        )


@router.put("/{plan_id}/swot")
async def update_plan_swot(
    plan_id: int,
    swot_data: SwotUpdateRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Actualizar el análisis SWOT con formato simplificado.
    """
    # Verificar acceso
    access = PlanService.check_plan_access(db, plan_id, current_user.id)
    if not access:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes acceso a este plan"
        )

    try:
        # Convertir strings a listas si es necesario
        strengths_list = [s.strip() for s in swot_data.strengths.split('\n') if s.strip()] if swot_data.strengths else None
        weaknesses_list = [w.strip() for w in swot_data.weaknesses.split('\n') if w.strip()] if swot_data.weaknesses else None
        opportunities_list = [o.strip() for o in swot_data.opportunities.split('\n') if o.strip()] if swot_data.opportunities else None
        threats_list = [t.strip() for t in swot_data.threats.split('\n') if t.strip()] if swot_data.threats else None

        # Crear el objeto StrategicAnalysisUpdate
        update_data = StrategicAnalysisUpdate(
            internal_strengths=strengths_list,
            internal_weaknesses=weaknesses_list,
            external_opportunities=opportunities_list,
            external_threats=threats_list
        )

        # Llamar al servicio real
        result = PlanService.create_or_update_strategic_analysis(
            db, plan_id, current_user.id, update_data  # type: ignore
        )

        if result is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Plan estratégico no encontrado"
            )

        return {"message": "Análisis SWOT actualizado correctamente"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error al actualizar SWOT: {str(e)}"
        )


@router.put("/{plan_id}/tools")
async def update_plan_tools(
    plan_id: int,
    tools_data: AnalysisToolsUpdateRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Actualizar las herramientas de análisis con formato simplificado.
    """
    # Verificar acceso
    access = PlanService.check_plan_access(db, plan_id, current_user.id)
    if not access:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes acceso a este plan"
        )

    try:
        # Función auxiliar para parsear JSON o devolver dict con descripción
        def safe_parse_json(text):
            if not text:
                return {}
            try:
                return json.loads(text)
            except:
                return {"description": text}

        # Parsear los datos
        value_chain_primary = safe_parse_json(tools_data.value_chain) if tools_data.value_chain else None
        participation_matrix = safe_parse_json(tools_data.participation_matrix) if tools_data.participation_matrix else None

        # Para porter_forces y pest_analysis, intentar parsear como objetos con múltiples campos
        porter_data = safe_parse_json(tools_data.porter_forces) if tools_data.porter_forces else {}
        pest_data = safe_parse_json(tools_data.pest_analysis) if tools_data.pest_analysis else {}

        # Crear el objeto AnalysisToolsUpdate
        update_data = AnalysisToolsUpdate(
            value_chain_primary=value_chain_primary,
            value_chain_support={},  # No especificado en el request simplificado
            participation_matrix=participation_matrix,
            porter_competitive_rivalry=porter_data.get('competitive_rivalry') or (tools_data.porter_forces if isinstance(porter_data, str) else None),
            porter_supplier_power=porter_data.get('supplier_power'),
            porter_buyer_power=porter_data.get('buyer_power'),
            porter_threat_substitutes=porter_data.get('threat_substitutes'),
            porter_threat_new_entrants=porter_data.get('threat_new_entrants'),
            pest_political=pest_data.get('political'),
            pest_economic=pest_data.get('economic'),
            pest_social=pest_data.get('social'),
            pest_technological=pest_data.get('technological')
        )

        # Llamar al servicio real
        result = PlanService.create_or_update_analysis_tools(
            db, plan_id, current_user.id, update_data  # type: ignore
        )

        if result is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Plan estratégico no encontrado"
            )

        return {"message": "Herramientas de análisis actualizadas correctamente"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error al actualizar herramientas: {str(e)}"
        )


@router.put("/{plan_id}/strategies-simple")
async def update_plan_strategies(
    plan_id: int,
    strategies_data: StrategiesUpdateRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Actualizar las estrategias con formato simplificado.
    """
    # Verificar acceso
    access = PlanService.check_plan_access(db, plan_id, current_user.id)
    if not access:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes acceso a este plan"
        )

    try:
        # Función auxiliar para parsear JSON o devolver dict con descripción
        def safe_parse_json(text):
            if not text:
                return {}
            try:
                return json.loads(text)
            except:
                return {"description": text}

        # Convertir strings a listas si es necesario
        strategy_identification = [s.strip() for s in strategies_data.strategies.split('\n') if s.strip()] if strategies_data.strategies else None

        # Parsear game_matrix
        game_data = safe_parse_json(strategies_data.game_matrix) if strategies_data.game_matrix else {}
        game_growth = game_data.get('growth', []) if isinstance(game_data, dict) else ([strategies_data.game_matrix] if strategies_data.game_matrix else None)
        game_avoid = game_data.get('avoid', [])
        game_merge = game_data.get('merge', [])
        game_exit = game_data.get('exit', [])

        # Parsear implementation_timeline
        implementation_timeline = safe_parse_json(strategies_data.implementation_timeline) if strategies_data.implementation_timeline else None

        # Para success_indicators, usar como priority_strategies
        priority_strategies = [s.strip() for s in strategies_data.success_indicators.split('\n') if s.strip()] if strategies_data.success_indicators else None

        # Crear el objeto StrategiesUpdate
        update_data = StrategiesUpdate(
            strategy_identification=strategy_identification,
            game_growth=game_growth,
            game_avoid=game_avoid,
            game_merge=game_merge,
            game_exit=game_exit,
            priority_strategies=priority_strategies,
            implementation_timeline=implementation_timeline
        )

        # Llamar al servicio real
        result = PlanService.create_or_update_strategies(
            db, plan_id, current_user.id, update_data  # type: ignore
        )

        if result is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Plan estratégico no encontrado"
            )

        return {"message": "Estrategias actualizadas correctamente"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error al actualizar estrategias: {str(e)}"
        )


# Endpoints para gestión de usuarios en planes
@router.post("/{plan_id}/invite", response_model=InvitationResponse)
async def invite_user_to_plan(
   plan_id: int,
   invite_data: InviteUserRequest,
   current_user: User = Depends(get_current_active_user),
   db: Session = Depends(get_db)
):
   """
   Invitar a un usuario a un plan por email.
   """
   try:
       invitation = PlanService.invite_user_to_plan(db, plan_id, current_user.id, invite_data.email)
       if not invitation:
           raise HTTPException(
               status_code=status.HTTP_400_BAD_REQUEST,
               detail="No se pudo enviar la invitación. Verifique que el usuario existe y no esté ya invitado."
           )
       return InvitationResponse(
           message="Invitación enviada correctamente",
           invitation_id=invitation.id
       )
   except Exception as e:
       raise HTTPException(
           status_code=status.HTTP_400_BAD_REQUEST,
           detail=f"Error al enviar invitación: {str(e)}"
       )


@router.post("/{plan_id}/invitations/{invitation_id}/accept")
async def accept_invitation(
   plan_id: int,
   invitation_id: int,
   current_user: User = Depends(get_current_active_user),
   db: Session = Depends(get_db)
):
   """
   Aceptar invitación a un plan.
   """
   success = PlanService.respond_to_invitation(db, invitation_id, current_user.id, accept=True)
   if not success:
       raise HTTPException(
           status_code=status.HTTP_404_NOT_FOUND,
           detail="Invitación no encontrada o ya procesada"
       )
   return {"message": "Invitación aceptada correctamente"}


@router.post("/{plan_id}/invitations/{invitation_id}/reject")
async def reject_invitation(
   plan_id: int,
   invitation_id: int,
   current_user: User = Depends(get_current_active_user),
   db: Session = Depends(get_db)
):
   """
   Rechazar invitación a un plan.
   """
   success = PlanService.respond_to_invitation(db, invitation_id, current_user.id, accept=False)
   if not success:
       raise HTTPException(
           status_code=status.HTTP_404_NOT_FOUND,
           detail="Invitación no encontrada o ya procesada"
       )
   return {"message": "Invitación rechazada"}


@router.get("/{plan_id}/users", response_model=List[PlanUserWithUser])
async def get_plan_users(
   plan_id: int,
   current_user: User = Depends(get_current_active_user),
   db: Session = Depends(get_db)
):
   """
   Obtener usuarios asociados a un plan (solo owner).
   """
   # Verificar que el usuario sea owner
   plan = PlanService.get_strategic_plan(db, plan_id)
   if not plan or plan.owner_id != current_user.id:
       raise HTTPException(
           status_code=status.HTTP_403_FORBIDDEN,
           detail="No tienes permisos para ver los usuarios de este plan"
       )

   plan_users = PlanService.get_plan_users(db, plan_id, current_user.id)
   # Cargar datos de usuario para cada plan_user
   result = []
   for pu in plan_users:
       result.append(PlanUserWithUser.from_orm(pu))
   return result


@router.delete("/{plan_id}/users/{user_id}")
async def remove_user_from_plan(
   plan_id: int,
   user_id: int,
   current_user: User = Depends(get_current_active_user),
   db: Session = Depends(get_db)
):
   """
   Remover usuario de un plan (solo owner).
   """
   success = PlanService.remove_user_from_plan(db, plan_id, current_user.id, user_id)
   if not success:
       raise HTTPException(
           status_code=status.HTTP_404_NOT_FOUND,
           detail="Usuario no encontrado en el plan o no tienes permisos"
       )
   return {"message": "Usuario removido del plan correctamente"}




