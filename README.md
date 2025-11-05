# FlowOps 🚀

FlowOps es una aplicación web integral diseñada para agilizar la creación de Planes Estratégicos de TI. Reemplaza los engorrosos sistemas basados en Excel con una plataforma interactiva, estructurada y eficiente, guiando a los usuarios en cada paso del proceso de planificación estratégica.

La aplicación proporciona un entorno seguro e intuitivo para definir la identidad de una empresa, realizar análisis estratégicos profundos y formular estrategias accionables. Con retroalimentación en tiempo real y un panel de control minimalista, FlowOps asegura una experiencia de usuario fluida y productiva.

## ✨ Características Clave

- **Autenticación Segura**: Sistema de inicio de sesión basado en JWT con notificaciones.
- **Gestión de Identidad Empresarial**: Define y gestiona Misión, Visión, Valores y Objetivos.
- **Análisis Estratégico Integral**: Realiza análisis internos y externos utilizando herramientas como FODA.
- **Herramientas de Análisis Avanzadas**:
  - Análisis de la Cadena de Valor (actividades primarias y de apoyo)
  - Matriz de Stakeholders
  - Las Cinco Fuerzas de Porter
  - Análisis PEST (Político, Económico, Social, Tecnológico)
- **Formulación de Estrategias**: Identifica y gestiona estrategias usando la Matriz GAME con una línea de tiempo.
- **Panel de Control Intuitivo**: Una vista consolidada y minimalista de tu plan estratégico.
- **Notificaciones en Tiempo Real**: Retroalimentación instantánea en todas las operaciones.

## 🛠️ Stack Tecnológico

### Backend
![Python](https://img.shields.io/badge/Python-3.11-blue?logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.104-green?logo=fastapi&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue?logo=postgresql&logoColor=white)
![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-2.0-red?logo=sqlalchemy&logoColor=white)

### Frontend
![React](https://img.shields.io/badge/React-18-blue?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5.0-purple?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.3-blue?logo=tailwind-css&logoColor=white)
![React Query](https://img.shields.io/badge/React_Query-3.39-orange?logo=react-query&logoColor=white)

### DevOps
![Docker](https://img.shields.io/badge/Docker-blue?logo=docker&logoColor=white)

## 🚀 Cómo Empezar

### Prerrequisitos
- **Docker** y **Docker Compose**
- **Git**

### Instalación y Ejecución

1. **Clona el repositorio**:
   ```bash
   git clone <url-del-repositorio>
   cd FlowOps
   ```

2. **Configura las variables de entorno**:
   ```bash
   cd pyflowops
   cp .env.example .env
   # Edita el archivo .env con tu configuración personalizada
   ```

3. **Inicia la aplicación con Docker Compose**:
   ```bash
   docker-compose up --build
   ```

4. **Accede a la aplicación**:
   - **Frontend**: `http://localhost:3000`
   - **API del Backend**: `http://localhost:8000`
   - **Documentación de la API**: `http://localhost:8000/docs`

## 🤝 Contribución

¡Las contribuciones son bienvenidas! Si tienes ideas para mejoras o nuevas características, no dudes en abrir un issue o enviar un pull request.

## 📄 Licencia

Este proyecto está licenciado bajo la Licencia MIT. Consulta el archivo [LICENSE](LICENSE) para más detalles.
