import React, { useMemo, useState } from 'react';
import {
  BarChart3,
  Shield,
  Timer,
  MapPin,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowRight,
  PlusCircle,
  HardHat,
  Eye,
  Search,
  X,
  Filter,
  SlidersHorizontal,
  Calendar,
  User,
  RotateCcw,
  Bell,
  ChevronDown,
  ChevronUp,
  FileText,
  Download,
} from 'lucide-react';
import { useCases } from '../context/CaseContext';
import { useRole } from '../context/RoleContext';
import { CaseItem, CaseStatus, RiskType, UrgencyLevel } from '../types';
import { PdfExportModal } from './PdfExportModal';
import { CaseDetailModal } from './CaseDetailModal';
import { UsageStatsCard } from './UsageStatsCard';
import { formatSlaCountdown, useLiveTimer } from '../utils/sla';
import { Building2, UserPlus } from 'lucide-react';

export const DashboardScreen: React.FC = () => {
  const { cases, setActiveTab, navigateToCloseCase, setIsNotificationModalOpen } = useCases();
  const { currentRole, isSSOMA, isGerencia, isSupervisor, setIsRoleModalOpen } = useRole();
  const now = useLiveTimer(5000);

  // Filter and search states
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'Todos' | CaseStatus>('Todos');
  const [urgencyFilter, setUrgencyFilter] = useState<'Todas' | UrgencyLevel>('Todas');
  const [personnelFilter, setPersonnelFilter] = useState<string>('Todos');
  const [datePreset, setDatePreset] = useState<'todos' | 'hoy' | '7dias' | '30dias' | 'personalizado'>('todos');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');
  const [isAdvancedFiltersOpen, setIsAdvancedFiltersOpen] = useState<boolean>(false);

  // PDF Export Modal State
  const [selectedCaseForPdf, setSelectedCaseForPdf] = useState<CaseItem | null>(null);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState<boolean>(false);

  // Case Details Modal State
  const [selectedCaseForDetail, setSelectedCaseForDetail] = useState<CaseItem | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);

  const openPdfExport = (item: CaseItem) => {
    setSelectedCaseForPdf(item);
    setIsPdfModalOpen(true);
  };

  const openCaseDetail = (item: CaseItem) => {
    setSelectedCaseForDetail(item);
    setIsDetailModalOpen(true);
  };

  // Distinct personnel extracted dynamically from cases
  const distinctPersonnel = useMemo(() => {
    const list = Array.from(new Set(cases.map((c) => c.responsable).filter(Boolean)));
    return list.sort();
  }, [cases]);

  // Active filters count (excluding default 'Todos' / empty)
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (searchTerm.trim()) count++;
    if (statusFilter !== 'Todos') count++;
    if (urgencyFilter !== 'Todas') count++;
    if (personnelFilter !== 'Todos') count++;
    if (datePreset !== 'todos') count++;
    return count;
  }, [searchTerm, statusFilter, urgencyFilter, personnelFilter, datePreset]);

  // Reset all filters
  const handleResetFilters = () => {
    setSearchTerm('');
    setStatusFilter('Todos');
    setUrgencyFilter('Todas');
    setPersonnelFilter('Todos');
    setDatePreset('todos');
    setCustomStartDate('');
    setCustomEndDate('');
  };

  // 1. FILTERED CASES CALCULATION
  const filteredCases = useMemo(() => {
    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;
    const sevenDaysMs = 7 * oneDayMs;
    const thirtyDaysMs = 30 * oneDayMs;

    return cases.filter((item) => {
      // 1. Search term (ID, type, location, personnel, description)
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase().trim();
        const matchesId = item.id.toLowerCase().includes(query);
        const matchesType = item.tipo.toLowerCase().includes(query);
        const matchesLocation = item.ubicacion.toLowerCase().includes(query) || item.frente.toLowerCase().includes(query);
        const matchesPersonnel = item.responsable.toLowerCase().includes(query);
        const matchesDesc = item.descripcion.toLowerCase().includes(query);
        const matchesNotes = (item.dictamenCierre || '').toLowerCase().includes(query) || (item.medidaAplicada || '').toLowerCase().includes(query);

        if (!matchesId && !matchesType && !matchesLocation && !matchesPersonnel && !matchesDesc && !matchesNotes) {
          return false;
        }
      }

      // 2. Status filter
      if (statusFilter !== 'Todos' && item.estado !== statusFilter) {
        return false;
      }

      // 3. Urgency filter
      if (urgencyFilter !== 'Todas' && item.urgencia !== urgencyFilter) {
        return false;
      }

      // 4. Assigned Personnel filter
      if (personnelFilter !== 'Todos' && item.responsable !== personnelFilter) {
        return false;
      }

      // 5. Date range filter
      if (datePreset === 'hoy') {
        if (now - item.fechaCreacion > oneDayMs) return false;
      } else if (datePreset === '7dias') {
        if (now - item.fechaCreacion > sevenDaysMs) return false;
      } else if (datePreset === '30dias') {
        if (now - item.fechaCreacion > thirtyDaysMs) return false;
      } else if (datePreset === 'personalizado') {
        if (customStartDate) {
          const startMs = new Date(customStartDate).getTime();
          if (item.fechaCreacion < startMs) return false;
        }
        if (customEndDate) {
          // Include end of the day
          const endMs = new Date(customEndDate).getTime() + oneDayMs;
          if (item.fechaCreacion > endMs) return false;
        }
      }

      return true;
    });
  }, [cases, searchTerm, statusFilter, urgencyFilter, personnelFilter, datePreset, customStartDate, customEndDate]);

  // Overall counts and KPIs (calculated on total cases)
  const totalRisks = cases.length;
  const openCases = useMemo(() => cases.filter((c) => c.estado === 'Abierto'), [cases]);
  const openCasesCount = openCases.length;
  const inProcessCasesCount = useMemo(() => cases.filter((c) => c.estado === 'En Proceso').length, [cases]);
  const closedCasesCount = useMemo(() => cases.filter((c) => c.estado === 'Cerrado').length, [cases]);
  const criticalOpenCount = useMemo(
    () => openCases.filter((c) => c.urgencia === 'Alto').length,
    [openCases]
  );

  // Average closure time
  const avgClosureTime = useMemo(() => {
    const closed = cases.filter((c) => c.estado === 'Cerrado');
    if (closed.length === 0) return '18';
    const diffs = closed
      .filter((c) => c.fechaCierre && c.fechaCreacion)
      .map((c) => Math.round(((c.fechaCierre || Date.now()) - c.fechaCreacion) / 60000));
    if (diffs.length > 0) {
      const avg = Math.round(diffs.reduce((a, b) => a + b, 0) / diffs.length);
      return avg > 0 ? String(avg) : '15';
    }
    return '18';
  }, [cases]);

  // Critical Zone
  const criticalZone = useMemo(() => {
    if (cases.length === 0) return { zone: 'Piso 14', count: 0 };
    const locationMap: Record<string, number> = {};
    cases.forEach((c) => {
      const loc = c.ubicacion.split('-')[0].trim() || c.ubicacion;
      locationMap[loc] = (locationMap[loc] || 0) + 1;
    });
    let maxLoc = 'Piso 14';
    let maxCount = 0;
    Object.entries(locationMap).forEach(([loc, count]) => {
      if (count > maxCount) {
        maxCount = count;
        maxLoc = loc;
      }
    });
    return { zone: maxLoc, count: maxCount };
  }, [cases]);

  // Distribution by Risk Type
  const distributionByType = useMemo(() => {
    const counts: Record<RiskType, number> = {
      'Falta de Casco': 0,
      'Altura sin Arnés': 0,
      'Sin Chaleco': 0,
      'Zona sin Baranda': 0,
      'Piso Resbaladizo': 0,
      'Otro Factor': 0,
    };

    cases.forEach((c) => {
      if (counts[c.tipo] !== undefined) {
        counts[c.tipo]++;
      } else {
        counts['Otro Factor'] = (counts['Otro Factor'] || 0) + 1;
      }
    });

    const total = cases.length || 1;

    return Object.entries(counts)
      .map(([tipo, count]) => ({
        tipo: tipo as RiskType,
        count,
        percentage: Math.round((count / total) * 100),
      }))
      .sort((a, b) => b.count - a.count);
  }, [cases]);

  return (
    <div className="flex flex-col w-full px-3 sm:px-6 lg:px-8 pt-3 pb-24 gap-4 sm:gap-6 max-w-md sm:max-w-3xl md:max-w-5xl lg:max-w-7xl mx-auto">
      {/* Gerencia Read-Only Mode Banner */}
      {isGerencia && (
        <div className="bg-sky-500/10 border border-sky-500/30 rounded-2xl p-3.5 sm:p-4 text-xs font-mono text-sky-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-500/20 border border-sky-500/40 text-sky-300 shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="font-['Chivo'] font-bold text-sm text-sky-100 uppercase tracking-wide">
                Perspectiva Gerencial · Solo Lectura & Auditoría
              </div>
              <p className="text-[11px] text-[#94a3b8] font-mono mt-0.5">
                Vista ejecutiva de cumplimiento normativo G.050 / DS 011-2019-TR y SLA de obra.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsRoleModalOpen(true)}
            className="px-3 py-1.5 rounded-lg bg-sky-500 text-black font-['Chivo'] font-bold uppercase text-[10px] tracking-wider hover:bg-sky-400 transition-all shrink-0"
          >
            Cambiar de Rol
          </button>
        </div>
      )}

      {/* 1. Header & Quick Actions */}
      <section className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#1e293b] flex items-center justify-center text-[#f59e0b] border border-[#334155]">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-['Chivo'] font-black text-sm sm:text-base text-[#dae2fd] uppercase tracking-wide">
                Panel de Control de Seguridad
              </h2>
              <p className="font-mono text-[9px] sm:text-[10px] text-[#94a3b8] uppercase">
                Monitoreo en Tiempo Real · Torre Andina
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsNotificationModalOpen(true)}
              className="px-2.5 py-1.5 rounded-lg bg-[#1e293b] hover:bg-[#283548] border border-[#334155] text-[#f59e0b] font-mono text-[9px] sm:text-[10px] uppercase flex items-center gap-1.5 font-bold shadow-sm active:scale-95 transition-all"
              title="Configurar Notificaciones Push y Alertas"
            >
              <Bell className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Push Alert</span>
            </button>
          </div>
        </div>

        {/* 2. SEARCH BAR & QUICK FILTERS */}
        <div className="relative flex items-center w-full">
          <div className="absolute left-3.5 text-[#94a3b8] pointer-events-none">
            <Search className="w-4 h-4 text-[#f59e0b]" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por ID (ej. QW-104), riesgo, cuadrilla, frente..."
            className="w-full h-11 pl-10 pr-9 rounded-xl bg-[#131b2e] border border-[#222a3d] focus:border-[#f59e0b] focus:ring-1 focus:ring-[#f59e0b] text-[#dae2fd] placeholder-[#64748b] font-sans text-xs sm:text-sm outline-none transition-all shadow-inner"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 p-1 rounded-md text-[#94a3b8] hover:text-[#dae2fd] hover:bg-[#1e293b] transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Quick Status Chips Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 no-scrollbar">
          <button
            onClick={() => setStatusFilter('Todos')}
            className={`px-3 py-1.5 rounded-lg font-mono text-[10px] uppercase tracking-wider shrink-0 transition-all ${
              statusFilter === 'Todos'
                ? 'bg-[#f59e0b] text-[#2a1700] font-bold shadow-sm'
                : 'bg-[#131b2e] text-[#94a3b8] hover:text-[#dae2fd] border border-[#222a3d]'
            }`}
          >
            Todos ({totalRisks})
          </button>
          <button
            onClick={() => setStatusFilter('Abierto')}
            className={`px-3 py-1.5 rounded-lg font-mono text-[10px] uppercase tracking-wider shrink-0 flex items-center gap-1 border transition-all ${
              statusFilter === 'Abierto'
                ? 'bg-[#ef4444] text-white font-bold border-[#fca5a5] shadow-sm'
                : 'bg-[#450a0a]/40 text-[#ffb4ab] border-[#ef4444]/30 hover:bg-[#450a0a]'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#ef4444] animate-pulse" />
            Abiertos ({openCasesCount})
          </button>
          <button
            onClick={() => setStatusFilter('En Proceso')}
            className={`px-3 py-1.5 rounded-lg font-mono text-[10px] uppercase tracking-wider shrink-0 border transition-all ${
              statusFilter === 'En Proceso'
                ? 'bg-[#f59e0b] text-[#2a1700] font-bold border-[#ffddb8]'
                : 'bg-[#131b2e] text-[#ffc174] border-[#f59e0b]/30 hover:bg-[#1a243a]'
            }`}
          >
            En Proceso ({inProcessCasesCount})
          </button>
          <button
            onClick={() => setStatusFilter('Cerrado')}
            className={`px-3 py-1.5 rounded-lg font-mono text-[10px] uppercase tracking-wider shrink-0 flex items-center gap-1 border transition-all ${
              statusFilter === 'Cerrado'
                ? 'bg-[#10b981] text-[#06241a] font-bold border-[#6ee7b7]'
                : 'bg-[#064e3b]/30 text-[#6ffbbe] border-[#10b981]/30 hover:bg-[#064e3b]/50'
            }`}
          >
            <CheckCircle2 className="w-3 h-3" />
            Cerrados ({closedCasesCount})
          </button>
        </div>

        {/* Filter Drawer Toggle & Active Summary */}
        <div className="flex items-center justify-between pt-0.5">
          <button
            onClick={() => setIsAdvancedFiltersOpen(!isAdvancedFiltersOpen)}
            className="flex items-center gap-1.5 text-[#94a3b8] hover:text-[#f59e0b] font-mono text-[10px] font-bold uppercase transition-colors"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#f59e0b]" />
            Filtros Avanzados
            {activeFiltersCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-[#f59e0b] text-[#2a1700] font-mono text-[9px] font-black">
                {activeFiltersCount}
              </span>
            )}
            {isAdvancedFiltersOpen ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>

          {activeFiltersCount > 0 && (
            <button
              onClick={handleResetFilters}
              className="flex items-center gap-1 text-[#ef4444] hover:text-[#fca5a5] font-mono text-[9px] uppercase transition-colors font-semibold"
            >
              <RotateCcw className="w-3 h-3" />
              Limpiar ({activeFiltersCount})
            </button>
          )}
        </div>

        {/* 3. ADVANCED FILTERS PANEL */}
        {isAdvancedFiltersOpen && (
          <div className="bg-[#131b2e] border border-[#222a3d] rounded-2xl p-3.5 sm:p-5 flex flex-col gap-3 shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Filter 1: Urgency */}
              <div className="flex flex-col gap-1.5">
                <label className="font-mono text-[9px] text-[#94a3b8] uppercase font-bold flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 text-[#f59e0b]" />
                  Nivel de Urgencia:
                </label>
                <div className="grid grid-cols-4 gap-1">
                  {(['Todas', 'Alto', 'Medio', 'Bajo'] as const).map((lvl) => (
                    <button
                      key={lvl}
                      onClick={() => setUrgencyFilter(lvl)}
                      className={`py-1.5 px-1 rounded-lg font-mono text-[9px] uppercase text-center transition-all border ${
                        urgencyFilter === lvl
                          ? lvl === 'Alto'
                            ? 'bg-[#ef4444] text-white font-bold border-[#fca5a5]'
                            : lvl === 'Medio'
                            ? 'bg-[#f59e0b] text-[#2a1700] font-bold border-[#ffddb8]'
                            : lvl === 'Bajo'
                            ? 'bg-[#10b981] text-[#06241a] font-bold border-[#6ee7b7]'
                            : 'bg-[#dae2fd] text-[#0f172a] font-bold border-white'
                          : 'bg-[#0b1326] text-[#94a3b8] border-[#1e293b] hover:text-[#dae2fd]'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Filter 2: Assigned Personnel */}
              <div className="flex flex-col gap-1.5">
                <label className="font-mono text-[9px] text-[#94a3b8] uppercase font-bold flex items-center gap-1">
                  <User className="w-3 h-3 text-[#f59e0b]" />
                  Personal Asignado / Responsable:
                </label>
                <select
                  value={personnelFilter}
                  onChange={(e) => setPersonnelFilter(e.target.value)}
                  className="w-full h-8 px-2.5 rounded-xl bg-[#0b1326] border border-[#1e293b] text-[#dae2fd] font-sans text-xs focus:border-[#f59e0b] outline-none"
                >
                  <option value="Todos">Todos los responsables</option>
                  {distinctPersonnel.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filter 3: Date Range */}
              <div className="flex flex-col gap-1.5">
                <label className="font-mono text-[9px] text-[#94a3b8] uppercase font-bold flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-[#f59e0b]" />
                  Rango de Fechas:
                </label>
                <div className="grid grid-cols-4 gap-1">
                  {[
                    { id: 'todos', label: 'Todo' },
                    { id: 'hoy', label: 'Hoy' },
                    { id: '7dias', label: '7 Días' },
                    { id: 'personalizado', label: 'Manual' },
                  ].map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() =>
                        setDatePreset(preset.id as 'todos' | 'hoy' | '7dias' | 'personalizado')
                      }
                      className={`py-1.5 px-1 rounded-lg font-mono text-[9px] uppercase text-center transition-all border ${
                        datePreset === preset.id
                          ? 'bg-[#f59e0b] text-[#2a1700] font-bold border-[#ffddb8]'
                          : 'bg-[#0b1326] text-[#94a3b8] border-[#1e293b] hover:text-[#dae2fd]'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Custom Date Pickers if selected */}
            {datePreset === 'personalizado' && (
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#1e293b]">
                <div className="flex flex-col gap-1">
                  <span className="font-mono text-[8px] text-[#94a3b8] uppercase">Desde:</span>
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="w-full h-8 px-2 rounded-lg bg-[#0b1326] border border-[#1e293b] text-[#dae2fd] font-mono text-[10px] focus:border-[#f59e0b] outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="font-mono text-[8px] text-[#94a3b8] uppercase">Hasta:</span>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="w-full h-8 px-2 rounded-lg bg-[#0b1326] border border-[#1e293b] text-[#dae2fd] font-mono text-[10px] focus:border-[#f59e0b] outline-none"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Active Filters Badges */}
        {activeFiltersCount > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            {searchTerm && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#1e293b] border border-[#334155] text-[#dae2fd] font-mono text-[9px]">
                Búsqueda: &quot;{searchTerm}&quot;
                <button onClick={() => setSearchTerm('')} className="hover:text-[#ef4444]">
                  <X className="w-2.5 h-2.5" />
                </button>
              </span>
            )}
            {statusFilter !== 'Todos' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#1e293b] border border-[#334155] text-[#dae2fd] font-mono text-[9px]">
                Estado: {statusFilter}
                <button onClick={() => setStatusFilter('Todos')} className="hover:text-[#ef4444]">
                  <X className="w-2.5 h-2.5" />
                </button>
              </span>
            )}
            {urgencyFilter !== 'Todas' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#1e293b] border border-[#334155] text-[#dae2fd] font-mono text-[9px]">
                Urgencia: {urgencyFilter}
                <button onClick={() => setUrgencyFilter('Todas')} className="hover:text-[#ef4444]">
                  <X className="w-2.5 h-2.5" />
                </button>
              </span>
            )}
            {personnelFilter !== 'Todos' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#1e293b] border border-[#334155] text-[#dae2fd] font-mono text-[9px]">
                Asignado: {personnelFilter.split('(')[0].trim()}
                <button onClick={() => setPersonnelFilter('Todos')} className="hover:text-[#ef4444]">
                  <X className="w-2.5 h-2.5" />
                </button>
              </span>
            )}
            {datePreset !== 'todos' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#1e293b] border border-[#334155] text-[#dae2fd] font-mono text-[9px]">
                Fecha: {datePreset === 'hoy' ? 'Hoy' : datePreset === '7dias' ? '7 Días' : 'Personalizado'}
                <button onClick={() => setDatePreset('todos')} className="hover:text-[#ef4444]">
                  <X className="w-2.5 h-2.5" />
                </button>
              </span>
            )}
          </div>
        )}
      </section>

      {/* 2. KPI 4 Cards - Responsive 2x2 on mobile, 4 in 1 row on Desktop */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
        {/* Card 1: Total Riesgos */}
        <div className="bg-[#131b2e] border border-[#222a3d] rounded-2xl p-3.5 sm:p-4 flex flex-col justify-between shadow-md relative overflow-hidden">
          <div className="flex items-start justify-between">
            <span className="font-mono text-[9px] sm:text-[10px] text-[#94a3b8] uppercase font-bold">
              Riesgos Totales
            </span>
            <div className="p-1.5 rounded-lg bg-[#f59e0b]/15 text-[#f59e0b]">
              <Shield className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="font-['Chivo'] font-black text-2xl sm:text-3xl text-[#dae2fd] tracking-tight">
              {totalRisks}
            </div>
            <div className="flex items-center gap-1 mt-0.5 text-[#f59e0b]">
              <TrendingUp className="w-3 h-3" />
              <span className="font-mono text-[9px] sm:text-[10px] font-bold">
                {closedCasesCount} resueltos
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Abiertos Ahora */}
        <div className="bg-[#131b2e] border border-[#222a3d] rounded-2xl p-3.5 sm:p-4 flex flex-col justify-between shadow-md relative overflow-hidden">
          <div className="flex items-start justify-between">
            <span className="font-mono text-[9px] sm:text-[10px] text-[#94a3b8] uppercase font-bold">
              Abiertas Ahora
            </span>
            {openCasesCount > 0 && (
              <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444] animate-ping" />
            )}
          </div>
          <div className="mt-2">
            <div className="font-['Chivo'] font-black text-2xl sm:text-3xl text-[#ef4444] tracking-tight flex items-baseline gap-2">
              {openCasesCount}
              {openCasesCount > 0 && (
                <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-[#93000a] text-[#ffdad6] font-bold uppercase">
                  Alerta
                </span>
              )}
            </div>
            <div className="font-mono text-[9px] sm:text-[10px] text-[#94a3b8] mt-0.5">
              {criticalOpenCount} con riesgo crítico
            </div>
          </div>
        </div>

        {/* Card 3: Tiempo Promedio Cierre */}
        <div className="bg-[#131b2e] border border-[#222a3d] rounded-2xl p-3.5 sm:p-4 flex flex-col justify-between shadow-md">
          <div className="flex items-start justify-between">
            <span className="font-mono text-[9px] sm:text-[10px] text-[#94a3b8] uppercase font-bold">
              Prom. Cierre
            </span>
            <div className="p-1.5 rounded-lg bg-[#10b981]/15 text-[#10b981]">
              <Timer className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="font-['Chivo'] font-black text-2xl sm:text-3xl text-[#10b981] tracking-tight">
              {avgClosureTime}
              <span className="font-sans text-xs font-normal text-[#dae2fd] ml-1">min</span>
            </div>
            <div className="font-mono text-[8px] text-[#10b981] bg-[#064e3b]/40 rounded px-1.5 py-0.5 mt-0.5 inline-block font-semibold border border-[#10b981]/30">
              Meta: &lt;30 min ✓
            </div>
          </div>
        </div>

        {/* Card 4: Punto Crítico */}
        <div className="bg-[#131b2e] border border-[#222a3d] rounded-2xl p-3.5 sm:p-4 flex flex-col justify-between shadow-md">
          <div className="flex items-start justify-between">
            <span className="font-mono text-[9px] sm:text-[10px] text-[#94a3b8] uppercase font-bold">
              Punto Crítico
            </span>
            <div className="p-1.5 rounded-lg bg-[#283044] text-[#dae2fd]">
              <MapPin className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="font-['Chivo'] font-black text-lg sm:text-xl text-[#dae2fd] uppercase truncate leading-tight">
              {criticalZone.zone}
            </div>
            <div className="font-mono text-[9px] text-[#f59e0b] font-bold mt-0.5 uppercase truncate">
              Torre 2 · {criticalZone.count} casos
            </div>
          </div>
        </div>
      </section>

      {/* Supervisor Performance & Usage Stats (localStorage tracking) */}
      <UsageStatsCard />

      {/* Main Responsive Grid: 1 col on mobile/tablet, 2 cols on Desktop (Distribution sidebar + Feed) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-start">
        {/* Left Column: Risk Distribution & Fast Action (4 cols on lg) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          {/* 3. Distribución por Tipo (Dynamic Bar Chart) */}
          <section className="bg-[#131b2e] border border-[#222a3d] rounded-2xl p-4 sm:p-5 flex flex-col gap-3 shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[#f59e0b]" />
                <h3 className="font-['Chivo'] font-bold text-xs sm:text-sm text-[#dae2fd] uppercase tracking-wide">
                  Distribución de Riesgos
                </h3>
              </div>
              <span className="font-mono text-[9px] text-[#94a3b8] uppercase">
                Monitoreo Live
              </span>
            </div>

            <div className="flex flex-col gap-2.5">
              {distributionByType.map((item) => (
                <div key={item.tipo} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span className="font-sans text-xs text-[#dae2fd] font-medium flex items-center gap-1.5">
                      <HardHat className="w-3.5 h-3.5 text-[#f59e0b]" />
                      {item.tipo}
                    </span>
                    <span className="font-mono text-[10px] text-[#f59e0b] font-bold">
                      {item.percentage}% ({item.count})
                    </span>
                  </div>
                  <div className="h-2.5 w-full bg-[#060e20] rounded-full overflow-hidden flex border border-[#1e293b]">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        item.tipo === 'Falta de Casco'
                          ? 'bg-[#f59e0b]'
                          : item.tipo === 'Altura sin Arnés'
                          ? 'bg-[#ef4444]'
                          : item.tipo === 'Sin Chaleco'
                          ? 'bg-[#ffc174]'
                          : 'bg-[#64748b]'
                      }`}
                      style={{ width: `${Math.max(item.percentage, item.count > 0 ? 8 : 0)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Sticky "Nuevo Reporte Rápido" Banner */}
          <section>
            <button
              type="button"
              onClick={() => setActiveTab('reportar')}
              className="w-full min-h-14 rounded-2xl bg-[#1e293b] hover:bg-[#283548] text-[#dae2fd] flex items-center justify-between px-4 py-3 shadow-lg active:scale-98 transition-all border border-[#334155]"
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-[#f59e0b] text-[#2a1700] font-bold shrink-0 shadow-md">
                  <PlusCircle className="w-5 h-5" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="font-['Chivo'] font-bold text-xs uppercase text-[#dae2fd]">
                    Nuevo Reporte Rápido
                  </span>
                  <span className="font-mono text-[9px] text-[#94a3b8] uppercase">
                    Captura con cámara o dictado de voz
                  </span>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-[#f59e0b]" />
            </button>
          </section>
        </div>

        {/* Right Column: Feed de Incidencias en Tiempo Real (8 cols on lg) */}
        <div className="lg:col-span-8 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-[#f59e0b]" />
              <h3 className="font-['Chivo'] font-bold text-xs sm:text-sm text-[#dae2fd] uppercase tracking-wide">
                Feed de Incidencias
              </h3>
            </div>
            <span className="font-mono text-[9px] text-[#f59e0b] font-bold uppercase">
              Mostrando {filteredCases.length} de {totalRisks} casos
            </span>
          </div>

          {/* Empty State when no cases match search or filter */}
          {filteredCases.length === 0 ? (
            <div className="bg-[#131b2e] border border-[#222a3d] rounded-2xl p-8 flex flex-col items-center justify-center text-center gap-3 shadow-md">
              <div className="w-12 h-12 rounded-2xl bg-[#1e293b] flex items-center justify-center text-[#94a3b8] border border-[#334155]">
                <Search className="w-6 h-6 text-[#f59e0b]" />
              </div>
              <div className="flex flex-col">
                <h4 className="font-['Chivo'] font-bold text-sm text-[#dae2fd] uppercase">
                  No se encontraron incidencias
                </h4>
                <p className="font-sans text-xs text-[#94a3b8] mt-1 max-w-xs mx-auto">
                  No hay casos que coincidan con los criterios de búsqueda o filtros seleccionados.
                </p>
              </div>
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 rounded-xl bg-[#f59e0b] text-[#2a1700] font-['Chivo'] font-bold text-xs uppercase active:scale-95 transition-all shadow"
              >
                Restablecer Filtros
              </button>
            </div>
          ) : (
            filteredCases.map((item) => {
              const isOpen = item.estado === 'Abierto';
              const isInProcess = item.estado === 'En Proceso';
              const isClosed = item.estado === 'Cerrado';

              const coords = item.coordenadas || {
                lat: -12.096841,
                lng: -77.035219,
                accuracy: 3.5,
              };

              return (
                <div
                  key={item.id}
                  className={`bg-[#131b2e] border rounded-2xl p-3.5 sm:p-4 flex flex-col gap-3 shadow-md relative overflow-hidden transition-all ${
                    isOpen
                      ? 'border-[#ef4444]/60'
                      : isInProcess
                      ? 'border-[#f59e0b]/50'
                      : 'border-[#10b981]/40 opacity-95'
                  }`}
                >
                  {/* Left Color Stripe */}
                  <div
                    className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                      isOpen ? 'bg-[#ef4444]' : isInProcess ? 'bg-[#f59e0b]' : 'bg-[#10b981]'
                    }`}
                  />

                  {/* Header: ID, Title & Status */}
                  <div className="flex items-start justify-between gap-2 pl-2">
                    <div className="flex flex-col">
                      <span className="font-mono text-[9px] text-[#f59e0b] font-bold uppercase tracking-wider">
                        CASO #{item.id}
                      </span>
                      <h4 className="font-['Chivo'] font-bold text-xs sm:text-sm text-[#dae2fd] uppercase mt-0.5">
                        {item.tipo} en {item.ubicacion.split('-')[0].trim()}
                      </h4>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded font-mono text-[9px] uppercase font-bold shrink-0 flex items-center gap-1 ${
                        isOpen
                          ? 'bg-[#93000a] text-[#ffdad6] animate-pulse border border-[#ef4444]/40'
                          : isInProcess
                          ? 'bg-[#f59e0b]/20 text-[#ffc174] border border-[#f59e0b]/40'
                          : 'bg-[#064e3b] text-[#6ffbbe] border border-[#10b981]/40'
                      }`}
                    >
                      {isClosed && <CheckCircle2 className="w-2.5 h-2.5" />}
                      {item.estado} {item.tiempoAbierto ? `· ${item.tiempoAbierto}` : ''}
                    </span>
                  </div>

                  {/* Photo & Metadata Layout */}
                  <div className="flex gap-3 pl-2 items-center">
                    <div
                      onClick={() => openCaseDetail(item)}
                      className="w-18 h-18 sm:w-20 sm:h-20 rounded-xl overflow-hidden shrink-0 bg-[#060e20] relative border border-[#222a3d] cursor-pointer hover:opacity-90 transition-opacity"
                      title="Click para ver detalle completo"
                    >
                      <img
                        src={isClosed && item.fotoSolucionUrl ? item.fotoSolucionUrl : item.fotoUrl}
                        alt={item.tipo}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute bottom-0.5 right-0.5 bg-[#060e20]/90 text-[#dae2fd] font-mono text-[8px] px-1 rounded uppercase">
                        {item.detectadoPor === 'Cámara IA' ? 'CAM' : 'MANUAL'}
                      </span>
                    </div>

                    <div className="flex flex-col gap-1 min-w-0 flex-1">
                      <div className="flex items-center gap-1 text-[#94a3b8] font-sans text-xs truncate">
                        <span className="font-semibold text-[#dae2fd] truncate">
                          {item.responsable}
                        </span>
                      </div>
                      <p className="font-sans text-[11px] sm:text-xs text-[#94a3b8] line-clamp-2 leading-tight">
                        {item.descripcion}
                      </p>
                      <div className="flex items-center gap-2 text-[9px] font-mono text-[#64748b]">
                        <span>Urgencia: <strong className={item.urgencia === 'Alto' ? 'text-[#ef4444]' : 'text-[#f59e0b]'}>{item.urgencia}</strong></span>
                        <span>•</span>
                        <span>{item.frente}</span>
                      </div>
                    </div>
                  </div>

                  {/* GPS Coordinates Bar & Quick Detail Trigger */}
                  <div className="pl-2 pt-1 pb-0.5 flex items-center justify-between gap-2 border-t border-[#1e293b]/70 font-mono text-[10px]">
                    <div className="flex items-center gap-1.5 text-[#94a3b8] min-w-0">
                      <MapPin className="w-3.5 h-3.5 text-[#10b981] shrink-0" />
                      <span className="text-[#dae2fd] font-semibold truncate">
                        GPS: {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
                      </span>
                      <span className="text-[#10b981] text-[9px] bg-[#10b981]/15 px-1.5 py-0.2 rounded font-bold shrink-0">
                        ±{coords.accuracy || 3.5}m
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => openCaseDetail(item)}
                      className="px-2 py-1 rounded-lg bg-[#1e293b] hover:bg-[#283548] text-[#f59e0b] hover:text-[#ffc174] border border-[#334155] text-[9px] uppercase font-bold flex items-center gap-1 transition-all shrink-0 active:scale-95"
                    >
                      <span>Ver Detalles</span>
                    </button>
                  </div>

                  {/* Actions according to status */}
                  <div className="pl-2 pt-0.5 flex items-center gap-2">
                    {/* Open Case Action */}
                    {isOpen && (
                      <button
                        type="button"
                        onClick={() => navigateToCloseCase(item.id)}
                        className="w-full h-11 sm:h-12 flex items-center justify-between px-3.5 rounded-xl bg-[#f59e0b] hover:bg-[#d97706] text-[#2a1700] font-['Chivo'] font-black text-xs uppercase tracking-wider shadow-md active:scale-98 transition-all"
                      >
                        <span className="flex items-center gap-1.5">
                          <Shield className="w-4 h-4 fill-[#2a1700]" />
                          Resolver / Cerrar Riesgo
                        </span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    )}

                    {/* Closed Case Action: Export PDF Report */}
                    {isClosed && (
                      <button
                        type="button"
                        onClick={() => openPdfExport(item)}
                        className="w-full h-10 sm:h-11 flex items-center justify-center gap-2 px-3.5 rounded-xl bg-[#1e293b] hover:bg-[#283548] text-[#f59e0b] border border-[#f59e0b]/30 font-mono text-[10px] sm:text-xs font-bold uppercase transition-all shadow-sm active:scale-98"
                      >
                        <FileText className="w-4 h-4 text-[#f59e0b]" />
                        <span>Ver Acta & Exportar Reporte PDF</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Case Details Modal */}
      <CaseDetailModal
        isOpen={isDetailModalOpen}
        caseItem={selectedCaseForDetail}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedCaseForDetail(null);
        }}
        onNavigateToClose={(id) => navigateToCloseCase(id)}
        onExportPdf={(item) => openPdfExport(item)}
      />

      {/* PDF Export Modal */}
      <PdfExportModal
        isOpen={isPdfModalOpen}
        caseItem={selectedCaseForPdf}
        onClose={() => {
          setIsPdfModalOpen(false);
          setSelectedCaseForPdf(null);
        }}
      />
    </div>
  );
};
