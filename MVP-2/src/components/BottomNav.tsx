import React from 'react';
import { Camera, PlusCircle, LayoutDashboard, ShieldCheck, HardHat, Layers } from 'lucide-react';
import { useCases } from '../context/CaseContext';
import { useRole } from '../context/RoleContext';
import { TabType } from '../types';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, cases } = useCases();
  const { isSupervisor, isSSOMA, activeSupervisor } = useRole();

  const openCasesCount = cases.filter((c) => c.estado === 'Abierto').length;
  const pendingSupervisorCount = cases.filter(
    (c) =>
      c.asignadoA?.nombre === activeSupervisor.nombre &&
      (c.estado === 'Asignado' || c.estado === 'En Corrección' || c.estado === 'Rechazado')
  ).length;

  const navItems: {
    id: TabType;
    label: string;
    icon: React.ReactNode;
    isPrimaryAction?: boolean;
    badge?: number;
  }[] = isSupervisor
    ? [
        {
          id: 'mis-pendientes',
          label: 'Pendientes',
          icon: <HardHat className="w-5 h-5" />,
          badge: pendingSupervisorCount > 0 ? pendingSupervisorCount : undefined,
        },
        {
          id: 'mi-frente',
          label: 'Mi Frente',
          icon: <Layers className="w-5 h-5" />,
        },
        {
          id: 'reportar',
          label: 'Reportar',
          icon: <PlusCircle className="w-5 h-5" />,
          isPrimaryAction: true,
        },
        {
          id: 'alerta-ia',
          label: 'Cámaras',
          icon: <Camera className="w-5 h-5" />,
          badge: openCasesCount > 0 ? openCasesCount : undefined,
        },
      ]
    : [
        {
          id: 'dashboard',
          label: 'Dashboard',
          icon: <LayoutDashboard className="w-5 h-5" />,
        },
        {
          id: 'alerta-ia',
          label: 'Cámaras',
          icon: <Camera className="w-5 h-5" />,
          badge: openCasesCount > 0 ? openCasesCount : undefined,
        },
        {
          id: 'reportar',
          label: 'Reportar',
          icon: <PlusCircle className="w-5 h-5" />,
          isPrimaryAction: true,
        },
        ...(isSSOMA
          ? [
              {
                id: 'cerrar-caso' as TabType,
                label: 'Cierre',
                icon: <ShieldCheck className="w-5 h-5" />,
              },
            ]
          : []),
      ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#060e20]/95 backdrop-blur-xl border-t border-[#1e293b] shadow-[0_-4px_24px_rgba(0,0,0,0.7)] md:hidden">
      <div className="max-w-md mx-auto flex justify-around items-stretch h-18 px-2 py-1.5">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;

          if (item.isPrimaryAction) {
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className="flex flex-col items-center justify-center flex-1 min-w-[64px] transition-all active:scale-95 group"
              >
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all shadow-md ${
                    isActive
                      ? 'bg-[#f59e0b] text-[#2a1700] shadow-[#f59e0b]/30 ring-2 ring-[#ffddb8]'
                      : 'bg-[#1e293b] text-[#f59e0b] hover:bg-[#283548] border border-[#f59e0b]/40'
                  }`}
                >
                  <PlusCircle className="w-6 h-6 stroke-[2.5]" />
                </div>
                <span
                  className={`font-mono text-[10px] mt-1 font-bold tracking-tight uppercase truncate ${
                    isActive ? 'text-[#f59e0b]' : 'text-[#94a3b8] group-hover:text-[#dae2fd]'
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center flex-1 min-w-[60px] transition-all active:scale-95 relative py-1 ${
                isActive ? 'text-[#ffc174]' : 'text-[#94a3b8] hover:text-[#dae2fd]'
              }`}
            >
              <div className="relative flex items-center justify-center">
                {item.icon}
                {item.badge !== undefined && (
                  <span className="absolute -top-1.5 -right-2 px-1.5 py-0.2 bg-[#ef4444] text-white font-mono text-[9px] font-bold rounded-full animate-pulse shadow-sm">
                    {item.badge}
                  </span>
                )}
              </div>
              <span
                className={`font-mono text-[10px] mt-1 tracking-tight truncate ${
                  isActive ? 'font-bold text-[#ffc174]' : 'font-medium'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
