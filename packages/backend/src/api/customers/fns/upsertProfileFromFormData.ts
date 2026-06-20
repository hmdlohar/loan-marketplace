import CustomersService from "@root/api/customers/CustomersService";
import { ICMSContext } from "@root/types/cms";

export function extractCustomerProfileFromFormData(formData: Record<string, any>) {
  const firstName = formData.firstName || formData.first_name || "";
  const middleName = formData.middleName || formData.middle_name || "";
  const lastName = formData.lastName || formData.last_name || "";
  const fullName = formData.fullName || formData.full_name || "";
  const composedFullName = fullName || [firstName, middleName, lastName].filter(Boolean).join(" ").trim();

  return {
    FirstName: firstName || undefined,
    MiddleName: middleName || undefined,
    LastName: lastName || undefined,
    FullName: composedFullName || undefined,
    Email: formData.email || undefined,
    Mobile: formData.mobile || undefined,
    DOB: formData.dob || undefined,
    Gender: formData.gender || undefined,
    PANNumber: formData.panNumber || formData.pan_number || undefined,
    AddressLine1: formData.addressLine1 || formData.address_line1 || undefined,
    AddressLine2: formData.addressLine2 || formData.address_line2 || undefined,
    PinCode: formData.pinCode || formData.pin_code ? String(formData.pinCode || formData.pin_code) : undefined,
    City: formData.city || undefined,
    State: formData.state || undefined,
    EmploymentType: formData.employmentType || formData.employment || formData.occupation || undefined,
    NetIncome: formData.netIncome || formData.income ? Number(formData.netIncome || formData.income) : undefined,
  };
}

function buildStoredFormData(formData: Record<string, any>) {
  const stored: Record<string, any> = {};
  const keys = Object.keys(formData || {});
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const value = formData[key];
    if (value !== undefined && value !== null && value !== "") {
      stored[key] = value;
    }
  }
  return stored;
}

function mergeStoredFormData(existingFormData: Record<string, any>, incomingFormData: Record<string, any>) {
  const merged: Record<string, any> = {};
  const existingKeys = Object.keys(existingFormData || {});
  for (let i = 0; i < existingKeys.length; i++) {
    merged[existingKeys[i]] = existingFormData[existingKeys[i]];
  }
  const incomingKeys = Object.keys(incomingFormData || {});
  for (let i = 0; i < incomingKeys.length; i++) {
    const key = incomingKeys[i];
    merged[key] = incomingFormData[key];
  }
  return merged;
}

export function buildFormDataFromCustomerProfile(customer: Record<string, any>) {
  const explicitFormData: Record<string, any> = {};
  if (customer.Mobile) {
    explicitFormData.mobile = customer.Mobile;
  }
  if (customer.FirstName) {
    explicitFormData.firstName = customer.FirstName;
  }
  if (customer.MiddleName) {
    explicitFormData.middleName = customer.MiddleName;
  }
  if (customer.LastName) {
    explicitFormData.lastName = customer.LastName;
  }
  if (customer.FullName) {
    explicitFormData.fullName = customer.FullName;
  }
  if (customer.Email) {
    explicitFormData.email = customer.Email;
  }
  if (customer.DOB) {
    explicitFormData.dob = customer.DOB;
  }
  if (customer.Gender) {
    explicitFormData.gender = customer.Gender;
  }
  if (customer.PANNumber) {
    explicitFormData.panNumber = customer.PANNumber;
  }
  if (customer.AddressLine1) {
    explicitFormData.addressLine1 = customer.AddressLine1;
  }
  if (customer.AddressLine2) {
    explicitFormData.addressLine2 = customer.AddressLine2;
  }
  if (customer.PinCode) {
    explicitFormData.pinCode = String(customer.PinCode);
  }
  if (customer.City) {
    explicitFormData.city = customer.City;
  }
  if (customer.State) {
    explicitFormData.state = customer.State;
  }
  if (customer.EmploymentType) {
    explicitFormData.employmentType = customer.EmploymentType;
  }
  if (customer.NetIncome !== undefined && customer.NetIncome !== null && customer.NetIncome !== "") {
    explicitFormData.netIncome = String(customer.NetIncome);
  }

  const storedFormData =
    customer.FormData && typeof customer.FormData === "object" ? (customer.FormData as Record<string, any>) : {};
  return mergeStoredFormData(explicitFormData, storedFormData);
}

export async function resolveApplicationFormData(
  context: ICMSContext,
  userId: string,
  existingApplicationFormData: Record<string, any>,
  incomingFormData: Record<string, any>
) {
  const customer = await CustomersService.context(context).findOne({ UserID: userId });
  let profileFormData: Record<string, any> = {};
  if (customer) {
    const customerObj = customer.toObject ? customer.toObject() : customer;
    profileFormData = buildFormDataFromCustomerProfile(customerObj);
  }

  const incomingClean = buildStoredFormData(incomingFormData);
  return mergeStoredFormData(mergeStoredFormData(profileFormData, existingApplicationFormData || {}), incomingClean);
}

function buildProfilePayload(
  userId: string,
  profilePatch: ReturnType<typeof extractCustomerProfileFromFormData>,
  mobile: string,
  formData: Record<string, any>
) {
  return {
    UserID: userId,
    Mobile: mobile,
    FirstName: profilePatch.FirstName,
    MiddleName: profilePatch.MiddleName,
    LastName: profilePatch.LastName,
    FullName: profilePatch.FullName,
    Email: profilePatch.Email,
    DOB: profilePatch.DOB,
    Gender: profilePatch.Gender,
    PANNumber: profilePatch.PANNumber,
    AddressLine1: profilePatch.AddressLine1,
    AddressLine2: profilePatch.AddressLine2,
    PinCode: profilePatch.PinCode,
    City: profilePatch.City,
    State: profilePatch.State,
    EmploymentType: profilePatch.EmploymentType,
    NetIncome: profilePatch.NetIncome,
    FormData: buildStoredFormData(formData),
  };
}

async function upsertCustomerProfile(
  context: ICMSContext,
  payload: ReturnType<typeof buildProfilePayload>,
  formData: Record<string, any>
) {
  const existing = await CustomersService.context(context).findOne({ UserID: payload.UserID });
  const incomingStoredFormData = buildStoredFormData(formData);

  if (existing) {
    const updatePayload: Record<string, any> = {};
    const keys = Object.keys(payload) as (keyof typeof payload)[];
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      if (key === "UserID" || key === "FormData") {
        continue;
      }
      const value = payload[key];
      if (value !== undefined && value !== null && value !== "") {
        updatePayload[key] = value;
      }
    }

    const existingStoredFormData =
      existing.FormData && typeof existing.FormData === "object" ? (existing.FormData as Record<string, any>) : {};
    updatePayload.FormData = mergeStoredFormData(existingStoredFormData, incomingStoredFormData);
    return CustomersService.context(context).update(existing._id, updatePayload);
  }

  return CustomersService.context(context).create(payload);
}

export async function upsertCustomerProfileFromApplication(
  context: ICMSContext,
  userId: string,
  mobile: string,
  formData: Record<string, any>
) {
  const profilePatch = extractCustomerProfileFromFormData(formData);
  const payload = buildProfilePayload(userId, profilePatch, profilePatch.Mobile || mobile, formData);
  return upsertCustomerProfile(context, payload, formData);
}

export async function upsertCustomerProfileFromParsedData(
  context: ICMSContext,
  userId: string,
  parsedFields: Record<string, any>
) {
  const existing = await CustomersService.context(context).findOne({ UserID: userId });
  const profilePatch = extractCustomerProfileFromFormData(parsedFields);
  const mobile = profilePatch.Mobile || existing?.Mobile || "";

  if (!mobile && !existing) {
    return null;
  }

  const payload = buildProfilePayload(userId, profilePatch, mobile, parsedFields);
  return upsertCustomerProfile(context, payload, parsedFields);
}
