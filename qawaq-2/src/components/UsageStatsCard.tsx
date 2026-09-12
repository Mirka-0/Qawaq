import React, { useState } from 'react';
import {
  Activity,
  AlertTriangle,
  FileCheck2,
  FileText,
  Clock,
  RotateCcw,
  Sparkles,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
  Sun,
  CheckCircle2,
} from 'lucide-react';
import { useUsageStats } from '../hooks/useUsageStats';
import { useCases } from '../context/CaseContext';

export const UsageStatsCard: React.FC = () => {
  const { stats, logInteraction, resetStats } = useUsageStats();
  const { cases } = useCases();
  const [showEvents, setShowEvents] = useState<boolean>(false);

  const openCasesCount = cases.filter((c) => c.estado === 'Abierto').length;
  const totalCasosAtendidos = stats.casosCerrados + openCasesCount;
  const porcentajeResolucion =
    totalCasosAtendidos > 0
      ? Math.min(100, Math.round((stats.casosCerrados / totalCasosAtendidos) * 100))
      : 100;

  const handleSimulateLog = () => {
    logInteraction('otro', 'Inspección preventiva de rutina registrada por Supervisor de Seguridad');
  };

  const formatRelativeTime = (timestamp: number) => {
    const diffMin = Math.max(1, Math.round((Date.now() - timestamp) / 60000));
    if (diffMin < 60) return `Hace ${diffMin} min`;
    const diffHours = Math.round(diffMin / 60);
    if (diffHours < 24) return `Hace ${diffHours} h`;
    return new Date(timestamp).toLocaleDateString('es-PE', { day: '2-digit', month: 'short' });
  };

  return (
    <section className="bg-[#131b2e] border border-[#222a3d] rounded-2xl p-4 sm:p-5 shadow-lg transition-all duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-[#222a3d]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#f59e0b]/15 text-[#f59e0b] flex items-center justify-center border border-[#f59e0b]/30">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-['Chivo'] font-bold text-sm sm:text-base text-[#dae2fd] tracking-wide uppercase">
                Métricas de Uso y Rendimiento Operativo
              </h2>
              <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-[#10b981]/15 text-[#34d399] font-bold border border-[#10b981]/30">
                LOCAL STORAGE
              </span>
            </div>
            <p className="font-mono text-[10px] text-[#94a3b8]">
              Registro automático de interacciones operativas del supervisor en obra
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={handleSimulateLog}
            title="Registrar inspección preventiva de campo"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#1e293b] hover:bg-[#334155] text-[#dae2fd] font-mono text-[10px] font-bold border border-[#334155] transition-all active:scale-95"
          >
            <Sparkles className="w-3 h-3 text-[#f59e0b]" />
            <span>+ Log Interacción</span>
          </button>
          <button
            onClick={resetStats}
            title="Reiniciar métricas de prueba a valores iniciales"
            className="p-1.5 rounded-lg text-[#94a3b8] hover:text-[#f59e0b] hover:bg-[#1e293b] border border-transparent hover:border-[#334155] transition-all active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Grid of Key Performance Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
        {/* Metric 1: Alertas Cámaras */}
        <div className="bg-[#0b1326] p-3 rounded-xl border border-[#1e293b] flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#94a3b8]">
            <span className="font-mono text-[9px] uppercase tracking-wider font-semibold">Alertas Cámara</span>
            <AlertTriangle className="w-3.5 h-3.5 text-[#f59e0b]" />
          </div>
          <div className="mt-2">
            <span className="font-mono text-2xl font-black text-[#f59e0b]">
              {stats.alertasAtendidas}
            </span>
            <span className="block font-mono text-[9px] text-[#94a3b8] mt-0.5">
              CCTV procesadas
            </span>
          </div>
        </div>

        {/* Metric 2: Reportes Manuales */}
        <div className="bg-[#0b1326] p-3 rounded-xl border border-[#1e293b] flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#94a3b8]">
            <span className="font-mono text-[9px] uppercase tracking-wider font-semibold">Reportes Emitidos</span>
            <FileText className="w-3.5 h-3.5 text-[#38bdf8]" />
          </div>
          <div className="mt-2">
            <span className="font-mono text-2xl font-black text-[#38bdf8]">
              {stats.reportesGenerados}
            </span>
            <span className="block font-mono text-[9px] text-[#94a3b8] mt-0.5">
              Frecuencia en obra
            </span>
          </div>
        </div>

        {/* Metric 3: Casos Subsanados */}
        <div className="bg-[#0b1326] p-3 rounded-xl border border-[#1e293b] flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#94a3b8]">
            <span className="font-mono text-[9px] uppercase tracking-wider font-semibold">Casos Cerrados</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-[#10b981]" />
          </div>
          <div className="mt-2">
            <span className="font-mono text-2xl font-black text-[#10b981]">
              {stats.casosCerrados}
            </span>
            <span className="block font-mono text-[9px] text-[#10b981] font-bold mt-0.5">
              {porcentajeResolucion}% resolución
            </span>
          </div>
        </div>

        {/* Metric 4: Actas PDF */}
        <div className="bg-[#0b1326] p-3 rounded-xl border border-[#1e293b] flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#94a3b8]">
            <span className="font-mono text-[9px] uppercase tracking-wider font-semibold">Actas PDF</span>
            <FileCheck2 className="w-3.5 h-3.5 text-[#a855f7]" />
          </div>
          <div className="mt-2">
            <span className="font-mono text-2xl font-black text-[#a855f7]">
              {stats.reportesPdfDescargados}
            </span>
            <span className="block font-mono text-[9px] text-[#94a3b8] mt-0.5">
              Norma G.050 / DS-011
            </span>
          </div>
        </div>
      </div>

      {/* Operational Velocity & Last Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-[#060e20] p-3 rounded-xl border border-[#1e293b] text-xs">
        <div className="flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-[#94a3b8]" />
          <span className="font-mono text-[10px] text-[#94a3b8]">
            Última interacción registrada:
          </span>
          <span className="font-mono text-[10px] font-bold text-[#dae2fd]">
            {formatRelativeTime(stats.ultimaActividad)}
          </span>
        </div>

        <button
          onClick={() => setShowEvents(!showEvents)}
          className="flex items-center gap-1 font-mono text-[10px] text-[#f59e0b] hover:text-[#fbbf24] font-bold transition-colors self-start sm:self-auto"
        >
          <span>{showEvents ? 'Ocultar bitácora' : 'Ver bitácora de eventos'}</span>
          {showEvents ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
      </div>

      {/* Collapsible Action Event Log */}
      {showEvents && (
        <div className="mt-3 pt-3 border-t border-[#1e293b] flex flex-col gap-1.5 animate-fadeIn">
          <span className="font-mono text-[9px] text-[#94a3b8] uppercase tracking-wider font-semibold">
            Últimos eventos guardados en navegador (localStorage):
          </span>
          <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1 no-scrollbar">
            {stats.eventosRecientes.map((evt) => (
              <div
                key={evt.id}
                className="flex items-center justify-between gap-2 bg-[#0b1326] px-2.5 py-1.5 rounded-lg border border-[#1e293b] text-[11px]"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                      evt.tipo === 'alerta'
                        ? 'bg-[#f59e0b]'
                        : evt.tipo === 'reporte'
                        ? 'bg-[#38bdf8]'
                        : evt.tipo === 'cierre'
                        ? 'bg-[#10b981]'
                        : evt.tipo === 'pdf'
                        ? 'bg-[#a855f7]'
                        : 'bg-[#94a3b8]'
                    }`}
                  />
                  <span className="font-sans text-[#dae2fd] truncate">{evt.descripcion}</span>
                </div>
                <span className="font-mono text-[9px] text-[#94a3b8] shrink-0">
                  {formatRelativeTime(evt.timestamp)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};
