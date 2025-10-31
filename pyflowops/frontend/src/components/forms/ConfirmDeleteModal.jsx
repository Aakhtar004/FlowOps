import LoadingSpinner from '../common/LoadingSpinner'

const ConfirmDeleteModal = ({ isOpen, title, onClose, onConfirm, confirmText = 'Eliminar', disabled = false }) => {
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        {/* Overlay */}
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" />

        {/* Modal content */}
        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-auto">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Confirmar eliminación</h3>
          </div>

          {/* Body */}
          <div className="px-6 py-4">
            <p className="text-sm text-gray-700">
              ¿Seguro que deseas eliminar el plan
              {title ? <span> "{title}"</span> : null}? Esta acción no se puede deshacer.
            </p>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              disabled={disabled}
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="btn-primary bg-red-600 hover:bg-red-700 border-red-600"
              disabled={disabled}
            >
              {disabled ? (
                <LoadingSpinner size="small" text="" />
              ) : (
                confirmText
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ConfirmDeleteModal