import React, { useState } from 'react';
import { BookOpen, Award, CheckCircle2, Flame, ArrowRight, Lightbulb, RefreshCw, Zap } from 'lucide-react';
import { Lesson, HistoryRecord, DailyFact } from '../types';
import { PHYSICS_FUN_FACTS } from '../data';

interface DashboardProps {
  lessons: Lesson[];
  history: HistoryRecord[];
  onNavigate: (tab: string, arg?: any) => void;
}

export default function Dashboard({ lessons, history, onNavigate }: DashboardProps) {
  const [factIndex, setFactIndex] = useState(0);

  const totalQuizzes = history.length;
  const avgScore = totalQuizzes > 0 
    ? Math.round((history.reduce((sum, item) => sum + item.score, 0) / totalQuizzes) * 10) / 10 
    : 0;
  const correctRatio = totalQuizzes > 0
    ? Math.round((history.reduce((sum, item) => sum + item.correctCount, 0) / history.reduce((sum, item) => sum + item.totalQuestions, 0)) * 100)
    : 0;

  const handleNextFact = () => {
    setFactIndex((prev) => (prev + 1) % PHYSICS_FUN_FACTS.length);
  };

  const currentFact = PHYSICS_FUN_FACTS[factIndex];

  // Pick a recommended lesson (e.g. first unread, or just a random one)
  const recommendedLesson = lessons[1] || lessons[0];

  return (
    <div id="dashboard-view" className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-8 shadow-xl">
        <div className="absolute right-0 top-0 opacity-10 transform translate-x-12 -translate-y-12">
          <BookOpen size={300} />
        </div>
        <div className="relative z-10 max-w-2xl space-y-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/30 text-indigo-200 border border-indigo-400/20">
            <Zap size={12} className="text-amber-400 fill-amber-400" /> Kỷ nguyên số AI Learning
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            Chinh phục Vật lí 8 <br className="hidden sm:block" />
            Cùng Trợ lí AI Thông minh!
          </h1>
          <p className="text-slate-300 text-base md:text-lg leading-relaxed">
            Học lý thuyết sinh động qua mô phỏng, làm bài tập tự luận, trắc nghiệm và trải nghiệm tính năng tạo đề thi Vật lí tự động bằng trí tuệ nhân tạo Gemini.
          </p>
          <div className="flex flex-wrap gap-4 pt-2">
            <button
              id="btn-quick-learn"
              onClick={() => onNavigate('lessons')}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium shadow-lg hover:shadow-indigo-500/20 transition-all flex items-center gap-2 group cursor-pointer"
            >
              Học bài ngay 
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              id="btn-quick-quiz"
              onClick={() => onNavigate('quiz')}
              className="px-6 py-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 hover:text-white font-medium border border-slate-700 hover:border-slate-600 transition-all flex items-center gap-2 cursor-pointer"
            >
              Luyện tập AI
            </button>
            <button
              id="btn-quick-chat"
              onClick={() => onNavigate('chat-ai')}
              className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-lg shadow-blue-500/10 transition-all flex items-center gap-2 cursor-pointer"
            >
              Trò chuyện cùng AI 💬
            </button>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="p-3.5 bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 rounded-xl">
            <BookOpen size={24} />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Bài học khả dụng</div>
            <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">{lessons.length} Bài</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="p-3.5 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-xl">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Đã làm</div>
            <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">{totalQuizzes} Đề</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="p-3.5 bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400 rounded-xl">
            <Award size={24} />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Điểm trung bình</div>
            <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">{avgScore} / 10</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content columns */}
        <div className="lg:col-span-2 space-y-8">
          {/* Daily Fun Fact */}
          <div className="bg-gradient-to-br from-amber-50/70 to-orange-50/40 dark:from-amber-950/20 dark:to-orange-950/10 p-6 rounded-2xl border border-amber-100 dark:border-amber-900/40 relative shadow-sm">
            <div className="absolute right-4 top-4">
              <button
                onClick={handleNextFact}
                title="Đổi sự thật ngẫu nhiên"
                className="p-2 hover:bg-amber-100 dark:hover:bg-amber-900/40 text-amber-700 dark:text-amber-400 rounded-lg transition-colors cursor-pointer"
              >
                <RefreshCw size={16} />
              </button>
            </div>
            <div className="flex gap-4">
              <div className="p-3 bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 rounded-xl h-fit">
                <Lightbulb size={24} className="fill-amber-400 text-amber-700 dark:text-amber-400" />
              </div>
              <div className="space-y-2 pr-8">
                <span className="text-xs font-bold text-amber-800 dark:text-amber-400 uppercase tracking-wider">Góc vật lí thú vị</span>
                <h3 className="text-lg font-bold text-slate-800 dark:text-amber-100">{currentFact.title}</h3>
                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">{currentFact.content}</p>
                {currentFact.author && (
                  <div className="text-xs text-slate-400 dark:text-slate-500 italic font-medium pt-1">
                    — Nguồn: {currentFact.author}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Homework and Online Practice Center */}
          <div className="bg-gradient-to-br from-indigo-50 to-blue-50/50 dark:from-indigo-950/20 dark:to-blue-950/10 p-6 rounded-2xl border border-indigo-100/60 dark:border-indigo-900/40 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5">
              <span className="p-2 bg-blue-600 text-white rounded-xl font-bold">🏫</span>
              <h3 className="text-base font-black text-slate-800 dark:text-slate-100">Trung tâm kiểm tra & Khảo thí trực tuyến</h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Dành cho giáo viên phát đề thi, theo dõi kết quả, bảng điểm học sinh; và dành cho học sinh đăng nhập trực tiếp bằng mã đề gồm 6 chữ số để làm bài luyện tập có tính giờ.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-850 space-y-2">
                <h4 className="text-xs font-extrabold text-blue-600 dark:text-blue-400">Dành cho Học sinh</h4>
                <p className="text-[10px] text-slate-400 leading-normal">Nhập mã đề 6 chữ số để làm bài tập giáo viên giao.</p>
                <button
                  onClick={() => onNavigate('join')}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold rounded-lg transition-all cursor-pointer"
                >
                  Vào làm bài trực tuyến 🔑
                </button>
              </div>

              <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-850 space-y-2">
                <h4 className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400">Dành cho Giáo viên</h4>
                <p className="text-[10px] text-slate-400 leading-normal">Thiết lập bài trắc nghiệm, quản lý điểm và thống kê.</p>
                <button
                  onClick={() => onNavigate('exercise-bank')}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold rounded-lg transition-all cursor-pointer"
                >
                  Truy cập Kho bài tập 🏫
                </button>
              </div>
            </div>
          </div>

          {/* Quick Learning Recommendation Card */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Bài học đề xuất hôm nay</h3>
            <div className="p-5 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="px-2.5 py-0.5 text-xs font-medium bg-blue-100 dark:bg-blue-950/50 text-blue-800 dark:text-blue-300 rounded-full">
                  {recommendedLesson.chapter}
                </span>
                <h4 className="text-base font-bold text-slate-800 dark:text-slate-100">{recommendedLesson.title}</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md">{recommendedLesson.summary}</p>
              </div>
              <button
                onClick={() => onNavigate('lesson-detail', recommendedLesson)}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium text-sm transition-colors flex items-center gap-1.5 justify-center cursor-pointer"
              >
                Khám phá ngay <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar analytics columns */}
        <div className="space-y-8">
          {/* Streak & Analytics card */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Tiến độ của bạn</h3>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs text-slate-500 font-medium mb-1.5">
                  <span>Tỉ lệ trả lời đúng</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{totalQuizzes > 0 ? `${correctRatio}%` : 'Chưa có'}</span>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-teal-500 rounded-full transition-all duration-500" 
                    style={{ width: `${totalQuizzes > 0 ? correctRatio : 0}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-500 font-medium mb-1.5">
                  <span>Bài học đã học</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{Math.round((lessons.length / 18) * 100)}%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-600 rounded-full transition-all duration-500" 
                    style={{ width: `${(lessons.length / 18) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            <hr className="border-slate-100 dark:border-slate-800" />

            {/* Quick history preview */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Lịch sử làm bài gần đây</h4>
              {history.length === 0 ? (
                <p className="text-xs text-slate-400 dark:text-slate-500 italic">Chưa làm bài tập nào. Hãy bắt đầu tạo bài luyện tập AI đầu tiên!</p>
              ) : (
                <div className="space-y-2">
                  {history.slice(0, 3).map((record) => (
                    <div key={record.id} className="p-3 bg-slate-50 dark:bg-slate-950/40 rounded-xl flex items-center justify-between text-xs border border-slate-100 dark:border-slate-800/60">
                      <div className="space-y-0.5 truncate max-w-[130px]">
                        <p className="font-bold text-slate-700 dark:text-slate-200 truncate">{record.quizTitle}</p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500">{record.date}</p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className={`px-2 py-0.5 rounded font-bold ${
                          record.score >= 8 
                            ? 'bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-300' 
                            : record.score >= 5 
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300' 
                              : 'bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300'
                        }`}>
                          {record.score}/10
                        </span>
                      </div>
                    </div>
                  ))}
                  <button 
                    onClick={() => onNavigate('history')}
                    className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 w-full text-center block pt-1 cursor-pointer"
                  >
                    Xem toàn bộ lịch sử ({history.length})
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
