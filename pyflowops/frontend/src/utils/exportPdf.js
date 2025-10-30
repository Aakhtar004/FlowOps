import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

/**
 * Exporta un elemento DOM a PDF, paginando automáticamente a formato A4.
 * @param {HTMLElement} element - Contenedor del resumen a exportar
 * @param {Object} options - Opciones de exportación
 * @param {string} options.filename - Nombre del archivo PDF
 * @param {number} options.margin - Margen en mm
 */
export async function exportElementToPdf(element, { filename = 'resumen-ejecutivo.pdf', margin = 10 } = {}) {
  if (!element) {
    console.error('exportElementToPdf: element is null')
    return
  }
  // A4 en mm
  const pageWidth = 210
  const pageHeight = 297
  const pdf = new jsPDF('p', 'mm', 'a4')

  // Renderizar el elemento a canvas
  const canvas = await html2canvas(element, {
    scale: 2, // mayor resolución para texto legible
    useCORS: true,
    allowTaint: false, // evitar canvas "tainted" por imágenes externas
    logging: false,
    windowWidth: element.scrollWidth,
    windowHeight: element.scrollHeight,
  })

  const imgData = canvas.toDataURL('image/png')
  const imgWidth = pageWidth - margin * 2
  const imgHeight = (canvas.height * imgWidth) / canvas.width

  let position = margin
  let remainingHeight = imgHeight

  // Añadir páginas según sea necesario
  pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight)
  remainingHeight -= (pageHeight - margin * 2)

  while (remainingHeight > 0) {
    pdf.addPage()
    position = margin - remainingHeight // desplazar para mostrar el resto
    pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight)
    remainingHeight -= (pageHeight - margin * 2)
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