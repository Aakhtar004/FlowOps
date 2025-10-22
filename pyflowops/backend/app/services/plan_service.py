from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session, joinedload, selectinload
from sqlalchemy import and_
import json

from app.models.plan_model import (
    StrategicPlan, CompanyIdentity, StrategicAnalysis,
    AnalysisTools, Strategies, User, PlanUser, Notification
)
from app.db.database import transaction
from app.schemas.plan_schema import (
    StrategicPlanCreate, StrategicPlanUpdate,
    CompanyIdentityCreate, CompanyIdentityUpdate,
    StrategicAnalysisCreate, StrategicAnalysisUpdate,
    AnalysisToolsCreate, AnalysisToolsUpdate,
    StrategiesCreate, StrategiesUpdate,
    ExecutiveSummary
)
from app.graphql.pubsub import PubSub, publish_plan_update, publish_invitation, publish_progress


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
        with transaction(db):
            db.add(plan)
        return plan
    
    @staticmethod
    def get_strategic_plan(db: Session, plan_id: int) -> Optional[StrategicPlan]:
        """Obtener un plan estratégico por ID con datos relacionados."""
        return db.query(StrategicPlan).options(
            joinedload(StrategicPlan.owner),
            selectinload(StrategicPlan.company_identity),
            selectinload(StrategicPlan.strategic_analysis),
            selectinload(StrategicPlan.analysis_tools),
            selectinload(StrategicPlan.strategies),
            selectinload(StrategicPlan.plan_users).joinedload(PlanUser.user)
        ).filter(StrategicPlan.id == plan_id).first()
    
    @staticmethod
    def get_strategic_plans(db: Session, owner_id: int, skip: int = 0, limit: int = 100) -> List[StrategicPlan]:
        """Obtener todos los planes estratégicos de un usuario con datos relacionados."""
        return db.query(StrategicPlan).options(
            selectinload(StrategicPlan.company_identity),
            selectinload(StrategicPlan.strategic_analysis),
            selectinload(StrategicPlan.analysis_tools),
            selectinload(StrategicPlan.strategies)
        ).filter(
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
        plan = PlanService.get_strategic_plan(db, plan_id)
        if not plan:
            return None

        # Verificar acceso (owner o colaborador aceptado)
        access = PlanService.check_plan_access(db, plan_id, owner_id)
        if not access:
            return None

        update_data = plan_data.dict(exclude_unset=True)
        with transaction(db):
            for field, value in update_data.items():
                setattr(plan, field, value)
        return plan
    
    @staticmethod
    def delete_strategic_plan(db: Session, plan_id: int, owner_id: int) -> bool:
        """Eliminar un plan estratégico."""
        plan = PlanService.get_strategic_plan(db, plan_id)
        if not plan or plan.owner_id != owner_id:
            return False

        with transaction(db):
            db.delete(plan)
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
        # Verificar acceso (owner o colaborador aceptado)
        access = PlanService.check_plan_access(db, plan_id, owner_id)
        if not access:
            return None

        plan = PlanService.get_strategic_plan(db, plan_id)
        if not plan:
            return None

        identity = db.query(CompanyIdentity).filter(
            CompanyIdentity.strategic_plan_id == plan_id
        ).first()

        with transaction(db):
            if identity:
                # Actualizar existente
                update_data = identity_data.dict(exclude_unset=True)
                
                for field, value in update_data.items():
                    if field in ['values', 'general_objectives'] and value is not None:
                        json_value = json.dumps(value)
                        
                        setattr(identity, field, json_value)
                    else:
                        setattr(identity, field, value)
            else:
                # Crear nuevo
                
                identity = CompanyIdentity(
                    strategic_plan_id=plan_id,
                    mission=identity_data.mission,
                    vision=identity_data.vision,
                    values=json.dumps(identity_data.values) if identity_data.values is not None else None,
                    general_objectives=json.dumps(identity_data.general_objectives) if identity_data.general_objectives is not None else None
                )
                
                db.add(identity)

        

        # Publish GraphQL subscription event via Redis
        try:
            import asyncio
            asyncio.create_task(publish_plan_update(PubSub(), str(plan_id), {
                "path": "company_identity",
                "value": {
                    "updated_at": identity.updated_at.isoformat() if identity.updated_at else None
                }
            }))
        except Exception:
            pass

        # Publish progress update (overall percentage)
        try:
            import asyncio
            progress = PlanService.calculate_plan_progress(db, plan_id)
            asyncio.create_task(publish_progress(PubSub(), str(plan_id), {
                "step": "overall",
                "completed": int(round(progress.get("progress_percentage", 0))),
                "total": 100,
            }))
        except Exception:
            pass

        return identity
    
    @staticmethod
    def get_company_identity(db: Session, plan_id: int) -> Optional[CompanyIdentity]:
        """Obtener identidad de la empresa."""
        plan = PlanService.get_strategic_plan(db, plan_id)
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
        # Verificar acceso (owner o colaborador aceptado)
        access = PlanService.check_plan_access(db, plan_id, owner_id)
        if not access:
            return None

        plan = PlanService.get_strategic_plan(db, plan_id)
        if not plan:
            return None
        
        analysis = db.query(StrategicAnalysis).filter(
            StrategicAnalysis.strategic_plan_id == plan_id
        ).first()
        
        with transaction(db):
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
                    internal_strengths=json.dumps(analysis_data.internal_strengths) if analysis_data.internal_strengths is not None else None,
                    internal_weaknesses=json.dumps(analysis_data.internal_weaknesses) if analysis_data.internal_weaknesses is not None else None,
                    external_opportunities=json.dumps(analysis_data.external_opportunities) if analysis_data.external_opportunities is not None else None,
                    external_threats=json.dumps(analysis_data.external_threats) if analysis_data.external_threats is not None else None,
                    swot_summary=analysis_data.swot_summary
                )
                db.add(analysis)

        # Publish GraphQL subscription event via Redis
        try:
            import asyncio
            asyncio.create_task(publish_plan_update(PubSub(), str(plan_id), {
                "path": "strategic_analysis",
                "value": {
                    "updated_at": analysis.updated_at.isoformat() if analysis.updated_at else None
                }
            }))
        except Exception:
            pass

        # Publish progress update (overall percentage)
        try:
            import asyncio
            progress = PlanService.calculate_plan_progress(db, plan_id)
            asyncio.create_task(publish_progress(PubSub(), str(plan_id), {
                "step": "overall",
                "completed": int(round(progress.get("progress_percentage", 0))),
                "total": 100,
            }))
        except Exception:
            pass

        return analysis
    
    @staticmethod
    def get_strategic_analysis(db: Session, plan_id: int) -> Optional[StrategicAnalysis]:
        """Obtener análisis estratégico."""
        plan = PlanService.get_strategic_plan(db, plan_id)
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
        # Verificar acceso (owner o colaborador aceptado)
        access = PlanService.check_plan_access(db, plan_id, owner_id)
        if not access:
            return None

        plan = PlanService.get_strategic_plan(db, plan_id)
        if not plan:
            return None
        
        tools = db.query(AnalysisTools).filter(
            AnalysisTools.strategic_plan_id == plan_id
        ).first()
        
        with transaction(db):
            if tools:
                # Actualizar existente
                update_data = tools_data.dict(exclude_unset=True)
                for field, value in update_data.items():
                    if field in ['value_chain_primary', 'value_chain_support', 'participation_matrix', 'bcg_matrix_data'] and value is not None:
                        setattr(tools, field, json.dumps(value))
                    else:
                        setattr(tools, field, value)
            else:
                # Crear nuevo
                tools = AnalysisTools(
                    strategic_plan_id=plan_id,
                    value_chain_primary=json.dumps(tools_data.value_chain_primary) if tools_data.value_chain_primary is not None else None,
                    value_chain_support=json.dumps(tools_data.value_chain_support) if tools_data.value_chain_support is not None else None,
                    participation_matrix=json.dumps(tools_data.participation_matrix) if tools_data.participation_matrix is not None else None,
                    porter_competitive_rivalry=tools_data.porter_competitive_rivalry,
                    porter_supplier_power=tools_data.porter_supplier_power,
                    porter_buyer_power=tools_data.porter_buyer_power,
                    porter_threat_substitutes=tools_data.porter_threat_substitutes,
                    porter_threat_new_entrants=tools_data.porter_threat_new_entrants,
                    pest_political=tools_data.pest_political,
                    pest_economic=tools_data.pest_economic,
                    pest_social=tools_data.pest_social,
                    pest_technological=tools_data.pest_technological,
                    bcg_matrix_data=json.dumps(tools_data.bcg_matrix_data) if tools_data.bcg_matrix_data is not None else None
                )
                db.add(tools)

        # Publish GraphQL subscription event via Redis
        try:
            import asyncio
            asyncio.create_task(publish_plan_update(PubSub(), str(plan_id), {
                "path": "analysis_tools",
                "value": {
                    "updated_at": tools.updated_at.isoformat() if tools.updated_at else None
                }
            }))
        except Exception:
            pass

        # Publish progress update (overall percentage)
        try:
            import asyncio
            progress = PlanService.calculate_plan_progress(db, plan_id)
            asyncio.create_task(publish_progress(PubSub(), str(plan_id), {
                "step": "overall",
                "completed": int(round(progress.get("progress_percentage", 0))),
                "total": 100,
            }))
        except Exception:
            pass

        return tools
    
    @staticmethod
    def get_analysis_tools(db: Session, plan_id: int) -> Optional[AnalysisTools]:
        """Obtener herramientas de análisis."""
        plan = PlanService.get_strategic_plan(db, plan_id)
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
        # Verificar acceso (owner o colaborador aceptado)
        access = PlanService.check_plan_access(db, plan_id, owner_id)
        if not access:
            return None

        plan = PlanService.get_strategic_plan(db, plan_id)
        if not plan:
            return None
        
        strategies = db.query(Strategies).filter(
            Strategies.strategic_plan_id == plan_id
        ).first()
        
        with transaction(db):
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
                    strategy_identification=json.dumps(strategies_data.strategy_identification) if strategies_data.strategy_identification is not None else None,
                    game_growth=json.dumps(strategies_data.game_growth) if strategies_data.game_growth is not None else None,
                    game_avoid=json.dumps(strategies_data.game_avoid) if strategies_data.game_avoid is not None else None,
                    game_merge=json.dumps(strategies_data.game_merge) if strategies_data.game_merge is not None else None,
                    game_exit=json.dumps(strategies_data.game_exit) if strategies_data.game_exit is not None else None,
                    priority_strategies=json.dumps(strategies_data.priority_strategies) if strategies_data.priority_strategies is not None else None,
                    implementation_timeline=json.dumps(strategies_data.implementation_timeline) if strategies_data.implementation_timeline is not None else None
                )
                db.add(strategies)

        # Publish GraphQL subscription event via Redis
        try:
            import asyncio
            asyncio.create_task(publish_plan_update(PubSub(), str(plan_id), {
                "path": "strategies",
                "value": {
                    "updated_at": strategies.updated_at.isoformat() if strategies.updated_at else None
                }
            }))
        except Exception:
            pass

        # Publish progress update (overall percentage)
        try:
            import asyncio
            progress = PlanService.calculate_plan_progress(db, plan_id)
            asyncio.create_task(publish_progress(PubSub(), str(plan_id), {
                "step": "overall",
                "completed": int(round(progress.get("progress_percentage", 0))),
                "total": 100,
            }))
        except Exception:
            pass

        return strategies
    
    @staticmethod
    def get_strategies(db: Session, plan_id: int) -> Optional[Strategies]:
        """Obtener estrategias."""
        plan = PlanService.get_strategic_plan(db, plan_id)
        if not plan:
            return None

        return db.query(Strategies).filter(
            Strategies.strategic_plan_id == plan_id
        ).first()
    
    # Resumen Ejecutivo
    @staticmethod
    def generate_executive_summary(db: Session, plan_id: int, owner_id: int):
        """Generar resumen ejecutivo completo del plan estratégico (owner o colaboradores aceptados)."""
        plan = PlanService.get_strategic_plan(db, plan_id)
        # Permitir a cualquier usuario con acceso al plan (owner o colaborador)
        if not plan:
            return None

        # Obtener todos los componentes
        identity = PlanService.get_company_identity(db, plan_id)
        analysis = PlanService.get_strategic_analysis(db, plan_id)
        tools = PlanService.get_analysis_tools(db, plan_id)
        strategies = PlanService.get_strategies(db, plan_id)

        # Función auxiliar para parsear JSON de forma segura
        def safe_json_parse(data):
            if not data:
                return []
            try:
                if isinstance(data, str):
                    return json.loads(data)
                return data
            except:
                return []

        # Estructurar el resumen ejecutivo completo
        created_at_val = getattr(plan, 'created_at', None)
        updated_at_val = getattr(plan, 'updated_at', None)

        summary = {
            "plan_info": {
                "title": plan.title,
                "description": plan.description,
                "created_at": created_at_val.isoformat() if created_at_val else None,
                "updated_at": updated_at_val.isoformat() if updated_at_val else None
            },
            "company_identity": {},
            "strategic_analysis": {},
            "analysis_tools": {},
            "strategies": {},
            "completion_status": {},
            "key_insights": [],
            "recommendations": []
        }

        # 1. IDENTIDAD EMPRESARIAL
        if identity:
            summary["company_identity"] = {
                "mission": identity.mission,
                "vision": identity.vision,
                "values": safe_json_parse(identity.values),
                "general_objectives": safe_json_parse(identity.general_objectives)
            }

            # Calcular completitud de identidad
            has_mission = identity.mission is not None and str(identity.mission).strip() != ""
            has_vision = identity.vision is not None and str(identity.vision).strip() != ""
            has_values = identity.values is not None and str(identity.values).strip() != ""
            identity_complete = has_mission and has_vision and has_values
            summary["completion_status"]["company_identity"] = {
                "completed": identity_complete,
                "percentage": 100 if identity_complete else (67 if (has_mission and has_vision) else (33 if has_mission or has_vision else 0))
            }

        # 2. ANÁLISIS ESTRATÉGICO
        if analysis:
            summary["strategic_analysis"] = {
                "internal_analysis": {
                    "strengths": safe_json_parse(analysis.internal_strengths),
                    "weaknesses": safe_json_parse(analysis.internal_weaknesses)
                },
                "external_analysis": {
                    "opportunities": safe_json_parse(analysis.external_opportunities),
                    "threats": safe_json_parse(analysis.external_threats)
                },
                "swot_summary": analysis.swot_summary
            }

            # Calcular completitud de análisis
            has_internal = bool(analysis.internal_strengths or analysis.internal_weaknesses)
            has_external = bool(analysis.external_opportunities or analysis.external_threats)
            analysis_complete = has_internal and has_external
            summary["completion_status"]["strategic_analysis"] = {
                "completed": analysis_complete,
                "percentage": 100 if analysis_complete else (50 if has_internal or has_external else 0)
            }

        # 3. HERRAMIENTAS DE ANÁLISIS
        if tools:
            summary["analysis_tools"] = {
                "value_chain": {
                    "primary_activities": safe_json_parse(tools.value_chain_primary),
                    "support_activities": safe_json_parse(tools.value_chain_support)
                },
                "participation_matrix": safe_json_parse(tools.participation_matrix),
                "porter_five_forces": {
                    "competitive_rivalry": tools.porter_competitive_rivalry,
                    "supplier_power": tools.porter_supplier_power,
                    "buyer_power": tools.porter_buyer_power,
                    "threat_substitutes": tools.porter_threat_substitutes,
                    "threat_new_entrants": tools.porter_threat_new_entrants
                },
                "pest_analysis": {
                    "political": tools.pest_political,
                    "economic": tools.pest_economic,
                    "social": tools.pest_social,
                    "technological": tools.pest_technological
                }
            }

            # Calcular completitud de herramientas
            has_value_chain = bool(tools.value_chain_primary or tools.value_chain_support)
            has_porter = bool(tools.porter_competitive_rivalry or tools.porter_supplier_power or
                            tools.porter_buyer_power or tools.porter_threat_substitutes or tools.porter_threat_new_entrants)
            has_pest = bool(tools.pest_political or tools.pest_economic or tools.pest_social or tools.pest_technological)
            tools_complete = has_value_chain and has_porter and has_pest
            summary["completion_status"]["analysis_tools"] = {
                "completed": tools_complete,
                "percentage": (100 if tools_complete else
                             75 if (has_value_chain and has_porter) or (has_value_chain and has_pest) or (has_porter and has_pest) else
                             50 if has_value_chain or has_porter or has_pest else 0)
            }

        # 4. ESTRATEGIAS
        if strategies:
            summary["strategies"] = {
                "strategy_identification": safe_json_parse(strategies.strategy_identification),
                "game_matrix": {
                    "growth_strategies": safe_json_parse(strategies.game_growth),
                    "avoid_strategies": safe_json_parse(strategies.game_avoid),
                    "merge_strategies": safe_json_parse(strategies.game_merge),
                    "exit_strategies": safe_json_parse(strategies.game_exit)
                },
                "priority_strategies": safe_json_parse(strategies.priority_strategies),
                "implementation_timeline": safe_json_parse(strategies.implementation_timeline)
            }

            # Calcular completitud de estrategias
            has_identification = bool(strategies.strategy_identification)
            has_game = bool(strategies.game_growth or strategies.game_avoid or strategies.game_merge or strategies.game_exit)
            has_priorities = bool(strategies.priority_strategies)
            strategies_complete = has_identification and has_game and has_priorities
            summary["completion_status"]["strategies"] = {
                "completed": strategies_complete,
                "percentage": (100 if strategies_complete else
                             67 if (has_identification and has_game) or (has_identification and has_priorities) or (has_game and has_priorities) else
                             33 if has_identification or has_game or has_priorities else 0)
            }

        # Calcular porcentaje total de completitud
        total_sections = 4
        completed_sections = sum(1 for status in summary["completion_status"].values() if status.get("completed", False))
        total_percentage = sum(status.get("percentage", 0) for status in summary["completion_status"].values()) / total_sections
        summary["completion_status"]["overall"] = {
            "completed_sections": completed_sections,
            "total_sections": total_sections,
            "percentage": round(total_percentage, 1)
        }

        # Generar insights y recomendaciones basados en los datos
        summary["key_insights"] = PlanService._generate_key_insights(summary)
        summary["recommendations"] = PlanService._generate_recommendations(summary)

        # Convertir a objeto Pydantic para validación
        try:
            from app.schemas.plan_schema import ExecutiveSummary
            return ExecutiveSummary(**summary)
        except Exception as e:
            import logging
            logging.error(f"Error creating ExecutiveSummary for plan {plan_id}: {str(e)}", exc_info=True)
            # Return a default summary to avoid 500
            from app.schemas.plan_schema import ExecutiveSummary, PlanInfo, CompanyIdentitySummary, StrategicAnalysisSummary, AnalysisToolsSummary, StrategiesSummary
            default_summary = ExecutiveSummary(
                plan_info=PlanInfo(
                    title=plan.title,
                    description=plan.description,
                    created_at=created_at_val.isoformat() if created_at_val else None,
                    updated_at=updated_at_val.isoformat() if updated_at_val else None
                ),
                company_identity=CompanyIdentitySummary(),
                strategic_analysis=StrategicAnalysisSummary(),
                analysis_tools=AnalysisToolsSummary(),
                strategies=StrategiesSummary(),
                completion_status={},
                key_insights=[],
                recommendations=[]
            )
            return default_summary

    @staticmethod
    def _generate_key_insights(summary: Dict[str, Any]) -> List[str]:
        """Generar insights clave basados en los datos del resumen."""
        insights = []

        # Insights de identidad empresarial
        identity = summary.get("company_identity", {})
        if identity.get("mission") and identity.get("vision"):
            insights.append("La empresa tiene una identidad clara con misión y visión bien definidas.")

        objectives = identity.get("general_objectives", [])
        if objectives:
            insights.append(f"Se han definido {len(objectives)} objetivos estratégicos generales con sus respectivos objetivos específicos.")

        # Insights de análisis estratégico
        analysis = summary.get("strategic_analysis", {})
        internal = analysis.get("internal_analysis", {})
        external = analysis.get("external_analysis", {})

        strengths = internal.get("strengths", [])
        weaknesses = internal.get("weaknesses", [])
        opportunities = external.get("opportunities", [])
        threats = external.get("threats", [])

        if strengths:
            insights.append(f"Se identificaron {len(strengths)} fortalezas internas que pueden ser aprovechadas.")
        if opportunities:
            insights.append(f"Se detectaron {len(opportunities)} oportunidades en el entorno externo.")
        if weaknesses:
            insights.append(f"Se identificaron {len(weaknesses)} áreas de mejora interna.")
        if threats:
            insights.append(f"Se reconocieron {len(threats)} amenazas en el entorno externo.")

        # Insights de herramientas de análisis
        tools = summary.get("analysis_tools", {})
        value_chain = tools.get("value_chain", {})
        porter = tools.get("porter_five_forces", {})
        pest = tools.get("pest_analysis", {})

        if value_chain.get("primary_activities") or value_chain.get("support_activities"):
            insights.append("Se ha realizado un análisis detallado de la cadena de valor de la empresa.")

        porter_complete = all(porter.get(field) for field in ["competitive_rivalry", "supplier_power", "buyer_power", "threat_substitutes", "threat_new_entrants"])
        if porter_complete:
            insights.append("Se completó el análisis de las 5 fuerzas de Porter para entender la competencia del sector.")

        pest_complete = all(pest.get(field) for field in ["political", "economic", "social", "technological"])
        if pest_complete:
            insights.append("Se realizó un análisis PEST completo del entorno macroeconómico.")

        # Insights de estrategias
        strategies = summary.get("strategies", {})
        game_matrix = strategies.get("game_matrix", {})

        if strategies.get("strategy_identification"):
            insights.append("Se han identificado las estrategias corporativas principales.")

        game_strategies = sum(len(game_matrix.get(key, [])) for key in ["growth_strategies", "avoid_strategies", "merge_strategies", "exit_strategies"])
        if game_strategies > 0:
            insights.append(f"Se definieron {game_strategies} estrategias específicas en la matriz GAME.")

        if strategies.get("priority_strategies"):
            insights.append("Se establecieron estrategias prioritarias con plan de implementación.")

        return insights

    @staticmethod
    def _generate_recommendations(summary: Dict[str, Any]) -> List[str]:
        """Generar recomendaciones basadas en los datos del resumen."""
        recommendations = []

        completion = summary.get("completion_status", {}).get("overall", {})
        completion_pct = completion.get("percentage", 0)

        if completion_pct < 30:
            recommendations.append("Completar al menos el 50% de las secciones del plan estratégico para obtener insights significativos.")
        elif completion_pct < 70:
            recommendations.append("Continuar completando las secciones restantes para tener un plan estratégico integral.")

        # Recomendaciones específicas por sección
        identity = summary.get("company_identity", {})
        if not identity.get("mission"):
            recommendations.append("Definir la misión empresarial para establecer el propósito fundamental de la organización.")
        if not identity.get("vision"):
            recommendations.append("Establecer una visión clara del futuro deseado para la empresa.")
        if not identity.get("general_objectives"):
            recommendations.append("Desarrollar objetivos estratégicos detallados con metas específicas y medibles.")

        # Recomendaciones de análisis estratégico
        analysis = summary.get("strategic_analysis", {})
        internal = analysis.get("internal_analysis", {})
        external = analysis.get("external_analysis", {})

        strengths = internal.get("strengths", [])
        opportunities = external.get("opportunities", [])
        weaknesses = internal.get("weaknesses", [])
        threats = external.get("threats", [])

        if strengths and opportunities:
            recommendations.append("Desarrollar estrategias que aprovechen las fortalezas identificadas para capitalizar las oportunidades del mercado.")
        if weaknesses and threats:
            recommendations.append("Implementar planes de contingencia para mitigar las debilidades ante las amenazas identificadas.")

        # Recomendaciones de herramientas
        tools = summary.get("analysis_tools", {})
        porter = tools.get("porter_five_forces", {})

        if not all(porter.get(field) for field in ["competitive_rivalry", "supplier_power", "buyer_power"]):
            recommendations.append("Completar el análisis de las fuerzas competitivas para entender mejor el posicionamiento en el mercado.")

        # Recomendaciones de estrategias
        strategies = summary.get("strategies", {})
        if not strategies.get("priority_strategies"):
            recommendations.append("Definir estrategias prioritarias con un cronograma de implementación realista.")

        # Recomendación general
        if completion_pct >= 80:
            recommendations.append("El plan estratégico está casi completo. Revisar y validar todas las secciones antes de la implementación.")

        return recommendations

    # Métodos para gestión de usuarios en planes
    @staticmethod
    def invite_user_to_plan(db: Session, plan_id: int, owner_id: int, invitee_email: str) -> Optional[PlanUser]:
        """Invitar a un usuario a un plan por email."""
        # Verificar que el owner tenga acceso al plan
        plan = PlanService.get_strategic_plan(db, plan_id)
        if not plan or plan.owner_id != owner_id:
            return None

        # Buscar usuario por email
        invitee = db.query(User).filter(User.email == invitee_email).first()
        if not invitee:
            return None  # Usuario no encontrado

        # Verificar que no esté ya invitado
        existing = db.query(PlanUser).filter(
            PlanUser.plan_id == plan_id,
            PlanUser.user_id == invitee.id
        ).first()
        if existing:
            return None  # Ya invitado

        # Verificar límite de usuarios (owner + 6 invitados)
        user_count = db.query(PlanUser).filter(PlanUser.plan_id == plan_id).count()
        if user_count >= 6:  # owner no cuenta en plan_users, pero limitamos a 6 invitados
            invited_count = db.query(PlanUser).filter(
                PlanUser.plan_id == plan_id,
                PlanUser.status.in_(['pending', 'accepted'])
            ).count()
            if invited_count >= 6:
                return None  # Límite alcanzado

        # Crear invitación y notificación en una transacción
        with transaction(db):
            plan_user = PlanUser(
                plan_id=plan_id,
                user_id=invitee.id,
                role='member',
                status='pending'
            )
            db.add(plan_user)
            db.flush()  # Para obtener el ID

            # Crear notificación
            notification = Notification(
                user_id=invitee.id,
                type='plan_invitation',
                message=f'Has sido invitado al plan estratégico "{plan.title}"',
                related_plan_id=plan_id,
                invitation_id=plan_user.id
            )
            db.add(notification)

        # Publish GraphQL invitation notification via Redis
        try:
            import asyncio
            asyncio.create_task(publish_invitation(PubSub(), str(invitee.id), {
                "type": "plan_invitation",
                "message": f'Has sido invitado al plan estratégico "{plan.title}"',
                "planId": str(plan_id),
                "fromUserId": str(owner_id),
                "invitationId": str(plan_user.id),
            }))
        except Exception:
            pass

        return plan_user

    @staticmethod
    def respond_to_invitation(db: Session, invitation_id: int, user_id: int, accept: bool) -> bool:
        """Aceptar o rechazar una invitación."""
        plan_user = db.query(PlanUser).filter(
            PlanUser.id == invitation_id,
            PlanUser.user_id == user_id,
            PlanUser.status == 'pending'
        ).first()

        if not plan_user:
            return False

        with transaction(db):
            plan_user.status = 'accepted' if accept else 'rejected'

            # Marcar notificación como leída
            notification = db.query(Notification).filter(
                Notification.user_id == user_id,
                Notification.related_plan_id == plan_user.plan_id,
                Notification.type == 'plan_invitation'
            ).first()
            if notification:
                notification.status = 'read'

        return True

    @staticmethod
    def get_plan_users(db: Session, plan_id: int, owner_id: int) -> List[PlanUser]:
        """Obtener usuarios asociados a un plan (solo owner)."""
        plan = PlanService.get_strategic_plan(db, plan_id)
        if not plan:
            return []

        return db.query(PlanUser).filter(PlanUser.plan_id == plan_id).all()

    @staticmethod
    def remove_user_from_plan(db: Session, plan_id: int, owner_id: int, user_id: int) -> bool:
        """Remover usuario de un plan (solo owner)."""
        plan = PlanService.get_strategic_plan(db, plan_id)
        if not plan:
            return False

        plan_user = db.query(PlanUser).filter(
            PlanUser.plan_id == plan_id,
            PlanUser.user_id == user_id
        ).first()

        if not plan_user:
            return False

        with transaction(db):
            db.delete(plan_user)
        return True

    @staticmethod
    def update_plan_user_role(db: Session, plan_id: int, owner_id: int, user_id: int, role: str) -> bool:
        """Actualizar el rol/permisos de un usuario en el plan (solo owner)."""
        plan = PlanService.get_strategic_plan(db, plan_id)
        if not plan or plan.owner_id != owner_id:
            return False

        plan_user = db.query(PlanUser).filter(
            PlanUser.plan_id == plan_id,
            PlanUser.user_id == user_id
        ).first()

        if not plan_user:
            return False

        # No permitir modificar el owner
        if plan_user.role == 'owner':
            return False

        with transaction(db):
            plan_user.role = role
        return True

    @staticmethod
    def get_user_notifications(db: Session, user_id: int) -> List[Notification]:
        """Obtener notificaciones de un usuario."""
        return db.query(Notification).filter(Notification.user_id == user_id).order_by(Notification.created_at.desc()).all()

    @staticmethod
    def mark_notification_read(db: Session, notification_id: int, user_id: int) -> bool:
        """Marcar notificación como leída."""
        notification = db.query(Notification).filter(
            Notification.id == notification_id,
            Notification.user_id == user_id
        ).first()

        if not notification:
            return False

        with transaction(db):
            notification.status = 'read'
        return True

    @staticmethod
    def get_owned_plans(db: Session, user_id: int) -> List[StrategicPlan]:
        """Obtener planes propios del usuario."""
        plans = db.query(StrategicPlan).filter(StrategicPlan.owner_id == user_id).all()
        # Agregar progreso a cada plan
        for plan in plans:
            progress = PlanService.calculate_plan_progress(db, plan.id)
            plan.progress_percentage = progress["progress_percentage"]
            plan.status = progress["status"]
        return plans

    @staticmethod
    def get_shared_plans(db: Session, user_id: int) -> List[StrategicPlan]:
        """Obtener planes compartidos con el usuario."""
        plans = db.query(StrategicPlan).join(PlanUser).filter(
            PlanUser.user_id == user_id,
            PlanUser.status == 'accepted'
        ).all()
        # Agregar progreso a cada plan
        for plan in plans:
            progress = PlanService.calculate_plan_progress(db, plan.id)
            plan.progress_percentage = progress["progress_percentage"]
            plan.status = "Shared"  # Los planes compartidos siempre tienen status "Shared"
        return plans

    @staticmethod
    def calculate_plan_progress(db: Session, plan_id: int) -> Dict[str, Any]:
        """Calcular el progreso de un plan estratégico."""
        # Obtener todos los componentes
        identity = PlanService.get_company_identity(db, plan_id)
        analysis = PlanService.get_strategic_analysis(db, plan_id)
        tools = PlanService.get_analysis_tools(db, plan_id)
        strategies = PlanService.get_strategies(db, plan_id)

        # Función auxiliar para parsear JSON de forma segura
        def safe_json_parse(data):
            if not data:
                return []
            try:
                if isinstance(data, str):
                    return json.loads(data)
                return data
            except:
                return []

        # Calcular completitud por sección
        sections = {
            "company_identity": 0.0,
            "strategic_analysis": 0.0,
            "analysis_tools": 0.0,
            "strategies": 0.0
        }

        # 1. IDENTIDAD EMPRESARIAL
        if identity:
            has_mission = identity.mission is not None and str(identity.mission).strip() != ""
            has_vision = identity.vision is not None and str(identity.vision).strip() != ""
            has_values = identity.values is not None and str(identity.values).strip() != ""
            identity_complete = has_mission and has_vision and has_values
            sections["company_identity"] = 100 if identity_complete else (67 if (has_mission and has_vision) else (33 if has_mission or has_vision else 0))

        # 2. ANÁLISIS ESTRATÉGICO
        if analysis:
            has_internal = bool(analysis.internal_strengths or analysis.internal_weaknesses)
            has_external = bool(analysis.external_opportunities or analysis.external_threats)
            analysis_complete = has_internal and has_external
            sections["strategic_analysis"] = 100 if analysis_complete else (50 if has_internal or has_external else 0)

        # 3. HERRAMIENTAS DE ANÁLISIS
        if tools:
            has_value_chain = bool(tools.value_chain_primary or tools.value_chain_support)
            has_porter = bool(tools.porter_competitive_rivalry or tools.porter_supplier_power or
                            tools.porter_buyer_power or tools.porter_threat_substitutes or tools.porter_threat_new_entrants)
            has_pest = bool(tools.pest_political or tools.pest_economic or tools.pest_social or tools.pest_technological)
            tools_complete = has_value_chain and has_porter and has_pest
            sections["analysis_tools"] = (100 if tools_complete else
                                        75 if (has_value_chain and has_porter) or (has_value_chain and has_pest) or (has_porter and has_pest) else
                                        50 if has_value_chain or has_porter or has_pest else 0)

        # 4. ESTRATEGIAS
        if strategies:
            has_identification = bool(strategies.strategy_identification)
            has_game = bool(strategies.game_growth or strategies.game_avoid or strategies.game_merge or strategies.game_exit)
            has_priorities = bool(strategies.priority_strategies)
            strategies_complete = has_identification and has_game and has_priorities
            sections["strategies"] = (100 if strategies_complete else
                                    67 if (has_identification and has_game) or (has_identification and has_priorities) or (has_game and has_priorities) else
                                    33 if has_identification or has_game or has_priorities else 0)

        # Calcular porcentaje total
        total_percentage = sum(sections.values()) / len(sections)

        # Determinar estado
        if total_percentage >= 100:
            status = "Completed"
        elif total_percentage > 0:
            status = "In development"
        else:
            status = "In development"

        return {
            "progress_percentage": round(total_percentage, 1),
            "status": status,
            "sections": sections
        }

    @staticmethod
    def check_plan_access(db: Session, plan_id: int, user_id: int, require_owner: bool = False) -> Optional[PlanUser]:
        """Verificar acceso de usuario a un plan."""
        plan_user = db.query(PlanUser).filter(
            PlanUser.plan_id == plan_id,
            PlanUser.user_id == user_id,
            PlanUser.status == 'accepted'
        ).first()

        if not plan_user and not require_owner:
            # Verificar si es owner
            plan = db.query(StrategicPlan).filter(
                StrategicPlan.id == plan_id,
                StrategicPlan.owner_id == user_id
            ).first()
            if plan:
                # Crear un PlanUser virtual para owner
                return PlanUser(plan_id=plan_id, user_id=user_id, role='owner', status='accepted')

        if require_owner and (not plan_user or plan_user.role != 'owner'):
            return None

        return plan_user
