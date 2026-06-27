export type DifficultyType = 'Dễ' | 'Trung bình' | 'Khó';

export interface Formula {
  name: string;
  expression: string;
  variables: string[];
  description: string;
}

export interface ExampleExercise {
  question: string;
  solution: string;
  answer: string;
}

export interface Lesson {
  id: string;
  title: string;
  chapter: string;
  chapterId: number;
  summary: string;
  objectives: string[];
  theory: string[];
  formulas: Formula[];
  examples: ExampleExercise[];
  applications: string[];
  difficulty: DifficultyType;
}

export interface Question {
  id: string;
  lessonId?: string;
  questionText: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  points: number;
}

export interface Quiz {
  id: string;
  title: string;
  lessonIds: string[];
  questions: Question[];
  durationMinutes: number;
}

export interface QuizSession {
  quiz: Quiz;
  answers: Record<string, number>; // questionId -> selectedOptionIndex
  timeRemaining: number; // in seconds
  startTime: number; // timestamp
  isSubmitted: boolean;
  score: number;
  correctCount: number;
}

export interface HistoryRecord {
  id: string;
  quizTitle: string;
  date: string;
  score: number;
  totalQuestions: number;
  correctCount: number;
  timeSpentSeconds: number;
  answers: Record<string, number>;
  questions: Question[];
}

export interface DailyFact {
  title: string;
  content: string;
  author?: string;
}

export type HomeworkStatus = 'draft' | 'published' | 'archived';

export interface Homework {
  id: string;
  title: string;
  description?: string;
  lessonId?: string; // fallback or single lesson selection
  lessonIds?: string[]; // multiple selected lessons
  difficulty?: string;
  questions: Question[];
  totalPoints?: number;
  code: string;
  status: HomeworkStatus;
  isPasswordProtected: boolean;
  passwordHash?: string; // store text or basic hash
  timeLimitMinutes?: number;
  allowShowAnswers?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface HomeworkResult {
  id: string;
  homeworkId: string;
  homeworkCode: string;
  homeworkTitle: string;
  studentName: string;
  studentClass: string;
  score: number;
  correctCount: number;
  totalQuestions: number;
  submittedAt: string;
  answers: Record<string, number>; // questionId -> chosenOptionIndex
}

export interface AppUser {
  name: string;
  role: 'student' | 'teacher';
  studentClass?: string;
}

