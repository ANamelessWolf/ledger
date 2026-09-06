import readline from "node:readline/promises";
import { stdin, stdout } from "node:process";

/** Prompts the user for a yes/no confirmation. Skipped when `assumeYes` is true. */
export async function confirm(message: string, assumeYes: boolean): Promise<boolean> {
  if (assumeYes) return true;

  const rl = readline.createInterface({ input: stdin, output: stdout });
  try {
    const answer = await rl.question(`${message} (escribe "yes" para continuar): `);
    return answer.trim().toLowerCase() === "yes";
  } finally {
    rl.close();
  }
}
