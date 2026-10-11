import Database from "better-sqlite3";

const CREATE_USERS_TABLE = `
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL
  )
`;

const CREATE_CAMPAIGNS_TABLE = `
  CREATE TABLE IF NOT EXISTS campaigns (
    id TEXT PRIMARY KEY,
    owner_id TEXT NOT NULL REFERENCES users(id),
    title TEXT NOT NULL,
    notes TEXT,
    campaign_name TEXT NOT NULL,
    chapter INTEGER NOT NULL DEFAULT 1,
    friends TEXT NOT NULL,
    investigator_id TEXT NOT NULL,
    investigator_name TEXT NOT NULL,
    investigator_faction TEXT NOT NULL,
    is_active INTEGER NOT NULL,
    created_at TEXT NOT NULL
  )
`;

const CREATE_EXPERIENCE_ENTRIES_TABLE = `
  CREATE TABLE IF NOT EXISTS experience_entries (
    id TEXT PRIMARY KEY,
    campaign_id TEXT NOT NULL REFERENCES campaigns(id),
    experience_kind TEXT NOT NULL,
    experience_amount INTEGER NOT NULL,
    experience_title TEXT NOT NULL,
    notes TEXT
  )
`;

export function openDatabase(databaseFilePath: string): Database.Database {
  const database = new Database(databaseFilePath);
  database.exec(CREATE_USERS_TABLE);
  database.exec(CREATE_CAMPAIGNS_TABLE);
  database.exec(CREATE_EXPERIENCE_ENTRIES_TABLE);
  return database;
}
