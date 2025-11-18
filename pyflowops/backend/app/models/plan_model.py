from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base


class User(Base):
    """
    Modelo de usuario para autenticación.
    """
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(128), nullable=False)
    full_name = Column(String(100), nullable=True)
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relaciones
    strategic_plans = relationship("StrategicPlan", back_populates="owner", lazy='select')
    plan_users = relationship("PlanUser", back_populates="user", lazy='select')
    notifications = relationship("Notification", back_populates="user", lazy='select')


class StrategicPlan(Base):
    """
    Modelo principal del Plan Estratégico.
    Contenedor de todos los módulos del plan.
    """
    __tablename__ = "strategic_plans"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Información de la empresa
    company_name = Column(String(200), nullable=True)
    company_logo_url = Column(String(500), nullable=True)
    promoters = Column(Text, nullable=True)  # Emprendedores / promotores
    strategic_units = Column(Text, nullable=True)  # JSON string para unidades estratégicas
    conclusions = Column(Text, nullable=True)  # Conclusiones del plan ejecutivo
    
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relaciones
    owner = relationship("User", back_populates="strategic_plans", lazy='select')
    plan_users = relationship("PlanUser", back_populates="plan", lazy='select', cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="related_plan", lazy='select', cascade="all, delete-orphan")
    company_identity = relationship("CompanyIdentity", back_populates="strategic_plan", uselist=False, lazy='select', cascade="all, delete-orphan")
    strategic_analysis = relationship("StrategicAnalysis", back_populates="strategic_plan", uselist=False, lazy='select', cascade="all, delete-orphan")
    analysis_tools = relationship("AnalysisTools", back_populates="strategic_plan", uselist=False, lazy='select', cascade="all, delete-orphan")
    strategies = relationship("Strategies", back_populates="strategic_plan", uselist=False, lazy='select', cascade="all, delete-orphan")


class PestAnalysis(Base):
    """
    Análisis PEST: Factores Políticos, Económicos, Sociales y Tecnológicos.
    """
    __tablename__ = "pest_analysis"
    
    id = Column(Integer, primary_key=True, index=True)
    strategic_plan_id = Column(Integer, ForeignKey("strategic_plans.id"), nullable=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relaciones
    strategic_plan = relationship("StrategicPlan", lazy='select')
    responses = relationship("PestResponse", back_populates="pest_analysis", lazy='select', cascade="all, delete-orphan")
    opportunities = relationship("Opportunity", back_populates="pest_analysis", lazy='select', cascade="all, delete-orphan")
    threats = relationship("Threat", back_populates="pest_analysis", lazy='select', cascade="all, delete-orphan")


class PestResponse(Base):
    """
    Respuestas individuales a preguntas PEST.
    """
    __tablename__ = "pest_response"
    
    id = Column(Integer, primary_key=True, index=True)
    pest_analysis_id = Column(Integer, ForeignKey("pest_analysis.id"), nullable=False)
    question_number = Column(Integer, nullable=False)
    category = Column(String(50), nullable=False)  # 'social', 'politico', 'economico', 'tecnologico', 'ambiental'
    response_value = Column(Integer, nullable=False)  # 0-4
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relación
    pest_analysis = relationship("PestAnalysis", back_populates="responses")


class Opportunity(Base):
    """
    Oportunidades identificadas en PEST.
    """
    __tablename__ = "opportunities"
    
    id = Column(Integer, primary_key=True, index=True)
    pest_analysis_id = Column(Integer, ForeignKey("pest_analysis.id"), nullable=False)
    opportunity_text = Column(Text, nullable=False)
    order_position = Column(Integer, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relación
    pest_analysis = relationship("PestAnalysis", back_populates="opportunities")


class Threat(Base):
    """
    Amenazas identificadas en PEST.
    """
    __tablename__ = "threats"
    
    id = Column(Integer, primary_key=True, index=True)
    pest_analysis_id = Column(Integer, ForeignKey("pest_analysis.id"), nullable=False)
    threat_text = Column(Text, nullable=False)
    order_position = Column(Integer, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relación
    pest_analysis = relationship("PestAnalysis", back_populates="threats")


class CompanyIdentity(Base):
    """
    Identidad de la empresa: Misión, Visión, Valores, Objetivos.
    """
    __tablename__ = "company_identity"
    
    id = Column(Integer, primary_key=True, index=True)
    strategic_plan_id = Column(Integer, ForeignKey("strategic_plans.id"), nullable=False)
    
    # Campos de identidad empresarial
    mission = Column(Text, nullable=True)
    vision = Column(Text, nullable=True)
    values = Column(Text, nullable=True)  # JSON string para múltiples valores
    
    # Campo para objetivos estratégicos detallados
    general_objectives = Column(Text, nullable=True)  # JSON string para objetivos generales con específicos
    strategic_mission = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relación
    strategic_plan = relationship("StrategicPlan", back_populates="company_identity")


class StrategicAnalysis(Base):
    """
    Análisis estratégico: Análisis Interno y Externo.
    """
    __tablename__ = "strategic_analysis"
    
    id = Column(Integer, primary_key=True, index=True)
    strategic_plan_id = Column(Integer, ForeignKey("strategic_plans.id"), nullable=False)
    
    # Análisis interno
    internal_strengths = Column(Text, nullable=True)  # JSON string
    internal_weaknesses = Column(Text, nullable=True)  # JSON string
    
    # Análisis externo
    external_opportunities = Column(Text, nullable=True)  # JSON string
    external_threats = Column(Text, nullable=True)  # JSON string
    
    # Análisis SWOT consolidado
    swot_summary = Column(Text, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relación
    strategic_plan = relationship("StrategicPlan", back_populates="strategic_analysis")


class AnalysisTools(Base):
    """
    Herramientas de análisis: Cadena de Valor, Matriz de Participación, 5 Fuerzas de Porter, PEST.
    """
    __tablename__ = "analysis_tools"
    
    id = Column(Integer, primary_key=True, index=True)
    strategic_plan_id = Column(Integer, ForeignKey("strategic_plans.id"), nullable=False)
    
    # Cadena de Valor
    value_chain_primary = Column(Text, nullable=True)  # JSON string para actividades primarias
    value_chain_support = Column(Text, nullable=True)  # JSON string para actividades de apoyo
    
    # Matriz de Participación
    participation_matrix = Column(Text, nullable=True)  # JSON string
    
    # 5 Fuerzas de Porter
    porter_competitive_rivalry = Column(Text, nullable=True)
    porter_supplier_power = Column(Text, nullable=True)
    porter_buyer_power = Column(Text, nullable=True)
    porter_threat_substitutes = Column(Text, nullable=True)
    porter_threat_new_entrants = Column(Text, nullable=True)
    
    # Análisis PEST
    pest_political = Column(Text, nullable=True)
    pest_economic = Column(Text, nullable=True)
    pest_social = Column(Text, nullable=True)
    pest_technological = Column(Text, nullable=True)
    
    # Matriz BCG (Boston Consulting Group)
    bcg_matrix_data = Column(Text, nullable=True)  # JSON string para datos de matriz BCG
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relación
    strategic_plan = relationship("StrategicPlan", back_populates="analysis_tools")


class Strategies(Base):
    """
    Estrategias: Identificación de Estrategia, Matriz GAME.
    """
    __tablename__ = "strategies"

    id = Column(Integer, primary_key=True, index=True)
    strategic_plan_id = Column(Integer, ForeignKey("strategic_plans.id"), nullable=False)

    # Identificación de estrategias
    strategy_identification = Column(Text, nullable=True)  # JSON string para múltiples estrategias

    # Matriz GAME (Growth-Avoid-Merge-Exit)
    game_growth = Column(Text, nullable=True)  # JSON string para estrategias de crecimiento
    game_avoid = Column(Text, nullable=True)  # JSON string para estrategias de evitar
    game_merge = Column(Text, nullable=True)  # JSON string para estrategias de fusión
    game_exit = Column(Text, nullable=True)  # JSON string para estrategias de salida

    # Estrategias prioritarias
    priority_strategies = Column(Text, nullable=True)  # JSON string
    implementation_timeline = Column(Text, nullable=True)  # JSON string

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relación
    strategic_plan = relationship("StrategicPlan", back_populates="strategies")


class PlanUser(Base):
    """
    Asociación muchos-a-muchos entre usuarios y planes estratégicos.
    Gestiona permisos y estado de invitaciones.
    """
    __tablename__ = "plan_users"

    id = Column(Integer, primary_key=True, index=True)
    plan_id = Column(Integer, ForeignKey("strategic_plans.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    role = Column(String(20), nullable=False)  # 'owner', 'member'
    status = Column(String(20), nullable=False, default='pending')  # 'pending', 'accepted', 'rejected'
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relaciones
    plan = relationship("StrategicPlan", back_populates="plan_users")
    user = relationship("User", back_populates="plan_users")

    __table_args__ = (
        UniqueConstraint('plan_id', 'user_id', name='unique_plan_user'),
    )


class Notification(Base):
    """
    Notificaciones del sistema para usuarios.
    """
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    type = Column(String(50), nullable=False)
    message = Column(Text, nullable=False)
    related_plan_id = Column(Integer, ForeignKey("strategic_plans.id"), nullable=True)
    invitation_id = Column(Integer, ForeignKey("plan_users.id"), nullable=True)  # For invitation notifications
    status = Column(String(20), nullable=False, default='unread')  # 'unread', 'read'
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relaciones
    user = relationship("User", back_populates="notifications")
    related_plan = relationship("StrategicPlan")
    invitation = relationship("PlanUser")
