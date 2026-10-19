import EmbeddedPostgres from 'embedded-postgres';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

const dataDir = './data/db';
const sudahAda = fs.existsSync(`${dataDir}/PG_VERSION`);
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
  await client.query(fs.readFileSync('../database/schema.sql', 'utf8'));
  const seedFile = '../database/seed.sql';
  if (fs.existsSync(seedFile)) {
    await client.query(fs.readFileSync(seedFile, 'utf8'));
  }
  await client.end();
  console.log('Database fitshop, schema, dan seed berhasil diinisialisasi');
}

console.log(`PostgreSQL jalan di port ${port} (Ctrl+C untuk berhenti)`);

process.on('SIGINT', async () => {
  await pg.stop();
  process.exit(0);
});