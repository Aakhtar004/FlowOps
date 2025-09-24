import React, { useState } from 'react';
import { Trash } from 'lucide-react';

const statements = [
  'La empresa tiene una política sistematizada de cero defectos en la producción de productos/servicios.',
  'La empresa emplea los medios productivos tecnológicamente más avanzados de su sector.',
  'La empresa dispone de un sistema de información y control de gestión eficiente y eficaz.',
  'Los medios técnicos y tecnológicos de la empresa están preparados para competir en un futuro a corto, medio y largo plazo.',
  'La empresa es un referente en su sector en I+D+i.',
  'La excelencia de los procedimientos de la empresa (en ISO, etc.) son una principal fuente de ventaja competitiva.',
  'La empresa dispone de página web, y esta se emplea no sólo como escaparate virtual de productos/servicios, sino también para establecer relaciones con clientes y proveedores.',
  'Los productos/servicios que desarrolla nuestra empresa llevan incorporada una tecnología difícil de imitar.',
  'La empresa es referente en su sector en la optimización, en términos de coste, de su cadena de producción, siendo ésta una de sus principales ventajas competitivas.',
  'La informatización de la empresa es una fuente de ventaja competitiva clara respecto a sus competidores.',
  'Los canales de distribución de la empresa son una importante fuente de ventajas competitivas.',
  'Los productos/servicios de la empresa son altamente, diferencialmente, valorados por el cliente respecto a nuestros competidores.',
  'La empresa dispone y ejecuta un sistemático plan de marketing y ventas.',
  'La empresa tiene optimizada su gestión financiera.',
  'La empresa busca continuamente el mejorar la relación con sus clientes cortando los plazos de ejecución, personalizando la oferta o mejorando las condiciones de entrega. Pero siempre partiendo de un plan previo.',
  'La empresa es referente en su sector en el lanzamiento de innovadores productos y servicio de éxito demostrado en el mercado.',
  'Los Recursos Humanos son especialmente responsables del éxito de la empresa, considerándolos incluso como el principal activo estratégico.',
  'Se tiene una plantilla altamente motivada, que conoce con claridad las metas, objetivos y estrategias de la organización.',
  'La empresa siempre trabaja conforme a una estrategia y objetivos claros.',
  'La gestión del circulante está optimizada.',
  'Se tiene definido claramente el posicionamiento estratégico de todos los productos de la empresa.',
  'Se dispone de una política de marca basada en la reputación que la empresa genera, en la gestión de relación con el cliente y en el posicionamiento estratégico previamente definido.',
  'La cartera de clientes de nuestra empresa está altamente fidelizada, ya que tenemos como principal propósito el deleitarlos día a día.',
  'Nuestra política y equipo de ventas y marketing es una importante ventaja competitiva de nuestra empresa respecto al sector.',
  'El servicio al cliente que prestamos es uno de nuestras principales ventajas competitivas respecto a nuestros competidores.'
];

const ValueChainDiagnosis = () => {
  const [values, setValues] = useState(Array(statements.length).fill(null));

  const handleChange = (idx, val) => {
    const updated = [...values];
    updated[idx] = val;
    setValues(updated);
  };

  const total = values.reduce((acc, val) => acc + (val !== null ? Number(val) : 0), 0);
  const potential = ((total / 100) * 100).toFixed(0) + '%';

  const [reflection, setReflection] = useState('');
  const [strengths, setStrengths] = useState(['', '']);
  const [weaknesses, setWeaknesses] = useState(['', '']);

  const addStrength = () => setStrengths([...strengths, '']);
  const removeStrength = (idx) => setStrengths(strengths.filter((_, i) => i !== idx));
  const addWeakness = () => setWeaknesses([...weaknesses, '']);
  const removeWeakness = (idx) => setWeaknesses(weaknesses.filter((_, i) => i !== idx));

  const handleSave = () => {
    // Aquí puedes agregar la lógica de guardado si lo necesitas
    // Por ejemplo, enviar los datos a una API
    alert('Cadena de Valor guardada');
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Autodiagnóstico de la Cadena de Valor Interna</h3>
        <p className="card-description">Marca una opción por fila según el nivel de acuerdo (0-4).</p>
      </div>
      <div className="card-content overflow-x-auto">
        <table className="min-w-full border text-sm">
          <thead>
            <tr className="bg-blue-100">
              <th className="border px-2 py-1 text-left">Afirmación</th>
              {[0,1,2,3,4].map(v => (
                <th key={v} className="border px-2 py-1 text-center">{v}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {statements.map((text, idx) => (
              <tr key={idx} className={idx % 2 === 0 ? 'bg-gray-50' : ''}>
                <td className="border px-2 py-1 align-top">{text}</td>
                {[0,1,2,3,4].map(v => (
                  <td key={v} className="border px-2 py-1 text-center">
                    <input
                      type="radio"
                      name={`row-${idx}`}
                      value={v}
                      checked={values[idx] === v}
                      onChange={() => handleChange(idx, v)}
                    />
                  </td>
                ))}
              </tr>
            ))}
            <tr className="bg-green-100 font-bold">
              <td className="border px-2 py-1">POTENCIAL DE MEJORA DE LA CADENA DE VALOR INTERNA</td>
              <td className="border px-2 py-1 text-center" colSpan={5}>{potential}</td>
            </tr>
          </tbody>
        </table>
      </div>
      {/* Reflexión y Fortalezas/Debilidades */}
      <div className="mt-8">
        <div className="mb-6 p-4 border rounded bg-blue-50">
          <div className="text-gray-700 text-sm mb-2 px-2 pt-2">
            Reflexione sobre el resultado obtenido. Anote aquellas observaciones que puedan ser de su interés. Identifique sus fortalezas y debilidades respecto a su cadena de valor
          </div>
          <textarea
            className="w-full border rounded p-2 text-sm px-2"
            rows={5}
            placeholder="Ingresar texto"
            value={reflection}
            onChange={e => setReflection(e.target.value)}
          />
        </div>
        <div className="mb-6">
          <div className="bg-yellow-100 border-b border-gray-300 text-center font-bold py-1">FORTALEZAS</div>
          <div className="w-full border border-gray-300">
            {strengths.map((str, idx) => (
              <div className={`flex${idx < strengths.length - 1 ? ' border-b border-gray-300' : ''}`} key={idx}>
                <div className="w-32 bg-yellow-200 border-r border-gray-300 flex items-center justify-center px-2">F{idx+1}:</div>
                <input
                  className="flex-1 p-2 text-sm border-none px-2"
                  type="text"
                  placeholder={`Fortaleza ${idx+1}`}
                  value={str}
                  onChange={e => setStrengths(strengths.map((s, i) => i === idx ? e.target.value : s))}
                />
                {strengths.length > 2 && (
                  <button type="button" className="ml-2 text-red-500" onClick={() => removeStrength(idx)} title="Eliminar">
                    <Trash className="h-5 w-5" />
                  </button>
                )}
              </div>
            ))}
          </div>
          <button type="button" className="btn-secondary mt-2" onClick={addStrength}>+ Añadir fortaleza</button>
        </div>
        <div>
          <div className="bg-green-100 border-b border-gray-300 text-center font-bold py-1">DEBILIDADES</div>
          <div className="w-full border border-gray-300">
            {weaknesses.map((w, idx) => (
              <div className={`flex${idx < weaknesses.length - 1 ? ' border-b border-gray-300' : ''}`} key={idx}>
                <div className="w-32 bg-green-200 border-r border-gray-300 flex items-center justify-center px-2">D{idx+1}:</div>
                <input
                  className="flex-1 p-2 text-sm border-none px-2"
                  type="text"
                  placeholder={`Debilidad ${idx+1}`}
                  value={w}
                  onChange={e => setWeaknesses(weaknesses.map((ww, i) => i === idx ? e.target.value : ww))}
                />
                {weaknesses.length > 2 && (
                  <button type="button" className="ml-2 text-red-500" onClick={() => removeWeakness(idx)} title="Eliminar">
                    <Trash className="h-5 w-5" />
                  </button>
                )}
              </div>
            ))}
          </div>
          <button type="button" className="btn-secondary mt-2" onClick={addWeakness}>+ Añadir debilidad</button>
        </div>
        <div className="flex justify-end pt-4">
          <button type="button" className="btn-primary" onClick={handleSave}>
            Guardar Cadena de Valor
          </button>
        </div>
      </div>
    </div>
  );
};

export default ValueChainDiagnosis;
