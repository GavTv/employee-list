import app from './app';
import { env } from './config/env';

export default app;

if (process.env.VERCEL !== '1') {
  app.listen(env.port, () => console.log(`API ready at http://localhost:${env.port}`));
}
