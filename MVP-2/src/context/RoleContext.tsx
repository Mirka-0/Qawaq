import React, { createContext, useContext, useEffect, useState } from 'react';
import { SUPERVISOR_LIST } from '../constants';
import { SupervisorProfile, UserRole } from '../types';

interface RoleContextType {
  currentRole: UserRole;
  setRole: (role: UserRole) => void;
  activeSupervisor: SupervisorProfile;
  setActiveSupervisor: (sup: SupervisorProfile) => void;
  availableSupervisors: SupervisorProfile[];
  currentUserName: string;
  isSSOMA: boolean;
  isSupervisor: boolean;
  isRoleModalOpen: boolean;
  setIsRoleModalOpen: (open: boolean) => void;
}

const ROLE_STORAGE_KEY = 'qawaq_active_role_v2';
const SUPERVISOR_STORAGE_KEY = 'qawaq_active_supervisor_v2';

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export const RoleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentRole, setCurrentRoleState] = useState<UserRole>(() => {
    try {
      const saved = localStorage.getItem(ROLE_STORAGE_KEY);
      if (saved === 'SSOMA' || saved === 'Supervisor/Capataz') {
        return saved;
      }
    } catch {
      // fallback
    }
    return 'SSOMA';
  });

  const [activeSupervisor, setActiveSupervisorState] = useState<SupervisorProfile>(() => {
    try {
      const saved = localStorage.getItem(SUPERVISOR_STORAGE_KEY);
      if (saved) {
        const found = SUPERVISOR_LIST.find((s) => s.id === saved || s.nombre === saved);
        if (found) return found;
      }
    } catch {
      // fallback
    }
    return SUPERVISOR_LIST[0]; // Ing. Carlos Mendoza
  });

  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);

  const setRole = (role: UserRole) => {
    setCurrentRoleState(role);
    try {
      localStorage.setItem(ROLE_STORAGE_KEY, role);
    } catch {
      // ignore
    }
  };

  const setActiveSupervisor = (sup: SupervisorProfile) => {
    setActiveSupervisorState(sup);
    try {
      localStorage.setItem(SUPERVISOR_STORAGE_KEY, sup.id);
    } catch {
      // ignore
    }
  };

  const currentUserName =
    currentRole === 'SSOMA'
      ? 'Ing. Elena Rivas (SSOMA)'
      : `${activeSupervisor.nombre} (${activeSupervisor.rol})`;

  return (
    <RoleContext.Provider
      value={{
        currentRole,
        setRole,
        activeSupervisor,
        setActiveSupervisor,
        availableSupervisors: SUPERVISOR_LIST,
        currentUserName,
        isSSOMA: currentRole === 'SSOMA',
        isSupervisor: currentRole === 'Supervisor/Capataz',
        isRoleModalOpen,
        setIsRoleModalOpen,
      }}
    >
      {children}
    </RoleContext.Provider>
  );
};

export const useRole = () => {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
};
