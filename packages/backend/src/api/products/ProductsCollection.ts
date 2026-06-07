import { ICollectionDefinition } from "@root/types/collections";
import ProductsController from "./ProductsController";
import { ProductsSchema } from "./ProductsSchema";
import ProductsService from "./ProductsService";

const ProductsCollection: ICollectionDefinition = {
  key: "products",
  controller: ProductsController,
  service: ProductsService,
  schema: ProductsSchema,
  type: "list",
};
export default ProductsCollection;
