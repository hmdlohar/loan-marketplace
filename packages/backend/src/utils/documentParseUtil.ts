import { DOCUMENT_TYPE } from "commonlib";

export function buildDummyParsedData(documentType: DOCUMENT_TYPE) {
  if (documentType === DOCUMENT_TYPE.PAN) {
    return {
      firstName: "Rahul",
      lastName: "Sharma",
      panNumber: "ABCDE1234F",
      dob: "1990-05-15",
    };
  }

  if (documentType === DOCUMENT_TYPE.AADHAAR) {
    return {
      firstName: "Rahul",
      lastName: "Sharma",
      gender: "Male",
      dob: "1990-05-15",
      addressLine1: "42 MG Road",
      addressLine2: "Koramangala",
      pinCode: "560034",
      city: "Bengaluru",
      state: "Karnataka",
    };
  }

  return {};
}
