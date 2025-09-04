from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey
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
    
    # Relación con planes estratégicos
    strategic_plans = relationship("StrategicPlan", back_populates="owner")


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
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relaciones
    owner = relationship("User", back_populates="strategic_plans")
    company_identity = relationship("CompanyIdentity", back_populates="strategic_plan", uselist=False)
    strategic_analysis = relationship("StrategicAnalysis", back_populates="strategic_plan", uselist=False)
    analysis_tools = relationship("AnalysisTools", back_populates="strategic_plan", uselist=False)
    strategies = relationship("Strategies", back_populates="strategic_plan", uselist=False)


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
    objectives = Column(Text, nullable=True)  # JSON string para múltiples objetivos
    
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
