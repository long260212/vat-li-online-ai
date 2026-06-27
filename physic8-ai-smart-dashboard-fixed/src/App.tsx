import React, { useState, useEffect, useRef } from 'react';
import { BookOpen, Layers, Clock, Cpu, Award, User, Flame, GraduationCap, Menu, X, Sparkles, Sun, Moon, Key, ClipboardList, MessageSquare, AlertTriangle, LogOut, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';
import { Lesson, Quiz, HistoryRecord, Question, Homework, HomeworkResult, HomeworkStatus, AppUser } from './types';
import { PHYSICS_LESSONS, SAMPLE_QUESTIONS } from './data';
import { getUserStorageSuffix } from './storage';

// Sub-components
import Dashboard from './components/Dashboard';
import LessonLibrary from './components/LessonLibrary';
import LessonView from './components/LessonView';
import QuizCreator from './components/QuizCreator';
import ActiveQuiz from './components/ActiveQuiz';
import HistoryList from './components/HistoryList';
import ExerciseBank from './components/ExerciseBank';
import CreateExercise from './components/CreateExercise';
import JoinExercise from './components/JoinExercise';
import DoExercise from './components/DoExercise';
import ExerciseResults from './components/ExerciseResults';
import AIChat from './components/AIChat';
import Login from './components/Login';
import AppLogo from './components/AppLogo';

const DEFAULT_HOMEWORKS: Homework[] = [
  {
    id: 'homework-default-1',
    title: 'Chuyên đề Cơ học Vật lí 8 - Bài tập tổng hợp',
    description: 'Bộ đề ôn tập chương Cơ học, gồm các dạng câu hỏi về chuyển động cơ học, tính vận tốc và lực Ác-si-mét.',
    lessonIds: ['bai-1', 'bai-2', 'bai-3'],
    lessonId: 'bai-1',
    difficulty: 'Trung bình',
    questions: SAMPLE_QUESTIONS.map((q, idx) => ({
      ...q,
      id: `hw1-q-${idx}`,
      points: 2
    })),
    totalPoints: 10,
    code: 'PHYS88',
    status: 'published',
    isPasswordProtected: false,
    timeLimitMinutes: 15,
    allowShowAnswers: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'homework-default-2',
    title: 'Khảo sát Nhiệt học nâng cao - Chương II',
    description: 'Bài tập ôn luyện nâng cao về phương trình cân bằng nhiệt, công thức tính nhiệt lượng và sự bảo toàn nhiệt năng.',
    lessonIds: ['bai-18'],
    lessonId: 'bai-18',
    difficulty: 'Khó',
    questions: [
      {
        id: 'hw2-q-1',
        questionText: 'Thả một quả cầu nhôm có khối lượng 0.5kg ở 100°C vào một cốc nước ở 20°C. Sau một thời gian, nhiệt độ cân bằng là 25°C. Nhiệt lượng quả cầu nhôm tỏa ra là bao nhiêu? Biết c_nhôm = 880 J/kg.K.',
        options: [
          '33,000 J',
          '35,000 J',
          '44,000 J',
          '22,000 J'
        ],
        correctAnswerIndex: 0,
        explanation: 'Nhiệt lượng tỏa ra được tính theo công thức Q_tỏa = m * c * (t1 - t_cb) = 0.5 * 880 * (100 - 25) = 440 * 75 = 33,000 J.',
        points: 3.3
      },
      {
        id: 'hw2-q-2',
        questionText: 'Nguyên lý nào sau đây thể hiện đúng sự truyền nhiệt giữa hai vật tiếp xúc?',
        options: [
          'Nhiệt tự truyền từ vật có khối lượng lớn hơn sang vật có khối lượng nhỏ hơn.',
          'Nhiệt tự truyền từ vật có nhiệt dung riêng lớn hơn sang vật có nhiệt dung riêng nhỏ hơn.',
          'Nhiệt tự truyền từ vật có nhiệt độ cao hơn sang vật có nhiệt độ thấp hơn.',
          'Nhiệt tự truyền từ vật ở độ cao lớn hơn xuống thấp hơn.'
        ],
        correctAnswerIndex: 2,
        explanation: 'Nguyên lý truyền nhiệt thứ nhất phát biểu: Nhiệt lượng tự truyền từ vật có nhiệt độ cao hơn sang vật có nhiệt độ thấp hơn.',
        points: 3.3
      },
      {
        id: 'hw2-q-3',
        questionText: 'Để tính nhiệt dung riêng của một chất bằng nhiệt lượng kế, người ta dựa vào phương trình nào sau đây?',
        options: [
          'A = F * s',
          'Q_tỏa = Q_thu',
          'p = d * h',
          'F_A = d * V'
        ],
        correctAnswerIndex: 1,
        explanation: 'Đo nhiệt dung riêng dựa trên hiện tượng trao đổi nhiệt và áp dụng phương trình cân bằng nhiệt Q_tỏa = Q_thu.',
        points: 3.4
      }
    ],
    totalPoints: 10,
    code: 'CALO99',
    status: 'published',
    isPasswordProtected: true,
    passwordHash: '8888',
    timeLimitMinutes: 20,
    allowShowAnswers: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const DEFAULT_RESULTS: HomeworkResult[] = [
  {
    id: 'res-default-1',
    homeworkId: 'homework-default-1',
    homeworkCode: 'PHYS88',
    homeworkTitle: 'Chuyên đề Cơ học Vật lí 8 - Bài tập tổng hợp',
    studentName: 'Trần Minh Đức',
    studentClass: '8A1',
    score: 8.0,
    correctCount: 4,
    totalQuestions: 5,
    submittedAt: new Date().toLocaleDateString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit' }) + ' 09:15',
    answers: { 'hw1-q-0': 1, 'hw1-q-1': 2, 'hw1-q-2': 1, 'hw1-q-3': 2, 'hw1-q-4': 0 }
  },
  {
    id: 'res-default-2',
    homeworkId: 'homework-default-1',
    homeworkCode: 'PHYS88',
    homeworkTitle: 'Chuyên đề Cơ học Vật lí 8 - Bài tập tổng hợp',
    studentName: 'Lê Mỹ Linh',
    studentClass: '8A2',
    score: 10.0,
    correctCount: 5,
    totalQuestions: 5,
    submittedAt: new Date().toLocaleDateString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit' }) + ' 10:30',
    answers: { 'hw1-q-0': 1, 'hw1-q-1': 2, 'hw1-q-2': 1, 'hw1-q-3': 2, 'hw1-q-4': 2 }
  },
  {
    id: 'res-default-3',
    homeworkId: 'homework-default-2',
    homeworkCode: 'CALO99',
    homeworkTitle: 'Khảo sát Nhiệt học nâng cao - Chương II',
    studentName: 'Nguyễn Hoàng Nam',
    studentClass: '8A1',
    score: 6.7,
    correctCount: 2,
    totalQuestions: 3,
    submittedAt: new Date().toLocaleDateString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit' }) + ' 11:00',
    answers: { 'hw2-q-1': 0, 'hw2-q-2': 2, 'hw2-q-3': 0 }
  }
];


export default function App() {
  const [currentUser, setCurrentUser] = useState<AppUser | null>(() => {
    try {
      const saved = localStorage.getItem('physilearn_user_v1');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Sync user details to local storage
  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem('physilearn_user_v1', JSON.stringify(currentUser));
      } else {
        localStorage.removeItem('physilearn_user_v1');
      }
    } catch (err) {
      console.error("Error writing user to localStorage:", err);
    }
  }, [currentUser]);

  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [preselectedLessonId, setPreselectedLessonId] = useState<string | undefined>(undefined);
  const [chatLessonId, setChatLessonId] = useState<string | undefined>(undefined);
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showClearHistoryConfirm, setShowClearHistoryConfirm] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Dark Mode state initialized from localStorage
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem('physilearn_theme');
      if (saved === 'dark' || saved === 'light') return saved;
      const systemPreference = window.matchMedia('(prefers-color-scheme: dark)').matches;
      return systemPreference ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  });

  // Sync theme with HTML document element tag
  useEffect(() => {
    try {
      const root = window.document.documentElement;
      if (theme === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
      localStorage.setItem('physilearn_theme', theme);
    } catch (err) {
      console.error("Error setting theme class:", err);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // Load history from localStorage, scoped by current user
  const [history, setHistory] = useState<HistoryRecord[]>(() => {
    try {
      const savedUser = localStorage.getItem('physilearn_user_v1');
      const user = savedUser ? JSON.parse(savedUser) : null;
      const suffix = getUserStorageSuffix(user);
      const saved = localStorage.getItem(`physilearn_history_v1${suffix}`);
      return saved ? JSON.parse(saved) : [];
    } catch (err) {
      console.error("Error reading history from localStorage:", err);
      return [];
    }
  });

  // Load homeworks from localStorage, scoped by current user
  const [homeworks, setHomeworks] = useState<Homework[]>(() => {
    try {
      const savedUser = localStorage.getItem('physilearn_user_v1');
      const user = savedUser ? JSON.parse(savedUser) : null;
      const suffix = getUserStorageSuffix(user);
      const saved = localStorage.getItem(`physilearn_homeworks_v1${suffix}`);
      return saved ? JSON.parse(saved) : DEFAULT_HOMEWORKS;
    } catch (err) {
      console.error("Error reading homeworks from localStorage:", err);
      return DEFAULT_HOMEWORKS;
    }
  });

  // Load results from localStorage, scoped by current user
  const [results, setResults] = useState<HomeworkResult[]>(() => {
    try {
      const savedUser = localStorage.getItem('physilearn_user_v1');
      const user = savedUser ? JSON.parse(savedUser) : null;
      const suffix = getUserStorageSuffix(user);
      const saved = localStorage.getItem(`physilearn_results_v1${suffix}`);
      return saved ? JSON.parse(saved) : DEFAULT_RESULTS;
    } catch (err) {
      console.error("Error reading results from localStorage:", err);
      return DEFAULT_RESULTS;
    }
  });

  // Track the currently loaded user name to prevent race conditions during account switching
  const loadedUserRef = useRef<string | null>(null);

  // Initialize loadedUserRef with the initial currentUser state
  useEffect(() => {
    if (currentUser) {
      loadedUserRef.current = currentUser.name;
    } else {
      loadedUserRef.current = null;
    }
  }, []);

  // Listen for user account changes, dynamically hot-swapping user-specific data from localStorage
  useEffect(() => {
    const username = currentUser?.name || null;
    if (loadedUserRef.current === username) return;

    const suffix = getUserStorageSuffix(currentUser);

    // Load History
    try {
      const savedHistory = localStorage.getItem(`physilearn_history_v1${suffix}`);
      setHistory(savedHistory ? JSON.parse(savedHistory) : []);
    } catch (err) {
      console.error("Error reloading history:", err);
      setHistory([]);
    }

    // Load Homeworks
    try {
      const savedHomeworks = localStorage.getItem(`physilearn_homeworks_v1${suffix}`);
      setHomeworks(savedHomeworks ? JSON.parse(savedHomeworks) : DEFAULT_HOMEWORKS);
    } catch (err) {
      console.error("Error reloading homeworks:", err);
      setHomeworks(DEFAULT_HOMEWORKS);
    }

    // Load Results
    try {
      const savedResults = localStorage.getItem(`physilearn_results_v1${suffix}`);
      setResults(savedResults ? JSON.parse(savedResults) : DEFAULT_RESULTS);
    } catch (err) {
      console.error("Error reloading results:", err);
      setResults(DEFAULT_RESULTS);
    }

    // Reset temporary states to prevent cross-account leakage or tab persistence
    setCurrentTab('dashboard');
    setSelectedLesson(null);
    setPreselectedLessonId(undefined);
    setChatLessonId(undefined);
    setActiveQuiz(null);
    setHomeworkToEdit(null);
    setActiveHomeworkToDo(null);
    setActiveResultViewHomework(null);
    setStudentName('');
    setStudentClass('');
    setJoinCodeFromUrl(undefined);

    // Mark user data as fully synchronized
    loadedUserRef.current = username;
  }, [currentUser?.name]);

  // Save history to localStorage on modification (only if state belongs to currently logged-in user)
  useEffect(() => {
    if (!currentUser) return;
    if (loadedUserRef.current !== currentUser.name) return;
    try {
      const suffix = getUserStorageSuffix(currentUser);
      localStorage.setItem(`physilearn_history_v1${suffix}`, JSON.stringify(history));
    } catch (err) {
      console.error("Error writing history to localStorage:", err);
    }
  }, [history]);

  // Save homeworks to localStorage on modification (only if state belongs to currently logged-in user)
  useEffect(() => {
    if (!currentUser) return;
    if (loadedUserRef.current !== currentUser.name) return;
    try {
      const suffix = getUserStorageSuffix(currentUser);
      localStorage.setItem(`physilearn_homeworks_v1${suffix}`, JSON.stringify(homeworks));
    } catch (err) {
      console.error("Error writing homeworks to localStorage:", err);
    }
  }, [homeworks]);

  // Save results to localStorage on modification (only if state belongs to currently logged-in user)
  useEffect(() => {
    if (!currentUser) return;
    if (loadedUserRef.current !== currentUser.name) return;
    try {
      const suffix = getUserStorageSuffix(currentUser);
      localStorage.setItem(`physilearn_results_v1${suffix}`, JSON.stringify(results));
    } catch (err) {
      console.error("Error writing results to localStorage:", err);
    }
  }, [results]);

  // Intermediate states
  const [homeworkToEdit, setHomeworkToEdit] = useState<Homework | null>(null);
  const [activeHomeworkToDo, setActiveHomeworkToDo] = useState<Homework | null>(null);
  const [activeResultViewHomework, setActiveResultViewHomework] = useState<Homework | null>(null);
  const [studentName, setStudentName] = useState('');
  const [studentClass, setStudentClass] = useState('');
  const [joinCodeFromUrl, setJoinCodeFromUrl] = useState<string | undefined>(undefined);

  // Handle URL code deep link
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const codeParam = params.get('code');
      if (codeParam) {
        const cleanedCode = codeParam.trim().toUpperCase();
        const found = homeworks.find(h => h.code === cleanedCode);
        setJoinCodeFromUrl(cleanedCode);
        if (found) {
          setCurrentTab('join');
        }
      }
    } catch (err) {
      console.error("Error checking URL search parameters:", err);
    }
  }, [homeworks]);

  // Homework managers
  const handleDuplicateHomework = (hw: Homework) => {
    const existingCodes = homeworks.map(h => h.code);
    const codeChars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let newCode = '';
    do {
      newCode = '';
      for (let i = 0; i < 6; i++) {
        newCode += codeChars.charAt(Math.floor(Math.random() * codeChars.length));
      }
    } while (existingCodes.includes(newCode));

    const cloned: Homework = {
      ...hw,
      id: `homework-cloned-${Date.now()}`,
      title: `${hw.title} (Bản sao)`,
      code: newCode,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setHomeworks((prev) => [cloned, ...prev]);
  };

  const handleTogglePublish = (hwId: string) => {
    setHomeworks((prev) => 
      prev.map((hw) => {
        if (hw.id === hwId) {
          const newStatus: HomeworkStatus = hw.status === 'published' ? 'draft' : 'published';
          return {
            ...hw,
            status: newStatus,
            updatedAt: new Date().toISOString()
          };
        }
        return hw;
      })
    );
  };

  const handleSaveHomework = (hw: Homework) => {
    setHomeworks((prev) => {
      const exists = prev.some(item => item.id === hw.id);
      if (exists) {
        return prev.map(item => item.id === hw.id ? hw : item);
      } else {
        return [hw, ...prev];
      }
    });
  };

  const handleClearSingleResult = (resultId: string) => {
    setResults((prev) => prev.filter(r => r.id !== resultId));
  };

  const handleDeleteHomework = (hwId: string) => {
    setHomeworks((prev) => prev.filter(h => h.id !== hwId));
    setResults((prev) => prev.filter(r => r.homeworkId !== hwId));
  };

  const handleStartExercise = (hw: Homework, sName: string, sClass: string) => {
    setActiveHomeworkToDo(hw);
    setStudentName(sName);
    setStudentClass(sClass);
    setCurrentTab('do-exercise');
  };

  const handleSubmitResult = (result: HomeworkResult) => {
    setResults((prev) => [result, ...prev]);
  };

  // Handle cross-tab or nested navigation
  const handleNavigate = (tabName: string, arg?: any) => {
    setMobileMenuOpen(false);
    
    if (tabName === 'lesson-detail' && arg) {
      setSelectedLesson(arg);
      setCurrentTab('lesson-detail');
    } else if (tabName === 'start-practice' && arg) {
      setPreselectedLessonId(arg);
      setCurrentTab('quiz');
    } else if (tabName === 'chat-ai') {
      if (arg) {
        setChatLessonId(typeof arg === 'string' ? arg : arg.id);
      } else {
        setChatLessonId(undefined);
      }
      setSelectedLesson(null);
      setPreselectedLessonId(undefined);
      setCurrentTab('chat-ai');
    } else {
      setSelectedLesson(null);
      setPreselectedLessonId(undefined);
      setCurrentTab(tabName);
    }
  };

  // Callback when a quiz is configured and started
  const handleStartQuiz = (quiz: Quiz) => {
    setActiveQuiz(quiz);
    setCurrentTab('active-session');
  };

  // Callback when quiz session is submitted and saved by student
  const handleQuizCompleted = (
    score: number,
    correctCount: number,
    answers: Record<string, number>,
    questions: Question[]
  ) => {
    if (!activeQuiz) return;

    const newRecord: HistoryRecord = {
      id: `history-${Date.now()}`,
      quizTitle: activeQuiz.title,
      date: new Date().toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }),
      score: score,
      totalQuestions: activeQuiz.questions.length,
      correctCount: correctCount,
      timeSpentSeconds: 0, // Mock or computed time can go here
      answers: answers,
      questions: questions
    };

    setHistory((prev) => [newRecord, ...prev]);
    setActiveQuiz(null);
    setCurrentTab('history');
  };

  const handleClearHistory = () => {
    setShowClearHistoryConfirm(true);
  };

  const confirmClearHistory = () => {
    setHistory([]);
    setShowClearHistoryConfirm(false);
  };

  if (!currentUser) {
    return <Login onLogin={(user) => setCurrentUser(user)} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col font-sans antialiased transition-colors duration-200">
      {/* Top Navbar */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800/80 sticky top-0 z-40 shadow-xs transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo Brand */}
          <div className="flex items-center gap-2">
            <AppLogo size={38} className="hover:scale-105 transition-all duration-300 shrink-0" />
            <div>
              <span className="font-black text-slate-800 dark:text-slate-100 text-lg tracking-tight">Cánh Buồm <span className="text-blue-600">Tri Thức</span></span>
              <span className="hidden sm:inline-block ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900/50">
                AI Powered 🔭
              </span>
            </div>
          </div>

          {/* Desktop Navigation Link Tabs */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              id="tab-dashboard"
              onClick={() => handleNavigate('dashboard')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                currentTab === 'dashboard'
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40'
              }`}
            >
              <Layers size={14} /> Tổng quan
            </button>
            <button
              id="tab-lessons"
              onClick={() => handleNavigate('lessons')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                currentTab === 'lessons' || currentTab === 'lesson-detail'
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40'
              }`}
            >
              <BookOpen size={14} /> Thư viện Bài học
            </button>
            <button
              id="tab-quiz"
              onClick={() => handleNavigate('quiz')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                currentTab === 'quiz' || currentTab === 'active-session'
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40'
              }`}
            >
              <Cpu size={14} /> Luyện tập AI
            </button>
            <button
              id="tab-chat-ai"
              onClick={() => handleNavigate('chat-ai')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                currentTab === 'chat-ai'
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40'
              }`}
            >
              <MessageSquare size={14} /> Trao đổi AI 💬
            </button>
            <button
              id="tab-exercise-bank"
              onClick={() => handleNavigate('exercise-bank')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                currentTab === 'exercise-bank' || currentTab === 'create-exercise' || currentTab === 'results'
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40'
              }`}
            >
              <ClipboardList size={14} /> Kho bài tập 🏫
            </button>
            <button
              id="tab-join"
              onClick={() => handleNavigate('join')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                currentTab === 'join' || currentTab === 'do-exercise'
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40'
              }`}
            >
              <Key size={14} /> Vào làm bài 🔑
            </button>
            <button
              id="tab-history"
              onClick={() => handleNavigate('history')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                currentTab === 'history'
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40'
              }`}
            >
              <Clock size={14} /> Lịch sử học tập
            </button>
          </nav>

          {/* Actions area: Theme switcher & Mobile menu trigger */}
          <div className="flex items-center gap-2">
            {/* User Profile Widget */}
            {currentUser && (
              <div className="flex items-center gap-2 border border-slate-100 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-950/40 rounded-xl px-3 py-1.5 transition-colors duration-200">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-750 dark:text-slate-300">
                  {currentUser.studentClass && /(gv|giáo viên|giao vien|teacher|g\.v|giaovien)/i.test(currentUser.studentClass) ? (
                    <ShieldCheck size={14} className="text-blue-500 fill-blue-500/10 shrink-0" />
                  ) : (
                    <GraduationCap size={14} className="text-teal-500 fill-teal-500/10 shrink-0" />
                  )}
                  <span className="max-w-[80px] sm:max-w-[120px] truncate" title={currentUser.name}>
                    {currentUser.name}
                  </span>
                  {currentUser.studentClass && (
                    <span className="px-1.5 py-0.5 rounded-md text-[9px] font-black bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-400 border border-teal-200/50 dark:border-teal-900/30">
                      {currentUser.studentClass}
                    </span>
                  )}
                </div>
                
                <div className="w-[1px] h-4 bg-slate-200 dark:bg-slate-800 self-center mx-1"></div>
                
                <button
                  onClick={() => {
                    setShowLogoutConfirm(true);
                  }}
                  className="p-1 hover:text-rose-500 text-slate-400 dark:text-slate-500 hover:bg-rose-50 dark:hover:bg-rose-950/25 rounded-md transition-all cursor-pointer"
                  title="Đăng xuất"
                >
                  <LogOut size={13} />
                </button>
              </div>
            )}

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2.5 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
              title={theme === 'light' ? 'Chuyển sang Giao diện Tối' : 'Chuyển sang Giao diện Sáng'}
            >
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>

            {/* Mobile hamburger menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-100 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

        </div>
      </header>

      {/* Mobile Menu Dropdown Panel */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 shadow-lg px-4 pt-2 pb-4 space-y-1 animate-fade-in z-30 relative transition-colors duration-200">
          <button
            onClick={() => handleNavigate('dashboard')}
            className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold flex items-center gap-2.5 cursor-pointer ${
              currentTab === 'dashboard' ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40'
            }`}
          >
            <Layers size={16} /> Tổng quan
          </button>
          <button
            onClick={() => handleNavigate('lessons')}
            className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold flex items-center gap-2.5 cursor-pointer ${
              currentTab === 'lessons' || currentTab === 'lesson-detail' ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40'
            }`}
          >
            <BookOpen size={16} /> Thư viện Bài học
          </button>
          <button
            onClick={() => handleNavigate('quiz')}
            className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold flex items-center gap-2.5 cursor-pointer ${
              currentTab === 'quiz' || currentTab === 'active-session' ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40'
            }`}
          >
            <Cpu size={16} /> Luyện tập AI
          </button>
          <button
            onClick={() => handleNavigate('chat-ai')}
            className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold flex items-center gap-2.5 cursor-pointer ${
              currentTab === 'chat-ai' ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40'
            }`}
          >
            <MessageSquare size={16} /> Trao đổi AI 💬
          </button>
          <button
            onClick={() => handleNavigate('exercise-bank')}
            className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold flex items-center gap-2.5 cursor-pointer ${
              currentTab === 'exercise-bank' || currentTab === 'create-exercise' || currentTab === 'results' ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40'
            }`}
          >
            <ClipboardList size={16} /> Kho bài tập 🏫
          </button>
          <button
            onClick={() => handleNavigate('join')}
            className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold flex items-center gap-2.5 cursor-pointer ${
              currentTab === 'join' || currentTab === 'do-exercise' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40'
            }`}
          >
            <Key size={16} /> Vào làm bài 🔑
          </button>
          <button
            onClick={() => handleNavigate('history')}
            className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold flex items-center gap-2.5 cursor-pointer ${
              currentTab === 'history' ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40'
            }`}
          >
            <Clock size={16} /> Lịch sử học tập
          </button>
          
          <div className="border-t border-slate-100 dark:border-slate-800/80 my-2 pt-2">
            <button
              onClick={() => {
                setShowLogoutConfirm(true);
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-4 py-3 rounded-xl text-sm font-semibold flex items-center gap-2.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 cursor-pointer"
            >
              <LogOut size={16} /> Đăng xuất ({currentUser?.name})
            </button>
          </div>
        </div>
      )}

      {/* Main Container Stage */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
        <motion.div
          key={currentTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="w-full"
        >
          {/* Render nested views according to active state */}
          {currentTab === 'dashboard' && (
          <Dashboard
            lessons={PHYSICS_LESSONS}
            history={history}
            onNavigate={handleNavigate}
          />
        )}

        {currentTab === 'lessons' && (
          <LessonLibrary
            lessons={PHYSICS_LESSONS}
            onSelectLesson={(lesson) => handleNavigate('lesson-detail', lesson)}
          />
        )}

        {currentTab === 'lesson-detail' && selectedLesson && (
          <LessonView
            lesson={selectedLesson}
            onBack={() => handleNavigate('lessons')}
            onStartPractice={(lessonId) => handleNavigate('start-practice', lessonId)}
            onDiscussWithAI={(lesson) => handleNavigate('chat-ai', lesson)}
          />
        )}

        {currentTab === 'chat-ai' && (
          <AIChat
            lessons={PHYSICS_LESSONS}
            initialLessonId={chatLessonId}
            storageKeySuffix={getUserStorageSuffix(currentUser)}
            onNavigateToLesson={(lesson) => handleNavigate('lesson-detail', lesson)}
          />
        )}

        {currentTab === 'quiz' && (
          <QuizCreator
            lessons={PHYSICS_LESSONS}
            preselectedLessonId={preselectedLessonId}
            onStartQuiz={handleStartQuiz}
          />
        )}

        {currentTab === 'active-session' && activeQuiz && (
          <ActiveQuiz
            quiz={activeQuiz}
            onQuizCompleted={handleQuizCompleted}
            onCancel={() => handleNavigate('quiz')}
          />
        )}

        {currentTab === 'history' && (
          <HistoryList
            history={history}
            onClearHistory={handleClearHistory}
            onNavigateToQuiz={() => handleNavigate('quiz')}
          />
        )}

        {currentTab === 'exercise-bank' && (
          <ExerciseBank
            homeworks={homeworks}
            lessons={PHYSICS_LESSONS}
            onAddExercise={() => {
              setHomeworkToEdit(null);
              setCurrentTab('create-exercise');
            }}
            onEditExercise={(hw) => {
              setHomeworkToEdit(hw);
              setCurrentTab('create-exercise');
            }}
            onDuplicateExercise={handleDuplicateHomework}
            onDeleteExercise={handleDeleteHomework}
            onViewResults={(hw) => {
              setActiveResultViewHomework(hw);
              setCurrentTab('results');
            }}
            onTogglePublish={handleTogglePublish}
          />
        )}

        {currentTab === 'create-exercise' && (
          <CreateExercise
            lessons={PHYSICS_LESSONS}
            existingHomeworks={homeworks}
            homeworkToEdit={homeworkToEdit}
            onSave={(hw) => {
              handleSaveHomework(hw);
            }}
            onCancel={() => {
              setHomeworkToEdit(null);
              setCurrentTab('exercise-bank');
            }}
          />
        )}

        {currentTab === 'join' && (
          <JoinExercise
            homeworks={homeworks}
            initialCode={joinCodeFromUrl}
            onStartExercise={handleStartExercise}
            onNavigateToBank={() => handleNavigate('dashboard')}
            currentUser={currentUser}
          />
        )}

        {currentTab === 'do-exercise' && activeHomeworkToDo && (
          <DoExercise
            homework={activeHomeworkToDo}
            studentName={studentName}
            studentClass={studentClass}
            onSubmitResult={handleSubmitResult}
            onExit={() => {
              setActiveHomeworkToDo(null);
              setCurrentTab('join');
            }}
          />
        )}

        {currentTab === 'results' && activeResultViewHomework && (
          <ExerciseResults
            homework={activeResultViewHomework}
            results={results}
            onBack={() => {
              setActiveResultViewHomework(null);
              setCurrentTab('exercise-bank');
            }}
            onClearSingleResult={handleClearSingleResult}
          />
        )}

        </motion.div>
      </main>

      {/* Clean Footer (No unsolicited credits or telemetry labels) */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 py-6 text-center text-xs text-slate-400 dark:text-slate-500 font-medium mt-auto transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-1">
          <p>Cánh Buồm Tri Thức — Nền tảng học tập & Khảo thí Vật lí 8 thông minh kết hợp trí tuệ nhân tạo Gemini.</p>
          <p className="text-[10px] text-slate-300 dark:text-slate-600">Dành riêng cho giáo viên và học sinh trung học cơ sở.</p>
        </div>
      </footer>

      {/* State-based Confirmation Modal to avoid browser confirm blocking in iframe */}
      {showClearHistoryConfirm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 max-w-md w-full shadow-2xl space-y-4 animate-scale-up">
            <div className="flex items-center gap-3 text-rose-500">
              <AlertTriangle size={24} className="shrink-0" />
              <h3 className="text-base font-extrabold text-slate-850 dark:text-slate-200">
                Xóa lịch sử học tập
              </h3>
            </div>
            
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Bạn có chắc chắn muốn xóa toàn bộ lịch sử học tập và làm bài trắc nghiệm tự do không? 
              <br /><span className="text-rose-500 font-medium">Hành động này không thể hoàn tác và toàn bộ thành tích của bạn sẽ được đặt lại.</span>
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowClearHistoryConfirm(false)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-600 dark:text-slate-300 font-bold rounded-xl text-xs transition-all cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={confirmClearHistory}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs shadow-md shadow-rose-500/10 transition-all cursor-pointer"
              >
                Xóa vĩnh viễn
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Logout confirmation modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 max-w-md w-full shadow-2xl space-y-4 animate-scale-up">
            <div className="flex items-center gap-3 text-rose-500">
              <LogOut size={20} className="shrink-0" />
              <h3 className="text-base font-extrabold text-slate-850 dark:text-slate-200">
                Đăng xuất tài khoản
              </h3>
            </div>
            
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Bạn có chắc chắn muốn đăng xuất khỏi tài khoản hiện tại (<strong className="text-slate-800 dark:text-white">{currentUser?.name}</strong>) không?
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-600 dark:text-slate-300 font-bold rounded-xl text-xs transition-all cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => {
                  setCurrentUser(null);
                  setShowLogoutConfirm(false);
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs shadow-md shadow-rose-500/10 transition-all cursor-pointer"
              >
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
