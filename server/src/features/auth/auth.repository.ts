import { execute, findOne, insertId } from '../../db/database';

type LoginUserRow = { id: number; password_hash: string };
type ProfileRow = { id: number; email: string; profileImage: string | null };

export async function findUserIdByEmail(email: string): Promise<number | undefined> {
  const row = await findOne<{ id: number }>('SELECT id FROM users WHERE email = ?', [email]);
  return row?.id;
}

export function createUser(email: string, passwordHash: string): Promise<number> {
  return insertId(
    'INSERT INTO users (email, password_hash) VALUES (?, ?) RETURNING id',
    [email, passwordHash],
  );
}

export async function findUserForLogin(email: string) {
  const row = await findOne<LoginUserRow>(
    'SELECT id, password_hash FROM users WHERE email = ?',
    [email],
  );

  if (!row) return null;

  return { id: row.id, passwordHash: row.password_hash };
}

export function findProfileById(userId: number): Promise<ProfileRow | undefined> {
  return findOne<ProfileRow>(
    'SELECT id, email, profile_image AS "profileImage" FROM users WHERE id = ?',
    [userId],
  );
}

export function updateProfileImage(
  userId: number,
  profileImage: string | null,
): Promise<void> {
  return execute('UPDATE users SET profile_image = ? WHERE id = ?', [profileImage, userId]);
}
