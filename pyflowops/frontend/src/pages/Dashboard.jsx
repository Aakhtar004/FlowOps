import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, FileText, Calendar, Eye, Edit, Trash2, Search } from 'lucide-react'
import { usePlans } from '../hooks/useApi'
import { useToast } from '../components/ui/Toast'
import LoadingSpinner from '../components/common/LoadingSpinner'
import CreatePlanModal from '../components/forms/CreatePlanModal'

const Dashboard = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const { plans, isLoading, deletePlan, isDeleting } = usePlans()
  const { success, error } = useToast()

  // Filtrar planes según término de búsqueda
  const filteredPlans = plans.filter(plan =>
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
            {plans.length === 0 ? 'No hay planes estratégicos' : 'No se encontraron planes'}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {plans.length === 0 
              ? 'Comienza creando tu primer plan estratégico.'
              : 'Intenta con otros términos de búsqueda.'
            }
          </p>
          {plans.length === 0 && (
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
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredPlans.map((plan) => (
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
                    {plan.is_active ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Activo
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Inactivo
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="card-content">
                <div className="flex items-center text-sm text-gray-500 mb-4">
                  <Calendar className="h-4 w-4 mr-1" />
                  Creado el {formatDate(plan.created_at)}
                  {plan.updated_at && (
                    <span className="ml-2">Modificado el {formatDate(plan.updated_at)}</span>
                  )}
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
