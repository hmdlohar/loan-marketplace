import * as yup from "yup";
import { IRPCFunctionDefinition } from "@root/types/rpc";
import { ICMSContext } from "@root/types/cms";
import { USER_ROLE } from "commonlib";
import ProductsService from "@root/api/products/ProductsService";
import { assertPartnerAccess } from "@root/utils/partnerAccessUtil";

const argsSchema = yup.object({
  _id: yup.string().required(),
});
export type IGetArgs = yup.InferType<typeof argsSchema>;

type IGetReturnType = any;

export async function Get(args: IGetArgs, context: ICMSContext): Promise<IGetReturnType> {
  const product = await ProductsService.context(context).get_Throwable(args._id);
  await assertPartnerAccess(context, product.PartnerID);
  return product;
}

const definition: IRPCFunctionDefinition = {
  callback: Get,
  argsSchema,
  access: {
    allow: [USER_ROLE.SYSTEM_ADMIN, USER_ROLE.PARTNER],
  },
};
export default definition;
