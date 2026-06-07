import * as yup from "yup";
import { IRPCFunctionDefinition } from "@root/types/rpc";
import { ICMSContext } from "@root/types/cms";
import { USER_ROLE } from "commonlib";
import PartnersService from "@root/api/partners/PartnersService";
import { getPartnerLogoUploadUrl } from "@root/utils/s3Util";

const argsSchema = yup.object({
  PartnerID: yup.string().required(),
});
export type IGetLogoUploadUrlArgs = yup.InferType<typeof argsSchema>;

type IGetLogoUploadUrlReturnType = Awaited<ReturnType<typeof getPartnerLogoUploadUrl>>;

export async function GetLogoUploadUrl(
  args: IGetLogoUploadUrlArgs,
  context: ICMSContext
): Promise<IGetLogoUploadUrlReturnType> {
  await PartnersService.context(context).get_Throwable(args.PartnerID);
  return getPartnerLogoUploadUrl(args.PartnerID);
}

const definition: IRPCFunctionDefinition = {
  callback: GetLogoUploadUrl,
  argsSchema,
  access: {
    allow: [USER_ROLE.SYSTEM_ADMIN],
  },
};
export default definition;
