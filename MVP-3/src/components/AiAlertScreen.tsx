import React, { useState, useEffect } from 'react';
import {
  Video,
  AlertTriangle,
  Send,
  RefreshCw,
  FileSpreadsheet,
  Cpu,
  MapPin,
  Eye,
  SlidersHorizontal,
  CheckCircle,
  Pause,
  Play,
  UserCheck,
  Clock,
  HardHat,
} from 'lucide-react';
import { DETECTION_SCENARIOS, SUPERVISOR_LIST } from '../constants';
import { useCases } from '../context/CaseContext';
import { useUsageStats } from '../hooks/useUsageStats';
import { PriorityLevel } from '../types';

export const AiAlertScreen: React.FC = () => {
  const { addCase, showToast, setActiveTab, cases, triggerRealtimeCriticalAlert } = useCases();
  const { logInteraction } = useUsageStats();

  const [currentScenarioIndex, setCurrentScenarioIndex] = useState<number>(0);
  const [hudEnabled, setHudEnabled] = useState<boolean>(true);
  const [alertSent, setAlertSent] = useState<boolean>(false);
  const [isAutoPolling, setIsAutoPolling] = useState<boolean>(true);
  const pollingIntervalSeconds = 8;
  const [countdown, setCountdown] = useState<number>(pollingIntervalSeconds);

  // Priority & Assignee selectors for creating the case from AI
  const scenario = DETECTION_SCENARIOS[currentScenarioIndex];
  const [selectedPriority, setSelectedPriority] = useState<PriorityLevel>(scenario.prioridad);
  const [selectedSupervisorId, setSelectedSupervisorId] = useState<string>(SUPERVISOR_LIST[0].id);

  // Keep priority in sync when cycling scenarios
  useEffect(() => {
    setSelectedPriority(scenario.prioridad);
  }, [scenario.code, scenario.prioridad]);

  useEffect(() => {
    setCountdown(pollingIntervalSeconds);
  }, [pollingIntervalSeconds]);

  useEffect(() => {
    if (!isAutoPolling) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setCurrentScenarioIndex((idx) => (idx + 1) % DETECTION_SCENARIOS.length);
          setAlertSent(false);
          return pollingIntervalSeconds;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isAutoPolling, pollingIntervalSeconds]);

  const handleCycleScenario = () => {
    setAlertSent(false);
    setCurrentScenarioIndex((prev) => (prev + 1) % DETECTION_SCENARIOS.length);
    setCountdown(pollingIntervalSeconds);
  };

  const handleCreateCaseFromAi = () => {
    const isUnassigned = selectedSupervisorId === 'unassigned';
    const chosenSup = isUnassigned
      ? null
      : SUPERVISOR_LIST.find((s) => s.id === selectedSupervisorId) || null;

    const newCase = addCase({
      id: scenario.code,
      tipo: scenario.tipo,
      ubicacion: scenario.ubicacion,
      frente: scenario.frente,
      urgencia: scenario.urgencia,
      prioridad: selectedPriority,
      asignadoA: chosenSup ? { nombre: chosenSup.nombre, rol: chosenSup.rol } : null,
      detectadoPor: 'Cámara IA',
      responsable: chosenSup ? chosenSup.nombre : 'Sin Asignar (Pendiente SSOMA)',
      fotoUrl: scenario.fotoUrl,
      descripcion: scenario.descripcion,
      confianzaIA: scenario.confianza,
      camaraOrigen: scenario.camara,
      coordenadas: {
        lat: -12.096841,
        lng: -77.035219,
        accuracy: 3.2,
        altitude: 104.2,
        timestamp: Date.now(),
        origen: 'CALIBRADO_OBRA',
      },
    });

    setAlertSent(true);
    logInteraction(
      'alerta',
      `Alerta de riesgo #${newCase.id} procesada: ${scenario.tipo} (${newCase.estado})`
    );
    showToast(
      isUnassigned
        ? `Caso #${newCase.id} creado como "Abierto" (requiere asignación)`
        : `Caso #${newCase.id} asignado a ${chosenSup?.nombre} (${selectedPriority})`
    );
  };

  const isAlreadyOpen = cases.some((c) => c.id === scenario.code && c.estado !== 'Cerrado');

  return (
    <div className="flex flex-col w-full px-3 sm:px-6 lg:px-8 pt-3 pb-24 gap-4 max-w-md sm:max-w-2xl md:max-w-4xl lg:max-w-5xl mx-auto animate-fade-in">
      {/* CCTV STREAM & AUTO-SCAN CONTROLLER */}
      <section className="p-3 rounded-2xl border border-[#222a3d] bg-[#131b2e] text-[#dae2fd] shadow-md">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#f59e0b]/20 text-[#f59e0b] border border-[#f59e0b]/40 flex items-center justify-center font-bold">
              <Cpu className="w-4 h-4" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-['Chivo'] font-bold text-xs uppercase tracking-wide text-white">
                  Red Neuronal Vision-Safety (CCTV)
                </span>
                <span className="font-mono text-[9px] px-1.5 py-0.2 rounded font-bold uppercase bg-[#10b981]/20 text-[#34d399] border border-[#10b981]/40">
                  Activo · 24 FPS
                </span>
              </div>
              <p className="font-mono text-[9px] text-[#94a3b8] mt-0.5">
                Escaneo y detección perimétrica de condiciones subestándar y EPP en frentes activos.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <button
              type="button"
              onClick={() => setIsAutoPolling(!isAutoPolling)}
              className={`px-2.5 py-1 rounded-lg font-mono text-[9px] uppercase font-bold border transition-all active:scale-95 flex items-center gap-1 ${
                isAutoPolling
                  ? 'bg-[#1e293b] hover:bg-[#283548] text-[#dae2fd] border-[#334155]'
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              }`}
            >
              {isAutoPolling ? (
                <>
                  <Pause className="w-3 h-3 text-amber-400" />
                  <span>Auto-Ciclo: ON</span>
                </>
              ) : (
                <>
                  <Play className="w-3 h-3 text-emerald-400" />
                  <span>Auto-Ciclo: Pausado</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="mt-2.5 flex items-center justify-between gap-3 text-[9px] font-mono text-[#94a3b8]">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="truncate">
              Próximo escaneo en: <strong className="text-[#f59e0b] font-bold">{countdown}s</strong>
            </span>
          </div>

          <div className="flex-1 max-w-[140px] h-1.5 bg-[#0b1326] rounded-full overflow-hidden border border-[#1e293b]">
            <div
              className="h-full bg-[#f59e0b] transition-all duration-1000 ease-linear"
              style={{
                width: `${((pollingIntervalSeconds - countdown) / pollingIntervalSeconds) * 100}%`,
              }}
            />
          </div>
        </div>
      </section>

      {/* Camera Status Bar */}
      <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-[#131b2e] border border-[#222a3d] shadow-sm">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-[#222a3d] flex items-center justify-center text-[#ffb95f] shrink-0">
            <Video className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-['Chivo'] font-bold text-xs text-[#dae2fd] truncate">
                {scenario.camara.split('·')[0].split('//')[0].trim()}
              </span>
              <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-[#93000a] text-[#ffdad6] font-bold">
                #{scenario.code}
              </span>
              <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-[#2d3449] text-[#ffb95f]">
                {scenario.ubicacion.split('-')[0].trim()}
              </span>
            </div>
            <p className="font-mono text-[9px] text-[#94a3b8] truncate">{scenario.frente}</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-[#93000a]/30 text-[#ffb4ab] shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-[#ef4444]" />
          <span className="font-mono text-[9px] font-bold tracking-wider">EN VIVO</span>
        </div>
      </div>

      {/* 5 CCTV CAMERAS SELECTOR GRID */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[#94a3b8] font-mono text-[10px]">
          <span className="flex items-center gap-1.5 font-bold uppercase text-[#dae2fd]">
            <Video className="w-3.5 h-3.5 text-[#f59e0b]" /> 5 Canales CCTV de Campo
          </span>
          <span>Click para inspeccionar cámara</span>
        </div>
        <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
          {DETECTION_SCENARIOS.map((scen, idx) => (
            <button
              key={scen.id}
              type="button"
              onClick={() => {
                setCurrentScenarioIndex(idx);
                setAlertSent(false);
                setCountdown(pollingIntervalSeconds);
              }}
              className={`relative aspect-video rounded-xl overflow-hidden border transition-all ${
                currentScenarioIndex === idx
                  ? 'border-[#f59e0b] ring-2 ring-[#f59e0b]/50 shadow-md shadow-[#f59e0b]/20 scale-[1.02]'
                  : 'border-[#1e293b] opacity-60 hover:opacity-100 hover:border-[#334155]'
              }`}
            >
              <img
                src={scen.fotoUrl}
                alt={scen.camara}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-1">
                <span className="font-mono text-[8px] font-black text-white truncate">
                  CAM 0{idx + 1}
                </span>
              </div>
              {currentScenarioIndex === idx && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#ef4444]" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* CCTV Viewfinder with Computer Vision HUD */}
      <div className="relative w-full rounded-2xl overflow-hidden bg-[#060e20] border border-[#222a3d] shadow-2xl group">
        <img
          src={scenario.fotoUrl}
          alt="Transmisión CCTV obra con detección de seguridad"
          className="w-full aspect-video object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#060e20]/90 via-transparent to-[#060e20]/40 pointer-events-none" />

        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 pointer-events-none">
          <span className="px-2 py-0.5 rounded bg-[#060e20]/80 backdrop-blur-md font-mono text-[9px] text-[#dae2fd]">
            1080p · 24 FPS
          </span>
          <span className="px-2 py-0.5 rounded bg-[#060e20]/80 backdrop-blur-md font-mono text-[9px] text-[#10b981] flex items-center gap-1">
            <Cpu className="w-2.5 h-2.5" /> VISION-SAFETY
          </span>
        </div>

        <div className="absolute top-2.5 right-2.5">
          <button
            onClick={() => setHudEnabled(!hudEnabled)}
            className="px-2 py-0.5 rounded bg-[#060e20]/80 hover:bg-[#1e293b] backdrop-blur-md text-[#94a3b8] hover:text-[#dae2fd] font-mono text-[9px] flex items-center gap-1 transition-all active:scale-95"
          >
            <SlidersHorizontal className="w-2.5 h-2.5" />
            {hudEnabled ? 'HUD ON' : 'HUD OFF'}
          </button>
        </div>

        {hudEnabled && (
          <div
            className="absolute transition-all duration-500 ease-out cursor-pointer"
            style={{
              top: scenario.box.top,
              left: scenario.box.left,
              width: scenario.box.width,
              height: scenario.box.height,
            }}
          >
            <div className="absolute inset-0 rounded border-2 border-[#ef4444] bg-[#ef4444]/15 shadow-[0_0_20px_rgba(239,68,68,0.8)]" />
            <div className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap bg-[#ef4444] text-white px-2 py-0.5 rounded shadow-lg flex items-center gap-1 font-mono text-[9px] font-bold uppercase tracking-tight">
              <AlertTriangle className="w-2.5 h-2.5" />
              <span>{scenario.box.label.replace('IA', '').replace('AI', '')}</span>
            </div>
          </div>
        )}

        <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between text-[#94a3b8] font-mono text-[9px]">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b]" />
            <span>ESCANEANDO CUADRILLA ACTIVA</span>
          </div>
          <span className="text-[#dae2fd]">CERTEZA {scenario.confianza}%</span>
        </div>
      </div>

      {/* Detail & Assignment Controls for New Incident */}
      <div className="rounded-2xl bg-[#131b2e] p-4 border border-[#222a3d] shadow-xl space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="px-2 py-0.5 rounded bg-[#93000a] text-[#ffdad6] font-mono text-[9px] font-bold uppercase tracking-wider flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                {scenario.urgencia === 'Alto' ? 'RIESGO ALTO / PARADA' : 'RIESGO MODERADO'}
              </span>
            </div>
            <h2 className="font-['Chivo'] font-bold text-sm text-[#dae2fd] mt-1 leading-snug">
              {scenario.titulo}
            </h2>
          </div>
          <span className="font-mono text-[10px] text-[#94a3b8] shrink-0">En vivo</span>
        </div>

        <p className="font-sans text-xs text-[#94a3b8] leading-relaxed">
          {scenario.descripcion}
        </p>

        {/* Dynamic Priority & SLA Selector */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#1e293b]">
          <div>
            <label className="block text-[10px] font-mono uppercase text-[#94a3b8] mb-1 font-bold flex items-center gap-1">
              <Clock className="w-3 h-3 text-[#f59e0b]" />
              Prioridad & Plazo SLA:
            </label>
            <div className="grid grid-cols-3 gap-1">
              {(['Crítico', 'Alto', 'Medio'] as PriorityLevel[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setSelectedPriority(p)}
                  className={`py-1.5 px-1 rounded-lg font-mono text-[10px] uppercase font-bold border transition-all ${
                    selectedPriority === p
                      ? p === 'Crítico'
                        ? 'bg-red-500 text-white border-red-300 shadow-md'
                        : p === 'Alto'
                        ? 'bg-[#f59e0b] text-[#2a1700] border-[#ffddb8] shadow-md'
                        : 'bg-cyan-500 text-[#022c22] border-cyan-300 shadow-md'
                      : 'bg-[#0b1326] text-[#94a3b8] border-[#1e293b] hover:text-[#dae2fd]'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
            <span className="text-[9px] font-mono text-[#64748b] block mt-1">
              {selectedPriority === 'Crítico'
                ? 'Objetivo Inmediato · SLA 30 min'
                : selectedPriority === 'Alto'
                ? 'Objetivo Urgente · SLA 2 horas'
                : 'Objetivo Estándar · SLA 24 horas'}
            </span>
          </div>

          {/* Supervisor / Capataz to assign */}
          <div>
            <label className="block text-[10px] font-mono uppercase text-[#94a3b8] mb-1 font-bold flex items-center gap-1">
              <HardHat className="w-3 h-3 text-[#10b981]" />
              Asignar Responsable en Campo:
            </label>
            <select
              value={selectedSupervisorId}
              onChange={(e) => setSelectedSupervisorId(e.target.value)}
              className="w-full bg-[#0b1326] border border-[#1e293b] rounded-xl px-2.5 py-1.5 text-xs text-[#dae2fd] font-mono focus:border-[#f59e0b] outline-none"
            >
              <option value="unassigned">Sin Asignar (Dejar Abierto para SSOMA)</option>
              {SUPERVISOR_LIST.map((sup) => (
                <option key={sup.id} value={sup.id}>
                  {sup.nombre} ({sup.rol})
                </option>
              ))}
            </select>
            <span className="text-[9px] font-mono text-[#64748b] block mt-1">
              {selectedSupervisorId === 'unassigned'
                ? 'Nacerá en estado "Abierto"'
                : 'Nacerá directo en estado "Asignado"'}
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-2 pt-1">
        {/* Realtime Critical Alert Simulator Button - Solid color */}
        <button
          type="button"
          onClick={() => triggerRealtimeCriticalAlert(currentScenarioIndex)}
          className="w-full py-3 px-4 rounded-xl bg-[#dc2626] hover:bg-[#b91c1c] text-white font-label font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-red-900/40 transition-all active:scale-[0.98] border border-red-400/40"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
          <span>Simular Detección IA en Tiempo Real (Alerta Sonora + Push)</span>
        </button>

        <button
          onClick={handleCreateCaseFromAi}
          disabled={alertSent || isAlreadyOpen}
          className={`w-full h-13 py-3.5 px-4 rounded-xl font-label font-black text-sm tracking-wider uppercase flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[0.98] ${
            alertSent || isAlreadyOpen
              ? 'bg-[#1e293b] text-[#94a3b8] border border-[#334155]'
              : 'bg-[#f59e0b] hover:bg-[#d97706] text-[#1c1002] shadow-[#f59e0b]/20 font-black'
          }`}
        >
          {alertSent || isAlreadyOpen ? (
            <>
              <CheckCircle className="w-5 h-5 text-[#10b981]" />
              <span>Caso #{scenario.code} en Proceso en el Dashboard</span>
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              <span>
                {selectedSupervisorId === 'unassigned'
                  ? 'Registrar Alerta Abierta (SSOMA)'
                  : 'Despachar Caso Asignado a Campo'}
              </span>
            </>
          )}
        </button>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleCycleScenario}
            className="h-11 rounded-xl bg-[#1e293b] hover:bg-[#283548] text-[#dae2fd] font-mono text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-all border border-[#334155] active:scale-95"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#f59e0b]" />
            <span className="truncate">Siguiente Cámara</span>
          </button>

          <button
            onClick={() => setActiveTab('dashboard')}
            className="h-11 rounded-xl bg-[#f59e0b] hover:bg-[#d97706] text-[#2a1700] font-['Chivo'] font-bold text-[11px] uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md shadow-[#f59e0b]/20 active:scale-95"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span className="truncate">Ver Dashboard →</span>
          </button>
        </div>
      </div>
    </div>
  );
};
