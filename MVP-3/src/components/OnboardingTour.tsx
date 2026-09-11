import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Compass,
  ArrowRight,
  ArrowLeft,
  X,
  Sparkles,
  CheckCircle2,
  Shield,
  HardHat,
  Building2,
  Layers,
  Camera,
  PlusCircle,
  LayoutDashboard,
  ListTodo,
  FileText,
} from 'lucide-react';
import { useRole } from '../context/RoleContext';
import { useCases } from '../context/CaseContext';
import { TabType } from '../types';

export const TOUR_STORAGE_KEY = 'qawaq_tour_completado';

interface TourStep {
  targetId?: string;
  tabToOpen?: TabType;
  title: string;
  description: string;
  position?: 'bottom' | 'top' | 'center' | 'left' | 'right';
  icon?: React.ReactNode;
}

interface OnboardingTourProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export const OnboardingTour: React.FC<OnboardingTourProps> = ({
  isOpen,
  onClose,
  onComplete,
}) => {
  const { currentRole, isSSOMA, isSupervisor, isGerencia } = useRole();
  const { setActiveTab } = useCases();

  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  // Define role-specific tour steps
  const steps: TourStep[] = useMemo(() => {
    if (isSupervisor) {
      return [
        {
          title: 'Bienvenido a tu Panel de Supervisor / Capataz',
          description:
            'Aquí verás y resolverás los riesgos asignados a ti de forma ágil desde el celular en campo.',
          position: 'center',
          icon: <HardHat className="w-5 h-5 text-[#f59e0b]" />,
        },
        {
          targetId: 'nav-tab-mis-pendientes',
          tabToOpen: 'mis-pendientes',
          title: 'Tus Tareas: Mis Pendientes',
          description:
            'Estos son los casos que debes atender en tu frente de trabajo, priorizados por urgencia y cronómetro SLA.',
          position: 'bottom',
          icon: <ListTodo className="w-5 h-5 text-amber-400" />,
        },
        {
          targetId: 'supervisor-action-button',
          tabToOpen: 'mis-pendientes',
          title: 'Flujo de Acción en Campo',
          description:
            'El botón cambia según el estado del caso: "Iniciar Corrección", "Subir Evidencia" fotográfica con cámara/GPS, o esperar validación SSOMA.',
          position: 'top',
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
        },
        {
          targetId: 'nav-tab-mi-frente',
          tabToOpen: 'mi-frente',
          title: 'Salud Operativa: Mi Frente',
          description:
            'Aquí ves tu propio desempeño: cuántos riesgos tienes activos, vencidos y cuáles cerraste hoy para el cambio de guardia o charla de 5 minutos.',
          position: 'bottom',
          icon: <Layers className="w-5 h-5 text-blue-400" />,
        },
        {
          title: '¡Listo para operar en obra!',
          description:
            'Ya conoces lo esencial para resolver riesgos en campo. Puedes volver a ver este tour desde el botón ROL cuando quieras.',
          position: 'center',
          icon: <Sparkles className="w-5 h-5 text-[#f59e0b]" />,
        },
      ];
    }

    if (isGerencia) {
      return [
        {
          title: 'Bienvenido a la Vista Gerencial Estratégica',
          description:
            'Esta vista es de solo lectura, pensada para métricas globales, tendencias de cumplimiento y reportes ejecutivos sin fricción operativa.',
          position: 'center',
          icon: <Building2 className="w-5 h-5 text-sky-400" />,
        },
        {
          targetId: 'dashboard-kpi-summary',
          tabToOpen: 'dashboard',
          title: 'Tarjetas Resumen y SLA en Tiempo Real',
          description:
            'Aquí ves el panorama general de seguridad de la obra: porcentaje de cumplimiento a tiempo, casos críticos activos y distribución por frentes.',
          position: 'bottom',
          icon: <LayoutDashboard className="w-5 h-5 text-amber-400" />,
        },
        {
          targetId: 'risk-heatmap-section',
          tabToOpen: 'dashboard',
          title: 'Qawaq Intelligence & Mapa de Calor D3',
          description:
            'Visualiza los focos de calor y puntos calientes de incidentes georreferenciados en la cuadrícula de la torre, junto con el análisis de causas raíz.',
          position: 'top',
          icon: <Sparkles className="w-5 h-5 text-purple-400" />,
        },
        {
          targetId: 'executive-export-button',
          tabToOpen: 'dashboard',
          title: 'Resumen Ejecutivo y Descarga PDF',
          description:
            'Puedes generar un resumen ejecutivo y exportar un informe formal en PDF con un solo clic, sin solicitar trámites manuales a SSOMA.',
          position: 'bottom',
          icon: <FileText className="w-5 h-5 text-emerald-400" />,
        },
        {
          title: 'Control total de la seguridad de obra',
          description:
            'Tienes la visión estratégica al instante. Recuerda que puedes volver a abrir este recorrido desde el selector de ROL cuando lo necesites.',
          position: 'center',
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
        },
      ];
    }

    // Default SSOMA Tour
    return [
      {
        title: 'Qawaq AI: Supervisor Virtual de Seguridad',
        description:
          'Bienvenido. Qawaq AI te asiste en la supervisión continua, detección por visión computacional y resolución de riesgos. Este tour te muestra lo esencial en 1 minuto.',
        position: 'center',
        icon: <Shield className="w-5 h-5 text-[#f59e0b]" />,
      },
      {
        targetId: 'nav-tab-alerta-ia',
        tabToOpen: 'alerta-ia',
        title: 'Detección Automatizada: Cámaras CCTV',
        description:
          'Aquí se simulan las detecciones automáticas de riesgos por visión artificial en 5 canales en vivo (sin casco, sin arnés en altura, etc.).',
        position: 'bottom',
        icon: <Camera className="w-5 h-5 text-amber-400" />,
      },
      {
        targetId: 'nav-tab-reportar',
        tabToOpen: 'reportar',
        title: 'Reporte Rápido desde Campo',
        description:
          'Registra una observación manualmente en segundos con reconocimiento de voz por micrófono, geolocalización GPS y captura fotográfica.',
        position: 'bottom',
        icon: <PlusCircle className="w-5 h-5 text-sky-400" />,
      },
      {
        targetId: 'dashboard-kpi-summary',
        tabToOpen: 'dashboard',
        title: 'Dashboard y Tarjetas Resumen',
        description:
          'Aquí ves el estado general de la obra en tiempo real: riesgos totales, casos abiertos, vencidos fuera de SLA y zonas críticas.',
        position: 'bottom',
        icon: <LayoutDashboard className="w-5 h-5 text-amber-400" />,
      },
      {
        targetId: 'dashboard-cases-feed',
        tabToOpen: 'dashboard',
        title: 'Gestión y Certificación de Casos',
        description:
          'Cada caso puedes asignarlo a un supervisor con su plazo límite (SLA), y cuando suben su fotografía de corrección, lo apruebas o rechazas con dictamen normado.',
        position: 'top',
        icon: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
      },
      {
        targetId: 'risk-heatmap-section',
        tabToOpen: 'dashboard',
        title: 'Qawaq Intelligence & Mapa de Calor D3',
        description:
          'La IA analiza la recurrencia de peligros en la cuadrícula D3 de la obra y te sugiere recomendaciones preventivas automáticas.',
        position: 'top',
        icon: <Sparkles className="w-5 h-5 text-purple-400" />,
      },
      {
        title: '¡Listo, ya conoces lo esencial!',
        description:
          'Ya estás preparado para supervisar con máxima eficiencia. Puedes volver a ver este tour desde el botón ROL en el menú superior cuando quieras.',
        position: 'center',
        icon: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
      },
    ];
  }, [isSSOMA, isSupervisor, isGerencia]);

  const step = steps[currentStepIndex] || steps[0];

  // Update target bounding box and active tab on step change
  const updateTargetElement = useCallback(() => {
    if (!isOpen) return;

    if (step.tabToOpen) {
      setActiveTab(step.tabToOpen);
    }

    if (step.targetId) {
      // Small timeout to allow DOM to render after tab switch
      const timer = setTimeout(() => {
        const el = document.getElementById(step.targetId!);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          const rect = el.getBoundingClientRect();
          setTargetRect(rect);
        } else {
          setTargetRect(null);
        }
      }, 120);
      return () => clearTimeout(timer);
    } else {
      setTargetRect(null);
    }
  }, [isOpen, step, setActiveTab]);

  useEffect(() => {
    updateTargetElement();
    window.addEventListener('resize', updateTargetElement);
    return () => window.removeEventListener('resize', updateTargetElement);
  }, [updateTargetElement]);

  const [userPositionFlip, setUserPositionFlip] = useState<'auto' | 'top' | 'bottom'>('auto');

  // Reset to step 0 when tour opens or role changes
  useEffect(() => {
    if (isOpen) {
      setCurrentStepIndex(0);
      setUserPositionFlip('auto');
    }
  }, [isOpen, currentRole]);

  // Reset manual flip on step change
  useEffect(() => {
    setUserPositionFlip('auto');
  }, [currentStepIndex]);

  if (!isOpen) return null;

  const isFirst = currentStepIndex === 0;
  const isLast = currentStepIndex === steps.length - 1;

  const handleNext = () => {
    if (isLast) {
      try {
        localStorage.setItem(TOUR_STORAGE_KEY, 'true');
      } catch {}
      onComplete();
    } else {
      setCurrentStepIndex((prev) => Math.min(prev + 1, steps.length - 1));
    }
  };

  const handlePrev = () => {
    setCurrentStepIndex((prev) => Math.max(prev - 1, 0));
  };

  const handleSkip = () => {
    try {
      localStorage.setItem(TOUR_STORAGE_KEY, 'true');
    } catch {}
    onClose();
  };

  // Viewport boundaries for collision avoidance
  const HEADER_SAFE_ZONE = 68;
  const BOTTOM_NAV_SAFE_ZONE = 76;
  const SIDE_MARGIN = 16;
  const TARGET_SPACING = 12;

  const windowHeight = typeof window !== 'undefined' ? window.innerHeight : 800;

  // Determine placement side
  let placement: 'center' | 'top' | 'bottom' = 'center';
  if (targetRect && step.position !== 'center') {
    if (userPositionFlip === 'top') {
      placement = 'top';
    } else if (userPositionFlip === 'bottom') {
      placement = 'bottom';
    } else {
      const spaceAbove = targetRect.top - HEADER_SAFE_ZONE - TARGET_SPACING;
      const spaceBelow = windowHeight - BOTTOM_NAV_SAFE_ZONE - (targetRect.bottom + TARGET_SPACING);

      if (spaceBelow >= 240) {
        placement = 'bottom';
      } else if (spaceAbove >= 220) {
        placement = 'top';
      } else {
        placement = spaceBelow >= spaceAbove ? 'bottom' : 'top';
      }
    }
  }

  const getDynamicStyles = (): React.CSSProperties => {
    if (!targetRect || step.position === 'center' || placement === 'center') {
      return {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: `calc(100vw - ${SIDE_MARGIN * 2}px)`,
        maxWidth: '440px',
        maxHeight: `calc(100vh - ${HEADER_SAFE_ZONE + BOTTOM_NAV_SAFE_ZONE}px)`,
      };
    }

    if (placement === 'bottom') {
      const preferredTop = targetRect.bottom + TARGET_SPACING;
      const safeTop = Math.max(HEADER_SAFE_ZONE, preferredTop);
      const availableHeight = windowHeight - BOTTOM_NAV_SAFE_ZONE - safeTop;

      return {
        top: `${safeTop}px`,
        left: '50%',
        transform: 'translateX(-50%)',
        width: `calc(100vw - ${SIDE_MARGIN * 2}px)`,
        maxWidth: '440px',
        maxHeight: `${Math.max(200, Math.min(availableHeight, 380))}px`,
      };
    } else {
      // placement === 'top'
      const preferredBottom = windowHeight - targetRect.top + TARGET_SPACING;
      const safeBottom = Math.max(BOTTOM_NAV_SAFE_ZONE, preferredBottom);
      const availableHeight = windowHeight - HEADER_SAFE_ZONE - safeBottom;

      return {
        bottom: `${safeBottom}px`,
        left: '50%',
        transform: 'translateX(-50%)',
        width: `calc(100vw - ${SIDE_MARGIN * 2}px)`,
        maxWidth: '440px',
        maxHeight: `${Math.max(200, Math.min(availableHeight, 380))}px`,
      };
    }
  };

  return (
    <div className="fixed inset-0 z-[100] pointer-events-auto overflow-hidden font-body">
      {/* Semi-darkened spotlight backdrop */}
      <div
        className="fixed inset-0 bg-black/65 backdrop-blur-[4px] transition-opacity duration-300"
        onClick={handleNext}
      />

      {/* Target Element Spotlight cutout */}
      {targetRect && (
        <div
          className="fixed rounded-2xl ring-4 ring-[#f59e0b] shadow-[0_0_40px_rgba(245,158,11,0.6)] pointer-events-none transition-all duration-300 z-[101]"
          style={{
            top: `${Math.max(8, targetRect.top - 6)}px`,
            left: `${Math.max(8, targetRect.left - 6)}px`,
            width: `${targetRect.width + 12}px`,
            height: `${targetRect.height + 12}px`,
            backgroundColor: 'transparent',
          }}
        />
      )}

      {/* Guided Tooltip Dialog Card - Semitransparent with deep backdrop-blur */}
      <div
        style={getDynamicStyles()}
        className="fixed z-[102] bg-[#0c1322]/85 backdrop-blur-2xl border-2 border-[#f59e0b]/80 rounded-2xl p-4 sm:p-5 shadow-[0_20px_50px_rgba(0,0,0,0.85)] space-y-3 transition-all duration-300 ease-out text-left overflow-y-auto"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between pb-2 border-b border-[#222a3d]">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-[#f59e0b]/15 text-[#f59e0b] border border-[#f59e0b]/30">
              {step.icon || <Compass className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-label text-xs uppercase font-bold text-[#f59e0b] tracking-wider">
                  TOUR GUIADO · {currentRole.toUpperCase()}
                </span>
                {targetRect && placement !== 'center' && (
                  <span className="hidden xs:inline-block px-1.5 py-0.2 rounded bg-[#1e293b] text-[#94a3b8] font-label text-[10px] font-semibold">
                    {placement === 'top' ? 'Elemento abajo ↓' : 'Elemento arriba ↑'}
                  </span>
                )}
              </div>
              <div className="font-mono text-[11px] text-[#cbd5e1] font-semibold">
                Paso {currentStepIndex + 1} de {steps.length}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {targetRect && (
              <button
                type="button"
                onClick={() =>
                  setUserPositionFlip((prev) =>
                    prev === 'bottom' ? 'top' : prev === 'top' ? 'bottom' : placement === 'bottom' ? 'top' : 'bottom'
                  )
                }
                className="text-[#94a3b8] hover:text-[#f59e0b] px-2.5 py-1 rounded-lg text-xs font-label font-bold tracking-wide bg-[#131b2e] hover:bg-[#1e293b] border border-[#222a3d] transition-all"
                title="Mover recuadro hacia arriba o abajo si tapa la vista"
              >
                ↕ Mover
              </button>
            )}

            <button
              type="button"
              onClick={handleSkip}
              className="text-[#94a3b8] hover:text-white p-1.5 rounded-lg hover:bg-[#1e293b] transition-colors"
              title="Cerrar tour"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-1.5">
          <h3 className="font-headline font-black text-base sm:text-lg text-white leading-snug">
            {step.title}
          </h3>
          <p className="font-body text-xs sm:text-sm text-[#e2e8f0] leading-relaxed font-normal">
            {step.description}
          </p>
        </div>

        {/* Step Progress Dots */}
        <div className="flex items-center justify-center gap-1.5 py-0.5">
          {steps.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentStepIndex(idx)}
              className={`h-1.5 rounded-full transition-all ${
                idx === currentStepIndex
                  ? 'w-6 bg-[#f59e0b]'
                  : 'w-2 bg-[#334155] hover:bg-[#64748b]'
              }`}
              title={`Ir al paso ${idx + 1}`}
            />
          ))}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-[#222a3d] gap-2">
          <button
            type="button"
            onClick={handleSkip}
            className="font-label text-xs uppercase font-bold tracking-wide text-[#94a3b8] hover:text-white px-2 py-1.5 rounded-lg hover:bg-[#1e293b] transition-all"
          >
            Saltar tour
          </button>

          <div className="flex items-center gap-2">
            {!isFirst && (
              <button
                type="button"
                onClick={handlePrev}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-[#334155] bg-[#131b2e] text-xs font-label uppercase font-bold tracking-wider text-[#dae2fd] hover:bg-[#1e293b] transition-all"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Anterior</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleNext}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-[#f59e0b] hover:bg-[#ffaa00] text-[#2a1700] text-xs font-label uppercase font-black tracking-wider transition-all shadow-md active:scale-95"
            >
              <span>{isLast ? 'Finalizar Tour' : 'Siguiente'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
