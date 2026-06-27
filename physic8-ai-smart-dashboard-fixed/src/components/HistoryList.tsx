import React, { useState } from 'react';
import { HistoryRecord, Question } from '../types';
import { BookOpen, Calendar, Trash2, ChevronDown, ChevronUp, Clock, HelpCircle as HelpIcon } from 'lucide-react';

interface HistoryListProps {
  history: HistoryRecord[];
  onClearHistory: () => void;
  onNavigateToQuiz: () => void;
}

export default function HistoryList({ history, onClearHistory, onNavigateToQuiz }: HistoryListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const avgScore = history.length > 0
    ? Math.round((history.reduce((sum, item) => sum + item.score, 0) / history.length) * 10) / 10
    : 0;

  const highestScore = history.length > 0
    ? Math.max(...history.map((h) => h.score))
    : 0;

  return (
    <div id="history-view" className="space-y-6 max-w-4xl mx-auto animate-fade-in">
      
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Clock className="text-blue-600" /> Sổ tay học tập & Lịch sử làm bài
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Theo dõi sự tiến bộ học tập, xem lại đáp án và các lời giải thích chi tiết cho các câu hỏi luyện tập trước đây.
          </p>
        </div>

        {history.length > 0 && (
          <button
            onClick={onClearHistory}
            className="text-xs font-bold text-rose-600 hover:text-rose-800 flex items-center gap-1.5 px-3 py-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors w-fit cursor-pointer"
          >
            <Trash2 size={14} /> Xóa lịch sử làm bài
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 p-12 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm text-center space-y-4">
          <div className="text-slate-300 dark:text-slate-600 flex justify-center">
            <BookOpen size={64} className="stroke-1" />
          </div>
          <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200">Chưa có dữ liệu làm bài</h3>
          <p className="text-slate-400 dark:text-slate-500 text-sm max-w-sm mx-auto">
            Hãy thực hiện bài luyện tập trắc nghiệm đầu tiên bằng cách sử dụng Trợ lí AI thông minh hoặc Ngân hàng đề của chúng tôi.
          </p>
          <button
            onClick={onNavigateToQuiz}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer"
          >
            Bắt đầu luyện tập ngay
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* History Analytics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm text-center space-y-1">
              <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Bài thi đã thực hiện</span>
              <span className="text-2xl font-black text-slate-800 dark:text-slate-100">{history.length} Đề</span>
            </div>
            <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm text-center space-y-1">
              <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Điểm trung bình học tập</span>
              <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{avgScore} / 10đ</span>
            </div>
            <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm text-center space-y-1">
              <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Điểm số cao nhất đạt được</span>
              <span className="text-2xl font-black text-teal-600 dark:text-teal-400">{highestScore} / 10đ</span>
            </div>
          </div>

          {/* History Rows List */}
          <div className="space-y-4">
            {history.map((record) => {
              const isExpanded = expandedId === record.id;
              
              return (
                <div key={record.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden transition-all">
                  
                  {/* Row Header trigger */}
                  <div
                    onClick={() => toggleExpand(record.id)}
                    className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <div className="space-y-1.5">
                      <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">{record.quizTitle}</h3>
                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 dark:text-slate-500 font-medium">
                        <span className="flex items-center gap-1">
                          <Calendar size={13} /> {record.date}
                        </span>
                        <span>•</span>
                        <span>Đúng {record.correctCount} / {record.totalQuestions} câu</span>
                        {record.timeSpentSeconds > 0 && (
                          <>
                            <span>•</span>
                            <span>Thời gian: {Math.floor(record.timeSpentSeconds / 60)}m {record.timeSpentSeconds % 60}s</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-50 dark:border-slate-800">
                      <div className="flex items-center gap-2">
                        <span className={`px-3.5 py-1.5 rounded-xl font-extrabold text-sm border ${
                          record.score >= 8.0
                            ? 'bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-300 border-green-200/50 dark:border-green-900/55'
                            : record.score >= 5.0
                              ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200/50 dark:border-amber-900/55'
                              : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200/50 dark:border-rose-900/55'
                        }`}>
                          {record.score} / 10đ
                        </span>
                      </div>
                      
                      <span className="text-slate-400 dark:text-slate-500 p-1.5 bg-slate-50 dark:bg-slate-950 rounded-lg">
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </span>
                    </div>
                  </div>

                  {/* Expanded detail reviews */}
                  {isExpanded && (
                    <div className="border-t border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-950/20 p-5 space-y-6 animate-fade-in">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-505 dark:text-slate-400 uppercase tracking-wider pb-1">
                        <HelpIcon size={14} />
                        <span>Đối chiếu chi tiết từng câu hỏi</span>
                      </div>

                      <div className="space-y-6">
                        {record.questions.map((q, qIdx) => {
                          const chosenIdx = record.answers[q.id];
                          const isCorrect = chosenIdx === q.correctAnswerIndex;
                          const labels = ['A', 'B', 'C', 'D'];

                          return (
                            <div key={q.id} className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200/50 dark:border-slate-800 shadow-sm space-y-4">
                              <div className="flex justify-between items-start gap-4">
                                <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase shrink-0 ${
                                  isCorrect 
                                    ? 'bg-green-100 dark:bg-green-950/40 text-green-800 dark:text-green-300' 
                                    : chosenIdx === undefined 
                                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300' 
                                      : 'bg-rose-100 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300'
                                }`}>
                                  {isCorrect ? 'Đúng' : chosenIdx === undefined ? 'Bỏ qua' : 'Sai'}
                                </span>
                                <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">Hệ số: {q.points}đ</span>
                              </div>

                              <p className="text-slate-800 dark:text-slate-200 font-bold text-sm leading-relaxed">
                                {qIdx + 1}. {q.questionText}
                              </p>

                              {/* Options review */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                {q.options.map((option, optIdx) => {
                                  const isOptionChosen = chosenIdx === optIdx;
                                  const isOptionCorrect = q.correctAnswerIndex === optIdx;

                                  let optBg = 'bg-slate-50/50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300';
                                  let labelBg = 'bg-slate-100 dark:bg-slate-850 text-slate-500 dark:text-slate-400';

                                  if (isOptionCorrect) {
                                    optBg = 'bg-green-50/70 dark:bg-green-950/30 border-green-300 dark:border-green-900 text-green-900 dark:text-green-300 font-medium';
                                    labelBg = 'bg-green-500 text-white';
                                  } else if (isOptionChosen) {
                                    optBg = 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-300 dark:border-rose-900/50 text-rose-900 dark:text-rose-300';
                                    labelBg = 'bg-rose-500 text-white';
                                  }

                                  return (
                                    <div key={optIdx} className={`p-3 rounded-lg border text-xs flex items-center gap-2.5 ${optBg}`}>
                                      <span className={`w-5 h-5 rounded font-bold flex items-center justify-center shrink-0 ${labelBg}`}>
                                        {labels[optIdx]}
                                      </span>
                                      <span>{option}</span>
                                    </div>
                                  );
                                })}
                              </div>

                              {/* Explanation detail */}
                              <div className="p-3.5 bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800 rounded-lg text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">💡 Lời giải thích khoa học:</span>
                                {q.explanation}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                </div>
              );
            })}
          </div>

        </div>
      )}

    </div>
  );
}
