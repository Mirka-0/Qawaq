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

export type DetectedBy = 'Cámara IA' | 'Reporte Manual';

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
  fecha: number; // timestamp
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
  plazoObjetivo: number; // timestamp SLA
  estado: CaseStatus;
  asignadoA: AssignedPerson | null;
  detectadoPor: DetectedBy;
  responsable: string;
  fotoUrl: string;
  fechaCreacion: number; // timestamp
  tiempoAbierto?: string; // e.g. "8 min"
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

