import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  FileCheck2,
  Camera,
  Download,
  AlertCircle,
  FileText,
  Clock,
  Sparkles,
  XCircle,
  UserCheck,
} from 'lucide-react';
import { useCases } from '../context/CaseContext';
import { useRole } from '../context/RoleContext';
import { useUsageStats } from '../hooks/useUsageStats';
import { PdfExportModal } from './PdfExportModal';
import { CaseItem } from '../types';

export const CloseCaseScreen: React.FC = () => {
  const { cases, approveValidation, rejectValidation, closeCase, showToast } = useCases();
  const { currentRole, isSSOMA, isGerencia } = useRole();
  const { logInteraction } = useUsageStats();

  const [selectedCaseId, setSelectedCaseId] = useState<string>(
    cases.find((c) => c.estado !== 'Cerrado')?.id || cases[0]?.id || ''
  );

  const [solucionUrl, setSolucionUrl] = useState<string>(
    'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&auto=format&fit=crop&q=80'
  );
  const [medidaAplicada, setMedidaAplicada] = useState<string>(
    'Se paralizó la faena preventivamente, se suministró arnés con doble línea de vida certificada y se capacitó a la cuadrilla.'
  );
  const [dictamen, setDictamen] = useState<string>(
    'Conforme con la Norma Técnica G.050 y el D.S. 011-2019-TR. Condición subestándar neutralizada satisfactoriamente.'
  );

  // Reject modal state
  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  // PDF Modal
  const [pdfCase, setPdfCase] = useState<CaseItem | null>(null);
  const [isPdfOpen, setIsPdfOpen] = useState(false);

  const selectedCase = cases.find((c) => c.id === selectedCaseId) || cases[0];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setSolucionUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDirectClose = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCase) return;

    closeCase(selectedCase.id, solucionUrl, medidaAplicada, dictamen);
    logInteraction('cierre', `Caso #${selectedCase.id} cerrado con conformidad SSOMA`);
    showToast(`Caso #${selectedCase.id} cerrado y certificado con éxito`);
  };

  const handleApprove = () => {
    if (!selectedCase) return;
    approveValidation(selectedCase.id, dictamen);
  };

  const handleConfirmReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCase || !rejectReason.trim()) return;
    rejectValidation(selectedCase.id, rejectReason.trim());
    setIsRejecting(false);
  };

  const handleOpenPdf = () => {
    if (selectedCase) {
      setPdfCase(selectedCase);
      setIsPdfOpen(true);
      logInteraction('pdf', `Acta PDF generada para caso #${selectedCase.id}`);
    }
  };

  if (!selectedCase) {
    return (
      <div className="p-8 text-center text-[#94a3b8] font-mono">
        No se han encontrado casos registrados.
      </div>
    );
  }

  const isClosed = selectedCase.estado === 'Cerrado';
  const isPendingValidation = selectedCase.estado === 'Pendiente de Validación SSOMA';

  return (
    <div className="flex flex-col w-full px-3 sm:px-6 lg:px-8 pt-3 pb-24 gap-5 max-w-4xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="bg-[#0c1322] border border-[#222a3d] p-4 sm:p-5 rounded-2xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
              AUDITORÍA & CERTIFICACIÓN SSOMA
            </span>
            <span className="font-mono text-[10px] text-[#94a3b8]">Norma G.050 / DS-011</span>
          </div>
          <h1 className="font-['Chivo'] font-black text-xl sm:text-2xl text-[#dae2fd] uppercase tracking-tight">
            Validación y Cierre de Incidente
          </h1>
          <p className="text-xs text-[#94a3b8] mt-0.5">
            Inspecciona la subsanación realizada en campo, emite dictamen técnico oficial y expide el Acta en PDF.
          </p>
        </div>

        {/* Case Selector Dropdown */}
        <div id="case-select-dropdown" className="bg-[#131b2e] p-2 rounded-xl border border-[#222a3d]">
          <span className="font-mono text-[8px] uppercase text-[#94a3b8] block">Seleccionar Caso:</span>
          <select
            value={selectedCaseId}
            onChange={(e) => setSelectedCaseId(e.target.value)}
            className="bg-transparent text-xs font-mono font-bold text-[#dae2fd] outline-none cursor-pointer"
          >
            {cases.map((c) => (
              <option key={c.id} value={c.id} className="bg-[#0c1322] text-[#dae2fd]">
                #{c.id} · {c.tipo} ({c.estado})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Case Status Overview Card */}
      <div className="bg-[#131b2e] border border-[#222a3d] rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
        <div className="flex items-start justify-between gap-2 flex-wrap pb-3 border-b border-[#222a3d]">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-black text-[#ffb95f]">
                #{selectedCase.id}
              </span>
              <span
                className={`font-mono text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                  isClosed
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : isPendingValidation
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                }`}
              >
                {selectedCase.estado}
              </span>
              <span className="font-mono text-xs text-[#94a3b8]">
                {selectedCase.frente} · {selectedCase.ubicacion}
              </span>
            </div>
            <h2 className="font-['Chivo'] font-black text-lg text-[#dae2fd] uppercase mt-1">
              {selectedCase.tipo}
            </h2>
          </div>

          <button
            type="button"
            onClick={handleOpenPdf}
            className="px-3.5 py-2 rounded-xl bg-[#1e293b] hover:bg-[#283548] text-[#f59e0b] border border-[#f59e0b]/30 font-['Chivo'] font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 active:scale-95"
          >
            <FileText className="w-4 h-4" />
            <span>Generar Acta PDF</span>
          </button>
        </div>

        {/* Visual Inspection (Before & After) */}
        <div>
          <span className="text-xs font-mono text-[#94a3b8] uppercase font-bold block mb-2">
            Comparativo Visual de Conformidad:
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-red-400 font-bold uppercase">
                1. Condición Insegura Inicial (CCTV / Reporte)
              </span>
              <div className="aspect-video rounded-xl overflow-hidden bg-black border border-red-500/30 relative">
                <img
                  src={selectedCase.fotoUrl}
                  alt="Inicial"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase">
                2. Evidencia de Subsanación en Campo
              </span>
              <div className="aspect-video rounded-xl overflow-hidden bg-black border border-emerald-500/30 relative flex items-center justify-center">
                <img
                  src={
                    selectedCase.evidenciaCorreccion?.fotoUrl ||
                    selectedCase.fotoSolucionUrl ||
                    solucionUrl
                  }
                  alt="Subsanación"
                  className="w-full h-full object-cover"
                />
                {!isClosed && !isPendingValidation && (
                  <label className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer">
                    <Camera className="w-8 h-8 text-emerald-400 mb-1" />
                    <span className="font-['Chivo'] font-bold text-xs text-white uppercase">
                      Cambiar Foto de Solución
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>
          </div>

          {selectedCase.evidenciaCorreccion?.nota && (
            <div className="mt-3 bg-emerald-500/10 border border-emerald-500/30 p-3 rounded-xl text-xs text-emerald-200">
              <strong className="font-mono text-emerald-300">Nota del Responsable en Obra:</strong>{' '}
              {selectedCase.evidenciaCorreccion.nota}
            </div>
          )}
        </div>

        {/* Action Controls for SSOMA */}
        {isPendingValidation ? (
          <div className="bg-[#18140b] border border-amber-500/40 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-['Chivo'] font-bold text-sm text-amber-300 uppercase flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" /> Caso Pendiente de Validación SSOMA
              </h3>
              <span className="text-[9px] font-mono bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-bold">
                EVALUACIÓN REQUERIDA
              </span>
            </div>

            {!isRejecting ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-[#94a3b8] mb-1">
                    Dictamen Técnico de Cierre:
                  </label>
                  <input
                    type="text"
                    value={dictamen}
                    onChange={(e) => setDictamen(e.target.value)}
                    className="w-full bg-[#070d18] border border-[#222a3d] focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-[#dae2fd] font-mono outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsRejecting(true)}
                    className="px-4 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 text-xs font-['Chivo'] font-bold uppercase transition-all flex items-center gap-1.5"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Rechazar Evidencia</span>
                  </button>

                  <button
                    id="certify-case-btn"
                    type="button"
                    onClick={handleApprove}
                    className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-black font-['Chivo'] font-black text-xs uppercase tracking-wider transition-all shadow-md shadow-emerald-500/20 flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Aprobar y Emitir Acta Oficial</span>
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleConfirmReject} className="space-y-3 bg-[#1e0d14] p-3 rounded-xl border border-red-500/40">
                <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-red-300 uppercase">
                  <AlertCircle className="w-4 h-4" /> Motivo del Rechazo Técnico:
                </div>
                <textarea
                  rows={2}
                  required
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Detalla qué condición incumple o qué falta corregir en campo..."
                  className="w-full bg-[#070d18] border border-red-500/40 focus:border-red-400 rounded-xl p-2.5 text-xs text-[#dae2fd] placeholder:text-[#64748b] outline-none"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsRejecting(false)}
                    className="px-3 py-1.5 text-xs text-[#94a3b8]"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-red-500 text-white font-['Chivo'] font-bold text-xs uppercase rounded-xl transition-all"
                  >
                    Confirmar Rechazo
                  </button>
                </div>
              </form>
            )}
          </div>
        ) : !isClosed ? (
          <form onSubmit={handleDirectClose} className="space-y-3 pt-2 border-t border-[#1e293b]">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-mono uppercase text-[#94a3b8] font-bold mb-1">
                  Medida Correctiva Aplicada en Obra:
                </label>
                <input
                  type="text"
                  required
                  value={medidaAplicada}
                  onChange={(e) => setMedidaAplicada(e.target.value)}
                  className="w-full bg-[#070d18] border border-[#222a3d] focus:border-[#f59e0b] rounded-xl px-3 py-2 text-xs text-[#dae2fd] font-mono outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-[#94a3b8] font-bold mb-1">
                  Dictamen Técnico SSOMA (Norma G.050):
                </label>
                <input
                  type="text"
                  required
                  value={dictamen}
                  onChange={(e) => setDictamen(e.target.value)}
                  className="w-full bg-[#070d18] border border-[#222a3d] focus:border-[#f59e0b] rounded-xl px-3 py-2 text-xs text-[#dae2fd] font-mono outline-none"
                />
              </div>
            </div>

            <button
              id="certify-case-btn"
              type="submit"
              className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-black font-['Chivo'] font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Certificar y Cerrar Caso Directamente</span>
            </button>
          </form>
        ) : (
          <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-200 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <div className="font-['Chivo'] font-bold text-xs uppercase">
                  Caso Cerrado y Certificado por SSOMA
                </div>
                <div className="text-[11px] text-emerald-300/80 font-mono mt-0.5">
                  Dictamen: &quot;{selectedCase.dictamenCierre || selectedCase.validacion?.comentarioSSOMA}&quot;
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleOpenPdf}
              className="px-4 py-2 rounded-xl bg-emerald-500 text-black font-['Chivo'] font-black text-xs uppercase tracking-wider transition-all shadow active:scale-95 flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Descargar Acta PDF</span>
            </button>
          </div>
        )}
      </div>

      {/* PDF Modal */}
      <PdfExportModal
        caseItem={pdfCase}
        isOpen={isPdfOpen}
        onClose={() => {
          setIsPdfOpen(false);
          setPdfCase(null);
        }}
      />
    </div>
  );
};
