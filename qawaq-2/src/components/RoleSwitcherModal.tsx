import React from 'react';
import { ShieldCheck, HardHat, Building2, Check, UserCheck, X, ArrowRight } from 'lucide-react';
import { useRole } from '../context/RoleContext';
import { UserRole } from '../types';

export const RoleSwitcherModal: React.FC = () => {
  const {
    currentRole,
    setRole,
    activeSupervisor,
    setActiveSupervisor,
    availableSupervisors,
    isRoleModalOpen,
    setIsRoleModalOpen,
  } = useRole();

  if (!isRoleModalOpen) return null;

  const roles: {
    id: UserRole;
    title: string;
    badge: string;
    desc: string;
    icon: React.ReactNode;
    color: string;
    tabs: string;
  }[] = [
    {
      id: 'SSOMA',
      title: 'Seguridad SSOMA',
      badge: 'Control Total & Normativa',
      desc: 'Supervisa cámaras CCTV, asigna responsables a casos abiertos, valida o rechaza evidencias de campo y emite certificaciones.',
      icon: <ShieldCheck className="w-6 h-6 text-[#10b981]" />,
      color: 'border-[#10b981]/40 bg-[#10b981]/10',
      tabs: 'Dashboard · Cámaras CCTV · Reportar · Cerrar/Validar',
    },
    {
      id: 'Supervisor/Capataz',
      title: 'Supervisor / Capataz',
      badge: 'Ejecución en Campo',
      desc: 'Gestiona "Mis Pendientes", inicia la corrección en obra, sube evidencia fotográfica con nota técnica y analiza el SLA de "Mi Frente".',
      icon: <HardHat className="w-6 h-6 text-[#f59e0b]" />,
      color: 'border-[#f59e0b]/40 bg-[#f59e0b]/10',
      tabs: 'Mis Pendientes · Mi Frente · Reportar · Cámaras CCTV',
    },
    {
      id: 'Gerencia',
      title: 'Gerencia de Obra',
      badge: 'Auditoría & Solo Lectura',
      desc: 'Monitorea métricas en tiempo real, casos vencidos y tendencias de riesgo. Modo estratégico de observación sin botones operativos.',
      icon: <Building2 className="w-6 h-6 text-[#38bdf8]" />,
      color: 'border-[#38bdf8]/40 bg-[#38bdf8]/10',
      tabs: 'Dashboard Estratégico · Cámaras CCTV · Reportar',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-[#0c1322] border border-[#222a3d] rounded-2xl p-5 sm:p-6 shadow-2xl overflow-y-auto max-h-[92vh]">
        {/* Close Button */}
        <button
          onClick={() => setIsRoleModalOpen(false)}
          className="absolute top-4 right-4 p-2 text-[#94a3b8] hover:text-[#dae2fd] hover:bg-[#1a2337] rounded-xl transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-5 pr-8">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#f59e0b]/15 text-[#ffb95f] border border-[#f59e0b]/30">
              SIMULACIÓN DE LOGIN // QAWAQ
            </span>
            <span className="font-mono text-[10px] text-[#94a3b8]">Demostración Multi-Rol</span>
          </div>
          <h2 className="font-['Chivo'] font-black text-xl sm:text-2xl text-[#dae2fd] tracking-tight uppercase">
            Seleccionar Rol Activo
          </h2>
          <p className="text-xs text-[#94a3b8] mt-1 leading-relaxed">
            Cambia de perspectiva al instante para probar el ciclo completo de asignación, corrección en campo, validación y reporte ejecutivo sin necesidad de backend real.
          </p>
        </div>

        {/* Role Cards */}
        <div className="space-y-3">
          {roles.map((r) => {
            const isSelected = currentRole === r.id;
            return (
              <div
                key={r.id}
                onClick={() => {
                  setRole(r.id);
                  if (r.id !== 'Supervisor/Capataz') {
                    setIsRoleModalOpen(false);
                  }
                }}
                className={`p-4 rounded-xl border transition-all cursor-pointer relative ${
                  isSelected
                    ? 'border-[#f59e0b] bg-[#1a2337] shadow-lg shadow-[#f59e0b]/10'
                    : 'border-[#1e293b] bg-[#0b1326] hover:border-[#334155] hover:bg-[#10192d]'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-[#1e293b] border border-[#334155] shrink-0">
                      {r.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-['Chivo'] font-bold text-base text-[#dae2fd]">
                          {r.title}
                        </h3>
                        <span className="font-mono text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider bg-[#1e293b] text-[#94a3b8] border border-[#334155]">
                          {r.badge}
                        </span>
                        {isSelected && (
                          <span className="font-mono text-[9px] px-2 py-0.5 rounded-full bg-[#10b981]/20 text-[#34d399] font-bold border border-[#10b981]/40 flex items-center gap-1">
                            <Check className="w-3 h-3" /> ACTIVO
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#94a3b8] mt-1 leading-normal">
                        {r.desc}
                      </p>
                      <div className="mt-2 flex items-center gap-1 text-[10px] font-mono text-[#64748b]">
                        <span className="text-[#f59e0b] font-semibold">Vistas:</span> {r.tabs}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setRole(r.id);
                      setIsRoleModalOpen(false);
                    }}
                    className={`shrink-0 px-3 py-1.5 rounded-lg font-['Chivo'] font-bold text-xs uppercase tracking-wider transition-all ${
                      isSelected
                        ? 'bg-[#f59e0b] text-[#2a1700]'
                        : 'bg-[#1e293b] text-[#dae2fd] hover:bg-[#f59e0b] hover:text-[#2a1700]'
                    }`}
                  >
                    {isSelected ? 'Seleccionado' : 'Elegir'}
                  </button>
                </div>

                {/* If Supervisor/Capataz selected, show quick user selector */}
                {isSelected && r.id === 'Supervisor/Capataz' && (
                  <div className="mt-3 pt-3 border-t border-[#222a3d]/80 animate-fade-in" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-[10px] text-[#ffb95f] font-bold uppercase tracking-wider flex items-center gap-1.5">
                        <UserCheck className="w-3.5 h-3.5" /> Identidad del Supervisor en Obra:
                      </span>
                      <span className="text-[10px] text-[#94a3b8] font-mono">
                        Afecta &quot;Mis Pendientes&quot;
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {availableSupervisors.map((sup) => {
                        const isSupActive = activeSupervisor.id === sup.id;
                        return (
                          <button
                            key={sup.id}
                            type="button"
                            onClick={() => {
                              setActiveSupervisor(sup);
                              setIsRoleModalOpen(false);
                            }}
                            className={`p-2 rounded-lg text-left border transition-all ${
                              isSupActive
                                ? 'border-[#f59e0b] bg-[#f59e0b]/15 text-[#dae2fd]'
                                : 'border-[#222a3d] bg-[#070d18] text-[#94a3b8] hover:border-[#334155] hover:text-[#dae2fd]'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-['Chivo'] font-bold text-xs text-[#dae2fd]">
                                {sup.nombre}
                              </span>
                              {isSupActive && <Check className="w-3.5 h-3.5 text-[#f59e0b]" />}
                            </div>
                            <div className="text-[10px] text-[#94a3b8] font-mono mt-0.5">
                              {sup.rol}
                            </div>
                            <div className="text-[9px] text-[#64748b] font-mono truncate">
                              {sup.frenteAsignado}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-5 pt-4 border-t border-[#222a3d] flex items-center justify-between">
          <div className="text-[10px] font-mono text-[#64748b]">
            Persistido en <span className="text-[#dae2fd]">localStorage</span> · Se puede cambiar en cualquier momento
          </div>
          <button
            type="button"
            onClick={() => setIsRoleModalOpen(false)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#f59e0b] text-[#2a1700] font-['Chivo'] font-black text-xs uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all shadow-md shadow-[#f59e0b]/20"
          >
            <span>Continuar con {currentRole}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
