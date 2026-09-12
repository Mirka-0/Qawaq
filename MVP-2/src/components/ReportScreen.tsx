import React, { useState, useRef } from 'react';
import {
  Zap,
  Timer,
  Camera,
  MapPin,
  RefreshCw,
  Mic,
  MicOff,
  Volume2,
  Trash2,
  Sparkles,
  Send,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  HardHat,
  ShieldAlert,
  Shield,
  Upload,
  Navigation,
  Crosshair,
} from 'lucide-react';
import { ASSETS, RISK_TYPES, WORK_FRONTS } from '../constants';
import { useCases } from '../context/CaseContext';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useGeolocation } from '../hooks/useGeolocation';
import { useUsageStats } from '../hooks/useUsageStats';
import { RiskType, UrgencyLevel } from '../types';

export const ReportScreen: React.FC = () => {
  const { addCase, showToast, setActiveTab, setSelectedCaseForClosureId } = useCases();
  const { logInteraction } = useUsageStats();

  // Automatic GPS Geolocation Hook
  const {
    coordinates,
    isLoading: isGpsLoading,
    error: gpsError,
    isLiveGps,
    refreshLocation: refreshGps,
    formatCoordinates,
  } = useGeolocation();

  const [selectedRisk, setSelectedRisk] = useState<RiskType>('Falta de Casco');
  const [selectedLocation, setSelectedLocation] = useState<string>(WORK_FRONTS[0].name);
  const [selectedUrgency, setSelectedUrgency] = useState<UrgencyLevel>('Alto');
  const [description, setDescription] = useState<string>(
    'Operario realizando armado de fierro sin casco de seguridad reglamentario bajo gancho de grúa.'
  );
  const [photoPreview, setPhotoPreview] = useState<string>(ASSETS.cctv1);
  const [submittedModalOpen, setSubmittedModalOpen] = useState<boolean>(false);
  const [createdCaseId, setCreatedCaseId] = useState<string>('QW-104');
  const [voiceNotice, setVoiceNotice] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const textBeforeDictationRef = useRef<string>('');

  // Native SpeechRecognition Hook
  const {
    isListening,
    interimTranscript,
    isSupported,
    error: speechError,
    startListening,
    stopListening,
  } = useSpeechRecognition({
    lang: 'es-PE',
    continuous: true,
    interimResults: true,
    onResult: (finalText) => {
      const base = textBeforeDictationRef.current.trim();
      const combined = base ? `${base} ${finalText.trim()}` : finalText.trim();
      setDescription(combined);
    },
    onError: (err) => {
      setVoiceNotice(err);
      showToast(err);
    },
    onEnd: () => {
      setVoiceNotice(null);
    },
  });

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setPhotoPreview(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVoiceToggle = () => {
    if (isListening) {
      stopListening();
      logInteraction('otro', 'Dictado por voz finalizado en Detalle del Incidente');
      showToast('Dictado por voz detenido y registrado');
    } else {
      textBeforeDictationRef.current = description;
      if (!isSupported) {
        // Safe fallback for environments with restricted speech APIs
        setVoiceNotice('Navegador sin SpeechRecognition nativo. Insertando dictado asistido.');
        showToast('Navegador sin Web Speech API: agregando nota asistida');
        setTimeout(() => {
          setDescription((prev) =>
            prev.trim()
              ? `${prev.trim()} [Dictado: Personal detectado en zona de izaje sin barbiquejo reglamentario].`
              : 'Personal detectado en zona de izaje sin barbiquejo reglamentario.'
          );
          logInteraction('otro', 'Nota de voz asistida incorporada');
          showToast('Nota técnica incorporada con éxito');
          setVoiceNotice(null);
        }, 1200);
        return;
      }

      startListening({ append: true });
      showToast('Micrófono activado · Hable con claridad en obra para dictar el detalle');
      logInteraction('otro', 'Iniciado dictado por voz SpeechRecognition en Detalle del Incidente');
    }
  };

  const handleQuickInsert = (phrase: string) => {
    setDescription((prev) => {
      const trimmed = prev.trim();
      return trimmed ? `${trimmed} ${phrase}` : phrase;
    });
    showToast('Frase técnica incorporada');
  };

  const handleClearDescription = () => {
    setDescription('');
    textBeforeDictationRef.current = '';
    showToast('Detalle del incidente limpiado');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedRisk || !selectedLocation) {
      showToast('Por favor selecciona tipo de riesgo y ubicación');
      return;
    }

    const created = addCase({
      tipo: selectedRisk,
      ubicacion: selectedLocation.split('(')[0].trim(),
      frente: selectedLocation,
      urgencia: selectedUrgency,
      estado: 'Abierto',
      detectadoPor: 'Reporte Manual',
      responsable: 'Ing. Carlos Mendoza (Prevencionista)',
      fotoUrl: photoPreview,
      descripcion: description.trim(),
      coordenadas: coordinates,
    });

    setCreatedCaseId(created.id);
    setSelectedCaseForClosureId(created.id);
    setSubmittedModalOpen(true);
    logInteraction('reporte', `Reporte manual #${created.id} emitido: ${selectedRisk} en ${selectedLocation}`);
    showToast(`Reporte #${created.id} registrado y notificado con éxito`);
  };

  const resetForm = () => {
    setSubmittedModalOpen(false);
    setSelectedRisk('Falta de Casco');
    setDescription('');
  };

  return (
    <div className="flex flex-col w-full px-3 sm:px-6 lg:px-8 pt-3 pb-24 gap-4 max-w-md sm:max-w-2xl md:max-w-4xl lg:max-w-5xl mx-auto">
      {/* 1. Top Wizard Progress Banner */}
      <div className="w-full bg-[#131b2e] rounded-2xl p-3.5 border border-[#222a3d] flex flex-col gap-2 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-[#f59e0b]/20 flex items-center justify-center text-[#f59e0b]">
              <Zap className="w-3.5 h-3.5 fill-[#f59e0b]" />
            </div>
            <span className="font-['Chivo'] font-bold text-xs text-[#ffb95f] uppercase tracking-wide">
              Reporte de Campo Express
            </span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#1e293b] border border-[#334155]">
            <Timer className="w-3 h-3 text-[#10b981] animate-pulse" />
            <span className="font-mono text-[10px] text-[#10b981] font-bold">~25 SEG</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-[#1e293b] h-2 rounded-full overflow-hidden flex">
          <div className="bg-[#f59e0b] h-full w-2/3 rounded-full transition-all duration-500 ease-out" />
        </div>

        <div className="flex justify-between items-center text-[#94a3b8] font-mono text-[9px]">
          <span>PASO 2 DE 3: VERIFICACIÓN</span>
          <span className="font-bold text-[#ffb95f]">66% COMPLETADO</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* 2. Evidencia Fotográfica */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="font-['Chivo'] font-bold text-xs text-[#dae2fd] flex items-center gap-1.5 uppercase">
              <Camera className="w-4 h-4 text-[#f59e0b]" />
              Evidencia Fotográfica
            </label>
            <span className="font-mono text-[9px] px-2 py-0.5 rounded bg-[#10b981]/15 text-[#34d399] font-semibold border border-[#10b981]/30">
              CAPTURA CCTV
            </span>
          </div>

          <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-[#060e20] border border-[#222a3d] shadow-xl group">
            <img
              src={photoPreview}
              alt="Evidencia fotográfica del riesgo"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#060e20]/90 via-transparent to-[#060e20]/40 pointer-events-none" />

            {/* Infracción overlay tag */}
            <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 pointer-events-none">
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-[#ef4444]/90 text-white backdrop-blur-md shadow text-[9px] font-mono font-bold uppercase tracking-wide">
                <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                PUNTO DE RIESGO IDENTIFICADO
              </div>
              <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-[#060e20]/80 text-[#94a3b8] backdrop-blur-md font-mono text-[8px]">
                <span>SITE_CAM_04 // PISO 14</span>
              </div>
            </div>

            {/* Bottom tools over photo */}
            <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-[#0b1326]/90 text-[#dae2fd] backdrop-blur-md max-w-[70%] border border-[#1e293b]">
                <MapPin className="w-3 h-3 text-[#f59e0b] shrink-0" />
                <span className="font-mono text-[9px] truncate">
                  Lat -12.086, Long -77.032 (Torre 2)
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center justify-center gap-1 px-2.5 py-1.5 bg-[#1e293b]/90 hover:bg-[#283548] text-[#dae2fd] rounded-lg backdrop-blur-md transition-all font-mono text-[9px] uppercase border border-[#334155] active:scale-95 shadow-md"
                >
                  <Upload className="w-3 h-3 text-[#f59e0b]" />
                  <span>Subir</span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setPhotoPreview(
                      photoPreview === ASSETS.cctv1 ? ASSETS.cctv2 : ASSETS.cctv1
                    )
                  }
                  className="flex items-center justify-center gap-1 px-2.5 py-1.5 bg-[#1e293b]/90 hover:bg-[#283548] text-[#dae2fd] rounded-lg backdrop-blur-md transition-all font-mono text-[9px] uppercase border border-[#334155] active:scale-95 shadow-md"
                >
                  <RefreshCw className="w-3 h-3 text-[#f59e0b]" />
                  <span>Retomar</span>
                </button>
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoUpload}
            />
          </div>
        </div>

        {/* 3. Tipo de Riesgo (Chips Grid) */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="font-['Chivo'] font-bold text-xs text-[#dae2fd] flex items-center gap-1.5 uppercase">
              <ShieldAlert className="w-4 h-4 text-[#f59e0b]" />
              Tipo de Riesgo
            </span>
            <span className="font-mono text-[9px] text-[#94a3b8] uppercase">
              SELECCIÓN RÁPIDA
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {RISK_TYPES.map((risk) => {
              const isSelected = selectedRisk === risk.id;
              return (
                <button
                  key={risk.id}
                  type="button"
                  onClick={() => setSelectedRisk(risk.id)}
                  className={`min-h-[46px] px-3 py-2 rounded-xl flex items-center gap-2 text-left transition-all active:scale-95 font-sans text-xs border ${
                    isSelected
                      ? 'bg-[#f59e0b] text-[#2a1700] font-bold border-[#ffddb8] shadow-md shadow-[#f59e0b]/20'
                      : 'bg-[#131b2e] text-[#94a3b8] hover:bg-[#1a2337] border-[#222a3d]'
                  }`}
                >
                  {isSelected ? (
                    <CheckCircle2 className="w-4 h-4 text-[#2a1700] shrink-0" />
                  ) : (
                    <HardHat className="w-4 h-4 opacity-40 shrink-0" />
                  )}
                  <span className="truncate">{risk.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. Ubicación / Frente de Obra */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="obra-location"
            className="font-['Chivo'] font-bold text-xs text-[#dae2fd] flex items-center gap-1.5 uppercase"
          >
            <MapPin className="w-4 h-4 text-[#f59e0b]" />
            Ubicación / Frente de Obra
          </label>
          <div className="relative">
            <select
              id="obra-location"
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full h-12 px-3.5 pr-9 rounded-xl bg-[#131b2e] text-[#dae2fd] font-sans text-xs border border-[#222a3d] focus:outline-none focus:border-[#f59e0b] shadow-inner appearance-none cursor-pointer"
            >
              {WORK_FRONTS.map((wf) => (
                <option key={wf.id} value={wf.name} className="bg-[#0b1326] text-[#dae2fd]">
                  {wf.name}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#94a3b8]">
              ▼
            </div>
          </div>

          {/* Automatic GPS Geolocation Pinning Widget */}
          <div className="mt-1.5 p-3 rounded-xl bg-[#0b1326] border border-[#1e293b] flex flex-col gap-2 shadow-inner">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div
                  className={`p-1.5 rounded-lg flex items-center justify-center shrink-0 ${
                    isLiveGps ? 'bg-[#10b981]/20 text-[#10b981]' : 'bg-[#f59e0b]/20 text-[#f59e0b]'
                  }`}
                >
                  <Crosshair className={`w-4 h-4 ${isGpsLoading ? 'animate-spin' : ''}`} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-[9px] uppercase font-bold text-[#94a3b8] truncate">
                      Punto GPS Fijado Automáticamente
                    </span>
                    <span
                      className={`font-mono text-[8px] px-1.5 py-0.2 rounded font-bold uppercase shrink-0 ${
                        isLiveGps
                          ? 'bg-[#10b981]/20 text-[#34d399] border border-[#10b981]/40'
                          : 'bg-[#f59e0b]/20 text-[#ffc174] border border-[#f59e0b]/40'
                      }`}
                    >
                      {isLiveGps ? 'GPS Satelital' : 'Calibrado Obra'}
                    </span>
                  </div>
                  <span className="font-mono text-[11px] text-[#dae2fd] font-bold truncate block">
                    {isGpsLoading ? 'Adquiriendo fijación satelital...' : formatCoordinates()}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={refreshGps}
                disabled={isGpsLoading}
                className="px-2 py-1 rounded-lg bg-[#1e293b] hover:bg-[#283548] border border-[#334155] text-[#94a3b8] hover:text-[#dae2fd] font-mono text-[9px] uppercase flex items-center gap-1 active:scale-95 transition-all shrink-0"
                title="Recalibrar señal GPS del dispositivo"
              >
                <RefreshCw className={`w-3 h-3 text-[#f59e0b] ${isGpsLoading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Recalibrar</span>
              </button>
            </div>

            <div className="flex items-center justify-between text-[9px] font-mono border-t border-[#1e293b] pt-1.5 text-[#64748b]">
              <span className="flex items-center gap-1 text-[#10b981]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-ping" />
                <span>Precisión: ±{coordinates.accuracy || 3.5}m</span>
                {coordinates.altitude && <span>· Alt: {coordinates.altitude}m</span>}
              </span>
              <span className="text-[#94a3b8]">
                {coordinates.lat.toFixed(5)}, {coordinates.lng.toFixed(5)}
              </span>
            </div>
          </div>
        </div>

        {/* 5. Nivel de Urgencia */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="font-['Chivo'] font-bold text-xs text-[#dae2fd] flex items-center gap-1.5 uppercase">
              <AlertTriangle className="w-4 h-4 text-[#f59e0b]" />
              Nivel de Urgencia
            </label>
            <span
              className={`font-mono text-[9px] font-bold uppercase ${
                selectedUrgency === 'Alto'
                  ? 'text-[#ef4444]'
                  : selectedUrgency === 'Medio'
                  ? 'text-[#f59e0b]'
                  : 'text-[#10b981]'
              }`}
            >
              {selectedUrgency === 'Alto' ? 'CRÍTICO REQUIERE ACCIÓN' : 'ESTÁNDAR OPERATIVO'}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {/* Bajo */}
            <button
              type="button"
              onClick={() => setSelectedUrgency('Bajo')}
              className={`min-h-[48px] rounded-xl flex flex-col items-center justify-center p-1.5 border transition-all active:scale-95 ${
                selectedUrgency === 'Bajo'
                  ? 'bg-[#10b981] text-[#022c22] border-[#a7f3d0] font-bold shadow-md shadow-[#10b981]/25'
                  : 'bg-[#131b2e] text-[#94a3b8] border-[#222a3d]'
              }`}
            >
              <span className="font-['Chivo'] font-bold text-xs uppercase">Bajo</span>
              <span className="font-mono text-[8px] opacity-80">Preventivo</span>
            </button>

            {/* Medio */}
            <button
              type="button"
              onClick={() => setSelectedUrgency('Medio')}
              className={`min-h-[48px] rounded-xl flex flex-col items-center justify-center p-1.5 border transition-all active:scale-95 ${
                selectedUrgency === 'Medio'
                  ? 'bg-[#f59e0b] text-[#2a1700] border-[#ffddb8] font-bold shadow-md shadow-[#f59e0b]/25'
                  : 'bg-[#131b2e] text-[#94a3b8] border-[#222a3d]'
              }`}
            >
              <span className="font-['Chivo'] font-bold text-xs uppercase">Medio</span>
              <span className="font-mono text-[8px] opacity-80">48 Horas</span>
            </button>

            {/* Alto */}
            <button
              type="button"
              onClick={() => setSelectedUrgency('Alto')}
              className={`min-h-[48px] rounded-xl flex flex-col items-center justify-center p-1.5 border transition-all active:scale-95 ${
                selectedUrgency === 'Alto'
                  ? 'bg-[#ef4444] text-white border-[#fca5a5] font-bold shadow-md shadow-[#ef4444]/30'
                  : 'bg-[#131b2e] text-[#94a3b8] border-[#222a3d]'
              }`}
            >
              <div className="flex items-center gap-1">
                <span className="font-['Chivo'] font-bold text-xs uppercase">Alto</span>
              </div>
              <span className="font-mono text-[8px] opacity-90">Parada Trabajo</span>
            </button>
          </div>
        </div>

        {/* 6. Detalle del Incidente con Reconocimiento de Voz SpeechRecognition */}
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label
              htmlFor="report-desc"
              className="font-['Chivo'] font-bold text-xs text-[#dae2fd] flex items-center gap-1.5 uppercase"
            >
              <Shield className="w-4 h-4 text-[#f59e0b]" />
              Detalle del Incidente
            </label>

            <div className="flex items-center gap-1.5">
              {description && (
                <button
                  type="button"
                  onClick={handleClearDescription}
                  title="Limpiar descripción"
                  className="flex items-center gap-1 px-2 py-1 rounded-lg text-[#94a3b8] hover:text-[#ef4444] hover:bg-[#1e293b] font-mono text-[9px] uppercase border border-transparent hover:border-[#334155] transition-all"
                >
                  <Trash2 className="w-3 h-3" />
                  <span className="hidden sm:inline">Limpiar</span>
                </button>
              )}

              {/* Native SpeechRecognition Voice-to-Text Button */}
              <button
                type="button"
                id="voice-dictation-btn"
                onClick={handleVoiceToggle}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all border shadow-md active:scale-95 ${
                  isListening
                    ? 'bg-[#ef4444] hover:bg-[#dc2626] text-white border-[#fca5a5] shadow-[#ef4444]/30 animate-pulse'
                    : 'bg-[#f59e0b]/15 text-[#f59e0b] border-[#f59e0b]/30 hover:bg-[#f59e0b]/25 shadow-[#f59e0b]/10'
                }`}
              >
                {isListening ? (
                  <>
                    <MicOff className="w-3.5 h-3.5" />
                    <span className="font-mono text-[10px] font-bold uppercase tracking-wider">
                      Detener Dictado
                    </span>
                    {/* Live audio waves */}
                    <div className="flex items-center gap-0.5 ml-1">
                      <span className="w-1 h-3 bg-white rounded-full animate-bounce [animation-delay:0ms]" />
                      <span className="w-1 h-4 bg-white rounded-full animate-bounce [animation-delay:150ms]" />
                      <span className="w-1 h-2 bg-white rounded-full animate-bounce [animation-delay:300ms]" />
                    </div>
                  </>
                ) : (
                  <>
                    <Mic className="w-3.5 h-3.5 text-[#f59e0b]" />
                    <span className="font-mono text-[10px] font-bold uppercase tracking-wider">
                      Dictar por Voz
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Active Listening Real-Time Feedback Banner */}
          {isListening && (
            <div className="bg-[#0b1326] border border-[#ef4444]/40 rounded-xl p-2.5 flex items-center justify-between gap-2 shadow-inner">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444] animate-ping shrink-0" />
                <div className="flex flex-col min-w-0">
                  <span className="font-mono text-[9px] text-[#ef4444] font-bold uppercase tracking-wider">
                    Micrófono en Vivo (SpeechRecognition API es-PE)
                  </span>
                  <span className="font-sans text-xs text-[#dae2fd] italic truncate">
                    {interimTranscript ? `"${interimTranscript}..."` : 'Hable ahora: dictando directamente al reporte...'}
                  </span>
                </div>
              </div>
              <Volume2 className="w-4 h-4 text-[#ef4444] animate-pulse shrink-0" />
            </div>
          )}

          {voiceNotice && !isListening && (
            <div className="bg-[#0b1326] border border-[#334155] rounded-xl px-2.5 py-1.5 flex items-center justify-between text-[10px] font-mono text-[#94a3b8]">
              <span>{voiceNotice}</span>
              <button
                type="button"
                onClick={() => setVoiceNotice(null)}
                className="text-[#f59e0b] hover:underline ml-2"
              >
                Cerrar
              </button>
            </div>
          )}

          {/* Text Area */}
          <div className="relative w-full">
            <textarea
              id="report-desc"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describa el acto o condición subestándar (o presione 'Dictar por Voz' para hablar con manos libres)..."
              className={`w-full p-3 rounded-xl bg-[#131b2e] text-[#dae2fd] font-sans text-xs border transition-all focus:outline-none resize-none shadow-inner leading-relaxed placeholder:text-[#64748b] ${
                isListening
                  ? 'border-[#ef4444] ring-2 ring-[#ef4444]/20'
                  : 'border-[#222a3d] focus:border-[#f59e0b]'
              }`}
            />
            <div className="absolute bottom-2 right-2 flex items-center gap-1.5 text-[#10b981] bg-[#060e20]/90 px-2 py-0.5 rounded-md border border-[#10b981]/30 backdrop-blur font-mono text-[8px] uppercase">
              <Sparkles className="w-2.5 h-2.5 text-[#f59e0b]" />
              <span>Voz a Texto Activo</span>
            </div>
          </div>

          {/* Hands-Free Quick Inserts for Construction Sites */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-1 no-scrollbar">
            <span className="font-mono text-[9px] text-[#94a3b8] uppercase shrink-0">
              Atajos de voz:
            </span>
            <button
              type="button"
              onClick={() => handleQuickInsert('Sin línea de vida conectada en altura.')}
              className="px-2 py-0.5 rounded-lg bg-[#0b1326] hover:bg-[#1a2337] border border-[#1e293b] hover:border-[#334155] text-[#94a3b8] hover:text-[#dae2fd] font-mono text-[9px] shrink-0 transition-colors"
            >
              + Sin línea de vida
            </button>
            <button
              type="button"
              onClick={() => handleQuickInsert('Barbiquejo desabrochado en zona de izaje.')}
              className="px-2 py-0.5 rounded-lg bg-[#0b1326] hover:bg-[#1a2337] border border-[#1e293b] hover:border-[#334155] text-[#94a3b8] hover:text-[#dae2fd] font-mono text-[9px] shrink-0 transition-colors"
            >
              + Barbiquejo suelto
            </button>
            <button
              type="button"
              onClick={() => handleQuickInsert('Excavación sin baranda rígida perimétrica.')}
              className="px-2 py-0.5 rounded-lg bg-[#0b1326] hover:bg-[#1a2337] border border-[#1e293b] hover:border-[#334155] text-[#94a3b8] hover:text-[#dae2fd] font-mono text-[9px] shrink-0 transition-colors"
            >
              + Sin baranda rígida
            </button>
          </div>
        </div>

        {/* 7. Big Submit Button */}
        <div className="pt-1">
          <button
            type="submit"
            className="w-full h-13 py-3.5 px-4 rounded-xl bg-[#f59e0b] hover:bg-[#d97706] active:scale-[0.98] text-[#2a1700] font-['Chivo'] font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-[#f59e0b]/25 transition-all"
          >
            <Send className="w-4 h-4 fill-[#2a1700]" />
            <span>Enviar Reporte de Incidencia</span>
          </button>
        </div>
      </form>

      {/* Confirmation Modal */}
      {submittedModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#060e20]/85 backdrop-blur-md flex items-end sm:items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-[#131b2e] border border-[#222a3d] rounded-2xl p-5 shadow-2xl flex flex-col items-center text-center gap-3">
            <div className="w-14 h-14 rounded-full bg-[#10b981]/20 flex items-center justify-center text-[#10b981] border border-[#10b981]/40">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="flex flex-col gap-1">
              <span className="font-mono text-[9px] text-[#f59e0b] uppercase font-bold tracking-widest">
                // ALERTA DESPACHADA
              </span>
              <h3 className="font-['Chivo'] font-bold text-base text-[#dae2fd]">
                ¡Reporte #{createdCaseId} Registrado!
              </h3>
              <p className="font-sans text-xs text-[#94a3b8] mt-1 leading-relaxed">
                Notificación de parada inmediata remitida al Ing. Carlos Mendoza y supervisor de cuadrilla.
              </p>
            </div>

            {/* GPS coordinates confirmation banner */}
            <div className="w-full p-2.5 rounded-xl bg-[#0b1326] border border-[#1e293b] flex items-center justify-between text-left font-mono text-[10px]">
              <div className="flex items-center gap-2 min-w-0">
                <MapPin className="w-3.5 h-3.5 text-[#10b981] shrink-0" />
                <div className="min-w-0">
                  <span className="text-[8px] text-[#94a3b8] uppercase block">
                    Punto GPS Fijado
                  </span>
                  <span className="text-[#dae2fd] font-bold truncate block">
                    {coordinates.lat.toFixed(5)}, {coordinates.lng.toFixed(5)}
                  </span>
                </div>
              </div>
              <span className="text-[9px] text-[#10b981] font-semibold bg-[#10b981]/15 px-1.5 py-0.5 rounded border border-[#10b981]/30 shrink-0">
                ±{coordinates.accuracy || 3.5}m
              </span>
            </div>

            <div className="w-full flex flex-col gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setSubmittedModalOpen(false);
                  setActiveTab('dashboard');
                }}
                className="w-full h-11 rounded-xl bg-[#f59e0b] text-[#2a1700] font-['Chivo'] font-bold text-xs uppercase flex items-center justify-center gap-2 shadow-md hover:bg-[#d97706] active:scale-95 transition-all"
              >
                <span>Ver en Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={resetForm}
                className="w-full h-10 rounded-xl bg-[#1e293b] text-[#94a3b8] hover:text-[#dae2fd] font-mono text-[11px] font-semibold uppercase active:scale-95 transition-all border border-[#334155]"
              >
                Crear Nuevo Reporte
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
