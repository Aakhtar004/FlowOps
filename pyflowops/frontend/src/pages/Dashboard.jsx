import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Plus, FileText, Calendar, Eye, Edit, Trash2, Search, Target, CheckCircle, Clock, Users } from 'lucide-react'
import { useOwnedPlans, useSharedPlans } from '../hooks/useApi'
import { useToast } from '../components/ui/Toast'
import LoadingSpinner from '../components/common/LoadingSpinner'
import CreatePlanModal from '../components/forms/CreatePlanModal'
import { useQueryClient } from 'react-query'

const ProgressBar = ({ progress, className = "" }) => {
  const getProgressColor = (percentage) => {
    if (percentage >= 80) return 'bg-green-500'
    if (percentage >= 50) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  return (
    <div className={`w-full bg-gray-200 rounded-full h-2 ${className}`}>
      <div
        className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(progress)}`}
        style={{ width: `${Math.min(progress, 100)}%` }}
      ></div>
    </div>
  )
}

const StatusBadge = ({ status }) => {
  const getStatusConfig = (status) => {
    switch (status) {
      case 'Completed':
        return { color: 'bg-green-100 text-green-800', icon: CheckCircle, text: 'Completado' }
      case 'Shared':
        return { color: 'bg-blue-100 text-blue-800', icon: Users, text: 'Compartido' }
      case 'In development':
      default:
        return { color: 'bg-yellow-100 text-yellow-800', icon: Clock, text: 'En desarrollo' }
    }
  }

  const config = getStatusConfig(status)
  const Icon = config.icon

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
      <Icon className="h-3 w-3 mr-1" />
      {config.text}
    </span>
  )
}

const Dashboard = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const { plans: ownedPlans, isLoading: isOwnedLoading, error: ownedError, deletePlan, isDeleting } = useOwnedPlans()
  const { plans: sharedPlans, isLoading: isSharedLoading, error: sharedError } = useSharedPlans()
  const { success, error } = useToast()
  const queryClient = useQueryClient()

  // Actualizar planes cada 30 segundos para reflejar cambios de progreso
  useEffect(() => {
    const interval = setInterval(() => {
      queryClient.invalidateQueries('ownedPlans')
      queryClient.invalidateQueries('sharedPlans')
    }, 30000) // 30 segundos

    return () => clearInterval(interval)
  }, [queryClient])

  const isLoading = isOwnedLoading || isSharedLoading
  const allPlans = [...(ownedPlans || []), ...(sharedPlans || [])]

  // Filtrar planes según término de búsqueda
  const filteredPlans = allPlans.filter(plan =>
    plan.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (plan.description && plan.description.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const handleDeletePlan = async (planId) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este plan? Esta acción no se puede deshacer.')) {
      try {
        await deletePlan(planId)
        success('Plan eliminado correctamente.')
      } catch (err) {
        error('Error al eliminar el plan. Inténtalo de nuevo.')
      }
    }
  }

  const handlePlanCreated = () => {
    setIsCreateModalOpen(false)
    success('¡Plan estratégico creado exitosamente! Ya puedes empezar a editarlo.')
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <LoadingSpinner size="large" text="Cargando planes estratégicos..." />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mis Planes Estratégicos</h1>
            <p className="mt-2 text-gray-600">
              Gestiona y desarrolla tus planes estratégicos de TI
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="btn-primary"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Plan
            </button>
          </div>
        </div>

        {/* Búsqueda */}
        <div className="mt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar planes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10 w-full sm:w-96"
            />
          </div>
        </div>
      </div>

      {/* Lista de planes */}
      {filteredPlans.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            {allPlans.length === 0 ? 'No hay planes estratégicos' : 'No se encontraron planes'}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {allPlans.length === 0
              ? 'Comienza creando tu primer plan estratégico.'
              : 'Intenta con otros términos de búsqueda.'
            }
          </p>
          {allPlans.length === 0 && (
            <div className="mt-6">
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="btn-primary"
              >
                <Plus className="h-4 w-4 mr-2" />
                Crear mi primer plan
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-8">
          {/* Planes propios */}
          {(ownedPlans || []).length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Mis Planes</h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {(ownedPlans || []).filter(plan =>
                  plan.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  (plan.description && plan.description.toLowerCase().includes(searchTerm.toLowerCase()))
                ).map((plan) => (
                  <div key={plan.id} className="card hover:shadow-md transition-shadow">
                    <div className="card-header">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 truncate">
                            {plan.title}
                          </h3>
                          {plan.description && (
                            <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                              {plan.description}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center space-x-1 ml-4">
                          <StatusBadge status={plan.status || 'In development'} />
                        </div>
                      </div>
                    </div>

                    <div className="card-content">
                      <div className="flex items-center text-sm text-gray-500 mb-2">
                        <Calendar className="h-4 w-4 mr-1" />
                        Creado el {formatDate(plan.created_at)}
                      </div>

                      {/* Progress Bar */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-gray-600">Progreso</span>
                          <span className="font-medium">{plan.progress_percentage || 0}%</span>
                        </div>
                        <ProgressBar progress={plan.progress_percentage || 0} />
                      </div>

                      {/* Quick Access Buttons */}
                      <div className="grid grid-cols-2 gap-2 mb-4">
                        <Link
                          to={`/plan/${plan.id}?section=identity`}
                          className="btn-secondary text-xs py-2 px-3 text-center"
                          title="Editar Identidad Empresarial"
                        >
                          <Target className="h-3 w-3 mx-auto mb-1" />
                          Identidad
                        </Link>
                        <Link
                          to={`/plan/${plan.id}?section=analysis`}
                          className="btn-secondary text-xs py-2 px-3 text-center"
                          title="Editar Análisis Estratégico"
                        >
                          <FileText className="h-3 w-3 mx-auto mb-1" />
                          Análisis
                        </Link>
                        <Link
                          to={`/plan/${plan.id}?section=tools`}
                          className="btn-secondary text-xs py-2 px-3 text-center"
                          title="Editar Herramientas de Análisis"
                        >
                          <Target className="h-3 w-3 mx-auto mb-1" />
                          Herramientas
                        </Link>
                        <Link
                          to={`/plan/${plan.id}?section=strategies`}
                          className="btn-secondary text-xs py-2 px-3 text-center"
                          title="Editar Estrategias"
                        >
                          <Target className="h-3 w-3 mx-auto mb-1" />
                          Estrategias
                        </Link>
                      </div>

                      <div className="flex items-center justify-between">
                        <Link
                          to={`/plan/${plan.id}`}
                          className="btn-primary text-xs flex-1 mr-2"
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Editar Plan
                        </Link>

                        <button
                          onClick={() => handleDeletePlan(plan.id)}
                          disabled={isDeleting}
                          className="text-red-600 hover:text-red-800 p-2 rounded transition-colors"
                          title="Eliminar plan"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Planes compartidos */}
          {(sharedPlans || []).length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Planes Compartidos</h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {(sharedPlans || []).filter(plan =>
                  plan.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  (plan.description && plan.description.toLowerCase().includes(searchTerm.toLowerCase()))
                ).map((plan) => (
                  <div key={plan.id} className="card hover:shadow-md transition-shadow">
                    <div className="card-header">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 truncate">
                            {plan.title}
                          </h3>
                          {plan.description && (
                            <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                              {plan.description}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center space-x-1 ml-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Compartido
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="card-content">
                      <div className="flex items-center text-sm text-gray-500 mb-2">
                        <Calendar className="h-4 w-4 mr-1" />
                        Creado el {formatDate(plan.created_at)}
                      </div>

                      {/* Progress Bar */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-gray-600">Progreso</span>
                          <span className="font-medium">{plan.progress_percentage || 0}%</span>
                        </div>
                        <ProgressBar progress={plan.progress_percentage || 0} />
                      </div>

                      {/* Quick Access Buttons */}
                      <div className="grid grid-cols-2 gap-2 mb-4">
                        <Link
                          to={`/plan/${plan.id}?section=identity`}
                          className="btn-secondary text-xs py-2 px-3 text-center"
                          title="Ver Identidad Empresarial"
                        >
                          <Target className="h-3 w-3 mx-auto mb-1" />
                          Identidad
                        </Link>
                        <Link
                          to={`/plan/${plan.id}?section=analysis`}
                          className="btn-secondary text-xs py-2 px-3 text-center"
                          title="Ver Análisis Estratégico"
                        >
                          <FileText className="h-3 w-3 mx-auto mb-1" />
                          Análisis
                        </Link>
                        <Link
                          to={`/plan/${plan.id}?section=tools`}
                          className="btn-secondary text-xs py-2 px-3 text-center"
                          title="Ver Herramientas de Análisis"
                        >
                          <Target className="h-3 w-3 mx-auto mb-1" />
                          Herramientas
                        </Link>
                        <Link
                          to={`/plan/${plan.id}?section=strategies`}
                          className="btn-secondary text-xs py-2 px-3 text-center"
                          title="Ver Estrategias"
                        >
                          <Target className="h-3 w-3 mx-auto mb-1" />
                          Estrategias
                        </Link>
                      </div>

                      <div className="flex items-center justify-center">
                        <Link
                          to={`/plan/${plan.id}`}
                          className="btn-primary text-xs flex-1"
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          Ver Plan
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal de crear plan */}
      {isCreateModalOpen && (
        <CreatePlanModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onPlanCreated={handlePlanCreated}
        />
      )}
    </div>
  )
}

export default Dashboard
