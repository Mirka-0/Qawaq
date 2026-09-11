import React from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { useCases } from '../context/CaseContext';

export const Toast: React.FC = () => {
  const { toast } = useCases();

  if (!toast) return null;

  const isSuccess =
    toast.toLowerCase().includes('cerrado') ||
    toast.toLowerCase().includes('éxito') ||
    toast.toLowerCase().includes('resuelto') ||
    toast.toLowerCase().includes('aprobado') ||
    toast.toLowerCase().includes('asignado');

  return (
    <div className="fixed top-20 left-4 right-4 z-50 max-w-md mx-auto pointer-events-none animate-in fade-in slide-in-from-top-4 duration-300">
      <div
        className={`p-3 rounded-xl backdrop-blur-xl shadow-2xl flex items-center gap-3 border ${
          isSuccess
            ? 'bg-[#064e3b]/95 border-[#10b981] text-[#ecfdf5]'
            : 'bg-[#450a0a]/95 border-[#ef4444] text-[#fee2e2]'
        }`}
      >
        <div
          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
            isSuccess ? 'bg-[#10b981]/20 text-[#34d399]' : 'bg-[#ef4444]/20 text-[#f87171]'
          }`}
        >
          {isSuccess ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-mono text-[10px] uppercase font-bold tracking-wider opacity-80">
            // QAWAQ SEGURIDAD
          </p>
          <p className="font-sans text-xs font-semibold leading-tight mt-0.5 truncate">
            {toast}
          </p>
        </div>
      </div>
    </div>
  );
};
