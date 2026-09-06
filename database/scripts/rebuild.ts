import { spawn } from "node:child_process";
import chalk from "chalk";
import mysql from "mysql2/promise";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { BACKEND_ENV_PATH, DATABASE_ROOT, loadBackendEnv } from "./lib/db-config.js";
import { confirm } from "./lib/confirm.js";

function runNpmScript(script: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn("npm", ["run", script], {
      cwd: DATABASE_ROOT,
      stdio: "inherit",
      shell: true,
    });
    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`"npm run ${script}" terminó con código ${code}`));
    });
  });
}

async function main() {
  const argv = await yargs(hideBin(process.argv))
    .option("yes", { alias: "y", type: "boolean", default: false, describe: "Omite la confirmación" })
    .parse();

  console.log(chalk.cyan("Database rebuild runner"));
  console.log(chalk.gray(`Conexión: ${BACKEND_ENV_PATH}`));

  const config = loadBackendEnv();

  console.log(
    chalk.red.bold(
      `\n⚠  Esto va a BORRAR por completo la base de datos "${config.database}" en ${config.host}:${config.port} ` +
        "y recrearla vacía a partir de migrations/ y seeds/.",
    ),
  );
  const ok = await confirm("¿Continuar?", argv.yes);
  if (!ok) {
    console.log(chalk.yellow("Cancelado."));
    return;
  }

  const connection = await mysql.createConnection({
    host: config.host,
    port: config.port,
    user: config.user,
    password: config.password,
  });
  try {
    console.log(chalk.gray(`Recreando base de datos "${config.database}"...`));
    await connection.query(`DROP DATABASE IF EXISTS \`${config.database}\`;`);
    await connection.query(
      `CREATE DATABASE \`${config.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;`,
    );
  } finally {
    await connection.end();
  }

  console.log(chalk.cyan("\n→ Aplicando migraciones..."));
  await runNpmScript("db:migrate");

  console.log(chalk.cyan("\n→ Aplicando seeds..."));
  await runNpmScript("db:seed");

  console.log(chalk.green("\n✔ Rebuild completo."));
}

main().catch((error) => {
  console.error(chalk.red(`\n${error instanceof Error ? error.message : error}`));
  process.exitCode = 1;
});
