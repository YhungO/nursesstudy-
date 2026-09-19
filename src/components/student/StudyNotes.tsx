import React, { useState, useMemo } from 'react';
import { Subject, StudyNote, NursingLevel } from '../../types';
import {
  BookOpen,
  Search,
  Bookmark,
  Clock,
  ChevronRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  HelpCircle,
} from 'lucide-react';

interface StudyNotesProps {
  notes: StudyNote[];
  subjects: Subject[];
  levels: NursingLevel[];
  selectedNoteId?: string | null;
  initialSubjectId?: string | null;
  bookmarkedNoteIds: string[];
  onToggleBookmark: (noteId: string) => void;
  onNavigateToPractice: (subjectId: string) => void;
}

export const StudyNotes: React.FC<StudyNotesProps> = ({
  notes = [],
  subjects = [],
  selectedNoteId = null,
  initialSubjectId = null,
  bookmarkedNoteIds = [],
  onToggleBookmark,
  onNavigateToPractice,
}) => {
  const [activeNoteId, setActiveNoteId] = useState<string | null>(selectedNoteId);
  const [selectedSubject, setSelectedSubject] = useState<string>(initialSubjectId || 'all');
  const [searchQuery, setSearchQuery] = useState('');

  // Find active note if open
  const activeNote = useMemo(() => {
    return notes?.find((n) => n.id === activeNoteId) || null;
  }, [notes, activeNoteId]);

  // Filter notes
  const filteredNotes = useMemo(() => {
    return (notes || []).filter((note) => {
      const matchSubject = selectedSubject === 'all' || note.subjectId === selectedSubject;
      const matchSearch =
        !searchQuery.trim() ||
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase());
      return matchSubject && matchSearch;
    });
  }, [notes, selectedSubject, searchQuery]);

  // Reader View
  if (activeNote) {
    const isBookmarked = bookmarkedNoteIds.includes(activeNote.id);
    const noteSubject = subjects?.find((s) => s.id === activeNote.subjectId);

    return (
      <div className="max-w-4xl mx-auto space-y-6 pb-16 animate-in fade-in">
        {/* Navigation & Action Bar */}
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={() => setActiveNoteId(null)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#111827] border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors shadow-sm"
          >
            <ArrowLeft className="w-4 h-4 text-slate-400" />
            <span>Back to All Notes</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleBookmark(activeNote.id)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
                isBookmarked
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm'
                  : 'bg-[#111827] text-slate-300 border-slate-800 hover:bg-slate-800'
              }`}
            >
              <Bookmark
                className={`w-4 h-4 ${isBookmarked ? 'fill-amber-400 text-amber-400' : 'text-slate-400'}`}
              />
              <span>{isBookmarked ? 'Bookmarked' : 'Bookmark Note'}</span>
            </button>

            <button
              onClick={() => onNavigateToPractice(activeNote.subjectId)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 active:bg-teal-700 text-white text-xs font-bold transition-colors shadow-md shadow-teal-900/30"
            >
              <HelpCircle className="w-4 h-4" />
              <span>Practice Questions</span>
            </button>
          </div>
        </div>

        {/* Note Article Container */}
        <article className="bg-[#111827] rounded-3xl border border-slate-800 shadow-xl overflow-hidden">
          {/* Article Header */}
          <div className="p-6 sm:p-8 border-b border-slate-800 bg-[#0d1424]">
            <div className="flex items-center gap-2 flex-wrap mb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-teal-500/15 text-teal-300 border border-teal-500/30">
                {noteSubject?.name || 'Nursing Subject'}
              </span>
              <span className="text-[10px] font-semibold text-slate-300 bg-slate-800/80 border border-slate-700 px-2.5 py-1 rounded-md">
                Topic: {activeNote.topic}
              </span>
              <span className="text-xs text-slate-400 flex items-center gap-1 ml-auto font-medium">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                {activeNote.readingTime} min read
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
              {activeNote.title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed font-normal">
              {activeNote.summary}
            </p>
          </div>

          <div className="p-6 sm:p-8 space-y-8">
            {/* Clinical Pearls Callout */}
            {activeNote.clinicalPearls && activeNote.clinicalPearls.length > 0 && (
              <div className="bg-gradient-to-r from-teal-950/60 via-slate-900/80 to-teal-950/40 border-l-4 border-teal-400 p-5 rounded-r-2xl space-y-2.5 border-t border-b border-r border-teal-500/20">
                <div className="flex items-center gap-2 text-teal-300 font-bold text-sm">
                  <Sparkles className="w-4 h-4 text-teal-400" />
                  <span>High-Yield Clinical Pearls & NCLEX Takeaways</span>
                </div>
                <div className="space-y-1.5 text-xs sm:text-sm text-slate-200 leading-relaxed">
                  {activeNote.clinicalPearls.map((pearl, idx) => (
                    <p key={idx} className="flex items-start gap-2">
                      <span className="text-teal-400 font-bold">•</span>
                      <span>{pearl}</span>
                    </p>
                  ))}
                </div>
              </div>
            )}

            {/* Key Memorization Points */}
            {activeNote.keyPoints && activeNote.keyPoints.length > 0 && (
              <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Core Nursing Competencies & Safety Points
                </h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs sm:text-sm text-slate-300">
                  {activeNote.keyPoints.map((point, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0"></span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Rich Markdown/Clinical Content */}
            <div className="prose prose-invert max-w-none text-xs sm:text-sm leading-relaxed text-slate-300 space-y-4">
              {activeNote.content.split('\n\n').map((paragraph, idx) => {
                if (paragraph.startsWith('### ')) {
                  return (
                    <h3
                      key={idx}
                      className="text-base sm:text-lg font-bold text-white pt-4 pb-1.5 border-b border-slate-800"
                    >
                      {paragraph.replace('### ', '')}
                    </h3>
                  );
                }
                if (paragraph.startsWith('#### ')) {
                  return (
                    <h4 key={idx} className="text-sm sm:text-base font-bold text-teal-300 pt-2">
                      {paragraph.replace('#### ', '')}
                    </h4>
                  );
                }
                if (paragraph.startsWith('| ')) {
                  const rows = paragraph.trim().split('\n');
                  const headers = rows[0]
                    .split('|')
                    .filter((c) => c.trim().length > 0)
                    .map((c) => c.trim());
                  const dataRows = rows.slice(2).map((r) =>
                    r
                      .split('|')
                      .filter((c) => c.trim().length > 0)
                      .map((c) => c.trim())
                  );

                  return (
                    <div key={idx} className="overflow-x-auto my-4 border border-slate-800 rounded-xl">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-800/80 text-white font-bold">
                          <tr>
                            {headers.map((h, i) => (
                              <th key={i} className="p-3 border-b border-slate-700">
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                          {dataRows.map((row, rIdx) => (
                            <tr key={rIdx} className="hover:bg-slate-800/40">
                              {row.map((cell, cIdx) => (
                                <td key={cIdx} className="p-3 text-slate-300">
                                  {cell}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  );
                }
                if (paragraph.startsWith('- ')) {
                  const items = paragraph.split('\n');
                  return (
                    <ul key={idx} className="list-disc pl-5 space-y-1 my-2">
                      {items.map((item, iIdx) => (
                        <li key={iIdx} className="text-slate-300">
                          {item.replace(/^- /, '')}
                        </li>
                      ))}
                    </ul>
                  );
                }
                return (
                  <p key={idx} className="text-slate-300 leading-relaxed">
                    {paragraph}
                  </p>
                );
              })}
            </div>

            {/* Bottom Action Card */}
            <div className="mt-8 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#0d1424] p-5 sm:p-6 rounded-2xl border border-slate-800/80">
              <div>
                <h4 className="font-bold text-sm text-white">Finished this clinical note?</h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Solidify your knowledge by practicing questions related to {noteSubject?.name}.
                </p>
              </div>
              <button
                onClick={() => onNavigateToPractice(activeNote.subjectId)}
                className="w-full sm:w-auto px-5 py-2.5 bg-teal-600 hover:bg-teal-500 active:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-teal-900/30 flex items-center justify-center gap-2"
              >
                <HelpCircle className="w-4 h-4" />
                <span>Practice Questions Now</span>
              </button>
            </div>
          </div>
        </article>
      </div>
    );
  }

  // Listing View
  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-emerald-400" />
            <span>Nursing Study Notes & Curricula</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Clinical lecture summaries, pharmacological drug cards, and procedural nursing guides.
          </p>
        </div>

        {/* Subject Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          <button
            onClick={() => setSelectedSubject('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors border ${
              selectedSubject === 'all'
                ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm'
                : 'bg-[#111827] border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            All Subjects ({notes.length})
          </button>
          {subjects.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelectedSubject(s.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors border ${
                selectedSubject === s.id
                  ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm'
                  : 'bg-[#111827] border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {s.name}
            </button>
          ))}
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter notes by topic, diagnostic criteria, drug name, or procedure..."
          className="w-full pl-10 pr-4 py-2.5 bg-[#111827] border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 transition-all shadow-inner"
        />
      </div>

      {/* Notes Grid */}
      {filteredNotes.length === 0 ? (
        <div className="bg-[#111827] rounded-3xl p-10 sm:p-14 text-center border border-slate-800 shadow-xl max-w-xl mx-auto space-y-5 my-4">
          <div className="w-16 h-16 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center mx-auto shadow-inner">
            <BookOpen className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">No study notes found</h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-1.5 leading-relaxed">
              We couldn't find any clinical notes matching your current search or subject filter.
            </p>
          </div>

          <div className="pt-2">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
              Suggested High-Yield Topics:
            </span>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {['Endocrine', 'Asepsis & Vital Signs', 'Renal Physiology', 'Pharmacokinetics', 'Immunization', 'Therapeutic Diets'].map((topic) => (
                <button
                  key={topic}
                  onClick={() => {
                    setSelectedSubject('all');
                    setSearchQuery(topic.split(' ')[0]);
                  }}
                  className="px-3 py-1 rounded-full bg-slate-900 border border-slate-700/80 hover:border-teal-500/60 text-slate-300 hover:text-teal-300 text-xs font-medium transition-all"
                >
                  {topic}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={() => {
                setSelectedSubject('all');
                setSearchQuery('');
              }}
              className="px-6 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 active:from-teal-600 active:to-emerald-600 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-lg shadow-teal-500/20 cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredNotes.map((note) => {
            const isBookmarked = bookmarkedNoteIds.includes(note.id);
            const noteSubject = subjects?.find((s) => s.id === note.subjectId);

            return (
              <div
                key={note.id}
                className="group bg-[#111827] rounded-2xl p-5 border border-slate-800 hover:border-emerald-500/50 hover:shadow-lg transition-all flex flex-col justify-between shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                      {noteSubject?.name || 'General Nursing'}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-400 flex items-center gap-1 font-medium">
                        <Clock className="w-3 h-3 text-slate-500" />
                        {note.readingTime} min
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleBookmark(note.id);
                        }}
                        className={`p-1.5 rounded-lg border transition-colors ${
                          isBookmarked
                            ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                            : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white'
                        }`}
                        title={isBookmarked ? 'Remove Bookmark' : 'Save Bookmark'}
                      >
                        <Bookmark
                          className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-amber-400' : ''}`}
                        />
                      </button>
                    </div>
                  </div>

                  <h3
                    onClick={() => setActiveNoteId(note.id)}
                    className="font-bold text-base text-white group-hover:text-emerald-300 transition-colors cursor-pointer"
                  >
                    {note.title}
                  </h3>
                  <p className="text-xs text-teal-400 font-semibold mt-0.5">{note.topic}</p>
                  <p className="text-xs text-slate-400 mt-2 line-clamp-3 leading-relaxed">
                    {note.summary}
                  </p>

                  {note.keyPoints && note.keyPoints.length > 0 && (
                    <div className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-300 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="truncate">{note.keyPoints[0]}</span>
                    </div>
                  )}
                </div>

                <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between">
                  <button
                    onClick={() => setActiveNoteId(note.id)}
                    className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
                  >
                    <span>Read Note</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => onNavigateToPractice(note.subjectId)}
                    className="text-[11px] font-semibold text-slate-400 hover:text-teal-400 transition-colors flex items-center gap-1"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Practice Questions</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
