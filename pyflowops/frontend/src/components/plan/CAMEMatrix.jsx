import React, { useState } from 'react';
import { Save } from 'lucide-react';

const CAMEMatrix = () => {
  // 16 acciones, una por fila
  const [actions, setActions] = useState(Array(16).fill(''));

  const handleActionChange = (idx, value) => {
    const updated = [...actions];
    updated[idx] = value;
    setActions(updated);
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Matriz CAME</h3>
      </div>
      <div className="card-content">
        <p className="mb-2 text-gray-700 text-sm">
          A continuación y para finalizar de elaborar un Plan Estratégico, además de tener identificada la estrategia es necesario determinar acciones que permitan corregir las debilidades, afrontar las amenazas, mantener las fortalezas y explotar las oportunidades.
        </p>
        <div className="bg-gray-100 p-2 rounded mb-4 text-gray-800 text-sm font-semibold">
          Reflexione y anote acciones a llevar a cabo teniendo en cuenta que estas acciones deben favorecer la ejecución exitosa de la estrategia general identificada.
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300 text-sm">
            <thead>
              <tr>
                <th className="bg-cyan-700 text-white px-2 py-1 border" style={{width: '60px', textAlign: 'center'}}> </th>
                <th className="bg-cyan-700 text-white px-2 py-1 border" style={{width: '60px', textAlign: 'center'}}>Acciones</th>
                <th className="bg-cyan-700 text-white px-2 py-1 border" style={{minWidth: '300px', textAlign: 'center'}}>Corregir</th>
              </tr>
            </thead>
            <tbody>
              {/* C: Corregir debilidades */}
              {[0,1,2,3].map((i) => (
                <tr key={i}>
                  {i === 0 && (
                    <td className="bg-cyan-500 text-white font-bold px-2 py-1 border align-middle" rowSpan={4} style={{textAlign: 'center', verticalAlign: 'middle', fontSize: '1.2rem'}}>C</td>
                  )}
                  <td className="border px-2 py-1 text-center" style={{width: '60px'}}>{i+1}</td>
                  <td className="border px-2 py-1">
                    <input
                      type="text"
                      className="w-full px-3 py-2 border rounded"
                      style={{minWidth: '280px', fontSize: '1rem'}}
                      value={actions[i]}
                      onChange={e => handleActionChange(i, e.target.value)}
                    />
                  </td>
                </tr>
              ))}
              {/* A: Afrontar amenazas */}
              {[4,5,6,7].map((i) => (
                <tr key={i}>
                  {i === 4 && (
                    <td className="bg-cyan-500 text-white font-bold px-2 py-1 border align-middle" rowSpan={4} style={{textAlign: 'center', verticalAlign: 'middle', fontSize: '1.2rem'}}>A</td>
                  )}
                  <td className="border px-2 py-1 text-center" style={{width: '60px'}}>{i+1}</td>
                  <td className="border px-2 py-1">
                    <input
                      type="text"
                      className="w-full px-3 py-2 border rounded"
                      style={{minWidth: '280px', fontSize: '1rem'}}
                      value={actions[i]}
                      onChange={e => handleActionChange(i, e.target.value)}
                    />
                  </td>
                </tr>
              ))}
              {/* M: Mantener fortalezas */}
              {[8,9,10,11].map((i) => (
                <tr key={i}>
                  {i === 8 && (
                    <td className="bg-cyan-500 text-white font-bold px-2 py-1 border align-middle" rowSpan={4} style={{textAlign: 'center', verticalAlign: 'middle', fontSize: '1.2rem'}}>M</td>
                  )}
                  <td className="border px-2 py-1 text-center" style={{width: '60px'}}>{i+1}</td>
                  <td className="border px-2 py-1">
                    <input
                      type="text"
                      className="w-full px-3 py-2 border rounded"
                      style={{minWidth: '280px', fontSize: '1rem'}}
                      value={actions[i]}
                      onChange={e => handleActionChange(i, e.target.value)}
                    />
                  </td>
                </tr>
              ))}
              {/* E: Explotar oportunidades */}
              {[12,13,14,15].map((i) => (
                <tr key={i}>
                  {i === 12 && (
                    <td className="bg-cyan-500 text-white font-bold px-2 py-1 border align-middle" rowSpan={4} style={{textAlign: 'center', verticalAlign: 'middle', fontSize: '1.2rem'}}>E</td>
                  )}
                  <td className="border px-2 py-1 text-center" style={{width: '60px'}}>{i+1}</td>
                  <td className="border px-2 py-1">
                    <input
                      type="text"
                      className="w-full px-3 py-2 border rounded"
                      style={{minWidth: '280px', fontSize: '1rem'}}
                      value={actions[i]}
                      onChange={e => handleActionChange(i, e.target.value)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex justify-end mt-6">
          <button
            type="button"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded shadow transition-colors flex items-center gap-2"
            onClick={() => {/* Aquí irá la lógica de guardado */}}
          >
            <Save className="h-5 w-5" />
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
};

export default CAMEMatrix;
