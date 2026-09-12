import React, { createContext, useContext, useEffect, useState } from 'react';
import { INITIAL_CASES } from '../constants';
import { AssignedPerson, CaseHistoryEntry, CaseItem, CaseStatus, PriorityLevel, TabType } from '../types';
import { NotificationService } from '../services/notificationService';
import { getTargetDeadline } from '../utils/sla';
import { useRole } from './RoleContext';

interface CaseContextType {
  cases: CaseItem[];
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  selectedCaseForClosureId: string | null;
  setSelectedCaseForClosureId: (id: string | null) => void;
  selectedCaseForDetailId: string | null;
  setSelectedCaseForDetailId: (id: string | null) => void;
  addCase: (
    newCase: Omit<CaseItem, 'id' | 'fechaCreacion' | 'historial' | 'plazoObjetivo' | 'estado'> & {
      id?: string;
      prioridad?: PriorityLevel;
      plazoObjetivo?: number;
      asignadoA?: AssignedPerson | null;
      estado?: CaseStatus;
    }
  ) => CaseItem;
  assignCase: (id: string, asignadoA: AssignedPerson, prioridad?: PriorityLevel) => void;
  startCorrection: (id: string) => void;
  submitCorrectionEvidence: (id: string, evidencia: { fotoUrl: string; nota: string }) => void;
  approveValidation: (id: string, dictamen?: string) => void;
  rejectValidation: (id: string, comentarioRechazo: string) => void;
  closeCase: (
    id: string,
    data: {
      medidaAplicada: string;
      dictamenCierre: string;
      conformeG050: boolean;
      conformeDS011: boolean;
      fotoSolucionUrl?: string;
    }
  ) => void;
  updateCaseStatus: (id: string, status: CaseStatus) => void;
  resetDemoData: () => void;
  toast: string | null;
  showToast: (msg: string) => void;
  navigateToCloseCase: (caseId: string) => void;
  isNotificationModalOpen: boolean;
  setIsNotificationModalOpen: (open: boolean) => void;
}

const STORAGE_KEY = 'qawaq_cases_v2';

const CaseContext = createContext<CaseContextType | undefined>(undefined);

export const CaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentRole, currentUserName } = useRole();

  const [cases, setCases] = useState<CaseItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // Fallback
    }
    return INITIAL_CASES;
  });

  const [activeTab, setActiveTab] = useState<TabType>(() => {
    return currentRole === 'Supervisor/Capataz' ? 'mis-pendientes' : 'dashboard';
  });

  const [selectedCaseForClosureId, setSelectedCaseForClosureId] = useState<string | null>('QW-104');
  const [selectedCaseForDetailId, setSelectedCaseForDetailId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState<boolean>(false);

  // Sync tab when role changes if current tab is invalid for the new role
  useEffect(() => {
    if (currentRole === 'Supervisor/Capataz') {
      const allowedSupervisorTabs: TabType[] = ['mis-pendientes', 'mi-frente', 'reportar', 'alerta-ia'];
      if (!allowedSupervisorTabs.includes(activeTab)) {
        setActiveTab('mis-pendientes');
      }
    } else if (currentRole === 'Gerencia') {
      const allowedGerenciaTabs: TabType[] = ['dashboard', 'alerta-ia', 'reportar'];
      if (!allowedGerenciaTabs.includes(activeTab)) {
        setActiveTab('dashboard');
      }
    } else {
      // SSOMA
      const allowedSSOMATabs: TabType[] = ['dashboard', 'alerta-ia', 'reportar', 'cerrar-caso'];
      if (!allowedSSOMATabs.includes(activeTab)) {
        setActiveTab('dashboard');
      }
    }
  }, [currentRole]);

  // Initialize Service Worker for Push Notifications
  useEffect(() => {
    NotificationService.init();

    const handleSwMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'NOTIFICATION_CLICK') {
        const data = event.data.data;
        if (data?.caseId) {
          setSelectedCaseForClosureId(data.caseId);
          setSelectedCaseForDetailId(data.caseId);
        }
        if (data?.tab) {
          setActiveTab(data.tab as TabType);
        }
      }
    };

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', handleSwMessage);
      return () => {
        navigator.serviceWorker.removeEventListener('message', handleSwMessage);
      };
    }
  }, []);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cases));
    } catch (e) {
      console.error('Error saving to localStorage', e);
    }
  }, [cases]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => {
      setToast((current) => (current === msg ? null : current));
    }, 4000);
  };

  const addCase = (
    newCaseData: Omit<CaseItem, 'id' | 'fechaCreacion' | 'historial' | 'plazoObjetivo' | 'estado'> & {
      id?: string;
      prioridad?: PriorityLevel;
      plazoObjetivo?: number;
      asignadoA?: AssignedPerson | null;
      estado?: CaseStatus;
    }
  ): CaseItem => {
    const existingIds = cases.map((c) => {
      const match = c.id.match(/\d+/);
      return match ? parseInt(match[0], 10) : 100;
    });
    const nextNum = existingIds.length > 0 ? Math.max(...existingIds) + 1 : 105;
    const generatedId = newCaseData.id || `QW-${nextNum}`;

    const priorityToUse: PriorityLevel =
      newCaseData.prioridad ||
      (newCaseData.urgencia === 'Alto' ? 'Crítico' : newCaseData.urgencia === 'Medio' ? 'Alto' : 'Medio');
    const targetDeadline = newCaseData.plazoObjetivo || getTargetDeadline(priorityToUse);
    const initialStatus: CaseStatus =
      newCaseData.estado || (newCaseData.asignadoA ? 'Asignado' : 'Abierto');

    const initialHistory: CaseHistoryEntry[] = [
      {
        accion: 'Reportado',
        por: currentUserName,
        rol: currentRole,
        fecha: Date.now(),
        comentario: `Detectado vía ${newCaseData.detectadoPor}. Prioridad: ${priorityToUse}.`,
      },
    ];

    if (newCaseData.asignadoA) {
      initialHistory.push({
        accion: `Asignado a ${newCaseData.asignadoA.nombre}`,
        por: currentUserName,
        rol: currentRole,
        fecha: Date.now(),
        comentario: `Asignado a ${newCaseData.asignadoA.rol}.`,
      });
    }

    const createdItem: CaseItem = {
      ...newCaseData,
      id: generatedId,
      prioridad: priorityToUse,
      plazoObjetivo: targetDeadline,
      estado: initialStatus,
      asignadoA: newCaseData.asignadoA || null,
      responsable: newCaseData.asignadoA?.nombre || newCaseData.responsable || 'Sin Asignar',
      fechaCreacion: Date.now(),
      tiempoAbierto: 'Ahora',
      historial: initialHistory,
    };

    setCases((prev) => [createdItem, ...prev.filter((c) => c.id !== generatedId)]);
    NotificationService.notifyNewAiAlert(createdItem);
    return createdItem;
  };

  const assignCase = (id: string, asignadoA: AssignedPerson, newPrioridad?: PriorityLevel) => {
    let updatedCase: CaseItem | undefined;
    setCases((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const priorityToUse = newPrioridad || item.prioridad || 'Alto';
          const newDeadline = getTargetDeadline(priorityToUse);
          const newHistorial = [
            ...(item.historial || []),
            {
              accion: `Asignado a ${asignadoA.nombre}`,
              por: currentUserName,
              rol: currentRole,
              fecha: Date.now(),
              comentario: `Responsable: ${asignadoA.rol}. Prioridad: ${priorityToUse}.`,
            },
          ];
          const updated: CaseItem = {
            ...item,
            asignadoA,
            responsable: asignadoA.nombre,
            prioridad: priorityToUse,
            plazoObjetivo: newDeadline,
            estado: 'Asignado',
            historial: newHistorial,
          };
          updatedCase = updated;
          return updated;
        }
        return item;
      })
    );

    if (updatedCase) {
      NotificationService.notifyCaseStatusUpdate(
        updatedCase,
        'Asignado',
        `Caso #${id} asignado a ${asignadoA.nombre}. Plazo SLA en curso.`
      );
    }
    showToast(`Caso #${id} asignado a ${asignadoA.nombre}`);
  };

  const startCorrection = (id: string) => {
    let updatedCase: CaseItem | undefined;
    setCases((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newHistorial = [
            ...(item.historial || []),
            {
              accion: 'Corrección iniciada',
              por: currentUserName,
              rol: currentRole,
              fecha: Date.now(),
              comentario: 'Responsable en campo inició la subsanación.',
            },
          ];
          const updated: CaseItem = {
            ...item,
            estado: 'En Corrección',
            historial: newHistorial,
          };
          updatedCase = updated;
          return updated;
        }
        return item;
      })
    );
    showToast(`Corrección iniciada para caso #${id}`);
  };

  const submitCorrectionEvidence = (id: string, evidencia: { fotoUrl: string; nota: string }) => {
    let updatedCase: CaseItem | undefined;
    setCases((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newHistorial = [
            ...(item.historial || []),
            {
              accion: 'Evidencia subida',
              por: currentUserName,
              rol: currentRole,
              fecha: Date.now(),
              comentario: evidencia.nota,
            },
          ];
          const updated: CaseItem = {
            ...item,
            estado: 'Pendiente de Validación SSOMA',
            evidenciaCorreccion: {
              fotoUrl: evidencia.fotoUrl,
              nota: evidencia.nota,
              fecha: Date.now(),
            },
            historial: newHistorial,
          };
          updatedCase = updated;
          return updated;
        }
        return item;
      })
    );
    if (updatedCase) {
      NotificationService.notifyCaseStatusUpdate(
        updatedCase,
        'Pendiente de Validación SSOMA',
        `Evidencia técnica enviada para caso #${id}. En espera de validación.`
      );
    }
    showToast(`Evidencia enviada para validación en caso #${id}`);
  };

  const approveValidation = (id: string, dictamen?: string) => {
    let updatedCase: CaseItem | undefined;
    const comment = dictamen || 'Evidencia de subsanación verificada conforme a normas de seguridad.';
    setCases((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const diffMinutes = Math.max(1, Math.round((Date.now() - item.fechaCreacion) / 60000));
          const newHistorial = [
            ...(item.historial || []),
            {
              accion: 'Cerrado',
              por: currentUserName,
              rol: currentRole,
              fecha: Date.now(),
              comentario: comment,
            },
          ];
          const updated: CaseItem = {
            ...item,
            estado: 'Cerrado',
            fechaCierre: Date.now(),
            tiempoAbierto: `Resuelto en ${diffMinutes} min`,
            fotoSolucionUrl: item.evidenciaCorreccion?.fotoUrl || item.fotoSolucionUrl,
            dictamenCierre: comment,
            conformeG050: true,
            conformeDS011: true,
            validacion: {
              aprobado: true,
              comentarioSSOMA: comment,
              fecha: Date.now(),
            },
            historial: newHistorial,
          };
          updatedCase = updated;
          return updated;
        }
        return item;
      })
    );
    if (updatedCase) {
      NotificationService.notifyCaseStatusUpdate(
        updatedCase,
        'Cerrado',
        `Caso #${id} aprobado y cerrado conforme por SSOMA.`
      );
    }
    showToast(`Caso #${id} aprobado y cerrado con éxito`);
  };

  const rejectValidation = (id: string, comentarioRechazo: string) => {
    let updatedCase: CaseItem | undefined;
    setCases((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newHistorial = [
            ...(item.historial || []),
            {
              accion: 'Rechazado',
              por: currentUserName,
              rol: currentRole,
              fecha: Date.now(),
              comentario: comentarioRechazo,
            },
          ];
          const updated: CaseItem = {
            ...item,
            estado: 'Rechazado',
            validacion: {
              aprobado: false,
              comentarioSSOMA: comentarioRechazo,
              fecha: Date.now(),
            },
            historial: newHistorial,
          };
          updatedCase = updated;
          return updated;
        }
        return item;
      })
    );
    if (updatedCase) {
      NotificationService.notifyCaseStatusUpdate(
        updatedCase,
        'Rechazado',
        `Evidencia rechazada en caso #${id}: "${comentarioRechazo}". Reingresa a corrección.`
      );
    }
    showToast(`Caso #${id} rechazado. Regresa a corrección en campo`);
  };

  const closeCase = (
    id: string,
    data: {
      medidaAplicada: string;
      dictamenCierre: string;
      conformeG050: boolean;
      conformeDS011: boolean;
      fotoSolucionUrl?: string;
    }
  ) => {
    let closedCaseItem: CaseItem | undefined;

    setCases((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const diffMinutes = Math.max(1, Math.round((Date.now() - item.fechaCreacion) / 60000));
          const newHistorial = [
            ...(item.historial || []),
            {
              accion: 'Cerrado',
              por: currentUserName,
              rol: currentRole,
              fecha: Date.now(),
              comentario: data.dictamenCierre,
            },
          ];
          const updated: CaseItem = {
            ...item,
            estado: 'Cerrado',
            medidaAplicada: data.medidaAplicada,
            dictamenCierre: data.dictamenCierre,
            conformeG050: data.conformeG050,
            conformeDS011: data.conformeDS011,
            fotoSolucionUrl: data.fotoSolucionUrl || item.fotoSolucionUrl,
            fechaCierre: Date.now(),
            tiempoAbierto: `Resuelto en ${diffMinutes} min`,
            validacion: {
              aprobado: true,
              comentarioSSOMA: data.dictamenCierre,
              fecha: Date.now(),
            },
            historial: newHistorial,
          };
          closedCaseItem = updated;
          return updated;
        }
        return item;
      })
    );

    if (closedCaseItem) {
      NotificationService.notifyCaseStatusUpdate(
        closedCaseItem,
        'Cerrado',
        `Caso #${id} certificado conforme a normas G.050 y D.S. 011-2019-TR.`
      );
    }

    showToast(`Caso #${id} cerrado y certificado con éxito`);
  };

  const updateCaseStatus = (id: string, status: CaseStatus) => {
    let targetCase: CaseItem | undefined;

    setCases((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const newHistorial = [
            ...(c.historial || []),
            {
              accion: `Estado cambiado a ${status}`,
              por: currentUserName,
              rol: currentRole,
              fecha: Date.now(),
            },
          ];
          const updated = { ...c, estado: status, historial: newHistorial };
          targetCase = updated;
          return updated;
        }
        return c;
      })
    );

    if (targetCase) {
      NotificationService.notifyCaseStatusUpdate(
        targetCase,
        status,
        `El caso #${id} ha pasado a estado "${status}".`
      );
    }
  };

  const resetDemoData = () => {
    setCases(INITIAL_CASES);
    setSelectedCaseForClosureId('QW-104');
    setSelectedCaseForDetailId(null);
    setActiveTab(currentRole === 'Supervisor/Capataz' ? 'mis-pendientes' : 'dashboard');
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_CASES));
    } catch {
      // ignore
    }
    showToast('Datos de demostración reiniciados a valores originales');
  };

  const navigateToCloseCase = (caseId: string) => {
    setSelectedCaseForClosureId(caseId);
    setActiveTab('cerrar-caso');
  };

  return (
    <CaseContext.Provider
      value={{
        cases,
        activeTab,
        setActiveTab,
        selectedCaseForClosureId,
        setSelectedCaseForClosureId,
        selectedCaseForDetailId,
        setSelectedCaseForDetailId,
        addCase,
        assignCase,
        startCorrection,
        submitCorrectionEvidence,
        approveValidation,
        rejectValidation,
        closeCase,
        updateCaseStatus,
        resetDemoData,
        toast,
        showToast,
        navigateToCloseCase,
        isNotificationModalOpen,
        setIsNotificationModalOpen,
      }}
    >
      {children}
    </CaseContext.Provider>
  );
};

export const useCases = () => {
  const context = useContext(CaseContext);
  if (!context) {
    throw new Error('useCases must be used within a CaseProvider');
  }
  return context;
};

