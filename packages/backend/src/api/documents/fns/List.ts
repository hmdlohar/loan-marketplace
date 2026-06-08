import * as yup from "yup";
import { IRPCFunctionDefinition } from "@root/types/rpc";
import { ICMSContext } from "@root/types/cms";
import { USER_ROLE } from "commonlib";
import DocumentsService from "@root/api/documents/DocumentsService";
import ApplicationsService from "@root/api/applications/ApplicationsService";

const argsSchema = yup.object({
  ApplicationID: yup.string().required(),
});
export type IListArgs = yup.InferType<typeof argsSchema>;

type IListReturnType = {
  items: any[];
};

export async function List(args: IListArgs, context: ICMSContext): Promise<IListReturnType> {
  if (!context.SystemUserID || context.SystemUserID === "DEFAULT") {
    throw new Error("Authentication required.");
  }

  const application = await ApplicationsService.context(context).get_Throwable(args.ApplicationID);
  if (application.UserID !== context.SystemUserID) {
    throw new Error("You do not have access to this application.");
  }

  const items = await DocumentsService.context(context).list({
    filter: { "Context.ApplicationID": args.ApplicationID },
    sort: "ModifiedAt",
    sortOrder: "desc",
    page: 1,
    pageSize: 100,
  });

  return {
    items: items.map((item) => (item.toObject ? item.toObject() : item)),
  };
}

const definition: IRPCFunctionDefinition = {
  callback: List,
  argsSchema,
  access: {
    allow: [USER_ROLE.AUTHENTICATED, USER_ROLE.CUSTOMER],
  },
};
export default definition;
