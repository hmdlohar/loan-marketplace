import * as yup from "yup";
import { IRPCFunctionDefinition } from "@root/types/rpc";
import { ICMSContext } from "@root/types/cms";
import { USER_ROLE } from "commonlib";
import PartnersService from "@root/api/partners/PartnersService";
import { getFileProxyUrl, getPartnerLogoPath } from "@root/utils/s3Util";

const argsSchema = yup.object({
  PartnerID: yup.string().required(),
});
export type IConfirmLogoArgs = yup.InferType<typeof argsSchema>;

type IConfirmLogoReturnType = any;

export async function ConfirmLogo(args: IConfirmLogoArgs, context: ICMSContext): Promise<IConfirmLogoReturnType> {
  await PartnersService.context(context).get_Throwable(args.PartnerID);

  const logoPath = getPartnerLogoPath(args.PartnerID);
  const logoUrl = getFileProxyUrl(logoPath);

  const updated = await PartnersService.context(context).update(args.PartnerID, {
    Logo: logoUrl,
    LogoPath: logoPath,
  });

  return updated;
}

const definition: IRPCFunctionDefinition = {
  callback: ConfirmLogo,
  argsSchema,
  access: {
    allow: [USER_ROLE.SYSTEM_ADMIN],
  },
};
export default definition;
