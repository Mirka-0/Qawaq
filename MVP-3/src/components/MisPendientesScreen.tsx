import React, { useState } from 'react';
import {
  ListTodo,
  Clock,
  AlertTriangle,
  Play,
  Upload,
  Camera,
  CheckCircle2,
  XCircle,
  HardHat,
  Send,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Info,
  UserCheck,
} from 'lucide-react';
import { useCases } from '../context/CaseContext';
import { useRole } from '../context/RoleContext';
import { CaseItem } from '../types';
import { formatSlaCountdown, useLiveTimer } from '../utils/sla';
import { CaseDetailModal } from './CaseDetailModal';

export const MisPendientesScreen: React.FC = () => {
  const { cases, startCorrection, submitCorrectionEvidence, showToast } = useCases();
  const { activeSupervisor, availableSupervisors, setActiveSupervisor } = useRole();
  const now = useLiveTimer(3000);

  // Correction Form Modal State
  const [activeCaseForEvidence, setActiveCaseForEvidence] = useState<CaseItem | null>(null);
  const [evidencePhoto, setEvidencePhoto] = useState<string>(
    'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&auto=format&fit=crop&q=80'
  );
  const [evidenceNote, setEvidenceNote] = useState<string>(
    'Se procedió al anclaje inmediato con línea de vida doble certificada y se verificó el EPP completo del personal.'
  );

  // Detail Modal State
  const [selectedCaseForDetail, setSelectedCaseForDetail] = useState<CaseItem | null>(null);

  // Filter tabs state
  const [filterState, setFilterState] = useState<'ALL' | 'ASIGNADO' | 'CORRECCION' | 'VALIDACION' | 'CERRADO'>('ALL');

  // Filter cases assigned to this active supervisor
  const myCases = cases.filter((c) => {
    if (!c.asignadoA) {
      return c.responsable.toLowerCase().includes(activeSupervisor.nombre.toLowerCase());
    }
    return (
      c.asignadoA.nombre === activeSupervisor.nombre ||
      c.responsable.toLowerCase().includes(activeSupervisor.nombre.toLowerCase())
    );
  });

  // Apply tab filter
  const filteredMyCases = myCases.filter((c) => {
    if (filterState === 'ASIGNADO') return c.estado === 'Asignado';
    if (filterState === 'CORRECCION') return c.estado === 'En Corrección' || c.estado === 'Rechazado';
    if (filterState === 'VALIDACION') return c.estado === 'Pendiente de Validación SSOMA';
    if (filterState === 'CERRADO') return c.estado === 'Cerrado';
    return true;
  });

  // Sort by urgency and SLA deadline (most urgent / earliest deadline first)
  const sortedCases = [...filteredMyCases].sort((a, b) => {
    // Closed cases go to the bottom
    if (a.estado === 'Cerrado' && b.estado !== 'Cerrado') return 1;
    if (a.estado !== 'Cerrado' && b.estado === 'Cerrado') return -1;

    // Overdue or sooner deadline first
    const aTime = a.plazoObjetivo ? new Date(a.plazoObjetivo).getTime() : Infinity;
    const bTime = b.plazoObjetivo ? new Date(b.plazoObjetivo).getTime() : Infinity;
    return aTime - bTime;
  });

  const handleStartCorrection = (caseId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    startCorrection(caseId);
  };

  const handleOpenEvidenceForm = (item: CaseItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveCaseForEvidence(item);
    if (item.evidenciaCorreccion?.fotoUrl) {
      setEvidencePhoto(item.evidenciaCorreccion.fotoUrl);
    }
    if (item.evidenciaCorreccion?.nota) {
      setEvidenceNote(item.evidenciaCorreccion.nota);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setEvidencePhoto(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitEvidence = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCaseForEvidence) return;

    submitCorrectionEvidence(
      activeCaseForEvidence.id,
      evidencePhoto,
      evidenceNote.trim()
    );

    setActiveCaseForEvidence(null);
  };

  return (
    <div className="flex flex-col w-full px-3 sm:px-6 lg:px-8 pt-3 pb-24 gap-5 max-w-5xl mx-auto animate-fade-in">
      {/* Header Banner with Supervisor Identity */}
      <div className="bg-[#0c1322] border border-[#222a3d] p-4 sm:p-5 rounded-2xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="relative w-14 h-14 rounded-2xl overflow-hidden border-2 border-[#f59e0b] shadow-lg shrink-0">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuB4L7YJ5RDre317tlHffWaS2fkn_133_BPTEdAkj9B3-tPgWWw2BjmJmlbK0h8Jpa9PIaoiyOI8yNssK9fiMvUZy-jZgfz7KHbn9I0OaUk10Oyn8ue8zp0P0JhJhiSYVfp70u3Ety11JYEPQnUUwx3zRfpBcEZGT9XG20HWfEbJgDG5QpQEYAws0ziu0Ic_onzsYAytmckXp7TWHVUCXpw-Q_rTOuz7QPzX22cQQQ8ObPzHcCqGxd2Bvw"
              alt={activeSupervisor.nombre}
              className="w-full h-full object-cover"
            />
            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 rounded-full ring-2 ring-[#0c1322]" />
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="font-mono text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30">
                {activeSupervisor.rol.toUpperCase()}
              </span>
              <span className="font-mono text-[10px] text-[#94a3b8]">{activeSupervisor.frenteAsignado}</span>
            </div>
            <h1 className="font-['Chivo'] font-black text-xl sm:text-2xl text-[#dae2fd] uppercase tracking-tight">
              {activeSupervisor.nombre}
            </h1>
            <p className="text-xs text-[#94a3b8] mt-0.5">
              Atiende las observaciones asignadas por SSOMA, sube evidencia de corrección y cumple con el SLA legal.
            </p>
          </div>
        </div>

        {/* Quick supervisor switcher for testing */}
        <div className="flex items-center gap-2 bg-[#131b2e] p-2 rounded-xl border border-[#222a3d] shrink-0 self-start sm:self-auto">
          <UserCheck className="w-4 h-4 text-[#f59e0b] shrink-0" />
          <div className="flex flex-col">
            <span className="font-mono text-[8px] uppercase text-[#94a3b8]">Cambiar Identidad:</span>
            <select
              value={activeSupervisor.id}
              onChange={(e) => {
                const sup = availableSupervisors.find((s) => s.id === e.target.value);
                if (sup) setActiveSupervisor(sup);
              }}
              className="bg-transparent text-xs font-mono font-bold text-[#dae2fd] outline-none cursor-pointer"
            >
              {availableSupervisors.map((s) => (
                <option key={s.id} value={s.id} className="bg-[#0c1322] text-[#dae2fd]">
                  {s.nombre} ({s.rol})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Summary KPI Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div
          onClick={() => setFilterState('ALL')}
          className={`p-3 rounded-xl border transition-all cursor-pointer ${
            filterState === 'ALL'
              ? 'bg-[#1e293b] border-[#f59e0b]'
              : 'bg-[#131b2e] border-[#222a3d] hover:border-[#334155]'
          }`}
        >
          <span className="font-mono text-[9px] uppercase text-[#94a3b8]">Total Asignados</span>
          <div className="font-mono text-2xl font-black text-[#dae2fd] mt-1">
            {myCases.length}
          </div>
        </div>

        <div
          onClick={() => setFilterState('ASIGNADO')}
          className={`p-3 rounded-xl border transition-all cursor-pointer ${
            filterState === 'ASIGNADO'
              ? 'bg-[#1e293b] border-amber-400'
              : 'bg-[#131b2e] border-[#222a3d] hover:border-amber-400/50'
          }`}
        >
          <span className="font-mono text-[9px] uppercase text-amber-400">Por Iniciar</span>
          <div className="font-mono text-2xl font-black text-amber-400 mt-1">
            {myCases.filter((c) => c.estado === 'Asignado').length}
          </div>
        </div>

        <div
          onClick={() => setFilterState('CORRECCION')}
          className={`p-3 rounded-xl border transition-all cursor-pointer ${
            filterState === 'CORRECCION'
              ? 'bg-[#1e293b] border-cyan-400'
              : 'bg-[#131b2e] border-[#222a3d] hover:border-cyan-400/50'
          }`}
        >
          <span className="font-mono text-[9px] uppercase text-cyan-400">En Corrección</span>
          <div className="font-mono text-2xl font-black text-cyan-400 mt-1">
            {
              myCases.filter(
                (c) => c.estado === 'En Corrección' || c.estado === 'Rechazado'
              ).length
            }
          </div>
        </div>

        <div
          onClick={() => setFilterState('VALIDACION')}
          className={`p-3 rounded-xl border transition-all cursor-pointer ${
            filterState === 'VALIDACION'
              ? 'bg-[#1e293b] border-emerald-400'
              : 'bg-[#131b2e] border-[#222a3d] hover:border-emerald-400/50'
          }`}
        >
          <span className="font-mono text-[9px] uppercase text-emerald-400">En Revisión SSOMA</span>
          <div className="font-mono text-2xl font-black text-emerald-400 mt-1">
            {myCases.filter((c) => c.estado === 'Pendiente de Validación SSOMA').length}
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-[11px] font-mono">
        {[
          { id: 'ALL', label: 'Todos', count: myCases.length },
          { id: 'ASIGNADO', label: 'Por Atender', count: myCases.filter((c) => c.estado === 'Asignado').length },
          { id: 'CORRECCION', label: 'En Corrección', count: myCases.filter((c) => c.estado === 'En Corrección' || c.estado === 'Rechazado').length },
          { id: 'VALIDACION', label: 'En Revisión SSOMA', count: myCases.filter((c) => c.estado === 'Pendiente de Validación SSOMA').length },
          { id: 'CERRADO', label: 'Cerrados / Resueltos', count: myCases.filter((c) => c.estado === 'Cerrado').length },
        ].map((tab) => {
          const isSelected = filterState === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterState(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-1.5 border ${
                isSelected
                  ? 'bg-[#f59e0b] text-[#2a1700] border-[#ffddb8] shadow-sm'
                  : 'bg-[#131b2e] text-[#94a3b8] hover:text-[#dae2fd] border-[#222a3d]'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[9px] ${
                  isSelected ? 'bg-[#2a1700] text-[#ffddb8]' : 'bg-[#1e293b] text-[#94a3b8]'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Cases List */}
      <div id="supervisor-feed" className="space-y-3">
        <div className="flex items-center justify-between text-xs font-mono text-[#94a3b8] px-1">
          <span>
            Mostrando <strong>{sortedCases.length}</strong> casos asignados
          </span>
          <span>Ordenados por urgencia y vencimiento SLA</span>
        </div>

        {sortedCases.length === 0 ? (
          <div className="bg-[#131b2e] border border-[#222a3d] rounded-2xl p-8 text-center text-[#94a3b8] font-mono space-y-2">
            <CheckCircle2 className="w-12 h-12 text-[#10b981] mx-auto opacity-80" />
            <p className="font-bold text-base text-[#dae2fd]">
              ¡Excelente trabajo! No tienes casos pendientes
            </p>
            <p className="text-xs">
              Todas las observaciones de tu cuadrilla han sido subsanadas y certificadas.
            </p>
          </div>
        ) : (
          sortedCases.map((item) => {
            const sla = formatSlaCountdown(item.plazoObjetivo, item.estado, now);
            const isAssigned = item.estado === 'Asignado';
            const isInCorrection = item.estado === 'En Corrección';
            const isRejected = item.estado === 'Rechazado';
            const isPendingValidation = item.estado === 'Pendiente de Validación SSOMA';
            const isClosed = item.estado === 'Cerrado';

            return (
              <div
                key={item.id}
                onClick={() => setSelectedCaseForDetail(item)}
                className={`bg-[#131b2e] hover:bg-[#172238] border rounded-2xl p-4 sm:p-5 transition-all shadow-md cursor-pointer group space-y-3.5 ${
                  isRejected
                    ? 'border-red-500/50 bg-[#1e0e15]'
                    : isPendingValidation
                    ? 'border-amber-500/40'
                    : 'border-[#222a3d] hover:border-[#334155]'
                }`}
              >
                {/* Top Info Bar */}
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-black text-[#ffb95f] px-2 py-0.5 rounded bg-[#f59e0b]/15 border border-[#f59e0b]/30">
                      #{item.id}
                    </span>

                    <span
                      className={`font-mono text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                        item.prioridad === 'Crítico'
                          ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                          : item.prioridad === 'Alto'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      }`}
                    >
                      {item.prioridad}
                    </span>

                    <span
                      className={`font-mono text-[9px] px-2 py-0.5 rounded font-bold uppercase ${
                        isClosed
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : isPendingValidation
                          ? 'bg-amber-500/20 text-amber-300'
                          : isRejected
                          ? 'bg-red-500/25 text-red-300 font-black'
                          : isAssigned
                          ? 'bg-blue-500/20 text-blue-300'
                          : 'bg-[#1e293b] text-[#94a3b8]'
                      }`}
                    >
                      {item.estado}
                    </span>
                  </div>

                  {/* SLA Countdown */}
                  <div
                    className={`font-mono text-xs px-2.5 py-1 rounded-lg border font-bold flex items-center gap-1.5 ${
                      sla.isVencido
                        ? 'bg-red-500/20 text-red-300 border-red-500/40'
                        : isClosed
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-[#0b1326] text-[#38bdf8] border-[#1e293b]'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>{sla.text}</span>
                  </div>
                </div>

                {/* Rejection Warning Box if state is Rechazado */}
                {isRejected && item.validacion && !item.validacion.aprobado && (
                  <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-3 text-xs text-red-200 space-y-1">
                    <div className="flex items-center gap-1.5 font-mono font-bold uppercase text-red-300">
                      <XCircle className="w-4 h-4" /> Observación Rechazada por SSOMA:
                    </div>
                    <p className="italic font-sans">
                      &quot;{item.validacion.comentarioSSOMA}&quot;
                    </p>
                    <div className="text-[10px] font-mono text-red-300/80 pt-0.5">
                      Debes subsanar la observación y enviar una nueva fotografía técnica.
                    </div>
                  </div>
                )}

                {/* Center Content (Photo + Description) */}
                <div className="flex flex-col sm:flex-row gap-3.5">
                  <div className="w-full sm:w-36 h-28 rounded-xl overflow-hidden bg-black shrink-0 border border-[#222a3d]">
                    <img
                      src={item.fotoUrl}
                      alt={item.tipo}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>

                  <div className="min-w-0 flex-1 space-y-1.5">
                    <h3 className="font-['Chivo'] font-bold text-base text-[#dae2fd]">
                      {item.tipo}
                    </h3>
                    <div className="text-xs font-mono text-[#94a3b8]">
                      <strong>Ubicación:</strong> {item.ubicacion} ({item.frente})
                    </div>
                    <p className="text-xs text-[#cbd5e1] line-clamp-2 leading-relaxed">
                      {item.descripcion}
                    </p>
                  </div>
                </div>

                {/* Actions Footer based on state */}
                <div
                  className="pt-2 border-t border-[#1e293b] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="text-[10px] font-mono text-[#94a3b8]">
                    Detectado: {new Date(item.fechaCreacion).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}
                  </div>

                  <div className="flex items-center gap-2">
                    {/* State: Asignado -> Button: Iniciar Corrección */}
                    {isAssigned && (
                      <button
                        id="supervisor-action-btn"
                        type="button"
                        onClick={(e) => handleStartCorrection(item.id, e)}
                        className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-[#f59e0b] hover:bg-[#d97706] text-[#2a1700] font-['Chivo'] font-black text-xs uppercase tracking-wider transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Iniciar Corrección en Campo</span>
                      </button>
                    )}

                    {/* State: En Corrección OR Rechazado -> Button: Subir Evidencia */}
                    {(isInCorrection || isRejected) && (
                      <button
                        id="supervisor-action-btn"
                        type="button"
                        onClick={(e) => handleOpenEvidenceForm(item, e)}
                        className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-black font-['Chivo'] font-black text-xs uppercase tracking-wider transition-all shadow-md shadow-emerald-500/20 active:scale-95 flex items-center justify-center gap-1.5"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>Subir Evidencia de Subsanación</span>
                      </button>
                    )}

                    {/* State: Pendiente de Validación SSOMA -> Badge: Esperando revisión */}
                    {isPendingValidation && (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 text-amber-300 border border-amber-500/30 font-mono text-xs font-bold">
                        <Clock className="w-3.5 h-3.5 animate-spin" />
                        <span>Esperando revisión de SSOMA</span>
                      </div>
                    )}

                    {/* State: Cerrado -> Badge: Caso Resuelto */}
                    {isClosed && (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-mono text-xs font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Caso Conforme & Certificado</span>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => setSelectedCaseForDetail(item)}
                      className="p-2 rounded-xl bg-[#1e293b] hover:bg-[#283548] text-[#dae2fd] transition-colors"
                      title="Ver detalle completo e historial"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* MODAL: SUBIR EVIDENCIA DE CORRECCIÓN */}
      {activeCaseForEvidence && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-lg bg-[#0c1322] border border-[#222a3d] rounded-2xl shadow-2xl p-5 space-y-4 max-h-[92vh] overflow-y-auto text-[#dae2fd]">
            <div className="flex items-center justify-between border-b border-[#1e293b] pb-3">
              <div>
                <span className="font-mono text-[10px] text-emerald-400 font-bold uppercase">
                  SUBIR SUBSANACIÓN DE CAMPO
                </span>
                <h3 className="font-['Chivo'] font-black text-lg text-[#dae2fd] uppercase">
                  Caso #{activeCaseForEvidence.id}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveCaseForEvidence(null)}
                className="p-1.5 rounded-lg text-[#94a3b8] hover:text-[#dae2fd]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitEvidence} className="space-y-4">
              {/* Photo Evidence */}
              <div>
                <label className="block text-xs font-mono uppercase text-[#94a3b8] font-bold mb-1.5">
                  Fotografía de la Condición Corregida:
                </label>
                <div className="relative aspect-video rounded-xl overflow-hidden bg-black border-2 border-dashed border-[#334155] group hover:border-emerald-500 transition-colors">
                  <img
                    src={evidencePhoto}
                    alt="Evidencia"
                    className="w-full h-full object-cover"
                  />
                  <label className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <Camera className="w-8 h-8 text-emerald-400 mb-1" />
                    <span className="font-['Chivo'] font-bold text-xs text-white uppercase">
                      Cambiar Foto de Campo
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
              </div>

              {/* Note / Action Taken */}
              <div>
                <label className="block text-xs font-mono uppercase text-[#94a3b8] font-bold mb-1.5">
                  Acción Tomada / Nota del Responsable:
                </label>
                <textarea
                  rows={3}
                  required
                  value={evidenceNote}
                  onChange={(e) => setEvidenceNote(e.target.value)}
                  placeholder="Detalla qué medida técnica se ejecutó para subsanar el riesgo..."
                  className="w-full bg-[#070d18] border border-[#222a3d] focus:border-emerald-500 rounded-xl p-3 text-xs text-[#dae2fd] font-mono outline-none"
                />
              </div>

              {/* Submit to SSOMA */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#1e293b]">
                <button
                  type="button"
                  onClick={() => setActiveCaseForEvidence(null)}
                  className="px-4 py-2 text-xs text-[#94a3b8] hover:text-[#dae2fd]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-black font-['Chivo'] font-black text-xs uppercase tracking-wider transition-all shadow-md shadow-emerald-500/20 flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Enviar a Validación SSOMA</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Case Detail Modal */}
      <CaseDetailModal
        caseItem={selectedCaseForDetail}
        isOpen={Boolean(selectedCaseForDetail)}
        onClose={() => setSelectedCaseForDetail(null)}
      />
    </div>
  );
};
