import AddIcon from "@mui/icons-material/Add";
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
import LogoUploadField from "../../../components/common/LogoUploadField";
import PageContainer from "../../../components/common/PageContainer";
import AuthGuard from "../../../guards/AuthGuard";
import RoleGuard from "../../../guards/RoleGuard";
import AdminLayout from "../../../layouts/admin/AdminLayout";
import { bSdk } from "../../../services/BackendSDKService";

type PartnerRow = {
  _id: string;
  Name: string;
  Logo?: string;
  CreatedAt?: string;
};

const AdminPartnersPage: NextPage = () => {
  const queryClient = useQueryClient();
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 20 });
  const [modalOpen, setModalOpen] = useState(false);
  const [editPartner, setEditPartner] = useState<PartnerRow | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    Name: "",
    Email: "",
    Password: "",
    Mobile: "",
    FullName: "",
  });
  const [createdPartnerId, setCreatedPartnerId] = useState("");

  const isCreateMode = !editPartner && !createdPartnerId;
  const isLogoStep = !!createdPartnerId;
  const isEditMode = !!editPartner && !createdPartnerId;
  const activePartnerId = editPartner?._id || createdPartnerId;

  const partnersQuery = useQuery(
    ["admin-partners", paginationModel.page, paginationModel.pageSize],
    async () => {
      const response = await bSdk.Partners_List({
        page: paginationModel.page + 1,
        pageSize: paginationModel.pageSize,
      });
      if (!response.status) {
        throw new Error(response.message || "Failed to load partners.");
      }
      return response.data;
    },
    { keepPreviousData: true }
  );

  const columns: GridColDef[] = [
    {
      field: "Logo",
      headerName: "Logo",
      width: 90,
      sortable: false,
      renderCell: (params) =>
        params.value ? (
          <Box
            component="img"
            src={params.value}
            alt=""
            sx={{ width: 40, height: 40, objectFit: "contain", borderRadius: 1 }}
          />
        ) : (
          "—"
        ),
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
      width: 100,
      sortable: false,
      renderCell: (params) => (
        <IconButton
          size="small"
          onClick={() => {
            openEditModal(params.row as PartnerRow);
          }}
        >
          <EditOutlinedIcon fontSize="small" />
        </IconButton>
      ),
    },
  ];

  async function openEditModal(partner: PartnerRow) {
    setEditPartner(partner);
    setCreatedPartnerId("");
    setError("");
    setModalOpen(true);
    setLoadingDetails(true);

    try {
      const response = await bSdk.Partners_Get({ _id: partner._id });
      if (!response.status) {
        throw new Error(response.message || "Failed to load partner details.");
      }

      const user = response.data.user;
      setForm({
        Name: response.data.partner.Name || "",
        FullName: user?.FullName || "",
        Email: user?.Email || "",
        Mobile: user?.Mobile || "",
        Password: "",
      });
    } catch (ex: any) {
      setError(ex.response?.data?.message || ex.message || "Failed to load partner details.");
      setForm({
        Name: partner.Name,
        Email: "",
        Password: "",
        Mobile: "",
        FullName: "",
      });
    } finally {
      setLoadingDetails(false);
    }
  }

  async function uploadLogo(partnerId: string, file: File) {
    try {
      const fileBase64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          const base64 = result.split(",")[1];
          if (!base64) {
            reject(new Error("Failed to read file."));
            return;
          }
          resolve(base64);
        };
        reader.onerror = () => reject(new Error("Failed to read file."));
        reader.readAsDataURL(file);
      });

      const response = await bSdk.Partners_UploadLogo({
        PartnerID: partnerId,
        ContentType: file.type || "image/png",
        FileBase64: fileBase64,
      });

      if (!response.status) {
        throw new Error(response.message || "Failed to upload logo.");
      }
    } catch (ex: any) {
      throw new Error(ex.response?.data?.message || ex.message || "Failed to upload logo.");
    }
  }

  return (
    <AuthGuard>
      <RoleGuard roles={[USER_ROLE.SYSTEM_ADMIN]}>
        <AdminLayout>
          <PageContainer>
            <Stack spacing={3}>
              <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" spacing={2}>
                <Box>
                  <Typography variant="h4" component="h1" gutterBottom>
                    Partners
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Manage lending partners and their login accounts.
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => {
                    setEditPartner(null);
                    setForm({ Name: "", Email: "", Password: "", Mobile: "", FullName: "" });
                    setCreatedPartnerId("");
                    setError("");
                    setModalOpen(true);
                  }}
                >
                  Add partner
                </Button>
              </Stack>

              <AppDataTable
                rows={partnersQuery.data?.items || []}
                columns={columns}
                loading={partnersQuery.isLoading || partnersQuery.isFetching}
                rowCount={partnersQuery.data?.total || 0}
                paginationModel={paginationModel}
                onPaginationModelChange={setPaginationModel}
              />
            </Stack>

            <AppModal
              open={modalOpen}
              title={isLogoStep ? "Upload partner logo" : isEditMode ? "Edit partner" : "Add partner"}
              onClose={() => {
                if (!loading) {
                  setModalOpen(false);
                }
              }}
              onSubmit={async () => {
                if (isLogoStep) {
                  setModalOpen(false);
                  setCreatedPartnerId("");
                  return;
                }

                if (loadingDetails) {
                  return;
                }

                setLoading(true);
                setError("");
                try {
                  if (isEditMode && editPartner) {
                    const response = await bSdk.Partners_Update({
                      _id: editPartner._id,
                      Name: form.Name,
                      FullName: form.FullName,
                      Email: form.Email,
                      Mobile: form.Mobile,
                      Password: form.Password || undefined,
                    });
                    if (!response.status) {
                      throw new Error(response.message || "Failed to update partner.");
                    }
                    setModalOpen(false);
                  } else if (isCreateMode) {
                    const response = await bSdk.Partners_Create({
                      Name: form.Name,
                      Email: form.Email,
                      Password: form.Password,
                      Mobile: form.Mobile,
                      FullName: form.FullName,
                    });
                    if (!response.status) {
                      throw new Error(response.message || "Failed to create partner.");
                    }
                    setCreatedPartnerId(response.data.partner._id);
                    setEditPartner(response.data.partner);
                  }

                  queryClient.invalidateQueries(["admin-partners"]);
                } catch (ex: any) {
                  setError(ex.response?.data?.message || ex.message || "Request failed.");
                } finally {
                  setLoading(false);
                }
              }}
              loading={loading || loadingDetails}
              submitLabel={isLogoStep ? "Done" : isEditMode ? "Save changes" : "Create partner"}
              maxWidth="md"
            >
              <Stack spacing={2} sx={{ pt: 1 }}>
                {loadingDetails ? (
                  <Typography variant="body2" color="text.secondary">
                    Loading partner details...
                  </Typography>
                ) : null}
                <TextField
                  label="Partner name"
                  value={form.Name}
                  onChange={(event) => setForm({ ...form, Name: event.target.value })}
                  fullWidth
                  required
                  disabled={isLogoStep || loadingDetails}
                />
                {isCreateMode || isEditMode ? (
                  <>
                    <TextField
                      label="Contact full name"
                      value={form.FullName}
                      onChange={(event) => setForm({ ...form, FullName: event.target.value })}
                      fullWidth
                      required
                      disabled={loadingDetails}
                    />
                    <TextField
                      label="Email"
                      type="email"
                      value={form.Email}
                      onChange={(event) => setForm({ ...form, Email: event.target.value })}
                      fullWidth
                      required
                      disabled={loadingDetails}
                    />
                    <TextField
                      label={isEditMode ? "New password (optional)" : "Password"}
                      type="password"
                      value={form.Password}
                      onChange={(event) => setForm({ ...form, Password: event.target.value })}
                      fullWidth
                      required={isCreateMode}
                      disabled={loadingDetails}
                      helperText={isEditMode ? "Leave blank to keep the current password." : undefined}
                    />
                    <TextField
                      label="Mobile"
                      value={form.Mobile}
                      onChange={(event) => setForm({ ...form, Mobile: event.target.value })}
                      fullWidth
                      required
                      disabled={loadingDetails}
                      inputProps={{ inputMode: "numeric", maxLength: 10 }}
                    />
                  </>
                ) : null}
                {isEditMode || isLogoStep ? (
                  <LogoUploadField
                    previewUrl={editPartner?.Logo}
                    onUpload={async (file) => {
                      await uploadLogo(activePartnerId, file);
                      queryClient.invalidateQueries(["admin-partners"]);
                    }}
                  />
                ) : null}
                {error ? (
                  <Typography variant="body2" color="error">
                    {error}
                  </Typography>
                ) : null}
              </Stack>
            </AppModal>
          </PageContainer>
        </AdminLayout>
      </RoleGuard>
    </AuthGuard>
  );
};

export default AdminPartnersPage;
