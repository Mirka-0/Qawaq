import React, { useState } from 'react';
import {
  Camera,
  MapPin,
  Mic,
  MicOff,
  Send,
  Upload,
  AlertTriangle,
  Navigation,
  RefreshCw,
  Sparkles,
  HardHat,
  Clock,
  UserCheck,
  Radio,
  Volume2,
} from 'lucide-react';
import { SUPERVISOR_LIST, FRENTES_OBRA, TIPO_CONDICIONES, ASSETS } from '../constants';
import { useCases } from '../context/CaseContext';
import { useRole } from '../context/RoleContext';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useGeolocation } from '../hooks/useGeolocation';
import { useUsageStats } from '../hooks/useUsageStats';
import { PriorityLevel, AiClassificationResult, AiRecurrenceResult } from '../types';
import { GeminiService } from '../services/geminiService';

export const ReportScreen: React.FC = () => {
  const { addCase, showToast, setActiveTab, cases } = useCases();
  const { currentUserName, currentRole, isSupervisor } = useRole();
  const { logInteraction } = useUsageStats();

  const [tipo, setTipo] = useState<string>(TIPO_CONDICIONES[0]);
  const [frente, setFrente] = useState<string>(FRENTES_OBRA[0]);
  const [sectorDetalle, setSectorDetalle] = useState<string>('Piso 14 - Losa central');
  const [prioridad, setPrioridad] = useState<PriorityLevel>('Alto');
  const [selectedSupervisorId, setSelectedSupervisorId] = useState<string>(
    SUPERVISOR_LIST[0].id
  );
  const [descripcion, setDescripcion] = useState<string>(
    'Personal realizando trabajo en altura sobre andamio sin arnés anclado a línea de vida certificada.'
  );
  const [fotoUrl, setFotoUrl] = useState<string>(
    'https://images.unsplash.com/photo-1541888946425-d0fbb186156f?w=800&auto=format&fit=crop&q=80'
  );
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // AI Classification & Recurrence Analysis state
  const [isAnalyzingAi, setIsAnalyzingAi] = useState<boolean>(false);
  const [aiClassification, setAiClassification] = useState<AiClassificationResult | null>(null);
  const [aiRecurrence, setAiRecurrence] = useState<AiRecurrenceResult | null>(null);

  const handleAnalyzeWithAi = async () => {
    if (!descripcion.trim()) {
      showToast('Ingresa una descripción del incidente para analizar con IA');
      return;
    }
    setIsAnalyzingAi(true);
    try {
      const [classRes, recurRes] = await Promise.all([
        GeminiService.classifyRisk(descripcion, sectorDetalle, frente),
        GeminiService.detectRecurrence(tipo, frente, cases),
      ]);

      if (classRes) {
        setAiClassification(classRes);
        if (classRes.nivel === 'Crítico' || classRes.nivel === 'Alto' || classRes.nivel === 'Medio') {
          setPrioridad(classRes.nivel);
        }
      }

      if (recurRes) {
        setAiRecurrence(recurRes);
      }

      showToast('Análisis de IA completado según Norma G.050 y D.S. 011-2019-TR');
    } catch (err) {
      console.error('Error analyzing with AI:', err);
    } finally {
      setIsAnalyzingAi(false);
    }
  };

  // Voice Parsing Helper
  const parseVoiceInput = (text: string) => {
    const lower = text.toLowerCase();

    // Condition Auto-selection
    if (lower.includes('casco')) {
      setTipo('Falta de Casco');
    } else if (lower.includes('chaleco')) {
      setTipo('Sin Chaleco');
    } else if (lower.includes('arnés') || lower.includes('altura') || lower.includes('caída')) {
      setTipo('Altura sin Arnés');
      setPrioridad('Crítico');
    } else if (lower.includes('baranda') || lower.includes('borde') || lower.includes('vano')) {
      setTipo('Zona sin Baranda');
      setPrioridad('Crítico');
    } else if (lower.includes('charco') || lower.includes('eléctric') || lower.includes('resbal') || lower.includes('cable')) {
      setTipo('Piso Resbaladizo');
    }

    // Front Auto-selection
    if (lower.includes('frente sur') || lower.includes('excavación')) {
      setFrente('Frente Sur (Excavación)');
    } else if (lower.includes('losa') || lower.includes('piso 14') || lower.includes('frente b')) {
      setFrente('Frente B (Losa Piso 14)');
    } else if (lower.includes('fachada') || lower.includes('torre')) {
      setFrente('Frente A (Torre Principal)');
    }

    // Priority Auto-selection
    if (lower.includes('crítico') || lower.includes('inmediato') || lower.includes('urgente') || lower.includes('parar')) {
      setPrioridad('Crítico');
    } else if (lower.includes('medio') || lower.includes('leve')) {
      setPrioridad('Medio');
    }
  };

  // Speech Recognition Hook
  const {
    isListening,
    transcript,
    isSupported: speechSupported,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition({
    onResult: (text) => {
      setDescripcion((prev) => (prev ? `${prev} ${text}` : text));
      parseVoiceInput(text);
      showToast('🎙️ Dictado por voz procesado con auto-detección');
    },
  });

  const handleSimulatedVoice = (demoText: string) => {
    setDescripcion(demoText);
    parseVoiceInput(demoText);
    showToast('🎙️ Transcripción por voz simulada con éxito');
  };

  // Geolocation Hook
  const {
    coordinates,
    isLoading: geoLoading,
    error: geoError,
    refreshLocation,
  } = useGeolocation();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setFotoUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const isUnassigned = selectedSupervisorId === 'unassigned';
    const chosenSup = isUnassigned
      ? null
      : SUPERVISOR_LIST.find((s) => s.id === selectedSupervisorId) || null;

    const newCase = addCase({
      tipo,
      frente,
      ubicacion: sectorDetalle,
      prioridad,
      urgencia: prioridad === 'Crítico' ? 'Alto' : prioridad === 'Alto' ? 'Medio' : 'Bajo',
      asignadoA: chosenSup ? { nombre: chosenSup.nombre, rol: chosenSup.rol } : null,
      responsable: chosenSup ? chosenSup.nombre : 'Sin Asignar (Pendiente SSOMA)',
      detectadoPor: `${currentUserName} (${currentRole})`,
      fotoUrl,
      descripcion,
      confianzaIA: 98,
      coordenadas: coordinates || {
        lat: -12.096841,
        lng: -77.035219,
        accuracy: 4,
        altitude: 104,
        timestamp: Date.now(),
        origen: 'CALIBRADO_OBRA',
      },
    });

    logInteraction('reporte', `Incidente #${newCase.id} reportado en ${frente}: ${tipo}`);
    showToast(
      isUnassigned
        ? `Caso #${newCase.id} creado como "Abierto"`
        : `Caso #${newCase.id} asignado a ${chosenSup?.nombre}`
    );

    setTimeout(() => {
      setIsSubmitting(false);
      if (isSupervisor) {
        setActiveTab('mis-pendientes');
      } else {
        setActiveTab('dashboard');
      }
    }, 400);
  };

  return (
    <div className="flex flex-col w-full px-3 sm:px-6 lg:px-8 pt-3 pb-24 gap-4 max-w-md sm:max-w-2xl md:max-w-3xl lg:max-w-4xl mx-auto animate-fade-in">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] text-[#f59e0b] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#f59e0b]/15 border border-[#f59e0b]/30">
              FORMULARIO DE CAMPO · QAWAQ
            </span>
          </div>
          <h1 className="font-['Chivo'] font-black text-xl sm:text-2xl text-[#dae2fd] uppercase tracking-tight mt-1">
            Reportar Condición Subestándar
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Photo Evidence Upload Box */}
        <div id="camera-capture-box" className="bg-[#131b2e] border border-[#222a3d] rounded-2xl p-4 shadow-xl space-y-3">
          <label className="block text-xs font-mono font-bold uppercase text-[#dae2fd] flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Camera className="w-4 h-4 text-[#f59e0b]" /> Registro Fotográfico del Hallazgo:
            </span>
            <span className="text-[10px] text-[#94a3b8]">JPG / PNG / Cámara</span>
          </label>

          <div className="relative aspect-video rounded-xl overflow-hidden bg-[#060e20] border-2 border-dashed border-[#334155] group hover:border-[#f59e0b] transition-colors">
            {fotoUrl ? (
              <img
                src={fotoUrl}
                alt="Evidencia fotográfica"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-[#64748b] gap-2 p-4 text-center">
                <Upload className="w-8 h-8" />
                <span className="font-mono text-xs">Toca o arrastra una fotografía</span>
              </div>
            )}

            <label className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
              <Camera className="w-8 h-8 text-[#f59e0b] mb-1" />
              <span className="font-['Chivo'] font-bold text-xs text-white uppercase tracking-wider">
                Cambiar Fotografía
              </span>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>

          {/* Quick CCTV Photo Selector */}
          <div className="space-y-1.5 pt-1">
            <div className="text-[10px] font-mono uppercase text-[#94a3b8] flex items-center justify-between font-bold">
              <span>Evidencia Fotográfica Rápida (Cámaras 1 a 5):</span>
              <span className="text-[#f59e0b]">Toca para asignar</span>
            </div>
            <div className="grid grid-cols-5 gap-1.5">
              {[
                { url: ASSETS.cctv1, label: 'CAM 01' },
                { url: ASSETS.cctv2, label: 'CAM 02' },
                { url: ASSETS.cctv3, label: 'CAM 03' },
                { url: ASSETS.cctv4, label: 'CAM 04' },
                { url: ASSETS.cctv5, label: 'CAM 05' },
              ].map((c, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setFotoUrl(c.url)}
                  className={`relative aspect-video rounded-lg overflow-hidden border transition-all ${
                    fotoUrl === c.url
                      ? 'border-[#f59e0b] ring-2 ring-[#f59e0b]/60 scale-105 shadow-md'
                      : 'border-[#1e293b] opacity-60 hover:opacity-100 hover:border-[#334155]'
                  }`}
                >
                  <img src={c.url} alt={c.label} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-0.5">
                    <span className="font-mono text-[7px] font-black text-white truncate">
                      {c.label}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* GPS Geolocation Banner */}
        <div className="bg-[#131b2e] border border-[#222a3d] rounded-2xl p-3.5 shadow-xl flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-[#10b981]/15 text-[#10b981] flex items-center justify-center border border-[#10b981]/30 shrink-0">
              <Navigation className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="font-mono text-[10px] uppercase text-[#94a3b8] font-bold">
                Coordenadas GPS de Campo (Automático)
              </div>
              <div className="font-mono text-xs text-[#dae2fd] truncate">
                {geoLoading ? (
                  <span className="text-[#f59e0b]">Capturando satélites GPS...</span>
                ) : coordinates ? (
                  `${coordinates.lat.toFixed(6)}, ${coordinates.lng.toFixed(6)} (±${Math.round(coordinates.accuracy)}m)`
                ) : (
                  '-12.096841, -77.035219 (Fijo Torre Andina)'
                )}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={refreshLocation}
            className="p-2 rounded-xl bg-[#1e293b] hover:bg-[#283548] text-[#94a3b8] hover:text-[#dae2fd] border border-[#334155] transition-colors"
            title="Refrescar posición GPS"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${geoLoading ? 'animate-spin text-[#f59e0b]' : ''}`} />
          </button>
        </div>

        {/* Risk Classification & Location */}
        <div className="bg-[#131b2e] border border-[#222a3d] rounded-2xl p-4 shadow-xl space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-mono uppercase text-[#94a3b8] font-bold mb-1">
                Tipo de Condición Subestándar:
              </label>
              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
                className="w-full bg-[#070d18] border border-[#222a3d] rounded-xl px-3 py-2 text-xs text-[#dae2fd] font-mono focus:border-[#f59e0b] outline-none"
              >
                {TIPO_CONDICIONES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-mono uppercase text-[#94a3b8] font-bold mb-1">
                Frente Operativo:
              </label>
              <select
                value={frente}
                onChange={(e) => setFrente(e.target.value)}
                className="w-full bg-[#070d18] border border-[#222a3d] rounded-xl px-3 py-2 text-xs text-[#dae2fd] font-mono focus:border-[#f59e0b] outline-none"
              >
                {FRENTES_OBRA.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-mono uppercase text-[#94a3b8] font-bold mb-1">
              Sector Específico / Losa / Nivel:
            </label>
            <input
              type="text"
              required
              value={sectorDetalle}
              onChange={(e) => setSectorDetalle(e.target.value)}
              placeholder="Ej. Piso 14 - Losa central, frente a ducto de ascensores"
              className="w-full bg-[#070d18] border border-[#222a3d] rounded-xl px-3 py-2 text-xs text-[#dae2fd] font-mono focus:border-[#f59e0b] outline-none"
            />
          </div>

          {/* Priority & Assignee Configuration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#1e293b]">
            <div>
              <label className="block text-[10px] font-mono uppercase text-[#94a3b8] font-bold mb-1 flex items-center gap-1">
                <Clock className="w-3 h-3 text-[#f59e0b]" /> Prioridad & Plazo SLA:
              </label>
              <div className="grid grid-cols-3 gap-1">
                {(['Crítico', 'Alto', 'Medio'] as PriorityLevel[]).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPrioridad(p)}
                    className={`py-1.5 px-1 rounded-lg font-mono text-[10px] uppercase font-bold border transition-all ${
                      prioridad === p
                        ? p === 'Crítico'
                          ? 'bg-red-500 text-white border-red-300'
                          : p === 'Alto'
                          ? 'bg-[#f59e0b] text-[#2a1700] border-[#ffddb8]'
                          : 'bg-cyan-500 text-[#022c22] border-cyan-300'
                        : 'bg-[#0b1326] text-[#94a3b8] border-[#1e293b]'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
              <span className="text-[9px] font-mono text-[#64748b] block mt-1">
                {prioridad === 'Crítico'
                  ? 'SLA 30 min (Inmediato)'
                  : prioridad === 'Alto'
                  ? 'SLA 2 horas (Urgente)'
                  : 'SLA 24 horas (Estándar)'}
              </span>
            </div>

            <div>
              <label className="block text-[10px] font-mono uppercase text-[#94a3b8] font-bold mb-1 flex items-center gap-1">
                <HardHat className="w-3 h-3 text-[#10b981]" /> Asignar Responsable en Campo:
              </label>
              <select
                value={selectedSupervisorId}
                onChange={(e) => setSelectedSupervisorId(e.target.value)}
                className="w-full bg-[#070d18] border border-[#222a3d] rounded-xl px-2.5 py-2 text-xs text-[#dae2fd] font-mono focus:border-[#f59e0b] outline-none"
              >
                <option value="unassigned">Sin Asignar (Dejar Abierto para SSOMA)</option>
                {SUPERVISOR_LIST.map((sup) => (
                  <option key={sup.id} value={sup.id}>
                    {sup.nombre} ({sup.rol})
                  </option>
                ))}
              </select>
              <span className="text-[9px] font-mono text-[#64748b] block mt-1">
                {selectedSupervisorId === 'unassigned'
                  ? 'Nacerá como "Abierto"'
                  : 'Nacerá directo como "Asignado"'}
              </span>
            </div>
          </div>

          {/* Hands-Free Voice Recognition Module */}
          <div className="rounded-xl p-3 bg-[#070d18] border border-[#222a3d] space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                    isListening
                      ? 'bg-red-500 text-white'
                      : 'bg-[#f59e0b]/20 text-[#f59e0b] border border-[#f59e0b]/40'
                  }`}
                >
                  <Mic className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="font-mono text-[10px] uppercase font-bold text-white block">
                    Reporte por Voz Manos Libres
                  </span>
                  <span className="font-mono text-[8px] text-[#94a3b8]">
                    {isListening
                      ? '🎙️ Grabando audio en directo... Habla claro'
                      : 'Presiona el micrófono para dictar sin usar las manos'}
                  </span>
                </div>
              </div>

              <button
                id="voice-dictation-btn"
                type="button"
                onClick={isListening ? stopListening : startListening}
                className={`px-3 py-1.5 rounded-xl font-mono text-[10px] font-bold uppercase transition-all flex items-center gap-1.5 active:scale-95 shadow-md ${
                  isListening
                    ? 'bg-red-600 hover:bg-red-700 text-white shadow-red-600/30'
                    : 'bg-[#f59e0b] hover:bg-[#d97706] text-[#2a1700] shadow-[#f59e0b]/20'
                }`}
              >
                {isListening ? (
                  <>
                    <MicOff className="w-3.5 h-3.5" />
                    <span>Detener</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-3.5 h-3.5" />
                    <span>Iniciar Voz</span>
                  </>
                )}
              </button>
            </div>

            {/* Simulated Voice Quick Presets for Demo */}
            <div className="space-y-1">
              <span className="text-[9px] font-mono text-[#64748b] block uppercase">
                Probar Dictado Inteligente con Auto-Selección:
              </span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() =>
                    handleSimulatedVoice(
                      'Operario armando fierro en altura sin arnés ni línea de vida en Frente B Losa Piso 14 riesgo crítico'
                    )
                  }
                  className="px-2 py-1 rounded-lg bg-[#131b2e] hover:bg-[#1e293b] text-[#cbd5e1] font-mono text-[9px] border border-[#334155] transition-colors"
                >
                  🎙️ "Operario en altura sin arnés en Piso 14 riesgo crítico"
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleSimulatedVoice(
                      'Cuadrilla transitando por rampa vehicular sin chaleco reflectivo en Frente Sur'
                    )
                  }
                  className="px-2 py-1 rounded-lg bg-[#131b2e] hover:bg-[#1e293b] text-[#cbd5e1] font-mono text-[9px] border border-[#334155] transition-colors"
                >
                  🎙️ "Sin chaleco en rampa de Frente Sur"
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleSimulatedVoice(
                      'Charco de agua con cables eléctricos expuestos y carretilla en sótano'
                    )
                  }
                  className="px-2 py-1 rounded-lg bg-[#131b2e] hover:bg-[#1e293b] text-[#cbd5e1] font-mono text-[9px] border border-[#334155] transition-colors"
                >
                  🎙️ "Charco con cables eléctricos y riesgo de resbalón"
                </button>
              </div>
            </div>

            {/* Description Textarea */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-label text-xs uppercase text-[#94a3b8] font-bold">
                  Transcripción / Descripción del Incidente:
                </label>
                {transcript && (
                  <span className="font-mono text-[9px] text-emerald-400">● Reconociendo voz</span>
                )}
              </div>
              <textarea
                rows={3}
                required
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Detalla qué está ocurriendo, cantidad de personas en riesgo y equipo involucrado..."
                className="w-full bg-[#0b1326] border border-[#222a3d] rounded-xl p-3 text-xs text-[#dae2fd] font-body focus:border-[#f59e0b] outline-none leading-relaxed"
              />

              {/* Button to run Gemini Structured Analysis */}
              <div className="mt-2 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={handleAnalyzeWithAi}
                  disabled={isAnalyzingAi || !descripcion.trim()}
                  className="px-3 py-1.5 rounded-xl bg-[#1e293b] hover:bg-[#283548] disabled:opacity-40 text-[#dae2fd] font-label font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 border border-[#334155] transition-all active:scale-95"
                >
                  <Sparkles className={`w-3.5 h-3.5 ${isAnalyzingAi ? 'animate-spin text-[#f59e0b]' : 'text-[#f59e0b]'}`} />
                  <span>{isAnalyzingAi ? 'Analizando con IA...' : 'Analizar Riesgo con IA (Norma G.050)'}</span>
                </button>
                <span className="font-mono text-[9px] text-[#64748b]">
                  Autoclasificación IPERC
                </span>
              </div>
            </div>

            {/* AI Insights Card if available */}
            {aiClassification && (
              <div className="p-3 bg-[#0b1326] border border-amber-500/40 rounded-xl space-y-2 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-base">{aiClassification.icono_categoria}</span>
                    <span className="font-headline font-bold text-xs text-white uppercase">
                      {aiClassification.categoria}
                    </span>
                  </div>
                  <span
                    className={`font-label text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                      aiClassification.nivel === 'Crítico'
                        ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                        : aiClassification.nivel === 'Alto'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    }`}
                  >
                    Nivel: {aiClassification.nivel}
                  </span>
                </div>

                <p className="font-body text-xs text-[#cbd5e1] leading-relaxed">
                  {aiClassification.justificacion}
                </p>

                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#1e293b] font-mono text-[10px] text-[#94a3b8]">
                  <div>Probabilidad: <strong className="text-white font-bold">{aiClassification.probabilidad}</strong></div>
                  <div>Severidad: <strong className="text-white font-bold">{aiClassification.severidad}</strong></div>
                </div>

                {/* Recurrence Warning if applicable */}
                {aiRecurrence && aiRecurrence.es_recurrente && (
                  <div className="p-2 bg-red-950/40 border border-red-500/50 rounded-lg flex items-start gap-2 text-red-200 font-body text-xs mt-1">
                    <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-headline uppercase text-[11px] block text-red-300">
                        Riesgo Recurrente Detectado ({aiRecurrence.veces_detectado} veces)
                      </strong>
                      <span>{aiRecurrence.analisis}</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <button
          id="submit-report-btn"
          type="submit"
          disabled={isSubmitting}
          className="w-full h-13 py-3 px-4 rounded-xl bg-[#f59e0b] hover:bg-[#d97706] disabled:opacity-50 text-[#2a1700] font-headline font-black text-sm uppercase tracking-wide flex items-center justify-center gap-2 shadow-lg shadow-[#f59e0b]/25 transition-all active:scale-95"
        >
          <Send className="w-4 h-4" />
          <span>{isSubmitting ? 'Registrando en Obra...' : 'Generar Reporte Oficial'}</span>
        </button>
      </form>
    </div>
  );
};
