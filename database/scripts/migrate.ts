import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import chalk from "chalk";
import mysql from "mysql2/promise";
import { BACKEND_ENV_PATH, DATABASE_ROOT, loadBackendEnv } from "./lib/db-config.js";

const MIGRATIONS_DIR = path.join(DATABASE_ROOT, "migrations");

/** Strips the `mysql`-CLI-only DELIMITER directive; the server understands
 * a routine body's internal semicolons on its own via BEGIN/END nesting. */
function stripDelimiterDirectives(sql: string): string {
  return sql
    .split("\n")
    .filter((line) => !/^\s*DELIMITER\s+/i.test(line))
    .join("\n");
}

async function ensureMigrationsTable(connection: mysql.Connection): Promise<void> {
  await connection.query(`
    CREATE TABLE IF NOT EXISTS \`schema_migrations\` (
      \`filename\` VARCHAR(255) NOT NULL PRIMARY KEY,
      \`applied_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;
  `);
}

async function main() {
  console.log(chalk.cyan("Database migrations runner"));
  console.log(chalk.gray(`Conexión: ${BACKEND_ENV_PATH}`));
  console.log(chalk.gray(`Migraciones: ${MIGRATIONS_DIR}`));

  const config = loadBackendEnv();
  const files = (await readdir(MIGRATIONS_DIR)).filter((f) => f.endsWith(".sql")).sort();

  if (files.length === 0) {
    console.log(chalk.yellow("No hay archivos .sql en migrations/."));
    return;
  }

  const connection = await mysql.createConnection({
    host: config.host,
    port: config.port,
    user: config.user,
    password: config.password,
    database: config.database,
    multipleStatements: true,
  });

  try {
    await ensureMigrationsTable(connection);

    const [appliedRows] = await connection.query<any[]>("SELECT filename FROM schema_migrations");
    const applied = new Set((appliedRows as any[]).map((r) => r.filename));

    let ranCount = 0;
    for (const file of files) {
      if (applied.has(file)) {
        console.log(chalk.gray(`  ⏭  ${file} (ya aplicada)`));
        continue;
      }

      const raw = await readFile(path.join(MIGRATIONS_DIR, file), "utf8");
      const sql = stripDelimiterDirectives(raw);

      try {
        await connection.query(sql);
        await connection.query("INSERT INTO schema_migrations (filename) VALUES (?)", [file]);
        console.log(chalk.green(`  ✔  ${file}`));
        ranCount++;
      } catch (error) {
        console.log(chalk.red(`  ✘  ${file}`));
        throw error;
      }
    }

    if (ranCount === 0) {
      console.log(chalk.cyan("Todo al día: no había migraciones pendientes."));
    } else {
      console.log(chalk.cyan(`${ranCount} migración(es) aplicada(s).`));
    }
  } finally {
    await connection.end();
  }
}

main().catch((error) => {
  console.error(chalk.red(`\n${error instanceof Error ? error.message : error}`));
  process.exitCode = 1;
});
