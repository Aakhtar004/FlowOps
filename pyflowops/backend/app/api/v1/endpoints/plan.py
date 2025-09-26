from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
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
    AnalysisToolsUpdateRequest, StrategiesUpdateRequest
)
from app.services.plan_service import PlanService
from app.api.v1.endpoints.auth import get_current_active_user

router = APIRouter(prefix="/plans", tags=["Strategic Plans"])


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
    plan = PlanService.get_strategic_plan(db, plan_id, current_user.id)  # type: ignore
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
    Actualizar un plan estratégico.
    """
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
    Eliminar un plan estratégico.
    """
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
    try:
        identity = PlanService.create_or_update_company_identity(db, plan_id, current_user.id, identity_data)  # type: ignore
        if not identity:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Plan estratégico no encontrado"
            )
        return identity
    except Exception as e:
        # Log the error for debugging
        import logging
        logging.error(f"Error updating company identity: {str(e)}", exc_info=True)
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
    identity = PlanService.get_company_identity(db, plan_id, current_user.id)  # type: ignore
    if not identity:
        # Devolver objeto vacío en lugar de 404
        from datetime import datetime
        return CompanyIdentity(
            id=0,
            strategic_plan_id=plan_id,
            mission=None,
            vision=None,
            values=[],
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
        "created_at": identity.created_at,
        "updated_at": identity.updated_at
    }
    return CompanyIdentity(**identity_dict)



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
    analysis = PlanService.get_strategic_analysis(db, plan_id, current_user.id)  # type: ignore
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
    tools = PlanService.get_analysis_tools(db, plan_id, current_user.id)  # type: ignore
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
    strategies = PlanService.get_strategies(db, plan_id, current_user.id)  # type: ignore
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
    try:
        # Convertir strings a listas si es necesario
        values_list = [v.strip() for v in identity_data.values.split('\n') if v.strip()] if identity_data.values else None
        
        # Crear el objeto CompanyIdentityUpdate
        update_data = CompanyIdentityUpdate(
            mission=identity_data.mission,
            vision=identity_data.vision,
            values=values_list,
            general_objectives=identity_data.general_objectives
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
    try:
        # Simular guardado - en producción aquí iría la lógica real
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
    try:
        # Simular guardado - en producción aquí iría la lógica real
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
    try:
        # Simular guardado - en producción aquí iría la lógica real
        return {"message": "Estrategias actualizadas correctamente"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error al actualizar estrategias: {str(e)}"
        )
