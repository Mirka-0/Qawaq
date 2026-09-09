import { CaseItem, DetectionScenario, RiskType } from './types';

export const ASSETS = {
  logo: '/logo.svg',
  logoPng: '/logo.png',
  cctv1: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC_BWrhWgR5bLw52Ea0XCIqaKc5sVk0bUtn7IeZKQMZYvu6FqKdToBaSp6KJ_sude9iFb80I3PevwUkY-leQ7uQgurYRjPR02UAT67lf2dhvhaoEjl9eGajoFBfT_A4SGBal-fIx43bISBZSMws6KjniBZA7RUwXi8-GsI8mt06k-NZFiSPFkSTVXGGCaOK0tcyMkEnF3YWzJBgbJO8SxyeKBiFzA_O27CzB2Je-qOYv1S2XpD4id587w',
  cctv2: 'https://lh3.googleusercontent.com/aida/AEtjO1X_SmWvuu07IwPIAfvnfbtoxeHPWcYaF79V2xl7c2dkUcz_FYhZ4_nsmJi564C-NNoYN_YIhbNY8kRnLA-peQ2GoDc0n2xmBUZJ0xiAtGYW30fA4fEcohHrI2zuGl372-BiO2VqtCb91BzdTUiaxDA66IZ45rL0YhPe72HkvY-rOWB8q26SfYeJ5MYNcp44mJ6wPeIh7NLC-hDpM4lWEPIoHe6Jf9yhShXPJ50HCMpXvOF_7wETlVNaiK6z',
  avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDmA3vqqu_d7NLFX_Qkc2IJz-Jtp4YJhlutG0o4FxpoEW5A5zJOAURTTlaT0Tw-J8gZwncRphs620bC7ja-gXQZ_l6y5guJ4_ORTzEFxjwWk2kT6UvWV6FzXLYetEdklCSivXTSZ38ZAIBYFXHREZnmUTtgsxfPe9_Zyzx8SYkewl3Lay41bbWhPeMbpn2VqDjEHblQMdIR6QKuMipnHA64Fy5FIrEKkw_2mNIn6bgXW22_S9t3A7Q4KA',
  resolved: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBKnjyRu50Paf7Zf2tR3-Hn-rgjGWrYBeLe7REjeHfJA4QmaDaw5Wn9HCiZ1qUnFQkSHM9vRZm35Q_8Nz51G9Z0lVpo0bussi2v3R_Q7Is9Wj9KwDTshl1Co57ilbhXbjSx2-TpLXZaGLO_svNGp3MtUZYcBZq0ixIabDgleaLrLKMthIR030MberlqRKeXBeofzfaRMwBDInP0tyhCxUK9eE_ZV72gYKwgnYoHWOzDh7RtFHDrYPFeCQ',
};

export const INITIAL_CASES: CaseItem[] = [
  {
    id: 'QW-104',
    tipo: 'Falta de Casco',
    ubicacion: 'Piso 14 - Torre Andina',
    frente: 'Frente Norte - Losa de vaciado',
    urgencia: 'Alto',
    estado: 'Abierto',
    detectadoPor: 'Cámara IA',
    responsable: 'Ing. Carlos Mendoza (Prevencionista)',
    fotoUrl: ASSETS.cctv1,
    fechaCreacion: Date.now() - 8 * 60 * 1000, // 8 min ago
    tiempoAbierto: '8 min',
    descripcion:
      'Operario realizando armado de fierro sin casco de seguridad reglamentario bajo gancho de pluma torre activa.',
    confianzaIA: 98.4,
    camaraOrigen: 'SITE_CAM_04 // SLAB_GRID_D',
  },
  {
    id: 'QW-103',
    tipo: 'Zona sin Baranda',
    ubicacion: 'Piso 12 - Torre Andina',
    frente: 'Frente Sur - Encofrado',
    urgencia: 'Medio',
    estado: 'En Proceso',
    detectadoPor: 'Reporte Manual',
    responsable: 'Cuadrilla Carpintería',
    fotoUrl: ASSETS.cctv2,
    fechaCreacion: Date.now() - 24 * 60 * 1000,
    tiempoAbierto: 'Hace 24 min',
    descripcion:
      'Baranda de borde perimétrico desanclada en zona de vaciado próxima a ducto de instalaciones.',
  },
  {
    id: 'QW-102',
    tipo: 'Falta de Casco',
    ubicacion: 'Piso 10 - Torre Andina',
    frente: 'Frente Norte - Losa de vaciado',
    urgencia: 'Alto',
    estado: 'Cerrado',
    detectadoPor: 'Cámara IA',
    responsable: 'Ing. Carlos Mendoza',
    fotoUrl: ASSETS.cctv1,
    fotoSolucionUrl: ASSETS.resolved,
    fechaCreacion: Date.now() - 45 * 60 * 1000,
    tiempoAbierto: 'Resuelto en 12 min',
    descripcion:
      'Uso de EPP verificado. Línea de Vida & Arnés colocados conforme a norma técnica.',
    confianzaIA: 99.1,
    medidaAplicada: 'Paralización inmediata y entrega de EPP nuevo',
    dictamenCierre:
      'Se inspeccionó cuadrilla y se suministró barbiquejo y casco certificado Clase E.',
    conformeG050: true,
    conformeDS011: true,
    fechaCierre: Date.now() - 33 * 60 * 1000,
  },
  {
    id: 'QW-101',
    tipo: 'Altura sin Arnés',
    ubicacion: 'Piso 14 - Torre Andina',
    frente: 'Frente Norte - Losa de vaciado',
    urgencia: 'Alto',
    estado: 'Cerrado',
    detectadoPor: 'Cámara IA',
    responsable: 'Ing. Carlos Mendoza',
    fotoUrl: ASSETS.cctv2,
    fotoSolucionUrl: ASSETS.resolved,
    fechaCreacion: Date.now() - 120 * 60 * 1000,
    tiempoAbierto: 'Resuelto en 18 min',
    descripcion:
      'Trabajador sobre andamio colgante sin doble línea de anclaje anclada a punto estructural independiente.',
    confianzaIA: 97.6,
    medidaAplicada: 'Reinducción de seguridad de 5 minutos brindada',
    dictamenCierre:
      'Trabajador descendió, se fijó línea de vida vertical con conector normado.',
    conformeG050: true,
    conformeDS011: true,
    fechaCierre: Date.now() - 102 * 60 * 1000,
  },
];

export const DETECTION_SCENARIOS: DetectionScenario[] = [
  {
    id: 'scen-1',
    code: 'QW-104',
    tipo: 'Falta de Casco',
    titulo: 'Caso #QW-104: Operario sin Casco de Seguridad',
    descripcion:
      'Trabajador en trayecto de losa sin EPP obligatorio (Casco Dieléctrico Tipo II) bajo radio de maniobra de pluma torre activa.',
    camara: 'SITE_CAM_04 // SLAB_GRID_D',
    ubicacion: 'Piso 14 - Torre Andina',
    frente: 'Frente Norte - Losa de vaciado',
    urgencia: 'Alto',
    confianza: 98.4,
    fotoUrl: ASSETS.cctv1,
    box: {
      top: '42%',
      left: '41%',
      width: '16%',
      height: '26%',
      label: 'SIN CASCO 98.4% // CASO #QW-104',
    },
  },
  {
    id: 'scen-2',
    code: 'QW-105',
    tipo: 'Sin Chaleco',
    titulo: 'Caso #QW-105: Operario sin Chaleco Reflectivo EPP Base',
    descripcion:
      'Operario en zona de tránsito de camiones mixer sin chaleco de alta visibilidad clase 2 con cinta retrorreflectiva.',
    camara: 'SITE_CAM_02 // ACCESS_RAMP_B',
    ubicacion: 'Sótano 1 - Rampa de Acceso',
    frente: 'Frente Sur - Cisterna',
    urgencia: 'Medio',
    confianza: 96.2,
    fotoUrl: ASSETS.cctv2,
    box: {
      top: '38%',
      left: '60%',
      width: '14%',
      height: '24%',
      label: 'SIN CHALECO 96.2% // CASO #QW-105',
    },
  },
  {
    id: 'scen-3',
    code: 'QW-106',
    tipo: 'Altura sin Arnés',
    titulo: 'Caso #QW-106: Trabajo en Altura > 1.80m sin Línea de Vida',
    descripcion:
      'Armador sobre encofrado perimétrico a 3.40m de altura sin línea de vida enganchada a punto de anclaje certificado de 5000 lb.',
    camara: 'SITE_CAM_07 // FACADE_SOUTH',
    ubicacion: 'Piso 12 - Torre Andina',
    frente: 'Frente Sur - Encofrado',
    urgencia: 'Alto',
    confianza: 99.1,
    fotoUrl: ASSETS.cctv1,
    box: {
      top: '44%',
      left: '28%',
      width: '15%',
      height: '28%',
      label: 'SIN ARNÉS 99.1% // CASO #QW-106',
    },
  },
  {
    id: 'scen-4',
    code: 'QW-107',
    tipo: 'Zona sin Baranda',
    titulo: 'Caso #QW-107: Borde de Losa Abierto sin Baranda Perimétrica',
    descripcion:
      'Desprotección colectiva en borde de vano de ascensor; ausencia de rodapié y baranda intermedia reglamentaria.',
    camara: 'SITE_CAM_01 // SHAFT_ELEVATOR',
    ubicacion: 'Piso 14 - Torre Andina',
    frente: 'Frente Norte - Losa de vaciado',
    urgencia: 'Alto',
    confianza: 97.8,
    fotoUrl: ASSETS.cctv2,
    box: {
      top: '52%',
      left: '35%',
      width: '24%',
      height: '20%',
      label: 'BORDE EXPUESTO 97.8% // CASO #QW-107',
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
  { id: 'fn-p14', name: 'Frente Norte - Piso 14 (Losa de vaciado)' },
  { id: 'fs-p12', name: 'Frente Sur - Piso 12 (Encofrado)' },
  { id: 'so-p02', name: 'Sótano 2 - Cisterna y Excavación' },
  { id: 'ta-grua', name: 'Torre Grúa 1 - Zona de Izaje' },
];

export const CORRECTIVE_MEASURES = [
  'Paralización inmediata y entrega de EPP nuevo',
  'Reinducción de seguridad de 5 minutos brindada',
  'Reubicación de trabajador a zona segura',
  'Instalación inmediata de baranda y rodapié perimétrico',
  'Aseguramiento de línea de vida con amortiguador de impacto',
];
