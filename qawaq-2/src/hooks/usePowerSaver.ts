import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'qawaq_power_saver_pref';

export interface UsePowerSaverReturn {
  isPowerSaver: boolean;
  batteryLevel: number | null; // 0 - 100 percentage
  isCharging: boolean;
  isBatterySupported: boolean;
  pollingIntervalMs: number;
  pollingIntervalSeconds: number;
  isAutoTriggered: boolean;
  togglePowerSaver: () => void;
  setPowerSaver: (active: boolean) => void;
  simulateLowBattery: () => void;
}

export const usePowerSaver = (): UsePowerSaverReturn => {
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
  const [isCharging, setIsCharging] = useState<boolean>(false);
  const [isBatterySupported, setIsBatterySupported] = useState<boolean>(false);
  const [isAutoTriggered, setIsAutoTriggered] = useState<boolean>(false);

  const [isPowerSaver, setIsPowerSaver] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved !== null) {
        return saved === 'true';
      }
    } catch {
      // fallback
    }
    return false;
  });

  // Check hardware battery if supported by browser
  useEffect(() => {
    let batteryObj: any = null;

    const handleLevelChange = () => {
      if (batteryObj) {
        const levelPct = Math.round(batteryObj.level * 100);
        setBatteryLevel(levelPct);

        // Auto-activate power saver when battery <= 20% and not plugged in
        if (levelPct <= 20 && !batteryObj.charging) {
          setIsPowerSaver(true);
          setIsAutoTriggered(true);
        }
      }
    };

    const handleChargingChange = () => {
      if (batteryObj) {
        setIsCharging(batteryObj.charging);
        if (batteryObj.charging && isAutoTriggered) {
          // If charging and was auto-triggered, we can relax power saver
          setIsPowerSaver(false);
          setIsAutoTriggered(false);
        }
      }
    };

    if (typeof window !== 'undefined' && 'getBattery' in navigator) {
      (navigator as any)
        .getBattery()
        .then((bat: any) => {
          batteryObj = bat;
          setIsBatterySupported(true);
          const levelPct = Math.round(bat.level * 100);
          setBatteryLevel(levelPct);
          setIsCharging(bat.charging);

          if (levelPct <= 20 && !bat.charging) {
            setIsPowerSaver(true);
            setIsAutoTriggered(true);
          }

          bat.addEventListener('levelchange', handleLevelChange);
          bat.addEventListener('chargingchange', handleChargingChange);
        })
        .catch(() => {
          setIsBatterySupported(false);
          // Set a realistic mobile shift battery default if API fails
          setBatteryLevel(68);
        });
    } else {
      setIsBatterySupported(false);
      // Sensible mobile site battery default for simulation
      setBatteryLevel(64);
    }

    return () => {
      if (batteryObj) {
        batteryObj.removeEventListener('levelchange', handleLevelChange);
        batteryObj.removeEventListener('chargingchange', handleChargingChange);
      }
    };
  }, [isAutoTriggered]);

  const togglePowerSaver = useCallback(() => {
    setIsPowerSaver((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEY, String(next));
      } catch {
        // ignore
      }
      return next;
    });
    setIsAutoTriggered(false);
  }, []);

  const setPowerSaverState = useCallback((active: boolean) => {
    setIsPowerSaver(active);
    setIsAutoTriggered(false);
    try {
      localStorage.setItem(STORAGE_KEY, String(active));
    } catch {
      // ignore
    }
  }, []);

  const simulateLowBattery = useCallback(() => {
    setBatteryLevel(14);
    setIsCharging(false);
    setIsPowerSaver(true);
    setIsAutoTriggered(true);
  }, []);

  // Polling rate of simulated detections:
  // Normal mode: 7.5 seconds (7500ms)
  // Power Saver mode: 28 seconds (28000ms) - reduces CPU/network wakeups by ~73%
  const pollingIntervalMs = isPowerSaver ? 28000 : 7500;
  const pollingIntervalSeconds = isPowerSaver ? 28 : 8;

  return {
    isPowerSaver,
    batteryLevel,
    isCharging,
    isBatterySupported,
    pollingIntervalMs,
    pollingIntervalSeconds,
    isAutoTriggered,
    togglePowerSaver,
    setPowerSaver: setPowerSaverState,
    simulateLowBattery,
  };
};
