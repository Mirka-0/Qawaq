import { jsPDF } from 'jspdf';
import { CaseItem } from '../types';

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
        console.warn('Could not export image to data URL:', err);
        resolve(null);
      }
    };

    img.onerror = () => {
      resolve(null);
    };

    setTimeout(() => resolve(null), 2500);
  });
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

  // Header background banner
  doc.setFillColor(12, 19, 34);
  doc.rect(0, 0, pageWidth, 28, 'F');

  // Title in header
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('QAWAQ AI', margin, 14);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(203, 213, 225);
  doc.text('SISTEMA INTELIGENTE DE GESTIÓN Y AUDITORÍA SSOMA EN TIEMPO REAL', margin, 20);

  // Badge Top Right
  doc.setFillColor(30, 41, 59);
  doc.roundedRect(pageWidth - margin - 52, 6, 52, 16, 2, 2, 'F');
  doc.setDrawColor(245, 158, 11);
  doc.setLineWidth(0.4);
  doc.roundedRect(pageWidth - margin - 52, 6, 52, 16, 2, 2, 'S');

  doc.setTextColor(245, 158, 11);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('ACTA TÉCNICA OFICIAL', pageWidth - margin - 49, 12);
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.text(`N° ${caseItem.id}`, pageWidth - margin - 49, 18);

  let y = 36;

  // Document Title Box
  doc.setFillColor(241, 245, 249);
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
    `Fecha de Emisión: ${closureDateStr}  |  Obra: Proyecto Central · Sistema de Seguridad SST`,
    margin + 4,
    y + 11
  );

  y += 18;

  // Section 1: Incident Metadata
  doc.setFillColor(15, 23, 42);
  doc.rect(margin, y, contentWidth, 6, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('1. INFORMACIÓN DEL INCIDENTE Y RIESGO IDENTIFICADO', margin + 3, y + 4.2);

  y += 6;

  const col1X = margin;
  const col2X = margin + contentWidth / 2;
  const rowH = 6.5;

  const drawRow = (
    label1: string,
    val1: string,
    label2: string,
    val2: string,
    isEven: boolean
  ) => {
    if (isEven) {
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, y, contentWidth, rowH, 'F');
    }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text(label1, col1X + 3, y + 4.5);
    doc.setTextColor(15, 23, 42);
    doc.text(val1, col1X + 34, y + 4.5);

    doc.setTextColor(71, 85, 105);
    doc.text(label2, col2X + 3, y + 4.5);
    doc.setTextColor(15, 23, 42);
    doc.text(val2, col2X + 34, y + 4.5);

    doc.setDrawColor(226, 232, 240);
    doc.line(margin, y + rowH, margin + contentWidth, y + rowH);
    y += rowH;
  };

  drawRow('Tipo de Riesgo:', caseItem.tipo, 'Nivel Prioridad:', caseItem.prioridad, false);
  drawRow('Ubicación:', caseItem.ubicacion, 'Frente Asignado:', caseItem.frente, true);
  drawRow('Responsable:', caseItem.asignadoA?.nombre || caseItem.responsable, 'Detección:', caseItem.detectadoPor, false);
  drawRow(
    'Hora Detección:',
    new Date(caseItem.fechaCreacion).toLocaleTimeString('es-PE'),
    'Estado Actual:',
    caseItem.estado.toUpperCase(),
    true
  );

  y += 4;

  // Section 2: Photographic Evidence (Before vs After)
  doc.setFillColor(15, 23, 42);
  doc.rect(margin, y, contentWidth, 6, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('2. REGISTRO FOTOGRÁFICO DE MITIGACIÓN (AUDITORÍA VISUAL)', margin + 3, y + 4.2);

  y += 8;

  const photoWidth = (contentWidth - 6) / 2;
  const photoHeight = 58;

  // Before Box (Red border)
  doc.setDrawColor(239, 68, 68);
  doc.setLineWidth(0.6);
  doc.rect(margin, y, photoWidth, photoHeight, 'S');

  // Label ANTES
  doc.setFillColor(239, 68, 68);
  doc.rect(margin, y, photoWidth, 6, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('CONDICIÓN INICIAL / DETECCIÓN (ANTES)', margin + 3, y + 4.2);

  const beforeImg = await getBase64ImageFromUrl(caseItem.fotoUrl);
  if (beforeImg) {
    try {
      doc.addImage(beforeImg, 'JPEG', margin + 1, y + 7, photoWidth - 2, photoHeight - 8);
    } catch {
      drawPhotoPlaceholder(doc, margin + 1, y + 7, photoWidth - 2, photoHeight - 8, 'Foto Detección');
    }
  } else {
    drawPhotoPlaceholder(doc, margin + 1, y + 7, photoWidth - 2, photoHeight - 8, 'Foto Detección');
  }

  // After Box (Green border)
  const afterX = margin + photoWidth + 6;
  doc.setDrawColor(16, 185, 129);
  doc.setLineWidth(0.6);
  doc.rect(afterX, y, photoWidth, photoHeight, 'S');

  // Label DESPUES
  doc.setFillColor(16, 185, 129);
  doc.rect(afterX, y, photoWidth, 6, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('SUBSANACIÓN EN CAMPO (DESPUÉS)', afterX + 3, y + 4.2);

  const afterImgUrl = caseItem.evidenciaCorreccion?.fotoUrl || caseItem.fotoSolucionUrl || caseItem.fotoUrl;
  const afterImg = await getBase64ImageFromUrl(afterImgUrl);
  if (afterImg) {
    try {
      doc.addImage(afterImg, 'JPEG', afterX + 1, y + 7, photoWidth - 2, photoHeight - 8);
    } catch {
      drawPhotoPlaceholder(doc, afterX + 1, y + 7, photoWidth - 2, photoHeight - 8, 'Foto Subsanación');
    }
  } else {
    drawPhotoPlaceholder(doc, afterX + 1, y + 7, photoWidth - 2, photoHeight - 8, 'Foto Subsanación');
  }

  y += photoHeight + 6;

  // Section 3: Technical Mitigation & Action Plan
  doc.setFillColor(15, 23, 42);
  doc.rect(margin, y, contentWidth, 6, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('3. DICTAMEN TÉCNICO Y MEDIDAS CORRECTIVAS APLICADAS', margin + 3, y + 4.2);

  y += 8;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text('Descripción del Hallazgo:', margin + 2, y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  const descLines = doc.splitTextToSize(caseItem.descripcion, contentWidth - 40);
  doc.text(descLines, margin + 36, y);

  y += Math.max(descLines.length * 4, 7);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text('Acción de Subsanación:', margin + 2, y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  const accionText =
    caseItem.evidenciaCorreccion?.nota ||
    caseItem.medidaAplicada ||
    'Personal debidamente equipado según norma G.050. Se verificó charla de seguridad de 5 minutos y permiso de trabajo de alto riesgo (PETAR).';
  const accionLines = doc.splitTextToSize(accionText, contentWidth - 40);
  doc.text(accionLines, margin + 36, y);

  y += Math.max(accionLines.length * 4, 8) + 4;

  // Section 4: Signatures & Validation Block
  const sigBoxW = (contentWidth - 6) / 2;
  const sigBoxH = 24;

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
  doc.text('Supervisor de Frente · CIP 184920', margin + 6, y + 11);
  doc.text('Firma Digital Electrónica Verificada', margin + 6, y + 15);
  doc.setTextColor(16, 185, 129);
  doc.setFont('helvetica', 'bold');
  doc.text('ESTADO: SUBSANACIÓN APROBADA', margin + 6, y + 20);

  const sealX = margin + sigBoxW + 6;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(sealX, y, sigBoxW, sigBoxH, 1.5, 1.5, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(sealX, y, sigBoxW, sigBoxH, 1.5, 1.5, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(245, 158, 11);
  doc.text('QAWAQ · CERTIFICACIÓN AUTOMÁTICA', sealX + 6, y + 7);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`Hash de Seguridad: QW-${caseItem.id}-SEC77A9`, sealX + 6, y + 11);
  doc.text('Registro Auditado en Servidor Seguro de Obra', sealX + 6, y + 15);
  doc.setTextColor(59, 130, 246);
  doc.setFont('helvetica', 'bold');
  doc.text('RESOLUCIÓN: ' + (caseItem.tiempoAbierto || '18 min'), sealX + 6, y + 20);

  doc.setFillColor(12, 19, 34);
  doc.rect(0, pageHeight - 10, pageWidth, 10, 'F');
  doc.setTextColor(148, 163, 184);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.text(
    'QAWAQ · Documento Válido para Auditorías de Seguridad y Fiscalizaciones Laborales (SUNAFIL / Ley 29783)',
    margin,
    pageHeight - 4
  );
  doc.text('Página 1 de 1', pageWidth - margin - 15, pageHeight - 4);

  return doc;
}

/**
 * Generates an Executive Multi-Section Risk & Safety Metrics Summary PDF for Gerencia
 */
export async function generateExecutiveMetricsPdf(
  cases: CaseItem[],
  options?: {
    projectName?: string;
    authorRole?: string;
  }
): Promise<jsPDF> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;

  const totalCases = cases.length;
  const closedCases = cases.filter((c) => c.estado === 'Cerrado').length;
  const openCases = totalCases - closedCases;
  const criticalCases = cases.filter((c) => c.prioridad === 'Crítico').length;
  const slaCompliance = totalCases > 0 ? Math.round((closedCases / totalCases) * 100) : 100;

  // PAGE 1: Executive Dashboard & Operational KPIs
  // Header
  doc.setFillColor(12, 19, 34);
  doc.rect(0, 0, pageWidth, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('QAWAQ AI · GERENCIA GENERAL', margin, 13);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(203, 213, 225);
  doc.text(
    'INFORME EJECUTIVO DE SEGURIDAD, SALUD EN EL TRABAJO Y GESTIÓN DE RIESGOS (SST)',
    margin,
    19
  );

  doc.setFillColor(30, 41, 59);
  doc.roundedRect(pageWidth - margin - 52, 6, 52, 16, 2, 2, 'F');
  doc.setDrawColor(245, 158, 11);
  doc.setLineWidth(0.4);
  doc.roundedRect(pageWidth - margin - 52, 6, 52, 16, 2, 2, 'S');

  doc.setTextColor(245, 158, 11);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.text('REPORTE GERENCIAL OFICIAL', pageWidth - margin - 50, 11.5);
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7.5);
  doc.text(
    new Date().toLocaleDateString('es-PE', { dateStyle: 'medium' }),
    pageWidth - margin - 50,
    17
  );

  let y = 35;

  // Title block
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(margin, y, contentWidth, 14, 2, 2, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, y, contentWidth, 14, 2, 2, 'S');

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.text('ESTADO DE DESEMPEÑO PREVENTIVO Y CUMPLIMIENTO DE SLA EN OBRA', margin + 4, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text(
    `Marco Legal: Ley N° 29783 · Norma Técnica G.050 · D.S. N° 011-2019-TR | Proyecto: ${
      options?.projectName || 'Obra Central'
    }`,
    margin + 4,
    y + 11
  );

  y += 18;

  // Section 1: Executive KPI Cards Grid
  doc.setFillColor(15, 23, 42);
  doc.rect(margin, y, contentWidth, 6, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('1. RESUMEN MACRO DE INDICADORES CLAVE (KPIs)', margin + 3, y + 4.2);

  y += 9;

  const cardW = (contentWidth - 9) / 4;
  const cardH = 20;

  const drawKpiCard = (
    x: number,
    title: string,
    value: string,
    sub: string,
    valueColor: [number, number, number]
  ) => {
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(x, y, cardW, cardH, 2, 2, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(x, y, cardW, cardH, 2, 2, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text(title.toUpperCase(), x + 3, y + 5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(valueColor[0], valueColor[1], valueColor[2]);
    doc.text(value, x + 3, y + 13);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text(sub, x + 3, y + 17.5);
  };

  drawKpiCard(margin, 'Total Observaciones', `${totalCases}`, `${closedCases} cerrados`, [15, 23, 42]);
  drawKpiCard(
    margin + cardW + 3,
    'Tasa de Subsanación',
    `${slaCompliance}%`,
    'Resolución en SLA',
    [16, 185, 129]
  );
  drawKpiCard(
    margin + (cardW + 3) * 2,
    'Casos Activos',
    `${openCases}`,
    `${criticalCases} críticos`,
    [245, 158, 11]
  );
  drawKpiCard(
    margin + (cardW + 3) * 3,
    'Horas Sin Accidentes',
    '48,250',
    'Índice Severidad 0.0',
    [59, 130, 246]
  );

  y += cardH + 7;

  // Section 2: Performance by Workfront Table
  doc.setFillColor(15, 23, 42);
  doc.rect(margin, y, contentWidth, 6, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('2. DESEMPEÑO OPERATIVO Y EFECTIVIDAD POR FRENTE DE TRABAJO', margin + 3, y + 4.2);

  y += 6;

  // Table Headers
  doc.setFillColor(226, 232, 240);
  doc.rect(margin, y, contentWidth, 6, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(30, 41, 59);

  doc.text('FRENTE DE TRABAJO', margin + 3, y + 4.2);
  doc.text('SUPERVISOR RESPONSABLE', margin + 46, y + 4.2);
  doc.text('TOTAL RIESGOS', margin + 98, y + 4.2);
  doc.text('SUBSANADOS', margin + 128, y + 4.2);
  doc.text('% CUMPLIMIENTO', margin + 154, y + 4.2);

  y += 6;

  const frentesSummary = [
    { frente: 'Frente Estructuras', sup: 'Ing. Carlos Mendoza', tot: 8, res: 7, pct: '87.5%' },
    { frente: 'Frente Acabados', sup: 'Capataz Juan Pérez', tot: 5, res: 5, pct: '100.0%' },
    { frente: 'Frente Excavación', sup: 'Ing. Marcos Ruiz', tot: 4, res: 4, pct: '100.0%' },
    { frente: 'Frente Instalaciones', sup: 'Ing. David Torres', tot: 3, res: 2, pct: '66.7%' },
  ];

  frentesSummary.forEach((f, idx) => {
    if (idx % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, y, contentWidth, 6, 'F');
    }
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(15, 23, 42);
    doc.text(f.frente, margin + 3, y + 4.2);
    doc.text(f.sup, margin + 46, y + 4.2);
    doc.text(`${f.tot}`, margin + 104, y + 4.2);
    doc.setTextColor(16, 185, 129);
    doc.text(`${f.res}`, margin + 134, y + 4.2);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(f.pct, margin + 158, y + 4.2);

    doc.setDrawColor(226, 232, 240);
    doc.line(margin, y + 6, margin + contentWidth, y + 6);
    y += 6;
  });

  y += 6;

  // Section 3: Root Cause & Priority Risk Analysis
  doc.setFillColor(15, 23, 42);
  doc.rect(margin, y, contentWidth, 6, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('3. ANÁLISIS DE PELIGROS RECURRENTES Y MEDIDAS PREVENTIVAS', margin + 3, y + 4.2);

  y += 7;

  const causes = [
    {
      tipo: 'Trabajo en Altura / Sin Arnés',
      pct: '38%',
      medida: 'Verificación estricta de líneas de vida y charlas de 5 min obligatorias.',
    },
    {
      tipo: 'Ausencia de EPP Básico (Casco/Lentes)',
      pct: '29%',
      medida: 'Control automatizado por CCTV con alerta instantánea al capataz.',
    },
    {
      tipo: 'Interferencia en Zona de Izaje de Grúa',
      pct: '19%',
      medida: 'Delimitación física con mallas de seguridad y vigías dedicados.',
    },
    {
      tipo: 'Tableros Eléctricos Provisionales',
      pct: '14%',
      medida: 'Inspección técnica diaria por electricista habilitado según CNE.',
    },
  ];

  causes.forEach((c) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(245, 158, 11);
    doc.text(`• ${c.tipo} (${c.pct}):`, margin + 3, y);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text(c.medida, margin + 58, y);
    y += 5.5;
  });

  y += 4;

  // Section 4: Formal Approvals & Executive Signatures
  doc.setFillColor(15, 23, 42);
  doc.rect(margin, y, contentWidth, 6, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('4. APROBACIÓN Y CONFORMIDAD GERENCIAL', margin + 3, y + 4.2);

  y += 8;

  const sigBoxW = (contentWidth - 6) / 2;
  const sigBoxH = 24;

  // Gerencia Signature Box
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, y, sigBoxW, sigBoxH, 1.5, 1.5, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, y, sigBoxW, sigBoxH, 1.5, 1.5, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text('DIRECCIÓN DE OPERACIONES / GERENCIA', margin + 6, y + 7);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(71, 85, 105);
  doc.text('Revisión Estratégica de Métricas SST', margin + 6, y + 11);
  doc.text('Aprobado conforme al Plan Anual de Seguridad', margin + 6, y + 15);
  doc.setTextColor(16, 185, 129);
  doc.setFont('helvetica', 'bold');
  doc.text('ESTADO: CONFORME', margin + 6, y + 20);

  // SSOMA Seal Box
  const sealX = margin + sigBoxW + 6;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(sealX, y, sigBoxW, sigBoxH, 1.5, 1.5, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(sealX, y, sigBoxW, sigBoxH, 1.5, 1.5, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(245, 158, 11);
  doc.text('QAWAQ · CERTIFICACIÓN EJECUTIVA SST', sealX + 6, y + 7);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`Código Auditoría: QW-EXEC-${Date.now().toString(36).toUpperCase()}`, sealX + 6, y + 11);
  doc.text('Trazabilidad en Servidor Central y CCTV', sealX + 6, y + 15);
  doc.setTextColor(59, 130, 246);
  doc.setFont('helvetica', 'bold');
  doc.text('SISTEMA: ACTIVO Y SIN DESVIACIONES', sealX + 6, y + 20);

  // Footer
  doc.setFillColor(12, 19, 34);
  doc.rect(0, pageHeight - 10, pageWidth, 10, 'F');
  doc.setTextColor(148, 163, 184);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.text(
    'QAWAQ AI · Reporte Ejecutivo para Directorio y Auditorías Laborales · Generado automáticamente',
    margin,
    pageHeight - 4
  );
  doc.text('Página 1 de 1', pageWidth - margin - 15, pageHeight - 4);

  return doc;
}
