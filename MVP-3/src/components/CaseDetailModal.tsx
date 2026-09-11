import React, { useState } from 'react';
import {
  X,
  MapPin,
  Clock,
  ShieldAlert,
  User,
  CheckCircle2,
  XCircle,
  HardHat,
  Camera,
  Calendar,
  AlertCircle,
  FileCheck,
  Send,
  Navigation,
  FileText,
} from 'lucide-react';
import { CaseItem, PriorityLevel, AiRecommendationResult } from '../types';
import { formatSlaCountdown, useLiveTimer } from '../utils/sla';
import { useCases } from '../context/CaseContext';
import { useRole } from '../context/RoleContext';
import { SUPERVISOR_LIST } from '../constants';
import { GeminiService } from '../services/geminiService';
import { Sparkles, Shield, AlertOctagon } from 'lucide-react';

interface CaseDetailModalProps {
  caseItem: CaseItem | null;
  onClose: () => void;
  isOpen?: boolean;
  onNavigateToClose?: (id: string) => void;
  onExportPdf?: (item: CaseItem) => void;
}

export const CaseDetailModal: React.FC<CaseDetailModalProps> = ({
  caseItem,
  onClose,
  isOpen = true,
  onNavigateToClose,
  onExportPdf,
}) => {
  const { assignCase, approveValidation, rejectValidation, startCorrection } = useCases();
  const { currentRole, isSSOMA, isSupervisor, isGerencia } = useRole();
  const now = useLiveTimer(3000);

  // Rejection modal state
  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectComment, setRejectComment] = useState('');

  // Approval dictamen
  const [dictamen, setDictamen] = useState(
    'Evidencia técnica conforme a normativa G.050 y D.S. 011-2019-TR. Subsanación validada en campo.'
  );

  // AI Recommendation State (Schema 3.3)
  const [aiRecommendation, setAiRecommendation] = useState<AiRecommendationResult | null>(null);
  const [isLoadingAiRec, setIsLoadingAiRec] = useState(false);

  const handleFetchAiRecommendation = async () => {
    if (!caseItem) return;
    setIsLoadingAiRec(true);
    try {
      const rec = await GeminiService.recommendAction(caseItem);
      if (rec) {
        setAiRecommendation(rec);
      }
    } catch (err) {
      console.error('Error fetching recommendation:', err);
    } finally {
      setIsLoadingAiRec(false);
    }
  };

  // Direct assignment state if case is Abierto
  const [selectedSupervisorId, setSelectedSupervisorId] = useState(SUPERVISOR_LIST[0].id);
  const [selectedPriority, setSelectedPriority] = useState<PriorityLevel>('Alto');

  if (!isOpen || !caseItem) return null;

  const sla = formatSlaCountdown(caseItem.plazoObjetivo, caseItem.estado, now);
  const isPendingValidation = caseItem.estado === 'Pendiente de Validación SSOMA';
  const isAbierto = caseItem.estado === 'Abierto';
  const isRejected = caseItem.estado === 'Rechazado';

  const handleAssign = (e: React.FormEvent) => {
    e.preventDefault();
    const sup = SUPERVISOR_LIST.find((s) => s.id === selectedSupervisorId);
    if (sup) {
      assignCase(caseItem.id, sup, selectedPriority);
    }
  };

  const handleApprove = () => {
    approveValidation(caseItem.id, dictamen);
    onClose();
  };

  const handleConfirmReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectComment.trim()) return;
    rejectValidation(caseItem.id, rejectComment.trim());
    setIsRejecting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-3xl bg-[#0c1322] border border-[#222a3d] rounded-2xl shadow-2xl overflow-y-auto max-h-[94vh]">
        {/* Modal Header */}
        <div className="sticky top-0 z-10 bg-[#0c1322]/95 backdrop-blur-md border-b border-[#1e293b] p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-mono text-sm font-black px-2.5 py-1 rounded-lg bg-[#f59e0b]/20 text-[#ffb95f] border border-[#f59e0b]/40">
              #{caseItem.id}
            </span>
            <div>
              <h2 className="font-['Chivo'] font-black text-lg sm:text-xl text-[#dae2fd] uppercase tracking-wide">
                {caseItem.tipo}
              </h2>
              <div className="flex items-center gap-2 mt-0.5 text-xs text-[#94a3b8] font-mono">
                <span>{caseItem.frente}</span>
                <span>·</span>
                <span>{caseItem.ubicacion}</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-[#94a3b8] hover:text-[#dae2fd] hover:bg-[#1a2337] rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 space-y-6">
          {/* Key Metrics Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#070d18] p-3 sm:p-4 rounded-xl border border-[#1e293b]">
            <div>
              <div className="text-[10px] font-mono uppercase text-[#64748b]">Estado</div>
              <div className="font-['Chivo'] font-bold text-xs sm:text-sm text-[#dae2fd] mt-0.5">
                {caseItem.estado}
              </div>
            </div>

            <div>
              <div className="text-[10px] font-mono uppercase text-[#64748b]">Prioridad</div>
              <div className="font-['Chivo'] font-bold text-xs sm:text-sm text-[#f59e0b] mt-0.5">
                {caseItem.prioridad}
              </div>
            </div>

            <div>
              <div className="text-[10px] font-mono uppercase text-[#64748b]">SLA / Tiempo Restante</div>
              <div className={`font-mono text-xs font-bold mt-0.5 ${sla.isVencido ? 'text-red-400 font-black' : 'text-[#38bdf8]'}`}>
                {sla.text}
              </div>
            </div>

            <div>
              <div className="text-[10px] font-mono uppercase text-[#64748b]">Responsable</div>
              <div className="font-['Chivo'] font-bold text-xs sm:text-sm text-[#dae2fd] truncate mt-0.5">
                {caseItem.asignadoA?.nombre || caseItem.responsable}
              </div>
            </div>
          </div>

          {/* GPS Coordinates & Geolocation */}
          {caseItem.coordenadas && (
            <div className="flex items-center justify-between bg-[#131b2e] px-3.5 py-2.5 rounded-xl border border-[#222a3d] text-xs font-mono text-[#94a3b8]">
              <div className="flex items-center gap-2">
                <Navigation className="w-4 h-4 text-[#10b981]" />
                <span>
                  Coordenadas GPS de Campo:{' '}
                  <strong className="text-[#dae2fd]">
                    {caseItem.coordenadas.lat.toFixed(6)}, {caseItem.coordenadas.lng.toFixed(6)}
                  </strong>
                </span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-[#10b981]/15 text-[#34d399] font-bold">
                GPS FIJADO
              </span>
            </div>
          )}

          {/* Description */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <h4 className="font-label text-xs uppercase text-[#64748b] font-bold">
                Descripción de la Condición Insegura
              </h4>
              <button
                type="button"
                onClick={handleFetchAiRecommendation}
                disabled={isLoadingAiRec}
                className="px-2.5 py-1 rounded-lg bg-[#1e293b] hover:bg-[#283548] text-[#dae2fd] font-label text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 border border-[#334155] transition-all active:scale-95"
              >
                <Sparkles className={`w-3.5 h-3.5 ${isLoadingAiRec ? 'animate-spin text-[#f59e0b]' : 'text-[#f59e0b]'}`} />
                <span>{isLoadingAiRec ? 'Consultando IA...' : 'Plan de Acción IA (Norma G.050)'}</span>
              </button>
            </div>
            <p className="font-body text-xs sm:text-sm text-[#dae2fd] leading-relaxed bg-[#070d18] p-3.5 rounded-xl border border-[#1e293b]">
              {caseItem.descripcion}
            </p>

            {/* AI Action Plan Result if fetched */}
            {aiRecommendation && (
              <div className="mt-3 p-3.5 bg-[#0b1326] border border-[#f59e0b]/40 rounded-xl space-y-2.5 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <span className="font-headline font-bold text-xs text-white uppercase flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-[#f59e0b]" />
                    Medidas Correctivas Inmediatas Recomendadas
                  </span>
                  {aiRecommendation.requiere_paralizacion && (
                    <span className="font-label text-[10px] px-2 py-0.5 rounded bg-red-500/20 text-red-300 font-bold uppercase border border-red-500/40 flex items-center gap-1">
                      <AlertOctagon className="w-3 h-3 text-red-400" />
                      Requiere Paralización
                    </span>
                  )}
                </div>

                <ul className="space-y-1.5">
                  {aiRecommendation.acciones_inmediatas.map((acc, idx) => (
                    <li key={idx} className="flex items-start gap-2 font-body text-xs text-[#cbd5e1]">
                      <span className="w-4 h-4 rounded-full bg-[#1e293b] border border-[#334155] text-[#f59e0b] font-mono text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{acc}</span>
                    </li>
                  ))}
                </ul>

                {aiRecommendation.referencia_normativa && (
                  <div className="pt-2 border-t border-[#1e293b] font-mono text-[10px] text-[#94a3b8]">
                    Base normativa: <span className="text-[#dae2fd]">{aiRecommendation.referencia_normativa}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Photos Comparison (Original vs. Evidencia vs. Solución) */}
          <div>
            <h4 className="text-xs font-mono uppercase text-[#64748b] font-bold mb-2">
              Registro Visual de Campo (Antes y Después)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Photo 1: Initial Insecure Condition */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono text-red-400 font-bold uppercase flex items-center gap-1">
                  <ShieldAlert className="w-3 h-3" /> Condición Detectada (Inicial)
                </span>
                <div className="relative aspect-video rounded-xl overflow-hidden border border-red-500/30 bg-black">
                  <img
                    src={caseItem.fotoUrl}
                    alt="Condición Inicial"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-1 left-1 bg-black/80 px-2 py-0.5 rounded font-mono text-[9px] text-[#dae2fd]">
                    Origen: {caseItem.detectadoPor}
                  </div>
                </div>
              </div>

              {/* Photo 2: Evidence / Solution */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Subsanación / Evidencia Técnica
                </span>
                <div className="relative aspect-video rounded-xl overflow-hidden border border-emerald-500/30 bg-black flex items-center justify-center">
                  {caseItem.evidenciaCorreccion?.fotoUrl || caseItem.fotoSolucionUrl ? (
                    <>
                      <img
                        src={caseItem.evidenciaCorreccion?.fotoUrl || caseItem.fotoSolucionUrl}
                        alt="Evidencia Técnica"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-1 left-1 bg-black/80 px-2 py-0.5 rounded font-mono text-[9px] text-emerald-400 font-bold">
                        {caseItem.estado === 'Cerrado' ? 'Certificado Conforme' : 'Evidencia Enviada'}
                      </div>
                    </>
                  ) : (
                    <div className="text-center p-4">
                      <Camera className="w-8 h-8 text-[#64748b] mx-auto mb-1 opacity-50" />
                      <p className="text-xs font-mono text-[#64748b]">
                        Aún no se ha subido evidencia de subsanación
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Note of Evidence */}
            {caseItem.evidenciaCorreccion?.nota && (
              <div className="mt-2.5 bg-emerald-500/10 border border-emerald-500/30 p-3 rounded-xl text-xs text-emerald-200">
                <strong className="text-emerald-300 font-mono">Nota de Corrección del Responsable:</strong>{' '}
                {caseItem.evidenciaCorreccion.nota}
              </div>
            )}
          </div>

          {/* SSOMA Decision Banner if validated or rejected */}
          {caseItem.validacion && (
            <div
              className={`p-3.5 rounded-xl border ${
                caseItem.validacion.aprobado
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-200'
                  : 'bg-red-500/15 border-red-500/40 text-red-200'
              }`}
            >
              <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase mb-1">
                {caseItem.validacion.aprobado ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Dictamen SSOMA: Aprobado
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 text-red-400" /> Dictamen SSOMA: Rechazado
                  </>
                )}
              </div>
              <p className="text-xs italic leading-relaxed">
                &quot;{caseItem.validacion.comentarioSSOMA}&quot;
              </p>
            </div>
          )}

          {/* Action Module: Assignment for SSOMA if case is Abierto (hidden for Gerencia) */}
          {isSSOMA && !isGerencia && isAbierto && (
            <div className="bg-[#131b2e] p-4 rounded-xl border border-[#f59e0b]/40">
              <h4 className="font-['Chivo'] font-bold text-sm text-[#f59e0b] uppercase tracking-wide mb-2 flex items-center gap-1.5">
                <HardHat className="w-4 h-4" /> Asignar Responsable en Obra
              </h4>
              <form onSubmit={handleAssign} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-[#94a3b8] mb-1">
                      Responsable / Cuadrilla:
                    </label>
                    <select
                      value={selectedSupervisorId}
                      onChange={(e) => setSelectedSupervisorId(e.target.value)}
                      className="w-full bg-[#070d18] border border-[#222a3d] rounded-xl px-3 py-2 text-xs text-[#dae2fd] font-mono focus:outline-none focus:border-[#f59e0b]"
                    >
                      {SUPERVISOR_LIST.map((sup) => (
                        <option key={sup.id} value={sup.id}>
                          {sup.nombre} ({sup.rol} · {sup.frenteAsignado})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono uppercase text-[#94a3b8] mb-1">
                      Prioridad & Plazo SLA:
                    </label>
                    <select
                      value={selectedPriority}
                      onChange={(e) => setSelectedPriority(e.target.value as PriorityLevel)}
                      className="w-full bg-[#070d18] border border-[#222a3d] rounded-xl px-3 py-2 text-xs text-[#dae2fd] font-mono focus:outline-none focus:border-[#f59e0b]"
                    >
                      <option value="Crítico">Crítico (SLA Inmediato · 30 min)</option>
                      <option value="Alto">Alto (SLA Urgente · 2 horas)</option>
                      <option value="Medio">Medio (SLA Estándar · 24 horas)</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-[#f59e0b] hover:bg-[#d97706] text-[#2a1700] font-['Chivo'] font-black text-xs uppercase tracking-wider transition-all active:scale-95 shadow-md flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Confirmar Asignación</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Action Module: Validation Controls for SSOMA if Pendiente de Validación (hidden for Gerencia) */}
          {isSSOMA && !isGerencia && isPendingValidation && (
            <div className="bg-[#15120a] p-4 rounded-xl border border-amber-500/40 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-['Chivo'] font-bold text-sm text-amber-300 uppercase tracking-wide flex items-center gap-1.5">
                  <FileCheck className="w-4 h-4" /> Validación Técnica SSOMA Requerida
                </h4>
                <span className="text-[10px] font-mono bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-bold">
                  EVIDENCIA EN ESPERA
                </span>
              </div>
              <p className="text-xs text-[#94a3b8]">
                Revisa la evidencia fotográfica y la nota del responsable antes de emitir tu dictamen:
              </p>

              {!isRejecting ? (
                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-[#94a3b8] mb-1">
                      Dictamen Técnico de Aprobación:
                    </label>
                    <input
                      type="text"
                      value={dictamen}
                      onChange={(e) => setDictamen(e.target.value)}
                      className="w-full bg-[#070d18] border border-[#222a3d] focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-[#dae2fd] font-mono focus:outline-none"
                    />
                  </div>

                  <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsRejecting(true)}
                      className="px-4 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 text-xs font-['Chivo'] font-bold uppercase tracking-wider transition-all flex items-center gap-1.5"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Rechazar Evidencia</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleApprove}
                      className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-black text-xs font-['Chivo'] font-black uppercase tracking-wider transition-all shadow-md shadow-emerald-500/20 flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Aprobar y Cerrar Caso</span>
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleConfirmReject} className="space-y-3 bg-[#1e0d14] p-3 rounded-xl border border-red-500/40">
                  <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-red-300 uppercase">
                    <AlertCircle className="w-4 h-4" /> Motivo del Rechazo (Obligatorio para que campo corrija):
                  </div>
                  <textarea
                    rows={2}
                    required
                    value={rejectComment}
                    onChange={(e) => setRejectComment(e.target.value)}
                    placeholder="Indica qué falta o por qué la subsanación no cumple la normativa técnica..."
                    className="w-full bg-[#070d18] border border-red-500/40 focus:border-red-400 rounded-xl p-2.5 text-xs text-[#dae2fd] placeholder:text-[#64748b] focus:outline-none"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsRejecting(false)}
                      className="px-3 py-1.5 text-xs text-[#94a3b8] hover:text-[#dae2fd]"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={!rejectComment.trim()}
                      className="px-4 py-1.5 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white font-['Chivo'] font-bold text-xs uppercase tracking-wider rounded-xl transition-all"
                    >
                      Confirmar Rechazo
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Audit History Timeline */}
          <div>
            <h4 className="text-xs font-mono uppercase text-[#64748b] font-bold mb-3 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#f59e0b]" /> Historial de Trazabilidad & Auditoría
            </h4>

            <div className="relative pl-6 border-l-2 border-[#1e293b] space-y-4">
              {(caseItem.historial && caseItem.historial.length > 0
                ? caseItem.historial
                : [
                    {
                      accion: 'Reportado',
                      por: caseItem.detectadoPor,
                      rol: 'Sistema',
                      fecha: caseItem.fechaCreacion,
                      comentario: 'Incidente registrado en obra.',
                    },
                  ]
              ).map((entry, idx) => (
                <div key={idx} className="relative group">
                  <div className="absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full bg-[#0c1322] border-2 border-[#f59e0b] group-hover:scale-125 transition-transform" />

                  <div className="bg-[#070d18] p-3 rounded-xl border border-[#1e293b]">
                    <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
                      <span className="font-['Chivo'] font-bold text-xs text-[#dae2fd]">
                        {entry.accion}
                      </span>
                      <span className="font-mono text-[10px] text-[#64748b]">
                        {new Date(entry.fecha).toLocaleTimeString('es-PE', {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}{' '}
                        ·{' '}
                        {new Date(entry.fecha).toLocaleDateString('es-PE', {
                          day: '2-digit',
                          month: 'short',
                        })}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[10px] font-mono text-[#94a3b8]">
                      <span>Por: <strong className="text-[#f59e0b]">{entry.por}</strong></span>
                      {entry.rol && (
                        <span className="px-1.5 py-0.2 rounded bg-[#1e293b] text-[#94a3b8] border border-[#334155]">
                          {entry.rol}
                        </span>
                      )}
                    </div>

                    {entry.comentario && (
                      <p className="text-xs text-[#cbd5e1] mt-1.5 italic bg-[#0c1322] p-2 rounded-lg border border-[#1e293b]/60">
                        &quot;{entry.comentario}&quot;
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="sticky bottom-0 z-10 bg-[#0c1322]/95 backdrop-blur-md border-t border-[#1e293b] p-3 sm:p-4 flex items-center justify-between">
          <div className="text-[10px] font-mono text-[#64748b]">
            Qawaq Auditoría · Protocolo DS 011-2019-TR
          </div>
          <div className="flex items-center gap-2">
            {onExportPdf && (
              <button
                type="button"
                onClick={() => onExportPdf(caseItem)}
                className="px-3.5 py-2 rounded-xl bg-[#1e293b] hover:bg-[#283548] text-[#f59e0b] border border-[#f59e0b]/30 font-['Chivo'] font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Exportar PDF</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#1e293b] hover:bg-[#283548] text-[#dae2fd] font-['Chivo'] font-bold text-xs uppercase tracking-wider transition-all"
            >
              Cerrar Ventana
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
