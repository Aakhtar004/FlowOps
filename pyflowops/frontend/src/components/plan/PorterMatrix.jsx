import React, { useState } from 'react';
import { Trash } from 'lucide-react';

const sections = [
  {
    title: 'Rivalidad empresas del sector',
    items: [
      { label: 'Crecimiento', left: 'Lento', right: 'Rápido' },
      { label: 'Naturaleza de los competidores', left: 'Muchos', right: 'Pocos' },
      { label: 'Exceso de capacidad productiva', left: 'Si', right: 'No' },
      { label: 'Rentabilidad media del sector', left: 'Baja', right: 'Alta' },
      { label: 'Diferenciación del producto', left: 'Escasa', right: 'Elevada' },
      { label: 'Barreras de salida', left: 'Bajas', right: 'Altas' },
    ]
  },
  {
    title: 'Barreras de Entrada',
    items: [
      { label: 'Economías de escala', left: 'No', right: 'Si' },
      { label: 'Necesidad de capital', left: 'Bajas', right: 'Altas' },
      { label: 'Acceso a la tecnología', left: 'Fácil', right: 'Difícil' },
      { label: 'Reglamentos o leyes limitativos', left: 'No', right: 'Sí' },
      { label: 'Trámites burocráticos', left: 'No', right: 'Sí' },
      { label: 'Reacción esperada actuales competidores', left: 'Escasa', right: 'Enérgica' },
    ]
  },
  {
    title: 'Poder de los Clientes',
    items: [
      { label: 'Número de clientes', left: 'Pocos', right: 'Muchos' },
      { label: 'Posibilidad de integración ascendente', left: 'Pequeña', right: 'Grande' },
      { label: 'Rentabilidad de los clientes', left: 'Baja', right: 'Alta' },
      { label: 'Coste de cambio de proveedor para cliente', left: 'Bajo', right: 'Alto' },
    ]
  },
  {
    title: 'Productos sustitutivos',
    items: [
      { label: 'Disponibilidad de Productos Sustitutivos', left: 'Grande', right: 'Pequeña' },
    ]
  }
];

const columns = [
  { label: 'Hostil', value: 0 },
  { label: 'Nada', value: 1 },
  { label: 'Poco', value: 2 },
  { label: 'Medio', value: 3 },
  { label: 'Alto', value: 4 },
  { label: 'Muy Alto', value: 5 },
  { label: 'Favorable', value: 6 },
];

const scoreMap = {
  1: 1,
  2: 2,
  3: 3,
  4: 4,
  5: 5
};

const PorterMatrix = () => {
  const [selected, setSelected] = useState(Array(sections.reduce((acc, s) => acc + s.items.length, 0)).fill(null));
  const [opportunities, setOpportunities] = useState(['', '']);
  const [threats, setThreats] = useState(['', '']);

  const handleSelect = (rowIdx, colIdx) => {
    setSelected(selected.map((v, i) => i === rowIdx ? colIdx : v));
  };

  const addOpportunity = () => setOpportunities([...opportunities, '']);
  const removeOpportunity = idx => setOpportunities(opportunities.filter((_, i) => i !== idx));
  const addThreat = () => setThreats([...threats, '']);
  const removeThreat = idx => setThreats(threats.filter((_, i) => i !== idx));

  // Suma solo los valores de las columnas "Nada" a "Muy Alto" (índices 1-5)
  const totalScore = selected.reduce((acc, val) => acc + (val >= 1 && val <= 5 ? scoreMap[val] : 0), 0);

  let conclusion = '';
  if (totalScore === 0) {
    conclusion = '';
  } else if (totalScore < 30) {
    conclusion = 'Estamos en un mercado altamente competitivo, en el que es muy difícil hacerse un hueco en el mercado.';
  } else if (totalScore < 45) {
    conclusion = 'Estamos en un mercado de competitividad relativamente alta, pero con ciertas modificaciones en el producto y la política comercial de la empresa, podría encontrarse un nicho de mercado.';
  } else if (totalScore < 60) {
    conclusion = 'La situación actual del mercado es favorable a la empresa.';
  } else {
    conclusion = 'Estamos en una situación excelente para la empresa.';
  }

  let rowIdx = 0;

  const handleSave = () => {
    // Aquí puedes agregar la lógica de guardado si lo necesitas
    alert('Matriz de Porter guardada');
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Matriz de Porter</h3>
        <p className="card-description">Marque con una X en las casillas según el estado actual de su empresa. El perfil competitivo se valora en la escala Hostil-Favorable.</p>
      </div>
      <div className="card-content overflow-x-auto">
        <table className="min-w-full border text-sm mb-8" style={{ tableLayout: 'fixed', width: '900px' }}>
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-2 py-1"></th>
              <th className="border px-2 py-1 text-red-600">Hostil</th>
              {columns.slice(1, 6).map(col => (
                <th key={col.label} className="border px-2 py-1 text-center">{col.label}</th>
              ))}
              <th className="border px-2 py-1 text-blue-600">Favorable</th>
            </tr>
          </thead>
          <tbody>
            {sections.map(section => (
              <React.Fragment key={section.title}>
                <tr>
                  <td className="border px-2 py-1 font-bold bg-green-100" colSpan={8}>{section.title}</td>
                </tr>
                {section.items.map((item, i) => {
                  const idx = rowIdx;
                  rowIdx++;
                  return (
                    <tr key={item.label}>
                      <td className="border px-2 py-1 text-gray-700">{item.label}</td>
                      <td className="border px-2 py-1 text-red-600 text-center">{item.left}</td>
                      {columns.slice(1, 6).map((col, colIdx) => (
                        <td key={col.label} className="border px-2 py-1 text-center">
                          <input
                            type="checkbox"
                            checked={selected[idx] === colIdx + 1}
                            onChange={() => handleSelect(idx, colIdx + 1)}
                          />
                        </td>
                      ))}
                      <td className="border px-2 py-1 text-blue-600 text-center bg-green-50">{item.right}</td>
                    </tr>
                  );
                })}
              </React.Fragment>
            ))}
            <tr>
              <td className="border px-2 py-1 font-bold text-right text-blue-700" colSpan={2}>CONCLUSIÓN</td>
              <td className="border px-2 py-1 text-center font-bold" colSpan={4} style={{ minWidth: '300px', resize: 'none', background: '#fff', fontSize: '1rem', height: '48px', verticalAlign: 'middle' }}>
                {conclusion ? `"${conclusion}"` : ''}
              </td>
              <td className="border px-2 py-1 text-blue-700 font-bold text-center" colSpan={1}>Total<br />{totalScore}</td>
            </tr>
          </tbody>
        </table>
        {/* Oportunidades y Amenazas */}
        <div className="mb-6">
          <div className="bg-orange-100 border-b border-gray-300 text-center font-bold py-1">OPORTUNIDADES</div>
          <div className="grid grid-cols-1 border border-gray-300">
            {opportunities.map((o, idx) => (
              <div className={`flex${idx < opportunities.length - 1 ? ' border-b border-gray-300' : ''}`} key={idx}>
                <div className="w-16 bg-orange-200 border-r border-gray-300 flex items-center justify-center">O{idx+1}:</div>
                <input
                  className="flex-1 p-2 text-sm"
                  type="text"
                  placeholder={`Oportunidad ${idx+1}`}
                  value={o}
                  onChange={e => setOpportunities(opportunities.map((oo, i) => i === idx ? e.target.value : oo))}
                />
                {opportunities.length > 2 && (
                  <button type="button" className="ml-2 text-red-500" onClick={() => removeOpportunity(idx)} title="Eliminar">
                    <Trash className="h-5 w-5" />
                  </button>
                )}
              </div>
            ))}
          </div>
          <button type="button" className="btn-secondary mt-2" onClick={addOpportunity}>+ Añadir oportunidad</button>
        </div>
        <div>
          <div className="bg-blue-100 border-b border-gray-300 text-center font-bold py-1">AMENAZAS</div>
          <div className="grid grid-cols-1 border border-gray-300">
            {threats.map((a, idx) => (
              <div className={`flex${idx < threats.length - 1 ? ' border-b border-gray-300' : ''}`} key={idx}>
                <div className="w-16 bg-blue-200 border-r border-gray-300 flex items-center justify-center">A{idx+1}:</div>
                <input
                  className="flex-1 p-2 text-sm"
                  type="text"
                  placeholder={`Amenaza ${idx+1}`}
                  value={a}
                  onChange={e => setThreats(threats.map((aa, i) => i === idx ? e.target.value : aa))}
                />
                {threats.length > 2 && (
                  <button type="button" className="ml-2 text-red-500" onClick={() => removeThreat(idx)} title="Eliminar">
                    <Trash className="h-5 w-5" />
                  </button>
                )}
              </div>
            ))}
          </div>
          <button type="button" className="btn-secondary mt-2" onClick={addThreat}>+ Añadir amenaza</button>
        </div>
        <div className="flex justify-end pt-4">
          <button type="button" className="btn-primary" onClick={handleSave}>
            Guardar Matriz de Porter
          </button>
        </div>
      </div>
    </div>
  );
};

export default PorterMatrix;
