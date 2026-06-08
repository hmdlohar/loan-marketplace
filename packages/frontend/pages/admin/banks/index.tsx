import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { GridColDef, GridPaginationModel } from "@mui/x-data-grid";
import type { NextPage } from "next";
import { useState } from "react";
import { useQuery, useQueryClient } from "react-query";
import { USER_ROLE } from "commonlib";
import AppDataTable from "../../../components/common/AppDataTable";
import AppModal from "../../../components/common/AppModal";
import ConfirmDialog from "../../../components/common/ConfirmDialog";
import PageContainer from "../../../components/common/PageContainer";
import AuthGuard from "../../../guards/AuthGuard";
import RoleGuard from "../../../guards/RoleGuard";
import AdminLayout from "../../../layouts/admin/AdminLayout";
import { bSdk } from "../../../services/BackendSDKService";
import { getFileProxyUrl } from "../../../services/fileProxyUtil";

type BankRow = {
  _id: string;
  Name: string;
  LogoPath?: string;
  CreatedAt?: string;
};

const emptyForm = {
  Name: "",
};

const AdminBanksPage: NextPage = () => {
  const queryClient = useQueryClient();
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 20 });
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editBank, setEditBank] = useState<BankRow | null>(null);
  const [deleteBank, setDeleteBank] = useState<BankRow | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState(emptyForm);

  const banksQuery = useQuery(
    ["admin-banks", paginationModel.page, paginationModel.pageSize],
    async () => {
      const response = await bSdk.Banks_List({
        page: paginationModel.page + 1,
        pageSize: paginationModel.pageSize,
      });
      if (!response.status) {
        throw new Error(response.message || "Failed to load banks.");
      }
      return response.data;
    },
    { keepPreviousData: true }
  );

  const columns: GridColDef[] = [
    {
      field: "LogoPath",
      headerName: "Logo",
      width: 90,
      sortable: false,
      renderCell: (params) => {
        const src = getFileProxyUrl(params.value as string);
        return src ? (
          <Box
            component="img"
            src={src}
            alt=""
            sx={{ width: 40, height: 40, objectFit: "contain", borderRadius: 1 }}
          />
        ) : (
          "—"
        );
      },
    },
    { field: "Name", headerName: "Name", flex: 1, minWidth: 180 },
    {
      field: "CreatedAt",
      headerName: "Created",
      width: 180,
      valueFormatter: (value) => (value ? new Date(value as string).toLocaleString() : "—"),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <IconButton
            size="small"
            onClick={() => {
              const row = params.row as BankRow;
              setEditBank(row);
              setForm({ Name: row.Name });
              setError("");
              setModalOpen(true);
            }}
          >
            <EditOutlinedIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => {
              setDeleteBank(params.row as BankRow);
              setDeleteOpen(true);
            }}
          >
            <DeleteOutlineIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <AuthGuard>
      <RoleGuard roles={[USER_ROLE.SYSTEM_ADMIN]}>
        <AdminLayout>
          <PageContainer>
            <Stack spacing={3}>
              <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" spacing={2}>
                <Box>
                  <Typography variant="h4" component="h1" gutterBottom>
                    Banks
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Manage lender banks referenced by loan products.
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => {
                    setEditBank(null);
                    setForm(emptyForm);
                    setError("");
                    setModalOpen(true);
                  }}
                >
                  Add bank
                </Button>
              </Stack>

              <AppDataTable
                rows={banksQuery.data?.items || []}
                columns={columns}
                loading={banksQuery.isLoading || banksQuery.isFetching}
                rowCount={banksQuery.data?.total || 0}
                paginationModel={paginationModel}
                onPaginationModelChange={setPaginationModel}
              />
            </Stack>

            <AppModal
              open={modalOpen}
              title={editBank ? "Edit bank" : "Add bank"}
              onClose={() => {
                if (!loading) {
                  setModalOpen(false);
                }
              }}
              onSubmit={async () => {
                setLoading(true);
                setError("");
                try {
                  if (editBank) {
                    const response = await bSdk.Banks_Update({
                      _id: editBank._id,
                      Name: form.Name,
                    });
                    if (!response.status) {
                      throw new Error(response.message || "Failed to update bank.");
                    }
                  } else {
                    const response = await bSdk.Banks_Create({
                      Name: form.Name,
                    });
                    if (!response.status) {
                      throw new Error(response.message || "Failed to create bank.");
                    }
                  }

                  setModalOpen(false);
                  queryClient.invalidateQueries(["admin-banks"]);
                  queryClient.invalidateQueries(["banks-autocomplete"]);
                } catch (ex: any) {
                  setError(ex.response?.data?.message || ex.message || "Request failed.");
                } finally {
                  setLoading(false);
                }
              }}
              loading={loading}
              submitLabel={editBank ? "Save changes" : "Create bank"}
              maxWidth="sm"
            >
              <Stack spacing={2} sx={{ pt: 1 }}>
                <TextField
                  label="Bank name"
                  value={form.Name}
                  onChange={(event) => setForm({ ...form, Name: event.target.value })}
                  fullWidth
                  required
                />
                {editBank?.LogoPath ? (
                  <Typography variant="caption" color="text.secondary">
                    Logo: {editBank.LogoPath} (set via import)
                  </Typography>
                ) : null}
                {error ? (
                  <Typography variant="body2" color="error">
                    {error}
                  </Typography>
                ) : null}
              </Stack>
            </AppModal>

            <ConfirmDialog
              open={deleteOpen}
              title="Delete bank"
              message={`Delete "${deleteBank?.Name || "this bank"}"? Products referencing this bank may break.`}
              onClose={() => {
                if (!loading) {
                  setDeleteOpen(false);
                }
              }}
              onConfirm={async () => {
                if (!deleteBank) return;
                setLoading(true);
                try {
                  const response = await bSdk.Banks_Delete({ _id: deleteBank._id });
                  if (!response.status) {
                    throw new Error(response.message || "Failed to delete bank.");
                  }
                  setDeleteOpen(false);
                  queryClient.invalidateQueries(["admin-banks"]);
                  queryClient.invalidateQueries(["banks-autocomplete"]);
                } catch (ex: any) {
                  setError(ex.response?.data?.message || ex.message || "Delete failed.");
                } finally {
                  setLoading(false);
                }
              }}
              loading={loading}
            />
          </PageContainer>
        </AdminLayout>
      </RoleGuard>
    </AuthGuard>
  );
};

export default AdminBanksPage;
