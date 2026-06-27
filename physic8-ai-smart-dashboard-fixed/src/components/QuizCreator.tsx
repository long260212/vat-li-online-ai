import React, { useState } from 'react';
import { Sparkles, Loader2, Play, AlertTriangle, Cpu, Layers, BookOpen } from 'lucide-react';
import { Lesson, Quiz, Question } from '../types';
import { SAMPLE_QUESTIONS } from '../data';

interface QuizCreatorProps {
  lessons: Lesson[];
  onStartQuiz: (quiz: Quiz) => void;
  preselectedLessonId?: string;
}

export default function QuizCreator({ lessons, onStartQuiz, preselectedLessonId }: QuizCreatorProps) {
  const [selectedLessonIds, setSelectedLessonIds] = useState<string[]>(
    preselectedLessonId ? [preselectedLessonId] : ['all']
  );
  const [difficulty, setDifficulty] = useState<'Dễ' | 'Trung bình' | 'Khó'>('Trung bình');
  const [questionCount, setQuestionCount] = useState<number>(5);
  
  const [isLoading, setIsLoading] = useState(false);
  const [aiMessage, setAiMessage] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleToggleLesson = (id: string) => {
    if (id === 'all') {
      setSelectedLessonIds(['all']);
      return;
    }
    
    let updated = [...selectedLessonIds].filter((item) => item !== 'all');
    if (updated.includes(id)) {
      updated = updated.filter((item) => item !== id);
    } else {
      updated.push(id);
    }
    
    if (updated.length === 0) {
      setSelectedLessonIds(['all']);
    } else {
      setSelectedLessonIds(updated);
    }
  };

  // Generate quiz using standard questions
  const handleGenerateStandardQuiz = () => {
    setIsLoading(true);
    setErrorMsg(null);
    setAiMessage(null);

    // Let's filter SAMPLE_QUESTIONS or generate dynamic ones based on selected lessons
    setTimeout(() => {
      let filteredPool = SAMPLE_QUESTIONS;
      
      // If we chose specific lessons, try to filter or mock questions from those lessons
      if (!selectedLessonIds.includes('all')) {
        // filter or generate
      }

      // Slice to required count
      const finalQuestions: Question[] = [];
      for (let i = 0; i < questionCount; i++) {
        const template = filteredPool[i % filteredPool.length];
        finalQuestions.push({
          ...template,
          id: `std-q-${Date.now()}-${i}`,
          points: Math.round(10 / questionCount * 10) / 10
        });
      }

      const activeLessons = selectedLessonIds.includes('all') 
        ? lessons 
        : lessons.filter(l => selectedLessonIds.includes(l.id));

      const quizTitle = selectedLessonIds.includes('all')
        ? `Luyện tập Tổng hợp: ${difficulty} (${questionCount} câu)`
        : `Luyện tập: ${activeLessons.map(l => l.title).join(', ')} (${difficulty})`;

      const quiz: Quiz = {
        id: `quiz-std-${Date.now()}`,
        title: quizTitle,
        lessonIds: selectedLessonIds,
        questions: finalQuestions,
        durationMinutes: questionCount * 2
      };

      setIsLoading(false);
      onStartQuiz(quiz);
    }, 800);
  };

  // Generate quiz using Gemini AI (Calls /api/generate-questions)
  const handleGenerateAIQuiz = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    setAiMessage(null);

    const activeLessons = selectedLessonIds.includes('all')
      ? lessons
      : lessons.filter(l => selectedLessonIds.includes(l.id));
    
    const topicDescription = selectedLessonIds.includes('all')
      ? "Chương trình Vật lí lớp 8 THCS toàn diện (Cơ học & Nhiệt học)"
      : activeLessons.map(l => l.title).join(', ');

    try {
      const response = await fetch('/api/generate-questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          topic: topicDescription,
          difficulty: difficulty,
          count: questionCount
        })
      });

      if (!response.ok) {
        throw new Error(`Lỗi server: mã trạng thái ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        if (data.message) {
          setAiMessage(data.message);
        }
        
        const rawQuestions = data.questions || [];
        // Map points evenly to sum up to 10 points
        const pointsPerQuestion = Math.round((10 / rawQuestions.length) * 10) / 10;
        
        const mappedQuestions: Question[] = rawQuestions.map((q: any, index: number) => ({
          id: q.id || `ai-q-${Date.now()}-${index}`,
          questionText: q.questionText,
          options: q.options,
          correctAnswerIndex: Number(q.correctAnswerIndex),
          explanation: q.explanation || "Chưa có giải thích chi tiết cho câu hỏi này.",
          points: pointsPerQuestion
        }));

        const quizTitle = `Đề thi thử thách AI: ${selectedLessonIds.includes('all') ? 'Tổng hợp' : activeLessons[0].title}`;

        const quiz: Quiz = {
          id: `quiz-ai-${Date.now()}`,
          title: quizTitle,
          lessonIds: selectedLessonIds,
          questions: mappedQuestions,
          durationMinutes: questionCount * 2
        };

        setIsLoading(false);
        onStartQuiz(quiz);
      } else {
        throw new Error(data.error || "Không thể khởi tạo câu hỏi từ máy chủ AI.");
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(`Không thể kết nối với dịch vụ AI Gemini: ${err.message || err}. Đang tiến hành tạo đề mẫu cục bộ.`);
      setIsLoading(false);
      
      // Fallback: Use standard quiz directly if server/AI fails completely
      setTimeout(() => {
        handleGenerateStandardQuiz();
      }, 1500);
    }
  };

  return (
    <div id="quiz-creator-view" className="space-y-8 max-w-4xl mx-auto animate-fade-in">
      
      {/* View Header */}
      <div className="space-y-1">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <Cpu className="text-indigo-600" /> Cấu hình Bài luyện tập thông minh
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Lựa chọn chủ đề ôn tập, số lượng câu hỏi và độ khó để tự kiểm tra kiến thức Vật lí 8 của bạn.
        </p>
      </div>

      {isLoading ? (
        <div className="bg-white dark:bg-slate-900 p-12 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-lg text-center space-y-4 animate-pulse">
          <div className="flex justify-center text-indigo-600">
            <Loader2 size={48} className="animate-spin" />
          </div>
          <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200">Đang khởi tạo đề thi...</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm max-w-md mx-auto">
            Hệ thống đang tải ngân hàng câu hỏi hoặc triệu gọi Trợ lí AI Gemini biên soạn các thử thách đo lường kiến thức Vật lí dành cho bạn. Xin vui lòng chờ giây lát!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Settings Section */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
              
              {/* Question count & difficulty */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Count Selection */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Số lượng câu hỏi</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[3, 5, 10].map((count) => (
                      <button
                        key={count}
                        id={`btn-count-${count}`}
                        onClick={() => setQuestionCount(count)}
                        className={`py-3.5 rounded-xl text-sm font-bold border transition-all cursor-pointer ${
                          questionCount === count
                            ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/10'
                            : 'bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900'
                        }`}
                      >
                        {count} Câu
                      </button>
                    ))}
                  </div>
                </div>

                {/* Difficulty Selection */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Mức độ khó</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['Dễ', 'Trung bình', 'Khó'] as const).map((diff) => (
                      <button
                        key={diff}
                        id={`btn-diff-${diff}`}
                        onClick={() => setDifficulty(diff)}
                        className={`py-3.5 rounded-xl text-sm font-bold border transition-all cursor-pointer ${
                          difficulty === diff
                            ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/10'
                            : 'bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900'
                        }`}
                      >
                        {diff}
                      </button>
                    ))}
                  </div>
                </div>

              </div>

              {/* Lesson Picker */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Phạm vi nội dung câu hỏi</label>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-[250px] overflow-y-auto pr-2 border border-slate-100 dark:border-slate-850 rounded-xl p-3 bg-slate-50/50 dark:bg-slate-950/40">
                  <button
                    onClick={() => handleToggleLesson('all')}
                    className={`p-3 rounded-xl border text-left text-xs font-semibold transition-all flex items-center justify-between cursor-pointer ${
                      selectedLessonIds.includes('all')
                        ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-800/60 text-indigo-900 dark:text-indigo-300 font-bold'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-850'
                    }`}
                  >
                    <span>Toàn bộ chương trình (Tổng hợp)</span>
                    <Layers size={14} className={selectedLessonIds.includes('all') ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'} />
                  </button>

                  {lessons.map((lesson) => {
                    const isSelected = selectedLessonIds.includes(lesson.id);
                    return (
                      <button
                        key={lesson.id}
                        onClick={() => handleToggleLesson(lesson.id)}
                        className={`p-3 rounded-xl border text-left text-xs transition-all flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-800/60 text-indigo-900 dark:text-indigo-300 font-bold'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-850'
                        }`}
                      >
                        <span className="truncate max-w-[210px]">{lesson.title}</span>
                        <BookOpen size={14} className={isSelected ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'} />
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>

          {/* Execution Panel */}
          <div className="space-y-6">
            
            {/* AI Generation Box */}
            <div className="bg-gradient-to-br from-indigo-900 via-purple-950 to-slate-900 text-white p-6 rounded-2xl shadow-xl space-y-6 border border-purple-500/10 relative overflow-hidden">
              <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 opacity-10">
                <Sparkles size={120} />
              </div>
              
              <div className="space-y-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/30 text-purple-200 border border-purple-400/20 uppercase tracking-wider">
                  <Sparkles size={10} className="fill-purple-300 text-purple-300 animate-pulse" /> Sáng tạo cùng AI
                </span>
                <h3 className="text-lg font-bold">Trợ lí Đề thi AI</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Trực tiếp kết nối mô hình Gemini để soạn ra các câu hỏi trắc nghiệm thông minh, ứng dụng tư duy phản biện cao.
                </p>
              </div>

              {/* Disclaimer */}
              <div className="p-3 bg-white/5 border border-white/10 rounded-xl flex gap-2 text-[11px] text-slate-300 leading-relaxed">
                <AlertTriangle size={16} className="text-amber-400 shrink-0 mt-0.5" />
                <span>AI chỉ tạo bản thảo dự thảo. Giáo viên và học sinh cần chủ động đối soát học thuật trước khi lưu trữ đề thi.</span>
              </div>

              <button
                id="btn-generate-ai"
                onClick={handleGenerateAIQuiz}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white text-sm font-bold shadow-lg shadow-indigo-950/45 transition-all flex items-center justify-center gap-2 group cursor-pointer"
              >
                <Sparkles size={16} className="fill-white animate-spin" /> Soạn đề bằng AI Gemini 
                <Play size={12} className="group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>

            {/* Local Traditional Generation Box */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">Ngân hàng đề tiêu chuẩn</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Tải đề thi trực tiếp từ kho tư liệu bám sát chương trình giảng dạy của giáo viên khối THCS.
              </p>
              <button
                id="btn-generate-standard"
                onClick={handleGenerateStandardQuiz}
                className="w-full py-3 px-4 rounded-xl bg-slate-800 dark:bg-slate-950 hover:bg-slate-900 dark:hover:bg-slate-850 text-slate-100 dark:text-slate-200 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                Tải đề truyền thống
              </button>
            </div>

          </div>

        </div>
      )}

      {/* Error prompt */}
      {errorMsg && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900/50 rounded-xl text-rose-800 dark:text-rose-300 text-xs flex gap-2 animate-fade-in">
          <AlertTriangle size={16} className="shrink-0 text-rose-500" />
          <div>
            <p className="font-bold">Lưu ý kết nối:</p>
            <p>{errorMsg}</p>
          </div>
        </div>
      )}

      {/* AI Success Feedback Message */}
      {aiMessage && (
        <div className="p-4 bg-teal-50 dark:bg-teal-950/40 border border-teal-100 dark:border-teal-900/50 rounded-xl text-teal-900 dark:text-teal-300 text-xs flex gap-2 animate-fade-in">
          <Sparkles size={16} className="text-teal-600 dark:text-teal-400 shrink-0" />
          <div>
            <p className="font-bold">Phản hồi từ trợ lí AI:</p>
            <p>{aiMessage}</p>
          </div>
        </div>
      )}

    </div>
  );
}
