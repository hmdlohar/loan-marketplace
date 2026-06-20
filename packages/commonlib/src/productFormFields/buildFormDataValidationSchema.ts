import * as yup from "yup";
import { FormFieldDefinition } from "./types";

function matchesConditionValue(fieldValue: unknown, expected: string | string[]) {
  const normalized = fieldValue === undefined || fieldValue === null ? "" : String(fieldValue).trim();
  if (Array.isArray(expected)) {
    for (let i = 0; i < expected.length; i++) {
      if (normalized === expected[i]) {
        return true;
      }
    }
    return false;
  }
  return normalized === expected;
}

function isFieldRequired(field: FormFieldDefinition, formData: Record<string, unknown>) {
  if (field.RequiredWhen) {
    const dependencyValue = formData[field.RequiredWhen.Key];
    return matchesConditionValue(dependencyValue, field.RequiredWhen.Equals);
  }
  return field.Required;
}

function buildFieldSchema(field: FormFieldDefinition, formData: Record<string, unknown>): yup.AnySchema {
  const required = isFieldRequired(field, formData);
  let schema = yup.string().trim();

  if (field.Key === "panNumber") {
    schema = schema.transform((value) => (value ? value.toUpperCase() : value));
  }

  if (field.Type === "email") {
    schema = schema.email(`${field.Label} must be a valid email`);
  } else if (field.Type === "mobile") {
    schema = schema.matches(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number");
  } else if (field.Type === "number") {
    schema = schema.test("is-number", `${field.Label} must be a valid number`, (value) => {
      if (!value) {
        return !required;
      }
      return !Number.isNaN(Number(value));
    });
    if (field.Validation && field.Validation.min !== undefined) {
      const minValue = field.Validation.min;
      const minMessage = field.Validation.errorMessage || `${field.Label} must be at least ${minValue}`;
      schema = schema.test("min", minMessage, (value) => {
        if (!value) {
          return !required;
        }
        return Number(value) >= minValue;
      });
    }
    if (field.Validation && field.Validation.max !== undefined) {
      const maxValue = field.Validation.max;
      const maxMessage = field.Validation.errorMessage || `${field.Label} must be at most ${maxValue}`;
      schema = schema.test("max", maxMessage, (value) => {
        if (!value) {
          return !required;
        }
        return Number(value) <= maxValue;
      });
    }
  } else if (field.Type === "date") {
    schema = schema.test("is-date", `${field.Label} must be a valid date`, (value) => {
      if (!value) {
        return !required;
      }
      return !Number.isNaN(Date.parse(value));
    });
    if (field.Validation && field.Validation.minAge !== undefined) {
      const minAge = field.Validation.minAge;
      schema = schema.test("min-age", field.Validation.errorMessage || `You must be at least ${minAge} years old`, (value) => {
        if (!value) {
          return !required;
        }
        const dob = new Date(value);
        if (Number.isNaN(dob.getTime())) {
          return false;
        }
        const today = new Date();
        let age = today.getFullYear() - dob.getFullYear();
        const monthDiff = today.getMonth() - dob.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
          age -= 1;
        }
        return age >= minAge;
      });
    }
    if (field.Validation && field.Validation.maxAge !== undefined) {
      const maxAge = field.Validation.maxAge;
      schema = schema.test("max-age", field.Validation.errorMessage || `Age must be at most ${maxAge} years`, (value) => {
        if (!value) {
          return !required;
        }
        const dob = new Date(value);
        if (Number.isNaN(dob.getTime())) {
          return false;
        }
        const today = new Date();
        let age = today.getFullYear() - dob.getFullYear();
        const monthDiff = today.getMonth() - dob.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
          age -= 1;
        }
        return age <= maxAge;
      });
    }
  } else if ((field.Type === "select" || field.Type === "radio") && field.Options && field.Options.length) {
    schema = schema.oneOf(field.Options, `${field.Label} must be a valid option`);
  }

  if (field.Key === "panNumber") {
    schema = schema.matches(/^[A-Z]{5}[0-9]{4}[A-Z]$/, "Enter a valid PAN (e.g. ABCDE1234F)");
  }
  if (field.Key === "pinCode") {
    schema = schema.matches(/^\d{6}$/, "Enter a valid 6-digit pincode");
  }

  if (required) {
    return schema.required(`${field.Label} is required`) as yup.AnySchema;
  }
  return schema.notRequired() as yup.AnySchema;
}

export function buildFormDataValidationSchema(fields: FormFieldDefinition[], formData: Record<string, unknown> = {}) {
  const shape: Record<string, yup.AnySchema> = {};
  for (let i = 0; i < fields.length; i++) {
    const field = fields[i];
    if (!isFormFieldVisible(field, formData)) {
      continue;
    }
    shape[field.Key] = buildFieldSchema(field, formData);
  }
  return yup.object(shape);
}

export async function validateFormDataOrThrow(fields: FormFieldDefinition[], formData: Record<string, unknown>) {
  const schema = buildFormDataValidationSchema(fields, formData);
  try {
    return await schema.validate(formData, { abortEarly: false, stripUnknown: true });
  } catch (ex: any) {
    if (ex.name === "ValidationError" && ex.errors && ex.errors.length) {
      throw new Error(ex.errors[0]);
    }
    throw ex;
  }
}

export async function getFormDataValidationErrors(
  fields: FormFieldDefinition[],
  formData: Record<string, unknown>
): Promise<Record<string, string>> {
  const schema = buildFormDataValidationSchema(fields, formData);
  try {
    await schema.validate(formData, { abortEarly: false, stripUnknown: true });
    return {};
  } catch (ex: any) {
    const errors: Record<string, string> = {};
    if (ex.inner && ex.inner.length) {
      for (let i = 0; i < ex.inner.length; i++) {
        const innerError = ex.inner[i];
        if (innerError.path && !errors[innerError.path]) {
          errors[innerError.path] = innerError.message;
        }
      }
      return errors;
    }
    if (ex.errors && ex.errors.length) {
      errors._form = ex.errors[0];
      return errors;
    }
    errors._form = ex.message || "Validation failed.";
    return errors;
  }
}

export function isFormFieldVisible(field: FormFieldDefinition, formData: Record<string, unknown>) {
  if (!field.VisibleWhen) {
    return true;
  }
  const dependencyValue = formData[field.VisibleWhen.Key];
  return matchesConditionValue(dependencyValue, field.VisibleWhen.Equals);
}
