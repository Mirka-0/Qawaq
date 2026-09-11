import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  RefreshCw,
  AlertOctagon,
  ShieldCheck,
  Send,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Flame,
  Info,
} from 'lucide-react';
import { useCases } from '../context/CaseContext';
import { useRole } from '../context/RoleContext';
import { GeminiService } from '../services/geminiService';
import { AiIntelligenceSummary, AiPrioritizationResult } from '../types';

export const QawaqIntelligenceCard: React.FC = () => {
  const { cases } = useCases();
  const { currentUserName, currentRole } = useRole();

  const [summary, setSummary] = useState<AiIntelligenceSummary | null>(null);
  const [prioritization, setPrioritization] = useState<AiPrioritizationResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  // Chat conversational assistant state
  const [chatOpen, setChatOpen] = useState<boolean>(false);
  const [chatInput, setChatInput] = useState<string>('');
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string }>>([
    {
      sender: 'ai',
      text: 'Hola. Soy Qawaq Risk Assistant. Pregúntame qué riesgos priorizar o qué medidas tomar en tu frente según la Norma G.050 y D.S. 011-2019-TR.',
    },
  ]);
  const [isChatLoading, setIsChatLoading] = useState<boolean>(false);

  const fetchAnalysis = async () => {
    setIsLoading(true);
    try {
      const [sumRes, prioRes] = await Promise.all([
        GeminiService.getIntelligenceSummary(currentUserName, currentRole, cases),
        GeminiService.prioritizeCases(cases),
      ]);
      setSummary(sumRes);
      setPrioritization(prioRes);
    } catch (err) {
      console.error('Error fetching intelligence analysis:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalysis();
  }, [cases.length, currentUserName, currentRole]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatLoading) return;

    const userText = chatInput.trim();
    setChatInput('');
    setChatMessages((prev) => [...prev, { sender: 'user', text: userText }]);
    setIsChatLoading(true);

    try {
      const reply = await GeminiService.sendChatMessage(userText, cases);
      setChatMessages((prev) => [...prev, { sender: 'ai', text: reply }]);
    } catch (err) {
      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: 'No pude conectar con el motor de IA en este momento. Revisa el caso crítico con menor tiempo de SLA en tu panel.',
        },
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  return (
    <div className="bg-[#131b2e] border border-[#222a3d] rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
      {/* Header bar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#f59e0b]/20 text-[#f59e0b] border border-[#f59e0b]/40 flex items-center justify-center font-bold">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-headline font-bold text-sm sm:text-base text-white uppercase tracking-tight">
                Qawaq Intelligence
              </h2>
              <span className="font-label text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold uppercase border border-emerald-500/30">
                Gemini 2.5 Structured Output
              </span>
            </div>
            <p className="font-body text-xs text-[#94a3b8]">
              {summary ? summary.saludo : 'Analizando matriz IPERC y condiciones abiertas de obra...'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setChatOpen(!chatOpen)}
            className={`px-3 py-1.5 rounded-xl font-label text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all active:scale-95 border ${
              chatOpen
                ? 'bg-[#f59e0b] text-[#1c1002] border-[#f59e0b]'
                : 'bg-[#1e293b] hover:bg-[#283548] text-[#dae2fd] border-[#334155]'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>{chatOpen ? 'Cerrar Asistente' : 'Consultar Asistente'}</span>
          </button>

          <button
            type="button"
            onClick={fetchAnalysis}
            disabled={isLoading}
            className="p-2 rounded-xl bg-[#1e293b] hover:bg-[#283548] text-[#94a3b8] hover:text-white border border-[#334155] transition-colors"
            title="Actualizar análisis con IA"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#f59e0b]' : ''}`} />
          </button>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 rounded-xl bg-[#1e293b] hover:bg-[#283548] text-[#94a3b8] hover:text-white border border-[#334155] transition-colors"
            title={isExpanded ? 'Colapsar panel' : 'Expandir panel'}
          >
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="space-y-4 pt-1">
          {/* Executive Summary Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="bg-[#0b1326] p-3 rounded-xl border border-[#1e293b]">
              <span className="font-label text-[11px] text-[#94a3b8] uppercase font-bold block">
                Total Analizado
              </span>
              <span className="font-mono text-2xl font-black text-[#dae2fd]">
                {summary?.total_analizado ?? cases.length}
              </span>
            </div>

            <div className="bg-[#0b1326] p-3 rounded-xl border border-red-500/30">
              <span className="font-label text-[11px] text-red-400 uppercase font-bold block">
                Riesgos Críticos
              </span>
              <span className="font-mono text-2xl font-black text-red-400">
                {summary?.riesgos_criticos ?? cases.filter((c) => c.prioridad === 'Crítico').length}
              </span>
            </div>

            <div className="bg-[#0b1326] p-3 rounded-xl border border-amber-500/30">
              <span className="font-label text-[11px] text-[#f59e0b] uppercase font-bold block">
                Riesgos Repetitivos
              </span>
              <span className="font-mono text-2xl font-black text-[#f59e0b]">
                {summary?.riesgos_repetitivos ?? 1}
              </span>
            </div>

            <div className="bg-[#0b1326] p-3 rounded-xl border border-[#1e293b]">
              <span className="font-label text-[11px] text-[#94a3b8] uppercase font-bold block truncate">
                Zona Más Crítica
              </span>
              <span className="font-body text-xs font-bold text-white truncate block mt-1">
                {summary?.zona_mas_critica ?? 'Frente B (Losa)'}
              </span>
            </div>
          </div>

          {/* Key Strategic Recommendation */}
          {summary && (
            <div className="bg-[#0b1326] border border-[#f59e0b]/40 rounded-xl p-3.5 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-[#f59e0b]/20 text-[#f59e0b] shrink-0 mt-0.5">
                <AlertOctagon className="w-4 h-4" />
              </div>
              <div>
                <span className="font-label text-[11px] text-[#f59e0b] font-bold uppercase tracking-wider block">
                  Recomendación Estratégica del Día (Norma G.050)
                </span>
                <p className="font-body text-xs text-[#e2e8f0] leading-relaxed mt-0.5">
                  {summary.recomendacion_principal}
                </p>
              </div>
            </div>
          )}

          {/* Structured Prioritization List (Schema 3.2) */}
          {prioritization && prioritization.atencion_inmediata.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-label text-xs uppercase font-bold text-red-400 flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-red-500" />
                  Casos de Atención Inmediata Priorizados por IA
                </span>
                <span className="font-label text-[10px] text-[#94a3b8] uppercase font-bold">
                  SLA Crítico
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {prioritization.atencion_inmediata.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-[#0b1326] border border-red-500/30 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono text-[10px] text-red-400 font-bold">
                          CASO #{item.caso_id}
                        </span>
                        <span className="px-1.5 py-0.2 rounded bg-red-500/20 text-red-300 font-label text-[9px] font-bold uppercase">
                          Prioridad 1
                        </span>
                      </div>
                      <p className="font-body text-xs font-semibold text-white">{item.resumen}</p>
                    </div>
                    <span className="font-body text-[10px] text-[#94a3b8] mt-2 block">
                      Motivo: {item.motivo_prioridad}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Conversational Assistant Box */}
          {chatOpen && (
            <div className="bg-[#070d18] border border-[#222a3d] rounded-xl p-3.5 space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-[#1e293b] pb-2">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-[#f59e0b]" />
                  <span className="font-headline font-bold text-xs uppercase text-white">
                    Asistente de Consulta Normativa SSOMA
                  </span>
                </div>
                <span className="font-label text-[10px] text-[#94a3b8] uppercase">
                  Contexto de Obra en Vivo
                </span>
              </div>

              {/* Chat history */}
              <div className="max-h-48 overflow-y-auto space-y-2 pr-1 font-body text-xs">
                {chatMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`p-2.5 rounded-xl ${
                      msg.sender === 'user'
                        ? 'bg-[#1e293b] text-white ml-6 text-right'
                        : 'bg-[#131b2e] text-[#cbd5e1] mr-6 border border-[#222a3d]'
                    }`}
                  >
                    <span className="font-label text-[10px] uppercase font-bold text-[#f59e0b] block mb-0.5">
                      {msg.sender === 'user' ? 'Tú' : 'Qawaq Assistant'}
                    </span>
                    <p className="leading-relaxed">{msg.text}</p>
                  </div>
                ))}
                {isChatLoading && (
                  <div className="p-2.5 rounded-xl bg-[#131b2e] text-[#94a3b8] mr-6 border border-[#222a3d] font-body text-xs flex items-center gap-2">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#f59e0b]" />
                    <span>Consultando normativa técnica y matriz IPERC...</span>
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ej. ¿Qué riesgos debo revisar primero hoy?"
                  className="flex-1 bg-[#0b1326] border border-[#222a3d] rounded-xl px-3 py-2 text-xs text-white font-body focus:border-[#f59e0b] outline-none"
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim() || isChatLoading}
                  className="px-3 py-2 rounded-xl bg-[#f59e0b] hover:bg-[#d97706] disabled:opacity-40 text-[#1c1002] font-label font-bold text-xs uppercase tracking-wider flex items-center gap-1 transition-all active:scale-95"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Enviar</span>
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
