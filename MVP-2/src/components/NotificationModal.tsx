import React, { useState, useEffect } from 'react';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Volume2,
  VolumeX,
  Smartphone,
  Sparkles,
  Radio,
  X,
  ShieldAlert,
} from 'lucide-react';
import { NotificationService, NotificationPreferences } from '../services/notificationService';
import { useCases } from '../context/CaseContext';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({ isOpen, onClose }) => {
  const { showToast } = useCases();
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [prefs, setPrefs] = useState<NotificationPreferences>(NotificationService.getPreferences());
  const [isCountingDown, setIsCountingDown] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(5);

  useEffect(() => {
    if (isOpen) {
      setPermission(NotificationService.getPermission());
      setPrefs(NotificationService.getPreferences());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleRequestPermission = async () => {
    const perm = await NotificationService.requestPermission();
    setPermission(perm);
    if (perm === 'granted') {
      showToast('¡Notificaciones Push activadas con éxito!');
      NotificationService.dispatchNotification({
        title: '🔔 Qawaq // Notificaciones Activas',
        body: 'El sistema te alertará inmediatamente ante cualquier riesgo en obra.',
        tag: 'welcome-notification',
        soundType: 'resolve',
      });
    } else if (perm === 'denied') {
      showToast('Permiso de notificaciones denegado en el navegador.');
    }
  };

  const handleTogglePref = (key: keyof NotificationPreferences) => {
    const updated = { ...prefs, [key]: !prefs[key] };
    setPrefs(updated);
    NotificationService.savePreferences(updated);
  };

  const handleImmediateTest = () => {
    NotificationService.dispatchNotification({
      title: '🚨 [PRUEBA] QW-106: Alerta Crítica en Obra',
      body: 'Prueba de notificación instantánea en tiempo real. Sistema de seguridad operativo.',
      tag: `test-${Date.now()}`,
      soundType: 'alarm',
    });
    showToast('Notificación de prueba enviada');
  };

  const handleBackgroundTest = () => {
    setIsCountingDown(true);
    setCountdown(5);
    NotificationService.scheduleBackgroundTest(5);
    showToast('Notificación programada para dentro de 5s. ¡Minimiza o cambia de pestaña!');

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsCountingDown(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#060e20]/80 backdrop-blur-md flex items-end sm:items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#131b2e] border border-[#222a3d] rounded-2xl p-5 shadow-2xl flex flex-col gap-4 text-[#dae2fd] max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#f59e0b]/20 flex items-center justify-center text-[#f59e0b] border border-[#f59e0b]/30">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-['Chivo'] font-bold text-sm text-[#dae2fd] uppercase tracking-wide">
                Notificaciones Push de Seguridad
              </h3>
              <p className="font-mono text-[9px] text-[#94a3b8] uppercase">
                Alertas en Vivo y Segundo Plano
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#94a3b8] hover:text-[#dae2fd] hover:bg-[#1e293b] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div
          className={`p-3 rounded-xl border flex items-center justify-between gap-2 ${
            permission === 'granted'
              ? 'bg-[#064e3b]/30 border-[#10b981]/40 text-[#6ffbbe]'
              : permission === 'denied'
              ? 'bg-[#450a0a]/30 border-[#ef4444]/40 text-[#ffdad6]'
              : 'bg-[#2a1700]/40 border-[#f59e0b]/40 text-[#ffb95f]'
          }`}
        >
          <div className="flex items-center gap-2 min-w-0">
            {permission === 'granted' ? (
              <CheckCircle2 className="w-5 h-5 text-[#10b981] shrink-0" />
            ) : permission === 'denied' ? (
              <AlertTriangle className="w-5 h-5 text-[#ef4444] shrink-0" />
            ) : (
              <Radio className="w-5 h-5 text-[#f59e0b] shrink-0" />
            )}
            <div className="flex flex-col min-w-0">
              <span className="font-['Chivo'] font-bold text-xs uppercase">
                {permission === 'granted'
                  ? 'Permisos Concedidos en el Navegador'
                  : permission === 'denied'
                  ? 'Permisos Bloqueados'
                  : 'Permisos Pendientes de Autorización'}
              </span>
              <span className="font-mono text-[9px] opacity-80 truncate">
                {permission === 'granted'
                  ? 'Notificaciones push y segundo plano activas'
                  : permission === 'denied'
                  ? 'Habilita las notificaciones en la barra de direcciones'
                  : 'Requiere autorización para recibir alertas fuera de la app'}
              </span>
            </div>
          </div>

          {permission !== 'granted' && (
            <button
              onClick={handleRequestPermission}
              className="px-2.5 py-1.5 rounded-lg bg-[#f59e0b] hover:bg-[#d97706] text-[#2a1700] font-['Chivo'] font-bold text-[10px] uppercase shrink-0 active:scale-95 transition-all shadow"
            >
              Habilitar
            </button>
          )}
        </div>

        <div className="flex flex-col gap-2.5">
          <span className="font-mono text-[9px] text-[#94a3b8] uppercase font-bold tracking-wider">
            Canales de Notificación:
          </span>

          <div
            onClick={() => handleTogglePref('aiAlerts')}
            className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
              prefs.aiAlerts ? 'bg-[#1e293b] border-[#f59e0b]/50' : 'bg-[#0b1326] border-[#222a3d]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <ShieldAlert
                className={`w-4 h-4 ${prefs.aiAlerts ? 'text-[#f59e0b]' : 'text-[#64748b]'}`}
              />
              <div className="flex flex-col">
                <span className="font-sans text-xs font-semibold text-[#dae2fd]">
                  Nuevas Alertas de Riesgo
                </span>
                <span className="font-mono text-[9px] text-[#94a3b8]">
                  Infracciones detectadas por cámaras CCTV en tiempo real
                </span>
              </div>
            </div>
            <div
              className={`w-9 h-5 rounded-full flex items-center p-0.5 transition-colors ${
                prefs.aiAlerts ? 'bg-[#f59e0b] justify-end' : 'bg-[#334155] justify-start'
              }`}
            >
              <div className="w-4 h-4 rounded-full bg-[#0b1326] shadow" />
            </div>
          </div>

          <div
            onClick={() => handleTogglePref('statusUpdates')}
            className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
              prefs.statusUpdates ? 'bg-[#1e293b] border-[#10b981]/50' : 'bg-[#0b1326] border-[#222a3d]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <CheckCircle2
                className={`w-4 h-4 ${prefs.statusUpdates ? 'text-[#10b981]' : 'text-[#64748b]'}`}
              />
              <div className="flex flex-col">
                <span className="font-sans text-xs font-semibold text-[#dae2fd]">
                  Actualizaciones de Estado de Casos
                </span>
                <span className="font-mono text-[9px] text-[#94a3b8]">
                  Casos asignados, en corrección y validados
                </span>
              </div>
            </div>
            <div
              className={`w-9 h-5 rounded-full flex items-center p-0.5 transition-colors ${
                prefs.statusUpdates ? 'bg-[#10b981] justify-end' : 'bg-[#334155] justify-start'
              }`}
            >
              <div className="w-4 h-4 rounded-full bg-[#0b1326] shadow" />
            </div>
          </div>

          <div
            onClick={() => handleTogglePref('soundEnabled')}
            className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
              prefs.soundEnabled ? 'bg-[#1e293b] border-[#38bdf8]/50' : 'bg-[#0b1326] border-[#222a3d]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {prefs.soundEnabled ? (
                <Volume2 className="w-4 h-4 text-[#38bdf8]" />
              ) : (
                <VolumeX className="w-4 h-4 text-[#64748b]" />
              )}
              <div className="flex flex-col">
                <span className="font-sans text-xs font-semibold text-[#dae2fd]">
                  Alarma Sonora & Vibración Táctil
                </span>
                <span className="font-mono text-[9px] text-[#94a3b8]">
                  Alerta acústica industrial optimizada para obras
                </span>
              </div>
            </div>
            <div
              className={`w-9 h-5 rounded-full flex items-center p-0.5 transition-colors ${
                prefs.soundEnabled ? 'bg-[#38bdf8] justify-end' : 'bg-[#334155] justify-start'
              }`}
            >
              <div className="w-4 h-4 rounded-full bg-[#0b1326] shadow" />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 pt-1 border-t border-[#222a3d]">
          <span className="font-mono text-[9px] text-[#94a3b8] uppercase font-bold tracking-wider">
            Comprobación de Entrega:
          </span>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleImmediateTest}
              className="px-3 py-2.5 rounded-xl bg-[#1e293b] hover:bg-[#283548] text-[#dae2fd] font-mono text-[10px] font-bold uppercase flex items-center justify-center gap-1.5 border border-[#334155] active:scale-95 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#f59e0b]" />
              Probar Ahora
            </button>

            <button
              onClick={handleBackgroundTest}
              disabled={isCountingDown}
              className={`px-3 py-2.5 rounded-xl font-mono text-[10px] font-bold uppercase flex items-center justify-center gap-1.5 transition-all border ${
                isCountingDown
                  ? 'bg-[#f59e0b]/20 text-[#f59e0b] border-[#f59e0b]'
                  : 'bg-[#f59e0b] text-[#2a1700] hover:bg-[#d97706] border-[#ffddb8]'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              {isCountingDown ? `Disparando en ${countdown}s...` : 'Probar Fondo (5s)'}
            </button>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full h-11 rounded-xl bg-[#1e293b] hover:bg-[#283548] text-[#dae2fd] font-['Chivo'] font-bold text-xs uppercase border border-[#334155] active:scale-95 transition-all mt-1"
        >
          Cerrar Configuración
        </button>
      </div>
    </div>
  );
};
