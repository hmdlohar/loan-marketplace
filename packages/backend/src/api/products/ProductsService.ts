import { BaseService, serviceWithContext } from "@lib/BaseService";
import { IProducts, ProductsCollectionKey } from "./ProductsSchema";
import { ICMSContext } from "@root/types/cms";

class ProductsServiceClass extends BaseService<IProducts> {
  constructor(context: ICMSContext) {
    super(ProductsCollectionKey, context);
  }
}

const ProductsService = serviceWithContext<ProductsServiceClass>(ProductsServiceClass);
export default ProductsService;
export { ProductsServiceClass };
