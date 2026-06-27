import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, Send, Sparkles, Trash2, Bot, User, Info, 
  BookOpen, HelpCircle, ChevronRight, Check, Loader2, RefreshCw, Sparkle, AlertTriangle 
} from 'lucide-react';
import { Lesson } from '../types';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface Persona {
  id: string;
  name: string;
  title: string;
  avatar: string;
  description: string;
  systemInstruction: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

const TEACHER_PERSONAS: Persona[] = [
  {
    id: 'thay-tri',
    name: 'Thầy Minh Trí',
    title: 'Giáo sư Vật lí chuyên sâu',
    avatar: '👨‍🏫',
    description: 'Nghiêm túc, giải thích chuyên môn cặn kẽ, đưa ra nhiều bài tập thực hành & tư duy sâu sắc.',
    systemInstruction: 'Bạn là Thầy Minh Trí, một giáo viên Vật lí lớp 8 chuyên THCS vô cùng thông thái và nghiêm túc. Bạn luôn tập trung vào bản chất học thuật khoa học, giải thích các hiện tượng, định lý, công thức chi tiết nhất có thể. Khi học sinh hỏi bài, bạn trả lời bằng tiếng Việt, xưng hô là "Thầy" và gọi học sinh là "em". Hãy cung cấp các ví dụ thực hành cụ thể hoặc công thức liên quan.',
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-50/70 dark:bg-blue-950/25',
    borderColor: 'border-blue-100 dark:border-blue-900/40'
  },
  {
    id: 'co-dan',
    name: 'Cô Linh Đan',
    title: 'Giáo viên Thân thiện & Khích lệ',
    avatar: '👩‍🏫',
    description: 'Ngọt ngào, chu đáo, giải thích bài bằng ví dụ đời thường gần gũi, khích lệ tinh thần tự học.',
    systemInstruction: 'Bạn là Cô Linh Đan, một giáo viên dạy Vật lí 8 THCS cực kỳ dịu dàng, ấm áp và luôn khích lệ học sinh. Bạn giải thích bài học bằng những ví dụ trực quan trong đời sống thường ngày để các em dễ hình dung nhất. Bạn sử dụng nhiều biểu tượng cảm xúc (emoji) tích cực. Bạn trả lời bằng tiếng Việt, xưng hô là "Cô" và gọi học sinh là "em".',
    color: 'text-rose-600 dark:text-rose-400',
    bgColor: 'bg-rose-50/70 dark:bg-rose-950/25',
    borderColor: 'border-rose-100 dark:border-rose-900/40'
  },
  {
    id: 'physis',
    name: 'Physis Assistant',
    title: 'Robot Trợ lí Vật lí Số',
    avatar: '🤖',
    description: 'Nhanh chóng, tập trung thẳng vào công thức, mẹo ghi nhớ nhanh và sơ đồ giải bài toán.',
    systemInstruction: 'Bạn là Physis, một robot trợ lý học tập Vật lý 8 thế hệ mới thông minh, năng động. Bạn giải quyết thắc mắc ngắn gọn, cô đọng, tập trung vào mẹo nhớ nhanh công thức, các bước giải toán tối ưu và tóm tắt nhanh lý thuyết. Bạn trả lời bằng tiếng Việt, xưng hô là "Physis" hoặc "Tôi" và gọi người dùng là "em" hoặc "bạn".',
    color: 'text-teal-600 dark:text-teal-400',
    bgColor: 'bg-teal-50/70 dark:bg-teal-950/25',
    borderColor: 'border-teal-100 dark:border-teal-900/40'
  }
];

// Presets based on chapter/lessons
const GENERAL_STARTERS = [
  "Lực đẩy Ác-si-mét xuất hiện khi nào và công thức ra sao?",
  "Hãy phân biệt giữa Chuyển động đều và Chuyển động không đều?",
  "Thế nào là công cơ học? Cho ví dụ về trường hợp không có công?",
  "Nêu sự khác biệt giữa Nhiệt năng và Nhiệt lượng?"
];

interface AIChatProps {
  lessons: Lesson[];
  initialLessonId?: string;
  onNavigateToLesson?: (lesson: Lesson) => void;
  storageKeySuffix?: string;
}

export default function AIChat({ lessons, initialLessonId, onNavigateToLesson, storageKeySuffix = '' }: AIChatProps) {
  const [selectedPersona, setSelectedPersona] = useState<Persona>(TEACHER_PERSONAS[0]);
  const [selectedLessonId, setSelectedLessonId] = useState<string>(initialLessonId || 'all');
  const chatStorageKey = `physilearn_ai_chat_v1${storageKeySuffix}`;
  
  // Conversation state
  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const saved = localStorage.getItem(chatStorageKey);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (err) {
      console.error("Error reading chat history:", err);
    }
    return [
      {
        id: 'welcome-msg',
        role: 'assistant',
        content: "Chào em! Thầy là **Thầy Minh Trí**. Hôm nay em muốn trao đổi bài học nào trong chương trình Vật lí 8? Em có thể chọn bài học cụ thể bên cạnh để chúng ta cùng ôn tập sâu sắc nhé!",
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
      }
    ];
  });

  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorText, setErrorText] = useState('');
  const [isUsingGemini, setIsUsingGemini] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  
  // Custom learning roadmap generator states
  const [selectedRoadmapGoal, setSelectedRoadmapGoal] = useState<string>('breakthrough');
  const [customRoadmapNotes, setCustomRoadmapNotes] = useState<string>('');

  const chatBottomRef = useRef<HTMLDivElement>(null);

  const handleGenerateRoadmap = () => {
    let goalText = "Bứt phá điểm số 8+ học kỳ (học sinh trung bình muốn bứt phá)";
    if (selectedRoadmapGoal === 'advanced') {
      goalText = "Chinh phục Học sinh Giỏi và ôn thi chuyên lý lớp 8";
    } else if (selectedRoadmapGoal === 'recovery') {
      goalText = "Lấy lại căn bản Vật lý lớp 8 cực nhanh cho học sinh yếu, mất gốc hoặc sợ học Lý";
    } else if (selectedRoadmapGoal === 'fast') {
      goalText = "Ôn tập cấp tốc hệ thống kiến thức thi học kỳ trong vòng 1-2 tuần";
    }

    let prompt = `Xin chào ${selectedPersona.name}! Hãy biên soạn giúp em một Lộ trình học tập Vật lý lớp 8 cá nhân hóa chi tiết, khoa học và đầy tính thuyết phục.

- **Mục tiêu của em**: ${goalText}`;

    if (customRoadmapNotes.trim()) {
      prompt += `\n- **Khó khăn/Mong muốn bổ sung**: ${customRoadmapNotes.trim()}`;
    }

    prompt += `\n\nHãy chia lộ trình thành các tuần học cụ thể có bố cục rành mạch (Tuần 1, Tuần 2,...). Với mỗi tuần, vui lòng đưa ra:
1) **Kiến thức trọng tâm** cốt lõi cần làm chủ.
2) **Công thức & Định luật** bắt buộc phải thuộc lòng.
3) **Dạng bài tập kinh điển** thường gặp kèm theo một ví dụ minh họa và mẹo giải nhanh.
4) **Lời khuyên học tập thực tế** từ Thầy/Cô.

Hãy trình bày bằng tiếng Việt, ngôn ngữ truyền cảm hứng học tập và chuyên nghiệp nhất.`;

    handleSendMessage(prompt);
  };

  // Sync persona welcome message if message history is cleared or reset
  const handleSelectPersona = (persona: Persona) => {
    setSelectedPersona(persona);
    setMessages([
      {
        id: `welcome-${persona.id}`,
        role: 'assistant',
        content: persona.id === 'thay-tri' 
          ? "Chào em! Thầy là **Thầy Minh Trí**. Hôm nay em muốn trao đổi bài học nào trong chương trình Vật lí 8? Em có thể chọn bài học cụ thể bên cạnh để chúng ta cùng ôn tập sâu sắc nhé!"
          : persona.id === 'co-dan'
            ? "Chào em yêu! Cô là **Cô Linh Đan** đây. 🌸 Em đang gặp khó khăn ở phần nào của bài học Vật lí 8 thế? Nói cô nghe để cô trò mình cùng gỡ rối thật dễ dàng nhé! ✨"
            : "Chào bạn! Tôi là **Physis**, trợ lý robot Vật lí số 8 của bạn. Hãy gửi bài tập hoặc công thức bạn cần tóm tắt, tôi sẽ giải đáp ngắn gọn và chia sẻ mẹo ghi nhớ tức thì!",
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  // Keep chat scrolled to bottom
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Save messages to local storage
  useEffect(() => {
    try {
      localStorage.setItem(chatStorageKey, JSON.stringify(messages));
    } catch (err) {
      console.error("Error saving chat history:", err);
    }
  }, [messages, chatStorageKey]);

  // Fetch API key state to update UI Badge
  useEffect(() => {
    let active = true;
    const checkStatus = async () => {
      try {
        const response = await fetch('/api/ai-status');
        if (response.ok) {
          const data = await response.json();
          if (active && data.success) {
            setIsUsingGemini(data.isAvailable);
          }
        }
      } catch (err) {
        console.error("Error checking AI status:", err);
      }
    };
    checkStatus();
    return () => {
      active = false;
    };
  }, []);

  const selectedLesson = lessons.find(l => l.id === selectedLessonId);

  // Generate localized prompts for selected lessons
  const getStarters = () => {
    if (!selectedLesson) return GENERAL_STARTERS;
    
    // Create prompts tailored specifically for this lesson
    const list = [
      `Em chưa hiểu rõ phần lý thuyết của bài "${selectedLesson.title}", giải thích kỹ hơn giúp em với.`,
      `Đưa ra một ví dụ minh họa sinh động về bài "${selectedLesson.title}" trong đời sống?`
    ];
    if (selectedLesson.formulas && selectedLesson.formulas.length > 0) {
      list.push(`Làm sao áp dụng công thức "${selectedLesson.formulas[0].name}" để giải bài tập?`);
    } else if (selectedLesson.examples && selectedLesson.examples.length > 0) {
      list.push(`Giải thích chi tiết bước giải của ví dụ thực hành trong bài này.`);
    } else {
      list.push(`Tóm tắt các từ khóa quan trọng nhất của bài học này giúp em ôn tập nhanh.`);
    }
    return list;
  };

  const handleSendMessage = async (msgContent: string) => {
    if (!msgContent.trim() || isLoading) return;

    setErrorText('');
    const userMsgId = `msg-${Date.now()}-user`;
    const newMsg: Message = {
      id: userMsgId,
      role: 'user',
      content: msgContent,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    };

    const updatedMessages = [...messages, newMsg];
    setMessages(updatedMessages);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Map message log to backend API structures
      const formattedHistory = updatedMessages.map(m => ({
        role: m.role,
        content: m.content
      }));

      const bodyPayload: any = {
        messages: formattedHistory,
        systemInstruction: selectedPersona.systemInstruction
      };

      // Add lesson context if selected
      if (selectedLesson) {
        bodyPayload.lessonTitle = selectedLesson.title;
        bodyPayload.lessonSummary = selectedLesson.summary;
        bodyPayload.lessonTheory = selectedLesson.theory.join('\n');
      }

      const response = await fetch('/api/chat-ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(bodyPayload)
      });

      if (!response.ok) {
        throw new Error(`Máy chủ báo lỗi: ${response.status}`);
      }

      const data = await response.json();
      
      // Update fallback indicator based on source metadata from server
      setIsUsingGemini(data.source === 'gemini');

      const botMsg: Message = {
        id: `msg-${Date.now()}-bot`,
        role: 'assistant',
        content: data.reply,
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, botMsg]);

    } catch (err: any) {
      console.error("Failed to connect to AI chat endpoint:", err);
      setErrorText(`Không thể kết nối với giáo viên AI: ${err.message || err}. Vui lòng thử lại.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    handleSelectPersona(selectedPersona);
    setShowClearConfirm(false);
  };

  // Parsers to render markdown elegantly on screen
  const parseInlineStyling = (text: string) => {
    const parts = [];
    let currentStr = text;
    let keyIdx = 0;

    while (currentStr.length > 0) {
      const boldIdx = currentStr.indexOf('**');
      const codeIdx = currentStr.indexOf('`');

      if (boldIdx === -1 && codeIdx === -1) {
        parts.push(<span key={keyIdx++}>{currentStr}</span>);
        break;
      }

      if (boldIdx !== -1 && (codeIdx === -1 || boldIdx < codeIdx)) {
        if (boldIdx > 0) {
          parts.push(<span key={keyIdx++}>{currentStr.substring(0, boldIdx)}</span>);
        }
        const endBoldIdx = currentStr.indexOf('**', boldIdx + 2);
        if (endBoldIdx !== -1) {
          const boldText = currentStr.substring(boldIdx + 2, endBoldIdx);
          parts.push(<strong key={keyIdx++} className="font-extrabold text-slate-900 dark:text-white">{boldText}</strong>);
          currentStr = currentStr.substring(endBoldIdx + 2);
        } else {
          parts.push(<span key={keyIdx++}>**</span>);
          currentStr = currentStr.substring(boldIdx + 2);
        }
      } else {
        if (codeIdx > 0) {
          parts.push(<span key={keyIdx++}>{currentStr.substring(0, codeIdx)}</span>);
        }
        const endCodeIdx = currentStr.indexOf('`', codeIdx + 1);
        if (endCodeIdx !== -1) {
          const codeText = currentStr.substring(codeIdx + 1, endCodeIdx);
          parts.push(<code key={keyIdx++} className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-950 text-indigo-600 dark:text-indigo-400 font-mono text-[10px] rounded border border-slate-200/40 dark:border-slate-850">{codeText}</code>);
          currentStr = currentStr.substring(endCodeIdx + 1);
        } else {
          parts.push(<span key={keyIdx++}>`</span>);
          currentStr = currentStr.substring(codeIdx + 1);
        }
      }
    }

    return parts;
  };

  const renderMessageContent = (text: string) => {
    const paragraphs = text.split('\n');
    return paragraphs.map((para, idx) => {
      if (!para.trim()) return <div key={idx} className="h-2" />;

      if (para.startsWith('### ')) {
        return <h4 key={idx} className="text-sm font-bold text-slate-850 dark:text-slate-100 mt-3 mb-1">{para.replace('### ', '')}</h4>;
      }
      if (para.startsWith('## ')) {
        return <h3 key={idx} className="text-base font-black text-slate-900 dark:text-white mt-4 mb-2">{para.replace('## ', '')}</h3>;
      }
      if (para.startsWith('# ')) {
        return <h2 key={idx} className="text-lg font-black text-slate-900 dark:text-white mt-4 mb-2">{para.replace('# ', '')}</h2>;
      }

      if (para.startsWith('- ') || para.startsWith('* ')) {
        const content = para.substring(2);
        return (
          <li key={idx} className="ml-4 list-disc text-xs text-slate-750 dark:text-slate-300 leading-relaxed my-1">
            {parseInlineStyling(content)}
          </li>
        );
      }

      const numListMatch = para.match(/^\d+\.\s(.*)/);
      if (numListMatch) {
        const content = numListMatch[1];
        return (
          <li key={idx} className="ml-4 list-decimal text-xs text-slate-750 dark:text-slate-300 leading-relaxed my-1">
            {parseInlineStyling(content)}
          </li>
        );
      }

      return (
        <p key={idx} className="text-xs text-slate-755 dark:text-slate-300 leading-relaxed my-1.5">
          {parseInlineStyling(para)}
        </p>
      );
    });
  };

  return (
    <div id="ai-chat-container" className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch max-w-7xl mx-auto h-[calc(100vh-140px)] min-h-[580px]">
      
      {/* LEFT PANEL: Chat controls, Persona selected & Lesson context selection */}
      <div className="lg:col-span-4 flex flex-col space-y-4 h-full overflow-y-auto pr-1">
        
        {/* Card 1: Select AI Teacher Persona */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs flex flex-col space-y-4 shrink-0">
          <div className="flex items-center gap-2">
            <Bot size={18} className="text-blue-600 dark:text-blue-400" />
            <h3 className="text-sm font-black text-slate-850 dark:text-slate-200 uppercase tracking-wider">
              Chọn Giáo viên AI
            </h3>
          </div>
          
          <div className="flex flex-col gap-2.5">
            {TEACHER_PERSONAS.map((p) => {
              const isSelected = selectedPersona.id === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => handleSelectPersona(p)}
                  className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                    isSelected
                      ? `bg-white dark:bg-slate-900/50 border-blue-500 shadow-md ${p.bgColor}`
                      : 'border-slate-200/60 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-950/20'
                  }`}
                >
                  <span className="text-2xl mt-0.5 shrink-0 select-none">{p.avatar}</span>
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-black text-slate-800 dark:text-slate-100">{p.name}</span>
                      {isSelected && (
                        <span className="text-[9px] bg-blue-600 text-white font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                          <Check size={8} /> Đang dạy
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold">{p.title}</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed font-normal">{p.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Card 2: Select Lesson Context */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs flex flex-col space-y-4">
          <div className="flex items-center gap-2">
            <BookOpen size={18} className="text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-sm font-black text-slate-850 dark:text-slate-200 uppercase tracking-wider">
              Bối cảnh bài học 🔭
            </h3>
          </div>

          <div className="space-y-3">
            <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-normal">
              Chọn một bài học từ thư viện để thảo luận cụ thể. AI sẽ tự động tập trung giảng dạy lý thuyết, công thức liên quan mật thiết tới bài học được chọn!
            </p>

            <select
              value={selectedLessonId}
              onChange={(e) => {
                setSelectedLessonId(e.target.value);
                // Clear state slightly to refocus on new context
                setErrorText('');
              }}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500/50 text-slate-850 dark:text-slate-200 cursor-pointer"
            >
              <option value="all">🌐 Tổng ôn tập toàn bộ Vật lí 8</option>
              {lessons.map((lesson) => (
                <option key={lesson.id} value={lesson.id}>
                  📚 {lesson.chapterId}. {lesson.title}
                </option>
              ))}
            </select>

            {selectedLesson && (
              <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100/50 dark:border-indigo-900/30 rounded-xl space-y-2 animate-fade-in">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-indigo-700 dark:text-indigo-400 uppercase tracking-wider">Đang thảo luận:</span>
                  {onNavigateToLesson && (
                    <button
                      onClick={() => onNavigateToLesson(selectedLesson)}
                      className="text-[9px] text-blue-600 hover:underline font-bold cursor-pointer"
                    >
                      Xem tài liệu →
                    </button>
                  )}
                </div>
                <h4 className="text-xs font-black text-slate-800 dark:text-slate-100 leading-tight">
                  {selectedLesson.title}
                </h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {selectedLesson.summary}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Card 3: Personalized Learning Roadmap with AI */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs flex flex-col space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-amber-500 animate-pulse" />
            <h3 className="text-sm font-black text-slate-850 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1">
              Lộ trình học AI <span className="text-xs font-normal px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400">Mới</span>
            </h3>
          </div>

          <div className="space-y-3.5">
            <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-normal">
              Hãy chọn mục tiêu học tập và ghi chú khó khăn (nếu có). Trợ lý AI sẽ thiết lập một kế hoạch ôn luyện chi tiết từng tuần dành riêng cho bạn!
            </p>

            {/* Selection of goal */}
            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                Mục tiêu của bạn:
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { id: 'breakthrough', label: 'Bứt phá 8+', icon: '🚀', desc: 'Trung bình lên khá' },
                  { id: 'advanced', label: 'Học sinh giỏi', icon: '🏆', desc: 'Chuyên sâu & nâng cao' },
                  { id: 'recovery', label: 'Mất gốc Lý', icon: '🛡️', desc: 'Lấy lại căn bản' },
                  { id: 'fast', label: 'Cấp tốc', icon: '⏱️', desc: 'Học nhanh đi thi' }
                ].map((g) => {
                  const isGoalSelected = selectedRoadmapGoal === g.id;
                  return (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => setSelectedRoadmapGoal(g.id)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between h-[58px] ${
                        isGoalSelected
                          ? 'border-amber-500 bg-amber-50/40 dark:bg-amber-950/25 text-slate-800 dark:text-slate-100 shadow-xs'
                          : 'border-slate-100 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-950/10'
                      }`}
                    >
                      <div className="flex items-center gap-1">
                        <span className="text-xs select-none">{g.icon}</span>
                        <span className="text-[10px] font-black tracking-tight truncate">{g.label}</span>
                      </div>
                      <span className="text-[8px] text-slate-400 dark:text-slate-500 mt-1 block font-semibold leading-none">{g.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Notes / Strength-Weakness */}
            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                Ghi chú thêm về học lực (nếu có):
              </label>
              <textarea
                value={customRoadmapNotes}
                onChange={(e) => setCustomRoadmapNotes(e.target.value)}
                placeholder="Ví dụ: Em yếu phần lực đẩy Ác-si-mét, cần tập trung làm các bài tập định lượng..."
                className="w-full px-2.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-[10px] focus:outline-none focus:ring-1 focus:ring-blue-500/50 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 h-16 resize-none font-semibold leading-normal"
              />
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerateRoadmap}
              disabled={isLoading}
              className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-[11px] font-black rounded-xl shadow-md shadow-amber-500/10 hover:shadow-amber-500/20 cursor-pointer transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <Sparkles size={12} className="animate-pulse" />
              <span>Gợi ý Lộ trình học tập AI 🪄</span>
            </button>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL: Interactive Chat Screen */}
      <div className="lg:col-span-8 flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden h-full">
        
        {/* Chat Header bar */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative">
              <span className="text-3xl select-none">{selectedPersona.avatar}</span>
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-xs font-extrabold text-slate-850 dark:text-slate-100">
                  {selectedPersona.name}
                </h3>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                  Lớp 8 THCS
                </span>
              </div>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold truncate max-w-xs md:max-w-md">
                {selectedLesson ? `Đang tập trung: ${selectedLesson.title}` : 'Đang ở chế độ hỏi đáp tổng hợp'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Status badge */}
            <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
              isUsingGemini 
                ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900/30' 
                : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30'
            }`}>
              {isUsingGemini ? '🤖 Trí tuệ nhân tạo Gemini' : '⚡ Offline Dự phòng'}
            </span>

            <button
              onClick={() => setShowClearConfirm(true)}
              className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              title="Xóa lịch sử trò chuyện"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        {/* Info panel when Gemini is offline */}
        {!isUsingGemini && (
          <div className="px-5 py-2.5 bg-amber-500/5 border-b border-amber-500/15 text-[10px] text-amber-600 dark:text-amber-300 leading-normal flex items-start gap-2 shrink-0">
            <Info size={13} className="text-amber-500 shrink-0 mt-0.5" />
            <p>
              Hệ thống đang hoạt động ở chế độ **Offline dự phòng** do chưa có API Key hoặc AI thật đang tạm thời không phản hồi. Bạn vẫn có thể trò chuyện cơ bản, hoặc cấu hình **GEMINI_API_KEY** trong mục **Settings &gt; Secrets** / Environment Variables để dùng Gemini.
            </p>
          </div>
        )}

        {/* Chat History Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-5 md:p-6 space-y-4 bg-slate-50/40 dark:bg-slate-950/10">
          {messages.map((m) => {
            const isUser = m.role === 'user';
            return (
              <div
                key={m.id}
                className={`flex gap-3 max-w-[85%] md:max-w-[80%] ${
                  isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'
                } animate-fade-in`}
              >
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center select-none ${
                  isUser 
                    ? 'bg-blue-600 text-white' 
                    : `${selectedPersona.bgColor} border ${selectedPersona.borderColor} text-xl`
                }`}>
                  {isUser ? <User size={14} /> : selectedPersona.avatar}
                </div>

                {/* Message block */}
                <div className="space-y-1">
                  <div className={`p-4 rounded-2xl shadow-xs leading-relaxed text-xs ${
                    isUser
                      ? 'bg-blue-600 text-white rounded-tr-xs'
                      : 'bg-white dark:bg-slate-850 text-slate-800 dark:text-slate-100 rounded-tl-xs border border-slate-100 dark:border-slate-800'
                  }`}>
                    {renderMessageContent(m.content)}
                  </div>
                  
                  {/* Timestamp */}
                  <p className={`text-[9px] text-slate-400 font-semibold ${isUser ? 'text-right' : 'text-left'}`}>
                    {m.timestamp}
                  </p>
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3 max-w-[80%] mr-auto items-start">
              <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center ${selectedPersona.bgColor} border ${selectedPersona.borderColor} text-xl animate-bounce`}>
                {selectedPersona.avatar}
              </div>
              <div className="bg-white dark:bg-slate-850 p-4 rounded-2xl rounded-tl-xs border border-slate-100 dark:border-slate-800 shadow-xs flex items-center gap-2">
                <Loader2 size={13} className="animate-spin text-blue-600" />
                <span className="text-xs text-slate-400 italic font-medium">
                  {selectedPersona.name} đang suy nghĩ câu trả lời...
                </span>
              </div>
            </div>
          )}

          {errorText && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs rounded-xl flex items-center gap-2 max-w-md mx-auto">
              <Info size={14} className="text-rose-500 shrink-0" />
              <span>{errorText}</span>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* Suggestion Prompts bar: Tailored based on focus context */}
        <div className="px-5 py-3.5 bg-slate-50/50 dark:bg-slate-950/20 border-t border-slate-100 dark:border-slate-800 shrink-0">
          <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
            <Sparkle size={10} className="text-amber-500" /> Gợi ý câu hỏi nhanh:
          </p>
          <div className="flex flex-wrap gap-1.5 max-h-[90px] overflow-y-auto">
            {getStarters().map((starter, sIdx) => (
              <button
                key={sIdx}
                onClick={() => handleSendMessage(starter)}
                disabled={isLoading}
                className="px-3 py-1.5 bg-white dark:bg-slate-900 hover:bg-blue-50 dark:hover:bg-blue-950/25 text-slate-600 dark:text-slate-300 hover:text-blue-700 dark:hover:text-blue-400 border border-slate-200/60 dark:border-slate-800 rounded-full text-[10px] font-semibold transition-all cursor-pointer select-none truncate max-w-xs md:max-w-sm disabled:opacity-50"
              >
                {starter}
              </button>
            ))}
          </div>
        </div>

        {/* Chat input box */}
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage(inputMessage);
          }} 
          className="p-4 border-t border-slate-100 dark:border-slate-800 flex gap-2.5 items-center bg-white dark:bg-slate-900 shrink-0"
        >
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            disabled={isLoading}
            placeholder={`Đặt câu hỏi Vật lí 8 cho ${selectedPersona.name}...`}
            className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500/50 text-slate-850 dark:text-slate-100 placeholder:text-slate-400"
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || isLoading}
            className="p-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-xl shadow-md shadow-blue-500/10 cursor-pointer transition-all flex items-center justify-center shrink-0"
            title="Gửi tin nhắn"
          >
            <Send size={15} />
          </button>
        </form>

      </div>

      {/* State-based Confirmation Modal to avoid browser confirm blocking in iframe */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 max-w-md w-full shadow-2xl space-y-4 animate-scale-up">
            <div className="flex items-center gap-3 text-rose-500">
              <AlertTriangle size={24} className="shrink-0" />
              <h3 className="text-base font-extrabold text-slate-850 dark:text-slate-200">
                Xóa lịch sử trò chuyện
              </h3>
            </div>
            
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Bạn có chắc chắn muốn xóa toàn bộ lịch sử trò chuyện hiện tại với <strong className="text-slate-800 dark:text-white">{selectedPersona.name}</strong> không? 
              <br /><span className="text-slate-500 font-medium">Cuộc hội thoại sẽ được thiết lập lại về tin nhắn chào mừng ban đầu.</span>
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-600 dark:text-slate-300 font-bold rounded-xl text-xs transition-all cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleClearHistory}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs shadow-md shadow-rose-500/10 transition-all cursor-pointer"
              >
                Đồng ý xóa
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
