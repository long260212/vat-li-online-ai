import React, { useState } from 'react';
import { ArrowLeft, UserCheck, BarChart3, TrendingUp, Award, Calendar, Check, Search, Trash2, Clock, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import { Homework, HomeworkResult } from '../types';

interface ExerciseResultsProps {
  homework: Homework;
  results: HomeworkResult[];
  onBack: () => void;
  onClearSingleResult?: (resultId: string) => void;
}

export default function ExerciseResults({ homework, results, onBack, onClearSingleResult }: ExerciseResultsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedResult, setSelectedResult] = useState<HomeworkResult | null>(null);
  const [deleteResultTarget, setDeleteResultTarget] = useState<HomeworkResult | null>(null);

  // Filter results for this homework
  const currentResults = results.filter((r) => r.homeworkId === homework.id || r.homeworkCode === homework.code);

  const filteredResults = currentResults.filter((r) => 
    r.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.studentClass.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Statistics
  const attemptsCount = currentResults.length;
  
  const scoresList = currentResults.map((r) => r.score);
  const avgScore = attemptsCount > 0 
    ? Math.round((scoresList.reduce((acc, curr) => acc + curr, 0) / attemptsCount) * 10) / 10
    : 0;
  
  const highestScore = attemptsCount > 0 ? Math.max(...scoresList) : 0;
  const lowestScore = attemptsCount > 0 ? Math.min(...scoresList) : 0;

  // Grade classification
  const excellentCount = scoresList.filter((s) => s >= 8.0).length;
  const goodCount = scoresList.filter((s) => s >= 6.5 && s < 8.0).length;
  const averageCount = scoresList.filter((s) => s >= 5.0 && s < 6.5).length;
  const weakCount = scoresList.filter((s) => s < 5.0).length;

  return (
    <div id="exercise-results-view" className="space-y-6 max-w-5xl mx-auto py-4 animate-fade-in">
      
      {/* View Header with back button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
        <div className="space-y-1">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-850 rounded-xl transition-all cursor-pointer"
          >
            <ArrowLeft size={14} /> Quay lại kho bài tập
          </button>
          <h2 className="text-xl md:text-2xl font-black text-slate-850 dark:text-slate-100 flex items-center gap-2.5 pt-1">
            <BarChart3 className="text-indigo-600 dark:text-indigo-400" /> Bảng điểm & Phân tích khảo thí
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Xem danh sách bài nộp và thống kê điểm số cho đề: <strong className="text-slate-700 dark:text-slate-200">{homework.title}</strong> ({homework.code})
          </p>
        </div>
      </div>

      {attemptsCount === 0 ? (
        <div className="bg-white dark:bg-slate-900 p-12 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm text-center space-y-4">
          <div className="text-slate-300 dark:text-slate-600 flex justify-center">
            <UserCheck size={64} className="stroke-1" />
          </div>
          <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200">Chưa có lượt nộp bài nào</h3>
          <p className="text-slate-400 dark:text-slate-500 text-sm max-w-sm mx-auto">
            Gửi mã bài tập <strong className="text-blue-600 font-mono text-base">{homework.code}</strong> cho học sinh để làm bài và ghi nhận điểm số tự động tại đây.
          </p>
          <button
            onClick={onBack}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-blue-500/10 cursor-pointer"
          >
            Quay lại Kho bài tập
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main List of attempts */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Search Filter bar */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-3">
              <Search className="text-slate-400" size={18} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm kiếm theo tên học sinh, lớp học..."
                className="w-full bg-transparent text-sm text-slate-800 dark:text-slate-100 focus:outline-none placeholder:text-slate-400"
              />
            </div>

            {/* List Table container */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-50 dark:border-slate-850 flex justify-between items-center bg-slate-50/50 dark:bg-slate-950/20">
                <span className="text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Danh sách bài làm ({filteredResults.length})</span>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-850">
                {filteredResults.map((record) => {
                  const isDetailSelected = selectedResult?.id === record.id;
                  
                  return (
                    <div key={record.id} className="p-5 space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-1">
                          <h4 className="text-sm font-extrabold text-slate-800 dark:text-slate-200">{record.studentName}</h4>
                          <div className="flex items-center gap-3 text-xs text-slate-400 dark:text-slate-500 font-medium">
                            <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-md font-bold">Lớp {record.studentClass}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1"><Calendar size={13} /> {record.submittedAt}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 justify-between sm:justify-end">
                          <div className="text-right">
                            <span className={`px-3 py-1 rounded-xl text-xs font-black border ${
                              record.score >= 8.0 
                                ? 'bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-300 border-green-200/50 dark:border-green-900/50'
                                : record.score >= 5.0
                                  ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 border-amber-200/50 dark:border-amber-900/50'
                                  : 'bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 border-rose-200/50 dark:border-rose-900/50'
                            }`}>
                              {record.score}đ ({record.correctCount}/{record.totalQuestions} câu)
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => setSelectedResult(isDetailSelected ? null : record)}
                              className="p-2 bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-xl transition-all cursor-pointer"
                              title={isDetailSelected ? 'Ẩn chi tiết' : 'Xem chi tiết bài làm'}
                            >
                              {isDetailSelected ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>

                            {onClearSingleResult && (
                              <button
                                onClick={() => setDeleteResultTarget(record)}
                                className="p-2 bg-slate-50 dark:bg-slate-950 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-all cursor-pointer"
                                title="Xóa kết quả này"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Expanded Review panel */}
                      {isDetailSelected && (
                        <div className="p-4 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-100 dark:border-slate-850 space-y-3 text-xs animate-fade-in">
                          <h5 className="font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1">
                            🎯 Chi tiết các câu trả lời:
                          </h5>
                          
                          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
                            {homework.questions.map((q, idx) => {
                              const chosenIdx = record.answers[q.id];
                              const isCorrect = chosenIdx === q.correctAnswerIndex;
                              const labels = ['A', 'B', 'C', 'D'];

                              return (
                                <div 
                                  key={q.id} 
                                  className={`p-2 rounded-lg border text-center space-y-0.5 ${
                                    isCorrect 
                                      ? 'bg-green-50/50 dark:bg-green-950/20 border-green-200 dark:border-green-900/30 text-green-800 dark:text-green-300' 
                                      : chosenIdx === undefined
                                        ? 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400'
                                        : 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/30 text-rose-800 dark:text-rose-300'
                                  }`}
                                >
                                  <div className="font-bold">Câu {idx + 1}</div>
                                  <div className="text-[10px] opacity-75">
                                    Chọn: {chosenIdx !== undefined ? labels[chosenIdx] : 'Bỏ'} (Đúng: {labels[q.correctAnswerIndex]})
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

          </div>

          {/* Sidebar statistics & analytics */}
          <div className="space-y-6">
            
            {/* Quick Stat indicators */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-50 dark:border-slate-850">
                <TrendingUp size={14} /> Thống kê chung
              </h3>
              
              <div className="space-y-3.5">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500 dark:text-slate-400">Số lượt đã nộp:</span>
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{attemptsCount} học sinh</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500 dark:text-slate-400">Điểm số trung bình:</span>
                  <span className="text-sm font-black text-indigo-600 dark:text-indigo-400">{avgScore}đ</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500 dark:text-slate-400">Điểm số cao nhất:</span>
                  <span className="text-sm font-black text-teal-600 dark:text-teal-400">{highestScore}đ</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500 dark:text-slate-400">Điểm số thấp nhất:</span>
                  <span className="text-sm font-black text-rose-500">{lowestScore}đ</span>
                </div>
              </div>
            </div>

            {/* Distribution metrics */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-50 dark:border-slate-850">
                <Award size={14} /> Phân loại học tập
              </h3>

              <div className="space-y-3 text-xs">
                {/* Excellent */}
                <div className="space-y-1">
                  <div className="flex justify-between font-bold">
                    <span className="text-green-600">Giỏi (8.0 - 10đ)</span>
                    <span>{excellentCount} ({Math.round(excellentCount / attemptsCount * 100)}%)</span>
                  </div>
                  <div className="h-2 w-full bg-slate-50 dark:bg-slate-950 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full" style={{ width: `${(excellentCount / attemptsCount) * 100}%` }} />
                  </div>
                </div>

                {/* Good */}
                <div className="space-y-1">
                  <div className="flex justify-between font-bold">
                    <span className="text-blue-500">Khá (6.5 - 7.9đ)</span>
                    <span>{goodCount} ({Math.round(goodCount / attemptsCount * 100)}%)</span>
                  </div>
                  <div className="h-2 w-full bg-slate-50 dark:bg-slate-950 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(goodCount / attemptsCount) * 100}%` }} />
                  </div>
                </div>

                {/* Average */}
                <div className="space-y-1">
                  <div className="flex justify-between font-bold">
                    <span className="text-amber-500">Trung bình (5.0 - 6.4đ)</span>
                    <span>{averageCount} ({Math.round(averageCount / attemptsCount * 100)}%)</span>
                  </div>
                  <div className="h-2 w-full bg-slate-50 dark:bg-slate-950 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: `${(averageCount / attemptsCount) * 100}%` }} />
                  </div>
                </div>

                {/* Weak */}
                <div className="space-y-1">
                  <div className="flex justify-between font-bold">
                    <span className="text-rose-500">Yếu (Dưới 5.0đ)</span>
                    <span>{weakCount} ({Math.round(weakCount / attemptsCount * 100)}%)</span>
                  </div>
                  <div className="h-2 w-full bg-slate-50 dark:bg-slate-950 rounded-full overflow-hidden">
                    <div className="h-full bg-rose-500 rounded-full" style={{ width: `${(weakCount / attemptsCount) * 100}%` }} />
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* State-based Confirmation Modal to avoid browser confirm blocking in iframe */}
      {deleteResultTarget && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 max-w-md w-full shadow-2xl space-y-4 animate-scale-up">
            <div className="flex items-center gap-3 text-rose-500">
              <AlertTriangle size={24} className="shrink-0" />
              <h3 className="text-base font-extrabold text-slate-850 dark:text-slate-200">
                Xác nhận xóa kết quả
              </h3>
            </div>
            
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Bạn có chắc chắn muốn xóa kết quả làm bài của học sinh <strong className="text-slate-800 dark:text-white">{deleteResultTarget.studentName}</strong> (Lớp {deleteResultTarget.studentClass}) không?
              <br /><span className="text-rose-500 font-medium">Hành động này không thể hoàn tác và điểm của học sinh sẽ bị loại bỏ khỏi bảng điểm này.</span>
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteResultTarget(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-600 dark:text-slate-300 font-bold rounded-xl text-xs transition-all cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onClearSingleResult) {
                    onClearSingleResult(deleteResultTarget.id);
                  }
                  setDeleteResultTarget(null);
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs shadow-md shadow-rose-500/10 transition-all cursor-pointer"
              >
                Xóa vĩnh viễn
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
