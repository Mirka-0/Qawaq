import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  Camera,
  CheckCircle2,
  Check,
  Bot,
  UserCheck,
  Mic,
  FileCheck,
  Download,
  LayoutDashboard,
  Upload,
  RefreshCw,
  FileText,
  Printer,
} from 'lucide-react';
import { ASSETS, CORRECTIVE_MEASURES } from '../constants';
import { useCases } from '../context/CaseContext';
import { PdfExportModal } from './PdfExportModal';

export const CloseCaseScreen: React.FC = () => {
  const {
    cases,
    selectedCaseForClosureId,
    setSelectedCaseForClosureId,
    closeCase,
    setActiveTab,
  } = useCases();

  // Find candidate case
  const candidateCases = cases.filter((c) => c.estado !== 'Cerrado');
  const targetCase =
    cases.find((c) => c.id === selectedCaseForClosureId) ||
    candidateCases[0] ||
    cases[0];

  const [selectedMeasure, setSelectedMeasure] = useState<string>(
    CORRECTIVE_MEASURES[0]
  );
  const [dictamen, setDictamen] = useState<string>(
    'Se detuvo al trabajador en Losa 14, se le proporcionó casco de seguridad nuevo Clase E con barbiquejo homologado y se impartió charla de 5 minutos sobre riesgo de caída de objetos. Condición 100% subsanada.'
  );
  const [solutionPhoto, setSolutionPhoto] = useState<string>(ASSETS.resolved);
  const [isRecording, setIsRecording] = useState<boolean>(false);

  // TWO SEPARATE TOGGLES
  const [conformeG050, setConformeG050] = useState<boolean>(true);
  const [conformeDS011, setConformeDS011] = useState<boolean>(true);

  // Success certificate state
  const [isCaseClosed, setIsCaseClosed] = useState<boolean>(
    targetCase?.estado === 'Cerrado'
  );

  // PDF Export Modal state
  const [isPdfModalOpen, setIsPdfModalOpen] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (targetCase) {
      setIsCaseClosed(targetCase.estado === 'Cerrado');
      if (targetCase.medidaAplicada) {
        setSelectedMeasure(targetCase.medidaAplicada);
      }
      if (targetCase.dictamenCierre) {
        setDictamen(targetCase.dictamenCierre);
      }
      if (targetCase.fotoSolucionUrl) {
        setSolutionPhoto(targetCase.fotoSolucionUrl);
      }
    }
  }, [targetCase?.id, targetCase?.estado]);

  if (!targetCase) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center min-h-[60vh] max-w-lg mx-auto">
        <CheckCircle2 className="w-12 h-12 text-[#10b981] mb-2" />
        <h3 className="font-['Chivo'] font-bold text-base text-[#dae2fd]">
          No hay casos pendientes de cierre
        </h3>
        <p className="font-sans text-xs text-[#94a3b8] mt-1">
          Todos los riesgos identificados han sido subsanados y archivados en el libro SSOMA.
        </p>
      </div>
    );
  }

  const handleResolveAndClose = () => {
    closeCase(targetCase.id, {
      medidaAplicada: selectedMeasure,
      dictamenCierre: dictamen,
      conformeG050,
      conformeDS011,
      fotoSolucionUrl: solutionPhoto,
    });
    setIsCaseClosed(true);
  };

  const handleVoiceToggle = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      setTimeout(() => {
        setDictamen((prev) => `${prev} [Voz agregada: Verificación de barbiquejo realizada por supervisor].`);
        setIsRecording(false);
      }, 2000);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setSolutionPhoto(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col w-full px-3 sm:px-6 lg:px-8 pt-3 pb-24 gap-4 max-w-md sm:max-w-3xl md:max-w-5xl lg:max-w-6xl mx-auto">
      {/* 1. Selector if there are multiple cases to choose from */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-[#131b2e] p-3 rounded-2xl border border-[#222a3d]">
        <div className="flex items-center gap-2 overflow-x-auto py-1 no-scrollbar">
          <span className="font-mono text-[9px] text-[#94a3b8] uppercase font-bold shrink-0">
            CASO ACTIVO:
          </span>
          {cases.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCaseForClosureId(c.id)}
              className={`px-2.5 py-1 rounded-lg font-mono text-[10px] font-bold uppercase transition-all shrink-0 border flex items-center gap-1.5 ${
                targetCase.id === c.id
                  ? 'bg-[#f59e0b] text-[#2a1700] border-[#ffddb8] shadow-sm'
                  : 'bg-[#0b1326] text-[#94a3b8] border-[#222a3d] hover:text-[#dae2fd]'
              }`}
            >
              <span>#{c.id}</span>
              <span className="truncate max-w-[100px]">{c.tipo}</span>
              {c.estado === 'Cerrado' && (
                <CheckCircle2 className="w-3 h-3 text-[#10b981]" />
              )}
            </button>
          ))}
        </div>

        {/* Quick PDF button in header */}
        <button
          onClick={() => setIsPdfModalOpen(true)}
          className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1e293b] hover:bg-[#283548] text-[#f59e0b] border border-[#f59e0b]/40 font-mono text-[10px] font-bold uppercase transition-all shrink-0 active:scale-95 shadow-sm"
          title="Ver Acta Oficial y Exportar en formato PDF"
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Acta PDF Oficial</span>
        </button>
      </div>

      {/* Responsive 2-column Grid for Medium and Large Screens */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 items-start">
        {/* Left Column: Original Incident, Context & Normative Compliance */}
        <div className="flex flex-col gap-4">
          {/* 2. Header del caso */}
          <div className="flex flex-col gap-1.5 bg-[#131b2e] p-3.5 rounded-2xl border border-[#222a3d] shadow-md">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[11px] text-[#f59e0b] font-bold px-2 py-0.5 bg-[#1e293b] rounded border border-[#334155]">
                  CASO #{targetCase.id}
                </span>
                <span className="text-[#94a3b8] font-mono text-xs">•</span>
                <span className="font-sans text-xs text-[#dae2fd] font-semibold truncate">
                  {targetCase.ubicacion}
                </span>
              </div>

              {/* Dynamic Status Badge */}
              <div
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg shadow-sm border ${
                  isCaseClosed || targetCase.estado === 'Cerrado'
                    ? 'bg-[#064e3b] text-[#6ffbbe] border-[#10b981]/50'
                    : 'bg-[#93000a] text-[#ffdad6] border-[#ef4444]/40'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    isCaseClosed || targetCase.estado === 'Cerrado'
                      ? 'bg-[#10b981]'
                      : 'bg-[#ef4444] animate-pulse'
                  }`}
                />
                <span className="font-mono text-[9px] uppercase tracking-wider font-extrabold">
                  {isCaseClosed || targetCase.estado === 'Cerrado'
                    ? 'ESTADO: RESUELTO / CONFORME'
                    : 'ESTADO: ABIERTO (CRÍTICO)'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-1 text-[#94a3b8]">
              <span className="font-mono text-[9px] text-[#94a3b8] truncate">
                {targetCase.detectadoPor === 'Cámara IA'
                  ? `Detectado por ${targetCase.camaraOrigen || 'Cámara IA-04'} hoy`
                  : 'Reportado manualmente por inspector de campo'}
              </span>
            </div>
          </div>

          {/* 3. Evidencia Original del Incidente (Fase 1) */}
          <div className="flex flex-col gap-2 bg-[#131b2e] p-3.5 rounded-2xl border border-[#222a3d] shadow-md">
            <div className="flex items-center justify-between">
              <span className="font-['Chivo'] font-bold text-xs text-[#dae2fd] flex items-center gap-1.5 uppercase">
                <AlertTriangle className="w-4 h-4 text-[#ef4444]" />
                Evidencia Original del Incidente
              </span>
              <span className="font-mono text-[9px] bg-[#93000a] text-[#ffdad6] px-2 py-0.5 rounded font-bold border border-[#ef4444]/30">
                FASE 1 · INICIAL
              </span>
            </div>

            {/* Thumbnail of Original Infraction */}
            <div className="relative w-full rounded-xl overflow-hidden bg-[#060e20] border border-[#222a3d] mt-1 shadow-inner">
              <img
                src={targetCase.fotoUrl}
                alt="Infracción detectada"
                className="w-full h-44 sm:h-52 object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#060e20]/90 via-transparent to-[#060e20]/40 pointer-events-none" />

              {/* Infraction HUD Tag */}
              <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-[#ef4444]/90 text-white px-2 py-1 rounded-lg shadow-md font-mono text-[9px] font-bold uppercase tracking-tight">
                <AlertTriangle className="w-3 h-3" />
                <span>INFRACCIÓN: {targetCase.tipo.toUpperCase()}</span>
              </div>

              <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[#dae2fd] font-mono text-[9px]">
                <span className="bg-[#060e20]/80 px-2 py-0.5 rounded backdrop-blur-sm text-[#94a3b8]">
                  {targetCase.camaraOrigen || 'CAM-04 // FRENTE NORTE'}
                </span>
                <span className="bg-[#060e20]/80 px-2 py-0.5 rounded backdrop-blur-sm text-[#ffb4ab] font-bold">
                  CONFIANZA IA: {targetCase.confianzaIA || 98.4}%
                </span>
              </div>
            </div>

            {/* Reporter Metadata */}
            <div className="grid grid-cols-2 gap-2 mt-1 pt-1 bg-[#0b1326] p-2.5 rounded-xl border border-[#1e293b]">
              <div className="flex items-center gap-2 min-w-0">
                <Bot className="w-4 h-4 text-[#f59e0b] shrink-0" />
                <div className="flex flex-col min-w-0">
                  <span className="font-mono text-[8px] text-[#94a3b8] uppercase">Reportado por:</span>
                  <span className="font-sans text-[11px] text-[#dae2fd] font-semibold truncate">
                    {targetCase.detectadoPor === 'Cámara IA'
                      ? 'Qawaq Computer Vision'
                      : 'Reporte de Campo'}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 min-w-0">
                <UserCheck className="w-4 h-4 text-[#10b981] shrink-0" />
                <div className="flex flex-col min-w-0">
                  <span className="font-mono text-[8px] text-[#94a3b8] uppercase">Supervisor SSOMA:</span>
                  <span className="font-sans text-[11px] text-[#dae2fd] font-semibold truncate">
                    {targetCase.responsable.split('(')[0].trim()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 5. DOS TOGGLES SEPARADOS (Normas Técnicas Peruanas Requeridas) */}
          <div className="flex flex-col gap-2">
            <span className="font-mono text-[9px] text-[#94a3b8] uppercase font-bold tracking-wider">
              Validación Normativa Obligatoria (Perú):
            </span>

            {/* Toggle 1: Norma Técnica G.050 */}
            <div
              onClick={() => setConformeG050(!conformeG050)}
              className={`flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer shadow-md select-none ${
                conformeG050
                  ? 'bg-[#131b2e] border-[#10b981]/50'
                  : 'bg-[#131b2e]/60 border-[#334155]'
              }`}
            >
              <div className="flex items-start gap-2.5 min-w-0 pr-2">
                <FileCheck
                  className={`w-5 h-5 shrink-0 mt-0.5 ${
                    conformeG050 ? 'text-[#10b981]' : 'text-[#64748b]'
                  }`}
                />
                <div className="flex flex-col min-w-0">
                  <span className="font-sans text-xs font-bold text-[#dae2fd] leading-snug">
                    Conforme con Norma Técnica G.050
                  </span>
                  <span className="font-mono text-[9px] text-[#94a3b8] mt-0.5">
                    Seguridad durante la Construcción (RNE)
                  </span>
                </div>
              </div>

              {/* Pill Switch */}
              <div
                className={`w-11 h-6 rounded-full flex items-center p-0.5 shrink-0 transition-colors ${
                  conformeG050 ? 'bg-[#10b981] justify-end' : 'bg-[#334155] justify-start'
                }`}
              >
                <div className="w-5 h-5 rounded-full bg-[#0b1326] shadow-md flex items-center justify-center text-[#10b981]">
                  {conformeG050 && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
              </div>
            </div>

            {/* Toggle 2: D.S. N.º 011-2019-TR */}
            <div
              onClick={() => setConformeDS011(!conformeDS011)}
              className={`flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer shadow-md select-none ${
                conformeDS011
                  ? 'bg-[#131b2e] border-[#10b981]/50'
                  : 'bg-[#131b2e]/60 border-[#334155]'
              }`}
            >
              <div className="flex items-start gap-2.5 min-w-0 pr-2">
                <FileCheck
                  className={`w-5 h-5 shrink-0 mt-0.5 ${
                    conformeDS011 ? 'text-[#10b981]' : 'text-[#64748b]'
                  }`}
                />
                <div className="flex flex-col min-w-0">
                  <span className="font-sans text-xs font-bold text-[#dae2fd] leading-snug">
                    Conforme con D.S. N.º 011-2019-TR
                  </span>
                  <span className="font-mono text-[9px] text-[#94a3b8] mt-0.5">
                    Reglamento de SST para el Sector Construcción
                  </span>
                </div>
              </div>

              {/* Pill Switch */}
              <div
                className={`w-11 h-6 rounded-full flex items-center p-0.5 shrink-0 transition-colors ${
                  conformeDS011 ? 'bg-[#10b981] justify-end' : 'bg-[#334155] justify-start'
                }`}
              >
                <div className="w-5 h-5 rounded-full bg-[#0b1326] shadow-md flex items-center justify-center text-[#10b981]">
                  {conformeDS011 && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Corrective Measure, Verification Photo & Resolution */}
        <div className="flex flex-col gap-4">
          {/* 4. Acción Correctiva & Evidencia de Cierre */}
          <div className="flex flex-col gap-3 bg-[#131b2e] p-3.5 rounded-2xl border border-[#222a3d] shadow-md">
            <div className="flex items-center justify-between">
              <span className="font-['Chivo'] font-bold text-xs text-[#dae2fd] flex items-center gap-1.5 uppercase">
                <ShieldCheck className="w-4 h-4 text-[#10b981]" />
                Acción Correctiva & Evidencia de Subsanación
              </span>
              <span className="font-mono text-[9px] bg-[#064e3b] text-[#6ffbbe] px-2 py-0.5 rounded font-bold border border-[#10b981]/30">
                FASE 2 · CIERRE
              </span>
            </div>

            {/* Recuadro Fotográfico Verificado / Subir Evidencia */}
            <div className="relative w-full rounded-xl overflow-hidden bg-[#060e20] border border-[#222a3d] shadow-inner group">
              <img
                src={solutionPhoto}
                alt="Evidencia correctiva"
                className="w-full h-44 sm:h-52 object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#060e20]/90 via-transparent to-transparent pointer-events-none" />

              {/* Floating Verified Badge */}
              <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-[#10b981]/90 text-[#022c22] px-2.5 py-1 rounded-lg shadow-md font-mono text-[9px] font-bold uppercase tracking-wide">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#022c22]" />
                <span>FOTO ADJUNTADA [VERIFICADA]</span>
              </div>

              <div className="absolute top-2 right-2 flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-2 py-1 bg-[#0b1326]/80 hover:bg-[#1e293b] backdrop-blur-md text-[#dae2fd] rounded-lg border border-[#334155] font-mono text-[9px] flex items-center gap-1 active:scale-95 transition-all"
                >
                  <Upload className="w-2.5 h-2.5 text-[#f59e0b]" /> Cambiar Foto
                </button>
              </div>

              <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between font-mono text-[9px] text-[#dae2fd]">
                <span className="bg-[#0b1326]/90 px-2 py-0.5 rounded backdrop-blur-sm text-[#10b981] font-bold">
                  EPP COMPLETO: CASCO CLASE E + BARBIQUEJO
                </span>
                <span className="bg-[#0b1326]/90 px-2 py-0.5 rounded backdrop-blur-sm text-[#94a3b8]">
                  GPS: TORRE ANDINA
                </span>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoUpload}
              />
            </div>

            {/* Medidas adoptadas */}
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[9px] uppercase tracking-wider text-[#94a3b8] font-bold">
                Medida Inmediata Aplicada:
              </label>
              <div className="flex flex-col gap-2">
                {CORRECTIVE_MEASURES.map((measure) => {
                  const isSelected = selectedMeasure === measure;
                  return (
                    <button
                      key={measure}
                      type="button"
                      onClick={() => setSelectedMeasure(measure)}
                      className={`w-full text-left flex items-center justify-between p-2.5 rounded-xl border transition-all active:scale-[0.99] ${
                        isSelected
                          ? 'bg-[#1e293b] text-[#dae2fd] border-[#f59e0b] shadow-sm'
                          : 'bg-[#0b1326] text-[#94a3b8] hover:bg-[#131b2e] border-[#1e293b]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 pr-2">
                        <div
                          className={`w-4 h-4 rounded-full flex items-center justify-center border shrink-0 ${
                            isSelected
                              ? 'bg-[#f59e0b] border-[#f59e0b] text-[#2a1700]'
                              : 'border-[#64748b]'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <span className="font-sans text-xs font-medium truncate">
                          {measure}
                        </span>
                      </div>
                      {isSelected && (
                        <span className="font-mono text-[9px] bg-[#f59e0b] text-[#2a1700] px-1.5 py-0.2 rounded font-bold shrink-0">
                          ACTIVO
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Campo de comentario de cierre con micrófono */}
            <div className="flex flex-col gap-1.5 mt-1">
              <div className="flex items-center justify-between">
                <label className="font-mono text-[9px] uppercase tracking-wider text-[#94a3b8] font-bold">
                  Dictamen y Protocolo de Cierre:
                </label>
                <button
                  type="button"
                  onClick={handleVoiceToggle}
                  className={`flex items-center gap-1 font-mono text-[9px] uppercase transition-colors ${
                    isRecording ? 'text-[#ef4444] animate-pulse' : 'text-[#f59e0b] hover:text-[#ffc174]'
                  }`}
                >
                  <Mic className="w-3 h-3" />
                  <span>{isRecording ? 'Grabando...' : 'Voz a Texto'}</span>
                </button>
              </div>
              <div className="relative w-full">
                <textarea
                  rows={3}
                  value={dictamen}
                  onChange={(e) => setDictamen(e.target.value)}
                  className="w-full p-3 bg-[#0b1326] text-[#dae2fd] rounded-xl font-sans text-xs border border-[#1e293b] outline-none resize-none shadow-inner leading-relaxed focus:border-[#10b981]"
                />
              </div>
            </div>
          </div>

          {/* 6. Botón de Acción Principal de Cierre & Exportar PDF */}
          <div className="flex flex-col w-full pt-1">
            <button
              type="button"
              onClick={handleResolveAndClose}
              disabled={isCaseClosed || targetCase.estado === 'Cerrado'}
              className={`w-full min-h-13 py-3.5 px-4 rounded-xl font-['Chivo'] font-black text-sm tracking-wide uppercase flex items-center justify-center gap-2.5 shadow-lg active:scale-[0.98] transition-all ${
                isCaseClosed || targetCase.estado === 'Cerrado'
                  ? 'bg-[#1e293b] text-[#10b981] border border-[#10b981]/40'
                  : 'bg-[#10b981] hover:bg-[#059669] text-[#022c22] shadow-[#10b981]/30'
              }`}
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>
                {isCaseClosed || targetCase.estado === 'Cerrado'
                  ? 'CASO FINALIZADO Y CERTIFICADO'
                  : 'MARCAR COMO RESUELTO Y CERRAR CASO'}
              </span>
            </button>

            {/* Panel de Éxito Desplegable */}
            {(isCaseClosed || targetCase.estado === 'Cerrado') && (
              <div className="flex flex-col gap-3 mt-3 p-4 bg-[#1e293b] border border-[#10b981]/40 rounded-2xl shadow-2xl animate-in fade-in duration-300">
                <div className="flex items-center gap-3 text-[#10b981]">
                  <div className="w-9 h-9 rounded-xl bg-[#10b981]/20 text-[#10b981] flex items-center justify-center shrink-0 border border-[#10b981]/30">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-['Chivo'] font-bold text-xs text-[#6ffbbe] leading-tight uppercase">
                      CASO #{targetCase.id} CERRADO EXITOSAMENTE
                    </span>
                    <span className="font-mono text-[9px] text-[#94a3b8] uppercase">
                      Acta SSOMA N° 2024-{targetCase.id} generada y lista para PDF
                    </span>
                  </div>
                </div>

                <div className="p-2.5 bg-[#0b1326] rounded-xl border border-[#334155] flex items-center justify-between text-[#dae2fd]">
                  <div className="flex flex-col">
                    <span className="font-mono text-[8px] text-[#94a3b8] uppercase">
                      FIRMA DIGITAL SSOMA
                    </span>
                    <span className="font-mono text-[10px] font-bold text-[#dae2fd]">
                      ING. CARLOS MENDOZA (CIP 184920)
                    </span>
                  </div>
                  <span className="font-mono text-[9px] bg-[#10b981]/20 text-[#10b981] px-2 py-0.5 rounded font-bold border border-[#10b981]/30">
                    AUDITADO OK
                  </span>
                </div>

                {/* PDF and Dashboard Actions */}
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <button
                    type="button"
                    onClick={() => setIsPdfModalOpen(true)}
                    className="w-full h-11 px-3 rounded-xl bg-[#f59e0b] hover:bg-[#d97706] text-[#2a1700] font-['Chivo'] font-black text-[11px] uppercase flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95"
                  >
                    <Download className="w-4 h-4" />
                    EXPORTAR PDF
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('dashboard')}
                    className="w-full h-11 px-3 rounded-xl bg-[#131b2e] hover:bg-[#1a2337] text-[#dae2fd] font-mono text-[10px] font-bold flex items-center justify-center gap-1.5 transition-all border border-[#334155]"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5 text-[#10b981]" />
                    VER DASHBOARD
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* PDF Export Modal */}
      <PdfExportModal
        isOpen={isPdfModalOpen}
        caseItem={targetCase}
        onClose={() => setIsPdfModalOpen(false)}
      />
    </div>
  );
};
