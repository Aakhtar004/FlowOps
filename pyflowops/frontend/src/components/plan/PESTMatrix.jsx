import React, { useState } from 'react';

const pestStatements = [
  'Los cambios en la composición étnica de los consumidores de nuestro sector.',
  'El envejecimiento de la población tiene un importante impacto en la demanda.',
  'Los nuevos estilos de vida y tendencias originan cambios en la oferta de nuestro sector.',
  'El envejecimiento de la población tiene un importante impacto en la oferta del sector donde operamos.',
  'Las variaciones en el nivel de riqueza de la población impactan considerablemente en la demanda de los productos/servicios del sector donde operamos.',
  'La legislación fiscal afecta muy considerablemente a la economía de las empresas del sector donde operamos.',
  'La legislación laboral afecta muy considerablemente a la operatividad del sector donde actuamos.',
  'Las subvenciones otorgadas por las Administraciones Públicas son claves en el desarrollo competitivo del mercado donde operamos.',
  'El impacto que tiene la legislación de protección al consumidor, en la manera de producir bienes y servicios es muy importante.',
  'La normativa biomédica tiene un impacto considerable en el funcionamiento del sector donde actuamos.',
  'Las expectativas de crecimiento económico generales afectan considerablemente al sector donde trabajamos.',
  'La política de tipos de interés es fundamental en el desarrollo económico del sector donde trabaja nuestra empresa.',
  'La globalización permite a nuestra industria gozar de importantes oportunidades en nuevos mercados.',
  'La situación del empleo es fundamental para el desarrollo económico de nuestra empresa y nuestro sector.',
  'Las expectativas del ciclo económico de nuestro sector impactan en la situación económica de sus empresas.',
  'Las Administraciones Públicas están incentivando el esfuerzo tecnológico de las empresas de nuestro sector.',
  'Internet, el comercio electrónico, el wireless y otras NTIC están impactando en la demanda de nuestros productos/servicios y en los de la competencia.',
  'El empleo de NTIC’s es generalizado en el sector donde trabajamos.',
  'En nuestro sector, es de gran importancia ser pionero o referente en el empleo de aplicaciones tecnológicas.',
  'En el sector donde operamos, para ser competitivos, es condición "sine qua non" innovar constantemente.',
  'La legislación medioambiental afecta al desarrollo de nuestro sector.',
  'Los clientes de nuestro mercado exigen que se seamos socialmente responsables, en el plano medioambiental.',
  'En nuestro sector, la políticas medioambientales son una fuente de ventajas competitivas.',
  'La creciente preocupación social por el medio ambiente impacta en la demanda de productos/servicios ofertados en nuestro mercado.',
  'El factor ecológico es una fuente de diferenciación clara en el sector donde opera nuestra empresa.'
];

const pestColumns = [
  { label: 'En total desacuerdo', value: 0 },
  { label: 'No está de acuerdo', value: 1 },
  { label: 'Está de acuerdo', value: 2 },
  { label: 'Está bastante de acuerdo', value: 3 },
  { label: 'En total acuerdo', value: 4 }
];

const PESTMatrix = () => {
  const [values, setValues] = useState(Array(pestStatements.length).fill(null));

  const handleChange = (idx, val) => {
    const updated = [...values];
    updated[idx] = val;
    setValues(updated);
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Autodiagnóstico Entorno Global P.E.S.T.</h3>
        <p className="card-description">Marca una opción por fila según el nivel de acuerdo (0-4).</p>
      </div>
      <div className="card-content overflow-x-auto">
        <table className="min-w-full border text-sm">
          <thead>
            <tr className="bg-cyan-200">
              <th className="border px-2 py-1 text-left">AUTODIAGNÓSTICO ENTORNO GLOBAL P.E.S.T.</th>
              {pestColumns.map(col => (
                <th key={col.value} className="border px-2 py-1 text-center">{col.label}<br />{col.value}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pestStatements.map((text, idx) => (
              <tr key={idx} className={idx % 2 === 0 ? 'bg-cyan-50' : ''}>
                <td className="border px-2 py-1 align-top">{text}</td>
                {pestColumns.map(col => (
                  <td key={col.value} className="border px-2 py-1 text-center">
                    <input
                      type="radio"
                      name={`row-${idx}`}
                      value={col.value}
                      checked={values[idx] === col.value}
                      onChange={() => handleChange(idx, col.value)}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PESTMatrix;
