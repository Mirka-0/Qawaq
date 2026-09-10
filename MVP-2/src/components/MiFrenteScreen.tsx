import React, { useState } from 'react';
import {
  Layers,
  CheckCircle2,
  Clock,
  AlertTriangle,
  HardHat,
  Users,
  ChevronRight,
  TrendingUp,
  ShieldCheck,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { useCases } from '../context/CaseContext';
import { useRole } from '../context/RoleContext';
import { FRENTES_OBRA, FRENTE_IMAGES, ASSETS } from '../constants';
import { formatSlaCountdown, useLiveTimer } from '../utils/sla';
import { CaseDetailModal } from './CaseDetailModal';
import { CaseItem } from '../types';

export const MiFrenteScreen: React.FC = () => {
  const { cases } = useCases();
  const { activeSupervisor } = useRole();
  const now = useLiveTimer(3000);

  // Default to supervisor's assigned front, with option to switch
  const [selectedFrente, setSelectedFrente] = useState<string>(
    activeSupervisor.frenteAsignado || FRENTES_OBRA[1]
  );
  const [selectedCase, setSelectedCase] = useState<CaseItem | null>(null);

  // Filter cases of this frente
  const frenteCases = cases.filter((c) => c.frente === selectedFrente);
  const total = frenteCases.length;
  const closed = frenteCases.filter((c) => c.estado === 'Cerrado').length;
  const active = total - closed;
  const inValidation = frenteCases.filter(
    (c) => c.estado === 'Pendiente de Validación SSOMA'
  ).length;

  // Overdue count
  const overdueCount = frenteCases.filter((c) => {
    if (c.estado === 'Cerrado') return false;
    return formatSlaCountdown(c.plazoObjetivo, c.estado, now).isVencido;
  }).length;

  // SLA Compliance rate
  const complianceRate =
    total > 0
      ? Math.max(0, Math.round(((total - overdueCount) / total) * 100))
      : 100;

  // Health status
  const healthStatus =
    overdueCount === 0 && complianceRate >= 80
      ? { label: 'SALUDABLE · CUMPLE PROTOCOLO', color: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30' }
      : overdueCount > 1
      ? { label: 'ALERTA · CASOS VENCIDOS', color: 'text-red-400 bg-red-500/15 border-red-500/30' }
      : { label: 'PRECAUCIÓN · ATENCIÓN PRIORITARIA', color: 'text-amber-400 bg-amber-500/15 border-amber-500/30' };

  return (
    <div className="flex flex-col w-full px-3 sm:px-6 lg:px-8 pt-3 pb-24 gap-5 max-w-5xl mx-auto animate-fade-in">
      {/* Header Banner with Front Photo */}
      <div id="frente-live-cctv" className="relative rounded-2xl overflow-hidden border border-[#222a3d] shadow-xl bg-[#0c1322]">
        <div className="h-32 sm:h-40 w-full relative bg-black">
          <img
            src={FRENTE_IMAGES[selectedFrente] || ASSETS.frenteLosa}
            alt={selectedFrente}
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0c1322] via-[#0c1322]/60 to-black/40" />
          <div className="absolute top-3 left-3 flex items-center gap-2">
            <span className="font-mono text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 backdrop-blur-sm">
              SALUD OPERATIVA · MI FRENTE
            </span>
            <span className="font-mono text-[10px] text-white/80 backdrop-blur-sm px-2 py-0.5 rounded bg-black/50">
              Supervisión en Campo
            </span>
          </div>

          <div className="absolute bottom-3 left-4 right-4 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <h1 className="font-['Chivo'] font-black text-xl sm:text-2xl text-white uppercase tracking-tight drop-shadow-md">
                {selectedFrente}
              </h1>
              <p className="text-xs text-[#cbd5e1] mt-0.5">
                Diagnóstico de seguridad para la reunión de 5 minutos, cambio de guardia y relevo de cuadrillas.
              </p>
            </div>

            {/* Frente Selector */}
            <div className="flex items-center gap-2 bg-[#131b2e]/90 backdrop-blur-md p-2 rounded-xl border border-[#334155] shrink-0 self-start sm:self-auto">
              <Layers className="w-4 h-4 text-[#f59e0b] shrink-0" />
              <div className="flex flex-col">
                <span className="font-mono text-[8px] uppercase text-[#94a3b8]">Cambiar Frente:</span>
                <select
                  value={selectedFrente}
                  onChange={(e) => setSelectedFrente(e.target.value)}
                  className="bg-transparent text-xs font-mono font-bold text-[#dae2fd] outline-none cursor-pointer"
                >
                  {FRENTES_OBRA.map((f) => (
                    <option key={f} value={f} className="bg-[#0c1322] text-[#dae2fd]">
                      {f}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Health Status & SLA Bar */}
      <div id="frente-safety-score" className="bg-[#131b2e] border border-[#222a3d] p-5 rounded-2xl shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#222a3d]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#f59e0b]/15 text-[#f59e0b] flex items-center justify-center border border-[#f59e0b]/30">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="font-mono text-[10px] uppercase text-[#94a3b8]">Estado General del Frente</div>
              <div className="font-['Chivo'] font-black text-lg text-[#dae2fd]">
                Índice de Seguridad: {complianceRate}%
              </div>
            </div>
          </div>

          <div
            className={`px-3 py-1.5 rounded-xl border font-mono text-xs font-bold uppercase tracking-wider self-start sm:self-auto ${healthStatus.color}`}
          >
            {healthStatus.label}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-mono text-[#94a3b8]">
            <span>Cumplimiento de Plazos Legales (SLA)</span>
            <strong className="text-[#dae2fd]">{complianceRate}% dentro del plazo</strong>
          </div>
          <div className="w-full h-3 bg-[#0b1326] rounded-full overflow-hidden border border-[#222a3d]">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                complianceRate >= 80
                  ? 'bg-gradient-to-r from-amber-500 to-emerald-500'
                  : complianceRate >= 50
                  ? 'bg-gradient-to-r from-red-500 to-amber-500'
                  : 'bg-red-500'
              }`}
              style={{ width: `${complianceRate}%` }}
            />
          </div>
        </div>

        {/* 4 Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="bg-[#0b1326] p-3 rounded-xl border border-[#1e293b]">
            <div className="font-mono text-[9px] uppercase text-[#94a3b8]">Total Casos</div>
            <div className="font-mono text-2xl font-black text-[#dae2fd] mt-1">{total}</div>
            <div className="font-mono text-[9px] text-[#64748b]">En este frente</div>
          </div>

          <div className="bg-[#0b1326] p-3 rounded-xl border border-[#1e293b]">
            <div className="font-mono text-[9px] uppercase text-amber-400">Activos en Obra</div>
            <div className="font-mono text-2xl font-black text-amber-400 mt-1">{active}</div>
            <div className="font-mono text-[9px] text-[#64748b]">Por subsanar</div>
          </div>

          <div className="bg-[#0b1326] p-3 rounded-xl border border-[#1e293b]">
            <div className="font-mono text-[9px] uppercase text-emerald-400">Casos Certificados</div>
            <div className="font-mono text-2xl font-black text-emerald-400 mt-1">{closed}</div>
            <div className="font-mono text-[9px] text-[#64748b]">Validados por SSOMA</div>
          </div>

          <div className="bg-[#0b1326] p-3 rounded-xl border border-[#1e293b]">
            <div className="font-mono text-[9px] uppercase text-red-400">Casos Vencidos</div>
            <div
              className={`font-mono text-2xl font-black mt-1 ${
                overdueCount > 0 ? 'text-red-400' : 'text-[#10b981]'
              }`}
            >
              {overdueCount}
            </div>
            <div className="font-mono text-[9px] text-[#64748b]">Fuera de tiempo</div>
          </div>
        </div>
      </div>

      {/* Briefing: Reunión de 5 Minutos (Pre-Turno) */}
      <div className="bg-[#15120a] border border-amber-500/30 p-4 sm:p-5 rounded-2xl shadow-xl space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <h3 className="font-['Chivo'] font-bold text-sm sm:text-base text-amber-300 uppercase tracking-wide">
            Guía Rápida para Charla de 5 Minutos / Relevo de Turno
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-[#cbd5e1]">
          <div className="bg-[#0c1322] p-3 rounded-xl border border-amber-500/20 space-y-1">
            <div className="font-mono text-[10px] text-amber-400 font-bold uppercase">
              1. Puntos Críticos a Revisar Hoy:
            </div>
            <ul className="list-disc list-inside space-y-1 text-[#94a3b8]">
              <li>Uso estricto de doble línea de vida en losas y bordes de piso 14.</li>
              <li>Inspección previa de tarjetas de andamio (verde operativo).</li>
              <li>Verificar que no haya personal bajo cargas suspendidas de grúa.</li>
            </ul>
          </div>

          <div className="bg-[#0c1322] p-3 rounded-xl border border-amber-500/20 space-y-1">
            <div className="font-mono text-[10px] text-emerald-400 font-bold uppercase">
              2. Consigna de Seguridad SSOMA:
            </div>
            <p className="italic text-[#94a3b8] leading-relaxed">
              &quot;Ningún trabajo en altura inicia sin AST firmado ni verificación de EPP por el capataz. Toda condición subestándar debe reportarse antes de las 10:00 AM.&quot;
            </p>
          </div>
        </div>
      </div>

      {/* Quick Cases List for this Frente */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-mono text-[#94a3b8] px-1">
          <span>Casos Registrados en {selectedFrente} ({frenteCases.length})</span>
          <span>Haz click para ver detalles y auditoría</span>
        </div>

        {frenteCases.length === 0 ? (
          <div className="bg-[#131b2e] border border-[#222a3d] rounded-2xl p-8 text-center text-[#94a3b8] font-mono">
            No se registran casos de riesgo en este frente operativo.
          </div>
        ) : (
          frenteCases.map((item) => {
            const sla = formatSlaCountdown(item.plazoObjetivo, item.estado, now);

            return (
              <div
                key={item.id}
                onClick={() => setSelectedCase(item)}
                className="bg-[#131b2e] hover:bg-[#18233a] border border-[#222a3d] hover:border-[#334155] rounded-2xl p-3.5 transition-all shadow-md cursor-pointer flex items-center justify-between gap-3 group"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-black shrink-0 border border-[#222a3d]">
                    <img src={item.fotoUrl} alt={item.tipo} className="w-full h-full object-cover" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-mono text-[10px] font-bold text-[#ffb95f]">
                        #{item.id}
                      </span>
                      <span className="font-mono text-[9px] px-1.5 py-0.2 rounded bg-[#1e293b] text-[#94a3b8]">
                        {item.estado}
                      </span>
                    </div>

                    <h4 className="font-['Chivo'] font-bold text-xs sm:text-sm text-[#dae2fd] truncate mt-0.5">
                      {item.tipo}
                    </h4>

                    <div className="text-[10px] font-mono text-[#94a3b8] truncate">
                      {item.ubicacion} · Resp: {item.asignadoA?.nombre || item.responsable}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`font-mono text-[11px] px-2 py-0.5 rounded border font-bold ${
                      sla.isVencido
                        ? 'bg-red-500/20 text-red-300 border-red-500/40'
                        : item.estado === 'Cerrado'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-[#0b1326] text-[#38bdf8] border-[#1e293b]'
                    }`}
                  >
                    {sla.text}
                  </span>

                  <ChevronRight className="w-4 h-4 text-[#94a3b8] group-hover:text-[#f59e0b] transition-colors" />
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Case Detail Modal */}
      <CaseDetailModal
        caseItem={selectedCase}
        isOpen={Boolean(selectedCase)}
        onClose={() => setSelectedCase(null)}
      />
    </div>
  );
};
