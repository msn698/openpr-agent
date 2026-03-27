import 'dotenv/config';
import { createServer } from './server/app.js';
import { loadEnv } from './config/env.js';

const env = loadEnv();
const server = createServer();

server.listen(env.PORT, () => {
  console.log(`[openpr] listening on :${env.PORT}`);
});
