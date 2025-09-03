-- Crea BD y tabla de usuarios (charset moderno)
CREATE DATABASE IF NOT EXISTS app_auth
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE FlowOps;

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS usuarios (
  id_usuario              INT AUTO_INCREMENT PRIMARY KEY,
  nombre                  VARCHAR(100)      NOT NULL,
  apellido                VARCHAR(100)      NOT NULL,
  email                   VARCHAR(100)      NOT NULL UNIQUE,
  -- Guardamos *hash* de contraseña (seguridad) en vez de texto plano
  contrasena_hash         VARBINARY(255)    NOT NULL,
  sexo                    VARCHAR(10)       NULL,
  pais                    VARCHAR(100)      NULL,
  -- El usuario elige una pregunta predefinida; guardamos la opción (texto o clave)
  pregunta_seguridad      VARCHAR(150)      NOT NULL,
  -- Igual que la contraseña: guardar hash de la respuesta
  respuesta_seguridad_hash VARBINARY(255)   NOT NULL,
  fecha_creacion          DATETIME          NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Índice auxiliar para búsquedas por email
CREATE INDEX idx_usuarios_email ON usuarios (email);