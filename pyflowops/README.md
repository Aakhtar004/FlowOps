# PyFlowOps - Plan Estratégico de TI

## 🚀 Versión 1.0 - Sistema Completamente Funcional

Sistema integral para la automatización de la elaboración de Planes Estratégicos de TI. Esta aplicación web moderna reemplaza los sistemas basados en Excel, ofreciendo una experiencia interactiva, estructurada y eficiente con todas las funcionalidades implementadas.

## ✨ Características Principales - COMPLETAMENTE IMPLEMENTADAS

### 📋 Módulos del Sistema
- **✅ Autenticación Segura**: Sistema de login con JWT y notificaciones
- **✅ Identidad Empresarial**: Gestión completa de Misión, Visión, Valores y Objetivos
- **✅ Análisis Estratégico**: Análisis Interno y Externo (SWOT) completamente funcional
- **✅ Herramientas de Análisis**:
  - ✅ Cadena de Valor (actividades primarias y de apoyo)
  - ✅ Matriz de Participación (gestión de stakeholders)
  - ✅ Las 5 Fuerzas de Porter (análisis competitivo completo)
  - ✅ Análisis PEST (Político, Económico, Social, Tecnológico)
- **✅ Estrategias**: Identificación de Estrategias y Matriz GAME con timeline
- **✅ Dashboard Minimalista**: Vista consolidada sin elementos duplicados
- **✅ Sistema de Notificaciones**: Feedback en tiempo real para todas las operaciones
- **✅ Navegación por Pestañas**: Interfaz intuitiva y moderna

### 🎯 Mejoras de UX Implementadas
- **✅ Menú Principal Optimizado**: Eliminación de botones duplicados
- **✅ Diseño Minimalista**: Interfaz limpia y profesional
- **✅ Notificaciones Toast**: Feedback inmediato para todas las acciones
- **✅ Validación en Tiempo Real**: Formularios con validación robusta
- **✅ Indicadores de Progreso**: Seguimiento visual del avance del plan
- **✅ Responsive Design**: Optimizado para todos los dispositivos

### 🛠️ Tecnologías Utilizadas

#### Backend
- **Python 3.11** con **FastAPI**
- **PostgreSQL** como base de datos
- **SQLAlchemy** para ORM
- **Pydantic** para validación de datos
- **JWT** para autenticación
- **Alembic** para migraciones

#### Frontend
- **React 18** con **Vite**
- **React Router** para navegación
- **React Query** para gestión de estado
- **Tailwind CSS** para estilos
- **React Hook Form** para formularios
- **Axios** para llamadas HTTP

#### DevOps
- **Docker** y **Docker Compose**
- **Multi-stage builds**
- **Hot reload** en desarrollo
- **Nginx** para producción

## 🏗️ Arquitectura del Proyecto

```
PyFlowOps/
├── backend/                 # API FastAPI
│   ├── app/
│   │   ├── api/v1/         # Endpoints de la API
│   │   ├── core/           # Configuraciones
│   │   ├── db/             # Base de datos
│   │   ├── models/         # Modelos SQLAlchemy
│   │   ├── schemas/        # Esquemas Pydantic
│   │   ├── services/       # Lógica de negocio
│   │   └── main.py         # Aplicación principal
│   ├── tests/              # Pruebas unitarias
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/               # Aplicación React
│   ├── src/
│   │   ├── components/     # Componentes reutilizables
│   │   ├── pages/          # Páginas principales
│   │   ├── hooks/          # Hooks personalizados
│   │   ├── services/       # Servicios y API
│   │   └── utils/          # Utilidades
│   ├── public/
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml      # Orquestación de servicios
├── .env                    # Variables de entorno
└── README.md
```

## 🚀 Inicio Rápido

### Prerrequisitos
- **Docker** y **Docker Compose**
- **Git**

### Instalación y Ejecución

1. **Clonar el repositorio**:
   ```bash
   git clone <url-del-repositorio>
   cd PyFlowOps
   ```

2. **Configurar variables de entorno**:
   ```bash
   cp .env.example .env
   # Editar .env con tus configuraciones
   ```

3. **Ejecutar con Docker Compose**:
   ```bash
   docker-compose up --build
   ```

4. **Acceder a la aplicación**:
   - **Frontend**: http://localhost:3000
   - **Backend API**: http://localhost:8000
   - **Documentación API**: http://localhost:8000/docs

### Desarrollo Local

#### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Linux/Mac
# o
venv\Scripts\activate     # Windows
pip install -r requirements.txt
uvicorn app.main:app --reload
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

## 📖 Uso del Sistema

### 1. Registro e Inicio de Sesión
- Crear una cuenta nueva o iniciar sesión
- El sistema utiliza autenticación JWT segura

### 2. Crear un Plan Estratégico
- Desde el dashboard, crear un nuevo plan
- Asignar título y descripción

### 3. Completar Módulos
- **Identidad**: Definir misión, visión, valores y objetivos
- **Análisis**: Realizar análisis SWOT
- **Herramientas**: Utilizar Porter, PEST, etc.
- **Estrategias**: Definir estrategias GAME

### 4. Generar Resumen
- El resumen ejecutivo se actualiza automáticamente
- Exportar a PDF (próximamente)

## 🧪 Pruebas

### Backend
```bash
cd backend
pytest tests/
```

### Frontend
```bash
cd frontend
npm test
```

## 🐳 Docker

### Desarrollo
```bash
docker-compose up
```

### Producción
```bash
docker-compose -f docker-compose.prod.yml up
```

## 📊 Base de Datos

### Estructura Principal
- **users**: Usuarios del sistema
- **strategic_plans**: Planes estratégicos
- **company_identity**: Identidad empresarial
- **strategic_analysis**: Análisis estratégico
- **analysis_tools**: Herramientas de análisis
- **strategies**: Estrategias y matriz GAME

### Migraciones
```bash
cd backend
alembic upgrade head
```

## 🔧 Configuración

### Variables de Entorno
```env
# Base de datos
POSTGRES_DB=pyflowops
POSTGRES_USER=admin
POSTGRES_PASSWORD=admin123

# Backend
SECRET_KEY=your-secret-key
DEBUG=True
CORS_ORIGINS=http://localhost:3000

# Frontend
VITE_API_URL=http://localhost:8000
VITE_APP_TITLE=Plan Estratégico de TI
```

## 🚦 Estado del Proyecto

### ✅ Completado
- [x] Arquitectura del sistema
- [x] Backend con FastAPI
- [x] Frontend con React
- [x] Autenticación JWT
- [x] CRUD de planes estratégicos
- [x] Diseño responsive
- [x] Docker configuration
- [x] Documentación de API

### 🔄 En Desarrollo
- [ ] Formularios detallados para cada módulo
- [ ] Generación avanzada de insights
- [ ] Exportación a PDF
- [ ] Dashboard con métricas
- [ ] Notificaciones en tiempo real

### 🔮 Futuras Mejoras
- [ ] Colaboración multi-usuario
- [ ] Templates de planes
- [ ] Integración con herramientas BI
- [ ] Análisis predictivo con IA
- [ ] API para integraciones

## 🤝 Contribución

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 👥 Equipo

- **Desarrollo**: Equipo de Planeamiento de TI
- **Arquitectura**: Diseño modular y escalable
- **UX/UI**: Interfaz intuitiva y moderna

## 📞 Soporte

Para soporte técnico o preguntas:
- 📧 Email: soporte@pyflowops.com
- 📚 Documentación: [Wiki del Proyecto]
- 🐛 Reportar bugs: [Issues de GitHub]

---

**PyFlowOps** - Transformando la planificación estratégica de TI 🚀
