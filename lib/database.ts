import Database from 'better-sqlite3'
import path from 'path'
import { existsSync, mkdirSync } from 'fs'

// Create data directory if it doesn't exist
const dataDir = path.join(process.cwd(), 'data')
if (!existsSync(dataDir)) {
  mkdirSync(dataDir, { recursive: true })
}

const dbPath = path.join(dataDir, 'brains.db')
const db = new Database(dbPath)

// Enable WAL mode for better concurrent access
db.pragma('journal_mode = WAL')

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fid INTEGER UNIQUE NOT NULL,
    username TEXT NOT NULL,
    display_name TEXT,
    pfp_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`)

db.exec(`
  CREATE TABLE IF NOT EXISTS quiz_scores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_fid INTEGER NOT NULL,
    score INTEGER NOT NULL,
    total_questions INTEGER NOT NULL,
    percentage REAL NOT NULL,
    time_taken INTEGER NOT NULL,
    quiz_data TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_fid) REFERENCES users(fid)
  )
`)

db.exec(`
  CREATE TABLE IF NOT EXISTS leaderboard (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_fid INTEGER NOT NULL,
    best_score INTEGER NOT NULL,
    best_percentage REAL NOT NULL,
    total_quizzes INTEGER DEFAULT 1,
    last_quiz_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_fid) REFERENCES users(fid),
    UNIQUE(user_fid)
  )
`)

// Create indexes for better performance
db.exec(`
  CREATE INDEX IF NOT EXISTS idx_quiz_scores_user_fid ON quiz_scores(user_fid)
`)

db.exec(`
  CREATE INDEX IF NOT EXISTS idx_quiz_scores_created_at ON quiz_scores(created_at)
`)

db.exec(`
  CREATE INDEX IF NOT EXISTS idx_leaderboard_best_score ON leaderboard(best_score DESC)
`)

// Prepared statements for better performance
export const statements = {
  // User operations
  insertUser: db.prepare(`
    INSERT OR REPLACE INTO users (fid, username, display_name, pfp_url, updated_at)
    VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
  `),
  
  getUser: db.prepare(`
    SELECT * FROM users WHERE fid = ?
  `),
  
  // Quiz score operations
  insertQuizScore: db.prepare(`
    INSERT INTO quiz_scores (user_fid, score, total_questions, percentage, time_taken, quiz_data)
    VALUES (?, ?, ?, ?, ?, ?)
  `),
  
  getUserScores: db.prepare(`
    SELECT * FROM quiz_scores WHERE user_fid = ? ORDER BY created_at DESC LIMIT ?
  `),
  
  // Leaderboard operations
  updateLeaderboard: db.prepare(`
    INSERT INTO leaderboard (user_fid, best_score, best_percentage, total_quizzes, last_quiz_date)
    VALUES (?, ?, ?, 1, CURRENT_TIMESTAMP)
    ON CONFLICT(user_fid) DO UPDATE SET
      best_score = CASE WHEN excluded.best_score > leaderboard.best_score THEN excluded.best_score ELSE leaderboard.best_score END,
      best_percentage = CASE WHEN excluded.best_percentage > leaderboard.best_percentage THEN excluded.best_percentage ELSE leaderboard.best_percentage END,
      total_quizzes = leaderboard.total_quizzes + 1,
      last_quiz_date = CURRENT_TIMESTAMP,
      updated_at = CURRENT_TIMESTAMP
  `),
  
  getLeaderboard: db.prepare(`
    SELECT 
      l.*,
      u.username,
      u.display_name,
      u.pfp_url
    FROM leaderboard l
    JOIN users u ON l.user_fid = u.fid
    ORDER BY l.best_score DESC, l.best_percentage DESC, l.last_quiz_date ASC
    LIMIT ?
  `),
  
  getUserRank: db.prepare(`
    SELECT COUNT(*) + 1 as rank
    FROM leaderboard
    WHERE best_score > (SELECT best_score FROM leaderboard WHERE user_fid = ?)
       OR (best_score = (SELECT best_score FROM leaderboard WHERE user_fid = ?) 
           AND best_percentage > (SELECT best_percentage FROM leaderboard WHERE user_fid = ?))
       OR (best_score = (SELECT best_score FROM leaderboard WHERE user_fid = ?) 
           AND best_percentage = (SELECT best_percentage FROM leaderboard WHERE user_fid = ?)
           AND last_quiz_date < (SELECT last_quiz_date FROM leaderboard WHERE user_fid = ?))
  `)
}

export interface User {
  id: number
  fid: number
  username: string
  display_name?: string
  pfp_url?: string
  created_at: string
  updated_at: string
}

export interface QuizScore {
  id: number
  user_fid: number
  score: number
  total_questions: number
  percentage: number
  time_taken: number
  quiz_data: string
  created_at: string
}

export interface LeaderboardEntry {
  id: number
  user_fid: number
  best_score: number
  best_percentage: number
  total_quizzes: number
  last_quiz_date: string
  created_at: string
  updated_at: string
  username: string
  display_name?: string
  pfp_url?: string
}

export default db

