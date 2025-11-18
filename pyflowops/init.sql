-- Script de inicialización para PostgreSQL
-- Se ejecuta automáticamente al crear el contenedor (si el volumen está vacío)

-- Extensiones necesarias (cuando se requieran)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Configuración
SET timezone = 'UTC';

-- Tablas
CREATE TABLE IF NOT EXISTS users (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  hashed_password VARCHAR(128) NOT NULL,
  full_name VARCHAR(100),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  is_superuser BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS strategic_plans (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  owner_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company_name VARCHAR(200),
  company_logo_url VARCHAR(500),
  promoters TEXT,
  strategic_units TEXT,
  conclusions TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS company_identity (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  strategic_plan_id INTEGER NOT NULL REFERENCES strategic_plans(id) ON DELETE CASCADE,
  mission TEXT,
  vision TEXT,
  values TEXT,
  general_objectives TEXT,
  strategic_mission TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS strategic_analysis (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  strategic_plan_id INTEGER NOT NULL REFERENCES strategic_plans(id) ON DELETE CASCADE,
  internal_strengths TEXT,
  internal_weaknesses TEXT,
  external_opportunities TEXT,
  external_threats TEXT,
  swot_summary TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS analysis_tools (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  strategic_plan_id INTEGER NOT NULL REFERENCES strategic_plans(id) ON DELETE CASCADE,
  value_chain_primary TEXT,
  value_chain_support TEXT,
  participation_matrix TEXT,
  porter_competitive_rivalry TEXT,
  porter_supplier_power TEXT,
  porter_buyer_power TEXT,
  porter_threat_substitutes TEXT,
  porter_threat_new_entrants TEXT,
  pest_political TEXT,
  pest_economic TEXT,
  pest_social TEXT,
  pest_technological TEXT,
  bcg_matrix_data TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS strategies (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  strategic_plan_id INTEGER NOT NULL REFERENCES strategic_plans(id) ON DELETE CASCADE,
  strategy_identification TEXT,
  game_growth TEXT,
  game_avoid TEXT,
  game_merge TEXT,
  game_exit TEXT,
  priority_strategies TEXT,
  implementation_timeline TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS pest_analysis (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  strategic_plan_id INTEGER NOT NULL REFERENCES strategic_plans(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS pest_response (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  pest_analysis_id INTEGER NOT NULL REFERENCES pest_analysis(id) ON DELETE CASCADE,
  question_number INTEGER NOT NULL,
  category VARCHAR(50) NOT NULL,
  response_value INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS opportunities (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  pest_analysis_id INTEGER NOT NULL REFERENCES pest_analysis(id) ON DELETE CASCADE,
  opportunity_text TEXT NOT NULL,
  order_position INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS threats (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  pest_analysis_id INTEGER NOT NULL REFERENCES pest_analysis(id) ON DELETE CASCADE,
  threat_text TEXT NOT NULL,
  order_position INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS plan_users (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  plan_id INTEGER NOT NULL REFERENCES strategic_plans(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ,
  CONSTRAINT unique_plan_user UNIQUE (plan_id, user_id)
);

CREATE TABLE IF NOT EXISTS notifications (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  message TEXT NOT NULL,
  related_plan_id INTEGER REFERENCES strategic_plans(id) ON DELETE SET NULL,
  invitation_id INTEGER REFERENCES plan_users(id) ON DELETE SET NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'unread',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

-- Índices (opcionales si ya existen por UNIQUE o PK)
CREATE INDEX IF NOT EXISTS idx_plan_users_plan_id ON plan_users (plan_id);
CREATE INDEX IF NOT EXISTS idx_plan_users_user_id ON plan_users (user_id);
CREATE INDEX IF NOT EXISTS idx_pest_analysis_plan_id ON pest_analysis (strategic_plan_id);
CREATE INDEX IF NOT EXISTS idx_pest_response_analysis_id ON pest_response (pest_analysis_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_analysis_id ON opportunities (pest_analysis_id);
CREATE INDEX IF NOT EXISTS idx_threats_analysis_id ON threats (pest_analysis_id);

-- Notas:
-- - El backend también ejecuta create_tables() y run_migrations() en el arranque.
-- - Al usar IF NOT EXISTS, evitamos conflictos si las tablas ya existen.
-- - Para bases ya inicializadas, puedes reejecutar este script desde el contenedor.
