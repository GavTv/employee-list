import 'dotenv/config';

const isLocalDevelopment = process.env.NODE_ENV !== 'production' && process.env.VERCEL !== '1';
const localJwtSecret = isLocalDevelopment ? 'employee-list-local-development-secret' : undefined;
const jwtSecret = process.env.JWT_SECRET || localJwtSecret;
if (!jwtSecret || jwtSecret.length < 32) {
  throw new Error('Set JWT_SECRET to a value of at least 32 characters before starting the production API');
}

export const env = {
  port: Number(process.env.PORT) || 4000,
  jwtSecret,
  clientOrigins: (process.env.CLIENT_ORIGIN || 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  databaseUrl: process.env.DATABASE_URL,
};
