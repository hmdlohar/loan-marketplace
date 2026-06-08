import CronLogCollection from "./api/cron-log/CronLogCollection";
import UserCollection from "./api/user/UserCollection";
import PartnersCollection from "./api/partners/PartnersCollection";
import BanksCollection from "./api/banks/BanksCollection";
import ProductsCollection from "./api/products/ProductsCollection";
import CustomersCollection from "./api/customers/CustomersCollection";
import ApplicationsCollection from "./api/applications/ApplicationsCollection";
import DocumentsCollection from "./api/documents/DocumentsCollection";

export const collections: Record<string, any> = {
  "cron-log": CronLogCollection,
  "user": UserCollection,
  "partners": PartnersCollection,
  "banks": BanksCollection,
  "products": ProductsCollection,
  "customers": CustomersCollection,
  "applications": ApplicationsCollection,
  "documents": DocumentsCollection,
};
export type ICollectionKeys = keyof typeof collections;
export default collections;
