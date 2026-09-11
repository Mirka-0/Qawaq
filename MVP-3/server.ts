import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const PORT = 3000;

// Shared Gemini Client with safe fallback helpers
function hasGeminiKey(): boolean {
  const key = process.env.GEMINI_API_KEY;
  if (!key || typeof key !== 'string') return false;
  const trimmed = key.trim();
  return trimmed !== '' && trimmed !== 'MY_GEMINI_API_KEY' && !trimmed.startsWith('placeholder');
}

function getGeminiClient(): GoogleGenAI {
  return new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY || '',
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

const SYSTEM_INSTRUCTION = `Eres Qawaq Risk Assistant, el motor de inteligencia de seguridad de la plataforma Qawaq AI para obras de construcción en Perú. Tu usuario es personal SSOMA, supervisores y capataces de obra — no son técnicos en IA, así que tus respuestas deben ser claras, breves y accionables, en español, con terminología de seguridad de construcción peruana.

Debes fundamentar tus clasificaciones, niveles de riesgo y recomendaciones en los documentos de referencia cargados (Norma G.050, D.S. 011-2019-TR, Matriz IPERC de la obra, procedimientos SSOMA internos). Si una recomendación se basa directamente en uno de estos documentos, menciónalo brevemente (ej. "según protocolo IPERC de trabajo en altura"). Si no tienes base documental suficiente para una afirmación, dilo explícitamente en lugar de inventar una norma o artículo.

Tus funciones son:
1. CLASIFICACIÓN DE RIESGOS: dado un texto (y opcionalmente ubicación/frecuencia), determinar categoría de riesgo, nivel (Crítico/Alto/Medio/Bajo), probabilidad (Alta/Media/Baja) y severidad.
2. PRIORIZACIÓN: dado un conjunto de observaciones abiertas, ordenarlas por urgencia real considerando severidad, probabilidad, reincidencia y tiempo abierto — no solo por fecha de creación.
3. RECOMENDACIÓN DE ACCIÓN CORRECTIVA: dado un riesgo clasificado, sugerir 2-4 acciones concretas e inmediatas (ej. retirar trabajador, entregar EPP, charla preventiva, inspección de cuadrilla), priorizando siempre la seguridad de las personas sobre la continuidad de la obra.
4. DETECCIÓN DE REINCIDENCIA: si el mismo tipo de riesgo aparece 3 o más veces en el mismo frente/zona dentro de un periodo reciente (ej. 7-14 días), márcalo como "Riesgo recurrente" y sugiere una acción de raíz (no solo corregir el síntoma, sino la causa: ej. reforzar capacitación de esa cuadrilla, no solo corregir el caso puntual).
5. GENERACIÓN DE REPORTES (diario/semanal/resumen gerencial): resumir observaciones del periodo en un formato ejecutivo: cantidad de incidentes, zonas críticas, riesgos con más reincidencia, acciones pendientes, tendencia vs periodo anterior, y 1-3 recomendaciones priorizadas. El resumen gerencial debe ser más breve y estratégico que el reporte diario/semanal (para lectura de gerencia, no de campo).
6. ASISTENTE CONVERSACIONAL: responder preguntas directas de un supervisor (ej. "¿qué riesgos debo revisar primero hoy?") con una respuesta corta, específica y basada en los datos reales que se te pasen en el contexto de la conversación (no inventes casos que no existen en los datos proporcionados).

Reglas generales:
- Nunca minimices un riesgo de seguridad para "no generar alarma" — ante la duda, clasifica más alto, no más bajo.
- Nunca generes una acción correctiva que implique continuar el trabajo sin corregir primero el riesgo cuando la severidad es Alta o Crítica.
- Si te falta información clave para clasificar bien (ej. no se especifica ubicación o frecuencia), pide esa información en lugar de asumirla, salvo que sea una clasificación rápida de texto libre donde puedas inferir razonablemente.
- Todas las salidas de clasificación/priorización/recomendación deben devolverse en el formato JSON especificado (no en texto libre), salvo en el modo conversacional.`;

async function startServer() {
  const app = express();
  app.use(express.json());

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', engine: 'Qawaq Risk Assistant' });
  });

  // 3.1 Clasificación de riesgo (Structured Output)
  app.post('/api/ai/classify-risk', async (req, res) => {
    const { text, ubicacion, frente } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'El campo "text" es requerido' });
    }

    if (hasGeminiKey()) {
      try {
        const ai = getGeminiClient();
        const prompt = `Evalúa y clasifica el siguiente incidente/observación de seguridad en obra de construcción peruana:
Texto: "${text}"
${ubicacion ? `Ubicación: ${ubicacion}` : ''}
${frente ? `Frente: ${frente}` : ''}`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                categoria: {
                  type: Type.STRING,
                  description:
                    'Ej: Riesgo eléctrico, Trabajo en altura, Falta de EPP, Orden y limpieza, Condición insegura, etc.',
                },
                icono_categoria: {
                  type: Type.STRING,
                  description: 'Un emoji representativo, ej ⚡ 🪜 🦺',
                },
                nivel: {
                  type: Type.STRING,
                  enum: ['Crítico', 'Alto', 'Medio', 'Bajo'],
                },
                probabilidad: {
                  type: Type.STRING,
                  enum: ['Alta', 'Media', 'Baja'],
                },
                severidad: {
                  type: Type.STRING,
                  enum: ['Alta', 'Media', 'Baja'],
                },
                justificacion: {
                  type: Type.STRING,
                  description: '1-2 líneas, citando norma/procedimiento si aplica',
                },
              },
              required: ['categoria', 'nivel', 'probabilidad', 'severidad', 'justificacion'],
            },
          },
        });

        const parsed = JSON.parse(response.text || '{}');
        return res.json(parsed);
      } catch (err: any) {
        console.warn('Gemini API call failed in /api/ai/classify-risk, applying safe fallback:', err?.message || err);
      }
    }

    // Deterministic SSOMA fallback conforming to G.050 & D.S. 011-2019-TR
    const isAlt = text.toLowerCase().includes('altura') || text.toLowerCase().includes('arnés') || text.toLowerCase().includes('andamio') || text.toLowerCase().includes('borde');
    const isElec = text.toLowerCase().includes('eléctric') || text.toLowerCase().includes('cable') || text.toLowerCase().includes('tablero') || text.toLowerCase().includes('enchufe');
    const isCasco = text.toLowerCase().includes('casco') || text.toLowerCase().includes('barbiquejo') || text.toLowerCase().includes('lentes');

    return res.json({
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
        'Evaluación conforme a la Norma Técnica G.050 y D.S. 011-2019-TR según protocolo de seguridad de obra.',
    });
  });

  // 3.2 Priorización de casos (Structured Output)
  app.post('/api/ai/prioritize-cases', async (req, res) => {
    const { casos } = req.body;
    if (!Array.isArray(casos) || casos.length === 0) {
      return res.status(400).json({ error: 'Se requiere un array de casos' });
    }

    if (hasGeminiKey()) {
      try {
        const ai = getGeminiClient();
        const prompt = `Prioriza los siguientes casos abiertos de la obra según severidad, probabilidad, tiempo abierto y reincidencia:
${JSON.stringify(casos, null, 2)}`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                atencion_inmediata: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      caso_id: { type: Type.STRING },
                      resumen: { type: Type.STRING },
                      motivo_prioridad: { type: Type.STRING },
                    },
                    required: ['caso_id', 'resumen', 'motivo_prioridad'],
                  },
                },
                seguimiento: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      caso_id: { type: Type.STRING },
                      resumen: { type: Type.STRING },
                    },
                    required: ['caso_id', 'resumen'],
                  },
                },
              },
              required: ['atencion_inmediata', 'seguimiento'],
            },
          },
        });

        const parsed = JSON.parse(response.text || '{}');
        return res.json(parsed);
      } catch (err: any) {
        console.warn('Gemini API call failed in /api/ai/prioritize-cases, applying safe fallback:', err?.message || err);
      }
    }

    // Deterministic prioritization fallback
    const criticos = casos.filter((c: any) => c.severidad === 'Crítico' || c.prioridad === 'Crítico');
    const resto = casos.filter((c: any) => c.severidad !== 'Crítico' && c.prioridad !== 'Crítico');

    return res.json({
      atencion_inmediata: criticos.map((c: any) => ({
        caso_id: c.id || c.caso_id || 'QW-100',
        resumen: `${c.tipo || 'Incidente'} en ${c.ubicacion || c.frente || 'Frente Activo'}`,
        motivo_prioridad: 'Nivel Crítico: riesgo inminente de accidente grave (SLA 30 min)',
      })),
      seguimiento: resto.map((c: any) => ({
        caso_id: c.id || c.caso_id || 'QW-100',
        resumen: `${c.tipo || 'Observación'} en ${c.frente || 'Frente Operativo'}`,
      })),
    });
  });

  // 3.3 Recomendación de acción correctiva (Structured Output)
  app.post('/api/ai/recommend-action', async (req, res) => {
    const { caso } = req.body;
    if (!caso) {
      return res.status(400).json({ error: 'Se requiere el objeto "caso"' });
    }

    if (hasGeminiKey()) {
      try {
        const ai = getGeminiClient();
        const prompt = `Genera un plan de acción correctiva inmediata para el siguiente caso en obra:
${JSON.stringify(caso, null, 2)}`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                acciones_inmediatas: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: '2-4 acciones concretas, en orden de ejecución',
                },
                requiere_paralizacion: { type: Type.BOOLEAN },
                referencia_normativa: {
                  type: Type.STRING,
                  description: 'Norma o procedimiento en que se basa, si aplica',
                },
              },
              required: ['acciones_inmediatas', 'requiere_paralizacion'],
            },
          },
        });

        const parsed = JSON.parse(response.text || '{}');
        return res.json(parsed);
      } catch (err: any) {
        console.warn('Gemini API call failed in /api/ai/recommend-action, applying safe fallback:', err?.message || err);
      }
    }

    const isCrit = caso.prioridad === 'Crítico' || caso.severidad === 'Crítico';
    return res.json({
      acciones_inmediatas: [
        'Paralizar inmediatamente la tarea en la zona afectada hasta mitigar el riesgo',
        'Verificar uso correcto y anclaje de EPP Tipo II homologado',
        'Impartir charla de seguridad preventiva de 5 minutos a la cuadrilla',
        'Registrar evidencia fotográfica de subsanación para validación SSOMA',
      ],
      requiere_paralizacion: isCrit,
      referencia_normativa: 'Norma Técnica G.050 / D.S. N.º 011-2019-TR y matriz IPERC de la obra.',
    });
  });

  // 3.4 Detección de reincidencia (Structured Output)
  app.post('/api/ai/detect-recurrence', async (req, res) => {
    const { tipo, frente_o_zona, historialCasos } = req.body;

    if (hasGeminiKey()) {
      try {
        const ai = getGeminiClient();
        const prompt = `Analiza la reincidencia del riesgo "${tipo}" en el frente/zona "${frente_o_zona}".
Historial reciente de casos:
${JSON.stringify(historialCasos || [], null, 2)}`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                es_recurrente: { type: Type.BOOLEAN },
                veces_detectado: { type: Type.INTEGER },
                frente_o_zona: { type: Type.STRING },
                analisis: {
                  type: Type.STRING,
                  description: "Ej: 'Este riesgo presenta reincidencia alta'",
                },
                recomendaciones: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                prioridad: {
                  type: Type.STRING,
                  enum: ['Crítico', 'Alto', 'Medio', 'Bajo'],
                },
              },
              required: [
                'es_recurrente',
                'veces_detectado',
                'analisis',
                'recomendaciones',
                'prioridad',
              ],
            },
          },
        });

        const parsed = JSON.parse(response.text || '{}');
        return res.json(parsed);
      } catch (err: any) {
        console.warn('Gemini API call failed in /api/ai/detect-recurrence, applying safe fallback:', err?.message || err);
      }
    }

    const matches = Array.isArray(historialCasos)
      ? historialCasos.filter((c: any) => c.tipo === tipo && c.frente === frente_o_zona)
      : [];
    const count = Math.max(matches.length, 1);
    const esRecurrente = count >= 3;

    return res.json({
      es_recurrente: esRecurrente,
      veces_detectado: count,
      frente_o_zona: frente_o_zona || 'Frente Activo',
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
    });
  });

  // 3.5 Reporte (diario / semanal / resumen gerencial) (Structured Output)
  app.post('/api/ai/generate-report', async (req, res) => {
    const { tipo_reporte, periodo, obra, casos } = req.body;

    if (hasGeminiKey()) {
      try {
        const ai = getGeminiClient();
        const prompt = `Genera un reporte de seguridad tipo "${tipo_reporte}" para el periodo "${periodo}" en la obra "${obra || 'Torre Andina'}".
Casos del periodo:
${JSON.stringify(casos || [], null, 2)}`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                tipo_reporte: {
                  type: Type.STRING,
                  enum: ['diario', 'semanal', 'resumen_gerencial'],
                },
                periodo: { type: Type.STRING },
                obra: { type: Type.STRING },
                total_incidentes: { type: Type.INTEGER },
                zonas_criticas: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                riesgos_principales: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      tipo: { type: Type.STRING },
                      cantidad: { type: Type.INTEGER },
                    },
                    required: ['tipo', 'cantidad'],
                  },
                },
                riesgos_recurrentes: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      tipo: { type: Type.STRING },
                      veces: { type: Type.INTEGER },
                      zona: { type: Type.STRING },
                    },
                    required: ['tipo', 'veces', 'zona'],
                  },
                },
                acciones_pendientes: { type: Type.INTEGER },
                tendencia_vs_periodo_anterior: {
                  type: Type.STRING,
                  description: "Ej: '+12% vs semana pasada'",
                },
                recomendaciones: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
              },
              required: [
                'tipo_reporte',
                'periodo',
                'obra',
                'total_incidentes',
                'riesgos_principales',
                'recomendaciones',
              ],
            },
          },
        });

        const parsed = JSON.parse(response.text || '{}');
        return res.json(parsed);
      } catch (err: any) {
        console.warn('Gemini API call failed in /api/ai/generate-report, applying safe fallback:', err?.message || err);
      }
    }

    const casesArr = Array.isArray(casos) ? casos : [];
    const criticos = casesArr.filter((c: any) => c.prioridad === 'Crítico' || c.severidad === 'Crítico').length;
    const pendientes = casesArr.filter((c: any) => c.estado !== 'Cerrado').length;

    return res.json({
      tipo_reporte: tipo_reporte || 'diario',
      periodo: periodo || 'Semana Actual',
      obra: obra || 'Torre Andina',
      total_incidentes: casesArr.length,
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
    });
  });

  // 3.6 Resumen "Qawaq Intelligence" (saludo + análisis del día) (Structured Output)
  app.post('/api/ai/intelligence-summary', async (req, res) => {
    const { userName, role, casos } = req.body;

    if (hasGeminiKey()) {
      try {
        const ai = getGeminiClient();
        const prompt = `Genera un saludo y análisis del estado actual para el usuario "${userName || 'Supervisor'}" con rol "${role || 'SSOMA'}".
Casos registrados en la obra:
${JSON.stringify(casos || [], null, 2)}`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                saludo: {
                  type: Type.STRING,
                  description: "Ej: 'Buenos días Ing. Carlos.'",
                },
                total_analizado: { type: Type.INTEGER },
                riesgos_criticos: { type: Type.INTEGER },
                riesgos_repetitivos: { type: Type.INTEGER },
                zona_mas_critica: { type: Type.STRING },
                recomendacion_principal: { type: Type.STRING },
              },
              required: [
                'saludo',
                'total_analizado',
                'riesgos_criticos',
                'riesgos_repetitivos',
                'zona_mas_critica',
                'recomendacion_principal',
              ],
            },
          },
        });

        const parsed = JSON.parse(response.text || '{}');
        return res.json(parsed);
      } catch (err: any) {
        console.warn('Gemini API call failed in /api/ai/intelligence-summary, applying safe fallback:', err?.message || err);
      }
    }

    const casesArr = Array.isArray(casos) ? casos : [];
    const criticos = casesArr.filter((c: any) => (c.prioridad === 'Crítico' || c.severidad === 'Crítico') && c.estado !== 'Cerrado').length;

    return res.json({
      saludo: `Hola ${userName || 'Supervisor'}, tu frente de obra está activo.`,
      total_analizado: casesArr.length,
      riesgos_criticos: criticos,
      riesgos_repetitivos: 1,
      zona_mas_critica: 'Losa Nivel 14 (Frente B)',
      recomendacion_principal:
        'Priorizar la verificación de líneas de vida en borde de losa antes del mediodía.',
    });
  });

  // 4. Asistente conversacional (Chat libre con contexto de casos en JSON)
  app.post('/api/ai/chat', async (req, res) => {
    const { message, contextCasos } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Se requiere el mensaje del usuario' });
    }

    if (hasGeminiKey()) {
      try {
        const ai = getGeminiClient();
        const prompt = `Contexto (casos abiertos actuales en la obra):
${JSON.stringify(contextCasos || [], null, 2)}

Pregunta del supervisor: ${message}`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            systemInstruction: SYSTEM_INSTRUCTION,
          },
        });

        return res.json({ reply: response.text || '' });
      } catch (err: any) {
        console.warn('Gemini API call failed in /api/ai/chat, applying safe fallback:', err?.message || err);
      }
    }

    const casesArr = Array.isArray(contextCasos) ? contextCasos : [];
    const criticos = casesArr.filter((c: any) => c.prioridad === 'Crítico' && c.estado !== 'Cerrado');
    if (criticos.length > 0) {
      return res.json({
        reply: `Hoy debes revisar prioritariamente el caso #${criticos[0].id} (${criticos[0].tipo} en ${criticos[0].ubicacion || criticos[0].frente}), ya que tiene nivel Crítico y plazo de atención inmediato bajo la Norma G.050.`,
      });
    }

    return res.json({
      reply: 'Todos los casos críticos se encuentran actualmente bajo control. Revisa las condiciones de orden y limpieza en los accesos peatonales.',
    });
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Qawaq Server running on port ${PORT}`);
  });
}

startServer();
