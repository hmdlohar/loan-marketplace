import * as yup from "yup";
import { IRPCFunctionDefinition } from "@root/types/rpc";
import { ICMSContext } from "@root/types/cms";
import { APPLICATION_STATUS, USER_ROLE } from "commonlib";
import ApplicationsService from "@root/api/applications/ApplicationsService";
import ProductsService from "@root/api/products/ProductsService";
import BanksService from "@root/api/banks/BanksService";
import CustomersService from "@root/api/customers/CustomersService";
import { getPartnerIdsForUser } from "@root/utils/partnerAccessUtil";

const reviewStatuses = [
  APPLICATION_STATUS.PARTNER_ASSIGNED,
  APPLICATION_STATUS.APPROVED,
  APPLICATION_STATUS.REJECTED,
  APPLICATION_STATUS.DISBURSED,
];

const argsSchema = yup.object({
  page: yup.number().integer().min(1).default(1),
  pageSize: yup.number().integer().min(1).max(100).default(20),
  status: yup.string().oneOf(reviewStatuses).optional(),
});
export type IListForReviewArgs = yup.InferType<typeof argsSchema>;

type IListForReviewReturnType = {
  items: any[];
  total: number;
  page: number;
  pageSize: number;
};

export async function ListForReview(
  args: IListForReviewArgs,
  context: ICMSContext
): Promise<IListForReviewReturnType> {
  const page = args.page || 1;
  const pageSize = args.pageSize || 20;
  const partnerIds = await getPartnerIdsForUser(context);

  const filter: Record<string, any> = {};
  if (args.status) {
    filter.Status = args.status;
  } else {
    filter.Status = { $in: reviewStatuses };
  }

  if (partnerIds) {
    const partnerProducts = await ProductsService.context(context).list({
      filter: { PartnerID: { $in: partnerIds } },
      project: { _id: 1 },
      page: 1,
      pageSize: 1000,
    });
    const productIds = partnerProducts.map((product) => product._id);
    if (!productIds.length) {
      return { items: [], total: 0, page, pageSize };
    }
    filter.ProductID = { $in: productIds };
  }

  const items = await ApplicationsService.context(context).list({
    filter,
    sort: "ModifiedAt",
    sortOrder: "desc",
    page,
    pageSize,
  });

  const total = await ApplicationsService.context(context).count({ filter });

  const enrichedItems = [];
  for (let i = 0; i < items.length; i++) {
    const application = items[i];
    const applicationObj = typeof application.toObject === "function" ? application.toObject() : application;

    let product = null;
    let bank = null;
    if (applicationObj.ProductID) {
      const productDoc = await ProductsService.context(context).findOne({ _id: applicationObj.ProductID });
      if (productDoc) {
        const productObj = productDoc.toObject ? productDoc.toObject() : productDoc;
        product = {
          _id: productObj._id,
          Title: productObj.Title,
          LoanType: productObj.LoanType,
          PartnerID: productObj.PartnerID,
        };
        if (productObj.BankID) {
          const bankDoc = await BanksService.context(context).findOne({ _id: productObj.BankID });
          if (bankDoc) {
            const bankObj = bankDoc.toObject ? bankDoc.toObject() : bankDoc;
            bank = { _id: bankObj._id, Name: bankObj.Name, LogoPath: bankObj.LogoPath };
          }
        }
      }
    }

    let borrowerName = applicationObj.FormData?.fullName || applicationObj.FormData?.firstName || "";
    if (!borrowerName && applicationObj.CustomerID) {
      const customerDoc = await CustomersService.context(context).findOne({ _id: applicationObj.CustomerID });
      if (customerDoc) {
        borrowerName = customerDoc.FullName || customerDoc.Mobile || "";
      }
    }

    enrichedItems.push({
      ...applicationObj,
      BorrowerName: borrowerName,
      Product: product,
      Bank: bank,
    });
  }

  return {
    items: enrichedItems,
    total,
    page,
    pageSize,
  };
}

const definition: IRPCFunctionDefinition = {
  callback: ListForReview,
  argsSchema,
  access: {
    allow: [USER_ROLE.SYSTEM_ADMIN, USER_ROLE.PARTNER],
  },
};
export default definition;
