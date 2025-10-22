"""
Script de migraciones de base de datos.
Se ejecuta automáticamente en el startup de la aplicación.
"""
from sqlalchemy import text
from sqlalchemy.orm import Session
import structlog

logger = structlog.get_logger()


def run_migrations(db: Session):
    """
    Ejecutar todas las migraciones pendientes.
    Añadir nuevas migraciones al final de esta función.
    """
    try:
        # Migración 1: Agregar columna bcg_matrix_data a analysis_tools
        _add_bcg_matrix_data_column(db)
        
        # Migración 2: Agregar campos de información de empresa a strategic_plans
        _add_company_info_fields(db)
        
        logger.info("All migrations completed successfully")
    except Exception as e:
        logger.error(f"Error running migrations: {str(e)}", exc_info=True)
        raise


def _add_bcg_matrix_data_column(db: Session):
    """
    Migración: Agregar columna bcg_matrix_data a la tabla analysis_tools.
    Esta columna almacena los datos de la Matriz BCG en formato JSON.
    """
    try:
        # Verificar si la columna ya existe
        check_query = text("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='analysis_tools' 
            AND column_name='bcg_matrix_data'
        """)
        result = db.execute(check_query).fetchone()
        
        if result is None:
            # La columna no existe, agregarla
            alter_query = text("""
                ALTER TABLE analysis_tools 
                ADD COLUMN bcg_matrix_data TEXT
            """)
            db.execute(alter_query)
            db.commit()
            logger.info("Migration: Added bcg_matrix_data column to analysis_tools table")
        else:
            logger.info("Migration: bcg_matrix_data column already exists, skipping")
            
    except Exception as e:
        db.rollback()
        logger.error(f"Error in _add_bcg_matrix_data_column migration: {str(e)}", exc_info=True)
        # No lanzar excepción para que la app pueda iniciar
        # raise


def _add_company_info_fields(db: Session):
    """
    Migración: Agregar campos de información de empresa a la tabla strategic_plans.
    Campos: company_name, company_logo_url, promoters, strategic_units, conclusions
    """
    try:
        # Lista de columnas a agregar
        columns_to_add = [
            ('company_name', 'VARCHAR(200)'),
            ('company_logo_url', 'VARCHAR(500)'),
            ('promoters', 'TEXT'),
            ('strategic_units', 'TEXT'),
            ('conclusions', 'TEXT')
        ]
        
        for column_name, column_type in columns_to_add:
            # Verificar si la columna ya existe
            check_query = text(f"""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name='strategic_plans' 
                AND column_name='{column_name}'
            """)
            result = db.execute(check_query).fetchone()
            
            if result is None:
                # La columna no existe, agregarla
                alter_query = text(f"""
                    ALTER TABLE strategic_plans 
                    ADD COLUMN {column_name} {column_type}
                """)
                db.execute(alter_query)
                logger.info(f"Migration: Added {column_name} column to strategic_plans table")
            else:
                logger.info(f"Migration: {column_name} column already exists, skipping")
        
        db.commit()
            
    except Exception as e:
        db.rollback()
        logger.error(f"Error in _add_company_info_fields migration: {str(e)}", exc_info=True)
        # No lanzar excepción para que la app pueda iniciar
        # raise

