import * as yup from "yup";
import { IRPCFunctionDefinition } from "@root/types/rpc";
import { ICMSContext } from "@root/types/cms";
import { APPLICATION_STATUS, USER_ROLE } from "commonlib";
import ApplicationsService from "@root/api/applications/ApplicationsService";
import { assertReviewAccess } from "./assertReviewAccess";

const targetStatuses = [
  APPLICATION_STATUS.APPROVED,
  APPLICATION_STATUS.REJECTED,
  APPLICATION_STATUS.DISBURSED,
];

const allowedTransitions: Record<string, string[]> = {
  [APPLICATION_STATUS.PARTNER_ASSIGNED]: [APPLICATION_STATUS.APPROVED, APPLICATION_STATUS.REJECTED],
  [APPLICATION_STATUS.APPROVED]: [APPLICATION_STATUS.DISBURSED, APPLICATION_STATUS.REJECTED],
  [APPLICATION_STATUS.REJECTED]: [],
  [APPLICATION_STATUS.DISBURSED]: [],
};

const argsSchema = yup.object({
  _id: yup.string().required(),
  Status: yup.string().oneOf(targetStatuses).required(),
});
export type IUpdateStatusArgs = yup.InferType<typeof argsSchema>;

type IUpdateStatusReturnType = any;

export async function UpdateStatus(args: IUpdateStatusArgs, context: ICMSContext): Promise<IUpdateStatusReturnType> {
  const application = await ApplicationsService.context(context).get_Throwable(args._id);
  const applicationObj = application.toObject ? application.toObject() : application;

  await assertReviewAccess(context, applicationObj);

  const currentStatus = applicationObj.Status;
  const allowed = allowedTransitions[currentStatus] || [];
  if (!allowed.includes(args.Status)) {
    throw new Error(`Cannot change status from ${currentStatus} to ${args.Status}.`);
  }

  await ApplicationsService.context(context).update(args._id, { Status: args.Status });

  const updated = await ApplicationsService.context(context).get_Throwable(args._id);
  return updated.toObject ? updated.toObject() : updated;
}

const definition: IRPCFunctionDefinition = {
  callback: UpdateStatus,
  argsSchema,
  access: {
    allow: [USER_ROLE.SYSTEM_ADMIN, USER_ROLE.PARTNER],
  },
};
export default definition;
