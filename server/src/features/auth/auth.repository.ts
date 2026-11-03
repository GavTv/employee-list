import { db } from '../../db/database';

type LoginUserRow = { id: number; password_hash: string };
type ProfileRow = { id: number; email: string; profileImage: string | null };

export function findUserIdByEmail(email: string): number | undefined {
  const row = db.prepare('SELECT id FROM users WHERE email = ?').get(email) as
    | { id: number }
    | undefined;

  return row?.id;
}

export function createUser(email: string, passwordHash: string): number {
  const result = db
    .prepare('INSERT INTO users (email, password_hash) VALUES (?, ?)')
    .run(email, passwordHash);

  return Number(result.lastInsertRowid);
}

export function findUserForLogin(email: string) {
  const row = db
    .prepare('SELECT id, password_hash FROM users WHERE email = ?')
    .get(email) as LoginUserRow | undefined;

  if (!row) return null;

  return { id: row.id, passwordHash: row.password_hash };
}

export function findProfileById(userId: number) {
  return db
    .prepare(
      'SELECT id, email, profile_image AS profileImage FROM users WHERE id = ?',
    )
    .get(userId) as ProfileRow | undefined;
}

export function updateProfileImage(
  userId: number,
  profileImage: string | null,
): void {
  db.prepare('UPDATE users SET profile_image = ? WHERE id = ?').run(
    profileImage,
    userId,
  );
}
