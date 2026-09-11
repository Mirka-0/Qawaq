export type RiskType =
  | 'Falta de Casco'
  | 'Sin Chaleco'
  | 'Altura sin Arnés'
  | 'Zona sin Baranda'
  | 'Piso Resbaladizo'
  | 'Otro Factor';

export type UrgencyLevel = 'Bajo' | 'Medio' | 'Alto';

export type PriorityLevel = 'Crítico' | 'Alto' | 'Medio';

export type CaseStatus =
  | 'Abierto'
  | 'Asignado'
  | 'En Corrección'
  | 'Pendiente de Validación SSOMA'
  | 'Cerrado'
  | 'Rechazado';

export type UserRole = 'SSOMA' | 'Supervisor/Capataz' | 'Gerencia';

export type DetectedBy = 'Cámara IA' | 'Reporte Manual' | string;

export interface SupervisorProfile {
  id: string;
  nombre: string;
  rol: string;
  frenteAsignado: string;
}

export interface CaseHistoryEntry {
  accion: string;
  por: string;
  rol: string;
  fecha: number; // timestamp Date.now()
  comentario?: string;
}

export interface CorrectionEvidence {
  fotoUrl: string;
  nota: string;
  fecha: number;
}

export interface ValidationRecord {
  aprobado: boolean;
  comentarioSSOMA: string;
  fecha: number;
}

export interface AssignedPerson {
  nombre: string;
  rol: string;
}

export interface GpsCoordinates {
  lat: number;
  lng: number;
  accuracy?: number; // precisión en metros
  altitude?: number | null;
  timestamp?: number;
  origen?: 'GPS_HARDWARE' | 'CALIBRADO_OBRA';
}

export interface CaseItem {
  id: string; // e.g. "QW-104"
  tipo: RiskType;
  ubicacion: string;
  frente: string;
  urgencia: UrgencyLevel;
  prioridad: PriorityLevel;
  plazoObjetivo: number; // timestamp SLA calculado (Crítico=+30min, Alto=+2h, Medio=+24h)
  estado: CaseStatus;
  asignadoA: AssignedPerson | null;
  detectadoPor: DetectedBy;
  responsable: string;
  fotoUrl: string;
  fechaCreacion: number; // timestamp
  tiempoAbierto?: string;
  descripcion: string;
  coordenadas?: GpsCoordinates;
  confianzaIA?: number;
  camaraOrigen?: string;
  evidenciaCorreccion?: CorrectionEvidence | null;
  validacion?: ValidationRecord | null;
  historial: CaseHistoryEntry[];
  medidaAplicada?: string;
  fotoSolucionUrl?: string;
  dictamenCierre?: string;
  conformeG050?: boolean;
  conformeDS011?: boolean;
  fechaCierre?: number;
  offlinePending?: boolean;
}

export type TabType =
  | 'dashboard'
  | 'alerta-ia'
  | 'reportar'
  | 'cerrar-caso'
  | 'mis-pendientes'
  | 'mi-frente';

export interface DetectionScenario {
  id: string;
  code: string;
  tipo: RiskType;
  titulo: string;
  descripcion: string;
  camara: string;
  ubicacion: string;
  frente: string;
  urgencia: UrgencyLevel;
  prioridad: PriorityLevel;
  confianza: number;
  fotoUrl: string;
  box: {
    top: string;
    left: string;
    width: string;
    height: string;
    label: string;
  };
}

export interface UserInteractionEvent {
  id: string;
  tipo: 'alerta' | 'reporte' | 'cierre' | 'pdf' | 'tema' | 'otro';
  descripcion: string;
  timestamp: number;
}

export interface UsageStats {
  alertasAtendidas: number;
  reportesGenerados: number;
  casosCerrados: number;
  reportesPdfDescargados: number;
  cambiosModoLuz: number;
  ultimaActividad: number;
  eventosRecientes: UserInteractionEvent[];
}

// 3.1 Clasificación de riesgo
export interface AiClassificationResult {
  categoria: string;
  icono_categoria: string;
  nivel: PriorityLevel | 'Bajo';
  probabilidad: 'Alta' | 'Media' | 'Baja';
  severidad: 'Alta' | 'Media' | 'Baja';
  justificacion: string;
}

// 3.2 Priorización de casos
export interface AiPrioritizationResult {
  atencion_inmediata: Array<{
    caso_id: string;
    resumen: string;
    motivo_prioridad: string;
  }>;
  seguimiento: Array<{
    caso_id: string;
    resumen: string;
  }>;
}

// 3.3 Recomendación de acción correctiva
export interface AiRecommendationResult {
  acciones_inmediatas: string[];
  requiere_paralizacion: boolean;
  referencia_normativa?: string;
}

// 3.4 Detección de reincidencia
export interface AiRecurrenceResult {
  es_recurrente: boolean;
  veces_detectado: number;
  frente_o_zona: string;
  analisis: string;
  recomendaciones: string[];
  prioridad: 'Crítico' | 'Alto' | 'Medio' | 'Bajo';
}

// 3.5 Reporte (diario / semanal / resumen gerencial)
export interface AiReportResult {
  tipo_reporte: 'diario' | 'semanal' | 'resumen_gerencial';
  periodo: string;
  obra: string;
  total_incidentes: number;
  zonas_criticas: string[];
  riesgos_principales: Array<{
    tipo: string;
    cantidad: number;
  }>;
  riesgos_recurrentes?: Array<{
    tipo: string;
    veces: number;
    zona: string;
  }>;
  acciones_pendientes: number;
  tendencia_vs_periodo_anterior?: string;
  recomendaciones: string[];
}

// 3.6 Resumen "Qawaq Intelligence"
export interface AiIntelligenceSummary {
  saludo: string;
  total_analizado: number;
  riesgos_criticos: number;
  riesgos_repetitivos: number;
  zona_mas_critica: string;
  recomendacion_principal: string;
}

