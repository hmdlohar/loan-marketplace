import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import { GridColDef, GridPaginationModel } from "@mui/x-data-grid";
import { useState } from "react";
import { useQuery, useQueryClient } from "react-query";
import { APPLICATION_STATUS } from "commonlib";
import AppDataTable from "../common/AppDataTable";
import ApplicationDetailModal from "./ApplicationDetailModal";
import { bSdk } from "../../services/BackendSDKService";
import { loanProductLabels } from "../../services/customerUtil";

const statusLabels: Record<string, string> = {
  [APPLICATION_STATUS.PARTNER_ASSIGNED]: "Submitted",
  [APPLICATION_STATUS.APPROVED]: "Approved",
  [APPLICATION_STATUS.REJECTED]: "Rejected",
  [APPLICATION_STATUS.DISBURSED]: "Disbursed",
};

const statusColor: Record<string, "default" | "warning" | "success" | "error" | "info"> = {
  [APPLICATION_STATUS.PARTNER_ASSIGNED]: "info",
  [APPLICATION_STATUS.APPROVED]: "success",
  [APPLICATION_STATUS.REJECTED]: "error",
  [APPLICATION_STATUS.DISBURSED]: "success",
};

export default function ApplicationReviewTable() {
  const queryClient = useQueryClient();
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 20 });
  const [detailId, setDetailId] = useState("");

  const applicationsQuery = useQuery(
    ["review-applications", paginationModel.page, paginationModel.pageSize],
    async () => {
      const response = await bSdk.Applications_ListForReview({
        page: paginationModel.page + 1,
        pageSize: paginationModel.pageSize,
      });
      if (!response.status) {
        throw new Error(response.message || "Failed to load applications.");
      }
      return response.data;
    },
    { keepPreviousData: true }
  );

  const columns: GridColDef[] = [
    { field: "BorrowerName", headerName: "Borrower", flex: 1, minWidth: 160, valueFormatter: (value) => value || "—" },
    {
      field: "LoanType",
      headerName: "Loan type",
      width: 160,
      valueFormatter: (value) => loanProductLabels[value as string] || value || "—",
    },
    {
      field: "Product",
      headerName: "Product",
      flex: 1,
      minWidth: 160,
      sortable: false,
      valueGetter: (_value, row) => row.Product?.Title || "—",
    },
    {
      field: "Bank",
      headerName: "Bank",
      width: 160,
      sortable: false,
      valueGetter: (_value, row) => row.Bank?.Name || "—",
    },
    {
      field: "Status",
      headerName: "Status",
      width: 140,
      renderCell: (params) => (
        <Chip
          label={statusLabels[params.value as string] || params.value}
          color={statusColor[params.value as string] || "default"}
          size="small"
          variant="outlined"
        />
      ),
    },
    {
      field: "ModifiedAt",
      headerName: "Updated",
      width: 180,
      valueFormatter: (value) => (value ? new Date(value as string).toLocaleString() : "—"),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 90,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <IconButton size="small" onClick={() => setDetailId(params.row._id)}>
            <VisibilityOutlinedIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <>
      <AppDataTable
        rows={applicationsQuery.data?.items || []}
        columns={columns}
        loading={applicationsQuery.isLoading || applicationsQuery.isFetching}
        rowCount={applicationsQuery.data?.total || 0}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
      />

      {detailId ? (
        <ApplicationDetailModal
          applicationId={detailId}
          open={!!detailId}
          onClose={() => setDetailId("")}
          onUpdated={() => queryClient.invalidateQueries(["review-applications"])}
        />
      ) : null}
    </>
  );
}
