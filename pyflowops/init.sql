-- Script de inicialización para PostgreSQL
-- Este script se ejecuta automáticamente cuando se crea el contenedor de la base de datos

-- Crear extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Configurar timezone
SET timezone = 'UTC';

-- Crear usuario demo (opcional para pruebas)
-- La aplicación creará las tablas automáticamente a través de SQLAlchemy

-- Agregar nuevas columnas para objetivos estratégicos detallados
ALTER TABLE company_identity ADD COLUMN IF NOT EXISTS strategic_mission TEXT;
ALTER TABLE company_identity ADD COLUMN IF NOT EXISTS general_objectives TEXT;

-- Quitar columnas obsoletas
ALTER TABLE company_identity DROP COLUMN IF EXISTS objectives;
ALTER TABLE company_identity DROP COLUMN IF EXISTS strategic_mission;
