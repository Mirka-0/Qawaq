import React from 'react';
import { RotateCcw, Bell, Shield, Camera, PlusCircle, LayoutDashboard, ShieldCheck, Sun, Moon, Battery, BatteryCharging, ZapOff } from 'lucide-react';
import { ASSETS } from '../constants';
import { useCases } from '../context/CaseContext';
import { useTheme } from '../context/ThemeContext';
import { useUsageStats } from '../hooks/useUsageStats';
import { usePowerSaverContext } from '../context/PowerSaverContext';
import { NotificationService } from '../services/notificationService';
import { TabType } from '../types';

export const Header: React.FC = () => {
  const { activeTab, setActiveTab, resetDemoData, setIsNotificationModalOpen, cases } = useCases();
  const { theme, toggleTheme, isLightMode } = useTheme();
  const { logInteraction } = useUsageStats();
  const { isPowerSaver, batteryLevel, isCharging, togglePowerSaver } = usePowerSaverContext();
  const perm = NotificationService.getPermission();
  const openCasesCount = cases.filter((c) => c.estado === 'Abierto').length;

  const handleToggleTheme = () => {
    toggleTheme();
    logInteraction(
      'tema',
      theme === 'dark'
        ? 'Activado Modo Luz Solar (Alto Contraste para Obra Exterior)'
        : 'Activado Modo Oscuro Estándar'
    );
  };

  const navItems: { id: TabType; label: string; icon: React.ReactNode; badge?: number }[] = [
    {
      id: 'alerta-ia',
      label: 'Cámaras CCTV',
      icon: <Camera className="w-3.5 h-3.5" />,
      badge: openCasesCount > 0 ? openCasesCount : undefined,
    },
    {
      id: 'reportar',
      label: 'Reportar',
      icon: <PlusCircle className="w-3.5 h-3.5" />,
    },
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-3.5 h-3.5" />,
    },
    {
      id: 'cerrar-caso',
      label: 'Cierre de Caso',
      icon: <ShieldCheck className="w-3.5 h-3.5" />,
    },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#0c1322]/95 backdrop-blur-xl border-b border-[#222a3d] shadow-[0_4px_24px_rgba(0,0,0,0.6)]">
      <div className="max-w-7xl mx-auto h-16 px-3 sm:px-6 lg:px-8 flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand: Logo Image replacing the logo text */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          <div
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-2.5 cursor-pointer group select-none"
            title="Qawaq - Ir al Dashboard"
          >
            {/* Logo Image */}
            <div className="relative flex items-center justify-center">
              <img
                src="/logo.svg"
                alt="Logo Qawaq"
                className="h-9 w-9 sm:h-10 sm:w-10 md:h-11 md:w-11 object-contain rounded-xl drop-shadow-[0_2px_8px_rgba(245,158,11,0.25)] ring-1 ring-[#f59e0b]/40 group-hover:ring-[#f59e0b] group-hover:scale-105 transition-all duration-200"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = '/logo.png';
                }}
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-[#10b981] rounded-full ring-2 ring-[#0c1322]" />
            </div>

            {/* Sub-label & Project Status */}
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-[10px] sm:text-xs font-black text-[#f59e0b] tracking-wider uppercase">
                  QAWAQ // LIVE
                </span>
                <span className="hidden sm:inline-block px-1.5 py-0.2 rounded bg-[#10b981]/15 text-[#34d399] font-mono text-[8px] font-bold border border-[#10b981]/30">
                  CCTV ACTIVO
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
                <span className="font-mono text-[9px] text-[#94a3b8] uppercase tracking-tight truncate max-w-[120px] sm:max-w-none">
                  TORRE ANDINA · FRENTE B
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop / Tablet Navigation Bar (Responsive adapt to larger screens) */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-1.5 bg-[#131b2e]/90 p-1 rounded-xl border border-[#222a3d]">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-['Chivo'] font-bold text-xs uppercase tracking-wide transition-all ${
                  isActive
                    ? 'bg-[#f59e0b] text-[#2a1700] shadow-sm'
                    : 'text-[#94a3b8] hover:text-[#dae2fd] hover:bg-[#1e293b]'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span
                    className={`ml-1 px-1.5 py-0.2 rounded-full font-mono text-[9px] font-black ${
                      isActive ? 'bg-[#93000a] text-white' : 'bg-[#ef4444] text-white animate-pulse'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right side: Power Saver, Notifications, Reset Demo & Avatar */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Quick Power Saver Mode Indicator / Toggle */}
          <button
            type="button"
            onClick={togglePowerSaver}
            title={
              isPowerSaver
                ? 'Modo Ahorro de Batería ACTIVO (Polling reducido a 28s). Click para alternar.'
                : 'Modo Estándar (Polling 8s). Click para activar Ahorro de Batería.'
            }
            className={`hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-xl font-mono text-[9px] font-bold uppercase transition-all active:scale-95 border ${
              isPowerSaver
                ? 'bg-[#f59e0b]/20 text-[#ffb95f] border-[#f59e0b]/40 shadow-sm'
                : 'bg-[#131b2e] text-[#94a3b8] hover:text-[#dae2fd] border-[#222a3d]'
            }`}
          >
            {isPowerSaver ? (
              <ZapOff className="w-3.5 h-3.5 text-[#f59e0b]" />
            ) : isCharging ? (
              <BatteryCharging className="w-3.5 h-3.5 text-[#10b981]" />
            ) : (
              <Battery className="w-3.5 h-3.5 text-[#94a3b8]" />
            )}
            <span className="hidden md:inline">
              {isPowerSaver ? 'Ahorro ON' : 'Ahorro'}
            </span>
            {batteryLevel !== null && (
              <span className={batteryLevel <= 20 ? 'text-[#ef4444]' : 'opacity-80'}>
                {batteryLevel}%
              </span>
            )}
          </button>

          {/* High-Contrast Sunlight Mode Toggle for Outdoor Construction Sites */}
          <button
            onClick={handleToggleTheme}
            title={
              isLightMode
                ? 'Cambiar a Modo Oscuro'
                : 'Activar Modo Luz Solar (Alto Contraste para Obra Exterior)'
            }
            className={`flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-xl text-xs font-['Chivo'] font-bold uppercase tracking-wider transition-all active:scale-95 border ${
              isLightMode
                ? 'bg-amber-100 text-amber-950 border-amber-400 shadow-sm'
                : 'text-[#94a3b8] hover:text-[#f59e0b] hover:bg-[#1a2337] border-transparent hover:border-[#334155]'
            }`}
          >
            {isLightMode ? (
              <>
                <Sun className="w-4 h-4 text-amber-600" />
                <span className="hidden sm:inline font-mono text-[10px] text-amber-950 font-black">
                  MODO SOL
                </span>
              </>
            ) : (
              <>
                <Sun className="w-4 h-4 text-[#f59e0b]" />
                <span className="hidden sm:inline font-mono text-[10px] text-[#dae2fd]">
                  LUZ SOL
                </span>
              </>
            )}
          </button>

          {/* Notification Center Trigger */}
          <button
            onClick={() => setIsNotificationModalOpen(true)}
            title="Configurar Notificaciones Push"
            className="relative p-2 text-[#94a3b8] hover:text-[#f59e0b] hover:bg-[#1a2337] rounded-xl transition-all active:scale-95 border border-transparent hover:border-[#334155]"
          >
            <Bell className="w-4 h-4" />
            <span
              className={`absolute top-1.5 right-1.5 w-2 h-2 rounded-full ring-1 ring-[#0c1322] ${
                perm === 'granted'
                  ? 'bg-[#10b981] shadow-[0_0_6px_#10b981]'
                  : 'bg-[#f59e0b] animate-ping'
              }`}
            />
          </button>

          {/* Reset Demo Data Button */}
          <button
            onClick={resetDemoData}
            title="Reiniciar datos de demo a valores originales"
            className="p-2 text-[#94a3b8] hover:text-[#f59e0b] hover:bg-[#1a2337] rounded-xl transition-all active:scale-95 border border-transparent hover:border-[#334155]"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* User Profile Badge (Adapts to screen width) */}
          <div className="flex items-center gap-2 pl-1 sm:pl-2 border-l border-[#222a3d]">
            <div className="text-right hidden sm:flex flex-col">
              <span className="font-mono text-[9px] font-bold text-[#dae2fd] truncate max-w-[130px]">
                Ing. Carlos Mendoza
              </span>
              <span className="font-mono text-[8px] text-[#10b981] uppercase font-bold tracking-wider">
                CIP 184920 · SEGURIDAD
              </span>
            </div>

            <div className="relative flex items-center justify-center">
              <img
                src={ASSETS.avatar}
                alt="Ing. Carlos Mendoza"
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover ring-1 ring-[#f59e0b]/50 shadow-sm"
              />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#10b981] rounded-full ring-2 ring-[#0b1326]" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
