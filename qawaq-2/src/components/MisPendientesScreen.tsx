import React, { useState } from 'react';
import {
  HardHat,
  Clock,
  AlertTriangle,
  Play,
  Upload,
  CheckCircle2,
  XCircle,
  Camera,
  FileText,
  UserCheck,
  ChevronRight,
  Info,
  ExternalLink,
} from 'lucide-react';
import { useCases } from '../context/CaseContext';
import { useRole } from '../context/RoleContext';
import { formatSlaCountdown, useLiveTimer } from '../utils/sla';
import { CaseItem } from '../types';
import { ASSETS } from '../constants';
import { CaseDetailModal } from './CaseDetailModal';

export const MisPendientesScreen: React.FC = () => {
  const {
    cases,
    startCorrection,
    submitCorrectionEvidence,
    selectedCaseForDetailId,
    setSelectedCaseForDetailId,
  } = useCases();

  const { activeSupervisor, setActiveSupervisor, availableSupervisors, setIsRoleModalOpen } = useRole();
  const now = useLiveTimer(5000); // ticks every 5 seconds for live countdown

  // State for Evidence submission modal
  const [evidenceModalCase, setEvidenceModalCase] = useState<CaseItem | null>(null);
  const [evidenceNote, setEvidenceNote] = useState('');
  const [evidencePhotoUrl, setEvidencePhotoUrl] = useState(ASSETS.resolved);
  const [isUploading, setIsUploading] = useState(false);

  // Filter cases assigned to active supervisor (not closed)
  const myAssignedCases = cases.filter(
    (c) =>
      c.asignadoA &&
      (c.asignadoA.nombre === activeSupervisor.nombre ||
        c.responsable.toLowerCase().includes(activeSupervisor.nombre.toLowerCase()))
  );

  const pendingCount = myAssignedCases.filter((c) => c.estado !== 'Cerrado').length;
  const inCorrectionCount = myAssignedCases.filter((c) => c.estado === 'En Corrección').length;
  const inValidationCount = myAssignedCases.filter((c) => c.estado === 'Pendiente de Validación SSOMA').length;

  const handleOpenEvidenceModal = (caseItem: CaseItem) => {
    setEvidenceModalCase(caseItem);
    setEvidenceNote(
      caseItem.evidenciaCorreccion?.nota ||
        'Se procedió con la subsanación inmediata del riesgo en campo. Trabajo verificado y seguro.'
    );
    setEvidencePhotoUrl(caseItem.evidenciaCorreccion?.fotoUrl || ASSETS.resolved);
  };

  const handleSendEvidence = (e: React.FormEvent) => {
    e.preventDefault();
    if (!evidenceModalCase) return;
    if (!evidenceNote.trim()) return;

    setIsUploading(true);
    setTimeout(() => {
      submitCorrectionEvidence(evidenceModalCase.id, {
        fotoUrl: evidencePhotoUrl,
        nota: evidenceNote.trim(),
      });
      setIsUploading(false);
      setEvidenceModalCase(null);
    }, 400);
  };

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-5 animate-fade-in">
      {/* Top Banner: Active Supervisor Selector & Context */}
      <div className="bg-[#0f172a] p-4 sm:p-5 rounded-2xl border border-[#222a3d] shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#f59e0b]/15 border border-[#f59e0b]/30 flex items-center justify-center shrink-0">
              <HardHat className="w-6 h-6 text-[#f59e0b]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-['Chivo'] font-black text-lg sm:text-xl text-[#dae2fd] uppercase tracking-wide">
                  Mis Pendientes de Campo
                </h1>
                <span className="font-mono text-[9px] px-2 py-0.5 rounded bg-[#f59e0b]/20 text-[#ffb95f] font-bold border border-[#f59e0b]/40">
                  SUPERVISOR
                </span>
              </div>
              <p className="text-xs text-[#94a3b8] font-mono mt-0.5">
                Casos asignados a <strong className="text-[#dae2fd]">{activeSupervisor.nombre}</strong> · {activeSupervisor.rol}
              </p>
            </div>
          </div>

          {/* Quick Supervisor Selector for Demo */}
          <div className="flex items-center gap-2 bg-[#070d18] p-1.5 rounded-xl border border-[#1e293b]">
            <UserCheck className="w-4 h-4 text-[#94a3b8] ml-2 shrink-0" />
            <select
              value={activeSupervisor.id}
              onChange={(e) => {
                const found = availableSupervisors.find((s) => s.id === e.target.value);
                if (found) setActiveSupervisor(found);
              }}
              className="bg-transparent text-xs font-mono text-[#dae2fd] font-bold focus:outline-none cursor-pointer pr-2"
            >
              {availableSupervisors.map((s) => (
                <option key={s.id} value={s.id} className="bg-[#0c1322] text-[#dae2fd]">
                  {s.nombre} ({s.rol})
                </option>
              ))}
            </select>
            <button
              onClick={() => setIsRoleModalOpen(true)}
              className="px-2 py-1 rounded-lg bg-[#1e293b] text-[#94a3b8] hover:text-[#f59e0b] hover:bg-[#283548] font-mono text-[10px] font-bold transition-all shrink-0"
              title="Cambiar a rol SSOMA o Gerencia"
            >
              Cambiar Rol
            </button>
          </div>
        </div>

        {/* Counter Pills */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 mt-4 pt-3 border-t border-[#1e293b]">
          <div className="bg-[#070d18] p-2.5 rounded-xl border border-[#1e293b] text-center">
            <div className="font-mono text-[10px] uppercase text-[#94a3b8] font-semibold">Total Asignados</div>
            <div className="font-['Chivo'] font-black text-lg sm:text-xl text-[#dae2fd] mt-0.5">
              {myAssignedCases.length}
            </div>
          </div>
          <div className="bg-[#070d18] p-2.5 rounded-xl border border-[#1e293b] text-center">
            <div className="font-mono text-[10px] uppercase text-[#38bdf8] font-semibold">En Corrección</div>
            <div className="font-['Chivo'] font-black text-lg sm:text-xl text-[#38bdf8] mt-0.5">
              {inCorrectionCount}
            </div>
          </div>
          <div className="bg-[#070d18] p-2.5 rounded-xl border border-[#1e293b] text-center">
            <div className="font-mono text-[10px] uppercase text-[#f59e0b] font-semibold">Por Validar SSOMA</div>
            <div className="font-['Chivo'] font-black text-lg sm:text-xl text-[#f59e0b] mt-0.5">
              {inValidationCount}
            </div>
          </div>
        </div>
      </div>

      {/* Main List of Cases */}
      <div className="space-y-4">
        {myAssignedCases.length === 0 ? (
          <div className="bg-[#0f172a] p-8 rounded-2xl border border-[#1e293b] text-center">
            <CheckCircle2 className="w-12 h-12 text-[#10b981] mx-auto mb-3 opacity-80" />
            <h3 className="font-['Chivo'] font-bold text-base text-[#dae2fd]">
              ¡Excelente trabajo! No tienes casos pendientes
            </h3>
            <p className="text-xs text-[#94a3b8] mt-1 max-w-md mx-auto">
              Actualmente no hay observaciones de seguridad asignadas a tu nombre o frente de trabajo.
              Usa el botón de cambio de rol en el header para asignar un caso nuevo desde el rol SSOMA.
            </p>
          </div>
        ) : (
          myAssignedCases.map((item) => {
            const sla = formatSlaCountdown(item.plazoObjetivo, item.estado, now);
            const isRejected = item.estado === 'Rechazado';
            const isPendingValidation = item.estado === 'Pendiente de Validación SSOMA';
            const isInCorrection = item.estado === 'En Corrección';
            const isAssigned = item.estado === 'Asignado';
            const isClosed = item.estado === 'Cerrado';

            return (
              <div
                key={item.id}
                className={`bg-[#0c1322] border rounded-2xl p-4 sm:p-5 transition-all shadow-md ${
                  sla.isVencido && !isClosed
                    ? 'border-red-500/50 bg-[#160b10]'
                    : isRejected
                    ? 'border-red-500/40 bg-[#160b10]'
                    : isPendingValidation
                    ? 'border-amber-500/40 bg-[#15120a]'
                    : isInCorrection
                    ? 'border-sky-500/40 bg-[#0b1322]'
                    : isClosed
                    ? 'border-emerald-500/30 bg-[#091512] opacity-80'
                    : 'border-[#222a3d]'
                }`}
              >
                {/* Header row: ID, Risk Type, SLA & Priority Badges */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-black px-2 py-0.5 rounded bg-[#1e293b] text-[#f59e0b] border border-[#f59e0b]/30">
                      #{item.id}
                    </span>
                    <h3 className="font-['Chivo'] font-black text-base sm:text-lg text-[#dae2fd]">
                      {item.tipo}
                    </h3>
                    <span className="font-mono text-[9px] px-2 py-0.5 rounded font-bold uppercase tracking-wider bg-[#1e293b] text-[#94a3b8] border border-[#334155]">
                      {item.frente}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    {/* Priority Badge */}
                    <span
                      className={`font-mono text-[9px] px-2 py-0.5 rounded font-bold uppercase tracking-wider border ${
                        item.prioridad === 'Crítico'
                          ? 'bg-red-500/20 text-red-300 border-red-500/40'
                          : item.prioridad === 'Alto'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                      }`}
                    >
                      {item.prioridad}
                    </span>

                    {/* Dynamic SLA Countdown Badge */}
                    <span
                      className={`font-mono text-[10px] px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1 border ${sla.badgeClass}`}
                    >
                      <Clock className="w-3 h-3" />
                      {sla.text}
                    </span>
                  </div>
                </div>

                {/* Body Content */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                  {/* Evidence Thumbnail */}
                  <div className="md:col-span-3 flex md:flex-col gap-2">
                    <div
                      onClick={() => setSelectedCaseForDetailId(item.id)}
                      className="relative rounded-xl overflow-hidden border border-[#222a3d] aspect-video w-32 sm:w-40 md:w-full shrink-0 group cursor-pointer"
                    >
                      <img
                        src={item.fotoUrl}
                        alt={item.tipo}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="font-mono text-[10px] text-white font-bold bg-black/70 px-2 py-1 rounded">
                          Ver Detalle
                        </span>
                      </div>
                    </div>

                    {item.evidenciaCorreccion && (
                      <div className="relative rounded-xl overflow-hidden border border-emerald-500/40 aspect-video w-32 sm:w-40 md:w-full shrink-0">
                        <img
                          src={item.evidenciaCorreccion.fotoUrl}
                          alt="Subsanación en campo"
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute bottom-1 left-1 bg-emerald-950/90 text-emerald-300 font-mono text-[8px] font-bold px-1.5 py-0.5 rounded border border-emerald-500/40">
                          EVIDENCIA SUBIDA
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Details & Status Actions */}
                  <div className="md:col-span-9 flex flex-col justify-between h-full space-y-3">
                    <div>
                      <div className="text-xs text-[#94a3b8] flex items-center gap-2 mb-1 font-mono">
                        <span>Ubicación: <strong className="text-[#dae2fd]">{item.ubicacion}</strong></span>
                        <span>·</span>
                        <span>Detectado: <strong className="text-[#dae2fd]">{item.detectadoPor}</strong></span>
                      </div>
                      <p className="text-xs sm:text-sm text-[#cbd5e1] leading-relaxed">
                        {item.descripcion}
                      </p>
                    </div>

                    {/* Rejection Alert Banner (if returned by SSOMA) */}
                    {isRejected && (
                      <div className="bg-red-500/15 border border-red-500/40 rounded-xl p-3 text-xs text-red-200 animate-pulse">
                        <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider font-mono text-[10px] text-red-400 mb-1">
                          <XCircle className="w-4 h-4" /> Observación / Rechazo de SSOMA:
                        </div>
                        <p className="italic">
                          &quot;{item.validacion?.comentarioSSOMA || 'La evidencia fotográfica no demuestra la subsanación integral del riesgo. Repetir maniobra.'}&quot;
                        </p>
                      </div>
                    )}

                    {/* Pending validation notice */}
                    {isPendingValidation && (
                      <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 text-xs text-amber-200">
                        <div className="flex items-center gap-2 font-bold uppercase font-mono text-[10px] text-amber-400">
                          <Clock className="w-4 h-4 animate-spin" /> Esperando Validación de SSOMA
                        </div>
                        <p className="mt-1 text-[11px] text-[#94a3b8]">
                          Evidencia enviada: &quot;{item.evidenciaCorreccion?.nota}&quot;. En espera de dictamen técnico del prevencionista.
                        </p>
                      </div>
                    )}

                    {/* Status Badge & Actions row */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#1e293b]">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] text-[#64748b] uppercase">Estado:</span>
                        <span
                          className={`font-mono text-xs font-bold px-2.5 py-1 rounded-lg border ${
                            isClosed
                              ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                              : isPendingValidation
                              ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                              : isInCorrection
                              ? 'bg-sky-500/15 text-sky-300 border-sky-500/30'
                              : isRejected
                              ? 'bg-red-500/15 text-red-300 border-red-500/30'
                              : 'bg-blue-500/15 text-blue-300 border-blue-500/30'
                          }`}
                        >
                          {item.estado}
                        </span>
                      </div>

                      {/* Action buttons depending on state */}
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* View Full Detail / Timeline Modal */}
                        <button
                          type="button"
                          onClick={() => setSelectedCaseForDetailId(item.id)}
                          className="px-3 py-1.5 rounded-xl bg-[#1e293b] hover:bg-[#283548] text-[#dae2fd] text-xs font-['Chivo'] font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 border border-[#334155]"
                        >
                          <span>Historial</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>

                        {/* State 1: Asignado -> Iniciar Corrección */}
                        {isAssigned && (
                          <button
                            type="button"
                            onClick={() => startCorrection(item.id)}
                            className="px-4 py-2 rounded-xl bg-[#f59e0b] hover:bg-[#d97706] text-[#2a1700] text-xs font-['Chivo'] font-black uppercase tracking-wider transition-all active:scale-95 shadow-md shadow-[#f59e0b]/20 flex items-center gap-1.5"
                          >
                            <Play className="w-3.5 h-3.5 fill-current" />
                            <span>Iniciar Corrección</span>
                          </button>
                        )}

                        {/* State 2: En Corrección OR Rechazado -> Subir Evidencia */}
                        {(isInCorrection || isRejected) && (
                          <button
                            type="button"
                            onClick={() => handleOpenEvidenceModal(item)}
                            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-black text-xs font-['Chivo'] font-black uppercase tracking-wider transition-all active:scale-95 shadow-md shadow-emerald-500/20 flex items-center gap-1.5"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <span>{isRejected ? 'Reintentar y Subir Evidencia' : 'Subir Evidencia y Enviar a Validación'}</span>
                          </button>
                        )}

                        {/* State 3: Pendiente de Validación -> Read Only */}
                        {isPendingValidation && (
                          <button
                            disabled
                            className="px-4 py-2 rounded-xl bg-[#1e293b] text-[#94a3b8] text-xs font-mono font-bold uppercase tracking-wider cursor-not-allowed border border-[#334155]"
                          >
                            Esperando validación de SSOMA
                          </button>
                        )}

                        {/* State 4: Cerrado */}
                        {isClosed && (
                          <span className="font-mono text-xs font-bold text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4" /> Caso Finalizado
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal: Subir Evidencia de Corrección */}
      {evidenceModalCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-xl bg-[#0c1322] border border-[#222a3d] rounded-2xl p-5 sm:p-6 shadow-2xl overflow-y-auto max-h-[92vh]">
            <div className="flex items-center justify-between mb-4 border-b border-[#1e293b] pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    SUBSANACIÓN EN CAMPO
                  </span>
                  <span className="font-mono text-xs text-[#94a3b8]">Caso #{evidenceModalCase.id}</span>
                </div>
                <h3 className="font-['Chivo'] font-black text-lg text-[#dae2fd] mt-1 uppercase">
                  Subir Evidencia de Corrección
                </h3>
              </div>
              <button
                onClick={() => setEvidenceModalCase(null)}
                className="p-1.5 text-[#94a3b8] hover:text-[#dae2fd] hover:bg-[#1e293b] rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSendEvidence} className="space-y-4">
              {/* Context Summary */}
              <div className="bg-[#070d18] p-3 rounded-xl border border-[#1e293b] text-xs text-[#94a3b8]">
                <strong className="text-[#dae2fd]">{evidenceModalCase.tipo}</strong> · {evidenceModalCase.ubicacion}
              </div>

              {/* Photo Preview & Selector */}
              <div>
                <label className="block text-xs font-mono text-[#dae2fd] uppercase font-bold mb-1.5">
                  Foto de la Subsanación (Evidencia Obligatoria)
                </label>
                <div className="relative aspect-video rounded-xl overflow-hidden border border-[#334155] bg-black">
                  <img
                    src={evidencePhotoUrl}
                    alt="Evidencia fotográfica"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2 right-2 flex gap-2">
                    <button
                      type="button"
                      onClick={() => setEvidencePhotoUrl(ASSETS.resolved)}
                      className="px-2.5 py-1 rounded bg-black/80 hover:bg-black text-white font-mono text-[10px] font-bold border border-white/20 flex items-center gap-1"
                    >
                      <Camera className="w-3 h-3" /> Foto Estándar
                    </button>
                    <button
                      type="button"
                      onClick={() => setEvidencePhotoUrl(ASSETS.cctv2)}
                      className="px-2.5 py-1 rounded bg-black/80 hover:bg-black text-white font-mono text-[10px] font-bold border border-white/20 flex items-center gap-1"
                    >
                      <Camera className="w-3 h-3" /> Foto Alterna
                    </button>
                  </div>
                </div>
              </div>

              {/* Technical Note */}
              <div>
                <label className="block text-xs font-mono text-[#dae2fd] uppercase font-bold mb-1.5">
                  Nota Técnica de Corrección / Medida Implementada
                </label>
                <textarea
                  value={evidenceNote}
                  onChange={(e) => setEvidenceNote(e.target.value)}
                  rows={3}
                  required
                  placeholder="Describe la acción correctiva ejecutada en campo (ej. cuadrilla dotada de EPP, anclaje reforzado...)"
                  className="w-full bg-[#070d18] border border-[#222a3d] focus:border-emerald-500 rounded-xl p-3 text-xs sm:text-sm text-[#dae2fd] placeholder:text-[#64748b] focus:outline-none"
                />
              </div>

              {/* Instructions */}
              <div className="text-[11px] text-[#94a3b8] flex items-start gap-1.5 bg-[#10b981]/10 p-3 rounded-xl border border-[#10b981]/20">
                <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  Al enviar la evidencia, el caso pasará automáticamente al estado{' '}
                  <strong className="text-emerald-300">Pendiente de Validación SSOMA</strong>. El prevencionista revisará y dará el dictamen de cierre.
                </span>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1e293b]">
                <button
                  type="button"
                  onClick={() => setEvidenceModalCase(null)}
                  className="px-4 py-2 rounded-xl text-xs font-['Chivo'] font-bold text-[#94a3b8] hover:text-[#dae2fd] hover:bg-[#1e293b]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isUploading || !evidenceNote.trim()}
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-black font-['Chivo'] font-black text-xs uppercase tracking-wider transition-all active:scale-95 flex items-center gap-2 shadow-lg shadow-emerald-500/20"
                >
                  {isUploading ? (
                    <span>Enviando...</span>
                  ) : (
                    <>
                      <Upload className="w-3.5 h-3.5" />
                      <span>Enviar a Validación SSOMA</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Case Detail Modal with Audit Timeline */}
      {selectedCaseForDetailId && (
        <CaseDetailModal
          caseItem={cases.find((c) => c.id === selectedCaseForDetailId) || null}
          onClose={() => setSelectedCaseForDetailId(null)}
        />
      )}
    </div>
  );
};
