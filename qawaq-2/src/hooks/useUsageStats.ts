import { useState, useEffect, useCallback } from 'react';
import { UsageStats, UserInteractionEvent } from '../types';

const STATS_STORAGE_KEY = 'qawaq_usage_stats_v1';

const INITIAL_STATS: UsageStats = {
  alertasAtendidas: 18,
  reportesGenerados: 7,
  casosCerrados: 6,
  reportesPdfDescargados: 4,
  cambiosModoLuz: 1,
  ultimaActividad: Date.now() - 1000 * 60 * 12,
  eventosRecientes: [
    {
      id: 'EVT-1',
      tipo: 'alerta',
      descripcion: 'Detección IA procesada en Cam-04 (Torre Andina)',
      timestamp: Date.now() - 1000 * 60 * 18,
    },
    {
      id: 'EVT-2',
      tipo: 'cierre',
      descripcion: 'Subsanación certificada para caso QW-104 (Casco EPP)',
      timestamp: Date.now() - 1000 * 60 * 45,
    },
    {
      id: 'EVT-3',
      tipo: 'pdf',
      descripcion: 'Descarga de Acta Técnica Oficial en PDF para auditoría',
      timestamp: Date.now() - 1000 * 60 * 60,
    },
    {
      id: 'EVT-4',
      tipo: 'reporte',
      descripcion: 'Reporte manual generado en Frente B (Piso 14)',
      timestamp: Date.now() - 1000 * 60 * 150,
    },
  ],
};

export const useUsageStats = () => {
  const [stats, setStats] = useState<UsageStats>(() => {
    try {
      const stored = localStorage.getItem(STATS_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Error leyendo estadísticas de localStorage:', e);
    }
    return INITIAL_STATS;
  });

  // Sync to localStorage whenever stats changes
  useEffect(() => {
    try {
      localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(stats));
    } catch (e) {
      console.warn('Error guardando estadísticas en localStorage:', e);
    }
  }, [stats]);

  const logInteraction = useCallback(
    (tipo: UserInteractionEvent['tipo'], descripcion: string) => {
      setStats((prev) => {
        const newEvent: UserInteractionEvent = {
          id: `EVT-${Date.now().toString(36).toUpperCase()}`,
          tipo,
          descripcion,
          timestamp: Date.now(),
        };

        const updatedEvents = [newEvent, ...prev.eventosRecientes].slice(0, 10);

        let alertasAtendidas = prev.alertasAtendidas;
        let reportesGenerados = prev.reportesGenerados;
        let casosCerrados = prev.casosCerrados;
        let reportesPdfDescargados = prev.reportesPdfDescargados;
        let cambiosModoLuz = prev.cambiosModoLuz;

        if (tipo === 'alerta') alertasAtendidas += 1;
        if (tipo === 'reporte') reportesGenerados += 1;
        if (tipo === 'cierre') casosCerrados += 1;
        if (tipo === 'pdf') reportesPdfDescargados += 1;
        if (tipo === 'tema') cambiosModoLuz += 1;

        return {
          ...prev,
          alertasAtendidas,
          reportesGenerados,
          casosCerrados,
          reportesPdfDescargados,
          cambiosModoLuz,
          ultimaActividad: Date.now(),
          eventosRecientes: updatedEvents,
        };
      });
    },
    []
  );

  const resetStats = useCallback(() => {
    setStats({
      ...INITIAL_STATS,
      ultimaActividad: Date.now(),
    });
  }, []);

  return {
    stats,
    logInteraction,
    resetStats,
  };
};
