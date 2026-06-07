import CronLogCollection from "./api/cron-log/CronLogCollection";
import UserCollection from "./api/user/UserCollection";
import PartnersCollection from "./api/partners/PartnersCollection";
import ProductsCollection from "./api/products/ProductsCollection";

export const collections: Record<string, any> = {
  "cron-log": CronLogCollection,
  "user": UserCollection,
  "partners": PartnersCollection,
  "products": ProductsCollection,
};
export type ICollectionKeys = keyof typeof collections;
export default collections;
