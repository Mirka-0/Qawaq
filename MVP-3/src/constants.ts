import { CaseItem, DetectionScenario, RiskType, SupervisorProfile } from './types';

export const ASSETS = {
  logo: '/logo.svg',
  cctv1: '/assets/cam-01.jpg',
  cctv2: '/assets/cam-02.jpg',
  cctv3: '/assets/cam-03.jpg',
  cctv4: '/assets/cam-04.jpg',
  cctv5: '/assets/cam-05.jpg',
  frenteLosa: '/assets/cam-01.jpg',
  frenteSur: '/assets/cam-04.jpg',
  frenteTorre: '/assets/cam-03.jpg',
  frenteSotano: '/assets/cam-02.jpg',
  resolved:
    'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&auto=format&fit=crop&q=80',
  avatar:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuB4L7YJ5RDre317tlHffWaS2fkn_133_BPTEdAkj9B3-tPgWWw2BjmJmlbK0h8Jpa9PIaoiyOI8yNssK9fiMvUZy-jZgfz7KHbn9I0OaUk10Oyn8ue8zp0P0JhJhiSYVfp70u3Ety11JYEPQnUUwx3zRfpBcEZGT9XG20HWfEbJgDG5QpQEYAws0ziu0Ic_onzsYAytmckXp7TWHVUCXpw-Q_rTOuz7QPzX22cQQQ8ObPzHcCqGxd2Bvw',
  avatarSupervisor:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuB4L7YJ5RDre317tlHffWaS2fkn_133_BPTEdAkj9B3-tPgWWw2BjmJmlbK0h8Jpa9PIaoiyOI8yNssK9fiMvUZy-jZgfz7KHbn9I0OaUk10Oyn8ue8zp0P0JhJhiSYVfp70u3Ety11JYEPQnUUwx3zRfpBcEZGT9XG20HWfEbJgDG5QpQEYAws0ziu0Ic_onzsYAytmckXp7TWHVUCXpw-Q_rTOuz7QPzX22cQQQ8ObPzHcCqGxd2Bvw',
  avatarSSOMA:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBKnjyRu50Paf7Zf2tR3-Hn-rgjGWrYBeLe7REjeHfJA4QmaDaw5Wn9HCiZ1qUnFQkSHM9vRZm35Q_8Nz51G9Z0lVpo0bussi2v3R_Q7Is9Wj9KwDTshl1Co57ilbhXbjSx2-TpLXZaGLO_svNGp3MtUZYcBZq0ixIabDgleaLrLKMthIR030MberlqRKeXBeofzfaRMwBDInP0tyhCxUK9eE_ZV72gYKwgnYoHWOzDh7RtFHDrYPFeCQ',
};

export const FRENTE_IMAGES: Record<string, string> = {
  'Frente B (Losa Piso 14)': ASSETS.frenteLosa,
  'Frente Sur (Excavación)': ASSETS.frenteSur,
  'Frente A (Torre Norte)': ASSETS.frenteTorre,
  'Sótano 2 (Cisterna)': ASSETS.frenteSotano,
};

export const SUPERVISOR_LIST: SupervisorProfile[] = [
  {
    id: 'sup-1',
    nombre: 'Ing. Carlos Mendoza',
    rol: 'Supervisor Frente B',
    frenteAsignado: 'Frente B (Losa Piso 14)',
  },
  {
    id: 'sup-2',
    nombre: 'Luis Ramírez',
    rol: 'Capataz Piso 14',
    frenteAsignado: 'Frente B (Losa Piso 14)',
  },
  {
    id: 'sup-3',
    nombre: 'Jorge Valdivia',
    rol: 'Supervisor Frente Sur',
    frenteAsignado: 'Frente Sur (Excavación)',
  },
  {
    id: 'sup-4',
    nombre: 'Marco Torres',
    rol: 'Capataz Excavación',
    frenteAsignado: 'Frente Sur (Excavación)',
  },
  {
    id: 'sup-5',
    nombre: 'Ing. Elena Rivas',
    rol: 'Jefa SSOMA',
    frenteAsignado: 'Toda la Obra',
  },
];

export const INITIAL_CASES: CaseItem[] = [
  {
    id: 'QW-104',
    tipo: 'Falta de Casco',
    ubicacion: 'Piso 14 - Losa Principal',
    frente: 'Frente B (Losa Piso 14)',
    urgencia: 'Alto',
    prioridad: 'Alto',
    plazoObjetivo: Date.now() + 75 * 60 * 1000, // +75 min SLA
    estado: 'Abierto',
    asignadoA: null,
    detectadoPor: 'Cámara IA',
    responsable: 'Sin Asignar (Pendiente SSOMA)',
    fotoUrl: ASSETS.cctv1,
    fechaCreacion: Date.now() - 8 * 60 * 1000,
    tiempoAbierto: '8 min',
    descripcion:
      'Operario realizando armado de fierro sin casco de seguridad reglamentario bajo radio de maniobra de pluma torre activa.',
    coordenadas: {
      lat: -12.096841,
      lng: -77.035219,
      accuracy: 3.2,
      altitude: 108.5,
      timestamp: Date.now() - 8 * 60 * 1000,
      origen: 'GPS_HARDWARE',
    },
    confianzaIA: 98.4,
    camaraOrigen: 'SITE_CAM_04 · SLAB_GRID_D',
    historial: [
      {
        accion: 'Reportado',
        por: 'CCTV Automatizado',
        rol: 'Sistema CCTV',
        fecha: Date.now() - 8 * 60 * 1000,
        comentario: 'Infracción captada en tiempo real en Losa 14.',
      },
    ],
  },
  {
    id: 'QW-103',
    tipo: 'Zona sin Baranda',
    ubicacion: 'Piso 12 - Borde Perimétrico',
    frente: 'Frente Sur (Excavación)',
    urgencia: 'Alto',
    prioridad: 'Crítico',
    plazoObjetivo: Date.now() + 18 * 60 * 1000, // 18 min remaining
    estado: 'Asignado',
    asignadoA: {
      nombre: 'Ing. Carlos Mendoza',
      rol: 'Supervisor Frente B',
    },
    detectadoPor: 'Reporte Manual',
    responsable: 'Ing. Carlos Mendoza',
    fotoUrl: ASSETS.cctv4,
    fechaCreacion: Date.now() - 24 * 60 * 1000,
    tiempoAbierto: 'Hace 24 min',
    descripcion:
      'Baranda de borde perimétrico desanclada en zona de vaciado próxima a ducto de instalaciones.',
    coordenadas: {
      lat: -12.097012,
      lng: -77.035408,
      accuracy: 4.5,
      altitude: 96.0,
      timestamp: Date.now() - 24 * 60 * 1000,
      origen: 'GPS_HARDWARE',
    },
    historial: [
      {
        accion: 'Reportado',
        por: 'Inspector de Campo SSOMA',
        rol: 'SSOMA',
        fecha: Date.now() - 24 * 60 * 1000,
        comentario: 'Borde desprotegido con caída potencial a desnivel.',
      },
      {
        accion: 'Asignado a Ing. Carlos Mendoza',
        por: 'Ing. Elena Rivas',
        rol: 'SSOMA',
        fecha: Date.now() - 15 * 60 * 1000,
        comentario: 'Prioridad Crítica establecida. SLA de atención inmediata.',
      },
    ],
  },
  {
    id: 'QW-100',
    tipo: 'Altura sin Arnés',
    ubicacion: 'Piso 14 - Losa Principal',
    frente: 'Frente B (Losa Piso 14)',
    urgencia: 'Alto',
    prioridad: 'Crítico',
    plazoObjetivo: Date.now() - 14 * 60 * 1000, // VENCIDO hace 14 min!
    estado: 'En Corrección',
    asignadoA: {
      nombre: 'Ing. Carlos Mendoza',
      rol: 'Supervisor Frente B',
    },
    detectadoPor: 'Cámara IA',
    responsable: 'Ing. Carlos Mendoza',
    fotoUrl: ASSETS.cctv3,
    fechaCreacion: Date.now() - 48 * 60 * 1000,
    tiempoAbierto: '48 min',
    descripcion:
      'Personal sobre plataforma de trabajo en altura sin línea de vida conectada a punto de anclaje normado.',
    coordenadas: {
      lat: -12.096894,
      lng: -77.035251,
      accuracy: 3.0,
      altitude: 108.5,
      timestamp: Date.now() - 48 * 60 * 1000,
      origen: 'GPS_HARDWARE',
    },
    confianzaIA: 97.4,
    camaraOrigen: 'SITE_CAM_07 · FACADE_NORTH',
    historial: [
      {
        accion: 'Reportado',
        por: 'CCTV Automatizado',
        rol: 'Sistema CCTV',
        fecha: Date.now() - 48 * 60 * 1000,
        comentario: 'Riesgo inminente de caída.',
      },
      {
        accion: 'Asignado a Ing. Carlos Mendoza',
        por: 'Ing. Elena Rivas',
        rol: 'SSOMA',
        fecha: Date.now() - 40 * 60 * 1000,
        comentario: 'Notificación de parada inmediata remitida a cuadrilla.',
      },
      {
        accion: 'Corrección iniciada',
        por: 'Ing. Carlos Mendoza',
        rol: 'Supervisor/Capataz',
        fecha: Date.now() - 25 * 60 * 1000,
        comentario: 'Cuadrilla detenida. Instalando líneas de anclaje.',
      },
    ],
  },
  {
    id: 'QW-106',
    tipo: 'Sin Chaleco',
    ubicacion: 'Sótano 1 - Rampa de Acceso',
    frente: 'Frente Sur (Excavación)',
    urgencia: 'Medio',
    prioridad: 'Alto',
    plazoObjetivo: Date.now() + 55 * 60 * 1000,
    estado: 'Pendiente de Validación SSOMA',
    asignadoA: {
      nombre: 'Luis Ramírez',
      rol: 'Capataz Piso 14',
    },
    detectadoPor: 'Reporte Manual',
    responsable: 'Luis Ramírez',
    fotoUrl: ASSETS.cctv2,
    evidenciaCorreccion: {
      fotoUrl: ASSETS.resolved,
      nota: 'Se dotó de chalecos de alta visibilidad clase 2 con cinta retrorreflectiva a toda la cuadrilla en rampa.',
      fecha: Date.now() - 10 * 60 * 1000,
    },
    fechaCreacion: Date.now() - 65 * 60 * 1000,
    tiempoAbierto: '65 min',
    descripcion:
      'Operarios en rampa de acceso sin chaleco reflectivo reglamentario ante ingreso constante de mixers.',
    coordenadas: {
      lat: -12.09705,
      lng: -77.03539,
      accuracy: 4.1,
      altitude: 88.0,
      timestamp: Date.now() - 65 * 60 * 1000,
      origen: 'GPS_HARDWARE',
    },
    historial: [
      {
        accion: 'Reportado',
        por: 'Supervisor de Turno',
        rol: 'SSOMA',
        fecha: Date.now() - 65 * 60 * 1000,
      },
      {
        accion: 'Asignado a Luis Ramírez',
        por: 'Ing. Elena Rivas',
        rol: 'SSOMA',
        fecha: Date.now() - 48 * 60 * 1000,
      },
      {
        accion: 'Corrección iniciada',
        por: 'Luis Ramírez',
        rol: 'Supervisor/Capataz',
        fecha: Date.now() - 30 * 60 * 1000,
      },
      {
        accion: 'Evidencia subida',
        por: 'Luis Ramírez',
        rol: 'Supervisor/Capataz',
        fecha: Date.now() - 10 * 60 * 1000,
        comentario: 'Chalecos normados entregados y cuadrilla verificada.',
      },
    ],
  },
  {
    id: 'QW-102',
    tipo: 'Falta de Casco',
    ubicacion: 'Piso 10 - Sector Norte',
    frente: 'Frente B (Losa Piso 14)',
    urgencia: 'Alto',
    prioridad: 'Alto',
    plazoObjetivo: Date.now() - 20 * 60 * 1000,
    estado: 'Cerrado',
    asignadoA: {
      nombre: 'Ing. Carlos Mendoza',
      rol: 'Supervisor Frente B',
    },
    detectadoPor: 'Cámara IA',
    responsable: 'Ing. Carlos Mendoza',
    fotoUrl: ASSETS.cctv1,
    fotoSolucionUrl: ASSETS.resolved,
    fechaCreacion: Date.now() - 45 * 60 * 1000,
    tiempoAbierto: 'Resuelto en 12 min',
    descripcion:
      'Uso de EPP verificado. Casco con barbiquejo Clase E colocado conforme a norma técnica G.050.',
    coordenadas: {
      lat: -12.096755,
      lng: -77.035182,
      accuracy: 3.8,
      altitude: 82.3,
      timestamp: Date.now() - 45 * 60 * 1000,
      origen: 'CALIBRADO_OBRA',
    },
    confianzaIA: 99.1,
    medidaAplicada: 'Paralización inmediata y entrega de EPP nuevo',
    dictamenCierre:
      'Se inspeccionó cuadrilla y se suministró barbiquejo y casco certificado Clase E.',
    conformeG050: true,
    conformeDS011: true,
    fechaCierre: Date.now() - 33 * 60 * 1000, // Cerrado hoy
    validacion: {
      aprobado: true,
      comentarioSSOMA: 'Cumplimiento verificado conforme a norma G.050 y D.S. 011-2019-TR.',
      fecha: Date.now() - 33 * 60 * 1000,
    },
    historial: [
      {
        accion: 'Reportado',
        por: 'CCTV Automatizado',
        rol: 'Sistema CCTV',
        fecha: Date.now() - 45 * 60 * 1000,
      },
      {
        accion: 'Asignado a Ing. Carlos Mendoza',
        por: 'Ing. Elena Rivas',
        rol: 'SSOMA',
        fecha: Date.now() - 42 * 60 * 1000,
      },
      {
        accion: 'Corrección iniciada',
        por: 'Ing. Carlos Mendoza',
        rol: 'Supervisor/Capataz',
        fecha: Date.now() - 38 * 60 * 1000,
      },
      {
        accion: 'Evidencia subida',
        por: 'Ing. Carlos Mendoza',
        rol: 'Supervisor/Capataz',
        fecha: Date.now() - 35 * 60 * 1000,
        comentario: 'Subsanación en campo completada.',
      },
      {
        accion: 'Cerrado',
        por: 'Ing. Elena Rivas',
        rol: 'SSOMA',
        fecha: Date.now() - 33 * 60 * 1000,
        comentario: 'Aprobado y certificado en libro digital de seguridad.',
      },
    ],
  },
];

export const DETECTION_SCENARIOS: DetectionScenario[] = [
  {
    id: 'scen-1',
    code: 'QW-104',
    tipo: 'Falta de Casco',
    titulo: 'CAM-01: Operario transitando en losa sin casco de seguridad',
    descripcion:
      'Trabajador sobre losa activa de nivel 7 transitando sin casco dieléctrico Tipo II bajo radio de giro de grúa torre activa.',
    camara: 'CAM_01 · BLDG_A_LEVEL_7',
    ubicacion: 'Nivel 7 - Losa y Columnas',
    frente: 'Frente B (Losa Piso 14)',
    urgencia: 'Alto',
    prioridad: 'Alto',
    confianza: 98.4,
    fotoUrl: ASSETS.cctv1,
    box: {
      top: '40%',
      left: '43%',
      width: '14%',
      height: '35%',
      label: 'SIN CASCO 98.4% · CAM-01',
    },
  },
  {
    id: 'scen-2',
    code: 'QW-105',
    tipo: 'Piso Resbaladizo',
    titulo: 'CAM-02: Piso mojado con charcos de agua en corredor de alto tránsito',
    descripcion:
      'Superficie de concreto con agua estancada y piso resbaloso en pasillo de circulación junto a acopio de materiales y carros utilitarios.',
    camara: 'CAM_02 · CORREDOR_INTERIOR',
    ubicacion: 'Corredor Central de Instalaciones',
    frente: 'Sótano 2 (Cisterna)',
    urgencia: 'Medio',
    prioridad: 'Medio',
    confianza: 97.2,
    fotoUrl: ASSETS.cctv2,
    box: {
      top: '42%',
      left: '38%',
      width: '32%',
      height: '42%',
      label: 'PISO MOJADO 97.2% · CAM-02',
    },
  },
  {
    id: 'scen-3',
    code: 'QW-106',
    tipo: 'Altura sin Arnés',
    titulo: 'CAM-03: Trabajo al borde de losa en altura sin línea de vida anclada',
    descripcion:
      'Operario inclinado sobre el borde exterior del edificio en nivel 28 sin sistema anticaídas ni punto de anclaje certificado con riesgo inminente de caída.',
    camara: 'CAM_03 · LEVEL_28_EAST',
    ubicacion: 'Nivel 28 - Borde Perimétrico Este',
    frente: 'Frente A (Torre Norte)',
    urgencia: 'Alto',
    prioridad: 'Crítico',
    confianza: 99.4,
    fotoUrl: ASSETS.cctv3,
    box: {
      top: '20%',
      left: '55%',
      width: '12%',
      height: '22%',
      label: 'BORDE SIN ARNÉS 99.4% · CRÍTICO',
    },
  },
  {
    id: 'scen-4',
    code: 'QW-107',
    tipo: 'Zona sin Baranda',
    titulo: 'CAM-04: Operario en zona de maniobra de grúa pesada SANY',
    descripcion:
      'Personal de cuadrilla en radio de acción de grúa sobre orugas SANY en terreno con lodo y delimitación parcial con conos y cinta.',
    camara: 'CAM_04 · PATIO_EXCAVACION',
    ubicacion: 'Patio de Maniobras y Maquinaria Pesada',
    frente: 'Frente Sur (Excavación)',
    urgencia: 'Alto',
    prioridad: 'Crítico',
    confianza: 98.6,
    fotoUrl: ASSETS.cctv4,
    box: {
      top: '36%',
      left: '50%',
      width: '8%',
      height: '20%',
      label: 'RADIO DE GRÚA 98.6% · CAM-04',
    },
  },
  {
    id: 'scen-5',
    code: 'QW-108',
    tipo: 'Sin Chaleco',
    titulo: 'CAM-05: Trabajos en andamio exterior de fachada con riesgo de caída',
    descripcion:
      'Operarios en pasarela de andamio tubular de fachada este sobre tablones de madera junto a red de seguridad perimétrica.',
    camara: 'CAM_05 · EAST_FACADE_ANDAMIO',
    ubicacion: 'Fachada Este - Plataforma de Andamio',
    frente: 'Frente B (Losa Piso 14)',
    urgencia: 'Alto',
    prioridad: 'Crítico',
    confianza: 98.8,
    fotoUrl: ASSETS.cctv5,
    box: {
      top: '22%',
      left: '36%',
      width: '18%',
      height: '52%',
      label: 'TRABAJO EN ANDAMIO 98.8% · CAM-05',
    },
  },
];

export const RISK_TYPES: { id: RiskType; label: string; icon: string }[] = [
  { id: 'Falta de Casco', label: 'Falta de Casco', icon: 'HardHat' },
  { id: 'Sin Chaleco', label: 'Sin Chaleco', icon: 'Vest' },
  { id: 'Altura sin Arnés', label: 'Altura sin Arnés', icon: 'LifeBuoy' },
  { id: 'Zona sin Baranda', label: 'Zona sin Baranda', icon: 'Fence' },
  { id: 'Piso Resbaladizo', label: 'Piso Resbaladizo', icon: 'AlertTriangle' },
  { id: 'Otro Factor', label: 'Otro Factor', icon: 'MoreHorizontal' },
];

export const WORK_FRONTS = [
  { id: 'fn-p14', name: 'Frente B (Losa Piso 14)' },
  { id: 'fs-p12', name: 'Frente Sur (Excavación)' },
  { id: 'so-p02', name: 'Sótano 2 - Cisterna y Excavación' },
  { id: 'ta-grua', name: 'Torre Grúa 1 - Zona de Izaje' },
];

export const FRENTES_OBRA = [
  'Frente B (Losa Piso 14)',
  'Frente Sur (Excavación)',
  'Frente A (Torre Norte)',
  'Sótano 2 (Cisterna)',
];

export const TIPO_CONDICIONES = [
  'Falta de Casco',
  'Altura sin Arnés',
  'Zona sin Baranda',
  'Sin Chaleco',
  'Piso Resbaladizo',
  'Otro Factor',
];

export const CORRECTIVE_MEASURES = [
  'Paralización inmediata y entrega de EPP nuevo',
  'Reinducción de seguridad de 5 minutos brindada',
  'Reubicación de trabajador a zona segura',
  'Instalación inmediata de baranda y rodapié perimétrico',
  'Aseguramiento de línea de vida con amortiguador de impacto',
];
