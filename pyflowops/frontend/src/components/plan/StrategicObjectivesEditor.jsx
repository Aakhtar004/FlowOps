import React, { useState } from 'react'
import { Save, Plus, Trash } from 'lucide-react'

const StrategicObjectivesEditor = ({ initialData = {}, onSave }) => {
  const [mission, setMission] = useState(initialData.mission || '')
  const [objectives, setObjectives] = useState(
    initialData.objectives || [
      { general: '', specifics: ['', ''] },
      { general: '', specifics: ['', ''] },
      { general: '', specifics: ['', ''] }
    ]
  )

  const handleGeneralChange = (idx, value) => {
    const updated = [...objectives]
    updated[idx].general = value
    setObjectives(updated)
  }

  const handleSpecificChange = (objIdx, specIdx, value) => {
    const updated = [...objectives]
    updated[objIdx].specifics[specIdx] = value
    setObjectives(updated)
  }

  const addGeneralObjective = () => {
    setObjectives([...objectives, { general: '', specifics: ['', ''] }])
  }

  const removeGeneralObjective = (idx) => {
    setObjectives(objectives.filter((_, i) => i !== idx))
  }

  const addSpecificObjective = (objIdx) => {
    const updated = [...objectives]
    updated[objIdx].specifics.push('')
    setObjectives(updated)
  }

  const removeSpecificObjective = (objIdx, specIdx) => {
    const updated = [...objectives]
    updated[objIdx].specifics = updated[objIdx].specifics.filter((_, i) => i !== specIdx)
    setObjectives(updated)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    await onSave({ mission, objectives })
  }

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Objetivos Estratégicos</h3>
        <p className="card-description">
          Define la misión y los objetivos generales y específicos de tu empresa.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="card-content space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Misión</label>
          <textarea
            value={mission}
            onChange={e => setMission(e.target.value)}
            rows={3}
            className="input"
            placeholder="Escribe la misión de tu empresa..."
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Objetivos Generales o Estratégicos</label>
          {objectives.map((obj, objIdx) => (
            <div key={objIdx} className="mb-4 border rounded p-3 bg-gray-50">
              <div className="flex items-center mb-2">
                <input
                  type="text"
                  value={obj.general}
                  onChange={e => handleGeneralChange(objIdx, e.target.value)}
                  className="input flex-1"
                  placeholder={`Objetivo general #${objIdx + 1}`}
                  required
                />
                <button type="button" onClick={() => removeGeneralObjective(objIdx)} className="ml-2 text-red-500">
                  <Trash className="h-4 w-4" />
                </button>
              </div>
              <div className="ml-4">
                <label className="block text-xs font-medium mb-1">Objetivos Específicos</label>
                {obj.specifics.map((spec, specIdx) => (
                  <div key={specIdx} className="flex items-center mb-1">
                    <input
                      type="text"
                      value={spec}
                      onChange={e => handleSpecificChange(objIdx, specIdx, e.target.value)}
                      className="input flex-1"
                      placeholder={`Objetivo específico #${specIdx + 1}`}
                      required
                    />
                    <button type="button" onClick={() => removeSpecificObjective(objIdx, specIdx)} className="ml-2 text-red-500">
                      <Trash className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <button type="button" onClick={() => addSpecificObjective(objIdx)} className="btn-secondary mt-2">
                  <Plus className="h-4 w-4 mr-1" /> Añadir objetivo específico
                </button>
              </div>
            </div>
          ))}
          <button type="button" onClick={addGeneralObjective} className="btn-secondary">
            <Plus className="h-4 w-4 mr-1" /> Añadir objetivo general
          </button>
        </div>
        <div className="flex justify-end pt-4">
          <button type="submit" className="btn-primary">
            <Save className="h-4 w-4 mr-2" /> Guardar Objetivos
          </button>
        </div>
      </form>
    </div>
  )
}

export default StrategicObjectivesEditor