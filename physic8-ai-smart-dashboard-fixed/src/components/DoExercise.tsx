import React, { useState, useEffect, useRef } from 'react';
import { Timer, HelpCircle, ArrowLeft, Check, AlertCircle, Award, RefreshCw, ChevronLeft, ChevronRight, CheckCircle2, XCircle } from 'lucide-react';
import { Homework, Question, HomeworkResult } from '../types';

interface DoExerciseProps {
  homework: Homework;
  studentName: string;
  studentClass: string;
  onSubmitResult: (result: HomeworkResult) => void;
  onExit: () => void;
}

export default function DoExercise({ homework, studentName, studentClass, onSubmitResult, onExit }: DoExerciseProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const answersRef = useRef<Record<string, number>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  
  // Timer setup
  const initialTimeSeconds = homework.timeLimitMinutes ? homework.timeLimitMinutes * 60 : 0;
  const [timeLeft, setTimeLeft] = useState(initialTimeSeconds);
  
  // Scoring
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);

  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  // Countdown timer effect
  useEffect(() => {
    if (initialTimeSeconds <= 0 || isSubmitted) return;
    
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [initialTimeSeconds, isSubmitted]);

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    if (isSubmitted) return;
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex
    }));
  };

  const handleAutoSubmit = () => {
    if (isSubmitted) return;
    handleSubmit();
  };

  const handleSubmit = () => {
    if (isSubmitted) return;

    const submittedAnswers = answersRef.current;

    // Calculate score by question points, not just number of correct answers.
    let calculatedCorrect = 0;
    let totalAssignedPoints = 0;
    let earnedPoints = 0;
    
    homework.questions.forEach((q) => {
      const questionPoints = Number(q.points || 0) || 0;
      const selectedIdx = submittedAnswers[q.id];
      const isCorrect = selectedIdx === q.correctAnswerIndex;
      if (isCorrect) {
        calculatedCorrect += 1;
        earnedPoints += questionPoints;
      }
      totalAssignedPoints += questionPoints;
    });

    // Score scaled out of 10.
    const rawScore = totalAssignedPoints > 0 ? (earnedPoints / totalAssignedPoints) * 10 : 0;
    const finalScore = Math.round(rawScore * 10) / 10;

    setCorrectCount(calculatedCorrect);
    setScore(finalScore);
    setIsSubmitted(true);
    setShowConfirmModal(false);

    // Save result record
    const newResult: HomeworkResult = {
      id: `result-${Date.now()}`,
      homeworkId: homework.id,
      homeworkCode: homework.code,
      homeworkTitle: homework.title,
      studentName: studentName,
      studentClass: studentClass,
      score: finalScore,
      correctCount: calculatedCorrect,
      totalQuestions: homework.questions.length,
      submittedAt: new Date().toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }),
      answers: submittedAnswers
    };

    onSubmitResult(newResult);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const currentQuestion = homework.questions[currentIdx];
  const answeredCount = Object.keys(answers).length;
  const progressPercent = Math.round((answeredCount / homework.questions.length) * 100);

  return (
    <div id="do-exercise-view" className="space-y-6 max-w-5xl mx-auto py-4 animate-fade-in">
      
      {/* Top Banner with Student Info */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
        <div className="space-y-1">
          <span className="text-[10px] font-black uppercase tracking-wider bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 px-2.5 py-1 rounded-full">
            Kỳ thi: {homework.title}
          </span>
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 pt-1">
            <span>Học sinh: <strong className="text-slate-700 dark:text-slate-200">{studentName}</strong></span>
            <span>•</span>
            <span>Lớp: <strong className="text-slate-700 dark:text-slate-200">{studentClass}</strong></span>
            <span>•</span>
            <span>Mã bài: <strong className="text-blue-600 font-mono font-bold">{homework.code}</strong></span>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          {initialTimeSeconds > 0 && (
            <div className={`flex items-center gap-1.5 font-mono text-sm font-bold px-3 py-1.5 rounded-xl border transition-all ${
              timeLeft < 60 && !isSubmitted
                ? 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/45 animate-pulse'
                : 'bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800'
            }`}>
              <Timer size={16} />
              <span>{isSubmitted ? 'Đã nộp bài' : formatTime(timeLeft)}</span>
            </div>
          )}

          {!isSubmitted ? (
            <button
              onClick={() => setShowConfirmModal(true)}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-blue-500/10 cursor-pointer"
            >
              Nộp bài khảo thí
            </button>
          ) : (
            <button
              onClick={onExit}
              className="px-5 py-2 bg-slate-800 dark:bg-slate-950 hover:bg-slate-900 dark:hover:bg-slate-850 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
            >
              Thoát ra
            </button>
          )}
        </div>
      </div>

      {/* Main Panel layout */}
      {!isSubmitted ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Question Display */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
              
              <div className="flex justify-between items-center">
                <span className="font-extrabold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-3 py-1 rounded-full text-xs">
                  Câu hỏi {currentIdx + 1} / {homework.questions.length}
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  Hệ số: {currentQuestion.points || 2}đ
                </span>
              </div>

              <h3 className="text-base md:text-lg font-bold text-slate-800 dark:text-slate-200 leading-relaxed">
                {currentQuestion.questionText}
              </h3>

              <div className="grid grid-cols-1 gap-3 pt-2">
                {currentQuestion.options.map((option, idx) => {
                  const isSelected = answers[currentQuestion.id] === idx;
                  const labels = ['A', 'B', 'C', 'D'];

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectOption(currentQuestion.id, idx)}
                      className={`w-full p-4 rounded-xl border text-left text-sm transition-all flex items-center gap-3 cursor-pointer ${
                        isSelected
                          ? 'border-blue-500 dark:border-blue-600 bg-blue-50/60 dark:bg-blue-950/30 text-blue-900 dark:text-blue-300 font-semibold ring-2 ring-blue-500/20'
                          : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50/50 dark:hover:bg-slate-850 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <span className={`w-6 h-6 shrink-0 flex items-center justify-center rounded-lg text-xs font-bold transition-colors ${
                        isSelected
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                      }`}>
                        {labels[idx]}
                      </span>
                      <span>{option}</span>
                    </button>
                  );
                })}
              </div>

              {/* Navigation controls */}
              <div className="flex justify-between items-center border-t border-slate-100 dark:border-slate-800/80 pt-5 mt-4">
                <button
                  disabled={currentIdx === 0}
                  onClick={() => setCurrentIdx((prev) => prev - 1)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-850 rounded-xl disabled:opacity-40 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <ChevronLeft size={16} /> Câu trước
                </button>

                <div className="text-xs text-slate-400 dark:text-slate-500">
                  Đã trả lời {answeredCount} / {homework.questions.length} câu
                </div>

                <button
                  disabled={currentIdx === homework.questions.length - 1}
                  onClick={() => setCurrentIdx((prev) => prev + 1)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-850 rounded-xl disabled:opacity-40 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  Câu tiếp theo <ChevronRight size={16} />
                </button>
              </div>

            </div>
          </div>

          {/* Quick Stats & Navigation Map */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-5">
              <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Danh sách câu hỏi</h4>

              <div className="grid grid-cols-5 gap-2">
                {homework.questions.map((q, idx) => {
                  const isCurrent = currentIdx === idx;
                  const isSelected = answers[q.id] !== undefined;

                  let btnStyle = 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850';
                  if (isCurrent) {
                    btnStyle = 'border-blue-600 dark:border-blue-500 ring-2 ring-blue-500/20 font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300';
                  } else if (isSelected) {
                    btnStyle = 'bg-blue-600 border-blue-600 text-white font-semibold';
                  }

                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentIdx(idx)}
                      className={`h-9 w-full rounded-lg border text-xs font-bold transition-all flex items-center justify-center cursor-pointer ${btnStyle}`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              <div className="text-[11px] text-slate-400 dark:text-slate-500 space-y-2 pt-3 border-t border-slate-50 dark:border-slate-850">
                <div className="flex justify-between items-center">
                  <span>Số câu đã làm:</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{answeredCount} / {homework.questions.length}</span>
                </div>
                <div className="h-1.5 w-full bg-slate-50 dark:bg-slate-950 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-600 rounded-full transition-all" 
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="p-5 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100/50 dark:border-amber-900/40 rounded-2xl space-y-2 text-xs text-amber-800 dark:text-amber-300">
              <div className="font-bold flex items-center gap-1">
                <AlertCircle size={14} /> Chú ý quy chế thi:
              </div>
              <ul className="list-disc pl-4 space-y-1">
                <li>Vui lòng không tải lại trang hoặc đóng tab khi đang làm bài.</li>
                <li>Hệ thống sẽ ghi nhận điểm số ngay khi bấm nộp bài hoặc hết thời gian.</li>
              </ul>
            </div>
          </div>

        </div>
      ) : (
        /* State 3: Submitted Results Dashboard */
        <div className="space-y-6 max-w-4xl mx-auto">
          
          {/* Result Highlight Card */}
          <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xl text-center space-y-5 animate-scale-up">
            <div className="inline-flex p-4 bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 rounded-full">
              <Award size={48} className="stroke-2" />
            </div>
            
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Khảo thí hoàn thành!</h3>
              <p className="text-sm text-slate-400 dark:text-slate-500">Kết quả bài khảo thí Vật lí của học sinh <strong>{studentName}</strong>, lớp <strong>{studentClass}</strong>.</p>
            </div>

            <div className="grid grid-cols-2 max-w-sm mx-auto p-4 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-100 dark:border-slate-850 gap-4">
              <div className="text-center space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Điểm số</span>
                <span className="text-3xl font-black text-teal-600 dark:text-teal-400">{score} / 10</span>
              </div>
              <div className="text-center space-y-1 border-l border-slate-200/80 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Số câu đúng</span>
                <span className="text-3xl font-black text-blue-600 dark:text-blue-400">{correctCount} / {homework.questions.length}</span>
              </div>
            </div>

            <p className="text-xs text-slate-400 dark:text-slate-500">
              Kết quả bài thi đã được lưu vào hệ thống học tập của Cánh Buồm Tri Thức.
            </p>

            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={onExit}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
              >
                Quay lại Trang chính
              </button>
            </div>
          </div>

          {/* Correct options & explanation detailed list (if allowed) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <HelpCircle size={18} className="text-indigo-600 dark:text-indigo-400" /> 
                <span>{homework.allowShowAnswers ? 'Xem lại đáp án & giải thích học thuật' : 'Sơ đồ bài thi'}</span>
              </h3>
              {!homework.allowShowAnswers && (
                <span className="text-[10px] font-extrabold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2.5 py-1 rounded-full uppercase tracking-wider">
                  Giáo viên ẩn giải thích
                </span>
              )}
            </div>

            {homework.questions.map((q, qIdx) => {
              const chosenIdx = answers[q.id];
              const isCorrect = chosenIdx === q.correctAnswerIndex;
              const labels = ['A', 'B', 'C', 'D'];

              return (
                <div key={q.id} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4 animate-fade-in">
                  <div className="flex justify-between items-start gap-4">
                    <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase shrink-0 flex items-center gap-1 ${
                      isCorrect 
                        ? 'bg-green-100 dark:bg-green-950/40 text-green-800 dark:text-green-300' 
                        : chosenIdx === undefined 
                          ? 'bg-slate-100 dark:bg-slate-850 text-slate-600 dark:text-slate-400' 
                          : 'bg-rose-100 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300'
                    }`}>
                      {isCorrect ? (
                        <>Đúng</>
                      ) : chosenIdx === undefined ? (
                        <>Bỏ qua</>
                      ) : (
                        <>Sai</>
                      )}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">Hệ số: {q.points || 2}đ</span>
                  </div>

                  <p className="text-slate-800 dark:text-slate-200 font-bold text-sm leading-relaxed">
                    {qIdx + 1}. {q.questionText}
                  </p>

                  <div className="grid grid-cols-1 gap-2">
                    {q.options.map((opt, optIdx) => {
                      const isOptionChosen = chosenIdx === optIdx;
                      const isOptionCorrect = q.correctAnswerIndex === optIdx;

                      let optBg = 'bg-slate-50/50 dark:bg-slate-950/30 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300';
                      let labelBg = 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400';

                      if (homework.allowShowAnswers) {
                        if (isOptionCorrect) {
                          optBg = 'bg-green-50/70 dark:bg-green-950/30 border-green-300 dark:border-green-900 text-green-900 dark:text-green-300 font-medium';
                          labelBg = 'bg-green-500 text-white';
                        } else if (isOptionChosen) {
                          optBg = 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-300 dark:border-rose-900/50 text-rose-900 dark:text-rose-300';
                          labelBg = 'bg-rose-500 text-white';
                        }
                      } else {
                        // Answers are hidden. Just show what student chose
                        if (isOptionChosen) {
                          optBg = 'bg-blue-50/70 dark:bg-blue-950/30 border-blue-300 dark:border-blue-900 text-blue-900 dark:text-blue-300 font-medium';
                          labelBg = 'bg-blue-500 text-white';
                        }
                      }

                      return (
                        <div
                          key={optIdx}
                          className={`p-3.5 rounded-xl border text-xs flex items-center gap-3 transition-colors ${optBg}`}
                        >
                          <span className={`w-5 h-5 shrink-0 flex items-center justify-center rounded-md text-[11px] font-extrabold ${labelBg}`}>
                            {labels[optIdx]}
                          </span>
                          <span>{opt}</span>
                        </div>
                      );
                    })}
                  </div>

                  {homework.allowShowAnswers && (
                    <div className="p-4 bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800 rounded-xl text-xs text-slate-500 dark:text-slate-400 leading-relaxed space-y-1.5">
                      <span className="font-bold text-slate-700 dark:text-slate-300 block">💡 Giải thích khoa học:</span>
                      <p>{q.explanation}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* State-based Confirmation Modal to avoid browser confirm blocking in iframe */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 max-w-md w-full shadow-2xl space-y-4 animate-scale-up">
            <div className="flex items-center gap-3 text-amber-500">
              <AlertCircle size={24} className="shrink-0" />
              <h3 className="text-base font-extrabold text-slate-850 dark:text-slate-200">
                Xác nhận nộp bài làm
              </h3>
            </div>
            
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {answeredCount < homework.questions.length ? (
                <>
                  Bạn mới trả lời <strong className="text-slate-800 dark:text-white">{answeredCount} / {homework.questions.length}</strong> câu hỏi. Bạn vẫn muốn nộp bài khảo thí này chứ?
                </>
              ) : (
                <>
                  Bạn đã trả lời đầy đủ <strong className="text-slate-800 dark:text-white">{homework.questions.length} / {homework.questions.length}</strong> câu hỏi. Bạn có chắc chắn muốn nộp bài làm này không?
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
                onClick={handleSubmit}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md shadow-blue-500/10 transition-all cursor-pointer"
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
