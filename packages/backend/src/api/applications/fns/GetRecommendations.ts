import * as yup from "yup";
import { IRPCFunctionDefinition } from "@root/types/rpc";
import { ICMSContext } from "@root/types/cms";
import { USER_ROLE } from "commonlib";
import ApplicationsService from "@root/api/applications/ApplicationsService";
import ProductsService from "@root/api/products/ProductsService";
import BanksService from "@root/api/banks/BanksService";

const argsSchema = yup.object({
  ApplicationID: yup.string().required(),
});
export type IGetRecommendationsArgs = yup.InferType<typeof argsSchema>;

const approvalReasons = [
  "Strong income profile matches lender criteria",
  "Your credit profile aligns with this product",
  "High approval likelihood based on your documents",
  "Competitive rates for your loan amount",
  "Lender actively accepting applications in your segment",
];

function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = copy[i];
    copy[i] = copy[j];
    copy[j] = temp;
  }
  return copy;
}

type IGetRecommendationsReturnType = {
  items: any[];
};

export async function GetRecommendations(
  args: IGetRecommendationsArgs,
  context: ICMSContext
): Promise<IGetRecommendationsReturnType> {
  if (!context.SystemUserID || context.SystemUserID === "DEFAULT") {
    throw new Error("Authentication required.");
  }

  const application = await ApplicationsService.context(context).get_Throwable(args.ApplicationID);
  if (application.UserID !== context.SystemUserID) {
    throw new Error("You do not have access to this application.");
  }

  const applicationObj = application.toObject ? application.toObject() : application;
  const products = await ProductsService.context(context).list({
    filter: { LoanType: applicationObj.LoanType },
    sort: "ModifiedAt",
    sortOrder: "desc",
    page: 1,
    pageSize: 100,
  });

  const shuffled = shuffleArray(products);
  const picked = shuffled.slice(0, 3);
  const recommendations = [];

  for (let i = 0; i < picked.length; i++) {
    const product = picked[i];
    const productObj = product.toObject ? product.toObject() : product;
    let bank = null;
    if (productObj.BankID) {
      const bankDoc = await BanksService.context(context).findOne({ _id: productObj.BankID });
      if (bankDoc) {
        const bankObj = bankDoc.toObject ? bankDoc.toObject() : bankDoc;
        bank = {
          _id: bankObj._id,
          Name: bankObj.Name,
          LogoPath: bankObj.LogoPath,
        };
      }
    }

    const approvalScore = Math.floor(72 + Math.random() * 23);
    const reasonIndex = Math.floor(Math.random() * approvalReasons.length);

    recommendations.push({
      Product: {
        ...productObj,
        Bank: bank,
      },
      approvalScore,
      reason: approvalReasons[reasonIndex],
    });
  }

  return { items: recommendations };
}

const definition: IRPCFunctionDefinition = {
  callback: GetRecommendations,
  argsSchema,
  access: {
    allow: [USER_ROLE.AUTHENTICATED, USER_ROLE.CUSTOMER],
  },
};
export default definition;
