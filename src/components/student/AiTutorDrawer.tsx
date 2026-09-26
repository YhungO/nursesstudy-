import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  X,
  Send,
  Loader2,
  BookOpen,
  AlertCircle,
  RotateCcw,
  CheckCircle2,
  HelpCircle,
  GraduationCap,
} from 'lucide-react';
import { api } from '../../services/api';
import { AiTutorMessage } from '../../types';

interface AiTutorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  initialTopic?: string;
  isEnabled?: boolean;
}

const SUGGESTED_PROMPTS = [
  'Explain the electrical conduction pathway of the heart step-by-step.',
  'What are the key differences between Type 1 and Type 2 Diabetes Mellitus?',
  'What are the early clinical signs and nursing priorities in hypovolemic shock?',
  'Explain the pathophysiology and nursing care for increased intracranial pressure.',
];

export const AiTutorDrawer: React.FC<AiTutorDrawerProps> = ({
  isOpen,
  onClose,
  initialTopic,
  isEnabled = true,
}) => {
  const [messages, setMessages] = useState<AiTutorMessage[]>([
    {
      id: 'welcome',
      sender: 'tutor',
      text: 'Hello! I am your AI Clinical Nursing Tutor. Ask me any nursing concept, physiological process, or drug mechanism and I will break it down clearly and step-by-step.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputPrompt, setInputPrompt] = useState(initialTopic || '');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  if (!isOpen) return null;

  const handleSendMessage = async (textToSend?: string) => {
    if (!isEnabled) {
      setErrorMsg('The AI Clinical Tutor has been disabled by the administrator.');
      return;
    }
    const prompt = (textToSend || inputPrompt).trim();
    if (!prompt || isLoading) return;

    setErrorMsg(null);
    const userMsg: AiTutorMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: prompt,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputPrompt('');
    setIsLoading(true);

    try {
      const response = await api.askAiTutor(prompt, initialTopic);
      const tutorMsg: AiTutorMessage = {
        id: `tut-${Date.now()}`,
        sender: 'tutor',
        text: response.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, tutorMsg]);
    } catch (err: any) {
      console.warn('AI Tutor request notice:', err);
      setErrorMsg(
        err.message ||
          'AI assistance is temporarily unavailable. You can continue using the normal CBT features.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: 'welcome-reset',
        sender: 'tutor',
        text: 'Chat cleared. What clinical nursing topic would you like to review next?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setErrorMsg(null);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-xs animate-in fade-in"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-lg h-full bg-[#0d1322] border-l border-slate-800 flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-[#111827] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center text-white shadow-md shadow-teal-500/20 ring-1 ring-teal-400/30">
              <Sparkles className="w-5 h-5 animate-pulse text-teal-100" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
                  AI Study Tutor
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-500/15 text-teal-300 border border-teal-500/30 uppercase tracking-wider">
                  Educational
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Clear, step-by-step clinical explanations
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleResetChat}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
              title="Reset conversation"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
              title="Close Tutor"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 custom-scrollbar">
          {messages.map((m) => {
            const isTutor = m.sender === 'tutor';
            return (
              <div
                key={m.id}
                className={`flex gap-3 ${isTutor ? 'justify-start' : 'justify-end'}`}
              >
                {isTutor && (
                  <div className="w-7 h-7 rounded-xl bg-teal-600/30 border border-teal-500/40 text-teal-300 flex items-center justify-center shrink-0 mt-0.5">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed shadow-sm ${
                    isTutor
                      ? 'bg-[#141d30] border border-slate-800 text-slate-200'
                      : 'bg-teal-600 text-white font-medium'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{m.text}</div>
                  <div
                    className={`text-[10px] mt-1.5 text-right ${
                      isTutor ? 'text-slate-500' : 'text-teal-200'
                    }`}
                  >
                    {m.timestamp}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex items-center gap-3 justify-start animate-in fade-in">
              <div className="w-7 h-7 rounded-xl bg-teal-600/30 border border-teal-500/40 text-teal-300 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4 animate-spin text-teal-400" />
              </div>
              <div className="p-3.5 rounded-2xl bg-[#141d30] border border-slate-800 text-slate-300 text-xs flex items-center gap-2 shadow-sm">
                <Loader2 className="w-4 h-4 animate-spin text-teal-400" />
                <span>AI Tutor is preparing your clinical explanation...</span>
              </div>
            </div>
          )}

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3.5 bg-rose-950/40 border border-rose-800/60 rounded-2xl text-xs text-rose-300 flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">
                {errorMsg}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        {messages.length <= 2 && (
          <div className="px-4 py-2 border-t border-slate-800/60 bg-[#0e1627]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
              Suggested High-Yield Topics:
            </span>
            <div className="flex flex-col gap-1.5">
              {SUGGESTED_PROMPTS.slice(0, 2).map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(item)}
                  disabled={isLoading}
                  className="text-left p-2 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] text-slate-300 hover:text-white hover:border-teal-500/40 hover:bg-slate-800/80 transition-all truncate"
                >
                  💡 {item}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="p-3 sm:p-4 border-t border-slate-800 bg-[#111827]">
          {!isEnabled && (
            <div className="mb-3 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
              <span>AI Tutor features are currently turned off by the platform administrator. Normal CBT exam features remain active.</span>
            </div>
          )}
          <div className="relative">
            <textarea
              ref={inputRef}
              rows={2}
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading || !isEnabled}
              placeholder={isEnabled ? "Ask the AI Tutor any clinical concept or question... (Enter to send)" : "AI Tutor is currently disabled by administrator."}
              className="w-full bg-[#0b0f19] border border-slate-700/80 rounded-2xl pl-3.5 pr-12 py-3 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all resize-none disabled:opacity-50"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputPrompt.trim() || isLoading || !isEnabled}
              className="absolute right-2.5 bottom-3.5 p-2 rounded-xl bg-teal-600 text-white hover:bg-teal-500 active:scale-95 disabled:opacity-40 disabled:hover:bg-teal-600 transition-all cursor-pointer shadow-md shadow-teal-900/40"
              title="Send question"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center justify-between mt-2 px-1">
            <span className="text-[10px] text-slate-500">
              Never changes examination scores or records.
            </span>
            <span className="text-[10px] text-slate-500">
              Shift + Enter for new line
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
