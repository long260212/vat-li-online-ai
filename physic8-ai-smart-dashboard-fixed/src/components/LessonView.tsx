import React, { useState } from 'react';
import { ArrowLeft, BookOpen, Target, Cpu, CheckCircle, GraduationCap, ChevronDown, ChevronUp, Star, Zap } from 'lucide-react';
import { Lesson } from '../types';

interface LessonViewProps {
  lesson: Lesson;
  onBack: () => void;
  onStartPractice: (lessonId: string) => void;
  onDiscussWithAI?: (lesson: Lesson) => void;
}

export default function LessonView({ lesson, onBack, onStartPractice, onDiscussWithAI }: LessonViewProps) {
  const [showSolution, setShowSolution] = useState<Record<number, boolean>>({});

  const toggleSolution = (index: number) => {
    setShowSolution((prev) => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  return (
    <div id="lesson-detail-view" className="space-y-8 max-w-4xl mx-auto animate-fade-in">
      {/* Back button & Action headers */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-850 rounded-xl transition-all w-fit cursor-pointer"
        >
          <ArrowLeft size={16} /> Quay lại thư viện
        </button>
        
        <div className="flex flex-wrap items-center gap-3">
          {onDiscussWithAI && (
            <button
              onClick={() => onDiscussWithAI(lesson)}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-white dark:bg-slate-900 text-indigo-750 dark:text-indigo-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-950/20 rounded-xl text-sm font-bold shadow-xs transition-all cursor-pointer"
            >
              <Cpu size={14} className="text-indigo-600 dark:text-indigo-400 animate-pulse" /> Thảo luận cùng AI
            </button>
          )}
          
          <button
            onClick={() => onStartPractice(lesson.id)}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-indigo-500/10 transition-all cursor-pointer"
          >
            <Zap size={14} className="fill-amber-300 text-amber-300" /> Luyện tập bài này
          </button>
        </div>
      </div>

      {/* Hero Header */}
      <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-wrap gap-2.5">
          <span className="px-3 py-1 text-xs font-bold bg-blue-100 dark:bg-blue-950/50 text-blue-800 dark:text-blue-300 rounded-full">
            Chuyên đề {lesson.chapterId}: {lesson.chapter}
          </span>
          <span className="px-3 py-1 text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full">
            Độ khó: {lesson.difficulty}
          </span>
        </div>
        
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 dark:text-slate-100">{lesson.title}</h1>
        <p className="text-slate-500 dark:text-slate-400 text-base leading-relaxed border-l-4 border-blue-500 pl-4 py-1 italic bg-blue-50/20 dark:bg-blue-950/20 rounded-r-lg">
          {lesson.summary}
        </p>
      </div>

      {/* Lesson Content Sections */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Column: Objectives & Quick Stats */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Target className="text-indigo-600" size={18} /> Mục tiêu bài học
            </h3>
            <ul className="space-y-3">
              {lesson.objectives.map((obj, i) => (
                <li key={i} className="flex gap-2.5 text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                  <CheckCircle size={16} className="text-teal-500 shrink-0 mt-0.5" />
                  <span>{obj}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white p-6 rounded-2xl shadow-sm space-y-4">
            <h4 className="text-sm font-bold flex items-center gap-1.5 text-indigo-200">
              <GraduationCap size={16} /> Lời khuyên ôn tập
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Vật lí lớp 8 là tiền đề rất quan trọng cho các lớp học sau này. Hãy ghi chép lại các công thức trong khung nổi bật và thử tự làm bài tập ví dụ trước khi xem lời giải!
            </p>
          </div>
        </div>

        {/* Right Column: Theory, Formulas, Examples */}
        <div className="md:col-span-2 space-y-8">
          
          {/* Theory Section */}
          <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 border-b border-slate-50 dark:border-slate-800 pb-3">
              <BookOpen className="text-blue-600" size={20} /> Lý thuyết cốt lõi
            </h3>
            <div className="space-y-4 text-slate-600 dark:text-slate-300 text-sm md:text-base leading-relaxed">
              {lesson.theory.map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          </div>

          {/* Formulas Section */}
          {lesson.formulas.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Cpu className="text-teal-600" size={20} /> Công thức trọng tâm
              </h3>
              
              <div className="space-y-4">
                {lesson.formulas.map((formula, i) => (
                  <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">{formula.name}</h4>
                      <span className="text-[10px] bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-400 px-2 py-0.5 rounded font-bold uppercase tracking-wider">Ghi nhớ</span>
                    </div>
                    
                    {/* Visual expression block */}
                    <div className="py-4 bg-slate-900 text-center rounded-xl font-mono text-xl text-teal-400 font-bold tracking-wide shadow-inner">
                      {formula.expression}
                    </div>

                    {/* Variable explanations */}
                    <div className="space-y-2">
                      <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Trong đó:</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        {formula.variables.map((v, idx) => (
                          <div key={idx} className="p-2 bg-slate-50 dark:bg-slate-950/40 rounded-lg text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-850 font-mono">
                            {v}
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed border-t border-slate-50 dark:border-slate-850 pt-3">
                      💡 {formula.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Examples / Exercises Section */}
          {lesson.examples.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Star className="text-amber-500 fill-amber-500" size={20} /> Bài tập mẫu tiêu biểu
              </h3>
              
              <div className="space-y-4">
                {lesson.examples.map((example, i) => (
                  <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
                    <div className="p-5 space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 rounded">Ví dụ {i+1}</span>
                      </div>
                      <p className="text-slate-800 dark:text-slate-200 font-medium text-sm leading-relaxed">{example.question}</p>
                    </div>

                    {/* Solution block with toggle button */}
                    <div className="border-t border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20">
                      <button
                        onClick={() => toggleSolution(i)}
                        className="w-full flex justify-between items-center px-5 py-3 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-slate-100/50 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
                      >
                        <span>{showSolution[i] ? 'Ẩn lời giải chi tiết' : 'Xem lời giải chi tiết'}</span>
                        {showSolution[i] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>

                      {showSolution[i] && (
                        <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/40 space-y-3 text-sm animate-fade-in">
                          <div className="space-y-1.5 text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-wrap">
                            <span className="font-bold text-slate-700 dark:text-slate-300 block text-xs uppercase tracking-wider">Các bước giải:</span>
                            {example.solution}
                          </div>
                          <div className="p-3 bg-teal-50 dark:bg-teal-950/40 border border-teal-100 dark:border-teal-900/50 rounded-xl text-xs font-bold text-teal-800 dark:text-teal-300">
                            Kết luận: {example.answer}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Real world Applications */}
          {lesson.applications.length > 0 && (
            <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 border-b border-slate-50 dark:border-slate-800 pb-3">
                <Cpu className="text-blue-500" size={20} /> Ứng dụng thực tế đời sống
              </h3>
              <div className="grid grid-cols-1 gap-3.5">
                {lesson.applications.map((app, i) => (
                  <div key={i} className="p-4 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                    🎯 {app}
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
