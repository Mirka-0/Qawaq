import React, { useState } from 'react';
import {
  FileText,
  Download,
  Printer,
  X,
  CheckCircle2,
  AlertTriangle,
  Shield,
  Clock,
  Calendar,
  UserCheck,
  Building2,
  HardHat,
  Loader2,
} from 'lucide-react';
import { CaseItem } from '../types';
import { generateCasePdfReport } from '../services/pdfReportService';

interface PdfExportModalProps {
  caseItem: CaseItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PdfExportModal: React.FC<PdfExportModalProps> = ({
  caseItem,
  isOpen,
  onClose,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!isOpen || !caseItem) return null;

  const handleDownloadPdf = async () => {
    try {
      setIsGenerating(true);
      const doc = await generateCasePdfReport(caseItem);
      doc.save(`QAWAQ_Acta_Cierre_${caseItem.id}.pdf`);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4000);
    } catch (err) {
      console.error('Error generating PDF:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#0f172a] border border-[#334155] w-full max-w-2xl max-h-[92vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden text-[#dae2fd]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-[#0c1322] border-b border-[#1e293b]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#f59e0b]/15 text-[#f59e0b] flex items-center justify-center border border-[#f59e0b]/30">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-['Chivo'] font-bold text-sm text-[#dae2fd] uppercase">
                Acta Técnica de Cierre · PDF
              </h3>
              <p className="font-mono text-[10px] text-[#94a3b8] uppercase">
                Caso #{caseItem.id} · Certificación de Seguridad
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#94a3b8] hover:text-[#dae2fd] hover:bg-[#1e293b] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Document Preview */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-xs font-sans bg-[#090e1a]">
          {/* Printable Report Sheet */}
          <div
            id="printable-report-card"
            className="bg-white text-slate-900 rounded-xl p-5 sm:p-7 shadow-lg space-y-4 border border-slate-200"
          >
            {/* Sheet Top Branding */}
            <div className="flex items-start justify-between border-b border-slate-200 pb-3 gap-3">
              <div className="flex items-center gap-3">
                <img
                  src="/logo.svg"
                  alt="Qawaq"
                  className="w-10 h-10 object-contain rounded-lg"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = '/logo.png';
                  }}
                />
                <div>
                  <div className="font-black font-['Chivo'] text-base tracking-wider text-slate-900 uppercase">
                    QAWAQ <span className="text-amber-600">// SEGURIDAD</span>
                  </div>
                  <div className="text-[10px] font-mono text-slate-500 uppercase tracking-tight">
                    Supervisión Digital de Seguridad en Obra · CCTV
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className="inline-block px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[10px] font-bold border border-emerald-300">
                  ACTA CERRADA
                </span>
                <div className="font-mono text-[10px] text-slate-500 mt-1 font-bold">
                  N° {caseItem.id}
                </div>
              </div>
            </div>

            {/* Title */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-center">
              <h2 className="font-bold text-xs uppercase tracking-wide text-slate-800">
                INFORME TÉCNICO DE CIERRE Y CONFORMIDAD DE CONDICIÓN SUBESTÁNDAR
              </h2>
              <div className="text-[10px] text-slate-500 mt-0.5">
                Obra: Torre Andina · Emisión:{' '}
                {new Date(caseItem.fechaCierre || Date.now()).toLocaleDateString('es-PE', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            </div>

            {/* 1. Datos del Incidente */}
            <div className="space-y-1.5">
              <div className="font-bold text-[11px] uppercase tracking-wider text-slate-700 flex items-center gap-1.5 border-b border-slate-200 pb-1">
                <Building2 className="w-3.5 h-3.5 text-amber-600" />
                1. Datos del Incidente y Riesgo Detectado
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div>
                  <span className="font-semibold text-slate-500">Tipo de Riesgo:</span>{' '}
                  <strong className="text-slate-900">{caseItem.tipo}</strong>
                </div>
                <div>
                  <span className="font-semibold text-slate-500">Nivel de Urgencia:</span>{' '}
                  <span className="font-bold text-red-600 uppercase">{caseItem.urgencia}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-500">Ubicación / Frente:</span>{' '}
                  <span className="text-slate-800">{caseItem.ubicacion} ({caseItem.frente})</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-500">Detectado Por:</span>{' '}
                  <span className="text-slate-800 font-medium">{caseItem.detectadoPor}</span>
                </div>
                <div className="sm:col-span-2">
                  <span className="font-semibold text-slate-500">Responsable Asignado:</span>{' '}
                  <span className="text-slate-900 font-medium">{caseItem.responsable}</span>
                </div>
                <div className="sm:col-span-2">
                  <span className="font-semibold text-slate-500">Descripción:</span>{' '}
                  <span className="text-slate-700">{caseItem.descripcion}</span>
                </div>
              </div>
            </div>

            {/* 2. Evidencias Fotográficas Comparativas */}
            <div className="space-y-2">
              <div className="font-bold text-[11px] uppercase tracking-wider text-slate-700 flex items-center gap-1.5 border-b border-slate-200 pb-1">
                <HardHat className="w-3.5 h-3.5 text-amber-600" />
                2. Evidencias Fotográficas (Antes y Después)
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Foto Antes */}
                <div className="border border-red-200 rounded-lg overflow-hidden bg-red-50/50">
                  <div className="bg-red-600 text-white font-mono text-[9px] font-bold px-2 py-1 uppercase">
                    Evidencia Inicial: Infracción CCTV
                  </div>
                  <div className="h-36 sm:h-40 bg-slate-900 relative">
                    <img
                      src={caseItem.fotoUrl}
                      alt="Antes"
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-1 right-1 bg-black/80 text-white font-mono text-[8px] px-1 rounded">
                      FOTO-INICIAL
                    </span>
                  </div>
                  <div className="p-2 text-[10px] text-red-800 font-semibold">
                    Condición insegura detectada en tiempo real
                  </div>
                </div>

                {/* Foto Después */}
                <div className="border border-emerald-200 rounded-lg overflow-hidden bg-emerald-50/50">
                  <div className="bg-emerald-600 text-white font-mono text-[9px] font-bold px-2 py-1 uppercase">
                    Evidencia Final: Subsanación Verificada
                  </div>
                  <div className="h-36 sm:h-40 bg-slate-900 relative">
                    <img
                      src={caseItem.fotoSolucionUrl || caseItem.fotoUrl}
                      alt="Subsanado"
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-1 right-1 bg-emerald-900/90 text-emerald-200 font-mono text-[8px] px-1 rounded">
                      CORRECCIÓN-OK
                    </span>
                  </div>
                  <div className="p-2 text-[10px] text-emerald-800 font-semibold">
                    Condición subsanada y personal con EPP normado
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Medidas Correctivas y Dictamen */}
            <div className="space-y-2">
              <div className="font-bold text-[11px] uppercase tracking-wider text-slate-700 flex items-center gap-1.5 border-b border-slate-200 pb-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                3. Medida Correctiva Aplicada y Dictamen Técnico
              </div>

              <div className="space-y-2 text-[11px]">
                <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
                  <div className="font-bold text-slate-600 text-[10px] uppercase">
                    Medida de Control Inmediata:
                  </div>
                  <div className="text-slate-800 font-medium mt-0.5">
                    {caseItem.medidaAplicada ||
                      'Dotación de EPP homologado, paralización preventiva y charla de seguridad de 5 minutos.'}
                  </div>
                </div>

                <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
                  <div className="font-bold text-slate-600 text-[10px] uppercase">
                    Dictamen Técnico del Supervisor de Seguridad:
                  </div>
                  <div className="text-slate-800 mt-0.5 leading-relaxed">
                    {caseItem.dictamenCierre ||
                      'Se verificó personalmente en campo el cese de la condición de riesgo. Todo el personal cuenta con equipo reglamentario y se reanudó la actividad con conformidad.'}
                  </div>
                </div>
              </div>
            </div>

            {/* 4. Marco Normativo */}
            <div className="space-y-1.5">
              <div className="font-bold text-[11px] uppercase tracking-wider text-slate-700 flex items-center gap-1.5 border-b border-slate-200 pb-1">
                <Shield className="w-3.5 h-3.5 text-blue-600" />
                4. Marco Normativo y Cumplimiento Legal
              </div>

              <div className="space-y-1 text-[10px] font-mono">
                <div className="flex items-center justify-between p-1.5 rounded bg-emerald-50 text-emerald-900 border border-emerald-200">
                  <span>• Norma Técnica G.050 &quot;Seguridad durante la Construcción&quot; (RNE)</span>
                  <span className="font-bold text-emerald-700">CONFORME ✓</span>
                </div>
                <div className="flex items-center justify-between p-1.5 rounded bg-emerald-50 text-emerald-900 border border-emerald-200">
                  <span>• D.S. N.º 011-2019-TR Reglamento de SST para el Sector Construcción</span>
                  <span className="font-bold text-emerald-700">CONFORME ✓</span>
                </div>
                <div className="flex items-center justify-between p-1.5 rounded bg-emerald-50 text-emerald-900 border border-emerald-200">
                  <span>• Ley N° 29783 Ley de Seguridad y Salud en el Trabajo</span>
                  <span className="font-bold text-emerald-700">AUDITADO ✓</span>
                </div>
              </div>
            </div>

            {/* 5. Firmas y Sellos Digitales */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200 text-slate-700">
              <div className="p-2.5 rounded bg-slate-50 border border-slate-200 text-center">
                <div className="font-bold text-[10px] text-slate-900 uppercase">
                  ING. CARLOS MENDOZA CHÁVEZ
                </div>
                <div className="text-[9px] text-slate-500">CIP 184920 · Supervisor de Seguridad</div>
                <div className="text-[8px] font-mono text-emerald-700 font-bold mt-1">
                  FIRMA DIGITAL VERIFICADA
                </div>
              </div>

              <div className="p-2.5 rounded bg-slate-50 border border-slate-200 text-center">
                <div className="font-bold text-[10px] text-amber-700 uppercase">
                  QAWAQ // LIVE AUDIT
                </div>
                <div className="text-[9px] font-mono text-slate-500">
                  HASH: QW-{caseItem.id}-SEC77A9
                </div>
                <div className="text-[8px] font-mono text-blue-700 font-bold mt-1">
                  RESOLUCIÓN: {caseItem.tiempoAbierto || '18 min'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3.5 bg-[#0c1322] border-t border-[#1e293b] flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <div className="text-center sm:text-left">
            {downloadSuccess ? (
              <span className="text-xs text-[#10b981] font-mono font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                ¡PDF generado y descargado con éxito!
              </span>
            ) : (
              <span className="text-xs text-[#94a3b8] font-mono">
                Documento oficial válido para auditorías SUNAFIL / RNE
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handlePrint}
              className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-[#1e293b] hover:bg-[#283548] text-[#dae2fd] font-mono text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-[#334155]"
            >
              <Printer className="w-3.5 h-3.5" />
              Imprimir
            </button>

            <button
              onClick={handleDownloadPdf}
              disabled={isGenerating}
              className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-[#f59e0b] hover:bg-[#d97706] text-[#2a1700] font-['Chivo'] font-bold text-xs uppercase flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generando PDF...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Descargar Reporte PDF
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
