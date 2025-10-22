from typing import Optional, List, Dict, Any, Union
from datetime import datetime
from pydantic import BaseModel, EmailStr, ConfigDict, validator
import json


# Esquemas base
class UserBase(BaseModel):
    """Esquema base para usuario."""
    username: str
    email: EmailStr
    full_name: Optional[str] = None
    is_active: bool = True


# Tipos tolerantes para roles y estados en REST (str)


# Tipo tolerante para estado de notificaciones en REST (str)


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
    
    model_config = ConfigDict(from_attributes=True)


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
    company_name: Optional[str] = None
    company_logo_url: Optional[str] = None
    promoters: Optional[str] = None
    strategic_units: Optional[List[str]] = None
    conclusions: Optional[str] = None
    is_active: bool = True

    @validator('strategic_units', pre=True, always=True)
    def parse_strategic_units(cls, v):
        if isinstance(v, str):
            try:
                return json.loads(v)
            except:
                return []
        return v or []


class StrategicPlanCreate(StrategicPlanBase):
    """Esquema para crear plan estratégico."""
    pass


class StrategicPlanUpdate(BaseModel):
    """Esquema para actualizar plan estratégico."""
    title: Optional[str] = None
    description: Optional[str] = None
    company_name: Optional[str] = None
    company_logo_url: Optional[str] = None
    promoters: Optional[str] = None
    strategic_units: Optional[List[str]] = None
    conclusions: Optional[str] = None
    is_active: Optional[bool] = None


class StrategicPlan(StrategicPlanBase):
    """Esquema para respuesta de plan estratégico."""
    id: int
    owner_id: int
    company_name: Optional[str] = None
    company_logo_url: Optional[str] = None
    promoters: Optional[str] = None
    strategic_units: Optional[List[str]] = None
    conclusions: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime]
    progress_percentage: float = 0.0
    status: str = "In development"

    model_config = ConfigDict(from_attributes=True)


# Esquemas para objetivos estratégicos
class SpecificObjective(BaseModel):
    """Esquema para objetivo específico."""
    text: str


class GeneralObjective(BaseModel):
    """Esquema para objetivo general."""
    text: str
    specific_objectives: List[SpecificObjective] = []


# Esquemas para Identidad de la Empresa
class CompanyIdentityBase(BaseModel):
    """Esquema base para identidad empresarial."""
    mission: Optional[str] = None
    vision: Optional[str] = None
    values: Optional[List[str]] = None
    general_objectives: Optional[List[GeneralObjective]] = None
    strategic_mission: Optional[str] = None

    @validator('values', pre=True, always=True)
    def parse_values(cls, v):
        if isinstance(v, str):
            try:
                return json.loads(v)
            except:
                return []
        return v or []

    @validator('general_objectives', pre=True, always=True)
    def parse_general_objectives(cls, v):
        if isinstance(v, str):
            try:
                return json.loads(v)
            except:
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
    general_objectives: Optional[List[GeneralObjective]] = None
    strategic_mission: Optional[str] = None


class CompanyIdentity(CompanyIdentityBase):
    """Esquema para respuesta de identidad empresarial."""
    id: int
    strategic_plan_id: int
    created_at: datetime
    updated_at: Optional[datetime]
    
    model_config = ConfigDict(from_attributes=True)


# Esquemas para Análisis Estratégico
class StrategicAnalysisBase(BaseModel):
    """Esquema base para análisis estratégico."""
    internal_strengths: Optional[List[str]] = None
    internal_weaknesses: Optional[List[str]] = None
    external_opportunities: Optional[List[str]] = None
    external_threats: Optional[List[str]] = None
    swot_summary: Optional[str] = None

    @validator('internal_strengths', pre=True, always=True)
    def parse_internal_strengths(cls, v):
        if isinstance(v, str):
            try:
                return json.loads(v)
            except:
                return []
        return v or []

    @validator('internal_weaknesses', pre=True, always=True)
    def parse_internal_weaknesses(cls, v):
        if isinstance(v, str):
            try:
                return json.loads(v)
            except:
                return []
        return v or []

    @validator('external_opportunities', pre=True, always=True)
    def parse_external_opportunities(cls, v):
        if isinstance(v, str):
            try:
                return json.loads(v)
            except:
                return []
        return v or []

    @validator('external_threats', pre=True, always=True)
    def parse_external_threats(cls, v):
        if isinstance(v, str):
            try:
                return json.loads(v)
            except:
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
    
    model_config = ConfigDict(from_attributes=True)


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
    
    # Matriz BCG (Boston Consulting Group)
    bcg_matrix_data: Optional[Dict[str, Any]] = None

    @validator('value_chain_primary', pre=True, always=True)
    def parse_value_chain_primary(cls, v):
        if isinstance(v, str):
            try:
                return json.loads(v)
            except:
                return {}
        return v or {}

    @validator('value_chain_support', pre=True, always=True)
    def parse_value_chain_support(cls, v):
        if isinstance(v, str):
            try:
                return json.loads(v)
            except:
                return {}
        return v or {}

    @validator('participation_matrix', pre=True, always=True)
    def parse_participation_matrix(cls, v):
        if isinstance(v, str):
            try:
                return json.loads(v)
            except:
                return {}
        return v or {}
    
    @validator('bcg_matrix_data', pre=True, always=True)
    def parse_bcg_matrix_data(cls, v):
        if isinstance(v, str):
            try:
                return json.loads(v)
            except:
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
    bcg_matrix_data: Optional[Dict[str, Any]] = None


class AnalysisTools(AnalysisToolsBase):
    """Esquema para respuesta de herramientas de análisis."""
    id: int
    strategic_plan_id: int
    created_at: datetime
    updated_at: Optional[datetime]
    
    model_config = ConfigDict(from_attributes=True)


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

    @validator('strategy_identification', pre=True, always=True)
    def parse_strategy_identification(cls, v):
        if isinstance(v, str):
            try:
                return json.loads(v)
            except:
                return []
        return v or []

    @validator('game_growth', pre=True, always=True)
    def parse_game_growth(cls, v):
        if isinstance(v, str):
            try:
                return json.loads(v)
            except:
                return []
        return v or []

    @validator('game_avoid', pre=True, always=True)
    def parse_game_avoid(cls, v):
        if isinstance(v, str):
            try:
                return json.loads(v)
            except:
                return []
        return v or []

    @validator('game_merge', pre=True, always=True)
    def parse_game_merge(cls, v):
        if isinstance(v, str):
            try:
                return json.loads(v)
            except:
                return []
        return v or []

    @validator('game_exit', pre=True, always=True)
    def parse_game_exit(cls, v):
        if isinstance(v, str):
            try:
                return json.loads(v)
            except:
                return []
        return v or []

    @validator('priority_strategies', pre=True, always=True)
    def parse_priority_strategies(cls, v):
        if isinstance(v, str):
            try:
                return json.loads(v)
            except:
                return []
        return v or []

    @validator('implementation_timeline', pre=True, always=True)
    def parse_implementation_timeline(cls, v):
        if isinstance(v, str):
            try:
                return json.loads(v)
            except:
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
    
    model_config = ConfigDict(from_attributes=True)


# Esquemas simplificados para el frontend
class IdentityUpdateRequest(BaseModel):
    """Esquema simplificado para actualizar identidad empresarial desde el frontend."""
    mission: Optional[str] = None
    vision: Optional[str] = None
    values: Optional[str] = None  # Texto simple, no JSON
    objectives: Optional[str] = None  # Texto simple, no JSON
    strategic_mission: Optional[str] = None
    general_objectives: Optional[List[GeneralObjective]] = None


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


# Esquemas para Resumen Ejecutivo
class PlanInfo(BaseModel):
    """Información básica del plan estratégico."""
    title: str
    description: Optional[str] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

class CompanyIdentitySummary(BaseModel):
    """Resumen de identidad empresarial."""
    mission: Optional[str] = None
    vision: Optional[str] = None
    values: List[str] = []
    general_objectives: List[GeneralObjective] = []

class StrategicAnalysisSummary(BaseModel):
    """Resumen de análisis estratégico."""
    internal_analysis: Dict[str, List[str]] = {}
    external_analysis: Dict[str, List[str]] = {}
    swot_summary: Optional[str] = None

class AnalysisToolsSummary(BaseModel):
    """Resumen de herramientas de análisis."""
    value_chain: Dict[str, List[Any]] = {}
    participation_matrix: List[Any] = []
    porter_five_forces: Dict[str, Optional[str]] = {}
    pest_analysis: Dict[str, Optional[str]] = {}

class StrategiesSummary(BaseModel):
    """Resumen de estrategias."""
    strategy_identification: List[Any] = []
    game_matrix: Dict[str, List[Any]] = {}
    priority_strategies: List[Any] = []
    implementation_timeline: List[Any] = []

class CompletionStatus(BaseModel):
    """Estado de completitud por sección."""
    completed: bool = False
    percentage: float = 0.0

class OverallCompletion(BaseModel):
    """Estado general de completitud."""
    completed_sections: int = 0
    total_sections: int = 4
    percentage: float = 0.0

class ExecutiveSummary(BaseModel):
    """Esquema completo para el resumen ejecutivo del plan estratégico."""
    plan_info: PlanInfo
    company_identity: CompanyIdentitySummary = CompanyIdentitySummary()
    strategic_analysis: StrategicAnalysisSummary = StrategicAnalysisSummary()
    analysis_tools: AnalysisToolsSummary = AnalysisToolsSummary()
    strategies: StrategiesSummary = StrategiesSummary()
    completion_status: Dict[str, Union[CompletionStatus, OverallCompletion]] = {}
    key_insights: List[str] = []
    recommendations: List[str] = []


# Esquemas para PlanUser
class PlanUserBase(BaseModel):
    """Esquema base para asociación usuario-plan."""
    role: str
    status: str

class PlanUser(PlanUserBase):
    """Esquema para respuesta de asociación usuario-plan."""
    id: int
    plan_id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime]

    model_config = ConfigDict(from_attributes=True)

class PlanUserWithUser(PlanUser):
    """Esquema para asociación usuario-plan con datos del usuario."""
    user: User


# Esquemas para Notificaciones
class NotificationBase(BaseModel):
    """Esquema base para notificaciones."""
    type: str
    message: str
    related_plan_id: Optional[int]
    invitation_id: Optional[int]

class Notification(NotificationBase):
    """Esquema para respuesta de notificaciones."""
    id: int
    user_id: int
    status: str
    created_at: datetime
    updated_at: Optional[datetime]

    model_config = ConfigDict(from_attributes=True)

class NotificationWithPlan(Notification):
    """Esquema para notificaciones con datos del plan relacionado."""
    related_plan: Optional[StrategicPlan]


# Esquemas para invitaciones
class InviteUserRequest(BaseModel):
    """Esquema para solicitar invitación de usuario."""
    email: EmailStr

class InvitationResponse(BaseModel):
    """Esquema para respuesta de invitación."""
    message: str
    invitation_id: Optional[int]
