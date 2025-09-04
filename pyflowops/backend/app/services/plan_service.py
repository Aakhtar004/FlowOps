from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import and_
import json

from app.models.plan_model import (
    StrategicPlan, CompanyIdentity, StrategicAnalysis, 
    AnalysisTools, Strategies, User
)
from app.schemas.plan_schema import (
    StrategicPlanCreate, StrategicPlanUpdate,
    CompanyIdentityCreate, CompanyIdentityUpdate,
    StrategicAnalysisCreate, StrategicAnalysisUpdate,
    AnalysisToolsCreate, AnalysisToolsUpdate,
    StrategiesCreate, StrategiesUpdate,
    ExecutiveSummary
)


class PlanService:
    """
    Servicio para la gestión de planes estratégicos.
    Contiene toda la lógica de negocio relacionada con planes estratégicos.
    """
    
    @staticmethod
    def create_strategic_plan(db: Session, plan_data: StrategicPlanCreate, owner_id: int) -> StrategicPlan:
        """Crear un nuevo plan estratégico."""
        plan = StrategicPlan(
            title=plan_data.title,
            description=plan_data.description,
            owner_id=owner_id,
            is_active=plan_data.is_active
        )
        db.add(plan)
        db.commit()
        db.refresh(plan)
        return plan
    
    @staticmethod
    def get_strategic_plan(db: Session, plan_id: int, owner_id: int) -> Optional[StrategicPlan]:
        """Obtener un plan estratégico por ID y propietario."""
        return db.query(StrategicPlan).filter(
            and_(StrategicPlan.id == plan_id, StrategicPlan.owner_id == owner_id)
        ).first()
    
    @staticmethod
    def get_strategic_plans(db: Session, owner_id: int, skip: int = 0, limit: int = 100) -> List[StrategicPlan]:
        """Obtener todos los planes estratégicos de un usuario."""
        return db.query(StrategicPlan).filter(
            StrategicPlan.owner_id == owner_id
        ).offset(skip).limit(limit).all()
    
    @staticmethod
    def update_strategic_plan(
        db: Session, 
        plan_id: int, 
        owner_id: int, 
        plan_data: StrategicPlanUpdate
    ) -> Optional[StrategicPlan]:
        """Actualizar un plan estratégico."""
        plan = PlanService.get_strategic_plan(db, plan_id, owner_id)
        if not plan:
            return None
        
        update_data = plan_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(plan, field, value)
        
        db.commit()
        db.refresh(plan)
        return plan
    
    @staticmethod
    def delete_strategic_plan(db: Session, plan_id: int, owner_id: int) -> bool:
        """Eliminar un plan estratégico."""
        plan = PlanService.get_strategic_plan(db, plan_id, owner_id)
        if not plan:
            return False
        
        db.delete(plan)
        db.commit()
        return True
    
    # Métodos para Identidad de la Empresa
    @staticmethod
    def create_or_update_company_identity(
        db: Session, 
        plan_id: int, 
        owner_id: int, 
        identity_data: CompanyIdentityUpdate
    ) -> Optional[CompanyIdentity]:
        """Crear o actualizar identidad de la empresa."""
        plan = PlanService.get_strategic_plan(db, plan_id, owner_id)
        if not plan:
            return None
        
        identity = db.query(CompanyIdentity).filter(
            CompanyIdentity.strategic_plan_id == plan_id
        ).first()
        
        if identity:
            # Actualizar existente
            update_data = identity_data.dict(exclude_unset=True)
            for field, value in update_data.items():
                if field in ['values', 'objectives'] and value is not None:
                    setattr(identity, field, json.dumps(value))
                else:
                    setattr(identity, field, value)
        else:
            # Crear nuevo
            identity = CompanyIdentity(
                strategic_plan_id=plan_id,
                mission=identity_data.mission,
                vision=identity_data.vision,
                values=json.dumps(identity_data.values or []),
                objectives=json.dumps(identity_data.objectives or [])
            )
            db.add(identity)
        
        db.commit()
        db.refresh(identity)
        return identity
    
    @staticmethod
    def get_company_identity(db: Session, plan_id: int, owner_id: int) -> Optional[CompanyIdentity]:
        """Obtener identidad de la empresa."""
        plan = PlanService.get_strategic_plan(db, plan_id, owner_id)
        if not plan:
            return None
        
        return db.query(CompanyIdentity).filter(
            CompanyIdentity.strategic_plan_id == plan_id
        ).first()
    
    # Métodos para Análisis Estratégico
    @staticmethod
    def create_or_update_strategic_analysis(
        db: Session, 
        plan_id: int, 
        owner_id: int, 
        analysis_data: StrategicAnalysisUpdate
    ) -> Optional[StrategicAnalysis]:
        """Crear o actualizar análisis estratégico."""
        plan = PlanService.get_strategic_plan(db, plan_id, owner_id)
        if not plan:
            return None
        
        analysis = db.query(StrategicAnalysis).filter(
            StrategicAnalysis.strategic_plan_id == plan_id
        ).first()
        
        if analysis:
            # Actualizar existente
            update_data = analysis_data.dict(exclude_unset=True)
            for field, value in update_data.items():
                if field in ['internal_strengths', 'internal_weaknesses', 'external_opportunities', 'external_threats'] and value is not None:
                    setattr(analysis, field, json.dumps(value))
                else:
                    setattr(analysis, field, value)
        else:
            # Crear nuevo
            analysis = StrategicAnalysis(
                strategic_plan_id=plan_id,
                internal_strengths=json.dumps(analysis_data.internal_strengths or []),
                internal_weaknesses=json.dumps(analysis_data.internal_weaknesses or []),
                external_opportunities=json.dumps(analysis_data.external_opportunities or []),
                external_threats=json.dumps(analysis_data.external_threats or []),
                swot_summary=analysis_data.swot_summary
            )
            db.add(analysis)
        
        db.commit()
        db.refresh(analysis)
        return analysis
    
    @staticmethod
    def get_strategic_analysis(db: Session, plan_id: int, owner_id: int) -> Optional[StrategicAnalysis]:
        """Obtener análisis estratégico."""
        plan = PlanService.get_strategic_plan(db, plan_id, owner_id)
        if not plan:
            return None
        
        return db.query(StrategicAnalysis).filter(
            StrategicAnalysis.strategic_plan_id == plan_id
        ).first()
    
    # Métodos para Herramientas de Análisis
    @staticmethod
    def create_or_update_analysis_tools(
        db: Session, 
        plan_id: int, 
        owner_id: int, 
        tools_data: AnalysisToolsUpdate
    ) -> Optional[AnalysisTools]:
        """Crear o actualizar herramientas de análisis."""
        plan = PlanService.get_strategic_plan(db, plan_id, owner_id)
        if not plan:
            return None
        
        tools = db.query(AnalysisTools).filter(
            AnalysisTools.strategic_plan_id == plan_id
        ).first()
        
        if tools:
            # Actualizar existente
            update_data = tools_data.dict(exclude_unset=True)
            for field, value in update_data.items():
                if field in ['value_chain_primary', 'value_chain_support', 'participation_matrix'] and value is not None:
                    setattr(tools, field, json.dumps(value))
                else:
                    setattr(tools, field, value)
        else:
            # Crear nuevo
            tools = AnalysisTools(
                strategic_plan_id=plan_id,
                value_chain_primary=json.dumps(tools_data.value_chain_primary or {}),
                value_chain_support=json.dumps(tools_data.value_chain_support or {}),
                participation_matrix=json.dumps(tools_data.participation_matrix or {}),
                porter_competitive_rivalry=tools_data.porter_competitive_rivalry,
                porter_supplier_power=tools_data.porter_supplier_power,
                porter_buyer_power=tools_data.porter_buyer_power,
                porter_threat_substitutes=tools_data.porter_threat_substitutes,
                porter_threat_new_entrants=tools_data.porter_threat_new_entrants,
                pest_political=tools_data.pest_political,
                pest_economic=tools_data.pest_economic,
                pest_social=tools_data.pest_social,
                pest_technological=tools_data.pest_technological
            )
            db.add(tools)
        
        db.commit()
        db.refresh(tools)
        return tools
    
    @staticmethod
    def get_analysis_tools(db: Session, plan_id: int, owner_id: int) -> Optional[AnalysisTools]:
        """Obtener herramientas de análisis."""
        plan = PlanService.get_strategic_plan(db, plan_id, owner_id)
        if not plan:
            return None
        
        return db.query(AnalysisTools).filter(
            AnalysisTools.strategic_plan_id == plan_id
        ).first()
    
    # Métodos para Estrategias
    @staticmethod
    def create_or_update_strategies(
        db: Session, 
        plan_id: int, 
        owner_id: int, 
        strategies_data: StrategiesUpdate
    ) -> Optional[Strategies]:
        """Crear o actualizar estrategias."""
        plan = PlanService.get_strategic_plan(db, plan_id, owner_id)
        if not plan:
            return None
        
        strategies = db.query(Strategies).filter(
            Strategies.strategic_plan_id == plan_id
        ).first()
        
        if strategies:
            # Actualizar existente
            update_data = strategies_data.dict(exclude_unset=True)
            for field, value in update_data.items():
                if field in ['strategy_identification', 'game_growth', 'game_avoid', 'game_merge', 'game_exit', 'priority_strategies'] and value is not None:
                    setattr(strategies, field, json.dumps(value))
                elif field == 'implementation_timeline' and value is not None:
                    setattr(strategies, field, json.dumps(value))
                else:
                    setattr(strategies, field, value)
        else:
            # Crear nuevo
            strategies = Strategies(
                strategic_plan_id=plan_id,
                strategy_identification=json.dumps(strategies_data.strategy_identification or []),
                game_growth=json.dumps(strategies_data.game_growth or []),
                game_avoid=json.dumps(strategies_data.game_avoid or []),
                game_merge=json.dumps(strategies_data.game_merge or []),
                game_exit=json.dumps(strategies_data.game_exit or []),
                priority_strategies=json.dumps(strategies_data.priority_strategies or []),
                implementation_timeline=json.dumps(strategies_data.implementation_timeline or {})
            )
            db.add(strategies)
        
        db.commit()
        db.refresh(strategies)
        return strategies
    
    @staticmethod
    def get_strategies(db: Session, plan_id: int, owner_id: int) -> Optional[Strategies]:
        """Obtener estrategias."""
        plan = PlanService.get_strategic_plan(db, plan_id, owner_id)
        if not plan:
            return None
        
        return db.query(Strategies).filter(
            Strategies.strategic_plan_id == plan_id
        ).first()
    
    # Resumen Ejecutivo
    @staticmethod
    def generate_executive_summary(db: Session, plan_id: int, owner_id: int) -> Optional[Dict[str, Any]]:
        """Generar resumen ejecutivo del plan estratégico."""
        plan = PlanService.get_strategic_plan(db, plan_id, owner_id)
        if not plan:
            return None
        
        # Obtener todos los componentes
        identity = PlanService.get_company_identity(db, plan_id, owner_id)
        analysis = PlanService.get_strategic_analysis(db, plan_id, owner_id)
        tools = PlanService.get_analysis_tools(db, plan_id, owner_id)
        strategies = PlanService.get_strategies(db, plan_id, owner_id)
        
        # Calcular porcentaje de completitud
        completion_count = 0
        total_sections = 4
        
        if identity and (identity.mission or identity.vision):
            completion_count += 1
        if analysis and (analysis.internal_strengths or analysis.external_opportunities):
            completion_count += 1
        if tools and (tools.porter_competitive_rivalry or tools.pest_political):
            completion_count += 1
        if strategies and strategies.strategy_identification:
            completion_count += 1
        
        completion_percentage = (completion_count / total_sections) * 100
        
        # Generar insights y recomendaciones básicas
        key_insights = []
        recommendations = []
        
        if analysis:
            try:
                strengths = json.loads(analysis.internal_strengths or "[]")
                opportunities = json.loads(analysis.external_opportunities or "[]")
                if strengths and opportunities:
                    key_insights.append("Se identificaron fortalezas internas que pueden apalancarse con oportunidades externas.")
                    recommendations.append("Desarrollar estrategias que maximicen las fortalezas identificadas.")
            except:
                pass
        
        if completion_percentage < 50:
            recommendations.append("Se recomienda completar más secciones del plan para obtener un análisis más completo.")
        
        return {
            "strategic_plan": plan,
            "company_identity": identity,
            "strategic_analysis": analysis,
            "analysis_tools": tools,
            "strategies": strategies,
            "completion_percentage": completion_percentage,
            "key_insights": key_insights,
            "recommendations": recommendations
        }
