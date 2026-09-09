import React from 'react';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { Toast } from './components/Toast';
import { NotificationModal } from './components/NotificationModal';
import { AiAlertScreen } from './components/AiAlertScreen';
import { ReportScreen } from './components/ReportScreen';
import { DashboardScreen } from './components/DashboardScreen';
import { CloseCaseScreen } from './components/CloseCaseScreen';
import { CaseProvider, useCases } from './context/CaseContext';

const MainContent: React.FC = () => {
  const { activeTab, isNotificationModalOpen, setIsNotificationModalOpen } = useCases();

  return (
    <>
      <main className="flex-1 flex flex-col w-full pt-16 pb-20 bg-[#0A0A0A]">
        {activeTab === 'alerta-ia' && <AiAlertScreen />}
        {activeTab === 'reportar' && <ReportScreen />}
        {activeTab === 'dashboard' && <DashboardScreen />}
        {activeTab === 'cerrar-caso' && <CloseCaseScreen />}
      </main>
      <NotificationModal
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
      />
    </>
  );
};

export default function App() {
  return (
    <CaseProvider>
      <div className="min-h-screen bg-[#0A0A0A] text-[#dae2fd] flex flex-col antialiased selection:bg-[#f59e0b] selection:text-[#2a1700]">
        <Header />
        <MainContent />
        <Toast />
        <BottomNav />
      </div>
    </CaseProvider>
  );
}
