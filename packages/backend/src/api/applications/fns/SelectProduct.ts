import * as yup from "yup";
import { IRPCFunctionDefinition } from "@root/types/rpc";
import { ICMSContext } from "@root/types/cms";
import { APPLICATION_STATUS, USER_ROLE } from "commonlib";
import ApplicationsService from "@root/api/applications/ApplicationsService";
import ProductsService from "@root/api/products/ProductsService";

const argsSchema = yup.object({
  ApplicationID: yup.string().required(),
  ProductID: yup.string().required(),
});
export type ISelectProductArgs = yup.InferType<typeof argsSchema>;

type ISelectProductReturnType = any;

export async function SelectProduct(args: ISelectProductArgs, context: ICMSContext): Promise<ISelectProductReturnType> {
  if (!context.SystemUserID || context.SystemUserID === "DEFAULT") {
    throw new Error("Authentication required.");
  }

  const application = await ApplicationsService.context(context).get_Throwable(args.ApplicationID);
  if (application.UserID !== context.SystemUserID) {
    throw new Error("You do not have access to this application.");
  }

  const product = await ProductsService.context(context).get_Throwable(args.ProductID);
  const productObj = product.toObject ? product.toObject() : product;
  const applicationObj = application.toObject ? application.toObject() : application;

  if (productObj.LoanType !== applicationObj.LoanType) {
    throw new Error("Selected product does not match the application loan type.");
  }

  const updated = await ApplicationsService.context(context).update(args.ApplicationID, {
    ProductID: args.ProductID,
    Status: APPLICATION_STATUS.PARTNER_ASSIGNED,
  });

  return updated.toObject ? updated.toObject() : updated;
}

const definition: IRPCFunctionDefinition = {
  callback: SelectProduct,
  argsSchema,
  access: {
    allow: [USER_ROLE.AUTHENTICATED, USER_ROLE.CUSTOMER],
  },
};
export default definition;
