import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Save, Building } from 'lucide-react'
import { useToast } from '../ui/Toast'

const IdentityEditor = ({ planId, initialData, onSave }) => {
  const [isLoading, setIsLoading] = useState(false)
  const { success, error } = useToast()
  
  const { register, handleSubmit, reset, formState: { errors, isDirty } } = useForm({
    defaultValues: {
      mission: '',
      vision: '',
      values: '',
      objectives: ''
    }
  })

  useEffect(() => {
    if (initialData) {
      reset(initialData)
    }
  }, [initialData, reset])

  const onSubmit = async (data) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/v1/plans/${planId}/identity`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify(data)
      })
      
      if (!response.ok) {
        throw new Error('Error al guardar la identidad empresarial')
      }
      
      await onSave(data)
      success('Identidad empresarial guardada correctamente')
    } catch (err) {
      error('Error al guardar la identidad empresarial')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="card">
      <div className="card-header">
        <div className="flex items-center space-x-2">
          <Building className="h-5 w-5 text-blue-600" />
          <h3 className="card-title">Identidad de la Empresa</h3>
        </div>
        <p className="card-description">
          Define los elementos fundamentales de tu organización
        </p>
      </div>

      <div className="card-content">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Misión */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Misión
            </label>
            <textarea
              {...register('mission', { 
                required: 'La misión es requerida',
                minLength: { value: 20, message: 'La misión debe tener al menos 20 caracteres' }
              })}
              rows={3}
              className="input"
              placeholder="Define el propósito fundamental de tu organización..."
            />
            {errors.mission && (
              <p className="text-red-500 text-sm mt-1">{errors.mission.message}</p>
            )}
          </div>

          {/* Visión */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Visión
            </label>
            <textarea
              {...register('vision', { 
                required: 'La visión es requerida',
                minLength: { value: 20, message: 'La visión debe tener al menos 20 caracteres' }
              })}
              rows={3}
              className="input"
              placeholder="Describe cómo ves tu organización en el futuro..."
            />
            {errors.vision && (
              <p className="text-red-500 text-sm mt-1">{errors.vision.message}</p>
            )}
          </div>

          {/* Valores */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Valores
            </label>
            <textarea
              {...register('values', { 
                required: 'Los valores son requeridos',
                minLength: { value: 20, message: 'Los valores deben tener al menos 20 caracteres' }
              })}
              rows={4}
              className="input"
              placeholder="Lista los valores fundamentales de tu organización (uno por línea)..."
            />
            {errors.values && (
              <p className="text-red-500 text-sm mt-1">{errors.values.message}</p>
            )}
          </div>

          {/* Botón de guardar */}
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={isLoading || !isDirty}
              className="btn-primary"
            >
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? 'Guardando...' : 'Guardar Identidad'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default IdentityEditor
