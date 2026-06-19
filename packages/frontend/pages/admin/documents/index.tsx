import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import AutorenewOutlinedIcon from "@mui/icons-material/AutorenewOutlined";
import Autocomplete from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { GridColDef, GridPaginationModel, GridSortModel } from "@mui/x-data-grid";
import type { NextPage } from "next";
import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "react-query";
import { DOCUMENT_TYPE, USER_ROLE } from "commonlib";
import AppDataTable from "../../../components/common/AppDataTable";
import AppModal from "../../../components/common/AppModal";
import ConfirmDialog from "../../../components/common/ConfirmDialog";
import PageContainer from "../../../components/common/PageContainer";
import AuthGuard from "../../../guards/AuthGuard";
import RoleGuard from "../../../guards/RoleGuard";
import AdminLayout from "../../../layouts/admin/AdminLayout";
import { bSdk } from "../../../services/BackendSDKService";
import { getFileProxyUrl } from "../../../services/fileProxyUtil";
import AuthServices from "../../../services/AuthServices";

type DocumentRow = {
  _id: string;
  Name: string;
  DocumentType: string;
  CreatedAt?: string;
  ParseStatus: string;
  ParseError?: string;
  CustomerLabel: string;
  ParsedData?: Record<string, unknown>;
  Path?: string;
};

type CustomerFilterOption = {
  _id: string;
  label: string;
};

const documentTypeLabels: Record<DOCUMENT_TYPE, string> = {
  [DOCUMENT_TYPE.PAN]: "PAN card",
  [DOCUMENT_TYPE.AADHAAR]: "Aadhaar",
  [DOCUMENT_TYPE.SALARY_SLIP]: "Salary slip",
  [DOCUMENT_TYPE.BANK_STATEMENT]: "Bank statement",
  [DOCUMENT_TYPE.ITR]: "ITR",
  [DOCUMENT_TYPE.GST_RETURN]: "GST return",
  [DOCUMENT_TYPE.PROPERTY_DOCUMENT]: "Property document",
};

const parseStatusColor: Record<string, "default" | "success" | "error" | "warning"> = {
  PARSED: "success",
  FAILED: "error",
  PENDING: "warning",
};

function formatTimeAgo(value?: string) {
  if (!value) {
    return "—";
  }
  const date = new Date(value);
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) {
    return `${seconds}s ago`;
  }
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes}m ago`;
  }
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours}h ago`;
  }
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function mapSortField(field: string) {
  if (field === "DocumentType") {
    return "DocumentType";
  }
  if (field === "CreatedAt") {
    return "CreatedAt";
  }
  return "CreatedAt";
}

function getAuthenticatedFileUrl(path?: string) {
  if (!path) {
    return "";
  }
  const token = AuthServices.getToken();
  const url = getFileProxyUrl(path);
  if (!token) {
    return url;
  }
  return `${url}?token=${encodeURIComponent(token)}`;
}

function hasViewableParsedData(row: DocumentRow) {
  if (row.ParseError?.trim()) {
    return true;
  }
  if (!row.ParsedData || typeof row.ParsedData !== "object") {
    return false;
  }
  const keys = Object.keys(row.ParsedData).filter((key) => key !== "parseError");
  if (keys.length > 0) {
    return true;
  }
  return !!row.ParsedData.parseError;
}

const AdminDocumentsPage: NextPage = () => {
  const queryClient = useQueryClient();
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 20 });
  const [sortModel, setSortModel] = useState<GridSortModel>([{ field: "CreatedAt", sort: "desc" }]);
  const [customerFilter, setCustomerFilter] = useState<CustomerFilterOption | null>(null);
  const [documentTypeFilter, setDocumentTypeFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [parsedModalOpen, setParsedModalOpen] = useState(false);
  const [parsedModalData, setParsedModalData] = useState<Record<string, unknown> | null>(null);
  const [parsedModalTitle, setParsedModalTitle] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteRow, setDeleteRow] = useState<DocumentRow | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState("");
  const [actionError, setActionError] = useState("");

  const sortField = sortModel[0]?.field || "CreatedAt";
  const sortOrder = sortModel[0]?.sort || "desc";

  const customersQuery = useQuery(["admin-customer-filter"], async () => {
    const response = await bSdk.Customers_ListForAdmin({ pageSize: 100 });
    if (!response.status) {
      throw new Error(response.message || "Failed to load customers.");
    }
    return response.data.items as CustomerFilterOption[];
  });

  const documentsQuery = useQuery(
    [
      "admin-documents",
      paginationModel.page,
      paginationModel.pageSize,
      sortField,
      sortOrder,
      customerFilter?._id,
      documentTypeFilter,
      dateFrom,
      dateTo,
    ],
    async () => {
      const response = await bSdk.Documents_ListAdmin({
        page: paginationModel.page + 1,
        pageSize: paginationModel.pageSize,
        sort: mapSortField(sortField) as "CreatedAt" | "DocumentType" | "ModifiedAt",
        sortOrder: sortOrder === "asc" ? "asc" : "desc",
        customerId: customerFilter?._id || undefined,
        documentType: documentTypeFilter || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
      });
      if (!response.status) {
        throw new Error(response.message || "Failed to load documents.");
      }
      return response.data;
    },
    { keepPreviousData: true }
  );

  const rows = (documentsQuery.data?.items || []) as DocumentRow[];

  async function handleTryParse(row: DocumentRow) {
    setActionLoadingId(row._id);
    setActionError("");
    try {
      const response = await bSdk.Documents_ParseAdmin({ DocumentID: row._id });
      if (!response.status) {
        throw new Error(response.message || "Parse failed.");
      }
      queryClient.invalidateQueries(["admin-documents"]);
    } catch (ex: any) {
      setActionError(ex.response?.data?.message || ex.message || "Parse failed.");
    } finally {
      setActionLoadingId("");
    }
  }

  async function handleDeleteConfirm() {
    if (!deleteRow) {
      return;
    }
    setActionLoadingId(deleteRow._id);
    setActionError("");
    try {
      const response = await bSdk.Documents_DeleteAdmin({ _id: deleteRow._id });
      if (!response.status) {
        throw new Error(response.message || "Delete failed.");
      }
      setDeleteOpen(false);
      setDeleteRow(null);
      queryClient.invalidateQueries(["admin-documents"]);
    } catch (ex: any) {
      setActionError(ex.response?.data?.message || ex.message || "Delete failed.");
    } finally {
      setActionLoadingId("");
    }
  }

  function openParsedDataModal(row: DocumentRow) {
    setParsedModalTitle(
      `${documentTypeLabels[row.DocumentType as DOCUMENT_TYPE] || row.DocumentType} · ${row.CustomerLabel}`
    );
    const parsedData = { ...(row.ParsedData || {}) };
    if (row.ParseError && !parsedData.parseError) {
      parsedData.parseError = row.ParseError;
    }
    setParsedModalData(parsedData);
    setParsedModalOpen(true);
  }

  const columns: GridColDef[] = useMemo(
    () => [
      {
        field: "DocumentType",
        headerName: "Document type",
        flex: 1,
        minWidth: 160,
        valueFormatter: (value) => documentTypeLabels[value as DOCUMENT_TYPE] || value,
      },
      {
        field: "CustomerLabel",
        headerName: "Customer",
        flex: 1.2,
        minWidth: 200,
        sortable: false,
      },
      {
        field: "CreatedAt",
        headerName: "Uploaded",
        width: 220,
        renderCell: (params) => {
          const value = params.value as string | undefined;
          if (!value) {
            return "—";
          }
          return (
            <Stack spacing={0.25}>
              <Typography variant="body2">{new Date(value).toLocaleString()}</Typography>
              <Typography variant="caption" color="text.secondary">
                {formatTimeAgo(value)}
              </Typography>
            </Stack>
          );
        },
      },
      {
        field: "ParseStatus",
        headerName: "Parse status",
        width: 130,
        sortable: false,
        renderCell: (params) => {
          const row = params.row as DocumentRow;
          const status = String(params.value || "PENDING");
          const chip = <Chip size="small" label={status} color={parseStatusColor[status] || "default"} />;
          if (status === "FAILED" && row.ParseError) {
            return (
              <Tooltip title={row.ParseError}>
                <span>{chip}</span>
              </Tooltip>
            );
          }
          return chip;
        },
      },
      {
        field: "actions",
        headerName: "Actions",
        width: 200,
        sortable: false,
        renderCell: (params) => {
          const row = params.row as DocumentRow;
          const loading = actionLoadingId === row._id;
          const fileUrl = getAuthenticatedFileUrl(row.Path);
          return (
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <IconButton
                size="small"
                aria-label="View document"
                disabled={!fileUrl || loading}
                onClick={() => {
                  window.open(fileUrl, "_blank", "noopener,noreferrer");
                }}
              >
                <VisibilityOutlinedIcon fontSize="small" />
              </IconButton>
              {hasViewableParsedData(row) ? (
                <IconButton
                  size="small"
                  aria-label="View parsed data"
                  disabled={loading}
                  onClick={() => openParsedDataModal(row)}
                >
                  <ArticleOutlinedIcon fontSize="small" />
                </IconButton>
              ) : null}
              <IconButton
                size="small"
                aria-label="Try parsing"
                disabled={loading}
                onClick={() => handleTryParse(row)}
              >
                <AutorenewOutlinedIcon fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                aria-label="Delete document"
                disabled={loading}
                onClick={() => {
                  setDeleteRow(row);
                  setDeleteOpen(true);
                }}
              >
                <DeleteOutlineIcon fontSize="small" />
              </IconButton>
            </Stack>
          );
        },
      },
    ],
    [actionLoadingId]
  );

  return (
    <AuthGuard>
      <RoleGuard roles={[USER_ROLE.SYSTEM_ADMIN]}>
        <AdminLayout>
          <PageContainer maxWidth="xl">
            <Stack spacing={3}>
              <Box>
                <Typography variant="h4" fontWeight={800} gutterBottom>
                  Documents
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Customer uploads with parse status and extracted fields.
                </Typography>
              </Box>

              <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                <Autocomplete
                  sx={{ minWidth: 280, flex: 1 }}
                  options={customersQuery.data || []}
                  value={customerFilter}
                  onChange={(_event, value) => {
                    setCustomerFilter(value);
                    setPaginationModel({ page: 0, pageSize: paginationModel.pageSize });
                  }}
                  getOptionLabel={(option) => option.label}
                  isOptionEqualToValue={(option, value) => option._id === value._id}
                  loading={customersQuery.isLoading}
                  renderInput={(params) => <TextField {...params} label="Customer" placeholder="All customers" />}
                />
                <TextField
                  select
                  label="Document type"
                  value={documentTypeFilter}
                  onChange={(event) => {
                    setDocumentTypeFilter(event.target.value);
                    setPaginationModel({ page: 0, pageSize: paginationModel.pageSize });
                  }}
                  sx={{ minWidth: 200 }}
                >
                  <MenuItem value="">All types</MenuItem>
                  {Object.values(DOCUMENT_TYPE).map((type) => (
                    <MenuItem key={type} value={type}>
                      {documentTypeLabels[type]}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  label="From date"
                  type="date"
                  value={dateFrom}
                  onChange={(event) => {
                    setDateFrom(event.target.value);
                    setPaginationModel({ page: 0, pageSize: paginationModel.pageSize });
                  }}
                  InputLabelProps={{ shrink: true }}
                  sx={{ minWidth: 170 }}
                />
                <TextField
                  label="To date"
                  type="date"
                  value={dateTo}
                  onChange={(event) => {
                    setDateTo(event.target.value);
                    setPaginationModel({ page: 0, pageSize: paginationModel.pageSize });
                  }}
                  InputLabelProps={{ shrink: true }}
                  sx={{ minWidth: 170 }}
                />
              </Stack>

              {documentsQuery.error ? (
                <Typography color="error">{(documentsQuery.error as Error).message}</Typography>
              ) : null}

              {actionError ? (
                <Typography color="error">{actionError}</Typography>
              ) : null}

              <AppDataTable
                rows={rows}
                columns={columns}
                loading={documentsQuery.isLoading || documentsQuery.isFetching}
                rowCount={documentsQuery.data?.total || 0}
                paginationModel={paginationModel}
                onPaginationModelChange={setPaginationModel}
                sortModel={sortModel}
                onSortModelChange={(model) => {
                  setSortModel(model.length ? model : [{ field: "CreatedAt", sort: "desc" }]);
                  setPaginationModel({ page: 0, pageSize: paginationModel.pageSize });
                }}
                sortingMode="server"
              />
            </Stack>
          </PageContainer>

          <AppModal
            open={parsedModalOpen}
            onClose={() => setParsedModalOpen(false)}
            title={parsedModalTitle || "Parsed data"}
            maxWidth="sm"
          >
            <Box
              component="pre"
              sx={{
                m: 0,
                p: 2,
                bgcolor: "action.hover",
                borderRadius: 1,
                overflow: "auto",
                maxHeight: 420,
                fontSize: "0.8125rem",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}
            >
              {JSON.stringify(parsedModalData, null, 2)}
            </Box>
          </AppModal>

          <ConfirmDialog
            open={deleteOpen}
            title="Delete document"
            message={
              deleteRow
                ? `Delete ${documentTypeLabels[deleteRow.DocumentType as DOCUMENT_TYPE] || deleteRow.DocumentType} for ${deleteRow.CustomerLabel}?`
                : "Delete this document?"
            }
            confirmLabel="Delete"
            loading={!!deleteRow && actionLoadingId === deleteRow._id}
            onConfirm={handleDeleteConfirm}
            onClose={() => {
              setDeleteOpen(false);
              setDeleteRow(null);
            }}
          />
        </AdminLayout>
      </RoleGuard>
    </AuthGuard>
  );
};

export default AdminDocumentsPage;
