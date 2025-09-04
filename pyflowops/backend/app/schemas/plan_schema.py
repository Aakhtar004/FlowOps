from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, EmailStr, validator
import json


# Esquemas base
class UserBase(BaseModel):
    """Esquema base para usuario."""
    username: str
    email: EmailStr
    full_name: Optional[str] = None
    is_active: bool = True


class UserCreate(UserBase):
    """Esquema para crear usuario."""
    password: str
    
    @validator('password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('La contraseña debe tener al menos 8 caracteres')
        return v


class UserLogin(BaseModel):
    """Esquema para login de usuario."""
    username: str
    password: str


class User(UserBase):
    """Esquema para respuesta de usuario."""
    id: int
    is_superuser: bool
    created_at: datetime
    updated_at: Optional[datetime]
    
    class Config:
        from_attributes = True


class Token(BaseModel):
    """Esquema para token de autenticación."""
    access_token: str
    token_type: str
    user: User


# Esquemas para Plan Estratégico
class StrategicPlanBase(BaseModel):
    """Esquema base para plan estratégico."""
    title: str
    description: Optional[str] = None
    is_active: bool = True


class StrategicPlanCreate(StrategicPlanBase):
    """Esquema para crear plan estratégico."""
    pass


class StrategicPlanUpdate(BaseModel):
    """Esquema para actualizar plan estratégico."""
    title: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None


class StrategicPlan(StrategicPlanBase):
    """Esquema para respuesta de plan estratégico."""
    id: int
    owner_id: int
    created_at: datetime
    updated_at: Optional[datetime]
    
    class Config:
        from_attributes = True


# Esquemas para Identidad de la Empresa
class CompanyIdentityBase(BaseModel):
    """Esquema base para identidad empresarial."""
    mission: Optional[str] = None
    vision: Optional[str] = None
    values: Optional[List[str]] = None
    objectives: Optional[List[str]] = None
    
    @validator('values', 'objectives', pre=True)
    def parse_json_list(cls, v):
        if isinstance(v, str):
            try:
                return json.loads(v)
            except json.JSONDecodeError:
                return []
        return v or []


class CompanyIdentityCreate(CompanyIdentityBase):
    """Esquema para crear identidad empresarial."""
    strategic_plan_id: int


class CompanyIdentityUpdate(BaseModel):
    """Esquema para actualizar identidad empresarial."""
    mission: Optional[str] = None
    vision: Optional[str] = None
    values: Optional[List[str]] = None
    objectives: Optional[List[str]] = None


class CompanyIdentity(CompanyIdentityBase):
    """Esquema para respuesta de identidad empresarial."""
    id: int
    strategic_plan_id: int
    created_at: datetime
    updated_at: Optional[datetime]
    
    class Config:
        from_attributes = True


# Esquemas para Análisis Estratégico
class StrategicAnalysisBase(BaseModel):
    """Esquema base para análisis estratégico."""
    internal_strengths: Optional[List[str]] = None
    internal_weaknesses: Optional[List[str]] = None
    external_opportunities: Optional[List[str]] = None
    external_threats: Optional[List[str]] = None
    swot_summary: Optional[str] = None
    
    @validator('internal_strengths', 'internal_weaknesses', 'external_opportunities', 'external_threats', pre=True)
    def parse_json_list(cls, v):
        if isinstance(v, str):
            try:
                return json.loads(v)
            except json.JSONDecodeError:
                return []
        return v or []


class StrategicAnalysisCreate(StrategicAnalysisBase):
    """Esquema para crear análisis estratégico."""
    strategic_plan_id: int


class StrategicAnalysisUpdate(BaseModel):
    """Esquema para actualizar análisis estratégico."""
    internal_strengths: Optional[List[str]] = None
    internal_weaknesses: Optional[List[str]] = None
    external_opportunities: Optional[List[str]] = None
    external_threats: Optional[List[str]] = None
    swot_summary: Optional[str] = None


class StrategicAnalysis(StrategicAnalysisBase):
    """Esquema para respuesta de análisis estratégico."""
    id: int
    strategic_plan_id: int
    created_at: datetime
    updated_at: Optional[datetime]
    
    class Config:
        from_attributes = True


# Esquemas para Herramientas de Análisis
class AnalysisToolsBase(BaseModel):
    """Esquema base para herramientas de análisis."""
    # Cadena de Valor
    value_chain_primary: Optional[Dict[str, Any]] = None
    value_chain_support: Optional[Dict[str, Any]] = None
    
    # Matriz de Participación
    participation_matrix: Optional[Dict[str, Any]] = None
    
    # 5 Fuerzas de Porter
    porter_competitive_rivalry: Optional[str] = None
    porter_supplier_power: Optional[str] = None
    porter_buyer_power: Optional[str] = None
    porter_threat_substitutes: Optional[str] = None
    porter_threat_new_entrants: Optional[str] = None
    
    # Análisis PEST
    pest_political: Optional[str] = None
    pest_economic: Optional[str] = None
    pest_social: Optional[str] = None
    pest_technological: Optional[str] = None
    
    @validator('value_chain_primary', 'value_chain_support', 'participation_matrix', pre=True)
    def parse_json_dict(cls, v):
        if isinstance(v, str):
            try:
                return json.loads(v)
            except json.JSONDecodeError:
                return {}
        return v or {}


class AnalysisToolsCreate(AnalysisToolsBase):
    """Esquema para crear herramientas de análisis."""
    strategic_plan_id: int


class AnalysisToolsUpdate(BaseModel):
    """Esquema para actualizar herramientas de análisis."""
    value_chain_primary: Optional[Dict[str, Any]] = None
    value_chain_support: Optional[Dict[str, Any]] = None
    participation_matrix: Optional[Dict[str, Any]] = None
    porter_competitive_rivalry: Optional[str] = None
    porter_supplier_power: Optional[str] = None
    porter_buyer_power: Optional[str] = None
    porter_threat_substitutes: Optional[str] = None
    porter_threat_new_entrants: Optional[str] = None
    pest_political: Optional[str] = None
    pest_economic: Optional[str] = None
    pest_social: Optional[str] = None
    pest_technological: Optional[str] = None


class AnalysisTools(AnalysisToolsBase):
    """Esquema para respuesta de herramientas de análisis."""
    id: int
    strategic_plan_id: int
    created_at: datetime
    updated_at: Optional[datetime]
    
    class Config:
        from_attributes = True


# Esquemas para Estrategias
class StrategiesBase(BaseModel):
    """Esquema base para estrategias."""
    strategy_identification: Optional[List[str]] = None
    game_growth: Optional[List[str]] = None
    game_avoid: Optional[List[str]] = None
    game_merge: Optional[List[str]] = None
    game_exit: Optional[List[str]] = None
    priority_strategies: Optional[List[str]] = None
    implementation_timeline: Optional[Dict[str, Any]] = None
    
    @validator('strategy_identification', 'game_growth', 'game_avoid', 'game_merge', 'game_exit', 'priority_strategies', pre=True)
    def parse_json_list(cls, v):
        if isinstance(v, str):
            try:
                return json.loads(v)
            except json.JSONDecodeError:
                return []
        return v or []
    
    @validator('implementation_timeline', pre=True)
    def parse_json_dict(cls, v):
        if isinstance(v, str):
            try:
                return json.loads(v)
            except json.JSONDecodeError:
                return {}
        return v or {}


class StrategiesCreate(StrategiesBase):
    """Esquema para crear estrategias."""
    strategic_plan_id: int


class StrategiesUpdate(BaseModel):
    """Esquema para actualizar estrategias."""
    strategy_identification: Optional[List[str]] = None
    game_growth: Optional[List[str]] = None
    game_avoid: Optional[List[str]] = None
    game_merge: Optional[List[str]] = None
    game_exit: Optional[List[str]] = None
    priority_strategies: Optional[List[str]] = None
    implementation_timeline: Optional[Dict[str, Any]] = None


class Strategies(StrategiesBase):
    """Esquema para respuesta de estrategias."""
    id: int
    strategic_plan_id: int
    created_at: datetime
    updated_at: Optional[datetime]
    
    class Config:
        from_attributes = True


# Esquemas simplificados para el frontend
class IdentityUpdateRequest(BaseModel):
    """Esquema simplificado para actualizar identidad empresarial desde el frontend."""
    mission: Optional[str] = None
    vision: Optional[str] = None
    values: Optional[str] = None  # Texto simple, no JSON
    objectives: Optional[str] = None  # Texto simple, no JSON


class SwotUpdateRequest(BaseModel):
    """Esquema simplificado para actualizar análisis SWOT desde el frontend."""
    strengths: Optional[str] = None  # Texto simple
    weaknesses: Optional[str] = None  # Texto simple
    opportunities: Optional[str] = None  # Texto simple
    threats: Optional[str] = None  # Texto simple


class AnalysisToolsUpdateRequest(BaseModel):
    """Esquema simplificado para actualizar herramientas de análisis desde el frontend."""
    value_chain: Optional[str] = None
    participation_matrix: Optional[str] = None
    porter_forces: Optional[str] = None
    pest_analysis: Optional[str] = None


class StrategiesUpdateRequest(BaseModel):
    """Esquema simplificado para actualizar estrategias desde el frontend."""
    strategies: Optional[str] = None
    game_matrix: Optional[str] = None
    implementation_timeline: Optional[str] = None
    success_indicators: Optional[str] = None


# Esquema para Resumen Ejecutivo
class ExecutiveSummary(BaseModel):
    """Esquema para el resumen ejecutivo del plan estratégico."""
    strategic_plan: StrategicPlan
    company_identity: Optional[CompanyIdentity] = None
    strategic_analysis: Optional[StrategicAnalysis] = None
    analysis_tools: Optional[AnalysisTools] = None
    strategies: Optional[Strategies] = None
    
    # Campos calculados para el resumen
    completion_percentage: float = 0.0
    key_insights: List[str] = []
    recommendations: List[str] = []
    
    class Config:
        from_attributes = True
