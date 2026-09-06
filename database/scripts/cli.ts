import { spawn } from "node:child_process";
import readline from "node:readline/promises";
import { stdin, stdout } from "node:process";
import chalk from "chalk";
import { DATABASE_ROOT } from "./lib/db-config.js";

interface MenuItem {
  key: string;
  npmScript: string;
  label: string;
  description: string;
  extraArgsHint?: string;
}

const MENU: MenuItem[] = [
  { key: "1", npmScript: "db:migrate", label: "migrate", description: "Applies pending migrations (creates/updates the schema)" },
  { key: "2", npmScript: "db:seed", label: "seed", description: "Loads or updates catalog data (idempotent)" },
  { key: "3", npmScript: "db:backup", label: "backup", description: "Generates a full database dump" },
  {
    key: "4",
    npmScript: "db:restore",
    label: "restore",
    description: "Restores a backup (OVERWRITES the database!)",
    extraArgsHint: "-- --file backups/<file>.sql",
  },
  {
    key: "5",
    npmScript: "db:rebuild",
    label: "rebuild",
    description: "Recreates the database from scratch: drop + create + migrate + seed (DESTRUCTIVE!)",
  },
  { key: "0", npmScript: "", label: "exit", description: "Closes this menu without doing anything" },
];

const USAGE = `
Usage:
  npm run db:cli                 Opens the interactive menu
  npm run db:cli -- <number>     Runs that option directly, skipping the menu (e.g. npm run db:cli -- 1)
  npm run db:cli -- --help       Shows this help

Menu options:
${MENU.filter((m) => m.key !== "0")
  .map((m) => `  ${m.key}) ${m.label.padEnd(8)} ${m.description}`)
  .join("\n")}
  0) exit

To pass a command's own flags (e.g. --yes, --file), use its npm script
directly instead of the menu, for example:
  npm run db:restore -- --file backups/dump-db_ledger-202601130859.sql --yes
  npm run db:rebuild -- --yes
`;

function printMenu(): void {
  console.log(chalk.cyan("\nDatabase CLI — select a command:\n"));
  for (const item of MENU) {
    if (item.key === "0") {
      console.log(`  ${chalk.bold(item.key)}) ${item.label}`);
    } else {
      console.log(`  ${chalk.bold(item.key)}) ${chalk.green(item.label.padEnd(8))} ${chalk.gray(item.description)}`);
    }
  }
}

function runNpmScript(script: string): Promise<number> {
  return new Promise((resolve, reject) => {
    const child = spawn("npm", ["run", script], {
      cwd: DATABASE_ROOT,
      stdio: "inherit",
      shell: true,
    });
    child.on("error", reject);
    child.on("exit", (code) => resolve(code ?? 1));
  });
}

async function runSelection(selection: string): Promise<boolean> {
  const item = MENU.find((m) => m.key === selection);
  if (!item) {
    console.log(chalk.red(`\nInvalid option: "${selection}".`));
    console.log(USAGE);
    return false;
  }

  if (item.key === "0") {
    console.log(chalk.gray("Bye."));
    return true;
  }

  console.log(chalk.cyan(`\n→ npm run ${item.npmScript}`));
  const code = await runNpmScript(item.npmScript);
  if (code !== 0) {
    console.log(chalk.red(`\n"${item.label}" exited with code ${code}.`));
    process.exitCode = code;
  }
  return true;
}

async function interactiveMenu(): Promise<void> {
  const rl = readline.createInterface({ input: stdin, output: stdout });
  try {
    while (true) {
      printMenu();
      const answer = (await rl.question("\n> ")).trim();

      if (answer === "0" || answer.toLowerCase() === "exit" || answer === "") {
        if (answer === "") {
          console.log(chalk.red("\nYou didn't type anything."));
          console.log(USAGE);
          continue;
        }
        console.log(chalk.gray("Bye."));
        return;
      }

      const handled = await runSelection(answer);
      if (!handled) continue;
      if (answer === "0") return;
      return;
    }
  } finally {
    rl.close();
  }
}

async function main() {
  const args = process.argv.slice(2);

  if (args.includes("--help") || args.includes("-h")) {
    console.log(USAGE);
    return;
  }

  if (args.length > 0) {
    await runSelection(args[0]);
    return;
  }

  await interactiveMenu();
}

main().catch((error) => {
  console.error(chalk.red(`\n${error instanceof Error ? error.message : error}`));
  console.log(USAGE);
  process.exitCode = 1;
});
