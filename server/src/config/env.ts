import 'dotenv/config';

const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret || jwtSecret.length < 32) {
  throw new Error('JWT_SECRET must be set in server/.env and contain at least 32 characters');
}

export const env = {
  port: Number(process.env.PORT) || 4000,
  jwtSecret,
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
};
