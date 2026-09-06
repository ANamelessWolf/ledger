import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import chalk from "chalk";
import mysql from "mysql2/promise";
import { BACKEND_ENV_PATH, DATABASE_ROOT, loadBackendEnv } from "./lib/db-config.js";

const SEEDS_DIR = path.join(DATABASE_ROOT, "seeds");

async function main() {
  console.log(chalk.cyan("Database seed runner"));
  console.log(chalk.gray(`Conexión: ${BACKEND_ENV_PATH}`));
  console.log(chalk.gray(`Seeds: ${SEEDS_DIR}`));

  const config = loadBackendEnv();
  const files = (await readdir(SEEDS_DIR)).filter((f) => f.endsWith(".sql")).sort();

  if (files.length === 0) {
    console.log(chalk.yellow("No hay archivos .sql en seeds/."));
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
    // Los seeds usan INSERT ... ON DUPLICATE KEY UPDATE, así que son
    // seguros de re-ejecutar en cualquier orden de corridas.
    for (const file of files) {
      const sql = await readFile(path.join(SEEDS_DIR, file), "utf8");
      try {
        await connection.query(sql);
        console.log(chalk.green(`  ✔  ${file}`));
      } catch (error) {
        console.log(chalk.red(`  ✘  ${file}`));
        throw error;
      }
    }

    console.log(chalk.cyan(`${files.length} seed(s) aplicado(s).`));
  } finally {
    await connection.end();
  }
}

main().catch((error) => {
  console.error(chalk.red(`\n${error instanceof Error ? error.message : error}`));
  process.exitCode = 1;
});
