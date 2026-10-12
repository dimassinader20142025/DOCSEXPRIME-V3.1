import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// Assure que le dossier data/ existe
const DATA_DIR = path.join(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_PATH = path.join(DATA_DIR, 'docsexprime.db');

export const db = new Database(DB_PATH);

// WAL mode = meilleures performances en lecture/écriture simultanées
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Initialisation des tables
db.exec(`
  CREATE TABLE IF NOT EXISTS questions (
    id          TEXT PRIMARY KEY,
    question    TEXT NOT NULL,
    answer      TEXT,
    language    TEXT NOT NULL DEFAULT 'fr',
    author_age  INTEGER,
    author_gender TEXT,
    clinical_note TEXT,
    created_at  TEXT NOT NULL,
    answered_at TEXT
  );

  CREATE TABLE IF NOT EXISTS articles (
    id          TEXT PRIMARY KEY,
    rubric_id   TEXT NOT NULL,
    title_fr    TEXT NOT NULL,
    title_ar    TEXT NOT NULL,
    title_en    TEXT NOT NULL,
    summary_fr  TEXT,
    summary_ar  TEXT,
    summary_en  TEXT,
    content_fr  TEXT NOT NULL,
    content_ar  TEXT NOT NULL,
    content_en  TEXT NOT NULL,
    image_url   TEXT,
    is_video    INTEGER DEFAULT 0,
    video_url   TEXT,
    "references" TEXT,
    scientific  INTEGER DEFAULT 0,
    created_at  TEXT NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_questions_created ON questions(created_at DESC);
  CREATE INDEX IF NOT EXISTS idx_articles_rubric   ON articles(rubric_id);
  CREATE INDEX IF NOT EXISTS idx_articles_created  ON articles(created_at DESC);
`);

console.log(`[DB] SQLite connecté → ${DB_PATH}`);

// ─── Helpers Questions ────────────────────────────────────────────────────────

export function getAllQuestions() {
  return db.prepare(`SELECT * FROM questions ORDER BY created_at DESC`).all() as DBQuestion[];
}

export function insertQuestion(q: {
  id: string;
  question: string;
  language: string;
  authorAge?: number;
  authorGender?: string;
  createdAt: string;
}) {
  db.prepare(`
    INSERT INTO questions (id, question, language, author_age, author_gender, created_at)
    VALUES (@id, @question, @language, @authorAge, @authorGender, @createdAt)
  `).run({
    id: q.id,
    question: q.question,
    language: q.language,
    authorAge: q.authorAge ?? null,
    authorGender: q.authorGender ?? null,
    createdAt: q.createdAt,
  });
}

export function answerQuestion(id: string, answer: string, clinicalNote: string | null, answeredAt: string) {
  const info = db.prepare(`
    UPDATE questions
    SET answer = @answer, clinical_note = @clinicalNote, answered_at = @answeredAt
    WHERE id = @id
  `).run({ id, answer, clinicalNote, answeredAt });
  return info.changes > 0;
}

// ─── Helpers Articles ─────────────────────────────────────────────────────────

export function getAllArticles() {
  return db.prepare(`SELECT * FROM articles ORDER BY created_at DESC`).all() as DBArticle[];
}

export function insertArticle(a: DBArticle) {
  db.prepare(`
    INSERT INTO articles (
      id, rubric_id,
      title_fr, title_ar, title_en,
      summary_fr, summary_ar, summary_en,
      content_fr, content_ar, content_en,
      image_url, is_video, video_url,
      "references", scientific, created_at
    ) VALUES (
      @id, @rubric_id,
      @title_fr, @title_ar, @title_en,
      @summary_fr, @summary_ar, @summary_en,
      @content_fr, @content_ar, @content_en,
      @image_url, @is_video, @video_url,
      @references, @scientific, @created_at
    )
  `).run(a);
}

export function deleteArticle(id: string): boolean {
  const info = db.prepare(`DELETE FROM articles WHERE id = @id`).run({ id });
  return info.changes > 0;
}

// ─── Types internes DB ────────────────────────────────────────────────────────

export interface DBQuestion {
  id: string;
  question: string;
  answer: string | null;
  language: string;
  author_age: number | null;
  author_gender: string | null;
  clinical_note: string | null;
  created_at: string;
  answered_at: string | null;
}

export interface DBArticle {
  id: string;
  rubric_id: string;
  title_fr: string;
  title_ar: string;
  title_en: string;
  summary_fr: string | null;
  summary_ar: string | null;
  summary_en: string | null;
  content_fr: string;
  content_ar: string;
  content_en: string;
  image_url: string | null;
  is_video: number;
  video_url: string | null;
  references: string | null;
  scientific: number;
  created_at: string;
}
