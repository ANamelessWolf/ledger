import { spawn } from "node:child_process";
import { createReadStream } from "node:fs";
import { readdir } from "node:fs/promises";
import path from "node:path";
import chalk from "chalk";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { BACKEND_ENV_PATH, DATABASE_ROOT, type DbConfig, loadBackendEnv } from "./lib/db-config.js";
import { resolveMysqlBinary } from "./lib/mysql-bin.js";
import { confirm } from "./lib/confirm.js";

const BACKUP_DIR = path.join(DATABASE_ROOT, "backups");

async function findLatestBackup(): Promise<string> {
  const files = (await readdir(BACKUP_DIR)).filter((f) => f.endsWith(".sql")).sort();
  if (files.length === 0) {
    throw new Error(`No hay backups en ${BACKUP_DIR}. Corre "npm run db:backup" primero.`);
  }
  return path.join(BACKUP_DIR, files[files.length - 1]);
}

function runMysqlRestore(mysqlBin: string, config: DbConfig, file: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const args = [`--host=${config.host}`, `--port=${config.port}`, `--user=${config.user}`, "--protocol=TCP"];

    const child = spawn(mysqlBin, args, {
      env: { ...process.env, MYSQL_PWD: config.password },
    });

    createReadStream(file).pipe(child.stdin);

    let stderr = "";
    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`mysql terminó con código ${code}: ${stderr.trim()}`));
    });
  });
}

async function main() {
  const argv = await yargs(hideBin(process.argv))
    .option("file", { type: "string", describe: "Ruta del dump a restaurar (default: el más reciente en backups/)" })
    .option("yes", { alias: "y", type: "boolean", default: false, describe: "Omite la confirmación" })
    .parse();

  console.log(chalk.cyan("Database restore runner"));
  console.log(chalk.gray(`Conexión: ${BACKEND_ENV_PATH}`));

  const config = loadBackendEnv();
  const file = argv.file ? path.resolve(argv.file) : await findLatestBackup();

  console.log(
    chalk.red.bold(
      `\n⚠  Esto va a SOBREESCRIBIR la base de datos "${config.database}" en ${config.host}:${config.port} ` +
        `con el contenido de:\n   ${file}`,
    ),
  );
  const ok = await confirm("¿Continuar?", argv.yes);
  if (!ok) {
    console.log(chalk.yellow("Cancelado."));
    return;
  }

  const mysqlBin = await resolveMysqlBinary("mysql");
  console.log(chalk.gray(`Usando mysql: ${mysqlBin}`));
  console.log(chalk.gray("Restaurando..."));

  await runMysqlRestore(mysqlBin, config, file);

  console.log(chalk.green(`\n✔ Restauración completa desde ${file}`));
}

main().catch((error) => {
  console.error(chalk.red(`\n${error instanceof Error ? error.message : error}`));
  process.exitCode = 1;
});
