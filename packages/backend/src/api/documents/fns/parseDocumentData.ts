import { DOCUMENT_TYPE } from "commonlib";
import { generateText } from "@utils/llm";
import { getS3Object, guessContentType } from "@root/utils/s3Util";

export type ParseDocumentDataArgs = {
  documentType: DOCUMENT_TYPE;
  fileBuffer: Buffer;
  contentType: string;
  fileName?: string;
};

const PAN_NUMBER_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]$/;

function isImageContentType(contentType: string) {
  return contentType.startsWith("image/");
}

function extractJsonObject(text: string) {
  const trimmed = text.trim();
  if (!trimmed) {
    throw new Error("Document parser returned an empty response.");
  }

  try {
    const direct = JSON.parse(trimmed);
    if (direct && typeof direct === "object" && !Array.isArray(direct)) {
      return direct as Record<string, any>;
    }
  } catch {
    // fall through
  }

  const fencedMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fencedMatch?.[1]) {
    try {
      const fenced = JSON.parse(fencedMatch[1].trim());
      if (fenced && typeof fenced === "object" && !Array.isArray(fenced)) {
        return fenced as Record<string, any>;
      }
    } catch {
      // fall through
    }
  }

  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start !== -1 && end > start) {
    try {
      const sliced = JSON.parse(trimmed.slice(start, end + 1));
      if (sliced && typeof sliced === "object" && !Array.isArray(sliced)) {
        return sliced as Record<string, any>;
      }
    } catch {
      // fall through
    }
  }

  throw new Error("Document parser did not return valid JSON.");
}

function buildParseSystemPrompt() {
  return [
    "You extract structured data from Indian identity and financial documents.",
    "Return ONLY a JSON object. No markdown, no explanation.",
    "Use empty string for missing text fields.",
    "Dates must be YYYY-MM-DD when present.",
  ].join(" ");
}

function buildParseUserPrompt(documentType: DOCUMENT_TYPE) {
  if (documentType === DOCUMENT_TYPE.PAN) {
    return [
      "This image is an Indian PAN card.",
      "Extract JSON with keys: firstName, lastName, panNumber, dob.",
      "panNumber must be 10 characters: 5 letters, 4 digits, 1 letter (e.g. ABCDE1234F).",
    ].join(" ");
  }

  if (documentType === DOCUMENT_TYPE.AADHAAR) {
    return [
      "This image is an Indian Aadhaar card.",
      "Extract JSON with keys: firstName, lastName, gender, dob, addressLine1, addressLine2, pinCode, city, state.",
      "gender should be Male, Female, or Other when visible.",
    ].join(" ");
  }

  if (documentType === DOCUMENT_TYPE.SALARY_SLIP) {
    return [
      "This image is a salary slip.",
      "Extract JSON with keys: firstName, lastName, employer, netIncome, payPeriod.",
      "netIncome should be a number (monthly net pay in INR). payPeriod as YYYY-MM when visible.",
    ].join(" ");
  }

  if (documentType === DOCUMENT_TYPE.BANK_STATEMENT) {
    return [
      "This image is a bank statement.",
      "Extract JSON with keys: bankName, accountHolderName, statementPeriod.",
      "statementPeriod as a human-readable range when visible.",
    ].join(" ");
  }

  if (documentType === DOCUMENT_TYPE.ITR) {
    return [
      "This image is an Indian income tax return (ITR) document.",
      "Extract JSON with keys: firstName, lastName, panNumber, assessmentYear, totalIncome.",
      "totalIncome as a number when visible.",
    ].join(" ");
  }

  if (documentType === DOCUMENT_TYPE.GST_RETURN) {
    return [
      "This image is a GST return document.",
      "Extract JSON with keys: businessName, gstin, returnPeriod, taxableTurnover.",
      "taxableTurnover as a number when visible.",
    ].join(" ");
  }

  if (documentType === DOCUMENT_TYPE.PROPERTY_DOCUMENT) {
    return [
      "This image is a property document.",
      "Extract JSON with keys: ownerName, propertyAddress, city, state, pinCode.",
    ].join(" ");
  }

  return "Extract any clearly visible structured fields as a flat JSON object.";
}

function normalizePanFields(raw: Record<string, any>) {
  const panNumber = String(raw.panNumber || raw.pan_number || "")
    .trim()
    .toUpperCase();
  if (panNumber && !PAN_NUMBER_REGEX.test(panNumber)) {
    throw new Error(`Extracted PAN number "${panNumber}" is not valid.`);
  }

  return {
    firstName: String(raw.firstName || raw.first_name || "").trim(),
    lastName: String(raw.lastName || raw.last_name || "").trim(),
    panNumber,
    dob: String(raw.dob || raw.dateOfBirth || raw.date_of_birth || "").trim(),
  };
}

function normalizeAadhaarFields(raw: Record<string, any>) {
  return {
    firstName: String(raw.firstName || raw.first_name || "").trim(),
    lastName: String(raw.lastName || raw.last_name || "").trim(),
    gender: String(raw.gender || "").trim(),
    dob: String(raw.dob || raw.dateOfBirth || raw.date_of_birth || "").trim(),
    addressLine1: String(raw.addressLine1 || raw.address_line1 || raw.address || "").trim(),
    addressLine2: String(raw.addressLine2 || raw.address_line2 || "").trim(),
    pinCode: String(raw.pinCode || raw.pin_code || "").trim(),
    city: String(raw.city || "").trim(),
    state: String(raw.state || "").trim(),
  };
}

function normalizeSalarySlipFields(raw: Record<string, any>) {
  const netIncomeRaw = raw.netIncome ?? raw.net_income ?? raw.income;
  const netIncome =
    netIncomeRaw === undefined || netIncomeRaw === null || netIncomeRaw === ""
      ? undefined
      : Number(netIncomeRaw);

  return {
    firstName: String(raw.firstName || raw.first_name || raw.employeeName || "").trim(),
    lastName: String(raw.lastName || raw.last_name || "").trim(),
    employer: String(raw.employer || raw.company || "").trim(),
    netIncome: Number.isFinite(netIncome) ? netIncome : undefined,
    payPeriod: String(raw.payPeriod || raw.pay_period || "").trim(),
  };
}

function normalizeParsedFields(documentType: DOCUMENT_TYPE, raw: Record<string, any>) {
  if (documentType === DOCUMENT_TYPE.PAN) {
    return normalizePanFields(raw);
  }
  if (documentType === DOCUMENT_TYPE.AADHAAR) {
    return normalizeAadhaarFields(raw);
  }
  if (documentType === DOCUMENT_TYPE.SALARY_SLIP) {
    return normalizeSalarySlipFields(raw);
  }
  return raw;
}

function getDocumentLabel(documentType: DOCUMENT_TYPE) {
  if (documentType === DOCUMENT_TYPE.PAN) {
    return "PAN card";
  }
  if (documentType === DOCUMENT_TYPE.AADHAAR) {
    return "Aadhaar card";
  }
  return documentType.replace(/_/g, " ").toLowerCase();
}

/**
 * Parse a document image buffer with the LLM and return structured fields for storage in `ParsedData`.
 */
export async function parseDocumentData(args: ParseDocumentDataArgs) {
  if (!isImageContentType(args.contentType)) {
    const label = getDocumentLabel(args.documentType);
    throw new Error(
      `Document parsing supports image uploads only. Upload a JPG or PNG photo of the ${label}.`,
    );
  }

  const result = await generateText({
    system: buildParseSystemPrompt(),
    text: buildParseUserPrompt(args.documentType),
    images: [{ data: args.fileBuffer, mediaType: args.contentType }],
    maxOutputTokens: 2048,
    temperature: 0.1,
  });

  const raw = extractJsonObject(result.text);
  return normalizeParsedFields(args.documentType, raw);
}

/**
 * Load a document from S3 and parse it.
 */
export async function parseDocumentFromStorage(args: {
  documentType: DOCUMENT_TYPE;
  storagePath: string;
  fileName?: string;
}) {
  const s3Object = await getS3Object(args.storagePath);
  const body = s3Object.Body;
  if (!body) {
    throw new Error("Document file is missing from storage.");
  }

  const bytes = await body.transformToByteArray();
  const fileBuffer = Buffer.from(bytes);
  const contentType = s3Object.ContentType || guessContentType(args.storagePath);

  return parseDocumentData({
    documentType: args.documentType,
    fileBuffer,
    contentType,
    fileName: args.fileName,
  });
}
