import { useQuery } from "react-query";
import { LOAN_PRODUCT } from "commonlib";
import { bSdk } from "./BackendSDKService";
import { loanProductDescriptions, loanProductLabels, loanProductOrder } from "./customerUtil";

export type CatalogBank = {
  _id: string;
  Name: string;
  LogoPath?: string;
};

export type CatalogCategory = {
  loanType: LOAN_PRODUCT;
  label: string;
  description: string;
  count: number;
};

function normalizeProduct(product: any) {
  if (product && product._doc && !product.LoanType) {
    return {
      ...product._doc,
      Bank: product.Bank,
    };
  }
  return product;
}

export function useMarketplaceCatalog() {
  return useQuery(["marketplace-catalog"], async () => {
    const response = await bSdk.Products_ListPublic({
      page: 1,
      pageSize: 100,
    });

    if (!response.status) {
      throw new Error(response.message || "Failed to load marketplace catalog.");
    }

    const items = (response.data?.items || []).map(normalizeProduct);
    const countByType: Record<string, number> = {};
    const banksById: Record<string, CatalogBank> = {};

    for (let i = 0; i < items.length; i++) {
      const product = items[i];
      countByType[product.LoanType] = (countByType[product.LoanType] || 0) + 1;
      if (product.Bank?._id && !banksById[product.Bank._id]) {
        banksById[product.Bank._id] = {
          _id: product.Bank._id,
          Name: product.Bank.Name,
          LogoPath: product.Bank.LogoPath,
        };
      }
    }

    const categories: CatalogCategory[] = [];
    for (let i = 0; i < loanProductOrder.length; i++) {
      const loanType = loanProductOrder[i];
      categories.push({
        loanType,
        label: loanProductLabels[loanType],
        description: loanProductDescriptions[loanType],
        count: countByType[loanType] || 0,
      });
    }

    const banks = Object.values(banksById);
    const featured = items.slice(0, 6);

    return {
      items,
      total: response.data?.total || items.length,
      banks,
      categories,
      featured,
      lenderCount: banks.length,
      productCount: response.data?.total || items.length,
    };
  });
}
