import React, { useEffect } from 'react';
import {
  RotateCcw,
  Bell,
  Camera,
  PlusCircle,
  LayoutDashboard,
  ShieldCheck,
  Sun,
  ListTodo,
  Layers,
} from 'lucide-react';
import { useCases } from '../context/CaseContext';
import { useRole } from '../context/RoleContext';
import { useTheme } from '../context/ThemeContext';
import { useUsageStats } from '../hooks/useUsageStats';
import { NotificationService } from '../services/notificationService';
import { TabType } from '../types';
import { OnboardingTour, TOUR_STORAGE_KEY } from './OnboardingTour';
import { OfflineStatusBanner } from './OfflineStatusBanner';

export const Header: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    resetDemoData,
    setIsNotificationModalOpen,
    cases,
    isTourOpen,
    setIsTourOpen,
  } = useCases();
  const { currentRole, activeSupervisor, isSSOMA, isSupervisor, isGerencia, setIsRoleModalOpen } =
    useRole();
  const { theme, toggleTheme, isLightMode } = useTheme();
  const { logInteraction } = useUsageStats();
  const perm = NotificationService.getPermission();
  const openCasesCount = cases.filter((c) => c.estado === 'Abierto').length;

  // Auto-launch tour on first app visit
  useEffect(() => {
    try {
      const tourCompleted = localStorage.getItem(TOUR_STORAGE_KEY);
      if (!tourCompleted) {
        setIsTourOpen(true);
      }
    } catch {
      // ignore storage errors
    }
  }, []);

  const handleToggleTheme = () => {
    toggleTheme();
    logInteraction(
      'tema',
      theme === 'dark'
        ? 'Activado Modo Luz Solar (Alto Contraste para Obra Exterior)'
        : 'Activado Modo Oscuro Estándar'
    );
  };

  // Dynamic navigation items based on active role
  const getNavItems = (): { id: TabType; label: string; icon: React.ReactNode; badge?: number }[] => {
    if (isSupervisor) {
      const myPendingCount = cases.filter(
        (c) =>
          c.estado !== 'Cerrado' &&
          c.asignadoA &&
          (c.asignadoA.nombre === activeSupervisor.nombre ||
            c.responsable.toLowerCase().includes(activeSupervisor.nombre.toLowerCase()))
      ).length;

      return [
        {
          id: 'mis-pendientes',
          label: 'Mis Pendientes',
          icon: <ListTodo className="w-3.5 h-3.5" />,
          badge: myPendingCount > 0 ? myPendingCount : undefined,
        },
        {
          id: 'mi-frente',
          label: 'Mi Frente',
          icon: <Layers className="w-3.5 h-3.5" />,
        },
        {
          id: 'reportar',
          label: 'Reportar',
          icon: <PlusCircle className="w-3.5 h-3.5" />,
        },
        {
          id: 'alerta-ia',
          label: 'Cámaras CCTV',
          icon: <Camera className="w-3.5 h-3.5" />,
        },
      ];
    }

    if (isGerencia) {
      return [
        {
          id: 'dashboard',
          label: 'Dashboard Estratégico',
          icon: <LayoutDashboard className="w-3.5 h-3.5" />,
        },
        {
          id: 'alerta-ia',
          label: 'Cámaras CCTV',
          icon: <Camera className="w-3.5 h-3.5" />,
        },
        {
          id: 'reportar',
          label: 'Reportar Incidente',
          icon: <PlusCircle className="w-3.5 h-3.5" />,
        },
      ];
    }

    // Default SSOMA
    return [
      {
        id: 'dashboard',
        label: 'Dashboard SSOMA',
        icon: <LayoutDashboard className="w-3.5 h-3.5" />,
      },
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
        id: 'cerrar-caso',
        label: 'Validar / Cerrar',
        icon: <ShieldCheck className="w-3.5 h-3.5" />,
      },
    ];
  };

  const navItems = getNavItems();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#0c1322]/95 backdrop-blur-xl border-b border-[#222a3d] shadow-[0_4px_24px_rgba(0,0,0,0.6)]">
      <div className="max-w-7xl mx-auto h-16 px-3 sm:px-6 lg:px-8 flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand: Logo Image */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          <div
            onClick={() => setActiveTab(isSupervisor ? 'mis-pendientes' : 'dashboard')}
            className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group select-none"
            title="Qawaq - Inicio"
          >
            <div className="relative flex items-center justify-center">
              <img
                src="/logo.svg"
                alt="Logo Qawaq"
                className="h-9 w-9 sm:h-10 sm:w-10 md:h-11 md:w-11 object-contain rounded-xl group-hover:scale-105 transition-all duration-200"
              />
            </div>

            <div className="flex items-center gap-2 min-w-0">
              <span className="font-['Chivo'] font-black text-lg sm:text-xl md:text-2xl text-[#f59e0b] tracking-wider uppercase">
                QAWAQ
              </span>
              <span className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-[#f59e0b]/15 text-[#ffb95f] font-mono text-[9px] font-bold border border-[#f59e0b]/30">
                CCTV ACTIVO
              </span>
            </div>
          </div>
        </div>

        {/* Desktop / Tablet Navigation Bar */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-1.5 bg-[#131b2e]/90 p-1 rounded-xl border border-[#222a3d]">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-tab-${item.id}`}
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
                      isActive ? 'bg-[#93000a] text-white' : 'bg-[#ef4444] text-white'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right side: Role Selector Trigger Button & Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* PRIMARY ROLE SWITCHER TRIGGER BUTTON */}
          <button
            type="button"
            onClick={() => setIsRoleModalOpen(true)}
            className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl border transition-all active:scale-95 shadow-md ${
              isSSOMA
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/25'
                : isSupervisor
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 hover:bg-amber-500/25'
                : 'bg-sky-500/15 border-sky-500/40 text-sky-300 hover:bg-sky-500/25'
            }`}
            title="Cambiar perspectiva de rol (SSOMA / Supervisor / Gerencia)"
          >
            <div className="relative w-7 h-7 rounded-lg overflow-hidden border border-current shrink-0">
              <img
                src={
                  isSSOMA
                    ? 'https://lh3.googleusercontent.com/aida-public/AB6AXuBKnjyRu50Paf7Zf2tR3-Hn-rgjGWrYBeLe7REjeHfJA4QmaDaw5Wn9HCiZ1qUnFQkSHM9vRZm35Q_8Nz51G9Z0lVpo0bussi2v3R_Q7Is9Wj9KwDTshl1Co57ilbhXbjSx2-TpLXZaGLO_svNGp3MtUZYcBZq0ixIabDgleaLrLKMthIR030MberlqRKeXBeofzfaRMwBDInP0tyhCxUK9eE_ZV72gYKwgnYoHWOzDh7RtFHDrYPFeCQ'
                    : isSupervisor
                    ? 'https://lh3.googleusercontent.com/aida-public/AB6AXuB4L7YJ5RDre317tlHffWaS2fkn_133_BPTEdAkj9B3-tPgWWw2BjmJmlbK0h8Jpa9PIaoiyOI8yNssK9fiMvUZy-jZgfz7KHbn9I0OaUk10Oyn8ue8zp0P0JhJhiSYVfp70u3Ety11JYEPQnUUwx3zRfpBcEZGT9XG20HWfEbJgDG5QpQEYAws0ziu0Ic_onzsYAytmckXp7TWHVUCXpw-Q_rTOuz7QPzX22cQQQ8ObPzHcCqGxd2Bvw'
                    : 'https://lh3.googleusercontent.com/aida/AEtjO1WCegPHQmBeQjjcbTXzSxvL_sZqvwBgKbhdDfSLIsU67x5Te_CTYKEBGBir9b6ngGYoeZ_X0Vg3wvyPueGI3iCOas_AmLcFOOuoLcAciPNKknbNnDUIXhd06YXdmUS_FVE7c0BkYb6pTqYrkSkyd93SMelVBWIYppud7hrAYvPp7zWtOQfm4c6ovCh0Yl4LN3_hDFzrY3vBl-6mDfMv_5mbamvlcWOxCMF_ADqFd7LDPKkmLI-WZ5xR3yxg'
                }
                alt={currentRole}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col text-left leading-tight">
              <span className="font-mono text-[8px] uppercase tracking-wider text-[#94a3b8] font-bold">
                ROL
              </span>
              <span className="font-['Chivo'] font-bold text-[11px] sm:text-xs uppercase truncate max-w-[85px] sm:max-w-[120px]">
                {isSupervisor ? activeSupervisor.nombre.split(' ')[0] : currentRole}
              </span>
            </div>
          </button>

          {/* Grouped tightly together: Light button and Notifications button */}
          <div className="flex items-center gap-0.5 bg-[#131b2e]/90 p-0.5 rounded-xl border border-[#222a3d]">
            {/* High-Contrast Sunlight Mode Toggle */}
            <button
              onClick={handleToggleTheme}
              title={
                isLightMode
                  ? 'Cambiar a Modo Oscuro'
                  : 'Activar Modo Luz Solar (Alto Contraste para Obra Exterior)'
              }
              className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-['Chivo'] font-bold uppercase tracking-wider transition-all active:scale-95 ${
                isLightMode
                  ? 'bg-amber-100 text-amber-950 border border-amber-400 shadow-sm'
                  : 'text-[#94a3b8] hover:text-[#f59e0b] hover:bg-[#1e293b]'
              }`}
            >
              <Sun className={`w-4 h-4 ${isLightMode ? 'text-amber-600' : 'text-[#f59e0b]'}`} />
              <span className="hidden xl:inline font-mono text-[10px]">
                {isLightMode ? 'SOLAR' : 'LUZ'}
              </span>
            </button>

            {/* Notifications Trigger */}
            <button
              onClick={() => setIsNotificationModalOpen(true)}
              title="Configurar Notificaciones Push"
              className="relative p-1.5 text-[#94a3b8] hover:text-[#f59e0b] hover:bg-[#1e293b] rounded-lg transition-all active:scale-95"
            >
              <Bell className="w-4 h-4" />
              <span
                className={`absolute top-1 right-1 w-2 h-2 rounded-full ring-1 ring-[#0c1322] ${
                  perm === 'granted'
                    ? 'bg-[#10b981] shadow-[0_0_6px_#10b981]'
                    : 'bg-[#f59e0b]'
                }`}
              />
            </button>
          </div>

          {/* Reset Demo Data Button */}
          <button
            onClick={resetDemoData}
            title="Reiniciar datos de demo a valores iniciales"
            className="p-2 text-[#94a3b8] hover:text-[#f59e0b] hover:bg-[#1a2337] rounded-xl transition-all active:scale-95 border border-transparent hover:border-[#334155]"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Offline Status Banner */}
      <OfflineStatusBanner />

      {/* Guided Tour Overlay */}
      <OnboardingTour
        isOpen={isTourOpen}
        onClose={() => setIsTourOpen(false)}
        onComplete={() => setIsTourOpen(false)}
      />
    </header>
  );
};
