import React, { useState, useEffect } from 'react';
import { Key, Lock, User, School, ArrowRight, AlertTriangle, PlayCircle, ClipboardCheck, Eye, EyeOff } from 'lucide-react';
import { Homework, AppUser } from '../types';
import { verifyPassword } from '../security';

interface JoinExerciseProps {
  homeworks: Homework[];
  initialCode?: string;
  onStartExercise: (homework: Homework, studentName: string, studentClass: string) => void;
  onNavigateToBank: () => void;
  currentUser?: AppUser | null;
}

export default function JoinExercise({ homeworks, initialCode, onStartExercise, onNavigateToBank, currentUser }: JoinExerciseProps) {
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const [showPasswordText, setShowPasswordText] = useState(false);
  
  // Student info
  const [studentName, setStudentName] = useState(currentUser?.role === 'student' ? currentUser.name : '');
  const [studentClass, setStudentClass] = useState(currentUser?.role === 'student' ? currentUser.studentClass || '' : '');

  useEffect(() => {
    if (currentUser?.role === 'student') {
      setStudentName(currentUser.name);
      setStudentClass(currentUser.studentClass || '');
    }
  }, [currentUser]);
  
  const [matchedHomework, setMatchedHomework] = useState<Homework | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const prepareHomeworkFromCode = (rawCode: string) => {
    const formattedCode = rawCode.trim().toUpperCase();
    if (!formattedCode) {
      setErrorMsg('Vui lòng nhập mã bài tập.');
      return false;
    }

    const homework = homeworks.find(h => h.code === formattedCode);
    if (!homework) {
      setMatchedHomework(null);
      setShowPasswordInput(false);
      setErrorMsg('Không tìm thấy bài tập với mã này. Vui lòng kiểm tra lại!');
      return false;
    }

    if (homework.status === 'draft') {
      setMatchedHomework(null);
      setShowPasswordInput(false);
      setErrorMsg('Bài tập này hiện đang ở trạng thái Nháp và chưa được giáo viên xuất bản.');
      return false;
    }

    if (homework.status === 'archived') {
      setMatchedHomework(null);
      setShowPasswordInput(false);
      setErrorMsg('Bài tập này đã bị lưu trữ (khóa) và không còn tiếp nhận bài làm.');
      return false;
    }

    setMatchedHomework(homework);
    setShowPasswordInput(!!homework.isPasswordProtected);
    setSuccessMsg(homework.isPasswordProtected
      ? 'Mã bài tập hợp lệ! Vui lòng nhập mật khẩu để truy cập.'
      : 'Tìm thấy bài tập! Vui lòng điền thông tin của bạn để bắt đầu làm bài.'
    );
    return true;
  };

  useEffect(() => {
    if (!initialCode) return;
    const formatted = initialCode.trim().toUpperCase();
    if (!formatted) return;
    setCode(formatted);
    setErrorMsg(null);
    setSuccessMsg(null);
    prepareHomeworkFromCode(formatted);
  }, [initialCode, homeworks]);

  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    
    prepareHomeworkFromCode(code);
  };

  const handleVerifyPasswordAndJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    
    if (!matchedHomework) return;

    if (matchedHomework.isPasswordProtected) {
      if (!password) {
        setErrorMsg('Vui lòng nhập mật khẩu truy cập.');
        return;
      }

      const isValidPassword = await verifyPassword(password, matchedHomework.passwordHash);
      if (!isValidPassword) {
        setErrorMsg('Mật khẩu truy cập không chính xác. Vui lòng liên hệ giáo viên!');
        return;
      }
    }

    // Next step: student details validation
    if (!studentName.trim()) {
      setErrorMsg('Vui lòng nhập Họ và tên của bạn.');
      return;
    }

    if (!studentClass.trim()) {
      setErrorMsg('Vui lòng nhập Lớp học của bạn (ví dụ: 8A1).');
      return;
    }

    // All clear! Start exercise
    onStartExercise(matchedHomework, studentName.trim(), studentClass.trim());
  };

  const handleReset = () => {
    setMatchedHomework(null);
    setShowPasswordInput(false);
    setPassword('');
    setStudentName(currentUser?.role === 'student' ? currentUser.name : '');
    setStudentClass(currentUser?.role === 'student' ? currentUser.studentClass || '' : '');
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  return (
    <div id="join-exercise-view" className="max-w-md mx-auto space-y-8 py-4 md:py-8 animate-fade-in">
      <div className="text-center space-y-3">
        <div className="inline-flex p-3 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-2xl shadow-sm border border-blue-100 dark:border-blue-900/40">
          <Key size={32} className="stroke-2" />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">Khu vực làm bài học sinh</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
          Nhập mã bài tập được giáo viên cung cấp để tham gia làm bài khảo thí Vật lí 8.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden transition-all duration-200">
        
        {/* State 1: Enter & Verify Code */}
        {!matchedHomework ? (
          <form onSubmit={handleVerifyCode} className="p-6 md:p-8 space-y-5">
            <div className="space-y-2">
              <label htmlFor="join-code" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Mã bài tập (6 ký tự)</label>
              <div className="relative">
                <input
                  id="join-code"
                  type="text"
                  maxLength={10}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Ví dụ: A7K2P9"
                  className="w-full pl-4 pr-12 py-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-center font-mono font-black text-xl text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-300 dark:placeholder:text-slate-700"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <span className="text-[10px] font-bold bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded uppercase font-sans">Mã</span>
                </div>
              </div>
            </div>

            <button
              id="btn-verify-code"
              type="submit"
              className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white text-sm font-bold rounded-2xl transition-all shadow-md shadow-blue-500/10 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Tiếp tục</span>
              <ArrowRight size={16} />
            </button>
          </form>
        ) : (
          /* State 2: Enter Student Info & Password */
          <form onSubmit={handleVerifyPasswordAndJoin} className="p-6 md:p-8 space-y-5">
            <div className="p-4 bg-indigo-50/50 dark:bg-indigo-950/20 rounded-2xl border border-indigo-100 dark:border-indigo-900/40 space-y-1">
              <span className="text-[10px] font-extrabold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block">Bài tập được chọn:</span>
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">{matchedHomework.title}</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{matchedHomework.description || 'Không có mô tả thêm.'}</p>
              <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium pt-1">
                <span>Số câu: {matchedHomework.questions.length}</span>
                <span>•</span>
                <span>Điểm: {matchedHomework.totalPoints || 10}đ</span>
              </div>
            </div>

            {/* Password verification block */}
            {showPasswordInput && (
              <div className="space-y-2 animate-fade-in">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Lock size={12} className="text-rose-500" /> Mật khẩu làm bài <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPasswordText ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Nhập mật khẩu do giáo viên cấp"
                    className="w-full pl-4 pr-12 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 dark:text-slate-100"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswordText(!showPasswordText)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showPasswordText ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            )}

            {/* Student Name */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <User size={12} className="text-blue-500" /> Họ và tên học sinh <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="Ví dụ: Nguyễn Văn A"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 dark:text-slate-100"
              />
            </div>

            {/* Student Class */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <School size={12} className="text-blue-500" /> Lớp học <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={studentClass}
                onChange={(e) => setStudentClass(e.target.value)}
                placeholder="Ví dụ: 8A1, 8B"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 dark:text-slate-100"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleReset}
                className="flex-1 py-3 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-500 dark:text-slate-400 text-xs font-bold rounded-xl transition-all cursor-pointer text-center"
              >
                Nhập mã khác
              </button>
              <button
                id="btn-join-confirm"
                type="submit"
                className="flex-2 py-3 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-blue-500/10 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <PlayCircle size={14} />
                <span>Bắt đầu làm bài</span>
              </button>
            </div>
          </form>
        )}

        {/* Feedback info panels */}
        {errorMsg && (
          <div className="p-4 bg-rose-50 dark:bg-rose-950/30 border-t border-rose-100 dark:border-rose-900/40 text-rose-800 dark:text-rose-300 text-xs flex gap-2 animate-fade-in">
            <AlertTriangle size={16} className="shrink-0 text-rose-500" />
            <p className="font-semibold">{errorMsg}</p>
          </div>
        )}

        {successMsg && !errorMsg && (
          <div className="p-4 bg-teal-50 dark:bg-teal-950/30 border-t border-teal-100 dark:border-teal-900/40 text-teal-800 dark:text-teal-300 text-xs flex gap-2 animate-fade-in">
            <ClipboardCheck size={16} className="shrink-0 text-teal-500" />
            <p className="font-semibold">{successMsg}</p>
          </div>
        )}
      </div>

      {/* Helpful reminder card for testing */}
      <div className="p-5 bg-slate-100/55 dark:bg-slate-900/40 rounded-2xl border border-slate-200/50 dark:border-slate-800/80 space-y-2.5">
        <h5 className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">💡 Hướng dẫn nhanh cho học sinh:</h5>
        <ol className="text-xs text-slate-500 dark:text-slate-400 list-decimal pl-4 space-y-1 leading-relaxed">
          <li>Nhận mã bài tập (6 kí tự) từ giáo viên của bạn.</li>
          <li>Nhập mã và bấm <b>Tiếp tục</b> để hệ thống nhận dạng đề.</li>
          <li>Điền đầy đủ Họ và tên, Lớp học và Mật khẩu (nếu giáo viên yêu cầu).</li>
          <li>Bấm <b>Bắt đầu làm bài</b> để làm khảo thí có tính giờ.</li>
        </ol>
        <div className="pt-2.5 border-t border-slate-200/60 dark:border-slate-800 flex justify-center">
          <button
            onClick={onNavigateToBank}
            className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
          >
            Quay lại Kho bài tập giáo viên →
          </button>
        </div>
      </div>
    </div>
  );
}
