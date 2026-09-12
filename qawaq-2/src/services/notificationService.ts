import { CaseItem, CaseStatus } from '../types';

export interface NotificationPreferences {
  enabled: boolean;
  aiAlerts: boolean;
  statusUpdates: boolean;
  soundEnabled: boolean;
}

const STORAGE_PREFS_KEY = 'qawaq_notification_prefs_v1';

export class NotificationService {
  private static swRegistration: ServiceWorkerRegistration | null = null;
  private static audioCtx: AudioContext | null = null;

  // Initialize service worker & restore preferences
  public static async init(): Promise<void> {
    if (typeof window === 'undefined') return;

    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
        });
        this.swRegistration = registration;
        console.log('[QAWAQ-SW] Service Worker registrado exitosamente con scope:', registration.scope);
      } catch (err) {
        console.warn('[QAWAQ-SW] Error registrando Service Worker:', err);
      }
    }
  }

  public static getPermission(): NotificationPermission {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'denied';
    }
    return Notification.permission;
  }

  public static async requestPermission(): Promise<NotificationPermission> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'denied';
    }
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        this.playSafetyTone('chime');
      }
      return permission;
    } catch (err) {
      console.error('Error solicitando permisos de notificación:', err);
      return 'denied';
    }
  }

  public static getPreferences(): NotificationPreferences {
    try {
      const saved = localStorage.getItem(STORAGE_PREFS_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    return {
      enabled: true,
      aiAlerts: true,
      statusUpdates: true,
      soundEnabled: true,
    };
  }

  public static savePreferences(prefs: NotificationPreferences): void {
    try {
      localStorage.setItem(STORAGE_PREFS_KEY, JSON.stringify(prefs));
    } catch (err) {
      console.error('Error guardando preferencias de notificación:', err);
    }
  }

  // Safety audible alert tone using Web Audio API
  public static playSafetyTone(type: 'alarm' | 'chime' | 'resolve' = 'alarm'): void {
    const prefs = this.getPreferences();
    if (!prefs.soundEnabled) return;

    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;

      if (!this.audioCtx) {
        this.audioCtx = new AudioContextClass();
      }

      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      if (type === 'alarm') {
        // High attention 2-tone alarm: 880Hz -> 659Hz
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.setValueAtTime(659, now + 0.12);
        osc.frequency.setValueAtTime(880, now + 0.24);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.4);
      } else if (type === 'resolve') {
        // Pleasant ascending major chord: 523Hz -> 659Hz -> 783Hz
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now);
        osc.frequency.setValueAtTime(659.25, now + 0.1);
        osc.frequency.setValueAtTime(783.99, now + 0.2);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.45);
        osc.start(now);
        osc.stop(now + 0.45);
      } else {
        // Simple subtle chime
        osc.type = 'sine';
        osc.frequency.setValueAtTime(750, now);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
      }
    } catch {
      // Audio autoplay policy might restrict until user interaction
    }
  }

  // Core notification dispatcher
  public static async dispatchNotification(options: {
    title: string;
    body: string;
    tag: string;
    data?: Record<string, unknown>;
    actions?: Array<{ action: string; title: string }>;
    vibratePattern?: number[];
    soundType?: 'alarm' | 'chime' | 'resolve';
  }): Promise<boolean> {
    const prefs = this.getPreferences();
    if (!prefs.enabled) return false;

    // Play audible tone
    if (options.soundType) {
      this.playSafetyTone(options.soundType);
    }

    const permission = this.getPermission();
    if (permission !== 'granted') {
      return false;
    }

    const payload = {
      title: options.title,
      body: options.body,
      icon: '/logo.svg',
      badge: '/logo.svg',
      tag: options.tag,
      data: options.data || {},
      vibrate: options.vibratePattern || [300, 100, 300, 100, 300],
      requireInteraction: true,
      actions: options.actions || [
        { action: 'view', title: 'Ver en App' }
      ],
    };

    // 1. Try displaying via Service Worker registration (best for background/foreground)
    if ('serviceWorker' in navigator) {
      try {
        const registration = this.swRegistration || (await navigator.serviceWorker.ready);
        if (registration && 'showNotification' in registration) {
          await registration.showNotification(payload.title, payload);
          return true;
        }
      } catch (err) {
        console.warn('Fallback: Service Worker showNotification failed:', err);
      }
    }

    // 2. Fallback to standard window Notification constructor if SW isn't active
    if ('Notification' in window) {
      try {
        new Notification(payload.title, {
          body: payload.body,
          icon: payload.icon,
          tag: payload.tag,
          data: payload.data,
        });
        return true;
      } catch (err) {
        console.warn('Fallback to standard notification failed:', err);
      }
    }

    return false;
  }

  // Notify for New AI Alert
  public static async notifyNewAiAlert(caseItem: CaseItem): Promise<boolean> {
    const prefs = this.getPreferences();
    if (!prefs.aiAlerts) return false;

    const isCritical = caseItem.urgencia === 'Alto';
    return this.dispatchNotification({
      title: `🚨 [ALERTA IA] ${caseItem.tipo.toUpperCase()}`,
      body: `Caso #${caseItem.id} detectado en ${caseItem.ubicacion}. Urgencia: ${caseItem.urgencia}. Responsable: ${caseItem.responsable}`,
      tag: `ai-alert-${caseItem.id}`,
      data: {
        caseId: caseItem.id,
        type: 'ai-alert',
        tab: 'alerta-ia',
      },
      vibratePattern: isCritical ? [400, 100, 400, 100, 400] : [250, 100, 250],
      soundType: isCritical ? 'alarm' : 'chime',
      actions: [
        { action: 'view', title: 'Ver Alerta' },
        { action: 'close-risk', title: 'Resolver' },
      ],
    });
  }

  // Notify for Case Status Update
  public static async notifyCaseStatusUpdate(
    caseItem: CaseItem,
    newStatus: CaseStatus,
    detailMessage?: string
  ): Promise<boolean> {
    const prefs = this.getPreferences();
    if (!prefs.statusUpdates) return false;

    const isClosed = newStatus === 'Cerrado';
    const statusEmoji = isClosed ? '✅' : '⚡';

    return this.dispatchNotification({
      title: `${statusEmoji} ESTADO: ${newStatus.toUpperCase()} // Caso #${caseItem.id}`,
      body: detailMessage || `Riesgo "${caseItem.tipo}" en ${caseItem.ubicacion} marcado como ${newStatus}.`,
      tag: `case-status-${caseItem.id}`,
      data: {
        caseId: caseItem.id,
        type: 'status-update',
        tab: isClosed ? 'dashboard' : 'cerrar-caso',
      },
      vibratePattern: isClosed ? [150, 80, 150] : [200, 100, 200],
      soundType: isClosed ? 'resolve' : 'chime',
      actions: [
        { action: 'view', title: 'Ver en Dashboard' },
      ],
    });
  }

  // Test background delivery with a countdown
  public static async scheduleBackgroundTest(delaySeconds: number = 5): Promise<void> {
    // If SW is available, post message to SW to fire in X seconds
    const registration = this.swRegistration || (await navigator.serviceWorker.ready);
    const payload = {
      title: '⚡ [DEMO BACKGROUND] QAWAQ Alerta de Prueba',
      body: `Esta notificación fue despachada desde el Service Worker en segundo plano (${delaySeconds}s después de programarse).`,
      tag: 'test-background-alert',
      data: { tab: 'dashboard' },
      delayMs: delaySeconds * 1000,
    };

    if (registration.active) {
      registration.active.postMessage({
        type: 'SCHEDULE_BACKGROUND_NOTIFICATION',
        payload,
      });
    } else {
      // Fallback
      setTimeout(() => {
        this.dispatchNotification({
          title: payload.title,
          body: payload.body,
          tag: payload.tag,
          soundType: 'alarm',
        });
      }, delaySeconds * 1000);
    }
  }
}
