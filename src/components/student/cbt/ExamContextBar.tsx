import React from 'react';

interface ExamContextBarProps {
  levelName?: string;
  subjectName?: string;
  examTitle: string;
}

export const ExamContextBar: React.FC<ExamContextBarProps> = ({
  levelName,
  subjectName,
  examTitle,
}) => {
  return (
    <div className="w-full max-w-2xl mx-auto px-4 pt-3 pb-1 flex items-center justify-between text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
      <div className="flex items-center gap-2 truncate">
        <span className="text-teal-400 font-bold">{levelName || 'ND1 NURSING'}</span>
        <span className="text-slate-600">•</span>
        <span className="text-slate-300 truncate">{subjectName || examTitle}</span>
      </div>
      <span className="text-[10px] text-slate-500 font-medium shrink-0 ml-2 hidden xs:inline">
        CBT MODE
      </span>
    </div>
  );
};
