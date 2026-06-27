import { GoogleGenAI, Type } from '@google/genai';

let cachedAiClient: GoogleGenAI | null = null;
let lastUsedKey: string | null = null;

export function normalizeApiKey(value?: string | null): string | null {
  const key = value?.trim();
  if (!key) return null;
  const placeholders = new Set(['MY_GEMINI_API_KEY', 'YOUR_GEMINI_API_KEY', 'your_gemini_api_key', 'AIzaSy...']);
  return placeholders.has(key) ? null : key;
}

export function getGeminiApiKey(): string | null {
  return normalizeApiKey(process.env.GEMINI_API_KEY) || normalizeApiKey(process.env.GOOGLE_API_KEY);
}

export function isGeminiConfigured(): boolean {
  return !!getGeminiApiKey();
}

export function getAiClient(): GoogleGenAI {
  const key = getGeminiApiKey();
  if (!key) throw new Error('Missing GEMINI_API_KEY on server');
  if (!cachedAiClient || lastUsedKey !== key) {
    cachedAiClient = new GoogleGenAI({ apiKey: key });
    lastUsedKey = key;
  }
  return cachedAiClient;
}

export function getGeminiModelCandidates(): string[] {
  return Array.from(new Set([
    process.env.GEMINI_MODEL?.trim(),
    'gemini-2.5-flash',
    'gemini-2.0-flash'
  ].filter(Boolean) as string[]));
}

export async function generateGeminiContent(request: any) {
  const aiClient = getAiClient();
  let lastError: any = null;
  for (const model of getGeminiModelCandidates()) {
    try {
      return await aiClient.models.generateContent({ ...request, model });
    } catch (error: any) {
      lastError = error;
      console.error(`Gemini model ${model} failed:`, error?.message || error);
    }
  }
  throw lastError || new Error('No Gemini model candidate could generate a response');
}

export function fallbackQuestions(topic = 'Vật lí 8', count = 3) {
  const base = [
    {
      questionText: `Khi xe phanh gấp, hành khách bị xô về phía trước là do hiện tượng nào liên quan đến ${topic}?`,
      options: ['Quán tính của cơ thể giữ trạng thái chuyển động cũ.', 'Trọng lực tác dụng lên hành khách.', 'Lực ma sát giữa lốp xe và mặt đường.', 'Sự cản của không khí trong xe.'],
      correctAnswerIndex: 0,
      explanation: 'Theo quán tính, cơ thể có xu hướng giữ trạng thái chuyển động cũ khi xe đột ngột giảm tốc.',
      points: 2
    },
    {
      questionText: 'Công thức tính áp suất chất lỏng tại độ sâu h là gì?',
      options: ['p = F / S', 'p = d × h', 'p = d × V', 'p = P / S'],
      correctAnswerIndex: 1,
      explanation: 'Áp suất chất lỏng tại độ sâu h được tính bằng p = d × h, trong đó d là trọng lượng riêng của chất lỏng.',
      points: 2
    },
    {
      questionText: 'Nhiệt năng của một vật tăng lên rõ rệt trong trường hợp nào?',
      options: ['Đặt vật vào tủ lạnh.', 'Cọ xát vật với bề mặt khác.', 'Để vật đứng yên trên bàn.', 'Đưa vật lên cao hơn.'],
      correctAnswerIndex: 1,
      explanation: 'Cọ xát là một cách thực hiện công làm tăng nhiệt năng của vật.',
      points: 2
    }
  ];

  return Array.from({ length: Math.max(1, Math.min(10, count)) }, (_, index) => ({
    ...base[index % base.length],
    id: `fallback-${Date.now()}-${index}`
  }));
}

export async function generateQuestions(body: any) {
  const reqCount = Math.min(Math.max(Number(body?.count) || 3, 1), 10);
  const reqTopic = body?.topic || 'Tổng hợp Vật lí 8';
  const reqDifficulty = body?.difficulty || 'Trung bình';

  if (!isGeminiConfigured()) {
    return {
      success: true,
      source: 'fallback-missing-key',
      message: 'Chưa cấu hình GEMINI_API_KEY trên server. Hệ thống đang dùng câu hỏi mẫu dự phòng.',
      questions: fallbackQuestions(reqTopic, reqCount)
    };
  }

  const prompt = `Hãy tạo ${reqCount} câu hỏi trắc nghiệm Vật lí lớp 8 THCS về chủ đề "${reqTopic}" với mức độ khó "${reqDifficulty}". Mỗi câu có đúng 4 lựa chọn, chỉ số đáp án đúng từ 0 đến 3, lời giải thích ngắn gọn và chính xác.`;

  try {
    const response = await generateGeminiContent({
      contents: prompt,
      config: {
        systemInstruction: 'Bạn là giáo viên Vật lí lớp 8 THCS tại Việt Nam. Câu hỏi phải đúng khoa học, rõ ràng, vừa sức học sinh và có giải thích đáp án.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              questionText: { type: Type.STRING },
              options: { type: Type.ARRAY, items: { type: Type.STRING } },
              correctAnswerIndex: { type: Type.INTEGER },
              explanation: { type: Type.STRING },
              points: { type: Type.INTEGER }
            },
            required: ['questionText', 'options', 'correctAnswerIndex', 'explanation']
          }
        },
        temperature: 0.65
      }
    });

    const responseText = response.text;
    const parsed = responseText ? JSON.parse(responseText) : [];
    const questions = Array.isArray(parsed) ? parsed : [];
    if (!questions.length) throw new Error('Gemini returned empty question list');
    return { success: true, source: 'gemini', questions };
  } catch (error: any) {
    return {
      success: true,
      source: 'fallback-error',
      message: `AI thật chưa phản hồi ổn định (${error?.message || error}). Hệ thống đang dùng câu hỏi mẫu dự phòng.`,
      questions: fallbackQuestions(reqTopic, reqCount)
    };
  }
}

export function buildChatFallbackReply(messages: any[], lessonTitle?: string, errorMessage?: string): string {
  const lastUserMsg = String(messages?.[messages.length - 1]?.content || '').trim();
  const topic = lessonTitle ? `bài **${lessonTitle}**` : 'chương trình **Vật lí 8**';
  const note = errorMessage ? `\n\n> Ghi chú: AI thật chưa phản hồi ổn định (${errorMessage}). Hệ thống đang dùng phản hồi dự phòng.` : '';
  if (!lastUserMsg) return `Thầy/Cô đã sẵn sàng hỗ trợ em ôn tập ${topic}. Em hãy gửi câu hỏi cụ thể nhé.${note}`;
  return `Thầy/Cô đã nhận được câu hỏi của em: **${lastUserMsg}**\n\nVới ${topic}, em nên làm theo 3 bước:\n1. Xác định đại lượng/hiện tượng đang hỏi.\n2. Ghi công thức hoặc định luật liên quan.\n3. Kiểm tra đơn vị và kết luận bằng câu đầy đủ.\n\nEm có thể gửi thêm dữ kiện để Thầy/Cô hướng dẫn chi tiết hơn.${note}`;
}

export async function chatWithAI(body: any) {
  const { messages, systemInstruction, lessonTitle, lessonSummary, lessonTheory } = body || {};
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return { status: 400, body: { success: false, error: 'Messages array is required and cannot be empty.' } };
  }

  if (!isGeminiConfigured()) {
    return { status: 200, body: { success: true, source: 'mock', reply: buildChatFallbackReply(messages, lessonTitle, 'Missing GEMINI_API_KEY on server') } };
  }

  try {
    let finalSystemInstruction = systemInstruction || 'Bạn là giáo viên Vật lí lớp 8 THCS thân thiện, trả lời bằng tiếng Việt, dễ hiểu, có ví dụ thực tế.';
    if (lessonTitle) {
      finalSystemInstruction += `\n\nBối cảnh bài học: ${lessonTitle}\nTóm tắt: ${lessonSummary || 'Chưa có'}\nLý thuyết: ${lessonTheory || 'Chưa có'}`;
    }

    const contents = messages.map((m: any) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));

    const response = await generateGeminiContent({
      contents,
      config: { systemInstruction: finalSystemInstruction, temperature: 0.8 }
    });

    return { status: 200, body: { success: true, source: 'gemini', reply: response.text || 'Em hỏi lại giúp Thầy/Cô nhé.' } };
  } catch (error: any) {
    return { status: 200, body: { success: true, source: 'fallback-error', reply: buildChatFallbackReply(messages, lessonTitle, error?.message || String(error)) } };
  }
}

export async function readJsonBody(req: any): Promise<any> {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') {
    try { return JSON.parse(req.body); } catch { return {}; }
  }

  const chunks: any[] = [];
  for await (const chunk of req) chunks.push(Buffer.from(chunk));
  const raw = Buffer.concat(chunks).toString('utf8');
  if (!raw) return {};
  try { return JSON.parse(raw); } catch { return {}; }
}
