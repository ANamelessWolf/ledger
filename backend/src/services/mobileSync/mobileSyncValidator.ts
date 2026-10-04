import { Exception, HTTP_STATUS, ISO_FORMAT } from "../../common";
import {
  EXPENSE_DESCRIPTION_MAX_LENGTH,
  MOBILE_SYNC_MAX_BATCH_SIZE,
  MobileExpenseSyncItem,
} from "./mobileSyncTypes";

/** Accepted sync key shape: UUIDs and similar opaque tokens. */
const SYNC_KEY_FORMAT = /^[A-Za-z0-9-]{8,64}$/;

/** Result of validating a single batch item. */
export type ItemValidationResult =
  | { valid: true; item: MobileExpenseSyncItem }
  | { valid: false; syncKey: string | null; message: string };

const isPositiveInteger = (value: unknown): value is number =>
  typeof value === "number" && Number.isInteger(value) && value > 0;

const isPositiveFiniteNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value) && value > 0;

/**
 * Checks that a `YYYY-MM-DD` string is a real calendar date.
 * @param value The candidate date string.
 * @returns True when the date exists (e.g. rejects `2026-02-30`).
 */
export const isValidIsoDate = (value: unknown): value is string => {
  if (typeof value !== "string" || !ISO_FORMAT.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
};

/**
 * Extracts the sync key of a raw item when it has a usable shape.
 * @param raw The raw request item.
 * @returns The key or null.
 */
export const extractSyncKey = (raw: unknown): string | null => {
  if (raw === null || typeof raw !== "object") return null;
  const key = (raw as Record<string, unknown>).syncKey;
  return typeof key === "string" && SYNC_KEY_FORMAT.test(key) ? key : null;
};

/**
 * Validates the batch envelope. Envelope errors reject the whole request
 * with HTTP 400 because no item can be processed safely.
 * @param body The raw request body.
 * @returns The raw items.
 * @throws {Exception} With status 400 for an invalid envelope.
 */
export const validateSyncEnvelope = (body: unknown): unknown[] => {
  if (body === null || typeof body !== "object") {
    throw new Exception("Request body must be an object", HTTP_STATUS.BAD_REQUEST);
  }
  const expenses = (body as Record<string, unknown>).expenses;
  if (!Array.isArray(expenses)) {
    throw new Exception("`expenses` must be an array", HTTP_STATUS.BAD_REQUEST);
  }
  if (expenses.length === 0 || expenses.length > MOBILE_SYNC_MAX_BATCH_SIZE) {
    throw new Exception(
      `A batch must contain between 1 and ${MOBILE_SYNC_MAX_BATCH_SIZE} expenses`,
      HTTP_STATUS.BAD_REQUEST
    );
  }
  const seen = new Set<string>();
  for (const raw of expenses) {
    const key = extractSyncKey(raw);
    if (key === null) continue;
    if (seen.has(key)) {
      throw new Exception(`Duplicate syncKey in batch: ${key}`, HTTP_STATUS.BAD_REQUEST);
    }
    seen.add(key);
  }
  return expenses;
};

/**
 * Validates a single batch item against the `expense` table constraints.
 * Foreign-key existence is left to the database.
 * @param raw The raw request item.
 * @returns The typed item or a validation failure.
 */
export const validateSyncItem = (raw: unknown): ItemValidationResult => {
  const syncKey = extractSyncKey(raw);
  const fail = (message: string): ItemValidationResult => ({ valid: false, syncKey, message });

  if (raw === null || typeof raw !== "object") return fail("Item must be an object");
  const r = raw as Record<string, unknown>;

  if (syncKey === null) return fail("syncKey is required (8-64 letters, digits or dashes)");
  if (!isPositiveInteger(r.walletId)) return fail("walletId must be a positive integer");
  if (!isPositiveInteger(r.expenseTypeId)) return fail("expenseTypeId must be a positive integer");
  if (!isPositiveInteger(r.vendorId)) return fail("vendorId must be a positive integer");
  if (typeof r.description !== "string" || r.description.trim().length === 0) {
    return fail("description is required");
  }
  if (r.description.length > EXPENSE_DESCRIPTION_MAX_LENGTH) {
    return fail(`description must be at most ${EXPENSE_DESCRIPTION_MAX_LENGTH} characters`);
  }
  if (!isPositiveFiniteNumber(r.total)) return fail("total must be a number greater than 0");
  const factor = r.currencyFactor;
  if (factor !== undefined && factor !== null && !isPositiveFiniteNumber(factor)) {
    return fail("currencyFactor must be null or a number greater than 0");
  }
  if (!isValidIsoDate(r.buyDate)) return fail("buyDate must be a valid YYYY-MM-DD date");

  return {
    valid: true,
    item: {
      syncKey,
      walletId: r.walletId,
      expenseTypeId: r.expenseTypeId,
      vendorId: r.vendorId,
      description: r.description,
      total: r.total,
      currencyFactor: (factor as number | null | undefined) ?? null,
      buyDate: r.buyDate,
    },
  };
};
