import { spawn } from "node:child_process";
import { createWriteStream } from "node:fs";
import { mkdir, stat } from "node:fs/promises";
import path from "node:path";
import chalk from "chalk";
import mysql from "mysql2/promise";
import ora from "ora";
import { BACKEND_ENV_PATH, DATABASE_ROOT, type DbConfig, loadBackendEnv } from "./lib/db-config.js";
import { resolveMysqlBinary } from "./lib/mysql-bin.js";

const BACKUP_DIR = path.join(DATABASE_ROOT, "backups");

function timestamp(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}` +
    `${pad(now.getHours())}${pad(now.getMinutes())}`
  );
}

interface SchemaSummary {
  tables: number;
  views: number;
  routines: number;
  triggers: number;
  events: number;
}

async function summarizeSchema(config: DbConfig): Promise<SchemaSummary> {
  const connection = await mysql.createConnection({
    host: config.host,
    port: config.port,
    user: config.user,
    password: config.password,
    database: config.database,
  });

  try {
    const [[tables], [views], [routines], [triggers], [events]] = await Promise.all([
      connection.query<any[]>(
        "SELECT COUNT(*) AS n FROM information_schema.tables WHERE table_schema = ? AND table_type = 'BASE TABLE'",
        [config.database],
      ),
      connection.query<any[]>(
        "SELECT COUNT(*) AS n FROM information_schema.views WHERE table_schema = ?",
        [config.database],
      ),
      connection.query<any[]>(
        "SELECT COUNT(*) AS n FROM information_schema.routines WHERE routine_schema = ?",
        [config.database],
      ),
      connection.query<any[]>(
        "SELECT COUNT(*) AS n FROM information_schema.triggers WHERE trigger_schema = ?",
        [config.database],
      ),
      connection.query<any[]>("SELECT COUNT(*) AS n FROM information_schema.events WHERE event_schema = ?", [
        config.database,
      ]),
    ]);

    return {
      tables: (tables as any)[0].n,
      views: (views as any)[0].n,
      routines: (routines as any)[0].n,
      triggers: (triggers as any)[0].n,
      events: (events as any)[0].n,
    };
  } finally {
    await connection.end();
  }
}

function runMysqldump(mysqldumpBin: string, config: DbConfig, outFile: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const args = [
      `--host=${config.host}`,
      `--port=${config.port}`,
      `--user=${config.user}`,
      "--protocol=TCP",
      "--single-transaction",
      "--routines",
      "--triggers",
      "--events",
      "--add-drop-table",
      "--no-tablespaces",
      "--set-gtid-purged=OFF",
      "--databases",
      config.database,
    ];

    const child = spawn(mysqldumpBin, args, {
      env: { ...process.env, MYSQL_PWD: config.password },
    });

    const out = createWriteStream(outFile);
    child.stdout.pipe(out);

    let stderr = "";
    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`mysqldump terminó con código ${code}: ${stderr.trim()}`));
      }
    });
  });
}

async function main() {
  console.log(chalk.cyan("Database backup runner"));
  console.log(chalk.gray(`Conexión: ${BACKEND_ENV_PATH}`));

  const config = loadBackendEnv();
  await mkdir(BACKUP_DIR, { recursive: true });

  const summarySpinner = ora("Inspeccionando esquema de la base de datos...").start();
  let summary: SchemaSummary;
  try {
    summary = await summarizeSchema(config);
    summarySpinner.succeed(
      `Esquema: ${summary.tables} tablas, ${summary.views} vistas, ${summary.routines} rutinas, ` +
        `${summary.triggers} triggers, ${summary.events} eventos.`,
    );
  } catch (error) {
    summarySpinner.fail("No se pudo conectar a la base de datos.");
    throw error;
  }

  const resolveSpinner = ora("Buscando mysqldump...").start();
  const mysqldumpBin = await resolveMysqlBinary("mysqldump");
  resolveSpinner.succeed(`Usando mysqldump: ${mysqldumpBin}`);

  const outFile = path.join(BACKUP_DIR, `dump-${config.database}-${timestamp()}.sql`);
  const dumpSpinner = ora(`Generando backup en ${outFile}...`).start();
  try {
    await runMysqldump(mysqldumpBin, config, outFile);
  } catch (error) {
    dumpSpinner.fail("Falló la generación del backup.");
    throw error;
  }

  const { size } = await stat(outFile);
  if (size === 0) {
    dumpSpinner.fail("El archivo de backup quedó vacío.");
    throw new Error(`Backup vacío: ${outFile}`);
  }

  dumpSpinner.succeed(`Backup completo (${(size / 1024 / 1024).toFixed(2)} MB): ${outFile}`);
}

main().catch((error) => {
  console.error(chalk.red(`\n${error instanceof Error ? error.message : error}`));
  process.exitCode = 1;
});
