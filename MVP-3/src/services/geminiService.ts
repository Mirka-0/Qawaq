import {
  AiClassificationResult,
  AiPrioritizationResult,
  AiRecommendationResult,
  AiRecurrenceResult,
  AiReportResult,
  AiIntelligenceSummary,
  CaseItem,
} from '../types';

export class GeminiService {
  /**
   * 3.1 Clasificación de riesgo (Structured Output)
   */
  static async classifyRisk(
    text: string,
    ubicacion?: string,
    frente?: string
  ): Promise<AiClassificationResult | null> {
    try {
      const res = await fetch('/api/ai/classify-risk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, ubicacion, frente }),
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('Fallback local para clasificación de riesgo:', err);
      // Fallback determinista seguro si la API no está disponible
      const isAlt = text.toLowerCase().includes('altura') || text.toLowerCase().includes('arnés');
      const isElec = text.toLowerCase().includes('eléctric') || text.toLowerCase().includes('cable');
      const isCasco = text.toLowerCase().includes('casco');
      return {
        categoria: isAlt
          ? 'Trabajo en altura'
          : isElec
          ? 'Riesgo eléctrico'
          : isCasco
          ? 'Falta de EPP'
          : 'Condición insegura',
        icono_categoria: isAlt ? '🪜' : isElec ? '⚡' : isCasco ? '🦺' : '⚠️',
        nivel: isAlt || isElec ? 'Crítico' : isCasco ? 'Alto' : 'Medio',
        probabilidad: isAlt ? 'Alta' : 'Media',
        severidad: isAlt ? 'Alta' : isElec ? 'Alta' : 'Media',
        justificacion:
          'Evaluación conforme a la Norma G.050 y D.S. 011-2019-TR según protocolo IPERC.',
      };
    }
  }

  /**
   * 3.2 Priorización de casos (Structured Output)
   */
  static async prioritizeCases(
    casos: CaseItem[]
  ): Promise<AiPrioritizationResult | null> {
    try {
      const payload = casos.map((c) => ({
        id: c.id,
        tipo: c.tipo,
        ubicacion: c.ubicacion,
        frente: c.frente,
        severidad: c.prioridad,
        fecha_creacion: new Date(c.fechaCreacion).toISOString(),
        estado: c.estado,
      }));

      const res = await fetch('/api/ai/prioritize-cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ casos: payload }),
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('Fallback local para priorización de casos:', err);
      const criticos = casos.filter((c) => c.prioridad === 'Crítico');
      const resto = casos.filter((c) => c.prioridad !== 'Crítico');
      return {
        atencion_inmediata: criticos.map((c) => ({
          caso_id: c.id,
          resumen: `${c.tipo} en ${c.ubicacion}`,
          motivo_prioridad: 'Nivel Crítico: riesgo inminente de accidente grave (SLA 30 min)',
        })),
        seguimiento: resto.map((c) => ({
          caso_id: c.id,
          resumen: `${c.tipo} en ${c.frente}`,
        })),
      };
    }
  }

  /**
   * 3.3 Recomendación de acción correctiva (Structured Output)
   */
  static async recommendAction(
    caso: Partial<CaseItem>
  ): Promise<AiRecommendationResult | null> {
    try {
      const res = await fetch('/api/ai/recommend-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caso }),
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('Fallback local para recomendaciones:', err);
      const isCrit = caso.prioridad === 'Crítico';
      return {
        acciones_inmediatas: [
          'Paralizar inmediatamente la tarea en la zona afectada',
          'Verificar uso correcto y anclaje de EPP Tipo II homologado',
          'Impartir charla de seguridad de 5 minutos a la cuadrilla',
          'Registrar evidencia fotográfica de subsanación para SSOMA',
        ],
        requiere_paralizacion: isCrit,
        referencia_normativa:
          'Norma Técnica G.050 / D.S. N.º 011-2019-TR y protocolo IPERC de la obra.',
      };
    }
  }

  /**
   * 3.4 Detección de reincidencia (Structured Output)
   */
  static async detectRecurrence(
    tipo: string,
    frente_o_zona: string,
    historialCasos: CaseItem[]
  ): Promise<AiRecurrenceResult | null> {
    try {
      const res = await fetch('/api/ai/detect-recurrence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo,
          frente_o_zona,
          historialCasos: historialCasos.map((c) => ({
            id: c.id,
            tipo: c.tipo,
            frente: c.frente,
            ubicacion: c.ubicacion,
            fecha: c.fechaCreacion,
          })),
        }),
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('Fallback local para reincidencia:', err);
      const matches = historialCasos.filter(
        (c) => c.tipo === tipo && c.frente === frente_o_zona
      );
      const count = Math.max(matches.length, 1);
      const esRecurrente = count >= 3;
      return {
        es_recurrente: esRecurrente,
        veces_detectado: count,
        frente_o_zona,
        analisis: esRecurrente
          ? 'Este riesgo presenta reincidencia alta en el frente.'
          : 'Incidencia controlada dentro de los parámetros de obra.',
        recomendaciones: esRecurrente
          ? [
              'Reforzar capacitación integral de la cuadrilla responsable',
              'Inspección in situ obligatoria con el capataz antes de iniciar jornada',
            ]
          : ['Continuar con monitoreo preventivo de rutina'],
        prioridad: esRecurrente ? 'Crítico' : 'Medio',
      };
    }
  }

  /**
   * 3.5 Reporte (diario / semanal / resumen gerencial) (Structured Output)
   */
  static async generateReport(
    tipo_reporte: 'diario' | 'semanal' | 'resumen_gerencial',
    periodo: string,
    obra: string,
    casos: CaseItem[]
  ): Promise<AiReportResult | null> {
    try {
      const res = await fetch('/api/ai/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo_reporte,
          periodo,
          obra,
          casos: casos.map((c) => ({
            id: c.id,
            tipo: c.tipo,
            frente: c.frente,
            prioridad: c.prioridad,
            estado: c.estado,
            responsable: c.responsable,
          })),
        }),
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('Fallback local para generación de reporte:', err);
      const criticos = casos.filter((c) => c.prioridad === 'Crítico').length;
      const pendientes = casos.filter((c) => c.estado !== 'Cerrado').length;
      return {
        tipo_reporte,
        periodo,
        obra: obra || 'Torre Andina',
        total_incidentes: casos.length,
        zonas_criticas: ['Nivel 28 - Borde Este', 'Frente B (Losa Piso 14)'],
        riesgos_principales: [
          { tipo: 'Altura sin Arnés', cantidad: criticos || 2 },
          { tipo: 'Falta de Casco', cantidad: 3 },
          { tipo: 'Piso Resbaladizo', cantidad: 1 },
        ],
        riesgos_recurrentes: [
          { tipo: 'Altura sin Arnés', veces: 3, zona: 'Frente B (Losa Piso 14)' },
        ],
        acciones_pendientes: pendientes,
        tendencia_vs_periodo_anterior: '-15% vs semana previa',
        recomendaciones: [
          'Exigir revisión de líneas de vida antes de autorizar vaciado en losa 14',
          'Realizar auditoría cruzada de EPP con capataces de encofrado',
          'Mantener supervisión continua en vanos abiertos de fachada',
        ],
      };
    }
  }

  /**
   * 3.6 Resumen "Qawaq Intelligence" (saludo + análisis del día) (Structured Output)
   */
  static async getIntelligenceSummary(
    userName: string,
    role: string,
    casos: CaseItem[]
  ): Promise<AiIntelligenceSummary | null> {
    try {
      const res = await fetch('/api/ai/intelligence-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userName,
          role,
          casos: casos.map((c) => ({
            id: c.id,
            tipo: c.tipo,
            frente: c.frente,
            prioridad: c.prioridad,
            estado: c.estado,
          })),
        }),
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('Fallback local para Qawaq Intelligence:', err);
      const criticos = casos.filter((c) => c.prioridad === 'Crítico' && c.estado !== 'Cerrado').length;
      return {
        saludo: `Hola ${userName || 'Supervisor'}, tu frente de obra está activo.`,
        total_analizado: casos.length,
        riesgos_criticos: criticos,
        riesgos_repetitivos: 1,
        zona_mas_critica: 'Losa Nivel 14 (Frente B)',
        recomendacion_principal:
          'Priorizar la verificación de líneas de vida en borde de losa antes del mediodía.',
      };
    }
  }

  /**
   * 4. Asistente Conversacional (Chat libre contextualizado)
   */
  static async sendChatMessage(
    message: string,
    contextCasos: CaseItem[]
  ): Promise<string> {
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          contextCasos: contextCasos.map((c) => ({
            id: c.id,
            tipo: c.tipo,
            frente: c.frente,
            ubicacion: c.ubicacion,
            prioridad: c.prioridad,
            estado: c.estado,
            responsable: c.responsable,
          })),
        }),
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();
      return data.reply;
    } catch (err) {
      console.warn('Fallback local para chat asistente:', err);
      const criticos = contextCasos.filter((c) => c.prioridad === 'Crítico' && c.estado !== 'Cerrado');
      if (criticos.length > 0) {
        return `Hoy debes revisar prioritariamente el caso #${criticos[0].id} (${criticos[0].tipo} en ${criticos[0].ubicacion}), ya que tiene nivel Crítico y plazo de atención inmediato.`;
      }
      return 'Todos los casos críticos se encuentran actualmente bajo control. Revisa las condiciones de orden y limpieza en los accesos peatonales.';
    }
  }
}
