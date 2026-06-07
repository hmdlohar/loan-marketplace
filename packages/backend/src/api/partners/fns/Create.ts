import * as yup from "yup";
import { IRPCFunctionDefinition } from "@root/types/rpc";
import { ICMSContext } from "@root/types/cms";
import { USER_ROLE } from "commonlib";
import PartnersService from "@root/api/partners/PartnersService";
import UserService from "@root/api/user/UserService";
import { hashPassword } from "@root/utils/passwordUtil";
import { getPartnerLogoPath, getPartnerLogoUploadUrl } from "@root/utils/s3Util";

const argsSchema = yup.object({
  Name: yup.string().required(),
  Email: yup.string().email().required(),
  Password: yup.string().min(6).required(),
  Mobile: yup
    .string()
    .matches(/^\d{10}$/, "Mobile must be 10 digits")
    .required(),
  FullName: yup.string().required(),
});
export type ICreateArgs = yup.InferType<typeof argsSchema>;

type ICreateReturnType = {
  partner: any;
  user: any;
  logoUpload: Awaited<ReturnType<typeof getPartnerLogoUploadUrl>>;
};

export async function Create(args: ICreateArgs, context: ICMSContext): Promise<ICreateReturnType> {
  const email = args.Email.toLowerCase().trim();

  const existingEmail = await UserService.context(context).findOne({ Email: email });
  if (existingEmail) {
    throw new Error("A user with this email already exists.");
  }

  const existingMobile = await UserService.context(context).findOne({ Mobile: args.Mobile });
  if (existingMobile) {
    throw new Error("A user with this mobile already exists.");
  }

  const partner = await PartnersService.context(context).create({
    Name: args.Name,
    LogoPath: "",
  });

  const logoPath = getPartnerLogoPath(partner._id);
  await PartnersService.context(context).update(partner._id, { LogoPath: logoPath });

  const passwordHash = await hashPassword(args.Password);
  const user = await UserService.context(context).create({
    Email: email,
    PasswordHash: passwordHash,
    Mobile: args.Mobile,
    FullName: args.FullName,
    Role: USER_ROLE.PARTNER,
    Access: {
      PartnerIDs: [partner._id],
    },
  });

  const logoUpload = await getPartnerLogoUploadUrl(partner._id);

  return {
    partner: {
      _id: partner._id,
      Name: partner.Name,
      Logo: partner.Logo,
      LogoPath: logoPath,
    },
    user: {
      _id: user._id,
      Email: user.Email,
      Mobile: user.Mobile,
      FullName: user.FullName,
      Role: user.Role,
    },
    logoUpload,
  };
}

const definition: IRPCFunctionDefinition = {
  callback: Create,
  argsSchema,
  access: {
    allow: [USER_ROLE.SYSTEM_ADMIN],
  },
};
export default definition;
