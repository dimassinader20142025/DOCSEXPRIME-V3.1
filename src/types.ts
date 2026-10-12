export type Language = 'fr' | 'ar' | 'en';

export interface TranslationSet {
  title: string;
  subtitle: string;
  headerDesc: string;
  roleYouth: string;
  rolePro: string;
  roleYouthDesc: string;
  roleProDesc: string;
  menu: string;
  searchPlaceholder: string;
  allQuestions: string;
  popularQuestions: string;
  rubricsTitle: string;
  articlesTitle: string;
  chatAmelTitle: string;
  chatAmelDesc: string;
  chatInputPlaceholder: string;
  chatSend: string;
  anonymousQA: string;
  anonymousQADesc: string;
  askAnonymously: string;
  questionPlaceholder: string;
  submitQuestion: string;
  unansweredQuestions: string;
  answeredQuestions: string;
  answerThis: string;
  answerPlaceholder: string;
  submitAnswer: string;
  quizTitle: string;
  quizDesc: string;
  takeQuiz: string;
  startQuiz: string;
  mythsAndRealities: string;
  clinicianPortal: string;
  clinicianPortalDesc: string;
  proResources: string;
  proResourcesDesc: string;
  legalDisclaimer: string;
  home: string;
  search: string;
  chat: string;
  qa: string;
  quizzes: string;
  map: string;
  quickExit: string;
  bookmarks: string;
  authModalTitle: string;
  authModalDesc: string;
  authPasscodePlaceholder: string;
  authUnlock: string;
  authLock: string;
  exportData: string;
}

export type RubricId = 'body' | 'relations' | 'standards' | 'protection' | 'abuse';

export interface Rubric {
  id: RubricId;
  title: Record<Language, string>;
  description: Record<Language, string>;
  bgColor: string;
  imageUrl: string;
}

export interface Article {
  id: string;
  rubricId: RubricId;
  title: Record<Language, string>;
  summary: Record<Language, string>;
  content: Record<Language, string>;
  imageUrl: string;
  isVideo?: boolean;
  videoUrl?: string; // Short video URL or iframe embed
  references?: string; // Scientific references (APA format, DOI, PubMed, etc.)
  scientific?: boolean; // Flag to indicate if it is a clinical/scientific textbook article
}

export interface QAPair {
  id: string;
  question: string;
  answer?: string;
  createdAt: string;
  answeredAt?: string;
  language: Language;
  authorAge?: number;
  authorGender?: string;
  clinicalNote?: string; // Additional sexology context
}

export interface QuizQuestion {
  id: string;
  type: 'myth_reality' | 'multiple_choice';
  statement: Record<Language, string>;
  isMyth?: boolean; // for myth_reality
  options?: {
    id: string;
    text: Record<Language, string>;
  }[];
  correctOptionId?: string; // for multiple_choice
  explanation: Record<Language, string>; // Medical clinical sexology explanation
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}
