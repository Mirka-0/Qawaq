import React, { useState } from 'react';
import {
  Filter,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  User,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Building2,
  HardHat,
  Eye,
  BarChart3,
  Layers,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';
import { useCases } from '../context/CaseContext';
import { useRole } from '../context/RoleContext';
import { CaseItem, CaseStatus } from '../types';
import { formatSlaCountdown, useLiveTimer } from '../utils/sla';
import { CaseDetailModal } from './CaseDetailModal';
import { PdfExportModal } from './PdfExportModal';
import { UsageStatsCard } from './UsageStatsCard';
import { RiskHeatmap } from './RiskHeatmap';
import { SUPERVISOR_LIST, FRENTES_OBRA, FRENTE_IMAGES, ASSETS } from '../constants';

export const DashboardScreen: React.FC = () => {
  const { cases, activeTab, setActiveTab } = useCases();
  const { currentRole, isSSOMA, isGerencia, isSupervisor } = useRole();
  const now = useLiveTimer(3000);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterGroup, setFilterGroup] = useState<
    'TODOS' | 'PENDIENTES_ACCION' | 'EN_PROCESO' | 'CERRADOS' | CaseStatus
  >('TODOS');
  const [filterResponsable, setFilterResponsable] = useState<string>('TODOS');
  const [filterFrente, setFilterFrente] = useState<string>('TODOS');

  // Modals state
  const [selectedCase, setSelectedCase] = useState<CaseItem | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [pdfCase, setPdfCase] = useState<CaseItem | null>(null);
  const [isPdfOpen, setIsPdfOpen] = useState(false);

  // Filter logic
  const filteredCases = cases.filter((c) => {
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        c.id.toLowerCase().includes(q) ||
        c.tipo.toLowerCase().includes(q) ||
        c.ubicacion.toLowerCase().includes(q) ||
        c.responsable.toLowerCase().includes(q) ||
        (c.asignadoA && c.asignadoA.nombre.toLowerCase().includes(q));
      if (!match) return false;
    }

    // Filter by group or state
    if (filterGroup === 'PENDIENTES_ACCION') {
      if (c.estado !== 'Abierto' && c.estado !== 'Pendiente de Validación SSOMA') {
        return false;
      }
    } else if (filterGroup === 'EN_PROCESO') {
      if (
        c.estado !== 'Asignado' &&
        c.estado !== 'En Corrección' &&
        c.estado !== 'Rechazado'
      ) {
        return false;
      }
    } else if (filterGroup === 'CERRADOS') {
      if (c.estado !== 'Cerrado') return false;
    } else if (filterGroup !== 'TODOS') {
      if (c.estado !== filterGroup) return false;
    }

    // Filter by responsable
    if (filterResponsable !== 'TODOS') {
      if (filterResponsable === 'SIN_ASIGNAR') {
        if (c.estado !== 'Abierto' && c.asignadoA) return false;
      } else {
        const assignedName = c.asignadoA?.nombre || c.responsable;
        if (!assignedName.includes(filterResponsable)) return false;
      }
    }

    // Filter by frente
    if (filterFrente !== 'TODOS') {
      if (c.frente !== filterFrente) return false;
    }

    return true;
  });

  // Calculate Metrics for Top Banner (especially useful for Gerencia & SSOMA)
  const totalCases = cases.length;
  const closedCases = cases.filter((c) => c.estado === 'Cerrado').length;
  const pendingActionCases = cases.filter(
    (c) => c.estado === 'Abierto' || c.estado === 'Pendiente de Validación SSOMA'
  ).length;

  // Calculate Overdue active cases
  const overdueActiveCases = cases.filter((c) => {
    if (c.estado === 'Cerrado') return false;
    const sla = formatSlaCountdown(c.plazoObjetivo, c.estado, now);
    return sla.isVencido;
  }).length;

  // On-time resolution rate
  const onTimeResolvedCount = cases.filter(
    (c) => c.estado === 'Cerrado' && (!c.plazoObjetivo || Date.parse(c.fechaCierre || '') <= Date.parse(c.plazoObjetivo))
  ).length;
  const onTimeRate =
    closedCases > 0 ? Math.round((onTimeResolvedCount / closedCases) * 100) : 100;

  // Front with most incidents
  const frenteCounts: Record<string, number> = {};
  cases.forEach((c) => {
    frenteCounts[c.frente] = (frenteCounts[c.frente] || 0) + 1;
  });
  let highestFront = 'Frente B (Torre Principal)';
  let highestFrontCount = 0;
  Object.entries(frenteCounts).forEach(([frente, cnt]) => {
    if (cnt > highestFrontCount) {
      highestFrontCount = cnt;
      highestFront = frente;
    }
  });

  const handleOpenDetail = (item: CaseItem) => {
    setSelectedCase(item);
    setIsDetailOpen(true);
  };

  const handleExportPdf = (item: CaseItem) => {
    setPdfCase(item);
    setIsPdfOpen(true);
  };

  return (
    <div className="flex flex-col w-full px-3 sm:px-6 lg:px-8 pt-3 pb-24 gap-5 max-w-7xl mx-auto animate-fade-in">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0c1322] border border-[#222a3d] p-4 sm:p-5 rounded-2xl shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`font-mono text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border ${
                isGerencia
                  ? 'bg-sky-500/15 text-sky-300 border-sky-500/30'
                  : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
              }`}
            >
              {isGerencia ? 'AUDITORÍA ESTRATÉGICA · SOLO LECTURA' : 'CENTRAL DE CONTROL SSOMA'}
            </span>
            <span className="font-mono text-[10px] text-[#94a3b8]">Obra Principal · 2026</span>
          </div>
          <h1 className="font-['Chivo'] font-black text-xl sm:text-2xl text-[#dae2fd] uppercase tracking-tight">
            {isGerencia ? 'Dashboard Gerencial de SST' : 'Dashboard General de Casos SSOMA'}
          </h1>
          <p className="text-xs text-[#94a3b8] mt-0.5">
            {isGerencia
              ? 'Supervisión en tiempo real de SLAs, cuellos de botella por cuadrilla y cumplimiento de la Norma G.050.'
              : 'Asignación de cuadrillas, validación de evidencias de campo y emisión de certificaciones técnicas.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            id="executive-export-button"
            type="button"
            onClick={() => {
              if (cases.length > 0) {
                handleExportPdf(cases[0]);
              }
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-[#ffb95f] text-xs font-['Chivo'] font-bold uppercase tracking-wider transition-all active:scale-95 shadow-sm"
            title="Descargar o Previsualizar Informe Técnico Ejecutivo"
          >
            <FileText className="w-4 h-4 text-[#f59e0b]" />
            <span>Informe Ejecutivo PDF</span>
          </button>

          {isGerencia && (
            <div className="flex items-center gap-2 bg-[#131b2e] px-3 py-2 rounded-xl border border-sky-500/30 text-sky-300 text-xs font-mono">
              <Eye className="w-4 h-4 text-sky-400 shrink-0" />
              <span>Modo Observador</span>
            </div>
          )}
        </div>
      </div>

      {/* KPI Metrics Dashboard Cards */}
      <div id="dashboard-kpi-summary" className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-[#131b2e] p-4 rounded-2xl border border-[#222a3d] shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#94a3b8]">
            <span className="font-mono text-[10px] uppercase tracking-wider font-semibold">
              Casos Registrados
            </span>
            <Building2 className="w-4 h-4 text-[#dae2fd]" />
          </div>
          <div className="mt-3">
            <span className="font-mono text-3xl font-black text-[#dae2fd]">
              {totalCases}
            </span>
            <div className="flex items-center gap-1.5 font-mono text-[10px] text-[#94a3b8] mt-1">
              <span className="text-[#10b981] font-bold">{closedCases} cerrados</span>
              <span>·</span>
              <span className="text-[#f59e0b] font-bold">{totalCases - closedCases} activos</span>
            </div>
          </div>
        </div>

        <div className="bg-[#131b2e] p-4 rounded-2xl border border-[#222a3d] shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#94a3b8]">
            <span className="font-mono text-[10px] uppercase tracking-wider font-semibold">
              Pendientes de Acción
            </span>
            <Clock className="w-4 h-4 text-[#f59e0b]" />
          </div>
          <div className="mt-3">
            <span className="font-mono text-3xl font-black text-[#f59e0b]">
              {pendingActionCases}
            </span>
            <div className="font-mono text-[10px] text-[#94a3b8] mt-1">
              {cases.filter((c) => c.estado === 'Abierto').length} sin asignar ·{' '}
              {cases.filter((c) => c.estado === 'Pendiente de Validación SSOMA').length} por validar
            </div>
          </div>
        </div>

        <div className="bg-[#131b2e] p-4 rounded-2xl border border-[#222a3d] shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#94a3b8]">
            <span className="font-mono text-[10px] uppercase tracking-wider font-semibold">
              Casos Vencidos (SLA)
            </span>
            <AlertTriangle className="w-4 h-4 text-red-400" />
          </div>
          <div className="mt-3">
            <span
              className={`font-mono text-3xl font-black ${
                overdueActiveCases > 0 ? 'text-red-400' : 'text-[#10b981]'
              }`}
            >
              {overdueActiveCases}
            </span>
            <div className="font-mono text-[10px] text-red-300/80 mt-1">
              {overdueActiveCases > 0
                ? 'Excedieron plazo legal de atención'
                : '100% de casos dentro del SLA'}
            </div>
          </div>
        </div>

        <div className="bg-[#131b2e] p-4 rounded-2xl border border-[#222a3d] shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#94a3b8]">
            <span className="font-mono text-[10px] uppercase tracking-wider font-semibold">
              Resolución a Tiempo
            </span>
            <CheckCircle2 className="w-4 h-4 text-[#10b981]" />
          </div>
          <div className="mt-3">
            <span className="font-mono text-3xl font-black text-[#10b981]">
              {onTimeRate}%
            </span>
            <div className="font-mono text-[10px] text-[#94a3b8] mt-1 truncate">
              Mayor incidencia: {highestFront.split('(')[0]}
            </div>
          </div>
        </div>
      </div>

      {/* D3 Risk Heatmap Component */}
      <RiskHeatmap />

      {/* Gerencia & SSOMA SLA Progress per Frente */}
      <div className="bg-[#131b2e] border border-[#222a3d] rounded-2xl p-4 sm:p-5 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-[#f59e0b]" />
            <h3 className="font-['Chivo'] font-bold text-xs sm:text-sm text-[#dae2fd] uppercase tracking-wide">
              Distribución y Cumplimiento de SLA por Frente Operativo
            </h3>
          </div>
          <span className="font-mono text-[10px] text-[#94a3b8]">
            Supervisión Integral
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {FRENTES_OBRA.map((frente) => {
            const frenteCases = cases.filter((c) => c.frente === frente);
            const closedInFrente = frenteCases.filter((c) => c.estado === 'Cerrado').length;
            const overdueInFrente = frenteCases.filter((c) => {
              if (c.estado === 'Cerrado') return false;
              return formatSlaCountdown(c.plazoObjetivo, c.estado, now).isVencido;
            }).length;
            const pct =
              frenteCases.length > 0
                ? Math.round((closedInFrente / frenteCases.length) * 100)
                : 100;

            return (
              <div
                key={frente}
                className="bg-[#0b1326] rounded-xl border border-[#1e293b] overflow-hidden flex flex-col justify-between group hover:border-[#3b82f6]/50 transition-all shadow-md"
              >
                {/* Front Real Photo Header */}
                <div className="relative h-20 w-full overflow-hidden bg-black">
                  <img
                    src={FRENTE_IMAGES[frente] || ASSETS.cctv1}
                    alt={frente}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0b1326] via-[#0b1326]/50 to-transparent" />
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/75 backdrop-blur-sm border border-white/10 font-mono text-[9px] text-[#dae2fd] font-bold">
                    {frente.split('(')[0]}
                  </div>
                  <div className="absolute bottom-1 right-2 font-mono text-[10px] text-[#f59e0b] font-black px-1.5 py-0.5 rounded bg-black/70 border border-amber-500/30">
                    {frenteCases.length} casos
                  </div>
                </div>

                <div className="p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-['Chivo'] font-bold text-xs text-[#dae2fd] truncate">
                      {frente}
                    </span>
                  </div>

                  <div className="w-full h-2 bg-[#1e293b] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between font-mono text-[9px] text-[#94a3b8]">
                    <span>{pct}% subsanado</span>
                    {overdueInFrente > 0 ? (
                      <span className="text-red-400 font-bold">
                        {overdueInFrente} vencido(s)
                      </span>
                    ) : (
                      <span className="text-emerald-400">SLA conforme</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-[#131b2e] border border-[#222a3d] rounded-2xl p-4 shadow-xl space-y-3">
        {/* Search & Top controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por ID (#QW-...), riesgo, ubicación, cuadrilla..."
              className="w-full bg-[#070d18] border border-[#222a3d] focus:border-[#f59e0b] rounded-xl pl-9 pr-4 py-2 text-xs text-[#dae2fd] font-mono placeholder:text-[#64748b] outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            {/* Responsable Dropdown */}
            <select
              value={filterResponsable}
              onChange={(e) => setFilterResponsable(e.target.value)}
              className="bg-[#070d18] border border-[#222a3d] text-[#dae2fd] rounded-xl px-3 py-2 text-xs font-mono outline-none focus:border-[#f59e0b]"
            >
              <option value="TODOS">Todos los Responsables</option>
              <option value="SIN_ASIGNAR">Sin Asignar (Abiertos)</option>
              {SUPERVISOR_LIST.map((s) => (
                <option key={s.id} value={s.nombre}>
                  {s.nombre} ({s.rol})
                </option>
              ))}
            </select>

            {/* Frente Dropdown */}
            <select
              value={filterFrente}
              onChange={(e) => setFilterFrente(e.target.value)}
              className="bg-[#070d18] border border-[#222a3d] text-[#dae2fd] rounded-xl px-3 py-2 text-xs font-mono outline-none focus:border-[#f59e0b]"
            >
              <option value="TODOS">Todos los Frentes</option>
              {FRENTES_OBRA.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-[11px] font-mono">
          {[
            { id: 'TODOS', label: 'Todos los Casos', count: cases.length },
            {
              id: 'PENDIENTES_ACCION',
              label: 'Pendientes de Acción',
              count: pendingActionCases,
              highlight: true,
            },
            {
              id: 'EN_PROCESO',
              label: 'En Proceso en Campo',
              count: cases.filter(
                (c) =>
                  c.estado === 'Asignado' ||
                  c.estado === 'En Corrección' ||
                  c.estado === 'Rechazado'
              ).length,
            },
            { id: 'CERRADOS', label: 'Cerrados', count: closedCases },
          ].map((tab) => {
            const isSelected = filterGroup === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilterGroup(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-1.5 border ${
                  isSelected
                    ? 'bg-[#f59e0b] text-[#2a1700] border-[#ffddb8] shadow-sm'
                    : 'bg-[#0b1326] text-[#94a3b8] hover:text-[#dae2fd] border-[#1e293b]'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[9px] ${
                    isSelected
                      ? 'bg-[#2a1700] text-[#ffddb8]'
                      : tab.highlight
                      ? 'bg-amber-500/20 text-amber-300 font-bold'
                      : 'bg-[#1e293b] text-[#94a3b8]'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Cases List */}
      <div id="dashboard-cases-feed" className="space-y-3">
        <div className="flex items-center justify-between text-xs font-mono text-[#94a3b8] px-1">
          <span>
            Mostrando <strong>{filteredCases.length}</strong> de {cases.length} casos
          </span>
          <span className="hidden sm:inline">
            Toca cualquier caso para ver historial, evidencias y emitir dictamen
          </span>
        </div>

        {filteredCases.length === 0 ? (
          <div className="bg-[#131b2e] border border-[#222a3d] rounded-2xl p-8 text-center text-[#94a3b8] font-mono space-y-2">
            <CheckCircle2 className="w-10 h-10 text-[#10b981] mx-auto opacity-70" />
            <p className="font-bold text-sm text-[#dae2fd]">
              No hay casos que coincidan con los filtros seleccionados
            </p>
            <p className="text-xs">
              Prueba cambiando los criterios de búsqueda o limpiando los filtros.
            </p>
          </div>
        ) : (
          filteredCases.map((item) => {
            const sla = formatSlaCountdown(item.plazoObjetivo, item.estado, now);
            const isUnassigned = item.estado === 'Abierto';
            const isPendingValidation = item.estado === 'Pendiente de Validación SSOMA';

            return (
              <div
                key={item.id}
                onClick={() => handleOpenDetail(item)}
                className="bg-[#131b2e] hover:bg-[#18223a] border border-[#222a3d] hover:border-[#334155] rounded-2xl p-3.5 sm:p-4 transition-all shadow-md cursor-pointer group"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  {/* Left: Thumbnail & Core Info */}
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-black shrink-0 border border-[#222a3d]">
                      <img
                        src={item.fotoUrl}
                        alt={item.tipo}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <span className="absolute top-1 left-1 bg-black/80 font-mono text-[8px] text-[#ffb95f] px-1 rounded">
                        #{item.id}
                      </span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
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
                            item.estado === 'Cerrado'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : item.estado === 'Pendiente de Validación SSOMA'
                              ? 'bg-amber-500/25 text-amber-300 border border-amber-500/50'
                              : item.estado === 'Abierto'
                              ? 'bg-red-500/25 text-red-300 border border-red-500/50'
                              : 'bg-[#1e293b] text-[#94a3b8] border border-[#334155]'
                          }`}
                        >
                          {item.estado}
                        </span>

                        <span className="text-xs font-mono text-[#94a3b8] truncate">
                          {item.frente}
                        </span>
                      </div>

                      <h3 className="font-['Chivo'] font-bold text-sm sm:text-base text-[#dae2fd] mt-1 leading-snug truncate">
                        {item.tipo}
                      </h3>

                      <div className="flex items-center gap-2 mt-1 text-xs font-mono text-[#94a3b8]">
                        <span className="truncate">{item.ubicacion}</span>
                        <span>·</span>
                        <span
                          className={`flex items-center gap-1 font-semibold ${
                            isUnassigned ? 'text-red-400 font-bold' : 'text-[#dae2fd]'
                          }`}
                        >
                          <HardHat className="w-3.5 h-3.5 text-[#f59e0b]" />
                          {isUnassigned ? 'Sin Asignar (Abierto)' : item.asignadoA?.nombre || item.responsable}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: SLA Countdown & Action Badge */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-[#1e293b] gap-2 shrink-0">
                    {/* SLA Badge */}
                    <div
                      className={`font-mono text-xs px-2.5 py-1 rounded-lg border font-bold flex items-center gap-1.5 ${
                        sla.isVencido
                          ? 'bg-red-500/20 text-red-300 border-red-500/40'
                          : item.estado === 'Cerrado'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : 'bg-[#0b1326] text-[#38bdf8] border-[#1e293b]'
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>{sla.text}</span>
                    </div>

                    {/* Quick indicator button */}
                    <div className="flex items-center gap-2">
                      {isPendingValidation && isSSOMA && !isGerencia && (
                        <span className="px-2.5 py-1 rounded-lg bg-amber-500 text-black font-['Chivo'] font-bold text-[10px] uppercase tracking-wider">
                          Validar Ahora
                        </span>
                      )}
                      {isUnassigned && isSSOMA && !isGerencia && (
                        <span className="px-2.5 py-1 rounded-lg bg-red-500 text-white font-['Chivo'] font-bold text-[10px] uppercase tracking-wider">
                          Asignar Responsable
                        </span>
                      )}
                      <ChevronRight className="w-4 h-4 text-[#94a3b8] group-hover:text-[#f59e0b] group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Operational Usage & Metrics Section */}
      <UsageStatsCard />

      {/* Modals */}
      <CaseDetailModal
        caseItem={selectedCase}
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedCase(null);
        }}
        onExportPdf={handleExportPdf}
      />

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
