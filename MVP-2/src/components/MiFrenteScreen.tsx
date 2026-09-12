import React, { useState } from 'react';
import {
  Layers,
  CheckCircle2,
  AlertTriangle,
  Clock,
  TrendingUp,
  ExternalLink,
  ShieldCheck,
  UserCheck,
  Building,
} from 'lucide-react';
import { useCases } from '../context/CaseContext';
import { useRole } from '../context/RoleContext';
import { formatSlaCountdown, useLiveTimer } from '../utils/sla';
import { CaseDetailModal } from './CaseDetailModal';

export const MiFrenteScreen: React.FC = () => {
  const { cases, selectedCaseForDetailId, setSelectedCaseForDetailId } = useCases();
  const { activeSupervisor, setActiveSupervisor, availableSupervisors } = useRole();
  const now = useLiveTimer(5000);

  // We can filter by the active supervisor's front, or allow choosing a specific front
  const [selectedFrente, setSelectedFrente] = useState<string>(activeSupervisor.frenteAsignado);

  // Filter cases belonging to this frente
  const frenteCases = cases.filter(
    (c) =>
      c.frente.toLowerCase().includes(selectedFrente.toLowerCase()) ||
      selectedFrente.toLowerCase().includes(c.frente.toLowerCase()) ||
      c.ubicacion.toLowerCase().includes(selectedFrente.toLowerCase())
  );

  // If no match found by string, fallback to cases assigned to or matching Frente B
  const displayCases =
    frenteCases.length > 0
      ? frenteCases
      : cases.filter((c) => c.frente === 'Frente B' || c.frente.includes('Frente B'));

  // Metrics computation
  const totalCases = displayCases.length;
  const closedCases = displayCases.filter((c) => c.estado === 'Cerrado').length;
  const openCases = totalCases - closedCases;

  // % Compliance SLA
  // A case complies if it closed within plazoObjetivo, or if it is currently not overdue
  const compliantCases = displayCases.filter((c) => {
    if (c.estado === 'Cerrado') {
      return (c.fechaCierre || 0) <= c.plazoObjetivo;
    }
    return now <= c.plazoObjetivo;
  }).length;

  const compliancePercent = totalCases > 0 ? Math.round((compliantCases / totalCases) * 100) : 100;
  const overdueCount = displayCases.filter((c) => c.estado !== 'Cerrado' && now > c.plazoObjetivo).length;

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-5 animate-fade-in">
      {/* Frente Header Banner */}
      <div className="bg-[#0f172a] p-4 sm:p-5 rounded-2xl border border-[#222a3d] shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#38bdf8]/15 border border-[#38bdf8]/30 flex items-center justify-center shrink-0">
              <Layers className="w-6 h-6 text-[#38bdf8]" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-['Chivo'] font-black text-lg sm:text-xl text-[#dae2fd] uppercase tracking-wide">
                  Panel de Control: {selectedFrente}
                </h1>
                <span className="font-mono text-[9px] px-2 py-0.5 rounded bg-[#38bdf8]/20 text-[#38bdf8] font-bold border border-[#38bdf8]/40">
                  MI FRENTE
                </span>
              </div>
              <p className="text-xs text-[#94a3b8] font-mono mt-0.5">
                Supervisor Asignado: <strong className="text-[#dae2fd]">{activeSupervisor.nombre}</strong> · {activeSupervisor.rol}
              </p>
            </div>
          </div>

          {/* Frente Switcher Filter */}
          <div className="flex items-center gap-2 bg-[#070d18] p-1.5 rounded-xl border border-[#1e293b]">
            <Building className="w-4 h-4 text-[#94a3b8] ml-2 shrink-0" />
            <select
              value={selectedFrente}
              onChange={(e) => setSelectedFrente(e.target.value)}
              className="bg-transparent text-xs font-mono text-[#dae2fd] font-bold focus:outline-none cursor-pointer pr-2"
            >
              <option value="Frente B (Losa Piso 14)" className="bg-[#0c1322]">Frente B (Losa P14)</option>
              <option value="Frente Sur (Excavación)" className="bg-[#0c1322]">Frente Sur (Excavación)</option>
              <option value="Frente Norte" className="bg-[#0c1322]">Frente Norte (Estructuras)</option>
            </select>
          </div>
        </div>

        {/* 4 KPI Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 pt-3 border-t border-[#1e293b]">
          <div className="bg-[#070d18] p-3 rounded-xl border border-[#1e293b]">
            <div className="text-[10px] font-mono uppercase text-[#94a3b8]">Total Incidentes</div>
            <div className="font-['Chivo'] font-black text-xl text-[#dae2fd] mt-0.5">{totalCases}</div>
            <div className="text-[10px] font-mono text-[#64748b] mt-1">Registrados en el frente</div>
          </div>

          <div className="bg-[#070d18] p-3 rounded-xl border border-[#1e293b]">
            <div className="text-[10px] font-mono uppercase text-[#38bdf8]">Abiertos / En Campo</div>
            <div className="font-['Chivo'] font-black text-xl text-[#38bdf8] mt-0.5">{openCases}</div>
            <div className="text-[10px] font-mono text-[#64748b] mt-1">
              {overdueCount > 0 ? (
                <span className="text-red-400 font-bold">{overdueCount} vencidos</span>
              ) : (
                '0 vencidos'
              )}
            </div>
          </div>

          <div className="bg-[#070d18] p-3 rounded-xl border border-[#1e293b]">
            <div className="text-[10px] font-mono uppercase text-emerald-400">Subsanados / Cerrados</div>
            <div className="font-['Chivo'] font-black text-xl text-emerald-400 mt-0.5">{closedCases}</div>
            <div className="text-[10px] font-mono text-[#64748b] mt-1">Conformes por SSOMA</div>
          </div>

          <div className="bg-[#070d18] p-3 rounded-xl border border-[#1e293b]">
            <div className="text-[10px] font-mono uppercase text-[#f59e0b]">Cumplimiento SLA</div>
            <div className="font-['Chivo'] font-black text-xl text-[#f59e0b] mt-0.5">
              {compliancePercent}%
            </div>
            <div className="w-full bg-[#1e293b] rounded-full h-1.5 mt-2 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  compliancePercent >= 80 ? 'bg-emerald-400' : 'bg-amber-400'
                }`}
                style={{ width: `${compliancePercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Cases in this Frente List */}
      <div className="bg-[#0c1322] border border-[#222a3d] rounded-2xl p-4 sm:p-5 shadow-md">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-['Chivo'] font-black text-base sm:text-lg text-[#dae2fd] uppercase tracking-wide">
              Casos Activos e Históricos en {selectedFrente}
            </h2>
            <p className="text-xs text-[#94a3b8] font-mono">
              Monitoreo del frente en tiempo real con auditoría de SLA
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {displayCases.map((item) => {
            const sla = formatSlaCountdown(item.plazoObjetivo, item.estado, now);
            const isClosed = item.estado === 'Cerrado';

            return (
              <div
                key={item.id}
                onClick={() => setSelectedCaseForDetailId(item.id)}
                className={`p-3.5 sm:p-4 rounded-xl border transition-all cursor-pointer hover:bg-[#131d33] ${
                  isClosed
                    ? 'border-[#1e293b] bg-[#070d18]/60 opacity-80'
                    : sla.isVencido
                    ? 'border-red-500/40 bg-[#140a0f]'
                    : 'border-[#222a3d] bg-[#0b1326]'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <img
                      src={item.fotoUrl}
                      alt={item.tipo}
                      className="w-16 h-12 sm:w-20 sm:h-14 rounded-lg object-cover border border-[#222a3d] shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold text-[#f59e0b]">
                          #{item.id}
                        </span>
                        <h3 className="font-['Chivo'] font-bold text-sm text-[#dae2fd]">
                          {item.tipo}
                        </h3>
                        <span className="text-[10px] font-mono text-[#94a3b8]">
                          {item.ubicacion}
                        </span>
                      </div>
                      <p className="text-xs text-[#94a3b8] line-clamp-1 mt-0.5">
                        {item.descripcion}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5 text-[10px] font-mono text-[#64748b]">
                        <span>Responsable: <strong className="text-[#dae2fd]">{item.asignadoA?.nombre || item.responsable}</strong></span>
                        <span>·</span>
                        <span>Prioridad: <strong className="text-[#f59e0b]">{item.prioridad}</strong></span>
                      </div>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0">
                    <span
                      className={`font-mono text-[10px] px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1 border ${sla.badgeClass}`}
                    >
                      <Clock className="w-3 h-3" />
                      {sla.text}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <span
                        className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded border ${
                          isClosed
                            ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                            : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                        }`}
                      >
                        {item.estado}
                      </span>
                      <ExternalLink className="w-3.5 h-3.5 text-[#94a3b8]" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Case Detail Modal */}
      {selectedCaseForDetailId && (
        <CaseDetailModal
          caseItem={cases.find((c) => c.id === selectedCaseForDetailId) || null}
          onClose={() => setSelectedCaseForDetailId(null)}
        />
      )}
    </div>
  );
};
