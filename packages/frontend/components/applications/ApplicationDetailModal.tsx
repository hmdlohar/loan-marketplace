import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useState } from "react";
import { useQuery } from "react-query";
import { APPLICATION_STATUS } from "commonlib";
import AppModal from "../common/AppModal";
import { bSdk } from "../../services/BackendSDKService";
import { getAuthenticatedFileUrl } from "../../services/fileProxyUtil";
import { formatINR, loanProductLabels } from "../../services/customerUtil";

const documentTypeLabels: Record<string, string> = {
  PAN: "PAN card",
  AADHAAR: "Aadhaar",
  SALARY_SLIP: "Salary slip",
  BANK_STATEMENT: "Bank statement",
  ITR: "Income tax return",
  GST_RETURN: "GST return",
  PROPERTY_DOCUMENT: "Property document",
};

function actionsForStatus(status: string) {
  if (status === APPLICATION_STATUS.PARTNER_ASSIGNED) {
    return [
      { label: "Approve", status: APPLICATION_STATUS.APPROVED, color: "success" as const },
      { label: "Reject", status: APPLICATION_STATUS.REJECTED, color: "error" as const },
    ];
  }
  if (status === APPLICATION_STATUS.APPROVED) {
    return [
      { label: "Mark disbursed", status: APPLICATION_STATUS.DISBURSED, color: "success" as const },
      { label: "Reject", status: APPLICATION_STATUS.REJECTED, color: "error" as const },
    ];
  }
  return [];
}

export default function ApplicationDetailModal(props: {
  applicationId: string;
  open: boolean;
  onClose: () => void;
  onUpdated: () => void;
}) {
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const detailQuery = useQuery(
    ["review-application", props.applicationId],
    async () => {
      const response = await bSdk.Applications_GetForReview({ _id: props.applicationId });
      if (!response.status) {
        throw new Error(response.message || "Failed to load application.");
      }
      return response.data;
    },
    { enabled: props.open && !!props.applicationId }
  );

  const application = detailQuery.data;
  const formData = application?.FormData || {};
  const customer = application?.Customer || {};
  const loanAmount = Number(formData.desiredLoanAmount || formData.loanAmount || 0);
  const status = application?.Status || "";
  const actions = actionsForStatus(status);

  async function changeStatus(nextStatus: string) {
    setSubmitting(true);
    setError("");
    try {
      const response = await bSdk.Applications_UpdateStatus({ _id: props.applicationId, Status: nextStatus });
      if (!response.status) {
        throw new Error(response.message || "Failed to update status.");
      }
      await detailQuery.refetch();
      props.onUpdated();
    } catch (ex: any) {
      setError(ex.response?.data?.message || ex.message || "Failed to update status.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AppModal open={props.open} title="Application review" onClose={props.onClose} maxWidth="md">
      {detailQuery.isLoading ? <Typography>Loading application...</Typography> : null}
      {detailQuery.error ? (
        <Typography color="error">{(detailQuery.error as Error).message}</Typography>
      ) : null}

      {application ? (
        <Stack spacing={3} sx={{ pt: 1 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" gap={2}>
            <Box>
              <Typography variant="h6">
                {application.Product?.Title || loanProductLabels[application.LoanType] || "Loan"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {application.Bank?.Name ? `${application.Bank.Name} · ` : ""}
                {loanProductLabels[application.LoanType] || application.LoanType}
              </Typography>
            </Box>
            <Chip label={status} variant="outlined" />
          </Stack>

          <Box>
            <Typography variant="overline" color="text.secondary">
              Borrower
            </Typography>
            <DetailRow label="Name" value={customer.FullName || formData.fullName || formData.firstName} />
            <DetailRow label="Mobile" value={customer.Mobile || formData.mobile} />
            <DetailRow label="Email" value={customer.Email || formData.email} />
            <DetailRow label="PAN" value={customer.PANNumber || formData.panNumber} />
            <DetailRow label="Employment" value={customer.EmploymentType || formData.employmentType} />
            <DetailRow label="Net income" value={customer.NetIncome ? formatINR(Number(customer.NetIncome)) : formData.netIncome} />
            {loanAmount ? <DetailRow label="Loan amount" value={formatINR(loanAmount)} /> : null}
          </Box>

          <Divider />

          <Box>
            <Typography variant="overline" color="text.secondary">
              Documents
            </Typography>
            {(application.Documents || []).length ? (
              <Stack spacing={1} sx={{ mt: 1 }}>
                {application.Documents.map((doc: any) => (
                  <Stack key={doc._id} direction="row" justifyContent="space-between" alignItems="center" gap={2}>
                    <Box>
                      <Typography variant="body2" fontWeight={600}>
                        {documentTypeLabels[doc.DocumentType] || doc.DocumentType}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {doc.Name}
                        {doc.ParseStatus ? ` · ${doc.ParseStatus}` : ""}
                      </Typography>
                    </Box>
                    <Link href={getAuthenticatedFileUrl(doc.Path)} target="_blank" rel="noopener">
                      View
                    </Link>
                  </Stack>
                ))}
              </Stack>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No documents attached.
              </Typography>
            )}
          </Box>

          {actions.length ? (
            <>
              <Divider />
              <Stack direction="row" spacing={2}>
                {actions.map((action) => (
                  <Button
                    key={action.status}
                    variant="contained"
                    color={action.color}
                    disabled={submitting}
                    onClick={() => changeStatus(action.status)}
                  >
                    {action.label}
                  </Button>
                ))}
              </Stack>
            </>
          ) : null}

          {error ? (
            <Typography variant="body2" color="error">
              {error}
            </Typography>
          ) : null}
        </Stack>
      ) : null}
    </AppModal>
  );
}

function DetailRow(props: { label: string; value?: string | number }) {
  if (props.value === undefined || props.value === null || props.value === "") {
    return null;
  }
  return (
    <Stack direction="row" justifyContent="space-between" sx={{ py: 0.5 }}>
      <Typography variant="body2" color="text.secondary">
        {props.label}
      </Typography>
      <Typography variant="body2" fontWeight={600}>
        {props.value}
      </Typography>
    </Stack>
  );
}
