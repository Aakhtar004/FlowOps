import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { X } from 'lucide-react'
import { usePlans } from '../../hooks/useApi'
import LoadingSpinner from '../common/LoadingSpinner'

const schema = yup.object({
  title: yup
    .string()
    .required('El título es requerido')
    .min(3, 'El título debe tener al menos 3 caracteres')
    .max(200, 'El título no puede exceder 200 caracteres'),
  description: yup
    .string()
    .max(500, 'La descripción no puede exceder 500 caracteres'),
})

const CreatePlanModal = ({ isOpen, onClose, onPlanCreated }) => {
  const { createPlan, isCreating } = usePlans()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
  })

  const onSubmit = async (data) => {
    try {
      await createPlan(data)
      reset()
      onPlanCreated?.()
    } catch (error) {
      console.error('Error al crear plan:', error)
    }
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4 text-center">
        {/* Overlay */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={handleClose}
        />

        {/* Modal */}
        <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Crear Nuevo Plan Estratégico
              </h3>
              <button
                type="button"
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="px-6 py-4 space-y-4">
              {/* Título */}
              <div>
                <label htmlFor="title" className="form-label">
                  Título del Plan *
                </label>
                <input
                  {...register('title')}
                  type="text"
                  className="input w-full"
                  placeholder="Ej: Plan Estratégico TI 2024-2026"
                />
                {errors.title && (
                  <p className="form-error">{errors.title.message}</p>
                )}
              </div>

              {/* Descripción */}
              <div>
                <label htmlFor="description" className="form-label">
                  Descripción (Opcional)
                </label>
                <textarea
                  {...register('description')}
                  rows={3}
                  className="textarea w-full"
                  placeholder="Breve descripción del plan estratégico..."
                />
                {errors.description && (
                  <p className="form-error">{errors.description.message}</p>
                )}
              </div>

              <div className="text-sm text-gray-500">
                <p>
                  Una vez creado el plan, podrás agregar todos los módulos:
                  identidad empresarial, análisis estratégico, herramientas de análisis y estrategias.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end space-x-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
              <button
                type="button"
                onClick={handleClose}
                className="btn-secondary"
                disabled={isCreating}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={isCreating}
              >
                {isCreating ? (
                  <LoadingSpinner size="small" text="" />
                ) : (
                  'Crear Plan'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default CreatePlanModal
