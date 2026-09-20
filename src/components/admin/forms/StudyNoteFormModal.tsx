import React, { useState, useEffect } from 'react';
import { StudyNote, Subject } from '../../../types';
import { NURSING_LEVEL_OPTIONS } from './constants';
import {
  X,
  BookOpen,
  Clock,
  ListOrdered,
  Lightbulb,
} from 'lucide-react';

interface StudyNoteFormModalProps {
  note: Partial<StudyNote> | null;
  subjects: Subject[];
  onClose: () => void;
  onSave: (data: Partial<StudyNote>) => Promise<void>;
}

export const StudyNoteFormModal: React.FC<StudyNoteFormModalProps> = ({
  note,
  subjects,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<Partial<StudyNote>>({
    title: '',
    topic: '',
    subjectId: subjects[0]?.id || '',
    levelId: 'ND1',
    summary: '',
    content: '',
    readingTime: 5,
    status: 'published',
    isPublished: true,
  });
  const [pearlsInput, setPearlsInput] = useState('');
  const [pointsInput, setPointsInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (note) {
      const derivedStatus = note.status || (note.isPublished ? 'published' : 'draft');
      setFormData({
        ...note,
        subjectId: note.subjectId || subjects[0]?.id || '',
        levelId: note.levelId || 'ND1',
        readingTime: note.readingTime || 5,
        status: derivedStatus,
        isPublished: derivedStatus === 'published',
      });
      setPearlsInput(note.clinicalPearls ? note.clinicalPearls.join('\n') : '');
      setPointsInput(note.keyPoints ? note.keyPoints.join('\n') : '');
    } else {
      setFormData({
        title: '',
        topic: '',
        subjectId: subjects[0]?.id || '',
        levelId: 'ND1',
        summary: '',
        content: '',
        readingTime: 5,
        status: 'published',
        isPublished: true,
      });
      setPearlsInput('');
      setPointsInput('');
    }
  }, [note, subjects]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title?.trim()) {
      setErrorMessage('Please enter a note title');
      return;
    }
    if (!formData.subjectId) {
      setErrorMessage('Please select a parent subject');
      return;
    }
    if (!formData.content?.trim()) {
      setErrorMessage('Please enter the clinical content');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage('');

      const clinicalPearls = pearlsInput
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);

      const keyPoints = pointsInput
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);

      const status = formData.status || 'published';

      await onSave({
        ...formData,
        title: formData.title.trim(),
        topic: formData.topic?.trim() || 'General Concept',
        clinicalPearls,
        keyPoints,
        readingTime: Number(formData.readingTime) || 5,
        status,
        isPublished: status === 'published',
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save study note');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedSubject = subjects.find((s) => s.id === formData.subjectId);

  return (
    <div
      id="note-form-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-200"
    >
      <div
        id="note-form-modal-container"
        className="bg-[#111827] rounded-3xl w-full max-w-3xl border border-slate-800 shadow-2xl overflow-hidden my-6"
      >
        {/* Header */}
        <div className="px-6 py-4.5 bg-gradient-to-r from-slate-950 via-[#0f172a] to-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-sm">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                {formData.id ? 'Edit Clinical Study Note' : 'Add New Study Note'}
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Subject-Linked
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Author curriculum-aligned clinical notes, high-yield pearls, and exam review notes.
              </p>
            </div>
          </div>
          <button
            id="close-note-modal-btn"
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

          {/* Row 1: Linked Subject, Nursing Level & Reading Time */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-slate-900/60 rounded-2xl border border-slate-800">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Linked Subject <span className="text-rose-400">*</span>
              </label>
              <select
                id="note-subject-select"
                required
                value={formData.subjectId || ''}
                onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-semibold text-white focus:ring-2 focus:ring-amber-500"
              >
                {subjects.map((subj) => (
                  <option key={subj.id} value={subj.id}>
                    {subj.code} - {subj.name}
                  </option>
                ))}
              </select>
              {selectedSubject && (
                <p className="text-[11px] text-amber-400 font-medium mt-1 truncate">
                  Code: {selectedSubject.code}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Target Nursing Level
              </label>
              <select
                id="note-level-select"
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
              <p className="text-[11px] text-slate-500 mt-1">Recommended cohort</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Reading Time (Mins)
              </label>
              <div className="relative">
                <input
                  id="note-readingtime-input"
                  type="number"
                  min={1}
                  max={60}
                  value={formData.readingTime || 5}
                  onChange={(e) =>
                    setFormData({ ...formData, readingTime: parseInt(e.target.value, 10) || 5 })
                  }
                  className="w-full pl-8 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-bold text-white focus:ring-2 focus:ring-amber-500"
                />
                <Clock className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Estimated duration</p>
            </div>
          </div>

          {/* Row 2: Topic & Article Title */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Curriculum Topic <span className="text-rose-400">*</span>
              </label>
              <input
                id="note-topic-input"
                type="text"
                required
                value={formData.topic || ''}
                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                placeholder="e.g. Cardiac Glycosides & Inotropes"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-medium text-white focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Study Note Title <span className="text-rose-400">*</span>
              </label>
              <input
                id="note-title-input"
                type="text"
                required
                value={formData.title || ''}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Digoxin Toxicity, Serum Monitoring & Nursing Interventions"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-bold text-white focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Row 3: Summary */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Executive Summary (Card Preview)
            </label>
            <input
              id="note-summary-input"
              type="text"
              value={formData.summary || ''}
              onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
              placeholder="High-level overview of key clinical mechanisms and warnings visible on student search cards..."
              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Row 4: Clinical Pearls & Key Points (2 Columns) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-amber-400 mb-1 flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                <span>High-Yield Clinical Pearls (1 per line)</span>
              </label>
              <textarea
                id="note-pearls-textarea"
                rows={3}
                value={pearlsInput}
                onChange={(e) => setPearlsInput(e.target.value)}
                placeholder="Always check apical pulse for 1 full minute prior to administration.&#10;Hold digoxin if adult heart rate is below 60 bpm.&#10;Hypokalemia significantly increases risk of digitalis toxicity."
                className="w-full px-3 py-2 border border-amber-500/30 bg-amber-950/20 rounded-xl text-xs font-mono text-amber-200 focus:ring-2 focus:ring-amber-500"
              />
              <p className="text-[10px] text-slate-500 mt-1">Highlighted in prominent gold pill boxes.</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-sky-400 mb-1 flex items-center gap-1.5">
                <ListOrdered className="w-3.5 h-3.5 text-sky-400" />
                <span>Core Examination Key Points (1 per line)</span>
              </label>
              <textarea
                id="note-points-textarea"
                rows={3}
                value={pointsInput}
                onChange={(e) => setPointsInput(e.target.value)}
                placeholder="Therapeutic serum digoxin range: 0.5 to 2.0 ng/mL.&#10;Early toxicity signs: Anorexia, nausea, vomiting, visual halos.&#10;Digibind (Digoxin Immune Fab) is the specific antidote."
                className="w-full px-3 py-2 border border-sky-500/30 bg-sky-950/20 rounded-xl text-xs font-mono text-sky-200 focus:ring-2 focus:ring-sky-500"
              />
              <p className="text-[10px] text-slate-500 mt-1">Rendered as numbered review facts.</p>
            </div>
          </div>

          {/* Row 5: Detailed Content (Markdown) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-300">
                Detailed Note Content <span className="text-rose-400">*</span>
              </label>
              <span className="text-[11px] text-slate-500 font-mono">
                Supports Markdown (###, **, *, `code`)
              </span>
            </div>
            <textarea
              id="note-content-textarea"
              rows={7}
              required
              value={formData.content || ''}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="### 1. Mechanism of Action&#10;Digoxin inhibits the sodium-potassium adenosine triphosphatase (Na+/K+ ATPase) pump, leading to an increase in intracellular calcium concentration...&#10;&#10;### 2. Indications & Dosage&#10;* Heart failure with reduced ejection fraction&#10;* Atrial fibrillation / atrial flutter rate control"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-white placeholder:text-slate-500 focus:ring-2 focus:ring-amber-500 transition-all"
            />
          </div>

          {/* Row 6: Content Lifecycle Status */}
          <div className="p-3.5 bg-slate-900/80 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-200">
                Content Lifecycle & Visibility Status
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
                  ? '● Live for Students'
                  : formData.status === 'archived'
                  ? 'Archived'
                  : 'Draft (Admin Only)'}
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
                Draft (Private)
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
                ? 'Appears instantly in real-time on all active student portals across mobile and desktop.'
                : formData.status === 'archived'
                ? 'Safely stored in admin historical archives without deleting any student study records.'
                : 'Visible and editable only to verified platform administrators.'}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              id="cancel-note-btn"
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-semibold text-slate-300 transition-colors"
            >
              Cancel
            </button>
            <button
              id="save-note-btn"
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 rounded-xl text-xs font-bold transition-colors shadow-md flex items-center gap-1.5"
            >
              {isSubmitting ? 'Saving...' : formData.id ? 'Update Note' : 'Save & Publish Note'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
