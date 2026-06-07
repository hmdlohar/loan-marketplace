import * as yup from "yup";
import { IRPCFunctionDefinition } from "@root/types/rpc";
import { ICMSContext } from "@root/types/cms";
import { USER_ROLE } from "commonlib";
import PartnersService from "@root/api/partners/PartnersService";
import { getPartnerLogoPath, uploadPartnerLogo } from "@root/utils/s3Util";

const argsSchema = yup.object({
  PartnerID: yup.string().required(),
  ContentType: yup.string().required(),
  FileBase64: yup.string().required(),
});
export type IUploadLogoArgs = yup.InferType<typeof argsSchema>;

type IUploadLogoReturnType = any;

export async function UploadLogo(args: IUploadLogoArgs, context: ICMSContext): Promise<IUploadLogoReturnType> {
  await PartnersService.context(context).get_Throwable(args.PartnerID);

  const fileBuffer = Buffer.from(args.FileBase64, "base64");
  if (!fileBuffer.length) {
    throw new Error("Uploaded file is empty.");
  }

  const upload = await uploadPartnerLogo(args.PartnerID, fileBuffer, args.ContentType);
  const logoPath = getPartnerLogoPath(args.PartnerID);

  const updated = await PartnersService.context(context).update(args.PartnerID, {
    Logo: upload.logoUrl,
    LogoPath: logoPath,
  });

  return updated;
}

const definition: IRPCFunctionDefinition = {
  callback: UploadLogo,
  argsSchema,
  access: {
    allow: [USER_ROLE.SYSTEM_ADMIN],
  },
};
export default definition;
