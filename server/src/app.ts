import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env';
import { initializeDatabase } from './db/database';
import { authRouter } from './features/auth/auth.routes';
import { departmentsRouter, employeesRouter } from './features/employees/employees.routes';

const app = express();

app.use(helmet());
app.use(cors({ origin: env.clientOrigins }));
app.use('/api/auth', express.text({ type: 'text/plain', limit: '2mb' }), (req, res, next) => {
  if (typeof req.body !== 'string') return next();

  try {
    req.body = JSON.parse(req.body);
    next();
  } catch {
    return res.status(400).json({ message: 'Некорректный формат запроса' });
  }
});
app.use(express.json({ limit: '2mb' }));

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

app.use((_req, _res, next) => {
  initializeDatabase().then(() => next()).catch(next);
});

app.use('/api/auth', authRouter);
app.use('/api/employees', employeesRouter);
app.use('/api/departments', departmentsRouter);

app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(error);
  res.status(500).json({ message: 'Внутренняя ошибка сервера' });
});

export default app;
