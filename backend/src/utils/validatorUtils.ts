import { Exception, HTTP_STATUS } from "../common";
import { emptyNewExpense, NewExpense } from "../models/expenses/newExpense";
import { Request } from "express";

type FieldInfo<T> = {
  field: keyof T;
  obligatory: boolean;
  type: string;
};

// Helper type to extract optional fields
type OptionalKeys<T> = {
  [K in keyof T]-?: undefined extends T[K] ? K : never;
}[keyof T];

/**
 * Validates if a value is a valid Id. And Id must be a number greater
 * than zero
 * @param value The value to validate
 * @returns True if the value is valid.
 */
export const IsValidId = (value: any): boolean => {
  const hasValue = value !== null && value !== undefined;
  const isNumber = typeof value === "number";
  return hasValue && isNumber && value > 0;
};

const getFieldsInfo = <T extends object>(obj: T): FieldInfo<T>[] => {
  // Extract the optional keys from the type
  const optionalFields = new Set<OptionalKeys<T>>();

  return Object.keys(obj).map((key) => {
    const field = key as keyof T;
    const isObligatory = !optionalFields.has(field as OptionalKeys<T>);

    // Handle undefined values for optional fields
    const fieldType =
      obj[field] === undefined ? "undefined" : typeof obj[field];

    return {
      field,
      obligatory: fieldType !== "undefined" ? isObligatory : false,
      type:
        fieldType === "object" && obj[field] instanceof Date
          ? "object"
          : fieldType,
    };
  });
};

const validateBody = (req: Request) => {
  if (req.body === null || req.body === undefined) {
    throw new Exception(
      "Error creating new Expense: request payload(body) is empty or missing",
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
};

const validateRequiredFields = <T extends object>(
  obj: T,
  body: Partial<T>
): {
  missingFields: string[];
  requiredFields: FieldInfo<T>[];
} => {
  const missingFields: string[] = [];
  const requiredFields = getFieldsInfo(obj).filter((x) => x.obligatory);
  requiredFields.forEach((fieldInfo) => {
    if (body[fieldInfo.field] === undefined) {
      missingFields.push(String(fieldInfo.field));
    }
  });
  return { missingFields, requiredFields };
};

/**
 * Generates the expected types for required fields.
 * @param requiredFields Array of FieldInfo objects.
 * @returns An object where each field maps to its expected type.
 */
const getExpectedTypes = <T extends object>(
  requiredFields: FieldInfo<T>[]
): Record<keyof T, string> => {
  const expectedTypes: Record<keyof T, string> = {} as Record<keyof T, string>;
  requiredFields.forEach((fieldInfo) => {
    expectedTypes[fieldInfo.field] = fieldInfo.type;
  });
  return expectedTypes;
};

/**
 * Validates that the body fields match their expected types.
 * @param requiredExpectedTypes Expected types for required fields.
 * @param optionalExpectedTypes Expected types for optional fields.
 * @param body The body of the request.
 * @returns Array of invalid field type descriptions, empty if no errors.
 */
const validateFieldsTypes = <T extends object>(
  requiredExpectedTypes: Record<keyof T, string>,
  optionalExpectedTypes: Record<string, string>,
  body: Partial<T>
): string[] => {
  const invalidTypes: string[] = [];

  // Validate required fields
  Object.keys(requiredExpectedTypes).forEach((field) => {
    const key = field as keyof T;
    const expectedType = requiredExpectedTypes[key];

    if (body[key] !== undefined && typeof body[key] !== expectedType) {
      // Check if it's a Date object
      if (expectedType === "object" && body[key] instanceof Date) {
        return;
      }
      invalidTypes.push(
        `${field} received value of type ${typeof body[
          key
        ]} expected ${expectedType}`
      );
    }
  });

  // Validate optional fields
  Object.keys(optionalExpectedTypes).forEach((field) => {
    const expectedType = optionalExpectedTypes[field];
    const value = body[field as keyof T];

    if (value !== undefined && typeof value !== expectedType) {
      // Check if it's a Date object
      if (expectedType === "object" && value instanceof Date) {
        return;
      }
      invalidTypes.push(
        `${field} received value of type ${typeof value} expected ${expectedType}`
      );
    }
  });

  return invalidTypes;
};

/************
 * Expenses *
 ************/
export const isNewExpenseRequestValid = (req: Request): NewExpense => {
  validateBody(req);

  // Track missing fields
  const body = req.body as Partial<NewExpense>;
  const { missingFields, requiredFields } = validateRequiredFields<NewExpense>(
    emptyNewExpense,
    body
  );
  if (missingFields.length > 0) {
    throw new Exception(
      `One or more required fields are missing on the payload. Missing fields: ${missingFields.join(
        ", "
      )}`,
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
  // Track invalid type fields
  const requireExpectedTypes = getExpectedTypes(requiredFields);
  const notRequiredExpectedTypes = { buyDate: "string" };
  const invalidTypes: string[] = validateFieldsTypes(
    requireExpectedTypes,
    notRequiredExpectedTypes,
    body
  );

  if (invalidTypes.length > 0) {
    throw new Exception(
      `One or more field types are incorrect on the payload. Incorrect fields: ${invalidTypes.join(
        ", "
      )}`,
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }

  const { total, buyDate, description, walletId, expenseTypeId, vendorId } =
    req.body;
  const _buyDate = buyDate === undefined ? new Date() : buyDate;
  return {
    total,
    description,
    walletId,
    expenseTypeId,
    vendorId,
    buyDate: _buyDate,
  };
};
