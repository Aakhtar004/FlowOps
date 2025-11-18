import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { X, Plus, Save } from 'lucide-react';
import { plansAPI } from '../../services/api';
import { useToast } from '../ui/Toast';

const PEST_QUESTIONS = [
  // Factores Sociales y Demográficos (1-5)
  { number: 1, category: 'social', text: 'Los cambios en la composición étnica de los consumidores de nuestro mercado está teniendo un notable impacto.' },
  { number: 2, category: 'social', text: 'El envejecimiento de la población tiene un importante impacto en la demanda.' },
  { number: 3, category: 'social', text: 'Los nuevos estilos de vida y tendencias originan cambios en la oferta de nuestro sector.' },
  { number: 4, category: 'social', text: 'El envejecimiento de la población tiene un importante impacto en la oferta del sector donde operamos.' },
  { number: 5, category: 'social', text: 'Las variaciones en el nivel de riqueza de la población impactan considerablemente en la demanda de los productos/servicios del sector donde operamos.' },

  // Factores Políticos (6-10)
  { number: 6, category: 'politico', text: 'La legislación fiscal afecta muy considerablemente a la economía de las empresas del sector donde operamos.' },
  { number: 7, category: 'politico', text: 'La legislación laboral afecta muy considerablemente a la operativa del sector donde actuamos.' },
  { number: 8, category: 'politico', text: 'Las subvenciones otorgadas por las Administraciones Públicas son claves en el desarrollo competitivo del mercado donde operamos.' },
  { number: 9, category: 'politico', text: 'El impacto que tiene la legislación de protección al consumidor, en la manera de producir bienes y/o servicios es muy importante.' },
  { number: 10, category: 'politico', text: 'La normativa autonómica tiene un impacto considerable en el funcionamiento del sector donde actuamos.' },

  // Factores Económicos (11-15)
  { number: 11, category: 'economico', text: 'Las expectativas de crecimiento económico generales afectan crucialmente al mercado donde operamos.' },
  { number: 12, category: 'economico', text: 'La política de tipos de interés es fundamental en el desarrollo financiero del sector donde trabaja nuestra empresa.' },
  { number: 13, category: 'economico', text: 'La globalización permite a nuestra industria gozar de importantes oportunidades en nuevos mercados.' },
  { number: 14, category: 'economico', text: 'La situación del empleo es fundamental para el desarrollo económico de nuestra empresa y nuestro sector.' },
  { number: 15, category: 'economico', text: 'Las expectativas del ciclo económico de nuestro sector impactan en la situación económica de sus empresas.' },

  // Factores Tecnológicos (16-20)
  { number: 16, category: 'tecnologico', text: 'Las Administraciones Públicas están incentivando el esfuerzo tecnológico de las empresas de nuestro sector.' },
  { number: 17, category: 'tecnologico', text: 'Internet, el comercio electrónico, el wireless y otras NTIC están impactando en la demanda de nuestros productos/servicios y en los de la competencia.' },
  { number: 18, category: 'tecnologico', text: 'El empleo de NTIC´s es generalizado en el sector donde trabajamos.' },
  { number: 19, category: 'tecnologico', text: 'En nuestro sector, es de gran importancia ser pionero o referente en el empleo de aplicaciones tecnológicas.' },
  { number: 20, category: 'tecnologico', text: 'En el sector donde operamos, para ser competitivos, es condición "sine qua non" innovar constantemente.' },

  // Factores Medio Ambientales (21-25)
  { number: 21, category: 'ambiental', text: 'La legislación medioambiental afecta al desarrollo de nuestro sector.' },
  { number: 22, category: 'ambiental', text: 'Los clientes de nuestro mercado exigen que se seamos socialmente responsables, en el plano medioambiental.' },
  { number: 23, category: 'ambiental', text: 'En nuestro sector, la políticas medioambientales son una fuente de ventajas competitivas.' },
  { number: 24, category: 'ambiental', text: 'La creciente preocupación social por el medio ambiente impacta notablemente en la demanda de productos/servicios ofertados en nuestro mercado.' },
  { number: 25, category: 'ambiental', text: 'El factor ecológico es una fuente de diferenciación clara en el sector donde opera nuestra empresa.' },
];

const CONCLUSION_TEXT = {
  social: {
    low: 'NO HAY UN NOTABLE IMPACTO DE FACTORES SOCIALES Y DEMOGRÁFICOS EN EL FUNCIONAMIENTO DE LA EMPRESA',
    high: 'HAY UN NOTABLE IMPACTO DE FACTORES SOCIALES Y DEMOGRÁFICOS EN EL FUNCIONAMIENTO DE LA EMPRESA'
  },
  politico: {
    low: 'NO HAY UN NOTABLE IMPACTO DE FACTORES POLÍTICOS EN EL FUNCIONAMIENTO DE LA EMPRESA',
    high: 'HAY UN NOTABLE IMPACTO DE FACTORES POLÍTICOS EN EL FUNCIONAMIENTO DE LA EMPRESA'
  },
  economico: {
    low: 'NO HAY UN NOTABLE IMPACTO DE FACTORES ECONÓMICOS EN EL FUNCIONAMIENTO DE LA EMPRESA',
    high: 'HAY UN NOTABLE IMPACTO DE FACTORES ECONÓMICOS EN EL FUNCIONAMIENTO DE LA EMPRESA'
  },
  tecnologico: {
    low: 'NO HAY UN NOTABLE IMPACTO DE FACTORES TECNOLÓGICOS EN EL FUNCIONAMIENTO DE LA EMPRESA',
    high: 'HAY UN NOTABLE IMPACTO DE FACTORES TECNOLÓGICOS EN EL FUNCIONAMIENTO DE LA EMPRESA'
  },
  ambiental: {
    low: 'NO HAY UN NOTABLE IMPACTO DE FACTORES MEDIO AMBIENTALES EN EL FUNCIONAMIENTO DE LA EMPRESA',
    high: 'HAY UN NOTABLE IMPACTO DE FACTORES MEDIO AMBIENTALES EN EL FUNCIONAMIENTO DE LA EMPRESA'
  }
};

const CATEGORY_COLORS = {
  social: '#36a2eb',
  politico: '#ff6384',
  economico: '#4bc0c0',
  tecnologico: '#9966ff',
  ambiental: '#ff9f40'
};

const CATEGORY_LABELS = {
  social: 'Social',
  politico: 'Político',
  economico: 'Económico',
  tecnologico: 'Tecnológico',
  ambiental: 'Ambiental'
};

export default function PestEditor({ planId, onSave }) {
  const [responses, setResponses] = useState({});
  const [opportunities, setOpportunities] = useState([]);
  const [threats, setThreats] = useState([]);
  const [scores, setScores] = useState({ social: 0, politico: 0, economico: 0, tecnologico: 0, ambiental: 0 });
  const [conclusions, setConclusions] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { success, error } = useToast();

  // Cargar datos existentes
  useEffect(() => {
    const loadPestData = async () => {
      try {
        setIsLoading(true);
        const data = await plansAPI.getPestAnalysis(planId);
        
        if (data && data.responses && Array.isArray(data.responses)) {
          const newResponses = {};
          data.responses.forEach(r => {
            newResponses[r.question_number] = r.response_value;
          });
          setResponses(newResponses);
          
          // Calcular scores después de cargar respuestas
          const newScores = { social: 0, politico: 0, economico: 0, tecnologico: 0, ambiental: 0 };
          PEST_QUESTIONS.forEach(q => {
            if (newResponses[q.number] !== undefined) {
              newScores[q.category] += newResponses[q.number];
            }
          });
          setScores(newScores);
          
          // Calcular conclusiones
          const newConclusions = {};
          Object.entries(newScores).forEach(([category, score]) => {
            const percentage = (score / 5) * 100;
            newConclusions[category] = percentage <= 70 ? 'low' : 'high';
          });
          setConclusions(newConclusions);
        }

        if (data && data.opportunities && Array.isArray(data.opportunities)) {
          setOpportunities(data.opportunities);
        }

        if (data && data.threats && Array.isArray(data.threats)) {
          setThreats(data.threats);
        }
      } catch (err) {
        console.error('Error loading PEST data:', err);
        // No mostrar error si es la primera carga (PEST no existe aún)
      } finally {
        setIsLoading(false);
      }
    };

    if (planId) {
      loadPestData();
    }
  }, [planId]);

  // Calcular puntuaciones y conclusiones
  const calculateScores = (newResponses = responses) => {
    const newScores = { social: 0, politico: 0, economico: 0, tecnologico: 0, ambiental: 0 };
    
    PEST_QUESTIONS.forEach(q => {
      if (newResponses[q.number] !== undefined) {
        newScores[q.category] += newResponses[q.number];
      }
    });

    setScores(newScores);

    // Calcular conclusiones (escala 0-100)
    const newConclusions = {};
    Object.entries(newScores).forEach(([category, score]) => {
      const percentage = (score / 5) * 100; // 5 preguntas por categoría, escala 0-4
      newConclusions[category] = percentage <= 70 ? 'low' : 'high';
    });
    setConclusions(newConclusions);
  };

  // Manejar cambio de respuesta
  const handleResponseChange = (questionNumber, value) => {
    const newResponses = { ...responses, [questionNumber]: parseInt(value) };
    setResponses(newResponses);
    calculateScores(newResponses);
  };

  // Agregar oportunidad
  const addOpportunity = () => {
    setOpportunities([...opportunities, { opportunity_text: '', order_position: opportunities.length }]);
  };

  // Actualizar oportunidad
  const updateOpportunity = (index, text) => {
    const newOpportunities = [...opportunities];
    newOpportunities[index].opportunity_text = text;
    setOpportunities(newOpportunities);
  };

  // Eliminar oportunidad
  const removeOpportunity = (index) => {
    const newOpportunities = opportunities.filter((_, i) => i !== index);
    setOpportunities(newOpportunities);
  };

  // Agregar amenaza
  const addThreat = () => {
    setThreats([...threats, { threat_text: '', order_position: threats.length }]);
  };

  // Actualizar amenaza
  const updateThreat = (index, text) => {
    const newThreats = [...threats];
    newThreats[index].threat_text = text;
    setThreats(newThreats);
  };

  // Eliminar amenaza
  const removeThreat = (index) => {
    const newThreats = threats.filter((_, i) => i !== index);
    setThreats(newThreats);
  };

  // Guardar datos
  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      const pestData = {
        responses: PEST_QUESTIONS
          .filter(q => responses[q.number] !== undefined)
          .map(q => ({
            question_number: q.number,
            category: q.category,
            response_value: responses[q.number]
          })),
        opportunities: opportunities.map((o, idx) => ({
          opportunity_text: o.opportunity_text,
          order_position: idx
        })),
        threats: threats.map((t, idx) => ({
          threat_text: t.threat_text,
          order_position: idx
        }))
      };

      await plansAPI.createOrUpdatePestAnalysis(planId, pestData);
      
      success('Análisis PEST guardado exitosamente');
      if (onSave) onSave();
    } catch (err) {
      error('Error al guardar análisis PEST');
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="p-6 text-center">Cargando análisis PEST...</div>;
  }

  // Datos para gráfico
  const chartData = [
    { name: 'Social', value: (scores.social / 5) * 100 },
    { name: 'Político', value: (scores.politico / 5) * 100 },
    { name: 'Económico', value: (scores.economico / 5) * 100 },
    { name: 'Tecnológico', value: (scores.tecnologico / 5) * 100 },
    { name: 'Ambiental', value: (scores.ambiental / 5) * 100 }
  ];

  // Agrupar preguntas por categoría
  const questionsByCategory = PEST_QUESTIONS.reduce((acc, q) => {
    if (!acc[q.category]) acc[q.category] = [];
    acc[q.category].push(q);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Título */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Análisis Externo PEST</h2>
        <p className="text-sm text-gray-600 mt-1">
          Marque la opción que mejor se ajuste a su valoración para cada afirmación.
        </p>
      </div>

      {/* Formulario de Preguntas */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6">
          {/* Encabezado de la tabla */}
          <div className="grid grid-cols-12 gap-2 mb-4 pb-4 border-b border-gray-200">
            <div className="col-span-6 font-semibold text-gray-700 text-sm">Afirmación</div>
            <div className="col-span-1 text-center text-xs font-semibold text-gray-700">Desacuerdo<span className="block text-gray-500">(0)</span></div>
            <div className="col-span-1 text-center text-xs font-semibold text-gray-700">No acuerdo<span className="block text-gray-500">(1)</span></div>
            <div className="col-span-1 text-center text-xs font-semibold text-gray-700">Acuerdo<span className="block text-gray-500">(2)</span></div>
            <div className="col-span-1 text-center text-xs font-semibold text-gray-700">Bastante<span className="block text-gray-500">(3)</span></div>
            <div className="col-span-1 text-center text-xs font-semibold text-gray-700">Total<span className="block text-gray-500">(4)</span></div>
          </div>

          {/* Preguntas por categoría */}
          {Object.entries(questionsByCategory).map(([category, questions]) => (
            <div key={category}>
              <h3 className="text-lg font-bold text-blue-900 mt-6 mb-3 pb-2 border-b-2 border-gray-200">
                {CATEGORY_LABELS[category].toUpperCase()}
              </h3>
              {questions.map(q => (
                <div key={q.number} className="grid grid-cols-12 gap-2 items-center py-3 border-b border-gray-100 hover:bg-gray-50 px-2 rounded">
                  <div className="col-span-6 text-sm text-gray-800">{q.number}. {q.text}</div>
                  {[0, 1, 2, 3, 4].map(value => (
                    <div key={value} className="col-span-1 text-center">
                      <input
                        type="radio"
                        name={`pest_${q.number}`}
                        value={value}
                        checked={responses[q.number] === value}
                        onChange={(e) => handleResponseChange(q.number, e.target.value)}
                        className="h-5 w-5 text-blue-500 border-gray-300 focus:ring-blue-500 cursor-pointer"
                      />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Gráfico de Impacto */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Gráfico de Impacto PEST (0-100)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis domain={[0, 100]} />
            <Tooltip formatter={(value) => `${Math.round(value)}%`} />
            <Bar dataKey="value" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Conclusiones */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Conclusiones por Factor</h3>
        
        {Object.entries(CATEGORY_LABELS).map(([category, label]) => (
          <div key={category} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <strong className="text-blue-900">{label}:</strong>
            <p className={`text-sm mt-1 ${conclusions[category] === 'high' ? 'text-red-600' : 'text-green-600'}`}>
              {CONCLUSION_TEXT[category][conclusions[category] || 'low']}
            </p>
          </div>
        ))}
      </div>

      {/* Oportunidades y Amenazas */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <p className="text-sm text-gray-600 mb-6">
          A partir de la conclusión obtenida, determine las oportunidades y amenazas más relevantes.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Oportunidades */}
          <div>
            <h4 className="font-semibold text-lg text-blue-900 mb-3 bg-blue-50 border border-blue-200 rounded py-2 px-3">
              OPORTUNIDADES
            </h4>
            <div className="space-y-2">
              {opportunities.map((opp, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="font-semibold text-gray-700 min-w-fit">O{idx + 1}:</span>
                  <input
                    type="text"
                    value={opp.opportunity_text}
                    onChange={(e) => updateOpportunity(idx, e.target.value)}
                    placeholder="Descripción de la oportunidad"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    onClick={() => removeOpportunity(idx)}
                    className="text-red-500 hover:text-red-700 p-1"
                  >
                    <X size={20} />
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={addOpportunity}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium mt-3 flex items-center gap-1"
            >
              <Plus size={16} /> Añadir oportunidad
            </button>
          </div>

          {/* Amenazas */}
          <div>
            <h4 className="font-semibold text-lg text-blue-900 mb-3 bg-red-50 border border-red-200 rounded py-2 px-3">
              AMENAZAS
            </h4>
            <div className="space-y-2">
              {threats.map((threat, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="font-semibold text-gray-700 min-w-fit">A{idx + 1}:</span>
                  <input
                    type="text"
                    value={threat.threat_text}
                    onChange={(e) => updateThreat(idx, e.target.value)}
                    placeholder="Descripción de la amenaza"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    onClick={() => removeThreat(idx)}
                    className="text-red-500 hover:text-red-700 p-1"
                  >
                    <X size={20} />
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={addThreat}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium mt-3 flex items-center gap-1"
            >
              <Plus size={16} /> Añadir amenaza
            </button>
          </div>
        </div>
      </div>

      {/* Botón Guardar */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300"
        >
          <Save size={20} />
          {isSaving ? 'Guardando...' : 'Guardar Análisis PEST'}
        </button>
      </div>
    </div>
  );
}
