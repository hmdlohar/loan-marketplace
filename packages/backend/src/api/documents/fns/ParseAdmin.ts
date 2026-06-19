import * as yup from "yup";
import { IRPCFunctionDefinition } from "@root/types/rpc";
import { ICMSContext } from "@root/types/cms";
import { USER_ROLE } from "commonlib";
import { reparseDocument } from "@root/api/documents/fns/reparseDocument";

const argsSchema = yup.object({
  DocumentID: yup.string().required(),
});
export type IParseAdminArgs = yup.InferType<typeof argsSchema>;

type IParseAdminReturnType = any;

export async function ParseAdmin(args: IParseAdminArgs, context: ICMSContext): Promise<IParseAdminReturnType> {
  return reparseDocument({
    context,
    documentId: args.DocumentID,
    force: true,
  });
}

const definition: IRPCFunctionDefinition = {
  callback: ParseAdmin,
  argsSchema,
  access: {
    allow: [USER_ROLE.SYSTEM_ADMIN],
  },
};
export default definition;
