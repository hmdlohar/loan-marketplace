import * as yup from "yup";
import { IRPCFunctionDefinition } from "@root/types/rpc";
import { ICMSContext } from "@root/types/cms";
import { LOAN_PRODUCT, USER_ROLE } from "commonlib";
import ProductsService from "@root/api/products/ProductsService";
import { assertPartnerAccess } from "@root/utils/partnerAccessUtil";
import { slugifyTitle } from "@root/utils/slugUtil";

const argsSchema = yup.object({
  _id: yup.string().required(),
  Title: yup.string().required(),
  ShortDescription: yup.string().required(),
  LongDescription: yup.string().required(),
  LoanType: yup.string().oneOf(Object.values(LOAN_PRODUCT)).required(),
});
export type IUpdateArgs = yup.InferType<typeof argsSchema>;

type IUpdateReturnType = any;

export async function Update(args: IUpdateArgs, context: ICMSContext): Promise<IUpdateReturnType> {
  const product = await ProductsService.context(context).get_Throwable(args._id);
  await assertPartnerAccess(context, product.PartnerID);

  const slug = slugifyTitle(args.Title);
  const duplicate = await ProductsService.context(context).findOne({
    PartnerID: product.PartnerID,
    Slug: slug,
    _id: { $ne: args._id },
  });
  if (duplicate) {
    throw new Error("A product with this title already exists for your partner.");
  }

  const updated = await ProductsService.context(context).update(args._id, {
    Title: args.Title,
    Slug: slug,
    ShortDescription: args.ShortDescription,
    LongDescription: args.LongDescription,
    LoanType: args.LoanType,
  });

  return updated;
}

const definition: IRPCFunctionDefinition = {
  callback: Update,
  argsSchema,
  access: {
    allow: [USER_ROLE.SYSTEM_ADMIN, USER_ROLE.PARTNER],
  },
};
export default definition;
