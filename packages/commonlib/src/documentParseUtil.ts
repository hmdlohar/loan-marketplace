export function getDocumentParsedFullName(parsedData?: Record<string, unknown> | null) {
  if (!parsedData || typeof parsedData !== "object") {
    return "";
  }

  const firstName = String(parsedData.firstName || parsedData.first_name || "").trim();
  const lastName = String(parsedData.lastName || parsedData.last_name || "").trim();
  return `${firstName} ${lastName}`.trim();
}

export function normalizePersonName(name: string) {
  return name.trim().replace(/\s+/g, " ").toUpperCase();
}

export function validatePanAadhaarNameMatch(
  panParsedData?: Record<string, unknown> | null,
  aadhaarParsedData?: Record<string, unknown> | null
) {
  const panDisplayName = getDocumentParsedFullName(panParsedData);
  const aadhaarDisplayName = getDocumentParsedFullName(aadhaarParsedData);
  const panName = normalizePersonName(panDisplayName);
  const aadhaarName = normalizePersonName(aadhaarDisplayName);

  if (!panName) {
    return "We could not read the name from your PAN card. Please upload a clearer document.";
  }

  if (!aadhaarName) {
    return "We could not read the name from your Aadhaar card. Please upload a clearer document.";
  }

  if (panName !== aadhaarName) {
    return `The name on your PAN card (${panDisplayName}) does not match the name on your Aadhaar card (${aadhaarDisplayName}). Please upload matching documents.`;
  }

  return null;
}
