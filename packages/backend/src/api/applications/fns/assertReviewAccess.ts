import { ICMSContext } from "@root/types/cms";
import ProductsService from "@root/api/products/ProductsService";
import { getPartnerIdsForUser } from "@root/utils/partnerAccessUtil";

export async function assertReviewAccess(context: ICMSContext, applicationObj: any) {
  const partnerIds = await getPartnerIdsForUser(context);
  if (!partnerIds) {
    return;
  }

  if (!applicationObj.ProductID) {
    throw new Error("You do not have access to this application.");
  }

  const product = await ProductsService.context(context).findOne({ _id: applicationObj.ProductID });
  const productObj = product ? (product.toObject ? product.toObject() : product) : null;
  if (!productObj || !partnerIds.includes(productObj.PartnerID)) {
    throw new Error("You do not have access to this application.");
  }
}
