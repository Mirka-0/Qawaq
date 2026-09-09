import React, { useState, useRef } from 'react';
import {
  Zap,
  Timer,
  Camera,
  MapPin,
  RefreshCw,
  Mic,
  Send,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  HardHat,
  ShieldAlert,
  Shield,
  Upload,
} from 'lucide-react';
import { ASSETS, RISK_TYPES, WORK_FRONTS } from '../constants';
import { useCases } from '../context/CaseContext';
import { useUsageStats } from '../hooks/useUsageStats';
import { RiskType, UrgencyLevel } from '../types';

export const ReportScreen: React.FC = () => {
  const { addCase, showToast, setActiveTab, setSelectedCaseForClosureId } = useCases();
  const { logInteraction } = useUsageStats();

  const [selectedRisk, setSelectedRisk] = useState<RiskType>('Falta de Casco');
  const [selectedLocation, setSelectedLocation] = useState<string>(WORK_FRONTS[0].name);
  const [selectedUrgency, setSelectedUrgency] = useState<UrgencyLevel>('Alto');
  const [description, setDescription] = useState<string>(
    'Operario realizando armado de fierro sin casco de seguridad reglamentario bajo gancho de grúa.'
  );
  const [photoPreview, setPhotoPreview] = useState<string>(ASSETS.cctv1);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [submittedModalOpen, setSubmittedModalOpen] = useState<boolean>(false);
  const [createdCaseId, setCreatedCaseId] = useState<string>('QW-104');

  const fileInputRef = useRef<HTMLInputElement>(null);

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
    setIsRecording(!isRecording);
    if (!isRecording) {
      showToast('Micrófono activado · Grabando nota de voz...');
      setTimeout(() => {
        setDescription(
          (prev) =>
            `${prev.trim()} [Nota agregada por voz: Supervisor notifica reincidencia en cuadrilla de fierreros].`
        );
        setIsRecording(false);
        showToast('Nota de voz transcrita automáticamente por IA');
      }, 2500);
    }
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
              IA DETECTADA
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

        {/* 6. Detalle del Incidente */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="report-desc"
              className="font-['Chivo'] font-bold text-xs text-[#dae2fd] flex items-center gap-1.5 uppercase"
            >
              <Shield className="w-4 h-4 text-[#f59e0b]" />
              Detalle del Incidente
            </label>
            <button
              type="button"
              onClick={handleVoiceToggle}
              className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full transition-all border ${
                isRecording
                  ? 'bg-[#ef4444] text-white border-[#fca5a5] animate-pulse'
                  : 'bg-[#f59e0b]/15 text-[#f59e0b] border-[#f59e0b]/30 hover:bg-[#f59e0b]/25'
              }`}
            >
              <Mic className="w-3 h-3" />
              <span className="font-mono text-[9px] font-bold uppercase">
                {isRecording ? 'Grabando...' : 'Dictar Audio'}
              </span>
            </button>
          </div>

          <div className="relative w-full">
            <textarea
              id="report-desc"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describa el acto o condición subestándar identificada en campo..."
              className="w-full p-3 rounded-xl bg-[#131b2e] text-[#dae2fd] font-sans text-xs border border-[#222a3d] focus:outline-none focus:border-[#f59e0b] resize-none shadow-inner leading-relaxed placeholder:text-[#64748b]"
            />
            <div className="absolute bottom-2 right-2 flex items-center gap-1 text-[#10b981] bg-[#060e20]/85 px-1.5 py-0.5 rounded border border-[#10b981]/30 backdrop-blur font-mono text-[8px] uppercase">
              <span>Transcrito por IA</span>
            </div>
          </div>
        </div>

        {/* 7. Big Submit Button */}
        <div className="pt-1">
          <button
            type="submit"
            className="w-full h-13 py-3.5 px-4 rounded-xl bg-[#f59e0b] hover:bg-[#d97706] active:scale-[0.98] text-[#2a1700] font-['Chivo'] font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-[#f59e0b]/25 transition-all"
          >
            <Send className="w-4 h-4 fill-[#2a1700]" />
            <span>Enviar Reporte SSOMA</span>
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

            <div className="w-full flex flex-col gap-2 pt-2">
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
