import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const PROJECT_ROOT = path.resolve(__dirname, "..", "..", "..");
export const DATABASE_ROOT = path.resolve(__dirname, "..", "..");
export const BACKEND_ENV_PATH = path.join(PROJECT_ROOT, "backend", ".env");

export interface DbConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}

const REQUIRED_KEYS = ["DB_HOST", "DB_PORT", "DB_USER", "DB_NAME"] as const;

/**
 * Resolves DB connection settings. Inside a container these arrive as real
 * process env vars (injected via docker-compose `environment:`), where
 * backend/.env isn't necessarily present on disk. On a host checkout,
 * process.env won't have them, so we fall back to reading backend/.env.
 */
export function loadBackendEnv(): DbConfig {
  const hasAllFromProcessEnv = REQUIRED_KEYS.every((key) => !!process.env[key]);
  const env = hasAllFromProcessEnv ? process.env : readBackendEnvFile();

  const missing = REQUIRED_KEYS.filter((key) => !env[key]);
  if (missing.length > 0) {
    const source = hasAllFromProcessEnv ? "el entorno del proceso" : BACKEND_ENV_PATH;
    throw new Error(`Faltan variables en ${source}: ${missing.join(", ")}`);
  }

  return {
    host: env.DB_HOST as string,
    port: Number(env.DB_PORT),
    user: env.DB_USER as string,
    password: env.DB_PASSWORD ?? "",
    database: env.DB_NAME as string,
  };
}

function readBackendEnvFile(): NodeJS.ProcessEnv {
  if (!existsSync(BACKEND_ENV_PATH)) {
    throw new Error(`No se encontró backend/.env en: ${BACKEND_ENV_PATH}`);
  }
  const { parsed } = dotenv.config({ path: BACKEND_ENV_PATH, processEnv: {} });
  return parsed ?? {};
}
