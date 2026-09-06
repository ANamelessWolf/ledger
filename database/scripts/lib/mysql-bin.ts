import { existsSync } from "node:fs";
import { spawn } from "node:child_process";
import { glob } from "glob";

function isExecutableOnPath(bin: string): Promise<boolean> {
  return new Promise((resolve) => {
    const probe = spawn(bin, ["--version"], { stdio: "ignore" });
    probe.on("error", () => resolve(false));
    probe.on("exit", (code) => resolve(code === 0));
  });
}

/**
 * Resolves the path to a MySQL client binary (`mysql` or `mysqldump`).
 * Checks an override env var, then PATH, then common install locations.
 */
export async function resolveMysqlBinary(bin: "mysql" | "mysqldump"): Promise<string> {
  const overrideVar = bin === "mysql" ? "MYSQL_BIN_PATH" : "MYSQLDUMP_PATH";
  const override = process.env[overrideVar];
  if (override) {
    if (!existsSync(override)) {
      throw new Error(`${overrideVar} apunta a una ruta inexistente: ${override}`);
    }
    return override;
  }

  if (await isExecutableOnPath(bin)) {
    return bin;
  }

  const candidates = await glob(
    [
      `C:/Program Files/MySQL/**/${bin}.exe`,
      `C:/xampp/mysql/bin/${bin}.exe`,
      `/usr/bin/${bin}`,
      `/usr/local/bin/${bin}`,
      `/opt/homebrew/bin/${bin}`,
    ],
    { windowsPathsNoEscape: true },
  );
  if (candidates.length > 0) {
    return candidates[0];
  }

  throw new Error(
    `No se encontró el ejecutable '${bin}'. Instala el cliente de MySQL o define ` +
      `la variable de entorno ${overrideVar} apuntando al binario.`,
  );
}
