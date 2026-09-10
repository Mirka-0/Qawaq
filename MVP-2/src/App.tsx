import React, { useEffect } from 'react';
import { RoleProvider, useRole } from './context/RoleContext';
import { CaseProvider, useCases } from './context/CaseContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { Toast } from './components/Toast';
import { RoleSwitcherModal } from './components/RoleSwitcherModal';
import { NotificationModal } from './components/NotificationModal';
import { RealtimeAlertBanner } from './components/RealtimeAlertBanner';
import { AiAlertScreen } from './components/AiAlertScreen';
import { ReportScreen } from './components/ReportScreen';
import { DashboardScreen } from './components/DashboardScreen';
import { CloseCaseScreen } from './components/CloseCaseScreen';
import { MisPendientesScreen } from './components/MisPendientesScreen';
import { MiFrenteScreen } from './components/MiFrenteScreen';

const MainLayout: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    isNotificationModalOpen,
    setIsNotificationModalOpen,
    setIsTourOpen,
  } = useCases();
  const { currentRole, isSupervisor, isGerencia } = useRole();
  const { isLightMode } = useTheme();

  // If role is changed to Supervisor and current tab is not accessible, redirect smoothly
  useEffect(() => {
    if (isSupervisor) {
      if (activeTab === 'dashboard' || activeTab === 'cerrar-caso') {
        setActiveTab('mis-pendientes');
      }
    } else if (isGerencia) {
      if (activeTab === 'mis-pendientes' || activeTab === 'mi-frente' || activeTab === 'cerrar-caso') {
        setActiveTab('dashboard');
      }
    } else {
      // SSOMA
      if (activeTab === 'mis-pendientes' || activeTab === 'mi-frente') {
        setActiveTab('dashboard');
      }
    }
  }, [currentRole, isSupervisor, isGerencia, activeTab, setActiveTab]);

  return (
    <div
      className={`min-h-screen transition-colors duration-200 ${
        isLightMode ? 'bg-[#FFFFFF] text-[#000000]' : 'bg-[#070d18] text-[#dae2fd]'
      } selection:bg-[#f59e0b] selection:text-[#2a1700]`}
    >
      {/* Toast Alert Banner */}
      <Toast />

      {/* Main Header */}
      <Header />

      {/* Main View Area */}
      <main className="pt-20 pb-20 md:pb-8 min-h-[calc(100vh-80px)]">
        {activeTab === 'alerta-ia' && <AiAlertScreen />}
        {activeTab === 'reportar' && <ReportScreen />}
        {activeTab === 'dashboard' && <DashboardScreen />}
        {activeTab === 'cerrar-caso' && <CloseCaseScreen />}
        {activeTab === 'mis-pendientes' && <MisPendientesScreen />}
        {activeTab === 'mi-frente' && <MiFrenteScreen />}
      </main>

      {/* Bottom Navigation for Mobile */}
      <BottomNav />

      {/* Role Switcher Modal */}
      <RoleSwitcherModal onStartTour={() => setIsTourOpen(true)} />

      {/* Push Notifications Modal */}
      <NotificationModal
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
      />

      {/* Real-time In-App Push Alert Overlay */}
      <RealtimeAlertBanner />
    </div>
  );
};

export function App() {
  return (
    <ThemeProvider>
      <RoleProvider>
        <CaseProvider>
          <MainLayout />
        </CaseProvider>
      </RoleProvider>
    </ThemeProvider>
  );
}

export default App;
