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

export async function upsertCustomerProfileFromApplication(
  context: ICMSContext,
  userId: string,
  mobile: string,
  formData: Record<string, any>
) {
  const profilePatch = extractCustomerProfileFromFormData(formData);
  const existing = await CustomersService.context(context).findOne({ UserID: userId });

  const payload = {
    UserID: userId,
    Mobile: profilePatch.Mobile || mobile,
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
  };

  if (existing) {
    const updatePayload: Record<string, any> = {};
    const keys = Object.keys(payload) as (keyof typeof payload)[];
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      if (key === "UserID") {
        continue;
      }
      const value = payload[key];
      if (value !== undefined && value !== null && value !== "") {
        updatePayload[key] = value;
      }
    }
    return CustomersService.context(context).update(existing._id, updatePayload);
  }

  return CustomersService.context(context).create(payload);
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

  const payload = {
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
  };

  if (existing) {
    const updatePayload: Record<string, any> = {};
    const keys = Object.keys(payload) as (keyof typeof payload)[];
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      if (key === "UserID") {
        continue;
      }
      const value = payload[key];
      if (value !== undefined && value !== null && value !== "") {
        updatePayload[key] = value;
      }
    }
    return CustomersService.context(context).update(existing._id, updatePayload);
  }

  return CustomersService.context(context).create(payload);
}
