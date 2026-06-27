import React, { useState } from 'react';
import { User, Sparkles, ArrowRight, AlertCircle, Lock } from 'lucide-react';
import { AppUser } from '../types';
import AppLogo from './AppLogo';

interface LoginProps {
  onLogin: (user: AppUser) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!fullName.trim()) {
      setError('Vui lòng điền họ và tên của bạn.');
      return;
    }

    if (!password) {
      setError('Vui lòng nhập mật khẩu đăng nhập.');
      return;
    }

    if (password.length < 4) {
      setError('Mật khẩu của bạn phải có ít nhất 4 ký tự.');
      return;
    }

    onLogin({
      name: fullName.trim(),
      role: 'student', // Default role for type compatibility
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 sm:p-6 transition-colors duration-200" id="login-container">
      {/* Background elegant circles */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-100/30 dark:bg-blue-950/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-teal-100/30 dark:bg-teal-950/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10" id="login-card-wrapper">
        {/* Header Logo */}
        <div className="text-center mb-6" id="login-header">
          <div className="inline-flex items-center justify-center mb-3 drop-shadow-xl hover:scale-105 transition-transform duration-300" id="login-logo-container">
            <AppLogo size={74} />
          </div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
            Cánh Buồm <span className="text-blue-600 dark:text-blue-400">Tri Thức</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
            Học tập & Khảo thí Vật lí 8 Thông minh, kết hợp mô hình Trí tuệ Nhân tạo Gemini
          </p>
        </div>

        {/* Card Container */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800/80 p-6 sm:p-8 shadow-2xl shadow-slate-100/50 dark:shadow-none space-y-6" id="login-card">
          
          <div className="space-y-1">
            <h2 className="text-base font-extrabold text-slate-800 dark:text-slate-200">Đăng nhập hệ thống</h2>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">Nhập thông tin cá nhân của bạn để bắt đầu học tập và làm bài.</p>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-4" id="login-form">
            {error && (
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/30 text-xs leading-relaxed animate-fade-in" id="login-error">
                <AlertCircle size={14} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Field: Full name */}
            <div className="space-y-1" id="fullname-field-container">
              <label htmlFor="fullname" className="text-[11px] font-bold text-slate-500 dark:text-slate-400 tracking-wider uppercase block">
                Họ và tên
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
                  <User size={14} />
                </span>
                <input
                  id="fullname"
                  type="text"
                  required
                  placeholder="Nhập họ và tên đầy đủ của bạn..."
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-9 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-xs placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-semibold"
                />
              </div>
            </div>

            {/* Field: Password */}
            <div className="space-y-1" id="password-field-container">
              <label htmlFor="password" className="text-[11px] font-bold text-slate-500 dark:text-slate-400 tracking-wider uppercase block">
                Mật khẩu đăng nhập
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
                  <Lock size={14} />
                </span>
                <input
                  id="password"
                  type="password"
                  required
                  placeholder="Nhập mật khẩu (tối thiểu 4 ký tự)..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-xs placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-semibold"
                />
              </div>
            </div>

            {/* Submit button */}
            <button
              id="login-submit-btn"
              type="submit"
              className="w-full py-3.5 mt-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/15 transition-all flex items-center justify-center gap-2 cursor-pointer group active:scale-[0.98]"
            >
              Bắt đầu hành trình tri thức
              <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
          </form>

          {/* Quick Info text / disclaimer */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-center flex items-center justify-center gap-1.5 text-[10px] text-slate-400 dark:text-slate-500">
            <Sparkles size={11} className="text-amber-500 shrink-0" />
            <span>Lưu thông tin đăng nhập tự động cho lần sau</span>
          </div>

        </div>

        {/* Outer bottom credits */}
        <p className="text-center text-[10px] text-slate-400 dark:text-slate-600 mt-6 font-medium">
          Trực quan hóa Vật lí lớp 8 - Sách giáo khoa Cánh Diều / Kết nối Tri thức
        </p>
      </div>
    </div>
  );
}
