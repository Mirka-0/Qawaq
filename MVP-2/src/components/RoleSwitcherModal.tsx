import React from 'react';
import { ShieldCheck, HardHat, Building2, UserCheck, X, ArrowRight, CheckCircle2, Compass } from 'lucide-react';
import { useRole } from '../context/RoleContext';
import { UserRole } from '../types';

interface RoleSwitcherModalProps {
  onStartTour?: () => void;
}

export const RoleSwitcherModal: React.FC<RoleSwitcherModalProps> = ({ onStartTour }) => {
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

  const roles = [
    {
      id: 'SSOMA' as UserRole,
      title: 'SSOMA',
      subtitle: 'SUPERVISOR DE SEGURIDAD Y SALUD EN EL TRABAJO',
      badge: 'CONTROL TOTAL',
      badgeColor: 'bg-[#10b981]/20 text-[#34d399] border-[#10b981]/40',
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuABeegEFG7AfAsaxlqgFvAVWE93XEN9o-gDLgibttS-ni3x7llY8BcLb440FDqcdYSRZxACtf0XeeIIxg19tfoQwqke3gK-EQL1DrK9AUXOGWDQ47V5gkmSr3hQrdHbqoBwP3KcdyV5krQFyZhXWXyiNIuxg5Qm52uk3yAUyJNHTW-0dCI2gElt4TL-3AoNprYHnqqHPT8w0cfjRzll9ILLVwo0aFkOn0ZVaKgC0QVPsTSUo7dc5gSXlQ',
      desc: 'Auditoría en tiempo real de CCTV con IA, asignación de responsables con plazos SLA, inspecciones de campo y cierre formal de no conformidades.',
      features: [
        'Detección de EPP por IA en tiempo real',
        'Asignación de plazos (SLA 4h / 12h / 24h / 48h)',
        'Cierre de caso con validación Antes vs Después',
        'Exportación de informes técnicos PDF',
      ],
      icon: <ShieldCheck className="w-5 h-5 text-[#10b981]" />,
      actionText: 'ACCEDER COMO SSOMA',
      accentColor: 'border-[#10b981]/40 hover:border-[#10b981]',
    },
    {
      id: 'Supervisor/Capataz' as UserRole,
      title: 'SUPERVISOR / CAPATAZ',
      subtitle: 'RESPONSABLE DE FRENTE DE TRABAJO',
      badge: 'CAMPO ACTIVO',
      badgeColor: 'bg-[#f59e0b]/20 text-[#ffb95f] border-[#f59e0b]/40',
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuBCvsQNt49_kZ0wJwh_1L85IGvzaeTAaX7Xd1gObO1HqOkTqXBQlwXc8WXO2f8gDZm6aN4OwSOh3FoFmkbiMyQCEaHeo2RMqPILK3ORzbfUra-JfwEe0yQGjfx1LDxLY6shC3kTU1Fna73QaqUv2gxL6VysiLYMkji82gC6QQjHYo5iN6nIuDHiRojxTP73fk7S5AgA_SdpWHpivDAYWL0rCjd5s34ipBXLT6RLGIBf_Z-hbGXSXxIxeQ',
      desc: 'Gestión directa de no conformidades asignadas en obra, control de plazos críticos, inicio de correcciones y subida de evidencia fotográfica.',
      features: [
        'Bandeja "Mis Pendientes" con temporizador SLA',
        'Subida de evidencia fotográfica de corrección',
        'Panel "Mi Frente" con tasa de cumplimiento',
        'Registro de incidentes directos desde campo',
      ],
      icon: <HardHat className="w-5 h-5 text-[#f59e0b]" />,
      actionText: 'ACCEDER COMO SUPERVISOR',
      accentColor: 'border-[#f59e0b]/40 hover:border-[#f59e0b]',
    },
    {
      id: 'Gerencia' as UserRole,
      title: 'GERENCIA',
      subtitle: 'DIRECCIÓN DE PROYECTO Y OPERACIONES',
      badge: 'ESTRATÉGICO',
      badgeColor: 'bg-[#38bdf8]/20 text-[#7dd3fc] border-[#38bdf8]/40',
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuA_PhafjsDKHF9v6ji6TUu6bpZO5UPeAp9vketf3VxSRS8VToflSDrGrvzeATJXACkuRrW6g6ceN7cBfVVTQO0Y19YCMi9SIznzIeoH5euoBo4erMJeFbT5oFnK7kTcd-30t1ql-p1Fpn4BVk3LBzc8Hf1mNwXKuo9NU2JiyP_Zq1h0K9Kw00UDyf2577N8etOHCMJ0s33CszKGj7agBiUFbWHqv4eGcUAFuULQXnrgCH7Xqk5DBDQ6Tg',
      desc: 'Visualización macro de indicadores clave de seguridad, horas hombre trabajadas sin incidentes, efectividad de frentes y exportación gerencial.',
      features: [
        'KPI de accidentabilidad y ratio de resolución',
        'Comparativa de desempeño entre frentes',
        'Auditoría pasiva sin alteración de datos de campo',
        'Reportes ejecutivos descargables',
      ],
      icon: <Building2 className="w-5 h-5 text-[#38bdf8]" />,
      actionText: 'ACCEDER COMO GERENCIA',
      accentColor: 'border-[#38bdf8]/40 hover:border-[#38bdf8]',
    },
  ];

  const handleStartTourClick = () => {
    setIsRoleModalOpen(false);
    if (onStartTour) {
      onStartTour();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-lg overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-[#0b1326] border border-[#222a3d] rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[95vh] flex flex-col">
        {/* Modal Header Bar */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#222a3d] bg-[#0c1322]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 flex items-center justify-center">
              <img
                src="/logo.svg"
                alt="Logo Qawaq"
                className="w-10 h-10 object-contain rounded-xl"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-['Chivo'] font-black text-base sm:text-lg tracking-wider text-[#dae2fd] uppercase">
                  QAWAQ · CONTROL DE ACCESO
                </span>
              </div>
              <p className="font-mono text-[10px] text-[#94a3b8] uppercase tracking-tight">
                PROTOCOLO DE AUTORIZACIÓN BASADO EN ROLES · SIMULACIÓN DE LOGIN
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsRoleModalOpen(false)}
            className="p-2 text-[#94a3b8] hover:text-[#dae2fd] hover:bg-[#1a2337] rounded-xl transition-colors"
            title="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="font-mono text-[10px] text-[#f59e0b] font-bold uppercase tracking-widest block mb-1">
                [ SELECCIÓN DE IDENTIDAD OPERATIVA ]
              </span>
              <h2 className="font-['Chivo'] font-black text-xl sm:text-2xl text-[#dae2fd] uppercase tracking-tight">
                Identifique su perfil para ingresar
              </h2>
              <p className="text-xs sm:text-sm text-[#94a3b8] mt-1 max-w-3xl leading-relaxed">
                Seleccione un rol para experimentar la aplicación desde su perspectiva operativa. La interfaz, los permisos y los flujos de trabajo se adaptarán en tiempo real sin recargar la página.
              </p>
            </div>

            {onStartTour && (
              <button
                type="button"
                onClick={handleStartTourClick}
                className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-400 font-mono text-xs font-bold uppercase transition-all shadow-sm active:scale-95 shrink-0"
              >
                <Compass className="w-4 h-4" />
                <span>Ver Tour Guiado</span>
              </button>
            )}
          </div>

          {/* 3 Role Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {roles.map((r) => {
              const isSelected = currentRole === r.id;
              return (
                <div
                  key={r.id}
                  className={`group relative flex flex-col rounded-2xl border transition-all duration-300 overflow-hidden bg-[#131b2e]/90 hover:shadow-xl ${
                    isSelected
                      ? 'border-[#f59e0b] ring-2 ring-[#f59e0b]/50 shadow-lg shadow-[#f59e0b]/15'
                      : 'border-[#222a3d] hover:border-[#3b4760]'
                  }`}
                >
                  {/* Card Cover Image */}
                  <div className="relative h-40 w-full overflow-hidden bg-[#0c1322]">
                    <img
                      src={r.image}
                      alt={r.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 opacity-85 group-hover:opacity-100"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#131b2e] via-[#131b2e]/40 to-transparent" />
                    
                    {/* Badge top right */}
                    <div className="absolute top-3 right-3">
                      <span className={`font-mono text-[9px] font-bold uppercase tracking-wider px-2 py-0.8 rounded-md border backdrop-blur-md ${r.badgeColor}`}>
                        {r.badge}
                      </span>
                    </div>

                    {/* Role Icon top left */}
                    <div className="absolute top-3 left-3 p-2 rounded-xl bg-black/60 backdrop-blur-md border border-white/10">
                      {r.icon}
                    </div>

                    {/* Title overlay */}
                    <div className="absolute bottom-2.5 left-3 right-3">
                      <h3 className="font-['Chivo'] font-black text-lg text-white uppercase tracking-tight flex items-center justify-between">
                        <span>{r.title}</span>
                        {isSelected && (
                          <span className="flex items-center gap-1 font-mono text-[9px] text-[#10b981] bg-[#10b981]/20 px-2 py-0.5 rounded-full border border-[#10b981]/40">
                            <CheckCircle2 className="w-3 h-3" /> ACTIVO
                          </span>
                        )}
                      </h3>
                      <p className="font-mono text-[9px] text-[#f59e0b] font-bold uppercase tracking-wider">
                        {r.subtitle}
                      </p>
                    </div>
                  </div>

                  {/* Body description & features */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <p className="text-xs text-[#94a3b8] leading-relaxed">
                      {r.desc}
                    </p>

                    <div className="space-y-1.5 pt-2 border-t border-[#222a3d]">
                      <span className="font-mono text-[9px] font-bold text-[#d8c3ad] uppercase tracking-wider block mb-1">
                        Capacidades clave:
                      </span>
                      {r.features.map((feat, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 text-[11px] text-[#dae2fd]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b] shrink-0" />
                          <span className="truncate">{feat}</span>
                        </div>
                      ))}
                    </div>

                    {/* Supervisor Specific Selector if applicable */}
                    {r.id === 'Supervisor/Capataz' && (
                      <div className="pt-2 border-t border-[#222a3d]/80">
                        <label className="block font-mono text-[9px] uppercase font-bold text-[#ffb95f] mb-1.5 flex items-center gap-1">
                          <UserCheck className="w-3 h-3" /> Asignar identidad de campo:
                        </label>
                        <div className="grid grid-cols-1 gap-1.5">
                          {availableSupervisors.map((sup) => {
                            const isCurrentSup = activeSupervisor.nombre === sup.nombre;
                            return (
                              <button
                                key={sup.nombre}
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveSupervisor(sup);
                                }}
                                className={`text-left px-2.5 py-1.5 rounded-lg text-xs font-mono flex items-center justify-between border transition-all ${
                                  isCurrentSup
                                    ? 'bg-[#f59e0b]/20 border-[#f59e0b] text-[#ffddb8] font-bold'
                                    : 'bg-[#0b1326] border-[#222a3d] text-[#94a3b8] hover:border-[#3b4760]'
                                }`}
                              >
                                <span className="truncate">{sup.nombre}</span>
                                <span className="text-[9px] opacity-75 shrink-0 ml-1">{sup.frente}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Action Button */}
                    <button
                      type="button"
                      onClick={() => {
                        setRole(r.id);
                        setIsRoleModalOpen(false);
                      }}
                      className={`w-full mt-2 py-2.5 px-3 rounded-xl font-['Chivo'] font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
                        isSelected
                          ? 'bg-[#f59e0b] text-[#2a1700] hover:bg-[#ffb95f] shadow-md shadow-[#f59e0b]/20'
                          : 'bg-[#1e293b] text-[#dae2fd] hover:bg-[#f59e0b] hover:text-[#2a1700]'
                      }`}
                    >
                      <span>{isSelected ? 'ROL YA ACTIVO (INGRESAR)' : r.actionText}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 bg-[#060e20] border-t border-[#222a3d] flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] font-mono text-[#64748b]">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#10b981]" />
            CONEXIÓN SEGURA · PROTOCOLO DE AUDITORÍA QAWAQ-SSOMA ACTIVO
          </span>
          <span>AUTENTICACIÓN LOCAL DEMO · SIN BACKEND EXTERNO</span>
        </div>
      </div>
    </div>
  );
};
