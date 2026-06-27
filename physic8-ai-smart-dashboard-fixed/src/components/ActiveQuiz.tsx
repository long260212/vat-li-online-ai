import React, { useState, useEffect, useRef } from 'react';
import { Timer, CheckCircle, AlertTriangle, ArrowLeft, ArrowRight, HelpCircle, Send, Save, Award } from 'lucide-react';
import { Quiz, Question } from '../types';

interface ActiveQuizProps {
  quiz: Quiz;
  onQuizCompleted: (score: number, correctCount: number, answers: Record<string, number>, questions: Question[]) => void;
  onCancel: () => void;
}

export default function ActiveQuiz({ quiz, onQuizCompleted, onCancel }: ActiveQuizProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [timeLeft, setTimeLeft] = useState(quiz.durationMinutes * 60);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          // Auto submit
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleSelectOption = (questionId: string, optionIdx: number) => {
    if (isSubmitted) return;
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionIdx
    }));
  };

  const handleAutoSubmit = () => {
    if (isSubmitted) return;
    calculateScore(answers);
  };

  const calculateScore = (finalAnswers: Record<string, number>) => {
    if (timerRef.current) clearInterval(timerRef.current);
    
    let corrects = 0;
    quiz.questions.forEach((q) => {
      if (finalAnswers[q.id] === q.correctAnswerIndex) {
        corrects++;
      }
    });

    const calculatedScore = Math.round(((corrects / quiz.questions.length) * 10) * 10) / 10;
    
    setCorrectCount(corrects);
    setScore(calculatedScore);
    setIsSubmitted(true);
  };

  const handleSubmitQuiz = () => {
    if (isSubmitted) return;
    calculateScore(answers);
    setShowConfirmModal(false);
  };

  const handleSaveResult = () => {
    onQuizCompleted(score, correctCount, answers, quiz.questions);
  };

  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const currentQuestion = quiz.questions[currentIdx];
  const isLastQuestion = currentIdx === quiz.questions.length - 1;

  // Percentage answered
  const answeredCount = Object.keys(answers).length;
  const progressPercent = Math.round((answeredCount / quiz.questions.length) * 100);

  return (
    <div id="active-quiz-view" className="space-y-6 max-w-5xl mx-auto animate-fade-in">
      
      {/* Top Header Controls */}
      <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
        <button
          onClick={onCancel}
          className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 font-semibold text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <ArrowLeft size={14} /> Thoát chế độ thi
        </button>

        <div className="flex items-center gap-4">
          {/* Timer Display */}
          <div className={`flex items-center gap-1.5 font-mono text-sm font-bold px-3 py-1.5 rounded-xl border transition-all ${
            timeLeft < 60 && !isSubmitted
              ? 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/40 animate-pulse'
              : 'bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800'
          }`}>
            <Timer size={16} />
            <span>{isSubmitted ? 'Đã nộp bài' : formatTime(timeLeft)}</span>
          </div>

          {!isSubmitted && (
            <button
              id="btn-submit-exam"
              onClick={() => setShowConfirmModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1 cursor-pointer"
            >
              <Send size={12} /> Nộp bài thi
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left column: Main Question detail */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
            
            {/* Question title area */}
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2.5 py-1 rounded-full uppercase">
                  Câu hỏi {currentIdx + 1} / {quiz.questions.length}
                </span>
                <span className="font-semibold text-slate-400 dark:text-slate-500">
                  Hệ số điểm: {currentQuestion.points}đ
                </span>
              </div>
              <h3 className="text-base md:text-lg font-bold text-slate-800 dark:text-slate-200 leading-relaxed">
                {currentQuestion.questionText}
              </h3>
            </div>

            {/* Answer Options list */}
            <div className="space-y-3">
              {currentQuestion.options.map((option, idx) => {
                const isSelected = answers[currentQuestion.id] === idx;
                const isCorrect = currentQuestion.correctAnswerIndex === idx;
                
                // Colors definition
                let optionStyle = 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50/50 dark:hover:bg-slate-850 hover:border-slate-300 dark:hover:border-slate-700';
                let indicatorStyle = 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-455';

                if (isSubmitted) {
                  if (isCorrect) {
                    optionStyle = 'border-green-300 dark:border-green-900 bg-green-50/70 dark:bg-green-950/30 text-green-900 dark:text-green-300 font-semibold';
                    indicatorStyle = 'bg-green-500 text-white';
                  } else if (isSelected) {
                    optionStyle = 'border-rose-300 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/30 text-rose-900 dark:text-rose-300';
                    indicatorStyle = 'bg-rose-500 text-white';
                  } else {
                    optionStyle = 'border-slate-100 dark:border-slate-850 opacity-60 bg-white dark:bg-slate-950/20 text-slate-400 dark:text-slate-500';
                    indicatorStyle = 'bg-slate-50 dark:bg-slate-900 text-slate-300 dark:text-slate-600';
                  }
                } else if (isSelected) {
                  optionStyle = 'border-blue-500 dark:border-blue-600 bg-blue-50/60 dark:bg-blue-950/30 text-blue-900 dark:text-blue-300 font-semibold ring-2 ring-blue-500/20 dark:ring-blue-500/10';
                  indicatorStyle = 'bg-blue-600 text-white';
                }

                const labels = ['A', 'B', 'C', 'D'];

                return (
                  <button
                    key={idx}
                    id={`btn-option-${currentIdx}-${idx}`}
                    onClick={() => handleSelectOption(currentQuestion.id, idx)}
                    disabled={isSubmitted}
                    className={`w-full text-left p-4 rounded-xl border text-sm transition-all flex items-start gap-3.5 cursor-pointer ${optionStyle}`}
                  >
                    <span className={`w-6 h-6 shrink-0 rounded-lg font-bold text-xs flex items-center justify-center font-mono ${indicatorStyle}`}>
                      {labels[idx]}
                    </span>
                    <span className="leading-relaxed">{option}</span>
                  </button>
                );
              })}
            </div>

            {/* Question footer buttons */}
            <div className="flex justify-between items-center border-t border-slate-50 dark:border-slate-850 pt-5 mt-4">
              <button
                disabled={currentIdx === 0}
                onClick={() => setCurrentIdx((prev) => prev - 1)}
                className="px-4 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-850 rounded-xl disabled:opacity-40 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft size={14} /> Câu trước
              </button>

              <button
                disabled={isLastQuestion}
                onClick={() => setCurrentIdx((prev) => prev + 1)}
                className="px-4 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl disabled:opacity-40 transition-colors flex items-center gap-1 cursor-pointer"
              >
                Câu tiếp theo <ArrowRight size={14} />
              </button>
            </div>

          </div>

          {/* Submitted Explanations Card */}
          {isSubmitted && (
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4 animate-fade-in">
              <div className="flex items-center gap-2 text-teal-700 dark:text-teal-400 font-bold text-sm">
                <HelpCircle size={18} />
                <span>Giải thích học thuật chi tiết</span>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-850 rounded-xl text-slate-600 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                {currentQuestion.explanation}
              </div>
            </div>
          )}

        </div>

        {/* Right column: Test Navigation Index & Grading results */}
        <div className="space-y-6">
          
          {/* Active Navigation Grid */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-5">
            <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Danh sách câu hỏi</h4>
            
            <div className="grid grid-cols-5 gap-2">
              {quiz.questions.map((q, idx) => {
                const isSelected = answers[q.id] !== undefined;
                const isCurrent = currentIdx === idx;
                const isCorrect = answers[q.id] === q.correctAnswerIndex;

                let btnStyle = 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850';
                
                if (isSubmitted) {
                  if (isCorrect) {
                    btnStyle = 'bg-green-500 border-green-500 text-white';
                  } else if (isSelected) {
                    btnStyle = 'bg-rose-500 border-rose-500 text-white';
                  } else {
                    btnStyle = 'bg-slate-100 dark:bg-slate-950 border-slate-100 dark:border-slate-850 text-slate-300 dark:text-slate-600';
                  }
                } else if (isCurrent) {
                  btnStyle = 'border-blue-600 dark:border-blue-500 ring-2 ring-blue-500/20 dark:ring-blue-500/10 font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300';
                } else if (isSelected) {
                  btnStyle = 'bg-blue-600 border-blue-600 text-white font-semibold';
                }

                return (
                  <button
                    key={q.id}
                    id={`btn-nav-question-${idx}`}
                    onClick={() => setCurrentIdx(idx)}
                    className={`h-10 rounded-xl border text-xs font-semibold flex items-center justify-center transition-all cursor-pointer ${btnStyle}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            <div className="text-[11px] text-slate-400 dark:text-slate-500 space-y-1.5 pt-2 border-t border-slate-50 dark:border-slate-850">
              <div className="flex justify-between items-center">
                <span>Số câu đã trả lời:</span>
                <span className="font-semibold text-slate-600 dark:text-slate-400">{answeredCount} / {quiz.questions.length}</span>
              </div>
              <div className="h-1.5 w-full bg-slate-50 dark:bg-slate-950 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-600 rounded-full transition-all" 
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Results Summary Box (Visible ONLY after submission) */}
          {isSubmitted && (
            <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white p-6 rounded-2xl shadow-xl space-y-6 animate-fade-in">
              <div className="flex justify-between items-center border-b border-indigo-500/20 pb-4">
                <h3 className="font-bold text-base flex items-center gap-1">
                  <Award className="text-amber-400" size={18} /> Kết quả làm bài
                </h3>
                <span className="px-2.5 py-0.5 rounded font-bold bg-indigo-500/30 text-indigo-100 text-xs">Phổ điểm 8</span>
              </div>

              {/* Big Score badge */}
              <div className="text-center space-y-1">
                <p className="text-[10px] uppercase font-bold text-slate-300 tracking-wider">Tổng điểm đạt được</p>
                <p className="text-4xl font-black text-amber-400">{score} <span className="text-sm font-medium text-slate-300">/ 10đ</span></p>
                <p className="text-xs text-slate-300">Trả lời đúng {correctCount} / {quiz.questions.length} câu</p>
              </div>

              {/* Text review message */}
              <div className="p-3 bg-white/5 border border-white/10 rounded-xl text-xs text-slate-200 leading-relaxed text-center">
                {score >= 8.0 
                  ? "Xuất sắc! Bạn đã làm rất tốt đề Vật lí này. Tiếp tục phát huy nhé! 🥳" 
                  : score >= 5.0 
                    ? "Đạt yêu cầu! Hãy xem kỹ các câu sai để ghi nhớ công thức hơn nhé! 👍" 
                    : "Cần cố gắng học lại lý thuyết cốt lõi để nâng điểm thi tiếp theo! 📚"}
              </div>

              {/* Form Action */}
              <button
                id="btn-save-quiz-history"
                onClick={handleSaveResult}
                className="w-full py-3 bg-teal-500 hover:bg-teal-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-teal-950/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Save size={14} /> Lưu kết quả học tập
              </button>
            </div>
          )}

        </div>

      </div>

      {/* State-based Confirmation Modal to avoid browser confirm blocking in iframe */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 max-w-md w-full shadow-2xl space-y-4 animate-scale-up">
            <div className="flex items-center gap-3 text-amber-500">
              <AlertTriangle size={24} className="shrink-0" />
              <h3 className="text-base font-extrabold text-slate-850 dark:text-slate-200">
                Xác nhận nộp bài thi
              </h3>
            </div>
            
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {quiz.questions.length - Object.keys(answers).length > 0 ? (
                <>
                  Bạn còn <strong className="text-rose-600 dark:text-rose-400">{quiz.questions.length - Object.keys(answers).length}</strong> câu hỏi chưa trả lời. Bạn có chắc chắn muốn nộp bài ngay bây giờ?
                </>
              ) : (
                <>
                  Bạn đã trả lời đầy đủ tất cả <strong className="text-slate-800 dark:text-white">{quiz.questions.length} / {quiz.questions.length}</strong> câu hỏi. Bạn chắc chắn muốn nộp bài thi này để chấm điểm?
                </>
              )}
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-600 dark:text-slate-300 font-bold rounded-xl text-xs transition-all cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSubmitQuiz}
                className="px-4 py-2 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white font-bold rounded-xl text-xs shadow-md transition-all cursor-pointer"
              >
                Đồng ý nộp bài
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
