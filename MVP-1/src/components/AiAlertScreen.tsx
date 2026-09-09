import React, { useState } from 'react';
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
} from 'lucide-react';
import { DETECTION_SCENARIOS } from '../constants';
import { useCases } from '../context/CaseContext';

export const AiAlertScreen: React.FC = () => {
  const { addCase, showToast, setActiveTab, cases } = useCases();
  const [currentScenarioIndex, setCurrentScenarioIndex] = useState<number>(0);
  const [hudEnabled, setHudEnabled] = useState<boolean>(true);
  const [alertSent, setAlertSent] = useState<boolean>(false);

  const scenario = DETECTION_SCENARIOS[currentScenarioIndex];

  // Cycle scenarios
  const handleCycleScenario = () => {
    setAlertSent(false);
    setCurrentScenarioIndex((prev) => (prev + 1) % DETECTION_SCENARIOS.length);
  };

  // Notificar al Responsable
  const handleNotifySupervisor = () => {
    // Check if this case is already open
    const newCase = addCase({
      id: scenario.code,
      tipo: scenario.tipo,
      ubicacion: scenario.ubicacion,
      frente: scenario.frente,
      urgencia: scenario.urgencia,
      estado: 'Abierto',
      detectadoPor: 'Cámara IA',
      responsable: 'Ing. Carlos Mendoza',
      fotoUrl: scenario.fotoUrl,
      descripcion: scenario.descripcion,
      confianzaIA: scenario.confianza,
      camaraOrigen: scenario.camara,
    });

    setAlertSent(true);
    showToast(`Alerta enviada a Ing. Carlos Mendoza (Caso #${newCase.id})`);
  };

  // Check if current scenario code is currently open in cases
  const isAlreadyOpen = cases.some((c) => c.id === scenario.code && c.estado === 'Abierto');

  return (
    <div className="flex flex-col w-full px-3 sm:px-6 lg:px-8 pt-3 pb-24 gap-4 max-w-md sm:max-w-2xl md:max-w-4xl lg:max-w-5xl mx-auto">
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
            <p className="font-mono text-[9px] text-[#94a3b8] truncate">
              {scenario.frente}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-[#93000a]/30 text-[#ffb4ab] shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-[#ef4444] animate-pulse" />
          <span className="font-mono text-[9px] font-bold tracking-wider">
            EN VIVO
          </span>
        </div>
      </div>

      {/* Critical Alert Warning Bar */}
      <div className="p-2.5 rounded-xl bg-[#450a0a]/70 border border-[#ef4444]/40 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2 min-w-0">
          <AlertTriangle className="w-4 h-4 text-[#ef4444] shrink-0 animate-bounce" />
          <span className="font-mono text-[10px] text-[#fee2e2] font-bold uppercase tracking-tight truncate">
            ALERTA IA: {scenario.titulo.split(':')[1]?.trim() || scenario.tipo}
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
          alt="Transmisión CCTV obra con detección IA"
          className="w-full aspect-video object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#060e20]/90 via-transparent to-[#060e20]/40 pointer-events-none" />

        {/* Top HUD telemetry */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 pointer-events-none">
          <span className="px-2 py-0.5 rounded bg-[#060e20]/80 backdrop-blur-md font-mono text-[9px] text-[#dae2fd]">
            1080p · 24 FPS
          </span>
          <span className="px-2 py-0.5 rounded bg-[#060e20]/80 backdrop-blur-md font-mono text-[9px] text-[#10b981] flex items-center gap-1">
            <Cpu className="w-2.5 h-2.5" /> YOLOV8-SSOMA
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
              <span>{scenario.box.label}</span>
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
            <span>AI SCANNING: 8 OPERARIOS</span>
          </div>
          <span className="text-[#dae2fd]">CONF. {scenario.confianza}%</span>
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
          <span className="font-mono text-[10px] text-[#94a3b8] shrink-0">
            Hace 30s
          </span>
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
                Certeza IA
              </span>
              <span className="font-mono text-[10px] text-[#10b981] font-bold truncate block">
                {scenario.confianza}% (Confianza Alta)
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
            <span className="truncate">Simular Nueva Detección</span>
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
          <strong className="text-[#f59e0b]">QAWAQ AI</strong> vigila 12 feeds activos en paralelo.
          Cada evento queda registrado con hash de inmutabilidad para el libro de SSOMA.
        </p>
      </div>
    </div>
  );
};
