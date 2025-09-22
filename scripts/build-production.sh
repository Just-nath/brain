#!/bin/bash

# Production Build Script for Brains Quiz

set -e

echo "🧠 Building Brains Quiz for Production..."

# Create data directory
mkdir -p data

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Type check
echo "🔍 Running type check..."
npm run type-check

# Lint check
echo "🔧 Running lint check..."
npm run lint

# Build application
echo "🏗️ Building application..."
npm run build

# Create database if it doesn't exist
echo "🗄️ Setting up database..."
node -e "
const Database = require('better-sqlite3');
const path = require('path');
const dbPath = path.join(process.cwd(), 'data', 'brains.db');
const db = new Database(dbPath);

// Enable WAL mode
db.pragma('journal_mode = WAL');

// Create tables
db.exec(\`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fid INTEGER UNIQUE NOT NULL,
    username TEXT NOT NULL,
    display_name TEXT,
    pfp_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
\`);

db.exec(\`
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
\`);

db.exec(\`
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
\`);

// Create indexes
db.exec(\`
  CREATE INDEX IF NOT EXISTS idx_quiz_scores_user_fid ON quiz_scores(user_fid)
\`);

db.exec(\`
  CREATE INDEX IF NOT EXISTS idx_quiz_scores_created_at ON quiz_scores(created_at)
\`);

db.exec(\`
  CREATE INDEX IF NOT EXISTS idx_leaderboard_best_score ON leaderboard(best_score DESC)
\`);

console.log('✅ Database initialized successfully');
db.close();
"

echo "✅ Production build completed successfully!"
echo ""
echo "🚀 Ready to deploy with:"
echo "   npm start"
echo ""
echo "📊 Database location: ./data/brains.db"
echo "🌐 App will be available at: http://localhost:3000"


