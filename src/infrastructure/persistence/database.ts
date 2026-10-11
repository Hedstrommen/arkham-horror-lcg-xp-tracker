import Database from "better-sqlite3";

const CREATE_CAMPAIGNS_TABLE = `
  CREATE TABLE IF NOT EXISTS campaigns (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    campaign_name TEXT NOT NULL,
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
    notes TEXT
  )
`;

export function openDatabase(databaseFilePath: string): Database.Database {
  const database = new Database(databaseFilePath);
  database.exec(CREATE_CAMPAIGNS_TABLE);
  database.exec(CREATE_EXPERIENCE_ENTRIES_TABLE);
  return database;
}
