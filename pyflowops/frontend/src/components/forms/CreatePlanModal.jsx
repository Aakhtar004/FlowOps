import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { X, Plus, Minus } from 'lucide-react'
import { usePlans } from '../../hooks/useApi'
import { plansAPI } from '../../services/api'
import LoadingSpinner from '../common/LoadingSpinner'

const schema = yup.object({
  title: yup
    .string()
    .required('El título es requerido')
    .max(200, 'El título no puede exceder 200 caracteres'),
  description: yup
    .string()
    .max(500, 'La descripción no puede exceder 500 caracteres'),
  inviteEmails: yup
    .array()
    .of(yup.string().email('Email inválido'))
    .max(6, 'Máximo 6 usuarios invitados'),
})

const CreatePlanModal = ({ isOpen, onClose, onPlanCreated }) => {
  const { createPlan, isCreating } = usePlans()
  const [inviteEmails, setInviteEmails] = useState([''])
  const [submissionError, setSubmissionError] = useState(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
  })

  const addEmailField = () => {
    if (inviteEmails.length < 6) {
      setInviteEmails([...inviteEmails, ''])
    }
  }

  const removeEmailField = (index) => {
    if (inviteEmails.length > 1) {
      const newEmails = inviteEmails.filter((_, i) => i !== index)
      setInviteEmails(newEmails)
    }
  }

  const updateEmail = (index, value) => {
    const newEmails = [...inviteEmails]
    newEmails[index] = value
    setInviteEmails(newEmails)
  }

  const onSubmit = async (data) => {
    try {
      // Crear el plan
      const plan = await createPlan({
        title: data.title,
        description: data.description,
      })

      // Invitar usuarios si hay emails válidos
      const validEmails = inviteEmails.filter(email => email.trim() && email.includes('@'))
      if (validEmails.length > 0 && plan?.id) {
        for (const email of validEmails) {
          try {
            await plansAPI.inviteUser(plan.id, email.trim())
          } catch (inviteError) {
            console.error(`Error invitando a ${email}:`, inviteError)
            // No fallar el proceso completo por un error de invitación
          }
        }
      }

      reset()
      setInviteEmails([''])
      setSubmissionError(null)
      onPlanCreated?.()
    } catch (error) {
      console.error('Error al crear plan:', error)
      setSubmissionError('Error al crear el plan. Por favor, inténtalo de nuevo.')
    }
  }

  const handleClose = () => {
    reset()
    setInviteEmails([''])
    setSubmissionError(null)
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

              {/* Error de envío */}
              {submissionError && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <p className="text-red-600 text-sm">{submissionError}</p>
                </div>
              )}

              {/* Invitar usuarios (Opcional) */}
              {true && (
              <div>
                <label className="form-label">
                  Invitar Usuarios (Opcional)
                </label>
                <p className="text-sm text-gray-500 mb-2">
                  Agrega emails de usuarios registrados para compartir este plan (máximo 6).
                </p>
                <div className="space-y-2">
                  {inviteEmails.map((email, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => updateEmail(index, e.target.value)}
                        className="input flex-1"
                        placeholder="usuario@email.com"
                      />
                      {inviteEmails.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeEmailField(index)}
                          className="text-red-500 hover:text-red-700 p-2"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                {inviteEmails.length < 6 && (
                  <button
                    type="button"
                    onClick={addEmailField}
                    className="mt-2 flex items-center space-x-1 text-primary-600 hover:text-primary-800 text-sm"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Agregar otro email</span>
                  </button>
                )}
              </div>
              )}

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
