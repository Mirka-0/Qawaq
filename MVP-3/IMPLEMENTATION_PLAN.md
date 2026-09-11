# Plan de Implementación — QAWAQ AI

## 1. Arquitectura Básica
- **Frontend SPA / PWA**: React 18+ con TypeScript, Tailwind CSS, animaciones con Motion y componentes accesibles.
- **Gestión de Estado**: Contexto unificado de seguridad (`SafetyContext`) con persistencia local (`localStorage`) e hidratación inmediata de casos activos, roles y notificaciones.
- **Motor de IA**: Gemini 2.5 Flash integrado mediante esquemas JSON estructurados (`response_schema`) para clasificación, priorización y generación de reportes ejecutivos.
- **Módulo de Audio / Notificaciones**: Sintetizador Web Audio API para alertas audibles de emergencia y sistema de notificaciones push de alta prioridad.

---

## 2. Pantallas y Vistas Principales

### 2.1 Dashboard Central (SSOMA & Gerencia)
- Indicadores clave: Casos activos, Críticos, Cumplimiento de SLA, Índice de Seguridad de la Obra.
- Mapa de Calor de Riesgo por Frentes (Losa Nivel 7, Borde Nivel 28, Patio Grúas, Sótano, Fachada).
- Listado de casos abiertos con filtros por severidad, frente y estado.

### 2.2 Alerta IA / Monitoreo CCTV en Vivo
- Selector interactivo de las 5 cámaras CCTV activas (CAM-01 a CAM-05).
- Visor de cámara con timestamp, bounding box de detección y porcentaje de confianza IA.
- Panel de despacho directo de alertas a supervisores o prevencionistas con SLA configurado.

### 2.3 Mis Pendientes / Mi Frente (Supervisor & Capataz)
- Vista filtrada al frente asignado del supervisor activo.
- Tarjetas de acción inmediata con temporizador de SLA regresivo.
- Botón directo para iniciar el flujo de subsanación ("Subsanar con Foto").

### 2.4 Validación y Cierre de Casos
- Comparador visual interactivo "Antes (Hallazgo IA)" vs. "Después (Evidencia de Subsanación)".
- Formulario de acta de cierre con selección de acción tomada (charla, entrega de EPP, retiro de personal, colocación de barandas) y firma digital SSOMA.

### 2.5 Reportes y Exportación PDF
- Generador de reportes diarios, semanales y resúmenes gerenciales con motor de IA.
- Previsualización y descarga en PDF con formato oficial de inspección SST.

---

## 3. Flujo del Usuario

```text
[Cámara CCTV / Sensor IA]
           │
           ▼
[Detección de Acto Inseguro] ──► [Alerta Sonora + Push Inmediata]
           │
           ▼
[SSOMA o Sistema Asigna al Supervisor del Frente] (SLA 30 min)
           │
           ▼
[Supervisor Recibe Notificación en "Mis Pendientes"]
           │
           ▼
[Supervisor Corrige en Campo y Sube Foto "Después"]
           │
           ▼
[SSOMA Revisa Evidencia Comparativa y Aprueba Cierre]
           │
           ▼
[Caso Archivado en Historial + Actualización de Métricas e IPERC]
```

---

## 4. Datos de Ejemplo Iniciales

| Código | Tipo de Riesgo | Ubicación / Frente | Severidad | SLA | Responsable |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **QW-104** | Falta de Casco | Nivel 7 - Losa y Columnas | Alta | 45 min | Ing. Carlos Mendoza |
| **QW-105** | Piso Resbaladizo | Sótano 2 - Corredor de Instalaciones | Media | 120 min | Capataz Juan Quispe |
| **QW-106** | Borde sin Arnés | Nivel 28 - Borde Este | Crítico | 30 min | Ing. Marcos Ramos |
| **QW-107** | Radio de Grúa Pesada | Patio de Maniobras SANY | Crítico | 30 min | Ing. Carlos Mendoza |
| **QW-108** | Trabajo en Andamio | Fachada Este - Andamio Tubular | Crítico | 30 min | Capataz Juan Quispe |

---

## 5. Funciones Principales Implementadas
1. `triggerRealtimeCriticalAlert(index)`: Despacha la alarma sonora y muestra el banner push modal de máxima prioridad.
2. `filterCasesByRole(role, userId)`: Segrega la información en tiempo real según el rol activo.
3. `calculateSlaRemaining(openedAt, limitMinutes)`: Calcula los minutos restantes para prevenir incumplimientos normativos.
4. `generateAiSafetyReport(type, cases)`: Estructura el resumen ejecutivo alineado a la Norma Técnica G.050.
5. `closeCaseWithEvidence(caseId, photoUrl, notes, approvedBy)`: Ejecuta la validación de cierre en dos fases con firma de auditoría.

---

## 6. Pasos de Desarrollo
- **Fase 1**: Arquitectura base, configuración del sistema de diseño (Chivo, Work Sans, Barlow Condensed, JetBrains Mono) y navegación adaptativa.
- **Fase 2**: Integración de cámaras CCTV fotorealistas con bounding boxes y simulador en tiempo real con audio sintetizado.
- **Fase 3**: Flujo de gestión de casos (Asignación → Subsanación → Aprobación SSOMA).
- **Fase 4**: Tour guiado interactivo semitransparente con cálculo de viewport sin obstrucción de elementos.
- **Fase 5**: Esquemas estructurados de IA para clasificación, reincidencia y reportes PDF.
