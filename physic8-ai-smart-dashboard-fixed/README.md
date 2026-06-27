# Physic8 AI Smart Dashboard

Ứng dụng học tập và luyện tập Vật lí 8 bằng React + Vite + TypeScript, có kho bài tập, tạo mã bài, làm bài trực tuyến và trợ lý AI Gemini.

## Chạy local

```bash
npm install
npm run dev
```

Tạo file `.env.local` từ `.env.example` và thêm:

```env
GEMINI_API_KEY=your_gemini_api_key
```

Không đưa `GEMINI_API_KEY` lên GitHub.

## Deploy Vercel

Nếu `package.json` nằm ngay ở thư mục gốc repo thì Root Directory để `./`.

Environment Variables cần có:

```env
GEMINI_API_KEY=your_gemini_api_key
```

Có thể thêm tùy chọn:

```env
GEMINI_MODEL=gemini-2.5-flash
```

Dự án đã có serverless API cho Vercel:

- `api/generate-questions.ts`
- `api/chat-ai.ts`
- `api/ai-status.ts`

## Ghi chú sửa lỗi

- Không dùng `package-lock.json` rỗng từ AI Studio để tránh lỗi npm install.
- AI có chế độ fallback khi thiếu key hoặc model/API tạm lỗi.
- Mật khẩu bài làm mới được lưu dạng hash ở frontend mức demo; bài cũ lưu plain text vẫn được hỗ trợ để tương thích.
- Link `?code=XXXXXX` tự đưa học sinh vào màn hình nhập mã và nhận diện bài.
