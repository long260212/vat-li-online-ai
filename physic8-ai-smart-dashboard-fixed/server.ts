import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = Number(process.env.PORT || 3000);

function normalizeApiKey(value?: string | null): string | null {
  const key = value?.trim();
  if (!key) return null;
  const placeholders = new Set([
    'MY_GEMINI_API_KEY',
    'YOUR_GEMINI_API_KEY',
    'your_gemini_api_key',
    'AIzaSy...'
  ]);
  return placeholders.has(key) ? null : key;
}

function getGeminiApiKey(): string | null {
  return normalizeApiKey(process.env.GEMINI_API_KEY) || normalizeApiKey(process.env.GOOGLE_API_KEY);
}

function getGeminiModelCandidates(): string[] {
  return Array.from(new Set([
    process.env.GEMINI_MODEL?.trim(),
    'gemini-2.5-flash',
    'gemini-2.0-flash'
  ].filter(Boolean) as string[]));
}

async function generateGeminiContent(aiClient: GoogleGenAI, request: any) {
  let lastError: any = null;
  for (const model of getGeminiModelCandidates()) {
    try {
      return await aiClient.models.generateContent({
        ...request,
        model
      });
    } catch (error: any) {
      lastError = error;
      console.error(`Gemini model ${model} failed:`, error?.message || error);
    }
  }
  throw lastError || new Error('No Gemini model candidate could generate a response');
}

function buildChatFallbackReply(messages: any[], lessonTitle?: string, errorMessage?: string): string {
  const lastUserMsg = String(messages?.[messages.length - 1]?.content || '').trim();
  const topic = lessonTitle ? `bài **${lessonTitle}**` : 'chương trình **Vật lí 8**';
  const connectionNote = errorMessage
    ? `

> Ghi chú kỹ thuật: AI thật chưa phản hồi ổn định (${errorMessage}). Hệ thống đang dùng phản hồi dự phòng để buổi học không bị gián đoạn.`
    : '';

  if (!lastUserMsg) {
    return `Thầy/Cô đã sẵn sàng hỗ trợ em ôn tập ${topic}. Em hãy gửi câu hỏi, công thức hoặc bài tập cụ thể nhé.${connectionNote}`;
  }

  return `Thầy/Cô đã nhận được câu hỏi của em: **${lastUserMsg}**

Với ${topic}, em nên làm theo 3 bước:
1. Xác định hiện tượng hoặc đại lượng đang được hỏi.
2. Ghi công thức/định luật liên quan trước khi thay số.
3. Kiểm tra đơn vị đo và kết luận bằng câu đầy đủ.

Em có thể gửi thêm dữ kiện của bài toán để Thầy/Cô hướng dẫn chi tiết từng bước.${connectionNote}`;
}

// Initialize Gemini Client Lazily
let cachedAiClient: GoogleGenAI | null = null;
let lastUsedKey: string | null = null;

function getAiClient(): GoogleGenAI {
  const key = getGeminiApiKey();
  if (!key) {
    throw new Error("Missing GEMINI_API_KEY on server");
  }
  
  if (!cachedAiClient || lastUsedKey !== key) {
    cachedAiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
    lastUsedKey = key;
    console.log("Gemini Client initialized successfully on backend.");
  }
  return cachedAiClient;
}

// API endpoint to generate high-quality physics questions
app.post("/api/generate-questions", async (req, res) => {
  const { topic, difficulty, count } = req.body;

  const reqCount = Math.min(Math.max(Number(count) || 3, 1), 10);
  const reqTopic = topic || "Tổng hợp Vật lí 8";
  const reqDifficulty = difficulty || "Trung bình";

  console.log(`Generating ${reqCount} questions for Topic: ${reqTopic}, Difficulty: ${reqDifficulty}`);

  // Fallback physics questions if Gemini is unavailable
  const fallbackQuestions = [
    {
      id: `fallback-${Date.now()}-1`,
      questionText: `Khi xe phanh gấp, hành khách trên xe bị xô về phía trước là do hiện tượng nào liên quan đến ${reqTopic}?`,
      options: [
        "Quán tính của cơ thể giữ trạng thái chuyển động cũ.",
        "Trọng lực tác dụng lên hành khách.",
        "Lực ma sát giữa lốp xe và mặt đường.",
        "Sự cản trở của không khí bên trong xe."
      ],
      correctAnswerIndex: 0,
      explanation: "Theo quán tính, khi xe phanh gấp, phần thân dưới dừng lại cùng xe nhưng phần thân trên vẫn tiếp tục chuyển động về phía trước theo vận tốc cũ.",
      points: 2
    },
    {
      id: `fallback-${Date.now()}-2`,
      questionText: `Công thức tính áp suất chất lỏng tại một điểm ở độ sâu h là gì?`,
      options: [
        "p = F / S",
        "p = d * h",
        "p = d * V",
        "p = P / S"
      ],
      correctAnswerIndex: 1,
      explanation: "Công thức tính áp suất chất lỏng ở độ sâu h so với mặt thoáng là p = d * h, trong đó d là trọng lượng riêng của chất lỏng.",
      points: 2
    },
    {
      id: `fallback-${Date.now()}-3`,
      questionText: `Nhiệt năng của một vật tăng lên khi vật thực hiện hành động nào sau đây?`,
      options: [
        "Đặt vật vào tủ lạnh.",
        "Cọ xát vật lên một bề mặt khác.",
        "Để vật yên lặng trên bàn.",
        "Mang vật lên độ cao lớn hơn."
      ],
      correctAnswerIndex: 1,
      explanation: "Cọ xát vật là cách thực hiện công làm biến đổi nhiệt năng của vật, khiến nhiệt độ của vật tăng lên và nhiệt năng tăng.",
      points: 2
    }
  ];

  try {
    const aiClient = getAiClient();
    const prompt = `Hãy tạo ${reqCount} câu hỏi trắc nghiệm Vật lí lớp 8 THCS về chủ đề "${reqTopic}" với mức độ khó "${reqDifficulty}".
    Mỗi câu hỏi phải bao gồm chính xác 4 đáp án lựa chọn (A, B, C, D) bằng tiếng Việt.
    Hãy đảm bảo các câu hỏi mang tính khoa học cao, sát thực tế, có hình thức chuẩn mực và đi kèm lời giải thích đầy đủ dễ hiểu cho học sinh THCS.`;

    const response = await generateGeminiContent(aiClient, {
      contents: prompt,
      config: {
        systemInstruction: "Bạn là một giáo sư Vật lí và là chuyên gia biên soạn đề thi trắc nghiệm Vật lí lớp 8 THCS theo chương trình giáo dục Việt Nam. Bạn luôn tạo ra các câu hỏi thông minh, sáng tạo, không lỗi khoa học và có giải thích đáp án cặn kẽ.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          description: "Danh sách các câu hỏi vật lí được tạo ra.",
          items: {
            type: Type.OBJECT,
            properties: {
              id: {
                type: Type.STRING,
                description: "Mã định danh duy nhất ví dụ: ai-q-1, ai-q-2..."
              },
              questionText: {
                type: Type.STRING,
                description: "Nội dung câu hỏi trắc nghiệm Vật lí 8."
              },
              options: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Danh sách 4 lựa chọn đáp án."
              },
              correctAnswerIndex: {
                type: Type.INTEGER,
                description: "Chỉ số của đáp án đúng (từ 0 đến 3)."
              },
              explanation: {
                type: Type.STRING,
                description: "Lời giải thích khoa học chi tiết vì sao đáp án đó đúng."
              },
              points: {
                type: Type.INTEGER,
                description: "Số điểm cho câu hỏi này, thường là 2."
              }
            },
            required: ["id", "questionText", "options", "correctAnswerIndex", "explanation", "points"]
          }
        },
        temperature: 0.7
      }
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error("Received empty response from Gemini API");
    }

    const generatedQuestions = JSON.parse(responseText);
    return res.json({
      success: true,
      source: "gemini",
      questions: generatedQuestions
    });

  } catch (error: any) {
    console.error("Gemini question generation error:", error);
    if (error.message && error.message.includes("Missing GEMINI_API_KEY")) {
      return res.json({
        success: true,
        source: "fallback-missing-key",
        message: "Chưa cấu hình GEMINI_API_KEY trên server. Hệ thống đang dùng câu hỏi mẫu dự phòng.",
        questions: fallbackQuestions.slice(0, reqCount)
      });
    }
    return res.json({
      success: true,
      source: "fallback-error",
      message: `Đã xảy ra lỗi khi kết nối AI: ${error.message || error}. Đang hiển thị câu hỏi mẫu dự phòng.`,
      questions: fallbackQuestions.slice(0, reqCount)
    });
  }
});

// API endpoint to chat with AI to discuss physics lessons
app.post("/api/chat-ai", async (req, res) => {
  const { messages, systemInstruction, lessonTitle, lessonSummary, lessonTheory } = req.body;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: "Messages array is required and cannot be empty." });
  }

  // Check if API key is available
  const hasKey = !!getGeminiApiKey();

  if (!hasKey) {
    const lastUserMsg = messages[messages.length - 1]?.content || "";
    let mockReply = "";
    const lowerMsg = lastUserMsg.toLowerCase();

    if (lowerMsg.includes("lộ trình") || lowerMsg.includes("lo trinh") || lowerMsg.includes("kế hoạch") || lowerMsg.includes("roadmap")) {
      // Determine what type of roadmap based on keywords
      let goalTitle = "Bứt phá điểm 8+ học kỳ";
      let weeksDetail = "";

      if (lowerMsg.includes("học sinh giỏi") || lowerMsg.includes("hsg") || lowerMsg.includes("nâng cao") || lowerMsg.includes("advanced")) {
        goalTitle = "Chinh phục Học sinh giỏi & Chuyên Lý";
        weeksDetail = `### Tuần 1: Chuyển động cơ học nâng cao & Đồ thị vận tốc
- **Kiến thức**: Biểu diễn vận tốc bằng vectơ, bài toán gặp nhau của hai vật chuyển động ngược chiều/cùng chiều, đồ thị tọa độ - thời gian nâng cao.
- **Công thức cốt lõi**: v_tb = (s1 + s2) / (t1 + t2). Bài toán hai vật gặp nhau: s1 + s2 = S hoặc |s1 - s2| = S.
- **Bài tập điển hình**: Bài toán hai xe xuất phát lệch giờ, chuyển động tròn đều xung quanh hồ nước.
- **Mẹo nhớ**: Luôn chọn hệ quy chiếu và mốc thời gian rõ ràng trước khi lập phương trình chuyển động.

### Tuần 2: Áp suất chất lỏng & Bình thông nhau phức tạp
- **Kiến thức**: Sự cân bằng chất lỏng trong bình thông nhau chứa nhiều chất lỏng không hòa tan (nước, dầu, thủy ngân), áp suất khí quyển đo bằng cột thủy ngân Torricelli.
- **Công thức cốt lõi**: p = d1.h1 + d2.h2. Áp suất tại các điểm trên cùng mặt phẳng nằm ngang trong cùng một chất lỏng đứng yên thì bằng nhau.
- **Bài tập điển hình**: Tính độ chênh lệch mặt thoáng giữa hai nhánh bình thông nhau khi đổ thêm dầu vào một nhánh.
- **Mẹo nhớ**: Xác định mặt phẳng phân giới giữa các chất lỏng để áp dụng công thức bằng nhau của áp suất.

### Tuần 3: Lực đẩy Ác-si-mét nâng cao & Sự nổi của vật rỗng
- **Kiến thức**: Lực đẩy Ác-si-mét tác dụng lên vật có hình dạng phức tạp, điều kiện cân bằng của vật nổi, bài toán quả cầu rỗng hoặc vật liên kết (nối bằng dây).
- **Công thức cốt lõi**: F_A = d.V. Khi vật nổi: P = F_A => d_vat.V_vat = d_long.V_chim.
- **Bài tập điển hình**: Quả cầu kim loại rỗng nổi trên mặt nước, tính thể tích phần rỗng tối thiểu để vật nổi.
- **Mẹo nhớ**: Phân tích kỹ các lực tác dụng lên vật (Trọng lực, Lực đẩy Ác-si-mét, Lực căng dây) và lập phương trình cân bằng lực.

### Tuần 4: Công cơ học, Máy cơ đơn giản nâng cao & Hiệu suất
- **Kiến thức**: Quy tắc vàng về công áp dụng cho hệ thống palăng phức tạp, đòn bẩy không cân bằng, mặt phẳng nghiêng có ma sát, tính hiệu suất của máy cơ đơn giản.
- **Công thức cốt lõi**: H = A_ich / A_toanphan * 100%. A_ich = P.h, A_hao_phi = F_ms.s.
- **Bài tập điển hình**: Hệ thống ròng rọc động kết hợp ròng rọc cố định nâng vật nặng trong công trường, tính lực kéo thực tế khi có lực cản.
- **Mẹo nhớ**: Định luật về công: Không một máy cơ đơn giản nào cho ta lợi về công. Lợi bao nhiêu lần về lực thì thiệt bấy nhiêu lần về đường đi.`;
      } else if (lowerMsg.includes("mất gốc") || lowerMsg.includes("căn bản") || lowerMsg.includes("yếu") || lowerMsg.includes("recovery")) {
        goalTitle = "Lấy lại căn bản Vật lí 8 (Cực nhanh & Tinh gọn)";
        weeksDetail = `### Tuần 1: Chuyển động cơ học & Vận tốc cơ bản
- **Kiến thức**: Nhận biết chuyển động/đứng yên so với vật mốc. Tìm hiểu vận tốc biểu thị mức độ nhanh hay chậm của chuyển động.
- **Công thức cốt lõi**: v = s / t (vận tốc = quãng đường chia thời gian).
- **Bài tập điển hình**: Đổi đơn vị vận tốc từ km/h sang m/s (chia cho 3,6) và ngược lại (nhân cho 3,6). Tính thời gian đi học của học sinh.
- **Mẹo nhớ**: Đảm bảo quãng đường (s) và thời gian (t) phải cùng đơn vị đo trước khi chia (m tương ứng với giây, km tương ứng với giờ).

### Tuần 2: Áp suất & Áp suất chất lỏng cơ bản
- **Kiến thức**: Khái niệm áp lực là lực ép vuông góc lên bề mặt. Hiểu tại sao đinh phải nhọn, xẻng phải sắc. Áp suất chất lỏng tăng dần theo độ sâu.
- **Công thức cốt lõi**: p = F / S (áp suất bằng áp lực chia diện tích bị ép), p = d.h (áp suất chất lỏng).
- **Bài tập điển hình**: Tính áp suất của một người đứng bằng hai chân lên mặt đất. Tính áp suất nước tác dụng lên thợ lặn ở độ sâu 15m.
- **Mẹo nhớ**: Diện tích S phải đổi ra đơn vị mét vuông (m²). Hãy nhớ: 1 cm² = 0.0001 m².

### Tuần 3: Lực đẩy Ác-si-mét & Sự nổi cơ bản
- **Kiến thức**: Mọi vật nhúng trong chất lỏng đều chịu lực đẩy hướng từ dưới lên gọi là lực đẩy Ác-si-mét. Điều kiện vật nổi, vật lơ lửng, vật chìm.
- **Công thức cốt lõi**: F_A = d.V (d là trọng lượng riêng chất lỏng, V là thể tích phần chìm).
- **Bài tập điển hình**: Tính lực đẩy Ác-si-mét tác dụng lên khối gỗ chìm hoàn toàn trong nước. Giải thích tại sao tàu sắt nổi được còn cây đinh sắt lại chìm.
- **Mẹo nhớ**: Thể tích V trong công thức là thể tích của phần vật chìm trong chất lỏng, không phải luôn là thể tích toàn bộ vật.

### Tuần 4: Cơ năng & Sự chuyển hóa năng lượng cơ bản
- **Kiến thức**: Vật có khả năng sinh công thì vật đó có cơ năng. Phân biệt Động năng (do chuyển động mà có) và Thế năng (do độ cao hoặc biến dạng đàn hồi).
- **Bài tập điển hình**: Nhận biết các dạng cơ năng của vật đang rơi, con lắc đang dao động, cung tên đang giương.
- **Mẹo nhớ**: Vật ở vị trí càng cao thì thế năng càng lớn; vật chuyển động càng nhanh thì động năng càng lớn. Khi vật rơi, thế năng chuyển hóa dần thành động năng.`;
      } else if (lowerMsg.includes("cấp tốc") || lowerMsg.includes("ôn thi") || lowerMsg.includes("nhanh") || lowerMsg.includes("fast")) {
        goalTitle = "Ôn thi cấp tốc trước kỳ thi (Hệ thống hóa 1-2 tuần)";
        weeksDetail = `### Chặng 1: Hệ thống hóa toàn bộ công thức Cơ học (Ngày 1 - 3)
- **Công thức trọng tâm**:
  - Vận tốc trung bình: v_tb = S / t_tong
  - Áp suất rắn: p = F / S
  - Áp suất chất lỏng: p = d * h
  - Lực đẩy Ác-si-mét: F_A = d * V_chim
  - Công cơ học: A = F * s
  - Công suất: P = A / t
- **Bài tập rèn luyện**: Giải các câu hỏi lý thuyết trắc nghiệm nhanh để nhớ định nghĩa và đơn vị đo chuẩn của từng đại lượng (Pa, N, J, W).

### Chặng 2: Hệ thống hóa toàn bộ công thức Nhiệt học (Ngày 4 - 6)
- **Công thức trọng tâm**:
  - Công thức tính nhiệt lượng: Q = m * c * Δt
  - Phương trình cân bằng nhiệt: Q_toa = Q_thu
  - Năng suất tỏa nhiệt của nhiên liệu: Q = q * m
- **Bài tập rèn luyện**: Giải bài toán pha nước nóng lạnh, tìm nhiệt độ cân bằng cuối cùng của hỗn hợp.

### Chặng 3: Giải đề thi thử tổng hợp & Rà soát lỗ hổng (Ngày 7 - 10)
- **Phương pháp**: Làm 3-5 đề thi thử học kỳ có cấu trúc chuẩn (70% trắc nghiệm, 30% tự luận). Nhận diện các lỗi sai thường gặp về đổi đơn vị hoặc đọc sai đề bài.
- **Mẹo phòng thi**: Đọc kỹ câu hỏi, làm câu dễ trước, câu khó sau. Luôn viết công thức tổng quát trước khi thay số tính toán.`;
      } else {
        goalTitle = "Bứt phá điểm số 8+ học kỳ";
        weeksDetail = `### Tuần 1: Chuyển động cơ học & Biểu diễn lực
- **Kiến thức**: Chuyển động cơ học, vận tốc trung bình của chuyển động không đều, biểu diễn lực bằng mũi tên, sự cân bằng lực và quán tính.
- **Công thức cốt lõi**: v = s / t; v_tb = (s1 + s2) / (t1 + t2).
- **Bài tập điển hình**: Tính vận tốc trung bình trên cả quãng đường gồm hai chặng đi với vận tốc khác nhau. Biểu diễn trọng lực tác dụng lên vật nặng 5kg.
- **Mẹo nhớ**: Khi tính v_tb, tuyệt đối không lấy trung bình cộng hai vận tốc, mà phải tính tổng quãng đường chia cho tổng thời gian tương ứng.

### Tuần 2: Áp suất (Chất rắn & Chất lỏng)
- **Kiến thức**: Khái niệm áp suất, cách tăng/giảm áp suất trong thực tế. Áp suất chất lỏng và ứng dụng trong bình thông nhau, máy nén thủy lực.
- **Công thức cốt lõi**: p = F / S; p = d.h. Máy nén thủy lực: F / f = S / s.
- **Bài tập điển hình**: Tính áp suất tác dụng lên đáy bình chứa nước. Tính lực nâng của piston lớn khi tác dụng lực lên piston nhỏ.
- **Mẹo nhớ**: Đổi diện tích S từ cm², dm² ra m² một cách chính xác trước khi tính toán.

### Tuần 3: Lực đẩy Ác-si-mét & Công cơ học
- **Kiến thức**: Lực đẩy Ác-si-mét, sự nổi của các vật. Khái niệm công cơ học và công thức tính công khi lực cùng hướng chuyển động.
- **Công thức cốt lõi**: F_A = d.V; A = F.s.
- **Bài tập điển hình**: Tính lực đẩy Ác-si-mét tác dụng lên vật chìm hoàn toàn hoặc chìm một phần. Tính công của lực kéo kéo gạch lên cao.
- **Mẹo nhớ**: Chỉ có công cơ học khi có lực tác dụng và làm vật di chuyển theo phương không vuông góc với lực.

### Tuần 4: Công suất, Cơ năng & Ôn tập Nhiệt lượng
- **Kiến thức**: Ý nghĩa của công suất, phân biệt thế năng và động năng, công thức tính nhiệt lượng thu vào để nóng lên.
- **Công thức cốt lõi**: P = A / t; Q = m.c.Δt.
- **Bài tập điển hình**: Tính công suất của một động cơ nâng vật nặng. Tính nhiệt lượng cần truyền cho ấm nước nhôm nặng 0.5kg chứa 2 lít nước để sôi.
- **Mẹo nhớ**: Đảm bảo đổi thể tích nước sang khối lượng (1 lít nước tương đương 1 kg nước) trước khi tính Q.`;
      }

      mockReply = `Chào em! Thầy/Cô rất vui được đồng hành cùng em xây dựng lộ trình học tập hiệu quả.

Hiện tại hệ thống đang ở chế độ **Offline dự phòng** do chưa cấu hình API Key, tuy dưới đây là **Lộ trình học tập Vật lí 8 cá nhân hóa** được Thầy/Cô biên soạn vô cùng chi tiết nhằm giúp em đạt mục tiêu **${goalTitle}**:

---

## 🗺️ LỘ TRÌNH CHI TIẾT TRONG 4 TUẦN

${weeksDetail}

---

## 💡 LỜI KHUYÊN ĐỂ HỌC TỐT VẬT LÍ 8:
1. **Lý thuyết gắn liền thực tiễn**: Đừng học vẹt công thức. Hãy tự giải thích các hiện tượng đời thường (ví dụ: tại sao lốp xe đạp bơm căng để ngoài nắng lại dễ nổ? -> Áp suất khí quyển & giãn nở nhiệt).
2. **Luyện tập vẽ sơ đồ lực**: Khi làm bài tập lực đẩy Ác-si-mét hoặc sự nổi, luôn vẽ hình biểu diễn các lực (Trọng lực P hướng xuống, F_A hướng lên) để tránh bỏ sót lực.
3. **Thường xuyên làm bài tự luyện**: Hãy vào mục **Bài tập tự luyện** hoặc **Tạo đề thi trắc nghiệm bằng AI** trên ứng dụng này để kiểm tra ngay mức độ hiểu bài của mình nhé!`;
    } else if (lowerMsg.includes("áp suất") || lowerMsg.includes("ap suat")) {
      mockReply = "Chào em! Áp suất là đại lượng đặc trưng cho tác dụng của áp lực lên diện tích bị ép.\n\nCông thức tính áp suất chung là: **p = F / S**, trong đó F là áp lực (N), S là diện tích bị ép (m²), và p là áp suất (N/m² hoặc Pa).\n\nĐối với chất lỏng, áp suất tại độ sâu h được tính bằng: **p = d * h**, với d là trọng lượng riêng của chất lỏng. Em có câu hỏi hay bài tập cụ thể nào cần Thầy giải thích thêm không?";
    } else if (lowerMsg.includes("ác-si-mét") || lowerMsg.includes("ac-si-met") || lowerMsg.includes("lực đẩy") || lowerMsg.includes("luc day")) {
      mockReply = "Chào em! Lực đẩy Ác-si-mét là lực tác dụng bởi chất lỏng (hoặc chất khí) lên một vật nhúng trong nó, hướng thẳng đứng từ dưới lên trên.\n\nCông thức tính lực đẩy Ác-si-mét là: **F_A = d * V**, trong đó:\n- **d** là trọng lượng riêng của chất lỏng (N/m³)\n- **V** là thể tích phần chất lỏng bị vật chiếm chỗ (m³)\n\n*Lưu ý:* Khi vật nổi lơ lửng trên mặt thoáng, lực đẩy Ác-si-mét bằng đúng trọng lượng P của vật đó em nhé!";
    } else if (lowerMsg.includes("công") || lowerMsg.includes("cong co hoc") || lowerMsg.includes("công suất")) {
      mockReply = "Chào em! Trong Vật lí, ta chỉ có công cơ học khi có lực tác dụng vào vật và làm vật dịch chuyển theo phương không vuông góc với lực.\n\nCông thức tính công cơ học là: **A = F * s**.\n- **A**: Công cơ học (J)\n- **F**: Lực tác dụng (N)\n- **s**: Quãng đường dịch chuyển (m)\n\nCòn **Công suất** đặc trưng cho tốc độ thực hiện công, tính bằng: **P = A / t** (W hoặc HP).";
    } else if (lowerMsg.includes("nhiệt") || lowerMsg.includes("nhiệt lượng") || lowerMsg.includes("can bang nhiet") || lowerMsg.includes("cân bằng")) {
      mockReply = "Chào em! Về phần Nhiệt học Vật lí 8, chúng ta có công thức tính nhiệt lượng thu vào để nóng lên: **Q = m * c * Δt**.\n\nKhi có sự trao đổi nhiệt giữa hai vật, ta áp dụng **Phương trình cân bằng nhiệt**: **Q_tỏa = Q_thu**.\n- Vật có nhiệt độ cao hơn tỏa ra nhiệt lượng: Q_tỏa = m1 * c1 * (t1 - t_cb)\n- Vật có nhiệt độ thấp hơn thu vào nhiệt lượng: Q_thu = m2 * c2 * (t_cb - t2)\n\nEm có bài tập cân bằng nhiệt nào cần hỗ trợ không?";
    } else {
      mockReply = `Chào em! Thầy/Cô rất vui được đồng hành cùng em học tốt Vật lí 8.

Hiện tại hệ thống chưa cấu hình **GEMINI_API_KEY** trong phần **Settings > Secrets**, nên Thầy/Cô đang phản hồi ở chế độ offline dự phòng. 

Tuy nhiên, em vẫn có thể trao đổi về các bài học trọng tâm như:
- **Chuyển động cơ học, Vận tốc**
- **Áp suất chất lỏng & Áp suất khí quyển**
- **Lực đẩy Ác-si-mét & Sự nổi**
- **Công cơ học, Công suất, Cơ năng**
- **Nhiệt năng, Nhiệt lượng & Cân bằng nhiệt**

Ngoài ra, em có thể trải nghiệm **Tạo Lộ trình học tập AI** ở góc trái màn hình để Thầy/Cô phác thảo kế hoạch ôn luyện chuyên sâu cho em nhé!`;
    }

    return res.json({
      success: true,
      source: "mock",
      reply: mockReply
    });
  }

  let aiClient;
  try {
    aiClient = getAiClient();
  } catch (err: any) {
    console.error("Gemini API Key missing on server:", err);
    return res.json({
      success: true,
      source: "mock",
      reply: buildChatFallbackReply(messages, lessonTitle, "Missing GEMINI_API_KEY on server")
    });
  }

  try {
    // Formulate final system instruction, optionally including selected lesson context
    let finalSystemInstruction = systemInstruction || "Bạn là một giáo viên dạy Vật lí lớp 8 trung học cơ sở thân thiện, uy tín, chuyên nghiệp. Bạn trả lời bằng tiếng Việt, hướng dẫn học sinh một cách dễ hiểu, có ví dụ thực tế và giải thích chi tiết.";

    if (lessonTitle) {
      finalSystemInstruction += `\n\n[Bối cảnh bài học hiện tại]: Học sinh đang xem bài học "${lessonTitle}".
Tóm tắt bài học: ${lessonSummary || "Chưa có"}
Lý thuyết chính: ${lessonTheory || "Chưa có"}.
Khi học sinh đặt câu hỏi, hãy cố gắng liên hệ câu trả lời chặt chẽ với kiến thức và ví dụ của bài học này để giúp học sinh nắm vững bài học hiện tại tốt nhất.`;
    }

    // Convert message history format for @google/genai SDK
    const contents = messages.map((m: any) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }]
    }));

    const response = await generateGeminiContent(aiClient, {
      contents: contents,
      config: {
        systemInstruction: finalSystemInstruction,
        temperature: 0.8
      }
    });

    const reply = response.text || "Xin lỗi em, Thầy vừa gặp sự cố nhỏ trong việc xử lý thông tin. Em hỏi lại được không?";
    return res.json({
      success: true,
      source: "gemini",
      reply: reply
    });

  } catch (error: any) {
    console.error("Gemini Chat API Error:", error);
    return res.json({
      success: true,
      source: "fallback-error",
      reply: buildChatFallbackReply(messages, lessonTitle, error.message || String(error)),
      message: `Lỗi kết nối AI: ${error.message || error}`
    });
  }
});

// API endpoint to check if Gemini is configured on the server
app.get("/api/ai-status", (req, res) => {
  const key = getGeminiApiKey();
  const isAvailable = !!key;
  res.json({
    success: true,
    isAvailable: isAvailable
  });
});

// Vite middleware configuration for full-stack App
async function initializeApp() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite development middleware integrated.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Production static file server integrated.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

initializeApp().catch((err) => {
  console.error("Failed to start the Express-Vite server:", err);
});
