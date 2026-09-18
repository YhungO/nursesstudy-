import React, { useState } from 'react';
import { StudyNote, Question } from '../../types';
import { Bookmark, BookOpen, HelpCircle, ChevronRight, Trash2 } from 'lucide-react';

interface BookmarksProps {
  notes: StudyNote[];
  questions: Question[];
  onOpenNote: (noteId: string) => void;
  onOpenPracticeWithQuestion: (questionId: string) => void;
  onRemoveBookmark: (type: 'note' | 'question', id: string) => void;
}

export const Bookmarks: React.FC<BookmarksProps> = ({
  notes = [],
  questions = [],
  onOpenNote,
  onOpenPracticeWithQuestion,
  onRemoveBookmark,
}) => {
  const [activeTab, setActiveTab] = useState<'notes' | 'questions'>('notes');

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <Bookmark className="w-6 h-6 text-amber-400" />
          <span>Saved Clinical Bookmarks</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Quickly review your saved clinical study notes and high-yield question items.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800">
        <button
          onClick={() => setActiveTab('notes')}
          className={`py-3 px-4 font-semibold text-xs border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'notes'
              ? 'border-amber-400 text-amber-300 font-bold'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Saved Study Notes ({notes.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('questions')}
          className={`py-3 px-4 font-semibold text-xs border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'questions'
              ? 'border-amber-400 text-amber-300 font-bold'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>Saved Practice Questions ({questions.length})</span>
        </button>
      </div>

      {/* Notes Tab */}
      {activeTab === 'notes' && (
        <div className="space-y-3">
          {notes.length === 0 ? (
            <div className="bg-[#111827] rounded-3xl p-12 text-center border border-slate-800">
              <Bookmark className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-white">No saved notes</h3>
              <p className="text-xs text-slate-400 mt-1">
                Click the bookmark icon while reading study guides to access them here.
              </p>
            </div>
          ) : (
            notes.map((note) => (
              <div
                key={note.id}
                className="bg-[#111827] rounded-2xl p-5 border border-slate-800 hover:border-amber-400/50 transition-all shadow-md flex items-center justify-between gap-4 group"
              >
                <div className="flex-1 min-w-0" onClick={() => onOpenNote(note.id)}>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-md">
                    {note.topic}
                  </span>
                  <h3 className="font-bold text-sm text-white mt-1.5 group-hover:text-amber-300 cursor-pointer truncate transition-colors">
                    {note.title}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">{note.summary}</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onOpenNote(note.id)}
                    className="px-3.5 py-1.5 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors"
                  >
                    <span>Read</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onRemoveBookmark('note', note.id)}
                    className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                    title="Remove Bookmark"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Questions Tab */}
      {activeTab === 'questions' && (
        <div className="space-y-3">
          {questions.length === 0 ? (
            <div className="bg-[#111827] rounded-3xl p-12 text-center border border-slate-800">
              <HelpCircle className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-white">No saved questions</h3>
              <p className="text-xs text-slate-400 mt-1">
                Bookmark tricky questions during MCQ practice to review them anytime.
              </p>
            </div>
          ) : (
            questions.map((q) => (
              <div
                key={q.id}
                className="bg-[#111827] rounded-2xl p-5 border border-slate-800 hover:border-sky-400/50 transition-all shadow-md flex items-center justify-between gap-4 group"
              >
                <div className="flex-1 min-w-0" onClick={() => onOpenPracticeWithQuestion(q.id)}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-sky-300 bg-sky-500/15 border border-sky-500/30 px-2 py-0.5 rounded-md">
                      {q.topic}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-slate-300">
                      {q.difficulty}
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-white group-hover:text-sky-300 cursor-pointer line-clamp-2 transition-colors leading-snug">
                    {q.questionText}
                  </h3>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => onOpenPracticeWithQuestion(q.id)}
                    className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors shadow-sm"
                  >
                    <span>Practice</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onRemoveBookmark('question', q.id)}
                    className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                    title="Remove Bookmark"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
