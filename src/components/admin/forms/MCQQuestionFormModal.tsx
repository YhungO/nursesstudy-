import React, { useState, useEffect } from 'react';
import { Question, Subject } from '../../../types';
import { NURSING_LEVEL_OPTIONS } from './constants';
import {
  X,
  CheckCircle2,
  FileQuestion,
} from 'lucide-react';

interface MCQQuestionFormModalProps {
  question: Partial<Question> | null;
  subjects: Subject[];
  onClose: () => void;
  onSave: (data: Partial<Question>) => Promise<void>;
}

export const MCQQuestionFormModal: React.FC<MCQQuestionFormModalProps> = ({
  question,
  subjects,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<Partial<Question>>({
    subjectId: subjects[0]?.id || '',
    topic: '',
    levelId: 'ND1',
    difficulty: 'Medium',
    scenario: '',
    questionText: '',
    correctOption: 'A',
    explanation: '',
    tags: [],
  });

  const [optionAText, setOptionAText] = useState('');
  const [optionBText, setOptionBText] = useState('');
  const [optionCText, setOptionCText] = useState('');
  const [optionDText, setOptionDText] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (question) {
      setFormData({
        ...question,
        subjectId: question.subjectId || subjects[0]?.id || '',
        levelId: question.levelId || 'ND1',
        difficulty: question.difficulty || 'Medium',
        correctOption: question.correctOption || 'A',
      });
      const getOptText = (id: 'A' | 'B' | 'C' | 'D', index: number) => {
        if (!question.options || !Array.isArray(question.options)) return '';
        const opt = question.options[index];
        if (typeof opt === 'string') return opt;
        const found = question.options.find((o) => typeof o === 'object' && o !== null && o.id === id);
        if (found && typeof found === 'object') return found.text || '';
        return typeof opt === 'object' && opt !== null ? opt.text || '' : '';
      };
      setOptionAText(getOptText('A', 0));
      setOptionBText(getOptText('B', 1));
      setOptionCText(getOptText('C', 2));
      setOptionDText(getOptText('D', 3));
      setTagsInput((question.tags || []).join(', '));
    } else {
      setFormData({
        subjectId: subjects[0]?.id || '',
        topic: 'General Clinical Knowledge',
        levelId: 'ND1',
        difficulty: 'Medium',
        scenario: '',
        questionText: '',
        correctOption: 'A',
        explanation: '',
        tags: [],
      });
      setOptionAText('');
      setOptionBText('');
      setOptionCText('');
      setOptionDText('');
      setTagsInput('');
    }
  }, [question, subjects]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.subjectId) {
      setErrorMessage('Please select an associated subject');
      return;
    }
    if (!formData.questionText?.trim()) {
      setErrorMessage('Please provide the clinical question stem');
      return;
    }
    if (!optionAText.trim() || !optionBText.trim() || !optionCText.trim() || !optionDText.trim()) {
      setErrorMessage('Please fill in all 4 multiple choice options (A, B, C, and D)');
      return;
    }
    if (!formData.correctOption) {
      setErrorMessage('Please designate the correct answer key (A, B, C, or D)');
      return;
    }
    if (!formData.explanation?.trim()) {
      setErrorMessage('Please provide a clinical rationale explaining the correct answer');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage('');

      const options = [
        { id: 'A' as const, text: optionAText.trim() },
        { id: 'B' as const, text: optionBText.trim() },
        { id: 'C' as const, text: optionCText.trim() },
        { id: 'D' as const, text: optionDText.trim() },
      ];

      const tags = tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      await onSave({
        ...formData,
        questionText: formData.questionText.trim(),
        topic: formData.topic?.trim() || 'General Clinical Nursing',
        scenario: formData.scenario?.trim() || '',
        explanation: formData.explanation.trim(),
        options,
        tags,
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save question');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedCorrectOption = formData.correctOption || 'A';

  return (
    <div
      id="mcq-form-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-200"
    >
      <div
        id="mcq-form-modal-container"
        className="bg-[#111827] rounded-3xl w-full max-w-3xl border border-slate-800 shadow-2xl overflow-hidden my-6"
      >
        {/* Header */}
        <div className="px-6 py-4.5 bg-gradient-to-r from-slate-950 via-[#0f172a] to-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 shadow-sm">
              <FileQuestion className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                {formData.id ? 'Edit MCQ Question' : 'Add New MCQ Question'}
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  CBT Question Bank
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Author multiple choice questions with 4 choices (A-D), designated correct key, and clinical rationales.
              </p>
            </div>
          </div>
          <button
            id="close-mcq-modal-btn"
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

          {/* Row 1: Subject, Level & Difficulty */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-slate-900/60 rounded-2xl border border-slate-800">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Linked Subject <span className="text-rose-400">*</span>
              </label>
              <select
                id="mcq-subject-select"
                required
                value={formData.subjectId || ''}
                onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-semibold text-white focus:ring-2 focus:ring-purple-500"
              >
                {subjects.map((subj) => (
                  <option key={subj.id} value={subj.id}>
                    {subj.code} - {subj.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Target Nursing Level
              </label>
              <select
                id="mcq-level-select"
                value={formData.levelId || 'ND1'}
                onChange={(e) => setFormData({ ...formData, levelId: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-semibold text-white focus:ring-2 focus:ring-purple-500"
              >
                {NURSING_LEVEL_OPTIONS.map((lvl) => (
                  <option key={lvl.id} value={lvl.id}>
                    {lvl.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Difficulty Level
              </label>
              <select
                id="mcq-difficulty-select"
                value={formData.difficulty || 'Medium'}
                onChange={(e) =>
                  setFormData({ ...formData, difficulty: e.target.value as 'Easy' | 'Medium' | 'Hard' })
                }
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-semibold text-white focus:ring-2 focus:ring-purple-500"
              >
                <option value="Easy">Easy (Recall / Fundamental)</option>
                <option value="Medium">Medium (Application / Clinical)</option>
                <option value="Hard">Hard (Synthesis / Board NCLEX)</option>
              </select>
            </div>
          </div>

          {/* Row 2: Clinical Topic & Tags */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Clinical Topic <span className="text-rose-400">*</span>
              </label>
              <input
                id="mcq-topic-input"
                type="text"
                required
                value={formData.topic || ''}
                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                placeholder="e.g. Fluid & Electrolytes, Inotropic Drugs"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-medium text-white placeholder:text-slate-500 focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Tags / Keywords (comma separated)
              </label>
              <input
                id="mcq-tags-input"
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="e.g. Digoxin, Toxicity, Potassium, ECG"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Row 3: Scenario / Vignette */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
              <span>Patient Scenario / Clinical Vignette (Optional)</span>
              <span className="text-[10px] text-slate-500 font-normal">Contextual Case</span>
            </label>
            <textarea
              id="mcq-scenario-textarea"
              rows={2}
              value={formData.scenario || ''}
              onChange={(e) => setFormData({ ...formData, scenario: e.target.value })}
              placeholder="e.g. A 68-year-old female patient with chronic heart failure has been receiving intravenous furosemide and oral digoxin. Her laboratory results show serum potassium 2.9 mEq/L and digoxin 2.4 ng/mL..."
              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs focus:ring-2 focus:ring-purple-500 text-slate-200 placeholder:text-slate-500"
            />
          </div>

          {/* Row 4: Question Stem */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Question Stem <span className="text-rose-400">*</span>
            </label>
            <textarea
              id="mcq-questiontext-textarea"
              rows={2}
              required
              value={formData.questionText || ''}
              onChange={(e) => setFormData({ ...formData, questionText: e.target.value })}
              placeholder="e.g. Which clinical manifestation should the nurse immediately assess for as an indicator of toxicity?"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-medium text-white placeholder:text-slate-500 focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Row 5: 4 Multiple Choice Options (A, B, C, D) */}
          <div className="space-y-2.5 p-4 bg-slate-900/60 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <span>Multiple Choice Options</span>
                <span className="text-[11px] font-normal normal-case text-slate-500">
                  (Click any option key to designate it as correct)
                </span>
              </span>
              <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 px-2 py-0.5 rounded-md">
                Correct Key: Option {selectedCorrectOption}
              </span>
            </div>

            {(['A', 'B', 'C', 'D'] as const).map((optKey) => {
              const val =
                optKey === 'A'
                  ? optionAText
                  : optKey === 'B'
                  ? optionBText
                  : optKey === 'C'
                  ? optionCText
                  : optionDText;
              const setter =
                optKey === 'A'
                  ? setOptionAText
                  : optKey === 'B'
                  ? setOptionBText
                  : optKey === 'C'
                  ? setOptionCText
                  : setOptionDText;
              const isCorrect = selectedCorrectOption === optKey;

              return (
                <div
                  key={optKey}
                  className={`flex items-center gap-2.5 p-2 rounded-xl transition-all ${
                    isCorrect
                      ? 'bg-emerald-950/40 border-2 border-emerald-500 shadow-sm'
                      : 'bg-slate-900 border border-slate-800'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, correctOption: optKey })}
                    className={`w-7 h-7 rounded-lg font-bold text-xs flex items-center justify-center transition-colors shrink-0 ${
                      isCorrect
                        ? 'bg-emerald-500 text-slate-950 font-black shadow-sm'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                    title="Click to set as correct answer"
                  >
                    {optKey}
                  </button>
                  <input
                    id={`mcq-option-${optKey}-input`}
                    type="text"
                    required
                    value={val}
                    onChange={(e) => setter(e.target.value)}
                    placeholder={`Enter Option ${optKey} choice...`}
                    className="flex-1 bg-transparent px-2 py-1 text-xs text-white placeholder:text-slate-500 focus:outline-hidden font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, correctOption: optKey })}
                    className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 shrink-0 ${
                      isCorrect
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'text-slate-500 hover:text-emerald-400 hover:bg-slate-800'
                    }`}
                  >
                    {isCorrect ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Correct Answer</span>
                      </>
                    ) : (
                      <span>Mark Correct</span>
                    )}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Row 6: Correct Key Dropdown Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Designated Correct Answer Key <span className="text-rose-400">*</span>
              </label>
              <select
                id="mcq-correctoption-select"
                value={formData.correctOption || 'A'}
                onChange={(e) =>
                  setFormData({ ...formData, correctOption: e.target.value as 'A' | 'B' | 'C' | 'D' })
                }
                className="w-full px-3 py-2 bg-emerald-950/40 border border-emerald-500/40 rounded-xl text-xs font-bold text-emerald-300 focus:ring-2 focus:ring-emerald-500"
              >
                <option value="A">Option A is the Correct Answer</option>
                <option value="B">Option B is the Correct Answer</option>
                <option value="C">Option C is the Correct Answer</option>
                <option value="D">Option D is the Correct Answer</option>
              </select>
            </div>
            <div className="flex items-center text-xs text-slate-500 pt-5">
              <span>Awarded 100% credit during CBT exams and student practice drills.</span>
            </div>
          </div>

          {/* Row 7: Clinical Rationale & Explanation */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
              <span>Clinical Rationale & In-Depth Explanation <span className="text-rose-400">*</span></span>
              <span className="text-[11px] text-slate-500">Shown in exam review & instant explanations</span>
            </label>
            <textarea
              id="mcq-explanation-textarea"
              rows={4}
              required
              value={formData.explanation || ''}
              onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
              placeholder="Explain why Option A is correct based on clinical evidence and nursing standards. Also explain why Options B, C, and D are incorrect distractors..."
              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs focus:ring-2 focus:ring-purple-500 text-slate-200 placeholder:text-slate-500 leading-relaxed font-mono"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              id="cancel-mcq-btn"
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-semibold text-slate-300 transition-colors"
            >
              Cancel
            </button>
            <button
              id="save-mcq-btn"
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-colors shadow-md flex items-center gap-1.5"
            >
              {isSubmitting ? 'Saving...' : formData.id ? 'Update Question' : 'Save Question Bank Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
