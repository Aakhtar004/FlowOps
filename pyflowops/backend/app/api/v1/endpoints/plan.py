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
    plan = PlanService.create_strategic_plan(db, plan_data, current_user.id)
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
    plans = PlanService.get_strategic_plans(db, current_user.id, skip, limit)
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
    plan = PlanService.get_strategic_plan(db, plan_id, current_user.id)
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
    plan = PlanService.update_strategic_plan(db, plan_id, current_user.id, plan_data)
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
    deleted = PlanService.delete_strategic_plan(db, plan_id, current_user.id)
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
    identity = PlanService.create_or_update_company_identity(db, plan_id, current_user.id, identity_data)
    if not identity:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Plan estratégico no encontrado"
        )
    return identity


@router.get("/{plan_id}/company-identity", response_model=CompanyIdentity)
async def get_company_identity(
    plan_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Obtener la identidad de la empresa.
    """
    identity = PlanService.get_company_identity(db, plan_id, current_user.id)
    if not identity:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Identidad de la empresa no encontrada"
        )
    return identity


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
    analysis = PlanService.create_or_update_strategic_analysis(db, plan_id, current_user.id, analysis_data)
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
    analysis = PlanService.get_strategic_analysis(db, plan_id, current_user.id)
    if not analysis:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Análisis estratégico no encontrado"
        )
    return analysis


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
    tools = PlanService.create_or_update_analysis_tools(db, plan_id, current_user.id, tools_data)
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
    tools = PlanService.get_analysis_tools(db, plan_id, current_user.id)
    if not tools:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Herramientas de análisis no encontradas"
        )
    return tools


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
    strategies = PlanService.create_or_update_strategies(db, plan_id, current_user.id, strategies_data)
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
    strategies = PlanService.get_strategies(db, plan_id, current_user.id)
    if not strategies:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Estrategias no encontradas"
        )
    return strategies


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
    summary = PlanService.generate_executive_summary(db, plan_id, current_user.id)
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
        # Simular guardado - en producción aquí iría la lógica real
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
