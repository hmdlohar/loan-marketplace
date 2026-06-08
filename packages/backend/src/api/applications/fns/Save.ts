import * as yup from "yup";
import { IRPCFunctionDefinition } from "@root/types/rpc";
import { ICMSContext } from "@root/types/cms";
import { APPLICATION_STATUS, USER_ROLE } from "commonlib";
import ApplicationsService from "@root/api/applications/ApplicationsService";
import ProductsService from "@root/api/products/ProductsService";
import { upsertCustomerProfileFromApplication } from "@root/utils/customerProfileUtil";

const argsSchema = yup.object({
  _id: yup.string().optional(),
  ProductID: yup.string().required(),
  FormData: yup.object().default({}),
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

export async function Save(args: ISaveArgs, context: ICMSContext): Promise<ISaveReturnType> {
  if (!context.SystemUserID || context.SystemUserID === "DEFAULT") {
    throw new Error("Authentication required.");
  }

  await ProductsService.context(context).get_Throwable(args.ProductID);
  const userId = context.SystemUserID;
  const formData = (args.FormData || {}) as Record<string, any>;
  const status = args.Status || APPLICATION_STATUS.CREATED;

  if (args._id) {
    const application = await ApplicationsService.context(context).get_Throwable(args._id);
    if (application.UserID !== userId) {
      throw new Error("You do not have access to this application.");
    }

    const updatePayload: Record<string, any> = {
      FormData: formData,
      Status: status,
    };
    if (args.DocumentIDs) {
      updatePayload.DocumentIDs = args.DocumentIDs;
    }

    let updated = await ApplicationsService.context(context).update(args._id, updatePayload);

    if (
      status === APPLICATION_STATUS.UNDER_REVIEW ||
      status === APPLICATION_STATUS.PENDING_DOCUMENTS ||
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

  const application = await ApplicationsService.context(context).create({
    UserID: userId,
    ProductID: args.ProductID,
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
