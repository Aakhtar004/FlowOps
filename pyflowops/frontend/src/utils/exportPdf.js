import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

/**
 * Exporta un elemento DOM a PDF, respetando los componentes y evitando cortes.
 * @param {HTMLElement} element - Contenedor del resumen a exportar
 * @param {Object} options - Opciones de exportación
 * @param {string} options.filename - Nombre del archivo PDF
 * @param {number} options.margin - Margen en mm
 * @param {string} options.componentSelector - Selector CSS para identificar componentes individuales
 */
export async function exportElementToPdf(element, { 
  filename = 'resumen-ejecutivo.pdf', 
  margin = 10,
  componentSelector = '.space-y-6 > *' // Selector por defecto para secciones
} = {}) {
  if (!element) {
    console.error('exportElementToPdf: element is null')
    return
  }
  
  // A4 en mm
  const pageWidth = 210
  const pageHeight = 297
  const pageContentHeight = pageHeight - margin * 2
  const pdf = new jsPDF('p', 'mm', 'a4')
  
  // Obtener todos los componentes/secciones a renderizar
  const components = Array.from(element.querySelectorAll(componentSelector))
  
  if (components.length === 0) {
    // Si no hay componentes con ese selector, usar el elemento completo
    console.warn('No se encontraron componentes. Exportando elemento completo.')
    return exportElementAsWhole(element, { filename, margin })
  }

  let currentY = margin
  let isFirstPage = true

  for (const component of components) {
    // Renderizar cada componente individualmente
    const canvas = await html2canvas(component, {
      scale: 2,
      useCORS: true,
      allowTaint: false,
      logging: false,
      windowWidth: component.scrollWidth,
      windowHeight: component.scrollHeight,
    })

    const imgData = canvas.toDataURL('image/png')
    const imgWidth = pageWidth - margin * 2
    const imgHeight = (canvas.height * imgWidth) / canvas.width

    // Si el componente no cabe en el espacio restante, crear nueva página
    if (!isFirstPage && currentY + imgHeight > pageHeight - margin) {
      pdf.addPage()
      currentY = margin
    }

    // Añadir imagen del componente
    pdf.addImage(imgData, 'PNG', margin, currentY, imgWidth, imgHeight, undefined, 'FAST')
    
    // Actualizar posición Y para el siguiente componente
    currentY += imgHeight + 5 // 5mm de espacio entre componentes
    isFirstPage = false

    // Si después de agregar este componente no hay espacio para más, preparar nueva página
    if (currentY > pageHeight - margin - 20) { // 20mm mínimo para siguiente componente
      pdf.addPage()
      currentY = margin
    }
  }

  pdf.save(filename)
}

/**
 * Función auxiliar para exportar como imagen completa (fallback)
 */
async function exportElementAsWhole(element, { filename, margin }) {
  const pageWidth = 210
  const pageHeight = 297
  const pageContentHeight = pageHeight - margin * 2
  const pdf = new jsPDF('p', 'mm', 'a4')

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    allowTaint: false,
    logging: false,
    windowWidth: element.scrollWidth,
    windowHeight: element.scrollHeight,
  })

  const imgData = canvas.toDataURL('image/png')
  const imgWidth = pageWidth - margin * 2
  const imgHeight = (canvas.height * imgWidth) / canvas.width

  let yOffset = 0

  // Primera página
  pdf.addImage(imgData, 'PNG', margin, margin, imgWidth, imgHeight, undefined, 'FAST')
  yOffset += pageContentHeight

  // Añadir páginas adicionales si el contenido es más alto que una página
  while (yOffset < imgHeight) {
    pdf.addPage()
    const yPosition = margin - yOffset
    pdf.addImage(imgData, 'PNG', margin, yPosition, imgWidth, imgHeight, undefined, 'FAST')
    yOffset += pageContentHeight
  }

  pdf.save(filename)
}

/**
 * Helper para exportar usando un selector CSS del contenedor.
 */
export async function exportBySelector(selector, options) {
  const el = document.querySelector(selector)
  return exportElementToPdf(el, options)
}