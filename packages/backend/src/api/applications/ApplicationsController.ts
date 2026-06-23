import GetDefinition from "./fns/Get";
import ListDefinition from "./fns/List";
import SaveDefinition from "./fns/Save";
import GetRecommendationsDefinition from "./fns/GetRecommendations";
import SelectProductDefinition from "./fns/SelectProduct";
import ListForReviewDefinition from "./fns/ListForReview";
import GetForReviewDefinition from "./fns/GetForReview";
import UpdateStatusDefinition from "./fns/UpdateStatus";
import { ApplicationsCollectionKey } from "./ApplicationsSchema";
import { createController, rpcItem } from "@lib/BaseController";

export default createController(ApplicationsCollectionKey, [
  rpcItem({
    route: "/Get",
    definition: GetDefinition,
  }),
  rpcItem({
    route: "/List",
    definition: ListDefinition,
  }),
  rpcItem({
    route: "/Save",
    definition: SaveDefinition,
  }),
  rpcItem({
    route: "/GetRecommendations",
    definition: GetRecommendationsDefinition,
  }),
  rpcItem({
    route: "/SelectProduct",
    definition: SelectProductDefinition,
  }),
  rpcItem({
    route: "/ListForReview",
    definition: ListForReviewDefinition,
  }),
  rpcItem({
    route: "/GetForReview",
    definition: GetForReviewDefinition,
  }),
  rpcItem({
    route: "/UpdateStatus",
    definition: UpdateStatusDefinition,
  }),
]);
