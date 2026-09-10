import React from 'react';
import { WifiOff, RefreshCw, CheckCircle2, Wifi } from 'lucide-react';
import { useCases } from '../context/CaseContext';

export const OfflineStatusBanner: React.FC = () => {
  const { isOnline, offlineQueueCount, syncOfflineQueueNow, toggleSimulatedOffline } = useCases();

  if (isOnline && offlineQueueCount === 0) {
    return null;
  }

  return (
    <div className="w-full bg-[#1e293b]/95 border-b border-[#334155] backdrop-blur-md px-3 sm:px-6 py-2 transition-all duration-300 shadow-md">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          {!isOnline ? (
            <div className="flex items-center gap-1.5 text-[#f59e0b]">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
              </span>
              <WifiOff className="w-4 h-4 shrink-0" />
              <span className="font-['Chivo'] font-bold uppercase tracking-wide">
                Modo Sin Conexión (Offline)
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-[#10b981]">
              <Wifi className="w-4 h-4 shrink-0" />
              <span className="font-['Chivo'] font-bold uppercase tracking-wide">
                Conectado · Sincronizando
              </span>
            </div>
          )}

          <span className="text-[#94a3b8] hidden sm:inline">
            {!isOnline
              ? 'Los reportes de campo se guardan automáticamente en caché segura local.'
              : `${offlineQueueCount} reporte(s) pendiente(s) de sincronización.`}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {offlineQueueCount > 0 && (
            <span className="px-2 py-0.5 rounded-full font-mono text-[10px] font-bold bg-[#f59e0b]/20 text-[#ffb95f] border border-[#f59e0b]/40">
              {offlineQueueCount} en cola
            </span>
          )}

          {isOnline ? (
            <button
              onClick={() => syncOfflineQueueNow()}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#10b981]/20 hover:bg-[#10b981]/30 text-[#10b981] border border-[#10b981]/40 font-mono text-[11px] font-bold transition-all active:scale-95"
            >
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Sincronizar</span>
            </button>
          ) : (
            <button
              onClick={() => toggleSimulatedOffline(false)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#131b2e] hover:bg-[#1e293b] text-[#dae2fd] border border-[#334155] font-mono text-[11px] font-semibold transition-all active:scale-95"
              title="Restablecer conexión para sincronizar"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-[#10b981]" />
              <span>Reconectar</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
