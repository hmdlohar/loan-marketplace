import * as yup from "yup";
import { IRPCFunctionDefinition } from "@root/types/rpc";
import { ICMSContext } from "@root/types/cms";
import { USER_ROLE } from "commonlib";
import ProductsService from "@root/api/products/ProductsService";
import { assertPartnerAccess } from "@root/utils/partnerAccessUtil";

const argsSchema = yup.object({
  _id: yup.string().required(),
});
export type IDeleteArgs = yup.InferType<typeof argsSchema>;

type IDeleteReturnType = { success: boolean };

export async function Delete(args: IDeleteArgs, context: ICMSContext): Promise<IDeleteReturnType> {
  const product = await ProductsService.context(context).get_Throwable(args._id);
  await assertPartnerAccess(context, product.PartnerID);
  await ProductsService.context(context).delete(args._id);
  return { success: true };
}

const definition: IRPCFunctionDefinition = {
  callback: Delete,
  argsSchema,
  access: {
    allow: [USER_ROLE.SYSTEM_ADMIN, USER_ROLE.PARTNER],
  },
};
export default definition;
