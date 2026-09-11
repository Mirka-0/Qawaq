import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'qawaq_power_saver_pref';

export interface UsePowerSaverReturn {
  isPowerSaver: boolean;
  batteryLevel: number | null;
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

  useEffect(() => {
    let batteryObj: any = null;

    const handleLevelChange = () => {
      if (batteryObj) {
        const levelPct = Math.round(batteryObj.level * 100);
        setBatteryLevel(levelPct);
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
          setBatteryLevel(68);
        });
    } else {
      setIsBatterySupported(false);
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
