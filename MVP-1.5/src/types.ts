export type RiskType =
  | 'Falta de Casco'
  | 'Sin Chaleco'
  | 'Altura sin Arnés'
  | 'Zona sin Baranda'
  | 'Piso Resbaladizo'
  | 'Otro Factor';

export type UrgencyLevel = 'Bajo' | 'Medio' | 'Alto';

export type CaseStatus = 'Abierto' | 'En Proceso' | 'Cerrado';

export type DetectedBy = 'Cámara IA' | 'Reporte Manual';

export interface CaseItem {
  id: string; // e.g. "QW-104"
  tipo: RiskType;
  ubicacion: string;
  frente: string;
  urgencia: UrgencyLevel;
  estado: CaseStatus;
  detectadoPor: DetectedBy;
  responsable: string;
  fotoUrl: string;
  fechaCreacion: number; // timestamp
  tiempoAbierto?: string; // e.g. "8 min"
  descripcion: string;
  confianzaIA?: number; // e.g. 98.4 (only if detectadoPor === "Cámara IA")
  camaraOrigen?: string; // e.g. "SITE_CAM_04 // PISO 14"
  medidaAplicada?: string;
  fotoSolucionUrl?: string;
  dictamenCierre?: string;
  conformeG050?: boolean;
  conformeDS011?: boolean;
  fechaCierre?: number;
}

export type TabType = 'alerta-ia' | 'reportar' | 'dashboard' | 'cerrar-caso';

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

