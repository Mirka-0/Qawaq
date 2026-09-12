import { useEffect, useState } from 'react';
import { CaseItem, CaseStatus, PriorityLevel } from '../types';

export function getTargetDeadline(prioridad: PriorityLevel): number {
  const now = Date.now();
  switch (prioridad) {
    case 'Crítico':
      return now + 30 * 60 * 1000; // 30 min
    case 'Alto':
      return now + 2 * 60 * 60 * 1000; // 2 hours
    case 'Medio':
      return now + 24 * 60 * 60 * 1000; // 24 hours
    default:
      return now + 2 * 60 * 60 * 1000;
  }
}

export function isCaseVencido(item: Pick<CaseItem, 'plazoObjetivo' | 'estado'>, now = Date.now()): boolean {
  if (item.estado === 'Cerrado') return false;
  return now > item.plazoObjetivo;
}

export function formatSlaCountdown(plazoObjetivo: number, estado: CaseStatus, now = Date.now()) {
  if (estado === 'Cerrado') {
    return {
      isVencido: false,
      text: 'Conforme',
      badgeClass: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    };
  }

  const diffMs = plazoObjetivo - now;
  const isVencido = diffMs < 0;

  if (isVencido) {
    const overdueMinutes = Math.max(1, Math.floor(Math.abs(diffMs) / 60000));
    const overdueText =
      overdueMinutes >= 60
        ? `${Math.floor(overdueMinutes / 60)}h ${overdueMinutes % 60}m`
        : `${overdueMinutes}m`;

    return {
      isVencido: true,
      text: `VENCIDO (+${overdueText})`,
      shortText: `VENCIDO +${overdueText}`,
      badgeClass: 'bg-red-500/20 text-red-300 border-red-500/40 animate-pulse',
    };
  }

  const remainingMinutes = Math.max(1, Math.floor(diffMs / 60000));
  const remainingText =
    remainingMinutes >= 60
      ? `${Math.floor(remainingMinutes / 60)}h ${remainingMinutes % 60}m`
      : `${remainingMinutes}m`;

  return {
    isVencido: false,
    text: `${remainingText} restantes`,
    shortText: remainingText,
    badgeClass:
      remainingMinutes <= 30
        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
        : 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
  };
}

/**
 * Hook that updates every 10 seconds to re-calculate SLAs in real-time
 */
export function useLiveTimer(intervalMs = 10000) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, intervalMs);
    return () => clearInterval(timer);
  }, [intervalMs]);

  return now;
}
