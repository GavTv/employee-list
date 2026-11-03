import path from 'node:path';
import fs from 'node:fs';
import { Pool } from 'pg';
import Database from 'better-sqlite3';

const databaseUrl = process.env.DATABASE_URL;
const isPostgres = Boolean(databaseUrl);

let sqlite: Database.Database | undefined;
let postgres: Pool | undefined;
let initialization: Promise<void> | undefined;

function initializeSqlite() {
  const dataDirectory = path.resolve(__dirname, '../../data');
  fs.mkdirSync(dataDirectory, { recursive: true });

  const databasePath = path.join(dataDirectory, 'employees.sqlite');
  const templatePath = path.join(dataDirectory, 'employees.template.sqlite');
  if (!fs.existsSync(databasePath) && fs.existsSync(templatePath)) {
    fs.copyFileSync(templatePath, databasePath);
  }

  sqlite = new Database(databasePath);
  sqlite.pragma('journal_mode = WAL');
  sqlite.pragma('foreign_keys = ON');
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE COLLATE NOCASE,
      password_hash TEXT NOT NULL,
      profile_image TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS employees (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      full_name TEXT NOT NULL,
      position TEXT NOT NULL,
      department TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  const userColumns = sqlite.prepare('PRAGMA table_info(users)').all() as { name: string }[];
  if (!userColumns.some((column) => column.name === 'profile_image')) {
    sqlite.exec('ALTER TABLE users ADD COLUMN profile_image TEXT');
  }

  const count = (sqlite.prepare('SELECT COUNT(*) AS count FROM employees').get() as { count: number }).count;
  if (count === 0) {
    const seed = sqlite.prepare('INSERT INTO employees (full_name, position, department) VALUES (?, ?, ?)');
    const insertDemoEmployees = sqlite.transaction(() => demoEmployees.forEach((employee) => seed.run(...employee)));
    insertDemoEmployees();
  }
}

const demoEmployees = [
  ['Анна Смирнова', 'Дизайнер продукта', 'Дизайн'],
  ['Михаил Иванов', 'Frontend-разработчик', 'Разработка'],
  ['Екатерина Петрова', 'Менеджер по продукту', 'Продукт'],
  ['Александр Кузнецов', 'Аналитик данных', 'Аналитика'],
  ['Мария Соколова', 'Специалист по маркетингу', 'Маркетинг'],
] as const;

export function initializeDatabase(): Promise<void> {
  if (!initialization) {
    initialization = (async () => {
      if (!isPostgres) {
        initializeSqlite();
        return;
      }

      postgres = new Pool({ connectionString: databaseUrl, max: 5 });
      await postgres.query(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          email TEXT NOT NULL UNIQUE,
          password_hash TEXT NOT NULL,
          profile_image TEXT,
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS employees (
          id SERIAL PRIMARY KEY,
          full_name TEXT NOT NULL,
          position TEXT NOT NULL,
          department TEXT NOT NULL,
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
      `);
      await postgres.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_image TEXT');

      await postgres.query(
        `INSERT INTO employees (full_name, position, department)
         SELECT seed.full_name, seed.position, seed.department
         FROM (VALUES ${demoEmployees.map((_, index) => `($${index * 3 + 1}, $${index * 3 + 2}, $${index * 3 + 3})`).join(', ')})
           AS seed(full_name, position, department)
         WHERE NOT EXISTS (SELECT 1 FROM employees)`,
        demoEmployees.flat(),
      );
    })();
  }
  return initialization;
}

function toPostgresParameters(sql: string): string {
  let parameterIndex = 0;
  return sql.replace(/\?/g, () => `$${++parameterIndex}`);
}

export async function findMany<T>(sql: string, parameters: unknown[] = []): Promise<T[]> {
  await initializeDatabase();
  if (isPostgres) return (await postgres!.query(toPostgresParameters(sql), parameters)).rows as T[];
  return sqlite!.prepare(sql).all(...parameters) as T[];
}

export async function findOne<T>(sql: string, parameters: unknown[] = []): Promise<T | undefined> {
  await initializeDatabase();
  if (isPostgres) return (await postgres!.query(toPostgresParameters(sql), parameters)).rows[0] as T | undefined;
  return sqlite!.prepare(sql).get(...parameters) as T | undefined;
}

export async function execute(sql: string, parameters: unknown[] = []): Promise<void> {
  await initializeDatabase();
  if (isPostgres) {
    await postgres!.query(toPostgresParameters(sql), parameters);
    return;
  }
  sqlite!.prepare(sql).run(...parameters);
}

export async function insertId(sql: string, parameters: unknown[] = []): Promise<number> {
  await initializeDatabase();
  if (isPostgres) {
    const result = await postgres!.query(toPostgresParameters(sql), parameters);
    return Number(result.rows[0]?.id);
  }
  const row = sqlite!.prepare(sql).get(...parameters) as { id: number } | undefined;
  return Number(row?.id);
}
