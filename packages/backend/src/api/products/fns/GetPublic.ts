import * as yup from "yup";
import { IRPCFunctionDefinition } from "@root/types/rpc";
import { ICMSContext } from "@root/types/cms";
import { getFullFormFields, USER_ROLE } from "commonlib";
import ProductsService from "@root/api/products/ProductsService";
import BanksService from "@root/api/banks/BanksService";

const argsSchema = yup.object({
  slug: yup.string().optional(),
  _id: yup.string().optional(),
});
export type IGetPublicArgs = yup.InferType<typeof argsSchema>;

type IGetPublicReturnType = any;

export async function GetPublic(args: IGetPublicArgs, context: ICMSContext): Promise<IGetPublicReturnType> {
  if (!args.slug && !args._id) {
    throw new Error("Product slug or id is required.");
  }

  const filter: Record<string, any> = {};
  if (args._id) {
    filter._id = args._id;
  } else if (args.slug) {
    filter.Slug = args.slug;
  }

  const product = await ProductsService.context(context).findOne(filter);
  if (!product) {
    throw new Error("Product not found.");
  }

  const productObj = typeof product.toObject === "function" ? product.toObject() : product;
  let bank = null;
  if (productObj.BankID) {
    const bankDoc = await BanksService.context(context).findOne({ _id: productObj.BankID });
    if (bankDoc) {
      const bankObj = typeof bankDoc.toObject === "function" ? bankDoc.toObject() : bankDoc;
      bank = {
        _id: bankObj._id,
        Name: bankObj.Name,
        LogoPath: bankObj.LogoPath,
      };
    }
  }

  return {
    ...productObj,
    Bank: bank,
    FullFormFields: getFullFormFields(productObj),
  };
}

const definition: IRPCFunctionDefinition = {
  callback: GetPublic,
  argsSchema,
  access: {
    allow: [USER_ROLE.PUBLIC],
  },
};
export default definition;
