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
  Battery,
  BatteryCharging,
  BatteryLow,
  BatteryWarning,
  Zap,
  ZapOff,
  Pause,
  Play,
  Gauge,
  Sparkles,
} from 'lucide-react';
import { DETECTION_SCENARIOS } from '../constants';
import { useCases } from '../context/CaseContext';
import { useUsageStats } from '../hooks/useUsageStats';
import { usePowerSaverContext } from '../context/PowerSaverContext';

export const AiAlertScreen: React.FC = () => {
  const { addCase, showToast, setActiveTab, cases } = useCases();
  const { logInteraction } = useUsageStats();
  const {
    isPowerSaver,
    batteryLevel,
    isCharging,
    pollingIntervalSeconds,
    isAutoTriggered,
    togglePowerSaver,
    simulateLowBattery,
  } = usePowerSaverContext();

  const [currentScenarioIndex, setCurrentScenarioIndex] = useState<number>(0);
  const [hudEnabled, setHudEnabled] = useState<boolean>(true);
  const [alertSent, setAlertSent] = useState<boolean>(false);
  const [isAutoPolling, setIsAutoPolling] = useState<boolean>(true);
  const [countdown, setCountdown] = useState<number>(pollingIntervalSeconds);

  const scenario = DETECTION_SCENARIOS[currentScenarioIndex];

  // Sync countdown when power saver interval changes
  useEffect(() => {
    setCountdown(pollingIntervalSeconds);
  }, [pollingIntervalSeconds]);

  // Automated detection polling loop throttled by battery/power saver mode
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

  // Cycle scenarios manually
  const handleCycleScenario = () => {
    setAlertSent(false);
    setCurrentScenarioIndex((prev) => (prev + 1) % DETECTION_SCENARIOS.length);
    setCountdown(pollingIntervalSeconds);
  };

  // Notificar al Responsable
  const handleNotifySupervisor = () => {
    const newCase = addCase({
      id: scenario.code,
      tipo: scenario.tipo,
      ubicacion: scenario.ubicacion,
      frente: scenario.frente,
      urgencia: scenario.urgencia,
      estado: 'Abierto',
      detectadoPor: 'Cámara en Obra',
      responsable: 'Ing. Carlos Mendoza',
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
      `Alerta de riesgo #${newCase.id} procesada: ${scenario.tipo} (${scenario.confianza}% confianza)`
    );
    showToast(`Alerta enviada a Ing. Carlos Mendoza (Caso #${newCase.id})`);
  };

  // Check if current scenario code is currently open in cases
  const isAlreadyOpen = cases.some((c) => c.id === scenario.code && c.estado === 'Abierto');

  return (
    <div className="flex flex-col w-full px-3 sm:px-6 lg:px-8 pt-3 pb-24 gap-4 max-w-md sm:max-w-2xl md:max-w-4xl lg:max-w-5xl mx-auto">
      {/* POWER SAVER / BATERÍA TELEMETRY & POLLING CONTROL BANNER */}
      <section
        className={`p-3 rounded-2xl border transition-all shadow-md ${
          isPowerSaver
            ? 'bg-[#1a1708] border-[#f59e0b]/50 text-[#ffddb8]'
            : 'bg-[#131b2e] border-[#222a3d] text-[#dae2fd]'
        }`}
      >
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold ${
                isPowerSaver
                  ? 'bg-[#f59e0b] text-[#2a1700] animate-pulse'
                  : 'bg-[#1e293b] text-[#34d399]'
              }`}
            >
              {isCharging ? (
                <BatteryCharging className="w-4 h-4" />
              ) : isPowerSaver ? (
                <ZapOff className="w-4 h-4" />
              ) : (
                <Battery className="w-4 h-4" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-['Chivo'] font-bold text-xs uppercase tracking-wide">
                  {isPowerSaver ? 'Modo Ahorro de Energía Activo' : 'Rendimiento Estándar'}
                </span>
                <span
                  className={`font-mono text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                    isPowerSaver
                      ? 'bg-[#f59e0b]/20 text-[#ffb95f] border border-[#f59e0b]/40'
                      : 'bg-[#10b981]/20 text-[#34d399] border border-[#10b981]/40'
                  }`}
                >
                  {isPowerSaver ? 'Polling 28s' : 'Polling 8s'}
                </span>
              </div>
              <p className="font-mono text-[9px] text-[#94a3b8] mt-0.5">
                {isPowerSaver
                  ? 'Frecuencia de detección reducida para garantizar batería durante todo el turno.'
                  : 'Monitoreo activo de cámaras con análisis en alta frecuencia.'}
              </p>
            </div>
          </div>

          {/* Battery level & toggle controls */}
          <div className="flex items-center gap-2 ml-auto">
            {batteryLevel !== null && (
              <div className="flex items-center gap-1 font-mono text-[10px] px-2 py-1 rounded-lg bg-[#0b1326] border border-[#1e293b]">
                <span className={batteryLevel <= 20 ? 'text-[#ef4444] font-bold' : 'text-[#34d399]'}>
                  {batteryLevel}%
                </span>
                {isCharging && <span className="text-[#f59e0b]">⚡</span>}
              </div>
            )}

            <button
              type="button"
              onClick={togglePowerSaver}
              className={`px-2.5 py-1 rounded-lg font-mono text-[9px] uppercase font-bold border transition-all active:scale-95 ${
                isPowerSaver
                  ? 'bg-[#f59e0b] text-[#2a1700] border-[#ffddb8] shadow-sm'
                  : 'bg-[#1e293b] hover:bg-[#283548] text-[#94a3b8] hover:text-[#dae2fd] border-[#334155]'
              }`}
            >
              {isPowerSaver ? 'Ahorro: ON' : 'Ahorro: OFF'}
            </button>

            {/* Test button to simulate low battery */}
            <button
              type="button"
              onClick={simulateLowBattery}
              className="px-2 py-1 rounded-lg bg-[#0b1326] hover:bg-[#1a2337] border border-[#1e293b] text-[#94a3b8] hover:text-[#dae2fd] font-mono text-[8px] uppercase transition-colors"
              title="Simular batería baja (14%) para comprobar cambio automático de polling"
            >
              Simular 14%
            </button>
          </div>
        </div>

        {/* Polling countdown progress bar */}
        <div className="mt-2.5 flex items-center justify-between gap-3 text-[9px] font-mono text-[#94a3b8]">
          <div className="flex items-center gap-1.5 min-w-0">
            <button
              type="button"
              onClick={() => setIsAutoPolling(!isAutoPolling)}
              className="p-1 rounded hover:bg-[#1e293b] text-[#94a3b8] hover:text-[#dae2fd] transition-colors"
              title={isAutoPolling ? 'Pausar ciclo de cámaras' : 'Reanudar ciclo de cámaras'}
            >
              {isAutoPolling ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 text-[#10b981]" />}
            </button>
            <span className="truncate">
              Próximo escaneo en: <strong className="text-[#f59e0b] font-bold">{countdown}s</strong>
            </span>
          </div>

          <div className="flex-1 max-w-[140px] h-1.5 bg-[#0b1326] rounded-full overflow-hidden border border-[#1e293b]">
            <div
              className={`h-full transition-all duration-1000 ease-linear ${
                isPowerSaver ? 'bg-[#f59e0b]' : 'bg-[#10b981]'
              }`}
              style={{
                width: `${((pollingIntervalSeconds - countdown) / pollingIntervalSeconds) * 100}%`,
              }}
            />
          </div>
        </div>
      </section>

      {/* Top camera status bar */}
      <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-[#131b2e] border border-[#222a3d] shadow-sm">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-[#222a3d] flex items-center justify-center text-[#ffb95f] shrink-0">
            <Video className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-['Chivo'] font-bold text-xs text-[#dae2fd] truncate">
                {scenario.camara.split('//')[0].trim()}
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
          <span className="w-1.5 h-1.5 rounded-full bg-[#ef4444] animate-pulse" />
          <span className="font-mono text-[9px] font-bold tracking-wider">EN VIVO</span>
        </div>
      </div>

      {/* Critical Alert Warning Bar */}
      <div className="p-2.5 rounded-xl bg-[#450a0a]/70 border border-[#ef4444]/40 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2 min-w-0">
          <AlertTriangle className="w-4 h-4 text-[#ef4444] shrink-0 animate-bounce" />
          <span className="font-mono text-[10px] text-[#fee2e2] font-bold uppercase tracking-tight truncate">
            ALERTA DE RIESGO: {scenario.titulo.split(':')[1]?.trim() || scenario.tipo}
          </span>
        </div>
        <span className="px-2 py-0.5 rounded bg-[#ef4444] text-white font-mono text-[9px] font-extrabold uppercase tracking-wider shrink-0">
          {scenario.urgencia === 'Alto' ? 'CRÍTICO' : 'RIESGO'}
        </span>
      </div>

      {/* CCTV Viewfinder with Computer Vision HUD & Bounding Boxes */}
      <div className="relative w-full rounded-2xl overflow-hidden bg-[#060e20] border border-[#222a3d] shadow-2xl group">
        <img
          src={scenario.fotoUrl}
          alt="Transmisión CCTV obra con detección de seguridad"
          className="w-full aspect-video object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#060e20]/90 via-transparent to-[#060e20]/40 pointer-events-none" />

        {/* Top HUD telemetry */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 pointer-events-none">
          <span className="px-2 py-0.5 rounded bg-[#060e20]/80 backdrop-blur-md font-mono text-[9px] text-[#dae2fd]">
            1080p · {isPowerSaver ? '12 FPS (Bajo consumo)' : '24 FPS'}
          </span>
          <span className="px-2 py-0.5 rounded bg-[#060e20]/80 backdrop-blur-md font-mono text-[9px] text-[#10b981] flex items-center gap-1">
            <Cpu className="w-2.5 h-2.5" /> VISION-SAFETY
          </span>
        </div>

        {/* Toggle HUD Button */}
        <div className="absolute top-2.5 right-2.5">
          <button
            onClick={() => setHudEnabled(!hudEnabled)}
            className="px-2 py-0.5 rounded bg-[#060e20]/80 hover:bg-[#1e293b] backdrop-blur-md text-[#94a3b8] hover:text-[#dae2fd] font-mono text-[9px] flex items-center gap-1 transition-all active:scale-95"
          >
            <SlidersHorizontal className="w-2.5 h-2.5" />
            {hudEnabled ? 'HUD ON' : 'HUD OFF'}
          </button>
        </div>

        {/* Main Detected Bounding Box */}
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
            {/* Glowing border box */}
            <div className="absolute inset-0 rounded border-2 border-[#ef4444] bg-[#ef4444]/15 shadow-[0_0_20px_rgba(239,68,68,0.8)] animate-pulse" />

            {/* Corner brackets */}
            <div className="absolute -top-1 -left-1 w-2 h-2 bg-[#ef4444]" />
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-[#ef4444]" />
            <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-[#ef4444]" />
            <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-[#ef4444]" />

            {/* Tag label above box */}
            <div className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap bg-[#ef4444] text-white px-2 py-0.5 rounded shadow-lg flex items-center gap-1 font-mono text-[9px] font-bold uppercase tracking-tight">
              <AlertTriangle className="w-2.5 h-2.5" />
              <span>{scenario.box.label.replace('IA', '').replace('AI', '')}</span>
            </div>
          </div>
        )}

        {/* Other workers with EPP verified (Compliant detections) */}
        {hudEnabled && (
          <>
            <div className="absolute top-[46%] left-[23%] w-[12%] h-[22%] pointer-events-none opacity-85">
              <div className="absolute inset-0 rounded border border-[#10b981]/70 bg-[#10b981]/10" />
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap bg-[#060e20]/90 text-[#34d399] px-1.5 py-0.2 rounded font-mono text-[8px] font-semibold">
                EPP OK · 99.1%
              </div>
            </div>
            <div className="absolute top-[45%] left-[59%] w-[11%] h-[23%] pointer-events-none opacity-85">
              <div className="absolute inset-0 rounded border border-[#10b981]/70 bg-[#10b981]/10" />
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap bg-[#060e20]/90 text-[#34d399] px-1.5 py-0.2 rounded font-mono text-[8px] font-semibold">
                EPP OK · 97.8%
              </div>
            </div>
          </>
        )}

        {/* Bottom CCTV telemetrics */}
        <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between text-[#94a3b8] font-mono text-[9px]">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b] animate-ping" />
            <span>MONITOREO: 8 OPERARIOS EN ZONA</span>
          </div>
          <span className="text-[#dae2fd]">CERTEZA {scenario.confianza}%</span>
        </div>
      </div>

      {/* Incident Detail Card */}
      <div className="rounded-2xl bg-[#131b2e] p-4 border border-[#222a3d] shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-[#ef4444]" />

        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="px-2 py-0.5 rounded bg-[#93000a] text-[#ffdad6] font-mono text-[9px] font-bold uppercase tracking-wider flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                {scenario.urgencia === 'Alto' ? 'RIESGO ALTO / PARADA' : 'RIESGO MODERADO'}
              </span>
            </div>
            <h2 className="font-['Chivo'] font-bold text-sm text-[#dae2fd] mt-1.5 leading-snug">
              {scenario.titulo}
            </h2>
          </div>
          <span className="font-mono text-[10px] text-[#94a3b8] shrink-0">Hace 30s</span>
        </div>

        <p className="font-sans text-xs text-[#94a3b8] mt-2 leading-relaxed">
          {scenario.descripcion}
        </p>

        {/* Telemetry metadata block */}
        <div className="mt-3 grid grid-cols-2 gap-2 p-2 rounded-xl bg-[#0b1326] border border-[#1e293b]">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#f59e0b] shrink-0" />
            <div className="min-w-0">
              <span className="font-mono text-[8px] text-[#94a3b8] uppercase block">
                Ubicación GPS
              </span>
              <span className="font-mono text-[10px] text-[#dae2fd] font-semibold truncate block">
                {scenario.ubicacion}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-[#10b981] shrink-0" />
            <div className="min-w-0">
              <span className="font-mono text-[8px] text-[#94a3b8] uppercase block">
                Certeza Algorítmica
              </span>
              <span className="font-mono text-[10px] text-[#10b981] font-bold truncate block">
                {scenario.confianza}% (Alta Confiabilidad)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Glove-Ready Action Buttons */}
      <div className="flex flex-col gap-2 pt-1">
        {/* Button 1: Notificar al Responsable */}
        <button
          onClick={handleNotifySupervisor}
          disabled={alertSent || isAlreadyOpen}
          className={`w-full h-13 py-3.5 px-4 rounded-xl font-['Chivo'] font-black text-sm tracking-wide uppercase flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[0.98] ${
            alertSent || isAlreadyOpen
              ? 'bg-[#1e293b] text-[#94a3b8] border border-[#334155]'
              : 'bg-[#ef4444] hover:bg-[#dc2626] text-white shadow-[#ef4444]/30'
          }`}
        >
          {alertSent || isAlreadyOpen ? (
            <>
              <CheckCircle className="w-5 h-5 text-[#10b981]" />
              <span>Alerta Despachada (#{scenario.code} en Dashboard)</span>
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              <span>Notificar al Responsable (Ing. Carlos Mendoza)</span>
            </>
          )}
        </button>

        {/* Secondary buttons */}
        <div className="grid grid-cols-2 gap-2">
          {/* Cycle detection scenario */}
          <button
            onClick={handleCycleScenario}
            className="h-11 rounded-xl bg-[#1e293b] hover:bg-[#283548] text-[#dae2fd] font-mono text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-all border border-[#334155] active:scale-95"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#f59e0b]" />
            <span className="truncate">Cambiar Cámara Manual</span>
          </button>

          {/* Go to Dashboard or Manual Report */}
          <button
            onClick={() => setActiveTab('dashboard')}
            className="h-11 rounded-xl bg-[#f59e0b] hover:bg-[#d97706] text-[#2a1700] font-['Chivo'] font-bold text-[11px] uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md shadow-[#f59e0b]/20 active:scale-95"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span className="truncate">Ver en Dashboard →</span>
          </button>
        </div>
      </div>

      {/* Info footer note */}
      <div className="p-3 rounded-xl bg-[#131b2e]/60 border border-[#1e293b] flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-[#1e293b] flex items-center justify-center shrink-0 text-[#f59e0b]">
          <Eye className="w-4 h-4" />
        </div>
        <p className="font-mono text-[9px] text-[#94a3b8] leading-relaxed">
          <strong className="text-[#f59e0b]">QAWAQ</strong> vigila los frentes activos de obra en
          paralelo. Cada evento queda registrado con coordenadas georreferenciadas y marca de tiempo.
        </p>
      </div>
    </div>
  );
};
