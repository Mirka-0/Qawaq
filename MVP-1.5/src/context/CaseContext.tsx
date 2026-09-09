import React, { createContext, useContext, useEffect, useState } from 'react';
import { INITIAL_CASES } from '../constants';
import { CaseItem, CaseStatus, TabType } from '../types';
import { NotificationService } from '../services/notificationService';

interface CaseContextType {
  cases: CaseItem[];
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  selectedCaseForClosureId: string | null;
  setSelectedCaseForClosureId: (id: string | null) => void;
  addCase: (newCase: Omit<CaseItem, 'id' | 'fechaCreacion'> & { id?: string }) => CaseItem;
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

const STORAGE_KEY = 'qawaq_ai_cases_mvp_v1';

const CaseContext = createContext<CaseContextType | undefined>(undefined);

export const CaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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

  const [activeTab, setActiveTab] = useState<TabType>('reportar');
  const [selectedCaseForClosureId, setSelectedCaseForClosureId] = useState<string | null>('QW-104');
  const [toast, setToast] = useState<string | null>(null);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState<boolean>(false);

  // Initialize Service Worker for Push Notifications
  useEffect(() => {
    NotificationService.init();

    // Listen for notification click messages forwarded by Service Worker
    const handleSwMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'NOTIFICATION_CLICK') {
        const data = event.data.data;
        if (data?.caseId) {
          setSelectedCaseForClosureId(data.caseId);
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
    newCaseData: Omit<CaseItem, 'id' | 'fechaCreacion'> & { id?: string }
  ): CaseItem => {
    const existingIds = cases.map((c) => {
      const match = c.id.match(/\d+/);
      return match ? parseInt(match[0], 10) : 100;
    });
    const nextNum = existingIds.length > 0 ? Math.max(...existingIds) + 1 : 105;
    const generatedId = newCaseData.id || `QW-${nextNum}`;

    // If an open case with this ID already exists, update or clone
    const existingIndex = cases.findIndex((c) => c.id === generatedId);
    let createdItem: CaseItem;

    if (existingIndex >= 0 && cases[existingIndex].estado !== 'Cerrado') {
      createdItem = {
        ...cases[existingIndex],
        ...newCaseData,
        id: generatedId,
        fechaCreacion: Date.now(),
        tiempoAbierto: '1 min',
      };
      setCases((prev) => [createdItem, ...prev.filter((c) => c.id !== generatedId)]);
    } else {
      createdItem = {
        ...newCaseData,
        id: generatedId,
        fechaCreacion: Date.now(),
        tiempoAbierto: 'Ahora',
      };
      setCases((prev) => [createdItem, ...prev]);
    }

    // Trigger push notification for new AI alert or incident
    NotificationService.notifyNewAiAlert(createdItem);

    return createdItem;
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
          const updated = { ...c, estado: status };
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
    setActiveTab('reportar');
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
        addCase,
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
