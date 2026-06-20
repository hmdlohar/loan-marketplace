import { useFormikContext } from "formik";
import { useEffect, useRef } from "react";
import { APPLICATION_STATUS, LOAN_PRODUCT } from "commonlib";
import { bSdk } from "../../services/BackendSDKService";

export default function ApplyFormAutoSave(props: {
  applicationId: string;
  loanType: LOAN_PRODUCT;
  applicationStatus?: string;
  authMobile: string;
}) {
  const formik = useFormikContext<Record<string, string>>();
  const skipSaveRef = useRef(true);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!props.applicationId || !props.loanType) {
      return;
    }

    if (skipSaveRef.current) {
      skipSaveRef.current = false;
      return;
    }

    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }

    saveTimerRef.current = setTimeout(async () => {
      const payload = { ...formik.values };
      if (props.authMobile && payload.mobile !== undefined && !payload.mobile) {
        payload.mobile = props.authMobile;
      }

      try {
        await bSdk.Applications_Save({
          _id: props.applicationId,
          LoanType: props.loanType,
          FormData: payload,
          Status: props.applicationStatus || APPLICATION_STATUS.PENDING_FORM,
        });
      } catch {
        // Draft save is best-effort; final submit still validates.
      }
    }, 900);

    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, [formik.values, props.applicationId, props.loanType, props.applicationStatus, props.authMobile]);

  return null;
}
