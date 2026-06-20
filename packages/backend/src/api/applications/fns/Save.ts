import * as yup from "yup";
import { IRPCFunctionDefinition } from "@root/types/rpc";
import { ICMSContext } from "@root/types/cms";
import { APPLICATION_STATUS, LOAN_PRODUCT, USER_ROLE, getStaticFormFields, validateFormDataOrThrow, validatePanAadhaarNameMatch } from "commonlib";
import ApplicationsService from "@root/api/applications/ApplicationsService";
import ProductsService from "@root/api/products/ProductsService";
import DocumentsService from "@root/api/documents/DocumentsService";
import UserService from "@root/api/user/UserService";
import { upsertCustomerProfileFromApplication, resolveApplicationFormData } from "@root/api/customers/fns/upsertProfileFromFormData";

const argsSchema = yup.object({
  _id: yup.string().optional(),
  LoanType: yup.string().oneOf(Object.values(LOAN_PRODUCT)).optional(),
  ProductID: yup.string().optional(),
  FormData: yup.mixed().default({}),
  Status: yup
    .string()
    .oneOf(Object.values(APPLICATION_STATUS))
    .optional(),
  DocumentIDs: yup
    .object({
      PAN: yup.string().optional(),
      AADHAAR: yup.string().optional(),
      SALARY_SLIP: yup.string().optional(),
      BANK_STATEMENT: yup.string().optional(),
      ITR: yup.string().optional(),
      GST_RETURN: yup.string().optional(),
      PROPERTY_DOCUMENT: yup.string().optional(),
    })
    .optional(),
});
export type ISaveArgs = yup.InferType<typeof argsSchema>;

type ISaveReturnType = any;

async function resolveFormDataWithAuthMobile(context: ICMSContext, userId: string, formData: Record<string, any>) {
  if (formData.mobile) {
    return formData;
  }

  const user = await UserService.context(context).get(userId);
  if (!user) {
    return formData;
  }

  const userObj = user.toObject ? user.toObject() : user;
  if (!userObj.Mobile) {
    return formData;
  }

  return {
    ...formData,
    mobile: userObj.Mobile,
  };
}

export async function Save(args: ISaveArgs, context: ICMSContext): Promise<ISaveReturnType> {
  if (!context.SystemUserID || context.SystemUserID === "DEFAULT") {
    throw new Error("Authentication required.");
  }

  const userId = context.SystemUserID;
  let formData = (args.FormData || {}) as Record<string, any>;
  formData = await resolveFormDataWithAuthMobile(context, userId, formData);
  const status = args.Status || APPLICATION_STATUS.CREATED;

  if (args._id) {
    const application = await ApplicationsService.context(context).get_Throwable(args._id);
    if (application.UserID !== userId) {
      throw new Error("You do not have access to this application.");
    }

    if (args.ProductID) {
      const product = await ProductsService.context(context).get_Throwable(args.ProductID);
      const productObj = product.toObject ? product.toObject() : product;
      const applicationObj = application.toObject ? application.toObject() : application;
      if (productObj.LoanType !== applicationObj.LoanType) {
        throw new Error("Product loan type does not match the application.");
      }
    }

    const updatePayload: Record<string, any> = {
      FormData: formData,
      Status: status,
    };
    if (args.DocumentIDs) {
      updatePayload.DocumentIDs = args.DocumentIDs;
    }
    if (args.ProductID) {
      updatePayload.ProductID = args.ProductID;
    }

    const applicationObj = application.toObject ? application.toObject() : application;
    const existingApplicationFormData =
      applicationObj.FormData && typeof applicationObj.FormData === "object"
        ? (applicationObj.FormData as Record<string, any>)
        : {};
    formData = await resolveApplicationFormData(context, userId, existingApplicationFormData, formData);
    updatePayload.FormData = formData;

    if (status === APPLICATION_STATUS.PENDING_FORM) {
      const documentIds = args.DocumentIDs || applicationObj.DocumentIDs || {};
      const panId = documentIds.PAN;
      const aadhaarId = documentIds.AADHAAR;

      if (panId && aadhaarId) {
        const panDocument = await DocumentsService.context(context).get_Throwable(panId);
        const aadhaarDocument = await DocumentsService.context(context).get_Throwable(aadhaarId);
        const panObj = panDocument.toObject ? panDocument.toObject() : panDocument;
        const aadhaarObj = aadhaarDocument.toObject ? aadhaarDocument.toObject() : aadhaarDocument;
        const nameMismatchError = validatePanAadhaarNameMatch(
          panObj.ParsedData as Record<string, unknown> | undefined,
          aadhaarObj.ParsedData as Record<string, unknown> | undefined
        );
        if (nameMismatchError) {
          throw new Error(nameMismatchError);
        }
      }
    }

    if (status === APPLICATION_STATUS.UNDER_REVIEW) {
      const loanType = (args.LoanType || applicationObj.LoanType) as LOAN_PRODUCT;
      const fields = getStaticFormFields(loanType);
      await validateFormDataOrThrow(fields, formData);
    }

    let updated = await ApplicationsService.context(context).update(args._id, updatePayload);

    if (
      status === APPLICATION_STATUS.UNDER_REVIEW ||
      status === APPLICATION_STATUS.PENDING_DOCUMENTS ||
      status === APPLICATION_STATUS.PENDING_FORM ||
      status === APPLICATION_STATUS.PARTNER_ASSIGNED
    ) {
      const mobile = formData.mobile || "";
      const customer = await upsertCustomerProfileFromApplication(context, userId, mobile, formData);
      if (customer && customer._id && updated.CustomerID !== customer._id) {
        updated = await ApplicationsService.context(context).update(args._id, {
          CustomerID: customer._id,
        });
      }
    }

    return updated;
  }

  if (!args.LoanType) {
    throw new Error("LoanType is required when creating an application.");
  }

  if (args.ProductID) {
    const product = await ProductsService.context(context).get_Throwable(args.ProductID);
    const productObj = product.toObject ? product.toObject() : product;
    if (productObj.LoanType !== args.LoanType) {
      throw new Error("Product loan type does not match the application loan type.");
    }
  }

  const application = await ApplicationsService.context(context).create({
    UserID: userId,
    LoanType: args.LoanType,
    ProductID: args.ProductID || undefined,
    Status: status,
    FormData: formData,
    DocumentIDs: args.DocumentIDs || {},
  });

  return application;
}

const definition: IRPCFunctionDefinition = {
  callback: Save,
  argsSchema,
  access: {
    allow: [USER_ROLE.AUTHENTICATED, USER_ROLE.CUSTOMER],
  },
};
export default definition;
