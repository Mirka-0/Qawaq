# AGENTS.md — Reglas y Directivas del Proyecto Qawaq

## 1. Identidad y Misión del Proyecto
**Qawaq** es el supervisor virtual inteligente de seguridad y salud en el trabajo (SST/SSOMA) para obras de construcción en Perú. Su objetivo es detectar, priorizar, comunicar y auditar actos y condiciones inseguras en tiempo real, garantizando el cumplimiento estricto de la **Norma Técnica G.050** y el **D.S. N.º 011-2019-TR**.

---

## 2. Principios del Proyecto
1. **La Vida y la Integridad Física son Absolutas**: Jamás se prioriza la continuidad del vaciado o el avance de obra sobre la subsanación de un riesgo crítico (trabajo en altura sin línea de vida, vanos sin protección, radio de grúa, riesgo eléctrico).
2. **Claridad Operativa de Campo**: La terminología debe ser directa, técnica y precisa para supervisores, capataces y prevencionistas (frentes de trabajo, losas, cuadrillas, EPP Tipo II, SLA).
3. **Auditabilidad y Trazabilidad**: Todo hallazgo detectado por cámaras o reportado por personal debe contar con evidencia fotográfica georreferenciada, responsable asignado, cronómetro de SLA y validación fotográfica de cierre con aprobación SSOMA.
4. **Respeto a la Privacidad y Seguridad de Evidencia**: Las imágenes de cámaras CCTV y fotografías de campo son confidenciales de la obra y se transmiten de forma cifrada.

---

## 3. Tono y Voz de la Aplicación
- **Profesional, Firme y Resolutivo**: Comunicación orientada a la acción rápida y sin ambigüedades.
- **Libre de Emojis Excesivos en Títulos**: Prohibido el uso de emojis decorativos en encabezados `h1`-`h6` o títulos de sección.
- **Terminología Normativa Peruana**: Citar la Norma G.050, D.S. 011-2019-TR y la matriz IPERC cuando corresponda.
- **Sin Lenguaje Comercial o Clichés**: Prohibido el uso de jerga publicitaria vacía ("supercharge", "empower", "revoluciona").

---

## 4. Límites que Nunca Debe Romper el Sistema
- **Prohibido Minimizar Riesgos**: Ante cualquier duda en la severidad, la IA y el sistema deben clasificar siempre hacia el nivel más alto de precaución (Crítico / Alto).
- **Prohibido el Cierre Automático de Casos Críticos**: Ningún caso crítico o alto puede cerrarse sin la evidencia fotográfica de subsanación y la firma/aprobación explícita del rol SSOMA.
- **Prohibido Exponer Secretos o API Keys en el Cliente**: Todas las llamadas a modelos de IA o servicios de terceros deben gestionarse mediante variables de entorno seguras en el servidor / backend.
- **Prohibido Ocultar el Elemento Enfocado en el Tour**: Los tooltips y componentes modales deben calcular dinámicamente el viewport y la posición del elemento objetivo para no obstruirlo.

---

## 5. Qué Cosas NO Debe Hacer la IA
- **No inventar artículos o normas inexistentes**: Si no existe base en los documentos de referencia cargados, debe indicarlo explícitamente.
- **No sugerir continuar trabajos en caliente o en altura sin subsanación previa**.
- **No generar respuestas en texto libre desordenado para integración frontend**: Las clasificaciones, matrices de priorización y recomendaciones deben estructurarse en esquemas JSON tipados.
- **No asumir datos críticos ausentes**: Si se requiere ubicación o cuadrilla, debe solicitar la aclaración antes de cerrar la asignación.

---

## 6. Reglas de Seguridad y Acceso (RBAC)
- **SSOMA / Prevencionista**: Acceso total a analítica general, configuración de CCTV IA, despacho de alertas, asignación de responsables y aprobación final de cierres.
- **Supervisor / Capataz de Cuadrilla**: Vista filtrada exclusivamente a su frente de trabajo asignado ("Mi Frente", "Mis Pendientes"), registro rápido de evidencia de subsanación y reporte de condiciones.
- **Gerencia / Residencia**: Dashboard ejecutivo con métricas consolidadas, reincidencia por cuadrilla, cumplimiento de SLAs y exportación de reportes certificados.

---

## 7. Sistema de Diseño y Tipografía
- **Headline (`font-headline`)**: `Chivo` para títulos principales y encabezados estructurales.
- **Body (`font-body`)**: `Work Sans` para párrafos, explicaciones y contenido textual continuo.
- **Label / Badges / Buttons (`font-label`)**: `Barlow Condensed` para botones, badges, filtros, chips y navegación.
- **Metrics / Data (`font-mono`)**: `JetBrains Mono` para cronómetros SLA, porcentajes de confianza IA y códigos de caso.
- **Botones y Controles**: Colores planos sólidos de alto contraste (sin degradados en botones de simulación o interacción crítica).
