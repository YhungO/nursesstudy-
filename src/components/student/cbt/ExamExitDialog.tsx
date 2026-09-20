import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ExamExitDialogProps {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export const ExamExitDialog: React.FC<ExamExitDialogProps> = ({
  isOpen,
  onCancel,
  onConfirm,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="exit-exam-dialog-title"
    >
      <div className="w-full max-w-sm bg-[#111827] border border-slate-800 rounded-3xl shadow-2xl p-5 sm:p-6 space-y-4 text-white animate-in zoom-in-95 duration-150">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 shrink-0">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 id="exit-exam-dialog-title" className="text-base font-bold text-white">
              Exit Examination?
            </h3>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Your examination is still in progress. Exiting will cancel this session without submitting or scoring your answers.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-colors cursor-pointer"
          >
            Keep Testing
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 active:bg-rose-700 rounded-xl transition-colors cursor-pointer"
          >
            Exit Examination
          </button>
        </div>
      </div>
    </div>
  );
};
