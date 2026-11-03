import path from 'node:path';
import fs from 'node:fs';
import Database from 'better-sqlite3';

const dataDirectory = path.resolve(__dirname, '../../data');
fs.mkdirSync(dataDirectory, { recursive: true });

const databasePath = path.join(dataDirectory, 'employees.sqlite');
const templatePath = path.join(dataDirectory, 'employees.template.sqlite');
if (!fs.existsSync(databasePath) && fs.existsSync(templatePath)) {
  fs.copyFileSync(templatePath, databasePath);
}

export const db = new Database(databasePath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
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

const userColumns = db.prepare('PRAGMA table_info(users)').all() as { name: string }[];
if (!userColumns.some((column) => column.name === 'profile_image')) {
  db.exec('ALTER TABLE users ADD COLUMN profile_image TEXT');
}

const seed = db.prepare('INSERT INTO employees (full_name, position, department) VALUES (?, ?, ?)');
const insertDemoEmployees = db.transaction(() => {
  const count = (db.prepare('SELECT COUNT(*) AS count FROM employees').get() as { count: number }).count;
  if (count > 0) return;
  [
    ['Анна Смирнова', 'Дизайнер продукта', 'Дизайн'],
    ['Михаил Иванов', 'Frontend-разработчик', 'Разработка'],
    ['Екатерина Петрова', 'Менеджер по продукту', 'Продукт'],
    ['Александр Кузнецов', 'Аналитик данных', 'Аналитика'],
    ['Мария Соколова', 'Специалист по маркетингу', 'Маркетинг'],
  ].forEach((employee) => seed.run(...employee));
});
insertDemoEmployees();
