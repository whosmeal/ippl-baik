// scripts/start-all.mjs
import EmbeddedPostgres from 'embedded-postgres';
import fs from 'fs';
import dotenv from 'dotenv';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const dataDir = path.join(__dirname, '../data/db');
const sudahAda = fs.existsSync(path.join(dataDir, 'PG_VERSION'));
const port = Number(process.env.DB_PORT) || 5433;

const pg = new EmbeddedPostgres({
  databaseDir: dataDir,
  user: 'postgres',
  password: 'bila360',
  port: port,
  persistent: true,
});

if (!sudahAda) await pg.initialise();
await pg.start();

if (!sudahAda) {
  await pg.createDatabase('fitshop');
  const client = pg.getPgClient('fitshop');
  await client.connect();
  const schemaFile = path.join(__dirname, '../../database/schema.sql');
  const seedFile = path.join(__dirname, '../../database/seed.sql');
  await client.query(fs.readFileSync(schemaFile, 'utf8'));
  if (fs.existsSync(seedFile)) {
    await client.query(fs.readFileSync(seedFile, 'utf8'));
  }
  await client.end();
  console.log('Database fitshop dan schema berhasil diinisialisasi');
}

console.log(`[Database] PostgreSQL aktif di port ${port}`);

// Jalankan backend server Express
const serverProcess = spawn('node', ['server.js'], {
  cwd: path.join(__dirname, '..'),
  stdio: 'inherit',
});

process.on('SIGINT', async () => {
  console.log('\nMematikan FitShop...');
  serverProcess.kill('SIGINT');
  await pg.stop();
  process.exit(0);
});
