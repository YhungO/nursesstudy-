import React from 'react';
import { Question } from '../../../types';
import { Stethoscope } from 'lucide-react';

interface QuestionContentProps {
  question?: Question;
  questionId?: string | number;
  questionText?: string;
  scenario?: string;
  image?: string;
  imageUrl?: string;
  currentIndex?: number;
  totalQuestions?: number;
}

export const QuestionContent: React.FC<QuestionContentProps> = ({
  question,
  questionText: propQuestionText,
  scenario: propScenario,
  image: propImage,
  imageUrl: propImageUrl,
}) => {
  const text =
    propQuestionText ||
    question?.questionText ||
    question?.question ||
    '';
  const scenario = propScenario ?? question?.scenario;
  const image =
    propImage ||
    propImageUrl ||
    (question as any)?.imageUrl ||
    (question as any)?.image;

  return (
    <div className="w-full max-w-2xl mx-auto px-4 pt-3 pb-4 space-y-3.5">
      {/* Optional Clinical Vignette / Scenario */}
      {scenario && (
        <div className="p-3.5 bg-slate-900/90 rounded-xl border-l-3 border-teal-500 text-slate-200 text-xs sm:text-sm leading-relaxed">
          <div className="flex items-center gap-1.5 font-bold text-[11px] uppercase tracking-wider text-teal-400 mb-1">
            <Stethoscope className="w-3.5 h-3.5" />
            <span>Clinical Vignette</span>
          </div>
          <p className="text-slate-300 font-normal">{scenario}</p>
        </div>
      )}

      {/* Main Question Stem - Directly on canvas, no heavy container */}
      <h1 className="text-base sm:text-lg md:text-xl font-medium text-white leading-relaxed tracking-normal">
        {text}
      </h1>

      {/* Optional Question Diagram / Image */}
      {image && (
        <div className="pt-1 pb-2">
          <img
            src={image}
            alt="Question clinical illustration"
            className="max-h-64 sm:max-h-72 w-auto max-w-full rounded-xl border border-slate-800 object-contain mx-auto shadow-sm"
          />
        </div>
      )}
    </div>
  );
};
