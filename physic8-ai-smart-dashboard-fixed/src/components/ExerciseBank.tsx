import React, { useState } from 'react';
import { Search, Filter, Lock, Unlock, Copy, Edit3, Trash2, ExternalLink, Plus, Eye, Award, CheckCircle, HelpCircle, FileSpreadsheet, RefreshCw, AlertTriangle } from 'lucide-react';
import { Homework, Lesson, HomeworkStatus } from '../types';
import { copyTextToClipboard } from '../clipboard';

interface ExerciseBankProps {
  homeworks: Homework[];
  lessons: Lesson[];
  onAddExercise: () => void;
  onEditExercise: (homework: Homework) => void;
  onDuplicateExercise: (homework: Homework) => void;
  onDeleteExercise: (homeworkId: string) => void;
  onViewResults: (homework: Homework) => void;
  onTogglePublish: (homeworkId: string) => void;
}

export default function ExerciseBank({
  homeworks,
  lessons,
  onAddExercise,
  onEditExercise,
  onDuplicateExercise,
  onDeleteExercise,
  onViewResults,
  onTogglePublish
}: ExerciseBankProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLessonFilter, setSelectedLessonFilter] = useState('all');
  const [selectedDifficultyFilter, setSelectedDifficultyFilter] = useState('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('all');
  const [selectedPasswordFilter, setSelectedPasswordFilter] = useState('all');

  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);
  const [copiedLinkId, setCopiedLinkId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Homework | null>(null);

  // Filter logic
  const filteredHomeworks = homeworks.filter((hw) => {
    const matchesSearch = hw.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          hw.code.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesLesson = selectedLessonFilter === 'all' || 
                          hw.lessonIds?.includes(selectedLessonFilter) ||
                          hw.lessonId === selectedLessonFilter;

    const matchesDifficulty = selectedDifficultyFilter === 'all' || hw.difficulty === selectedDifficultyFilter;
    
    const matchesStatus = selectedStatusFilter === 'all' || hw.status === selectedStatusFilter;
    
    const matchesPassword = selectedPasswordFilter === 'all' || 
                            (selectedPasswordFilter === 'yes' && hw.isPasswordProtected) ||
                            (selectedPasswordFilter === 'no' && !hw.isPasswordProtected);

    return matchesSearch && matchesLesson && matchesDifficulty && matchesStatus && matchesPassword;
  });

  const copyToClipboard = async (text: string, id: string, type: 'code' | 'link') => {
    await copyTextToClipboard(text);
    if (type === 'code') {
      setCopiedCodeId(id);
      setTimeout(() => setCopiedCodeId(null), 2000);
    } else {
      setCopiedLinkId(id);
      setTimeout(() => setCopiedLinkId(null), 2000);
    }
  };

  const getLessonTitle = (lessonIds?: string[], lessonId?: string) => {
    const idList = lessonIds || (lessonId ? [lessonId] : []);
    if (idList.length === 0) return 'Tổng hợp';
    if (idList.length === 1) {
      const match = lessons.find(l => l.id === idList[0]);
      return match ? match.title : 'Chủ đề Vật lí 8';
    }
    return `${idList.length} bài học Vật lí 8`;
  };

  return (
    <div id="exercise-bank-view" className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Award className="text-blue-600 dark:text-blue-400" /> Ngân hàng đề thi & Kho bài tập Vật lí 8
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Quản lý, soạn thảo, giám sát kết quả và chia sẻ đề thi trực tuyến cho toàn bộ học sinh THCS.
          </p>
        </div>
        
        <button
          id="btn-add-exercise"
          onClick={onAddExercise}
          className="px-4.5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-blue-500/10 flex items-center gap-2 cursor-pointer w-fit"
        >
          <Plus size={16} /> Tạo đề thi mới
        </button>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
        
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search bar */}
          <div className="flex-1 relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo tên bài tập, hoặc mã 6 ký tự (ví dụ: A7K2P9)..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 dark:text-slate-100"
            />
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          </div>

          {/* Filters grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 lg:w-auto">
            
            {/* Lesson select */}
            <div className="space-y-0.5">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Bài học</span>
              <select
                value={selectedLessonFilter}
                onChange={(e) => setSelectedLessonFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none"
              >
                <option value="all">Tất cả bài học</option>
                {lessons.map(l => (
                  <option key={l.id} value={l.id}>{l.title}</option>
                ))}
              </select>
            </div>

            {/* Difficulty select */}
            <div className="space-y-0.5">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Cấp độ</span>
              <select
                value={selectedDifficultyFilter}
                onChange={(e) => setSelectedDifficultyFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none"
              >
                <option value="all">Mọi độ khó</option>
                <option value="Dễ">Dễ</option>
                <option value="Trung bình">Trung bình</option>
                <option value="Khó">Khó</option>
              </select>
            </div>

            {/* Status select */}
            <div className="space-y-0.5">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Trạng thái</span>
              <select
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none"
              >
                <option value="all">Mọi trạng thái</option>
                <option value="published">Đã phát hành</option>
                <option value="draft">Bản nháp</option>
                <option value="archived">Lưu trữ</option>
              </select>
            </div>

            {/* Password filter */}
            <div className="space-y-0.5">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Mật mã</span>
              <select
                value={selectedPasswordFilter}
                onChange={(e) => setSelectedPasswordFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none"
              >
                <option value="all">Tất cả bài</option>
                <option value="yes">Yêu cầu mật khẩu</option>
                <option value="no">Không có mật khẩu</option>
              </select>
            </div>

          </div>
        </div>
      </div>

      {/* Main Homeworks lists */}
      {filteredHomeworks.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 p-16 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm text-center space-y-4">
          <div className="text-slate-300 dark:text-slate-700 flex justify-center">
            <HelpCircle size={64} className="stroke-1" />
          </div>
          <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200">Không có kết quả trùng khớp</h3>
          <p className="text-slate-400 dark:text-slate-500 text-sm max-w-sm mx-auto">
            Hệ thống không tìm thấy bài tập Vật lí 8 nào phù hợp với bộ lọc tìm kiếm hiện tại.
          </p>
          <div className="pt-2">
            <button
              onClick={onAddExercise}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-blue-500/10 cursor-pointer"
            >
              Tạo đề thi đầu tiên
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHomeworks.map((hw) => {
            const hasPassword = hw.isPasswordProtected;
            const fullLink = `${window.location.origin}/?code=${hw.code}`;
            const isCopiedCode = copiedCodeId === hw.id;
            const isCopiedLink = copiedLinkId === hw.id;

            return (
              <div 
                key={hw.id} 
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between group"
              >
                {/* Header card info */}
                <div className="p-5 space-y-4 flex-1">
                  
                  {/* Row tags */}
                  <div className="flex justify-between items-start gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase border ${
                      hw.status === 'published'
                        ? 'bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-300 border-green-200/50'
                        : hw.status === 'draft'
                          ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200/50'
                          : 'bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 border-rose-200/50'
                    }`}>
                      {hw.status === 'published' ? 'Đã phát hành' : hw.status === 'draft' ? 'Bản nháp' : 'Lưu trữ'}
                    </span>

                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                      hw.difficulty === 'Dễ' 
                        ? 'bg-teal-50 dark:bg-teal-950/30 text-teal-600'
                        : hw.difficulty === 'Trung bình'
                          ? 'bg-blue-50 dark:bg-blue-950/30 text-blue-600'
                          : 'bg-rose-50 dark:bg-rose-950/30 text-rose-600'
                    }`}>
                      Độ khó: {hw.difficulty || 'Mặc định'}
                    </span>
                  </div>

                  {/* Title & metadata info */}
                  <div className="space-y-1.5">
                    <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-150 leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {hw.title}
                    </h3>
                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                      {hw.description || 'Không có mô tả chi tiết cho bài thi này.'}
                    </p>
                  </div>

                  <div className="p-3 bg-slate-50/50 dark:bg-slate-950/40 rounded-xl space-y-2 text-[10px] text-slate-400 font-medium">
                    <div className="flex justify-between items-center">
                      <span>Bài học:</span>
                      <span className="text-slate-655 dark:text-slate-300 truncate max-w-[150px]" title={getLessonTitle(hw.lessonIds, hw.lessonId)}>
                        {getLessonTitle(hw.lessonIds, hw.lessonId)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Số câu hỏi / Tổng điểm:</span>
                      <span className="text-slate-700 dark:text-slate-300 font-bold">
                        {hw.questions?.length || 0} câu / {hw.totalPoints || 10}đ
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Thời gian / Xem giải thích:</span>
                      <span className="text-slate-700 dark:text-slate-300 font-bold">
                        {hw.timeLimitMinutes || 15} phút / {hw.allowShowAnswers ? 'Có' : 'Không'}
                      </span>
                    </div>
                  </div>

                  {/* Code section */}
                  <div className="flex items-center justify-between p-2.5 bg-blue-50/40 dark:bg-blue-950/20 rounded-xl border border-blue-100/50 dark:border-blue-900/35">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-extrabold text-blue-600/70 dark:text-blue-400/80 uppercase tracking-widest block">Mã:</span>
                      <span className="font-mono font-black text-xs text-blue-700 dark:text-blue-300 tracking-wider bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-blue-100 dark:border-blue-900/50">{hw.code}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {hasPassword ? (
                        <div className="flex items-center text-amber-600 gap-0.5" title="Yêu cầu mật khẩu để vào thi">
                          <Lock size={12} />
                          <span className="text-[9px] font-bold">Mật mã</span>
                        </div>
                      ) : (
                        <div className="flex items-center text-slate-400 gap-0.5" title="Không yêu cầu mật khẩu">
                          <Unlock size={12} />
                          <span className="text-[9px]">Mở</span>
                        </div>
                      )}
                    </div>
                  </div>

                </div>

                {/* Footer panel - action triggers */}
                <div className="bg-slate-50 dark:bg-slate-950/50 px-5 py-3.5 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center gap-2 flex-wrap">
                  
                  {/* Left row buttons */}
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => copyToClipboard(hw.code, hw.id, 'code')}
                      className="p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-[10px] font-bold transition-all hover:bg-slate-50 cursor-pointer"
                      title="Sao chép mã đề"
                    >
                      {isCopiedCode ? 'Đã chép!' : 'Chép Mã'}
                    </button>
                    <button
                      onClick={() => copyToClipboard(fullLink, hw.id, 'link')}
                      className="p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-[10px] font-bold transition-all hover:bg-slate-50 cursor-pointer flex items-center gap-0.5"
                      title="Sao chép liên kết làm bài trực tiếp"
                    >
                      {isCopiedLink ? 'Đã chép!' : <><ExternalLink size={10} /> Link</>}
                    </button>
                  </div>

                  {/* Right actions */}
                  <div className="flex items-center gap-1.5">
                    
                    {/* View results */}
                    <button
                      onClick={() => onViewResults(hw)}
                      className="p-1.5 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 rounded-lg text-[10px] font-bold hover:bg-indigo-100 transition-all flex items-center gap-0.5 cursor-pointer"
                      title="Xem kết quả, bảng điểm của học sinh đã nộp"
                    >
                      <FileSpreadsheet size={12} /> Kết quả
                    </button>

                    {/* Toggle publish */}
                    <button
                      onClick={() => onTogglePublish(hw.id)}
                      className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-400 rounded-lg text-[10px] font-bold transition-all cursor-pointer"
                      title="Bật/Tắt trạng thái xuất bản bài"
                    >
                      <RefreshCw size={11} />
                    </button>

                    {/* Duplicate exercise */}
                    <button
                      onClick={() => onDuplicateExercise(hw)}
                      className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-400 rounded-lg text-[10px] font-bold transition-all cursor-pointer"
                      title="Nhân bản đề thi này"
                    >
                      Nhân bản
                    </button>

                    {/* Edit exercise */}
                    <button
                      onClick={() => onEditExercise(hw)}
                      className="p-1.5 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-lg text-[10px] font-bold hover:bg-blue-100 transition-all cursor-pointer"
                      title="Sửa nội dung đề thi"
                    >
                      <Edit3 size={11} />
                    </button>

                    {/* Delete exercise */}
                    <button
                      onClick={() => setDeleteTarget(hw)}
                      className="p-1.5 bg-rose-50 dark:bg-rose-950/30 text-rose-600 hover:bg-rose-100 rounded-lg text-[10px] font-bold transition-all cursor-pointer"
                      title="Xóa đề"
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>

                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* State-based Confirmation Modal to avoid browser confirm blocking in iframe */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 max-w-md w-full shadow-2xl space-y-4 animate-scale-up">
            <div className="flex items-center gap-3 text-rose-500">
              <AlertTriangle size={24} className="shrink-0" />
              <h3 className="text-base font-extrabold text-slate-850 dark:text-slate-200">
                Xác nhận xóa đề thi
              </h3>
            </div>
            
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Bạn có chắc chắn muốn xóa bài tập <strong className="text-slate-800 dark:text-white">"{deleteTarget.title}"</strong> không? 
              <br /><span className="text-rose-500 font-medium">Lưu ý: Toàn bộ dữ liệu bảng điểm học sinh liên quan cũng sẽ bị xóa vĩnh viễn và không thể khôi phục.</span>
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-600 dark:text-slate-300 font-bold rounded-xl text-xs transition-all cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteExercise(deleteTarget.id);
                  setDeleteTarget(null);
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
