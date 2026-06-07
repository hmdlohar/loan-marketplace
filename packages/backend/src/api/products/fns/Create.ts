import * as yup from "yup";
import { IRPCFunctionDefinition } from "@root/types/rpc";
import { ICMSContext } from "@root/types/cms";
import { LOAN_PRODUCT, USER_ROLE } from "commonlib";
import ProductsService from "@root/api/products/ProductsService";
import { getPartnerIdsForUser, getDefaultProductFormFields } from "@root/utils/partnerAccessUtil";
import { slugifyTitle } from "@root/utils/slugUtil";

const argsSchema = yup.object({
  Title: yup.string().required(),
  ShortDescription: yup.string().required(),
  LongDescription: yup.string().required(),
  LoanType: yup.string().oneOf(Object.values(LOAN_PRODUCT)).required(),
});
export type ICreateArgs = yup.InferType<typeof argsSchema>;

type ICreateReturnType = any;

export async function Create(args: ICreateArgs, context: ICMSContext): Promise<ICreateReturnType> {
  const partnerIds = await getPartnerIdsForUser(context);
  if (!partnerIds || partnerIds.length !== 1) {
    throw new Error("Partner user must be linked to exactly one partner to create products.");
  }

  const partnerId = partnerIds[0];
  const slug = slugifyTitle(args.Title);

  const existing = await ProductsService.context(context).findOne({
    PartnerID: partnerId,
    Slug: slug,
  });
  if (existing) {
    throw new Error("A product with this title already exists for your partner.");
  }

  const product = await ProductsService.context(context).create({
    Title: args.Title,
    Slug: slug,
    ShortDescription: args.ShortDescription,
    LongDescription: args.LongDescription,
    LoanType: args.LoanType,
    PartnerID: partnerId,
    FormFields: getDefaultProductFormFields() as any,
  });

  return product;
}

const definition: IRPCFunctionDefinition = {
  callback: Create,
  argsSchema,
  access: {
    allow: [USER_ROLE.PARTNER],
  },
};
export default definition;
