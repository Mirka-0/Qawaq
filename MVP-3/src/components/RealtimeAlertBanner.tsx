import React from 'react';
import {
  AlertTriangle,
  Radio,
  X,
  ArrowRight,
  Video,
  Clock,
  HardHat,
  Volume2,
  ShieldAlert,
} from 'lucide-react';
import { useCases } from '../context/CaseContext';
import { useRole } from '../context/RoleContext';
import { NotificationService } from '../services/notificationService';

export const RealtimeAlertBanner: React.FC = () => {
  const {
    activePushAlert,
    dismissPushAlert,
    setActiveTab,
    setSelectedCaseForDetailId,
    setSelectedCaseForClosureId,
  } = useCases();
  const { isSupervisor } = useRole();

  if (!activePushAlert) return null;

  const item = activePushAlert.caseItem;

  const handleAttendImmediately = () => {
    dismissPushAlert();
    setSelectedCaseForDetailId(item.id);
    setSelectedCaseForClosureId(item.id);
    if (isSupervisor) {
      setActiveTab('mis-pendientes');
    } else {
      setActiveTab('cerrar-caso');
    }
  };

  const handleGoToCamera = () => {
    dismissPushAlert();
    setActiveTab('alerta-ia');
  };

  const handleReplayAlarm = () => {
    NotificationService.playSafetyTone('alarm');
  };

  return (
    <div
      id="realtime-push-alert-overlay"
      className="fixed inset-0 z-[100] bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-in fade-in zoom-in-95 duration-200"
    >
      <div className="w-full max-w-lg bg-[#111827] border-2 border-red-500 rounded-3xl shadow-[0_0_50px_rgba(239,68,68,0.4)] overflow-hidden flex flex-col text-[#f3f4f6]">
        {/* Solid Top Alert Bar */}
        <div className="bg-[#dc2626] px-4 py-2.5 flex items-center justify-between text-white shadow-sm border-b border-red-500/40">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-white animate-pulse" />
            <span className="font-label text-sm font-black uppercase tracking-wider">
              ALERTA PUSH · DETECCIÓN CRÍTICA EN TIEMPO REAL
            </span>
          </div>
          <button
            onClick={dismissPushAlert}
            className="p-1 rounded-lg bg-black/20 hover:bg-black/40 text-white transition-colors"
            title="Cerrar notificación"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 space-y-4">
          {/* Header Info */}
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 font-mono text-[10px] font-black border border-red-500/40 uppercase">
                  SLA CRÍTICO (30 MIN)
                </span>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold border border-amber-500/40 uppercase">
                  {item.camaraOrigen || 'CCTV IA'}
                </span>
              </div>
              <h2 className="font-['Chivo'] font-black text-lg sm:text-xl text-white uppercase tracking-tight leading-snug">
                {item.tipo}: {item.ubicacion}
              </h2>
            </div>

            <button
              type="button"
              onClick={handleReplayAlarm}
              className="shrink-0 p-2.5 rounded-2xl bg-red-500/15 hover:bg-red-500/30 text-red-400 border border-red-500/40 transition-all active:scale-95 flex flex-col items-center gap-1"
              title="Re-sonar sirena acústica"
            >
              <Volume2 className="w-4 h-4" />
              <span className="font-mono text-[8px] font-bold">SONAR</span>
            </button>
          </div>

          {/* Photo Preview with CCTV Overlay */}
          <div className="relative aspect-video rounded-2xl overflow-hidden border border-red-500/40 bg-black">
            <img
              src={item.fotoUrl}
              alt={item.tipo}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/70 backdrop-blur-sm border border-red-500/60 font-mono text-[9px] text-red-400 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
              CAPTURA IA // CONFIANZA {item.confianzaIA || 98.4}%
            </div>
            <div className="absolute bottom-2 left-2 right-2 px-2.5 py-1.5 rounded-xl bg-black/80 backdrop-blur-sm border border-white/10 font-mono text-[10px] text-[#e2e8f0] truncate">
              📍 {item.frente} · {item.ubicacion}
            </div>
          </div>

          {/* Technical Description */}
          <div className="bg-[#0b1326] border border-[#1e293b] p-3 rounded-2xl space-y-1.5">
            <div className="flex items-center justify-between text-[#94a3b8] font-mono text-[10px]">
              <span className="flex items-center gap-1">
                <HardHat className="w-3 h-3 text-[#f59e0b]" /> Asignado a:
              </span>
              <span className="text-white font-bold">{item.responsable}</span>
            </div>
            <p className="text-xs text-[#cbd5e1] font-mono leading-relaxed">
              {item.descripcion}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            <button
              type="button"
              onClick={handleAttendImmediately}
              className="w-full py-3 px-4 rounded-xl bg-[#dc2626] hover:bg-[#b91c1c] text-white font-label font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-red-900/40 transition-all active:scale-95"
            >
              <span>Atender Inmediatamente</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleGoToCamera}
                className="flex-1 py-3 px-3 rounded-xl bg-[#1e293b] hover:bg-[#283548] text-[#94a3b8] hover:text-white font-label text-xs uppercase font-bold border border-[#334155] flex items-center justify-center gap-1.5 transition-colors"
              >
                <Video className="w-3.5 h-3.5 text-[#f59e0b]" />
                <span>Ver CCTV</span>
              </button>

              <button
                type="button"
                onClick={dismissPushAlert}
                className="py-3 px-4 rounded-xl bg-transparent hover:bg-white/5 text-[#94a3b8] hover:text-white font-label text-xs uppercase font-bold border border-transparent transition-colors"
              >
                Descartar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
