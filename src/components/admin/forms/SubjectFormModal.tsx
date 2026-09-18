import React, { useState, useEffect } from 'react';
import { Subject } from '../../../types';
import { NURSING_LEVEL_OPTIONS, SUBJECT_COLORS, SUBJECT_ICONS } from './constants';
import {
  X,
  Hash,
} from 'lucide-react';

interface SubjectFormModalProps {
  subject: Partial<Subject> | null;
  onClose: () => void;
  onSave: (data: Partial<Subject>) => Promise<void>;
  existingSubjectsCount: number;
}

export const SubjectFormModal: React.FC<SubjectFormModalProps> = ({
  subject,
  onClose,
  onSave,
  existingSubjectsCount,
}) => {
  const [formData, setFormData] = useState<Partial<Subject>>({
    name: '',
    code: '',
    levelId: 'ND1',
    order: existingSubjectsCount + 1,
    description: '',
    icon: 'BookOpen',
    color: 'teal',
    isPublished: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (subject) {
      setFormData({
        ...subject,
        levelId: subject.levelId || 'ND1',
        order: subject.order !== undefined ? subject.order : existingSubjectsCount + 1,
        color: subject.color || 'teal',
        icon: subject.icon || 'BookOpen',
        isPublished: subject.isPublished !== undefined ? subject.isPublished : true,
      });
    } else {
      setFormData({
        name: '',
        code: '',
        levelId: 'ND1',
        order: existingSubjectsCount + 1,
        description: '',
        icon: 'BookOpen',
        color: 'teal',
        isPublished: true,
      });
    }
  }, [subject, existingSubjectsCount]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) {
      setErrorMessage('Please enter a subject name');
      return;
    }
    if (!formData.code?.trim()) {
      setErrorMessage('Please enter a course/subject code (e.g. PHARM-201)');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage('');
      await onSave({
        ...formData,
        name: formData.name.trim(),
        code: formData.code.trim().toUpperCase(),
        order: Number(formData.order) || 1,
        description: formData.description?.trim() || '',
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save subject');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedIconDef = SUBJECT_ICONS.find((i) => i.id === formData.icon) || SUBJECT_ICONS[0];
  const IconComponent = selectedIconDef.icon;
  const selectedColorDef = SUBJECT_COLORS.find((c) => c.id === formData.color) || SUBJECT_COLORS[0];

  return (
    <div
      id="subject-form-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-200"
    >
      <div
        id="subject-form-modal-container"
        className="bg-[#111827] rounded-3xl w-full max-w-xl border border-slate-800 shadow-2xl overflow-hidden my-6"
      >
        {/* Header */}
        <div className="px-6 py-4.5 bg-gradient-to-r from-slate-950 via-[#0f172a] to-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm ${selectedColorDef.bg}`}
            >
              <IconComponent className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                {formData.id ? 'Edit Nursing Subject' : 'Add New Nursing Subject'}
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Curriculum Course
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Configure academic level, catalog sequence order, and course syllabus.
              </p>
            </div>
          </div>
          <button
            id="close-subject-modal-btn"
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMessage && (
            <div className="p-3 bg-rose-950/40 border border-rose-500/40 rounded-xl text-xs text-rose-300 font-medium">
              {errorMessage}
            </div>
          )}

          {/* Row 1: Subject Name & Code */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Subject Name <span className="text-rose-400">*</span>
              </label>
              <input
                id="subject-name-input"
                type="text"
                required
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Pharmacology & Therapeutics"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Course Code <span className="text-rose-400">*</span>
              </label>
              <input
                id="subject-code-input"
                type="text"
                required
                value={formData.code || ''}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="e.g. PHARM-201"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono font-bold uppercase text-indigo-400 placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              />
            </div>
          </div>

          {/* Row 2: Nursing Level & Order / Position Number */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-slate-900/60 rounded-2xl border border-slate-800">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center justify-between">
                <span>Nursing Level</span>
                <span className="text-[10px] text-slate-400 font-normal">Target Cohort</span>
              </label>
              <select
                id="subject-level-select"
                value={formData.levelId || 'ND1'}
                onChange={(e) => setFormData({ ...formData, levelId: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-semibold text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                {NURSING_LEVEL_OPTIONS.map((lvl) => (
                  <option key={lvl.id} value={lvl.id}>
                    {lvl.label}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-500 mt-1">
                Designates which student level views this subject first.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center justify-between">
                <span>Order / Position Number</span>
                <span className="text-[10px] text-indigo-400 font-mono font-bold"># Index</span>
              </label>
              <div className="relative">
                <input
                  id="subject-order-input"
                  type="number"
                  min={1}
                  max={99}
                  required
                  value={formData.order ?? 1}
                  onChange={(e) =>
                    setFormData({ ...formData, order: parseInt(e.target.value, 10) || 1 })
                  }
                  className="w-full pl-8 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-bold text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <Hash className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Display sorting sequence in student catalog (1 = top).
              </p>
            </div>
          </div>

          {/* Row 3: Visual Icon & Theme Color */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Clinical Icon
              </label>
              <div className="flex items-center gap-2">
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center text-white shrink-0 ${selectedColorDef.bg}`}
                >
                  <IconComponent className="w-4 h-4" />
                </div>
                <select
                  id="subject-icon-select"
                  value={formData.icon || 'BookOpen'}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:ring-2 focus:ring-indigo-500"
                >
                  {SUBJECT_ICONS.map((ico) => (
                    <option key={ico.id} value={ico.id}>
                      {ico.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Color Accent
              </label>
              <div className="flex items-center gap-2">
                <span className={`w-4 h-4 rounded-full shrink-0 ${selectedColorDef.bg}`} />
                <select
                  id="subject-color-select"
                  value={formData.color || 'teal'}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:ring-2 focus:ring-indigo-500"
                >
                  {SUBJECT_COLORS.map((col) => (
                    <option key={col.id} value={col.id}>
                      {col.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Row 4: Curriculum Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Course Scope & Description
            </label>
            <textarea
              id="subject-description-textarea"
              rows={3}
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Summary of course competencies, core chapters covered, and clinical practice requirements..."
              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
            />
          </div>

          {/* Row 5: Publish Status Switch */}
          <div className="flex items-center justify-between p-3 bg-slate-900/60 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2.5">
              <input
                type="checkbox"
                id="subject-publish-checkbox"
                checked={formData.isPublished}
                onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                className="w-4 h-4 rounded text-indigo-500 focus:ring-indigo-500 border-slate-700 bg-slate-800 cursor-pointer"
              />
              <label
                htmlFor="subject-publish-checkbox"
                className="text-xs font-bold text-slate-200 cursor-pointer"
              >
                Publish immediately to student portal
              </label>
            </div>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                formData.isPublished
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              {formData.isPublished ? 'Active / Visible' : 'Draft / Hidden'}
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              id="cancel-subject-btn"
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-semibold text-slate-300 transition-colors"
            >
              Cancel
            </button>
            <button
              id="save-subject-btn"
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-colors shadow-md flex items-center gap-1.5"
            >
              {isSubmitting ? 'Saving...' : formData.id ? 'Update Subject' : 'Create & Save Subject'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
