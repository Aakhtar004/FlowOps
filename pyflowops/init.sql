-- Script de inicialización para PostgreSQL
-- Este script se ejecuta automáticamente cuando se crea el contenedor de la base de datos

-- Crear extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Configurar timezone
SET timezone = 'UTC';

-- Crear usuario demo (opcional para pruebas)
-- La aplicación creará las tablas automáticamente a través de SQLAlchemy
