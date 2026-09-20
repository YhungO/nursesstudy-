import React, { useState, useEffect } from 'react';
import { CBTExam, Subject } from '../../../types';
import { NURSING_LEVEL_OPTIONS } from './constants';
import {
  X,
  Award,
  Clock,
  Percent,
} from 'lucide-react';

interface CBTExamFormModalProps {
  exam: Partial<CBTExam> | null;
  subjects: Subject[];
  onClose: () => void;
  onSave: (data: Partial<CBTExam>) => Promise<void>;
}

export const CBTExamFormModal: React.FC<CBTExamFormModalProps> = ({
  exam,
  subjects,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<Partial<CBTExam>>({
    title: '',
    description: '',
    subjectId: 'all',
    levelId: 'ND1',
    durationMinutes: 30,
    totalQuestions: 15,
    passingScore: 70,
    status: 'published',
    isPublished: true,
    instructions: [],
  });

  const [instructionsInput, setInstructionsInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (exam) {
      const derivedStatus = exam.status || (exam.isPublished ? 'published' : 'draft');
      setFormData({
        ...exam,
        subjectId: exam.subjectId || 'all',
        levelId: exam.levelId || 'ND1',
        durationMinutes: exam.durationMinutes || 30,
        totalQuestions: exam.totalQuestions || 15,
        passingScore: exam.passingScore || 70,
        status: derivedStatus,
        isPublished: derivedStatus === 'published',
      });
      setInstructionsInput(
        (exam.instructions || [
          'Attempt all multiple choice questions within the allotted duration.',
          'Each question carries 1 mark. There is no negative grading penalty.',
          'You may flag questions and review your answers prior to final submission.',
          'Once submitted, immediate grading, analytics, and clinical rationales are provided.',
        ]).join('\n')
      );
    } else {
      setFormData({
        title: '',
        description: '',
        subjectId: 'all',
        levelId: 'ND1',
        durationMinutes: 30,
        totalQuestions: 15,
        passingScore: 70,
        status: 'published',
        isPublished: true,
        instructions: [],
      });
      setInstructionsInput(
        [
          'Attempt all multiple choice questions within the allotted duration.',
          'Each question carries 1 mark. There is no negative grading penalty.',
          'You may flag questions and review your answers prior to final submission.',
          'Once submitted, immediate grading, analytics, and clinical rationales are provided.',
        ].join('\n')
      );
    }
  }, [exam]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title?.trim()) {
      setErrorMessage('Please enter an exam title');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage('');

      const instructions = instructionsInput
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);

      const status = formData.status || 'published';

      await onSave({
        ...formData,
        title: formData.title.trim(),
        description: formData.description?.trim() || '',
        durationMinutes: Number(formData.durationMinutes) || 30,
        totalQuestions: Number(formData.totalQuestions) || 15,
        passingScore: Number(formData.passingScore) || 70,
        status,
        isPublished: status === 'published',
        instructions,
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save CBT exam');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      id="exam-form-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-200"
    >
      <div
        id="exam-form-modal-container"
        className="bg-[#111827] rounded-3xl w-full max-w-2xl border border-slate-800 shadow-2xl overflow-hidden my-6"
      >
        {/* Header */}
        <div className="px-6 py-4.5 bg-gradient-to-r from-slate-950 via-[#0f172a] to-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-sm">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                {formData.id ? 'Edit CBT Examination' : 'Create New CBT Exam'}
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Timed Examination
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Configure candidate testing parameters, duration, pass threshold, and exam syllabus.
              </p>
            </div>
          </div>
          <button
            id="close-exam-modal-btn"
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {errorMessage && (
            <div className="p-3 bg-rose-950/40 border border-rose-500/40 rounded-xl text-xs text-rose-300 font-medium">
              {errorMessage}
            </div>
          )}

          {/* Row 1: Exam Title & Associated Subject */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Exam Title <span className="text-rose-400">*</span>
              </label>
              <input
                id="exam-title-input"
                type="text"
                required
                value={formData.title || ''}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. ND1 Pharmacology Comprehensive Mock Examination"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-bold text-white placeholder:text-slate-500 focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Curriculum Subject
              </label>
              <select
                id="exam-subject-select"
                value={formData.subjectId || 'all'}
                onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-medium text-white focus:ring-2 focus:ring-amber-500"
              >
                <option value="all">Comprehensive (All Subjects)</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.code} - {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2: Target Nursing Level, Duration & Passing Score */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-slate-900/60 rounded-2xl border border-slate-800">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Target Nursing Level
              </label>
              <select
                id="exam-level-select"
                value={formData.levelId || 'ND1'}
                onChange={(e) => setFormData({ ...formData, levelId: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-semibold text-white focus:ring-2 focus:ring-amber-500"
              >
                {NURSING_LEVEL_OPTIONS.map((lvl) => (
                  <option key={lvl.id} value={lvl.id}>
                    {lvl.label}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-500 mt-1">Student cohort filter</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center justify-between">
                <span>Duration (Minutes)</span>
                <Clock className="w-3.5 h-3.5 text-slate-500" />
              </label>
              <input
                id="exam-duration-input"
                type="number"
                required
                min={5}
                max={240}
                value={formData.durationMinutes || 30}
                onChange={(e) =>
                  setFormData({ ...formData, durationMinutes: parseInt(e.target.value, 10) || 30 })
                }
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-bold text-white focus:ring-2 focus:ring-amber-500"
              />
              <p className="text-[11px] text-slate-500 mt-1">Active test countdown</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center justify-between">
                <span>Passing Score (%)</span>
                <Percent className="w-3.5 h-3.5 text-slate-500" />
              </label>
              <input
                id="exam-passing-score-input"
                type="number"
                required
                min={40}
                max={100}
                value={formData.passingScore || 70}
                onChange={(e) =>
                  setFormData({ ...formData, passingScore: parseInt(e.target.value, 10) || 70 })
                }
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-bold text-white focus:ring-2 focus:ring-amber-500"
              />
              <p className="text-[11px] text-slate-500 mt-1">Benchmark pass mark</p>
            </div>
          </div>

          {/* Row 3: Question Count & Short Description */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Question Count
              </label>
              <input
                id="exam-totalquestions-input"
                type="number"
                min={5}
                max={100}
                value={formData.totalQuestions || 15}
                onChange={(e) =>
                  setFormData({ ...formData, totalQuestions: parseInt(e.target.value, 10) || 15 })
                }
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-bold text-white focus:ring-2 focus:ring-amber-500"
              />
              <p className="text-[11px] text-slate-500 mt-1">Number of MCQs delivered</p>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Exam Overview Description
              </label>
              <input
                id="exam-description-input"
                type="text"
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="High-yield CBT mock assessment simulating final hospital nursing exams..."
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Row 4: Examination Candidate Instructions */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
              <span>Candidate Rules & Examination Guidelines (1 per line)</span>
              <span className="text-[10px] text-slate-500">Displayed on candidate pre-exam screen</span>
            </label>
            <textarea
              id="exam-instructions-textarea"
              rows={4}
              value={instructionsInput}
              onChange={(e) => setInstructionsInput(e.target.value)}
              placeholder="Attempt all questions within the allotted duration.&#10;Each question carries 1 mark.&#10;Calculator allowed for dosage calculations.&#10;Submit before timer expires to record official score."
              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-slate-200 focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Row 5: Content Lifecycle & Examination Availability */}
          <div className="p-3.5 bg-slate-900/80 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-200">
                Examination Lifecycle & Student Availability
              </label>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  formData.status === 'published'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : formData.status === 'archived'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                {formData.status === 'published'
                  ? '● Live in CBT Hall'
                  : formData.status === 'archived'
                  ? 'Archived (Scores Kept)'
                  : 'Draft / Closed'}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, status: 'draft', isPublished: false })}
                className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-all text-center ${
                  formData.status === 'draft'
                    ? 'bg-slate-800 text-white border-slate-600 shadow-xs ring-1 ring-slate-500'
                    : 'bg-slate-950/60 text-slate-400 border-slate-800/80 hover:bg-slate-900 hover:text-slate-300'
                }`}
              >
                Draft (Closed)
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, status: 'published', isPublished: true })}
                className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-all text-center ${
                  formData.status === 'published'
                    ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/60 shadow-xs ring-1 ring-emerald-400/40'
                    : 'bg-slate-950/60 text-slate-400 border-slate-800/80 hover:bg-slate-900 hover:text-slate-300'
                }`}
              >
                Published (Live)
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, status: 'archived', isPublished: false })}
                className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-all text-center ${
                  formData.status === 'archived'
                    ? 'bg-amber-950/80 text-amber-300 border-amber-500/60 shadow-xs ring-1 ring-amber-400/40'
                    : 'bg-slate-950/60 text-slate-400 border-slate-800/80 hover:bg-slate-900 hover:text-slate-300'
                }`}
              >
                Archived
              </button>
            </div>
            <p className="text-[11px] text-slate-500">
              {formData.status === 'published'
                ? 'Appears immediately for candidate seating in the CBT Examination Hall.'
                : formData.status === 'archived'
                ? 'Concluded and archived. All historical student scores, results, and attempts are permanently preserved.'
                : 'Hidden from students. Test cannot be started by candidates while in draft mode.'}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              id="cancel-exam-btn"
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-semibold text-slate-300 transition-colors"
            >
              Cancel
            </button>
            <button
              id="save-exam-btn"
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 rounded-xl text-xs font-bold transition-colors shadow-md flex items-center gap-1.5"
            >
              {isSubmitting ? 'Saving...' : formData.id ? 'Update Exam' : 'Create & Save CBT Exam'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
