import * as yup from "yup";
import { IRPCFunctionDefinition } from "@root/types/rpc";
import { ICMSContext } from "@root/types/cms";
import { USER_ROLE } from "commonlib";
import DocumentsService from "@root/api/documents/DocumentsService";

const argsSchema = yup.object({
  _id: yup.string().required(),
});
export type IDeleteAdminArgs = yup.InferType<typeof argsSchema>;

type IDeleteAdminReturnType = { deleted: boolean };

export async function DeleteAdmin(args: IDeleteAdminArgs, context: ICMSContext): Promise<IDeleteAdminReturnType> {
  await DocumentsService.context(context).get_Throwable(args._id);
  await DocumentsService.context(context).delete(args._id);
  return { deleted: true };
}

const definition: IRPCFunctionDefinition = {
  callback: DeleteAdmin,
  argsSchema,
  access: {
    allow: [USER_ROLE.SYSTEM_ADMIN],
  },
};
export default definition;
