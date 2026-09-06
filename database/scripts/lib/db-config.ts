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

export function loadBackendEnv(): DbConfig {
  if (!existsSync(BACKEND_ENV_PATH)) {
    throw new Error(`No se encontró backend/.env en: ${BACKEND_ENV_PATH}`);
  }
  const { parsed } = dotenv.config({ path: BACKEND_ENV_PATH, processEnv: {} });
  const env = parsed ?? {};

  const required = ["DB_HOST", "DB_PORT", "DB_USER", "DB_NAME"] as const;
  const missing = required.filter((key) => !env[key]);
  if (missing.length > 0) {
    throw new Error(`Faltan variables en backend/.env: ${missing.join(", ")}`);
  }

  return {
    host: env.DB_HOST,
    port: Number(env.DB_PORT),
    user: env.DB_USER,
    password: env.DB_PASSWORD ?? "",
    database: env.DB_NAME,
  };
}
