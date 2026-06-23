import * as yup from "yup";
import { IRPCFunctionDefinition } from "@root/types/rpc";
import { ICMSContext } from "@root/types/cms";
import { LOAN_PRODUCT, USER_ROLE } from "commonlib";
import ProductsService from "@root/api/products/ProductsService";
import BanksService from "@root/api/banks/BanksService";
import { assertPartnerAccess, getPartnerIdsForUser } from "@root/utils/partnerAccessUtil";
import { slugifyTitle } from "@root/utils/slugUtil";

const argsSchema = yup.object({
  _id: yup.string().optional(),
  Title: yup.string().required(),
  ShortDescription: yup.string().required(),
  KeyBenefits: yup.array().of(yup.string().required()).default([]),
  LoanType: yup.string().oneOf(Object.values(LOAN_PRODUCT)).required(),
  BankID: yup.string().required(),
  FormFields: yup
    .array()
    .of(
      yup.object({
        Key: yup.string().required(),
        Label: yup.string().required(),
        Type: yup.string().required(),
        Section: yup.string().optional(),
        Required: yup.boolean().required(),
        Placeholder: yup.string().optional(),
        Options: yup.array().of(yup.string().required()).optional(),
        Validation: yup
          .object({
            min: yup.number().optional(),
            max: yup.number().optional(),
            minAge: yup.number().optional(),
            maxAge: yup.number().optional(),
            errorMessage: yup.string().optional(),
          })
          .optional(),
      })
    )
    .default([]),
  Eligibility: yup
    .object({
      InterestRateMin: yup.number().optional(),
      InterestRateMax: yup.number().optional(),
      MinLoanAmount: yup.number().optional(),
      MaxLoanAmount: yup.number().optional(),
      MinMonthlyIncome: yup.number().optional(),
      MinAge: yup.number().optional(),
      MaxAge: yup.number().optional(),
      MinTenureMonths: yup.number().optional(),
      MaxTenureMonths: yup.number().optional(),
      AllowedEmploymentTypes: yup.array().of(yup.string().required()).optional(),
    })
    .optional(),
});
export type ISaveArgs = yup.InferType<typeof argsSchema>;

type ISaveReturnType = any;

export async function Save(args: ISaveArgs, context: ICMSContext): Promise<ISaveReturnType> {
  await BanksService.context(context).get_Throwable(args.BankID);

  const slug = slugifyTitle(args.Title);
  const formFields = (args.FormFields || []) as any;

  if (args._id) {
    const product = await ProductsService.context(context).get_Throwable(args._id);
    await assertPartnerAccess(context, product.PartnerID);

    const duplicate = await ProductsService.context(context).findOne({
      PartnerID: product.PartnerID,
      Slug: slug,
      _id: { $ne: args._id },
    });
    if (duplicate) {
      throw new Error("A product with this title already exists for your partner.");
    }

    return ProductsService.context(context).update(args._id, {
      Title: args.Title,
      Slug: slug,
      ShortDescription: args.ShortDescription,
      KeyBenefits: args.KeyBenefits || [],
      LoanType: args.LoanType,
      BankID: args.BankID,
      FormFields: formFields,
      Eligibility: args.Eligibility,
    });
  }

  const partnerIds = await getPartnerIdsForUser(context);
  if (!partnerIds || partnerIds.length !== 1) {
    throw new Error("Partner user must be linked to exactly one partner to create products.");
  }

  const partnerId = partnerIds[0];
  const duplicate = await ProductsService.context(context).findOne({
    PartnerID: partnerId,
    Slug: slug,
  });
  if (duplicate) {
    throw new Error("A product with this title already exists for your partner.");
  }

  return ProductsService.context(context).create({
    Title: args.Title,
    Slug: slug,
    ShortDescription: args.ShortDescription,
    KeyBenefits: args.KeyBenefits || [],
    LoanType: args.LoanType,
    BankID: args.BankID,
    PartnerID: partnerId,
    FormFields: formFields,
    Eligibility: args.Eligibility,
  });
}

const definition: IRPCFunctionDefinition = {
  callback: Save,
  argsSchema,
  access: {
    allow: [USER_ROLE.SYSTEM_ADMIN, USER_ROLE.PARTNER],
  },
};
export default definition;
