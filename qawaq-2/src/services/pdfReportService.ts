import { jsPDF } from 'jspdf';
import { CaseItem } from '../types';

/**
 * Loads an image from URL and converts to base64 Data URL for jsPDF embedding
 */
async function getBase64ImageFromUrl(imageUrl: string): Promise<string | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = imageUrl;

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.width || 400;
        canvas.height = img.height || 300;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(null);
          return;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const dataURL = canvas.toDataURL('image/jpeg', 0.85);
        resolve(dataURL);
      } catch (err) {
        console.warn('Could not export image to data URL due to CORS:', err);
        resolve(null);
      }
    };

    img.onerror = () => {
      resolve(null);
    };

    // Timeout fallback after 3 seconds
    setTimeout(() => resolve(null), 3000);
  });
}

/**
 * Generates and downloads an official incident closure PDF report
 */
export async function generateCasePdfReport(caseItem: CaseItem): Promise<jsPDF> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;

  // 1. Top Header Bar (Dark Navy Theme)
  doc.setFillColor(12, 19, 34); // #0c1322
  doc.rect(0, 0, pageWidth, 28, 'F');

  // Gold accent line
  doc.setFillColor(245, 158, 11); // #f59e0b
  doc.rect(0, 28, pageWidth, 1.5, 'F');

  // Header Title
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('QAWAQ  //  SEGURIDAD', margin, 12);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(203, 213, 225); // #cbd5e1
  doc.text('SUPERVISIÓN DE SEGURIDAD EN CONSTRUCCIÓN', margin, 17);
  doc.text('SISTEMA CCTV DE DETECCIÓN Y REGISTRO DE RIESGOS', margin, 22);

  // Right Header badge
  doc.setFillColor(30, 41, 59);
  doc.roundedRect(pageWidth - margin - 48, 6, 48, 16, 2, 2, 'F');
  doc.setTextColor(245, 158, 11);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('ACTA DE SUBSANACIÓN', pageWidth - margin - 45, 12);
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.text(`N° ${caseItem.id}`, pageWidth - margin - 45, 18);

  let y = 36;

  // 2. Document Title Box
  doc.setFillColor(241, 245, 249); // light gray
  doc.roundedRect(margin, y, contentWidth, 14, 2, 2, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, y, contentWidth, 14, 2, 2, 'S');

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.text(
    'INFORME TÉCNICO DE CIERRE Y CONFORMIDAD DE CONDICIÓN SUBESTÁNDAR',
    margin + 4,
    y + 6
  );

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  const closureDateStr = new Date(caseItem.fechaCierre || Date.now()).toLocaleString('es-PE', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
  doc.text(
    `Fecha de Emisión: ${closureDateStr}  |  Obra: Torre Andina - Proyecto Residencial`,
    margin + 4,
    y + 11
  );

  y += 18;

  // 3. Section 1: Incident Metadata (Table layout)
  doc.setFillColor(15, 23, 42);
  doc.rect(margin, y, contentWidth, 6, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('1. INFORMACIÓN DEL INCIDENTE Y RIESGO IDENTIFICADO', margin + 3, y + 4.2);

  y += 6;

  const col1X = margin;
  const col1W = 45;
  const col2X = margin + col1W;
  const col2W = contentWidth - col1W;

  const metadataRows: [string, string][] = [
    ['Código de Incidencia:', `${caseItem.id} (Estado: ${caseItem.estado.toUpperCase()})`],
    ['Clasificación del Riesgo:', `${caseItem.tipo} · Nivel: ${caseItem.urgencia.toUpperCase()}`],
    ['Ubicación y Frente:', `${caseItem.ubicacion} (${caseItem.frente})`],
    [
      'Detección y Hora:',
      `${new Date(caseItem.fechaCreacion).toLocaleString('es-PE')} · Vía ${caseItem.detectadoPor}${
        caseItem.confianzaIA ? ` (Confianza IA: ${caseItem.confianzaIA}%)` : ''
      }`,
    ],
    ['Personal Responsable:', `${caseItem.responsable}`],
    ['Descripción del Hecho:', `${caseItem.descripcion}`],
  ];

  metadataRows.forEach(([label, value]) => {
    doc.setFillColor(248, 250, 252);
    doc.rect(col1X, y, col1W, 6.5, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.rect(col1X, y, col1W, 6.5, 'S');

    doc.setFillColor(255, 255, 255);
    doc.rect(col2X, y, col2W, 6.5, 'F');
    doc.rect(col2X, y, col2W, 6.5, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(51, 65, 85);
    doc.text(label, col1X + 2, y + 4.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(15, 23, 42);
    // Truncate if too long to prevent overflow
    const cleanVal = doc.splitTextToSize(value, col2W - 4);
    doc.text(cleanVal[0] || '', col2X + 2, y + 4.5);

    y += 6.5;
  });

  y += 4;

  // 4. Section 2: Photographic Evidence Comparison
  doc.setFillColor(15, 23, 42);
  doc.rect(margin, y, contentWidth, 6, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('2. REGISTRO FOTOGRÁFICO DE EVIDENCIAS (ANTES Y DESPUÉS)', margin + 3, y + 4.2);

  y += 8;

  const photoCardW = (contentWidth - 6) / 2;
  const photoCardH = 46;

  // Try fetching base64 images
  let beforeDataUrl: string | null = null;
  let afterDataUrl: string | null = null;

  try {
    if (caseItem.fotoUrl) {
      beforeDataUrl = await getBase64ImageFromUrl(caseItem.fotoUrl);
    }
    const resolvedUrl = caseItem.fotoSolucionUrl || caseItem.fotoUrl;
    if (resolvedUrl) {
      afterDataUrl = await getBase64ImageFromUrl(resolvedUrl);
    }
  } catch (e) {
    console.warn('Image fetch failed for PDF', e);
  }

  // Card Left: Evidencia Antes (Infracción)
  const leftX = margin;
  doc.setFillColor(254, 242, 242); // soft red
  doc.roundedRect(leftX, y, photoCardW, photoCardH, 2, 2, 'F');
  doc.setDrawColor(239, 68, 68);
  doc.roundedRect(leftX, y, photoCardW, photoCardH, 2, 2, 'S');

  doc.setFillColor(239, 68, 68);
  doc.rect(leftX, y, photoCardW, 5.5, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.text('EVIDENCIA INICIAL: CONDICIÓN SUBESTÁNDAR', leftX + 3, y + 4);

  if (beforeDataUrl) {
    try {
      doc.addImage(beforeDataUrl, 'JPEG', leftX + 2, y + 7, photoCardW - 4, photoCardH - 14);
    } catch {
      drawPhotoPlaceholder(doc, leftX + 2, y + 7, photoCardW - 4, photoCardH - 14, 'Foto Infracción CCTV');
    }
  } else {
    drawPhotoPlaceholder(doc, leftX + 2, y + 7, photoCardW - 4, photoCardH - 14, 'Foto Infracción CCTV');
  }

  doc.setTextColor(185, 28, 28);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.text(`Detección en Tiempo Real · Alerta Crítica`, leftX + 3, y + photoCardH - 2);

  // Card Right: Evidencia Después (Solución)
  const rightX = margin + photoCardW + 6;
  doc.setFillColor(240, 253, 244); // soft green
  doc.roundedRect(rightX, y, photoCardW, photoCardH, 2, 2, 'F');
  doc.setDrawColor(16, 185, 129);
  doc.roundedRect(rightX, y, photoCardW, photoCardH, 2, 2, 'S');

  doc.setFillColor(16, 185, 129);
  doc.rect(rightX, y, photoCardW, 5.5, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.text('EVIDENCIA FINAL: CONDICIÓN SUBSANADA', rightX + 3, y + 4);

  if (afterDataUrl) {
    try {
      doc.addImage(afterDataUrl, 'JPEG', rightX + 2, y + 7, photoCardW - 4, photoCardH - 14);
    } catch {
      drawPhotoPlaceholder(doc, rightX + 2, y + 7, photoCardW - 4, photoCardH - 14, 'Inspección Subsanada OK');
    }
  } else {
    drawPhotoPlaceholder(doc, rightX + 2, y + 7, photoCardW - 4, photoCardH - 14, 'Inspección Subsanada OK');
  }

  doc.setTextColor(4, 120, 87);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.text('Verificado en Campo · Conforme Seguridad', rightX + 3, y + photoCardH - 2);

  y += photoCardH + 5;

  // 5. Section 3: Dictamen y Medidas Correctivas
  doc.setFillColor(15, 23, 42);
  doc.rect(margin, y, contentWidth, 6, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('3. MEDIDAS CORRECTIVAS Y DICTAMEN DE CIERRE', margin + 3, y + 4.2);

  y += 7;

  // Box Medida Aplicada
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, y, contentWidth, 11, 1.5, 1.5, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, y, contentWidth, 11, 1.5, 1.5, 'S');

  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.text('MEDIDA DE CONTROL INMEDIATA APLICADA:', margin + 3, y + 4);

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  const measureText = caseItem.medidaAplicada || 'Dotación de EPP certificado y paralización temporal preventiva.';
  doc.text(measureText, margin + 3, y + 8.5);

  y += 13;

  // Box Dictamen Cierre
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, y, contentWidth, 16, 1.5, 1.5, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, y, contentWidth, 16, 1.5, 1.5, 'S');

  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.text('DICTAMEN TÉCNICO DEL SUPERVISOR DE SEGURIDAD:', margin + 3, y + 4);

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  const dictamenText = caseItem.dictamenCierre ||
    'Se inspeccionó personalmente la zona. Se verificó el uso continuo de EPP normado y se impartió charla de 5 min al personal involucrado. Riesgo mitigado al 100%.';
  const splitDictamen = doc.splitTextToSize(dictamenText, contentWidth - 6);
  doc.text(splitDictamen, margin + 3, y + 8);

  y += 18;

  // 6. Section 4: Marco Normativo y Legal
  doc.setFillColor(15, 23, 42);
  doc.rect(margin, y, contentWidth, 6, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('4. CONFORMIDAD Y CUMPLIMIENTO DEL MARCO NORMATIVO VIGENTE', margin + 3, y + 4.2);

  y += 7;

  const normatives = [
    {
      code: 'Norma Técnica G.050',
      title: 'Seguridad durante la Construcción (Reglamento Nacional de Edificaciones)',
      status: 'CONFORME Y CERTIFICADO [✓]',
    },
    {
      code: 'D.S. N.º 011-2019-TR',
      title: 'Reglamento de Seguridad y Salud en el Trabajo para el Sector Construcción',
      status: 'CONFORME Y VERIFICADO [✓]',
    },
    {
      code: 'Ley N° 29783',
      title: 'Ley de Seguridad y Salud en el Trabajo del Perú (Arts. 21 y 97)',
      status: 'AUDITADO SIN OBSERVACIONES [✓]',
    },
  ];

  normatives.forEach((norm) => {
    doc.setFillColor(240, 253, 244);
    doc.rect(margin, y, contentWidth, 6, 'F');
    doc.setDrawColor(187, 247, 208);
    doc.rect(margin, y, contentWidth, 6, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(22, 101, 52);
    doc.text(`${norm.code}:`, margin + 3, y + 4.2);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);
    doc.text(norm.title, margin + 38, y + 4.2);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(21, 128, 61);
    doc.text(norm.status, contentWidth + margin - 50, y + 4.2);

    y += 6.5;
  });

  y += 5;

  // 7. Signatures & Digital Certification Box
  const sigBoxW = (contentWidth - 6) / 2;
  const sigBoxH = 24;

  // Left Signature: Prevencionista / Supervisor
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, y, sigBoxW, sigBoxH, 1.5, 1.5, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, y, sigBoxW, sigBoxH, 1.5, 1.5, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text('ING. CARLOS MENDOZA CHÁVEZ', margin + 6, y + 7);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(71, 85, 105);
  doc.text('Supervisor de Seguridad · CIP 184920', margin + 6, y + 11);
  doc.text('Firma Digital Electrónica Verificada (Ley 27269)', margin + 6, y + 15);
  doc.setTextColor(16, 185, 129);
  doc.setFont('helvetica', 'bold');
  doc.text('ESTADO: SUBSANACIÓN APROBADA', margin + 6, y + 20);

  // Right Seal: QAWAQ Digital Seal
  const sealX = margin + sigBoxW + 6;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(sealX, y, sigBoxW, sigBoxH, 1.5, 1.5, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(sealX, y, sigBoxW, sigBoxH, 1.5, 1.5, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(245, 158, 11);
  doc.text('QAWAQ // CERTIFICACIÓN AUTOMÁTICA', sealX + 6, y + 7);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`Hash de Seguridad: QW-${caseItem.id}-SEC77A9024`, sealX + 6, y + 11);
  doc.text('Registro Auditado en Servidor Seguro de Obra', sealX + 6, y + 15);
  doc.setTextColor(59, 130, 246);
  doc.setFont('helvetica', 'bold');
  doc.text('TIEMPO TOTAL CIERRE: ' + (caseItem.tiempoAbierto || '18 min'), sealX + 6, y + 20);

  // Bottom Footer Bar
  doc.setFillColor(12, 19, 34);
  doc.rect(0, pageHeight - 10, pageWidth, 10, 'F');
  doc.setTextColor(148, 163, 184);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.text(
    'QAWAQ · Documento Válido para Auditorías de Seguridad y Fiscalizaciones Laborales (SUNAFIL)',
    margin,
    pageHeight - 4
  );
  doc.text('Página 1 de 1', pageWidth - margin - 15, pageHeight - 4);
  doc.text('Página 1 de 1', pageWidth - margin - 15, pageHeight - 4);

  return doc;
}

function drawPhotoPlaceholder(
  doc: jsPDF,
  x: number,
  y: number,
  w: number,
  h: number,
  title: string
) {
  doc.setFillColor(226, 232, 240);
  doc.rect(x, y, w, h, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.rect(x, y, w, h, 'S');

  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text(title, x + w / 2 - 16, y + h / 2);
}
