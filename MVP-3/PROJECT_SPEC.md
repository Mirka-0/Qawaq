# Documento de Especificación del Proyecto — QAWAQ AI

## 1. Nombre del Proyecto
**QAWAQ AI — Supervisor Virtual de Seguridad y Salud en el Trabajo (SSOMA)**

---

## 2. Problema
En el sector de la construcción, los accidentes laborales graves y fatales (caídas de altura, atrapamientos por maquinaria pesada, electrocuciones, falta de EPP) ocurren predominantemente por:
- **Latencia en la detección**: Los prevencionistas no pueden supervisar físicamente todos los frentes de trabajo de manera simultánea.
- **Tiempos de respuesta lentos**: Las observaciones de campo se anotan en cuadernos o grupos de mensajería dispersos sin control de SLA de atención.
- **Falta de trazabilidad y reincidencia**: No se identifican patrones sistemáticos ni cuadrillas con actos inseguros repetitivos.

---

## 3. Usuario Objetivo
1. **Prevencionista / Jefe de Seguridad (SSOMA)**: Responsable de auditar toda la obra, despachar alertas y validar cierres de casos.
2. **Supervisor de Campo / Capataz de Cuadrilla**: Responsable directo de un frente de trabajo específico (losa, excavación, fachada) que debe subsanar actos inseguros inmediatamente.
3. **Residente de Obra / Gerencia de Proyectos**: Lectura de métricas estratégicas de accidentabilidad, cumplimiento normativo y reportes ejecutivos.

---

## 4. Solución Propuesta
Plataforma web progresiva (PWA) e inteligente que integra:
- Monitoreo y detección de riesgos visuales mediante visión por computadora en cámaras CCTV de obra.
- Despacho automatizado de alertas críticas con alarma sonora, notificación push y SLA regresivo.
- Asistente de inteligencia de riesgos (**Qawaq Risk Assistant**) basado en Gemini para clasificar observaciones, calcular recurrencias y formular planes de acción inmediata basados en la normativa peruana.
- Flujo de subsanación con contraste fotográfico "Antes / Después" y validación obligatoria por el área SSOMA.

---

## 5. Entrada de Información
- **Imágenes y Streams CCTV**: Cámaras IP estratégicamente instaladas en frentes de losa, borde perimétrico, patio de grúas, sótanos y andamios.
- **Reportes Manuales de Campo**: Fotografías capturadas por supervisores con geolocalización GPS, selección de frente y cuadrilla responsable.
- **Documentos de Grounding y Normativa**:
  - Norma Técnica de Edificación G.050 (Seguridad durante la Construcción).
  - D.S. N.º 011-2019-TR (Reglamento de Seguridad y Salud en el Trabajo para Construcción).
  - Matriz IPERC de la obra.

---

## 6. Capacidad de IA Utilizada
- **Visión Computacional / Bounding Box**: Reconocimiento de no conformidad de EPP (falta de casco, chaleco, arnés), proximidad peligrosa a cargas suspendidas, pisos resbaladizos y vanos desprotegidos.
- **Gemini 2.5 Flash (Structured Outputs)**:
  - *Clasificación de Riesgos*: Mapeo a severidad, probabilidad, nivel de riesgo y justificación normativa.
  - *Priorización de Casos*: Algoritmo que ordena hallazgos por severidad + tiempo abierto + reincidencia.
  - *Detección de Reincidencia*: Identificación de cuadrillas/frentes con ≥3 incidentes del mismo tipo en 14 días.
  - *Generación de Reportes Ejecutivos*: Resúmenes diarios, semanales y gerenciales en JSON estructurado.

---

## 7. Reglas del Sistema
1. **Regla de SLA Crítico**: Todo caso marcado como "Crítico" dispone de un tiempo máximo de 30 minutos de atención antes de escalar a Gerencia.
2. **Regla de Subsanación en 2 Pasos**: Un supervisor sube la foto de subsanación ("Resuelto"), pero el caso permanece en revisión hasta que SSOMA aprueba formalmente el cierre.
3. **Seguridad de Roles (RBAC)**: Los capataces solo pueden ver y gestionar casos pertenecientes a su frente de trabajo asignado.

---

## 8. Criterios de Aceptación
- Visualización en tiempo real de las 5 cámaras operativas con overlays de detección.
- Despacho de alertas sonoras y modales push en menos de 200ms tras simular o detectar una condición crítica.
- Tour guiado semitransparente que no obstruye elementos de la interfaz en pantallas móviles o de escritorio.
- Exportación de reportes en PDF con ficha técnica de cada caso, fotografía del hallazgo, geolocalización y acta de conformidad.
