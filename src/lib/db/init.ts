import { client } from "./index";

let initialized = false;

export async function ensureTablesExist() {
  if (initialized) return;
  try {
    await client.execute(`
      CREATE TABLE IF NOT EXISTS folders (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        parent_id TEXT,
        created_at INTEGER
      );
    `);

    await client.execute(`
      CREATE TABLE IF NOT EXISTS media (
        id TEXT PRIMARY KEY,
        folder_id TEXT,
        name TEXT NOT NULL,
        b2_key TEXT NOT NULL,
        b2_url TEXT NOT NULL,
        mime_type TEXT NOT NULL,
        size INTEGER NOT NULL,
        created_at INTEGER
      );
    `);
    initialized = true;
  } catch (err) {
    console.warn("Table auto-check warning:", err);
  }
}
