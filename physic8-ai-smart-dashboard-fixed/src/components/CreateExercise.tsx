import React, { useState, useEffect } from 'react';
import { ArrowLeft, Sparkles, Loader2, Plus, Trash2, Shield, Lock, Unlock, HelpCircle, Save, CheckCircle, Copy, Play, RefreshCw, Info } from 'lucide-react';
import { Lesson, Question, Homework, HomeworkStatus } from '../types';
import { SAMPLE_QUESTIONS } from '../data';
import { copyTextToClipboard } from '../clipboard';
import { hashPassword } from '../security';

interface CreateExerciseProps {
  lessons: Lesson[];
  existingHomeworks: Homework[];
  homeworkToEdit?: Homework | null;
  onSave: (homework: Homework) => void;
  onCancel: () => void;
}

// Simple unique code generator
function generateUniqueCode(existingCodes: string[]): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclude I, O, 1, 0
  let code = '';
  let attempts = 0;
  do {
    code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    attempts++;
  } while (existingCodes.includes(code) && attempts < 1000);
  return code;
}

export default function CreateExercise({ lessons, existingHomeworks, homeworkToEdit, onSave, onCancel }: CreateExerciseProps) {
  // Basic attributes
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedLessonIds, setSelectedLessonIds] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState<'Dễ' | 'Trung bình' | 'Khó'>('Trung bình');
  const [status, setStatus] = useState<HomeworkStatus>('published');
  const [timeLimitMinutes, setTimeLimitMinutes] = useState<number>(15);
  const [allowShowAnswers, setAllowShowAnswers] = useState(true);
  
  // Code & Security settings
  const [code, setCode] = useState('');
  const [isPasswordProtected, setIsPasswordProtected] = useState(false);
  const [password, setPassword] = useState('');

  // Questions database
  const [questions, setQuestions] = useState<Question[]>([]);

  // AI Generation configuration
  const [aiTopic, setAiTopic] = useState('');
  const [aiCount, setAiCount] = useState(5);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiSuccess, setAiSuccess] = useState<string | null>(null);

  // Manual Question editor & Tabs
  const [editorTab, setEditorTab] = useState<'manual' | 'ai' | 'bank'>('manual');
  const [manualText, setManualText] = useState('');
  const [manualOptions, setManualOptions] = useState<string[]>(['', '', '', '']);
  const [manualCorrectIndex, setManualCorrectIndex] = useState(0);
  const [manualExplanation, setManualExplanation] = useState('');

  // Post Save details
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [savedHomework, setSavedHomework] = useState<Homework | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Initialize
  useEffect(() => {
    const existingCodes = existingHomeworks.map(h => h.code);
    
    if (homeworkToEdit) {
      setTitle(homeworkToEdit.title);
      setDescription(homeworkToEdit.description || '');
      setSelectedLessonIds(homeworkToEdit.lessonIds || (homeworkToEdit.lessonId ? [homeworkToEdit.lessonId] : []));
      setDifficulty((homeworkToEdit.difficulty as any) || 'Trung bình');
      setStatus(homeworkToEdit.status);
      setTimeLimitMinutes(homeworkToEdit.timeLimitMinutes || 15);
      setAllowShowAnswers(homeworkToEdit.allowShowAnswers !== false);
      setCode(homeworkToEdit.code);
      setIsPasswordProtected(homeworkToEdit.isPasswordProtected);
      setPassword('');
      setQuestions(homeworkToEdit.questions);
    } else {
      // Create mode
      setTitle('');
      setDescription('');
      setSelectedLessonIds([]);
      setDifficulty('Trung bình');
      setStatus('published');
      setTimeLimitMinutes(15);
      setAllowShowAnswers(true);
      setCode(generateUniqueCode(existingCodes));
      setIsPasswordProtected(false);
      setPassword('');
      setQuestions([]);
    }
  }, [homeworkToEdit, existingHomeworks]);

  // Handle auto code regenerator
  const handleRegenerateCode = () => {
    const existingCodes = existingHomeworks
      .filter((h) => h.id !== homeworkToEdit?.id)
      .map((h) => h.code);
    setCode(generateUniqueCode(existingCodes));
  };

  // Toggle selection of lesson reference
  const handleToggleLesson = (id: string) => {
    setSelectedLessonIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  // Delete an existing question
  const handleDeleteQuestion = (qId: string) => {
    setQuestions((prev) => prev.filter(q => q.id !== qId));
  };

  // Move questions up or down
  const handleMoveQuestion = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === questions.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const updated = [...questions];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setQuestions(updated);
  };

  // Auto balance points to total 10.0
  const handleAutoBalancePoints = () => {
    if (questions.length === 0) return;
    const pointsPerQuestion = Math.round((10 / questions.length) * 10) / 10;
    setQuestions((prev) => 
      prev.map((q) => ({
        ...q,
        points: pointsPerQuestion
      }))
    );
  };

  // AI generate action
  const handleCallAI = async (mode: 'replace' | 'append') => {
    setIsGeneratingAI(true);
    setAiError(null);
    setAiSuccess(null);

    // Context from selected lessons
    const activeLessons = lessons.filter(l => selectedLessonIds.includes(l.id));
    const topicDescription = aiTopic.trim() || (
      activeLessons.length > 0 
        ? `Các bài học Vật lí 8: ${activeLessons.map(l => l.title).join(', ')}`
        : "Vật lí 8 tổng hợp"
    );

    try {
      const response = await fetch('/api/generate-questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          topic: topicDescription,
          difficulty: difficulty,
          count: aiCount
        })
      });

      if (!response.ok) {
        throw new Error(`Mã phản hồi từ server: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.questions) {
        const rawQuestions = data.questions;
        const pointsPerQuestion = Math.round((10 / (mode === 'replace' ? rawQuestions.length : (questions.length + rawQuestions.length))) * 10) / 10;

        const mappedQuestions: Question[] = rawQuestions.map((q: any, idx: number) => ({
          id: `ai-q-${Date.now()}-${idx}`,
          questionText: q.questionText,
          options: q.options,
          correctAnswerIndex: Number(q.correctAnswerIndex),
          explanation: q.explanation || "Giải thích khoa học chuẩn.",
          points: pointsPerQuestion
        }));

        if (mode === 'replace') {
          setQuestions(mappedQuestions);
          setAiSuccess(`Đã thay thế thành công bằng ${mappedQuestions.length} câu hỏi do AI tạo ra!`);
        } else {
          setQuestions((prev) => {
            const merged = [...prev, ...mappedQuestions];
            // Re-balance points for all questions
            const newPoints = Math.round((10 / merged.length) * 10) / 10;
            return merged.map(q => ({ ...q, points: newPoints }));
          });
          setAiSuccess(`Đã nối thêm thành công ${mappedQuestions.length} câu hỏi mới vào đề!`);
        }
      } else {
        throw new Error(data.message || 'Lỗi từ Gemini API service.');
      }
    } catch (err: any) {
      console.error(err);
      // fallback mock generator to preserve offline usability
      setAiError(`Đang chạy chế độ ngoại tuyến: Không thể kết nối AI (${err.message || err}). Đã chèn câu hỏi mẫu Vật lí 8.`);
      
      // Inject standard sample questions
      const pointsPerQuestion = Math.round((10 / aiCount) * 10) / 10;
      const mocked: Question[] = [];
      for (let i = 0; i < aiCount; i++) {
        const t = SAMPLE_QUESTIONS[i % SAMPLE_QUESTIONS.length];
        mocked.push({
          ...t,
          id: `fallback-q-${Date.now()}-${i}`,
          points: pointsPerQuestion
        });
      }

      if (mode === 'replace') {
        setQuestions(mocked);
      } else {
        setQuestions((prev) => [...prev, ...mocked]);
      }
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // Add standard samples
  const handleAddStandardSamples = () => {
    const pointsPerQuestion = Math.round((10 / 5) * 10) / 10;
    const standardQuestions: Question[] = SAMPLE_QUESTIONS.map((q, idx) => ({
      ...q,
      id: `std-q-${Date.now()}-${idx}`,
      points: pointsPerQuestion
    }));
    setQuestions(standardQuestions);
  };

  // Add question manually
  const handleAddManualQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualText.trim()) return;

    const validatedOptions = manualOptions.map(opt => opt.trim() || 'Lựa chọn chưa điền');
    
    const newQ: Question = {
      id: `manual-q-${Date.now()}`,
      questionText: manualText.trim(),
      options: validatedOptions,
      correctAnswerIndex: manualCorrectIndex,
      explanation: manualExplanation.trim() || 'Giải thích chuẩn theo kiến thức SGK Vật lí 8.',
      points: 2
    };

    setQuestions((prev) => {
      const updated = [...prev, newQ];
      const balancedPoints = Math.round((10 / updated.length) * 10) / 10;
      return updated.map(q => ({ ...q, points: balancedPoints }));
    });

    // Reset form
    setManualText('');
    setManualOptions(['', '', '', '']);
    setManualCorrectIndex(0);
    setManualExplanation('');
  };

  // Calculate stats
  const totalPoints = questions.reduce((sum, q) => sum + (q.points || 0), 0);
  const roundedTotalPoints = Math.round(totalPoints * 10) / 10;

  // Save the entire homework record
  const handleSaveHomework = async () => {
    if (!title.trim()) {
      alert('Vui lòng điền tiêu đề bài tập.');
      return;
    }

    if (questions.length === 0) {
      alert('Vui lòng thêm ít nhất 1 câu hỏi vào bài tập này.');
      return;
    }

    if (isPasswordProtected && !password.trim() && !homeworkToEdit?.passwordHash) {
      alert('Vui lòng nhập mật khẩu truy cập hoặc tắt tùy chọn yêu cầu mật khẩu.');
      return;
    }

    setIsSaving(true);
    let nextPasswordHash: string | undefined;
    try {
      if (isPasswordProtected) {
        nextPasswordHash = password.trim()
          ? await hashPassword(password.trim())
          : homeworkToEdit?.passwordHash;
      }
    } catch (err) {
      console.error('Error hashing password:', err);
      alert('Không thể mã hóa mật khẩu. Vui lòng thử lại.');
      setIsSaving(false);
      return;
    }

    const homeworkObj: Homework = {
      id: homeworkToEdit?.id || `homework-${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      lessonIds: selectedLessonIds,
      lessonId: selectedLessonIds[0] || '',
      difficulty: difficulty,
      questions: questions,
      totalPoints: roundedTotalPoints,
      code: code.trim().toUpperCase(),
      status: status,
      isPasswordProtected: isPasswordProtected,
      passwordHash: isPasswordProtected ? nextPasswordHash : undefined,
      timeLimitMinutes: Number(timeLimitMinutes) || 15,
      allowShowAnswers: allowShowAnswers,
      createdAt: homeworkToEdit?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onSave(homeworkObj);
    setSavedHomework(homeworkObj);
    setShowSuccessModal(true);
    setIsSaving(false);
  };

  // Clipboard Copiers
  const copyToClipboard = async (text: string, type: 'code' | 'link') => {
    await copyTextToClipboard(text);
    if (type === 'code') {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } else {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const shareLink = `${window.location.origin}/?code=${code}`;

  return (
    <div id="create-exercise-view" className="space-y-6 max-w-6xl mx-auto py-2 animate-fade-in relative">
      
      {/* Success Modal Overlay after saving */}
      {showSuccessModal && savedHomework && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-2xl p-6 md:p-8 max-w-lg w-full space-y-6 text-center animate-scale-up">
            
            <div className="inline-flex p-3 bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400 rounded-2xl">
              <CheckCircle size={40} className="stroke-2" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Bài tập đã được lưu thành công!</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500">Mã bài thi trực tuyến đã sẵn sàng để gửi tới học sinh.</p>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-850 space-y-4">
              
              {/* Alphanumeric unique code info */}
              <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200/50 dark:border-slate-800">
                <div className="text-left">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block tracking-wider">Mã bài tập</span>
                  <span className="text-lg font-mono font-black text-blue-600 dark:text-blue-400">{savedHomework.code}</span>
                </div>
                <button
                  onClick={() => copyToClipboard(savedHomework.code, 'code')}
                  className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                >
                  {copiedCode ? 'Đã sao chép!' : <><Copy size={12} /> Sao chép</>}
                </button>
              </div>

              {/* Direct share deep link */}
              <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200/50 dark:border-slate-800">
                <div className="text-left overflow-hidden mr-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block tracking-wider">Đường dẫn làm bài trực tiếp</span>
                  <span className="text-xs text-slate-500 truncate block font-mono">{shareLink}</span>
                </div>
                <button
                  onClick={() => copyToClipboard(shareLink, 'link')}
                  className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-bold transition-all flex items-center gap-1 shrink-0 cursor-pointer"
                >
                  {copiedLink ? 'Đã sao chép!' : <><Copy size={12} /> Sao chép</>}
                </button>
              </div>

              {/* Password notification block */}
              {savedHomework.isPasswordProtected && (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/20 rounded-xl border border-amber-100 dark:border-amber-900/50 text-left text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                  ⚠️ <b>Bài thi yêu cầu mật khẩu:</b> Đề thi đã được bảo vệ. Vui lòng gửi riêng mật khẩu bạn đã đặt kèm mã bài cho học sinh. Nếu quên mật khẩu, hãy mở bài tập và đặt mật khẩu mới.
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={onCancel}
                className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                Về kho bài tập
              </button>
              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  onCancel();
                }}
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-md shadow-blue-500/10"
              >
                Hoàn tất
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Main Form content */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-150 pb-5">
        <div className="space-y-1">
          <button
            onClick={onCancel}
            className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-850 rounded-lg cursor-pointer"
          >
            <ArrowLeft size={14} /> Quay lại
          </button>
          <h2 className="text-xl md:text-2xl font-black text-slate-800 dark:text-slate-100">
            {homeworkToEdit ? 'Cập nhật bài tập Vật lí 8' : 'Soạn thảo & Thiết kế bài thi Vật lí 8'}
          </h2>
          <p className="text-xs text-slate-400">
            {homeworkToEdit ? 'Hiệu chỉnh nội dung, thay thế cấu trúc câu hỏi trắc nghiệm.' : 'Tạo mới bộ đề tự luyện trắc nghiệm, tích hợp cấu hình bảo mật mật mã trực tuyến.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSaveHomework}
            disabled={isSaving}
            className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-400 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
          >
            <Save size={15} /> {isSaving ? 'Đang lưu...' : 'Lưu & Đóng đề thi'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left column: Core attributes form */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Section 1: Basic Information */}
          <div className="bg-white dark:bg-slate-900 p-5 md:p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Thông tin chung</h3>
            
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300">Tên bài tập/Đề thi <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ví dụ: Kiểm tra 15 phút - Lực đẩy Ác-si-mét"
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-850 dark:text-slate-100"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300">Mô tả/Hướng dẫn làm bài</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ví dụ: Đề thi khảo sát chất lượng kiến thức học sinh chương I. Làm bài nghiêm túc, không sử dụng tài liệu."
                  rows={2}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-850 dark:text-slate-100"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300">Độ khó đề thi</label>
                  <select
                    value={difficulty}
                    onChange={(e: any) => setDifficulty(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-850 dark:text-slate-100"
                  >
                    <option value="Dễ">Dễ</option>
                    <option value="Trung bình">Trung bình</option>
                    <option value="Khó">Khó</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300">Thời gian làm bài (Phút)</label>
                  <input
                    type="number"
                    min={1}
                    max={180}
                    value={timeLimitMinutes}
                    onChange={(e) => setTimeLimitMinutes(Number(e.target.value) || 15)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-850 dark:text-slate-100"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Question Database Management (Giáo viên tự tạo hoặc AI) */}
          <div className="bg-white dark:bg-slate-900 p-5 md:p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-5">
            <div>
              <h3 className="text-sm font-black text-slate-850 dark:text-slate-200 uppercase tracking-wider mb-2">
                🛠️ Phương thức xây dựng câu hỏi
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Lựa chọn phương thức soạn đề phù hợp. Mọi câu hỏi được thêm sẽ hiển thị ở danh sách đề thi trực tuyến phía dưới.
              </p>
            </div>

            {/* Editor Tabs Selection */}
            <div className="grid grid-cols-3 gap-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200/40 dark:border-slate-850">
              <button
                type="button"
                onClick={() => setEditorTab('manual')}
                className={`py-2 rounded-lg text-xs font-bold transition-all cursor-pointer text-center flex items-center justify-center gap-1 ${
                  editorTab === 'manual'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                ✍️ Giáo viên tự tạo
              </button>
              <button
                type="button"
                onClick={() => setEditorTab('ai')}
                className={`py-2 rounded-lg text-xs font-bold transition-all cursor-pointer text-center flex items-center justify-center gap-1 ${
                  editorTab === 'ai'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                🧠 Trợ lý AI (Gemini)
              </button>
              <button
                type="button"
                onClick={() => setEditorTab('bank')}
                className={`py-2 rounded-lg text-xs font-bold transition-all cursor-pointer text-center flex items-center justify-center gap-1 ${
                  editorTab === 'bank'
                    ? 'bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                📚 Đề mẫu có sẵn
              </button>
            </div>

            {/* TAB 1: MANUAL QUESTION EDITOR */}
            {editorTab === 'manual' && (
              <form onSubmit={handleAddManualQuestion} className="p-4 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200/50 dark:border-slate-850 space-y-4 animate-fade-in">
                <div className="flex justify-between items-center pb-2 border-b border-slate-150 dark:border-slate-850">
                  <span className="text-xs font-extrabold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                    ✍️ Giáo viên tự biên soạn đề thi (Thủ công)
                  </span>
                  <span className="text-[10px] text-slate-400 italic">Hiện có: {questions.length} câu</span>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Nội dung câu hỏi <span className="text-rose-500">*</span></label>
                  <textarea
                    rows={2}
                    required
                    value={manualText}
                    onChange={(e) => setManualText(e.target.value)}
                    placeholder="Ví dụ: Lực đẩy Ác-si-mét tác dụng lên vật nhúng trong chất lỏng có hướng như thế nào?"
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-855 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {manualOptions.map((opt, oIdx) => {
                    const labels = ['A', 'B', 'C', 'D'];
                    return (
                      <div key={oIdx} className="space-y-1">
                        <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase block">Đáp án {labels[oIdx]} <span className="text-rose-500">*</span></label>
                        <input
                          type="text"
                          required
                          value={opt}
                          onChange={(e) => {
                            const updated = [...manualOptions];
                            updated[oIdx] = e.target.value;
                            setManualOptions(updated);
                          }}
                          placeholder={`Nhập câu trả lời cho phương án ${labels[oIdx]}`}
                          className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-855 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                        />
                      </div>
                    );
                  })}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase block">Đáp án đúng <span className="text-rose-500">*</span></label>
                    <select
                      value={manualCorrectIndex}
                      onChange={(e) => setManualCorrectIndex(Number(e.target.value))}
                      className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-855 dark:text-slate-200 focus:outline-none"
                    >
                      <option value={0}>Đáp án A</option>
                      <option value={1}>Đáp án B</option>
                      <option value={2}>Đáp án C</option>
                      <option value={3}>Đáp án D</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase block">Giải thích đáp án</label>
                    <input
                      type="text"
                      value={manualExplanation}
                      onChange={(e) => setManualExplanation(e.target.value)}
                      placeholder="Ví dụ: Theo định luật, lực đẩy Ác-si-mét có hướng thẳng đứng từ dưới lên."
                      className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-855 dark:text-slate-200 focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all shadow-md shadow-blue-500/10 cursor-pointer flex items-center justify-center gap-1"
                >
                  <Plus size={13} /> Thêm câu hỏi này vào bộ đề
                </button>
              </form>
            )}

            {/* TAB 2: AI QUESTION GENERATOR */}
            {editorTab === 'ai' && (
              <div className="p-4 bg-indigo-50/50 dark:bg-indigo-950/15 rounded-xl border border-indigo-100/50 dark:border-indigo-900/30 space-y-4 animate-fade-in">
                <div className="flex justify-between items-center pb-2 border-b border-indigo-100/40 dark:border-indigo-900/20">
                  <span className="text-xs font-extrabold text-indigo-700 dark:text-indigo-400 flex items-center gap-1">
                    🧠 Trình tạo đề thông minh bằng AI Gemini
                  </span>
                  <span className="text-[9px] font-black uppercase tracking-wider bg-indigo-100 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-full">
                    Tự động
                  </span>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-550 dark:text-slate-400 uppercase">Chủ đề cần tạo câu hỏi</label>
                  <input
                    type="text"
                    value={aiTopic}
                    onChange={(e) => setAiTopic(e.target.value)}
                    placeholder="Ví dụ: Lực đẩy Ác-si-mét, Sự nổi, Bình thông nhau..."
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:outline-none text-slate-850 dark:text-slate-200 placeholder:text-slate-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-550 dark:text-slate-400 uppercase">Số lượng câu</label>
                    <select
                      value={aiCount}
                      onChange={(e) => setAiCount(Number(e.target.value))}
                      className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:outline-none text-slate-850 dark:text-slate-200"
                    >
                      <option value={3}>3 câu</option>
                      <option value={5}>5 câu</option>
                      <option value={8}>8 câu</option>
                      <option value={10}>10 câu</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-550 dark:text-slate-400 uppercase">Mức độ lý thuyết</label>
                    <div className="w-full px-3 py-1.5 bg-slate-100 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 text-center">
                      Mức độ: {difficulty}
                    </div>
                  </div>
                </div>

                <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-[9px] text-amber-600 dark:text-amber-300 leading-normal flex gap-1.5 items-start">
                  <Info size={14} className="text-amber-500 shrink-0 mt-0.5" />
                  <p>AI tạo câu hỏi để giáo viên kiểm duyệt. Vui lòng rà soát lại phương án nhiễu và lời giải chi tiết trước khi công bố đề thi.</p>
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    disabled={isGeneratingAI}
                    onClick={() => handleCallAI('replace')}
                    className="flex-1 py-2 bg-slate-800 hover:bg-slate-900 text-white disabled:opacity-40 text-[10px] font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1"
                  >
                    {isGeneratingAI ? <Loader2 size={12} className="animate-spin" /> : 'Ghi đè đề cũ'}
                  </button>
                  <button
                    type="button"
                    disabled={isGeneratingAI}
                    onClick={() => handleCallAI('append')}
                    className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-40 text-[10px] font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 shadow-sm"
                  >
                    {isGeneratingAI ? <Loader2 size={12} className="animate-spin" /> : 'Chèn thêm câu mới'}
                  </button>
                </div>

                {/* Feedback messages */}
                {aiError && (
                  <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-[10px] rounded-lg">
                    {aiError}
                  </div>
                )}
                {aiSuccess && (
                  <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] rounded-lg">
                    {aiSuccess}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: SAMPLE QUESTIONS BANK */}
            {editorTab === 'bank' && (
              <div className="p-4 bg-teal-50/50 dark:bg-teal-950/15 rounded-xl border border-teal-100/50 dark:border-teal-900/30 space-y-3 animate-fade-in">
                <div className="flex justify-between items-center pb-2 border-b border-teal-100/40 dark:border-teal-900/20">
                  <span className="text-xs font-extrabold text-teal-700 dark:text-teal-400 flex items-center gap-1">
                    📚 Ngân hàng đề mẫu chuẩn cấu trúc SGK Vật lí 8
                  </span>
                  <button
                    type="button"
                    onClick={handleAddStandardSamples}
                    className="text-[10px] font-black text-teal-600 hover:underline cursor-pointer"
                  >
                    Chèn nhanh 5 câu →
                  </button>
                </div>

                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                  {SAMPLE_QUESTIONS.map((q, idx) => {
                    const alreadyAdded = questions.some(ex => ex.questionText === q.questionText);
                    return (
                      <div key={q.id} className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-lg flex items-start justify-between gap-2">
                        <div className="space-y-1 min-w-0">
                          <p className="text-[10px] font-bold text-slate-850 dark:text-slate-200 leading-normal">{idx + 1}. {q.questionText}</p>
                          <div className="flex gap-2 text-[9px] text-slate-400">
                            <span>4 phương án</span>
                            <span>•</span>
                            <span className="text-emerald-600 font-semibold">Đáp án {['A', 'B', 'C', 'D'][q.correctAnswerIndex]}</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          disabled={alreadyAdded}
                          onClick={() => {
                            setQuestions((prev) => {
                              const updated = [...prev, { ...q, id: `imported-q-${Date.now()}-${idx}` }];
                              const balancedPoints = Math.round((10 / updated.length) * 10) / 10;
                              return updated.map(item => ({ ...item, points: balancedPoints }));
                            });
                          }}
                          className={`p-1 text-[10px] rounded cursor-pointer transition-all px-2 shrink-0 ${
                            alreadyAdded 
                              ? 'text-green-500 bg-green-50 dark:bg-green-950/30 font-bold' 
                              : 'text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-950/30 border border-teal-200 font-bold'
                          }`}
                        >
                          {alreadyAdded ? 'Đã thêm' : '+ Thêm'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* List Header */}
            <div className="flex justify-between items-center border-t border-slate-100 dark:border-slate-800 pt-4 pb-1">
              <h4 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1">
                📋 Cấu trúc đề thi hiện tại ({questions.length} câu)
              </h4>
              
              {questions.length > 0 && (
                <button
                  type="button"
                  onClick={handleAutoBalancePoints}
                  className="px-2.5 py-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-[10px] font-bold hover:bg-slate-150 transition-all cursor-pointer"
                >
                  ⚖️ Chia đều 10 điểm
                </button>
              )}
            </div>

            {/* Questions list table view */}
            {questions.length === 0 ? (
              <div className="p-8 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-center space-y-3">
                <HelpCircle className="mx-auto text-slate-300 dark:text-slate-700" size={32} />
                <p className="text-xs text-slate-400 max-w-xs mx-auto">
                  Chưa có câu hỏi nào trong đề thi này. Hãy chọn một phương thức soạn đề ở trên (Tự tạo hoặc AI) để thiết lập!
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setEditorTab('bank');
                  }}
                  className="text-xs font-bold text-teal-600 hover:underline cursor-pointer"
                >
                  Mở ngân hàng đề mẫu xem thử →
                </button>
              </div>
            ) : (
              <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1">
                {questions.map((q, idx) => {
                  const labels = ['A', 'B', 'C', 'D'];
                  return (
                    <div key={q.id} className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-150 dark:border-slate-850 space-y-3 relative group animate-fade-in">
                      
                      {/* Controls header */}
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded-full">
                          Câu hỏi {idx + 1}
                        </span>
                        
                        <div className="flex items-center gap-1.5 opacity-90 sm:opacity-40 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => handleMoveQuestion(idx, 'up')}
                            className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 cursor-pointer"
                            title="Di chuyển lên"
                          >
                            ▲
                          </button>
                          <button
                            type="button"
                            disabled={idx === questions.length - 1}
                            onClick={() => handleMoveQuestion(idx, 'down')}
                            className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 cursor-pointer"
                            title="Di chuyển xuống"
                          >
                            ▼
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteQuestion(q.id)}
                            className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-md cursor-pointer"
                            title="Xóa câu hỏi"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>

                      {/* Text */}
                      <p className="text-xs font-bold text-slate-850 dark:text-slate-200 leading-relaxed">
                        {q.questionText}
                      </p>

                      {/* Options preview */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                        {q.options.map((opt, oIdx) => {
                          const isCorrect = q.correctAnswerIndex === oIdx;
                          return (
                            <div 
                              key={oIdx} 
                              className={`p-2 rounded-lg border flex items-center gap-1.5 ${
                                isCorrect 
                                  ? 'bg-green-50/50 dark:bg-green-950/20 border-green-200 text-green-800 dark:text-green-300 font-semibold' 
                                  : 'bg-white dark:bg-slate-900 border-slate-250 dark:border-slate-800 text-slate-500 dark:text-slate-400'
                              }`}
                            >
                              <span className={`w-4 h-4 shrink-0 flex items-center justify-center rounded text-[9px] font-bold ${
                                isCorrect ? 'bg-green-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                              }`}>
                                {labels[oIdx]}
                              </span>
                              <span className="truncate">{opt}</span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Explanation */}
                      {q.explanation && (
                        <div className="text-[10px] text-slate-400 dark:text-slate-500 pl-2 border-l border-slate-200 dark:border-slate-800">
                          💡 <b>Giải thích:</b> {q.explanation}
                        </div>
                      )}

                      {/* Point indicator */}
                      <div className="absolute bottom-2.5 right-3">
                        <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 dark:bg-slate-900 px-1.5 py-0.5 rounded">
                          {q.points || 2}đ
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* Right column: Access config & AI generation tools */}
        <div className="space-y-6">
          
          {/* Section 3: Access settings (Mã bài & mật mã) */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-50 dark:border-slate-850">
              <Shield size={14} className="text-blue-500" /> Cài đặt truy cập bài làm
            </h3>

            {/* Code identifier */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Mã làm bài trực tuyến</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={code}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-center font-mono font-black text-slate-800 dark:text-slate-100 text-base"
                />
                <button
                  type="button"
                  onClick={handleRegenerateCode}
                  className="p-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-600 dark:text-slate-300 rounded-xl transition-all cursor-pointer"
                  title="Tự động đổi mã mới"
                >
                  <RefreshCw size={15} />
                </button>
              </div>
              <span className="text-[10px] text-slate-400 block leading-normal">Học sinh sẽ dùng mã 6 ký tự này để đăng nhập trực tiếp.</span>
            </div>

            {/* Password verification settings */}
            <div className="space-y-4 pt-2 border-t border-slate-50 dark:border-slate-850">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                    {isPasswordProtected ? <Lock size={12} className="text-amber-500" /> : <Unlock size={12} className="text-slate-400" />} 
                    <span>Đặt mật khẩu bài</span>
                  </span>
                  <span className="text-[10px] text-slate-400 block">Yêu cầu xác minh khóa bí mật.</span>
                </div>
                
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPasswordProtected}
                    onChange={(e) => setIsPasswordProtected(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-200 dark:bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {isPasswordProtected && (
                <div className="space-y-1 animate-fade-in">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Mật khẩu truy cập</label>
                  <input
                    type="text"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={homeworkToEdit?.passwordHash ? 'Để trống nếu không đổi mật khẩu' : 'Mật khẩu cho học sinh'}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-bold focus:outline-none text-slate-850 dark:text-slate-200"
                  />
                  <span className="text-[9px] text-amber-600 font-medium block leading-normal">Lưu ý: Hệ thống chỉ lưu bản mã hóa/mức demo của mật khẩu. Bạn cần tự gửi mật khẩu cho học sinh.</span>
                </div>
              )}
            </div>

            {/* Other preferences */}
            <div className="pt-3 border-t border-slate-50 dark:border-slate-850 space-y-3 text-xs">
              
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-600 dark:text-slate-300">Cho xem đáp án sau nộp:</span>
                <input
                  type="checkbox"
                  checked={allowShowAnswers}
                  onChange={(e) => setAllowShowAnswers(e.target.checked)}
                  className="rounded text-blue-600"
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-600 dark:text-slate-300">Trạng thái phát hành:</span>
                <select
                  value={status}
                  onChange={(e: any) => setStatus(e.target.value)}
                  className="px-2 py-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded text-xs focus:outline-none"
                >
                  <option value="published">Đã phát hành</option>
                  <option value="draft">Bản nháp</option>
                  <option value="archived">Lưu trữ</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 5: Course chapters references */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-3">
            <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Bài học liên quan</h3>
            
            <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
              {lessons.map((lesson) => {
                const isSelected = selectedLessonIds.includes(lesson.id);
                return (
                  <label 
                    key={lesson.id} 
                    className={`flex items-center gap-2 p-2 rounded-lg text-xs cursor-pointer transition-colors ${
                      isSelected 
                        ? 'bg-blue-50/50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400' 
                        : 'hover:bg-slate-50 dark:hover:bg-slate-855 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleLesson(lesson.id)}
                      className="rounded text-blue-600 focus:ring-0"
                    />
                    <span className="truncate font-semibold">{lesson.title}</span>
                  </label>
                );
              })}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
