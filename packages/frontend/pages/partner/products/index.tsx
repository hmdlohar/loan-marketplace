import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import IconButton from "@mui/material/IconButton";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { GridColDef, GridPaginationModel } from "@mui/x-data-grid";
import type { NextPage } from "next";
import { useState } from "react";
import { useQuery, useQueryClient } from "react-query";
import { LOAN_PRODUCT, USER_ROLE } from "commonlib";
import AppDataTable from "../../../components/common/AppDataTable";
import AppModal from "../../../components/common/AppModal";
import ConfirmDialog from "../../../components/common/ConfirmDialog";
import PageContainer from "../../../components/common/PageContainer";
import AuthGuard from "../../../guards/AuthGuard";
import RoleGuard from "../../../guards/RoleGuard";
import PartnerLayout from "../../../layouts/partner/PartnerLayout";
import { bSdk } from "../../../services/BackendSDKService";

type ProductRow = {
  _id: string;
  Title: string;
  Slug: string;
  LoanType: string;
  ShortDescription: string;
  LongDescription: string;
  ModifiedAt?: string;
};

const loanProductLabels: Record<string, string> = {
  [LOAN_PRODUCT.HOME_LOAN]: "Home Loan",
  [LOAN_PRODUCT.LAP]: "Loan Against Property",
  [LOAN_PRODUCT.PERSONAL_LOAN]: "Personal Loan",
  [LOAN_PRODUCT.WORKING_CAPITAL]: "Working Capital",
  [LOAN_PRODUCT.CREDIT_CARD]: "Credit Card",
};

const emptyForm = {
  Title: "",
  ShortDescription: "",
  LongDescription: "",
  LoanType: LOAN_PRODUCT.PERSONAL_LOAN,
};

const PartnerProductsPage: NextPage = () => {
  const queryClient = useQueryClient();
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 20 });
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<ProductRow | null>(null);
  const [deleteProduct, setDeleteProduct] = useState<ProductRow | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState(emptyForm);

  const productsQuery = useQuery(
    ["partner-products", paginationModel.page, paginationModel.pageSize],
    async () => {
      const response = await bSdk.Products_List({
        page: paginationModel.page + 1,
        pageSize: paginationModel.pageSize,
      });
      if (!response.status) {
        throw new Error(response.message || "Failed to load products.");
      }
      return response.data;
    },
    { keepPreviousData: true }
  );

  const columns: GridColDef[] = [
    { field: "Title", headerName: "Title", flex: 1, minWidth: 180 },
    { field: "Slug", headerName: "Slug", width: 180 },
    {
      field: "LoanType",
      headerName: "Loan type",
      width: 180,
      valueFormatter: (value) => loanProductLabels[value as string] || value,
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
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <IconButton
            size="small"
            onClick={() => {
              const row = params.row as ProductRow;
              setEditProduct(row);
              setForm({
                Title: row.Title,
                ShortDescription: row.ShortDescription,
                LongDescription: row.LongDescription,
                LoanType: row.LoanType as LOAN_PRODUCT,
              });
              setError("");
              setModalOpen(true);
            }}
          >
            <EditOutlinedIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => {
              setDeleteProduct(params.row as ProductRow);
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
      <RoleGuard roles={[USER_ROLE.PARTNER]}>
        <PartnerLayout>
          <PageContainer>
            <Stack spacing={3}>
              <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" spacing={2}>
                <Box>
                  <Typography variant="h4" component="h1" gutterBottom>
                    Products
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Manage loan products offered to customers.
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => {
                    setEditProduct(null);
                    setForm(emptyForm);
                    setError("");
                    setModalOpen(true);
                  }}
                >
                  Add product
                </Button>
              </Stack>

              <AppDataTable
                rows={productsQuery.data?.items || []}
                columns={columns}
                loading={productsQuery.isLoading || productsQuery.isFetching}
                rowCount={productsQuery.data?.total || 0}
                paginationModel={paginationModel}
                onPaginationModelChange={setPaginationModel}
              />
            </Stack>

            <AppModal
              open={modalOpen}
              title={editProduct ? "Edit product" : "Add product"}
              onClose={() => {
                if (!loading) {
                  setModalOpen(false);
                }
              }}
              onSubmit={async () => {
                setLoading(true);
                setError("");
                try {
                  if (editProduct) {
                    const response = await bSdk.Products_Update({
                      _id: editProduct._id,
                      Title: form.Title,
                      ShortDescription: form.ShortDescription,
                      LongDescription: form.LongDescription,
                      LoanType: form.LoanType,
                    });
                    if (!response.status) {
                      throw new Error(response.message || "Failed to update product.");
                    }
                  } else {
                    const response = await bSdk.Products_Create({
                      Title: form.Title,
                      ShortDescription: form.ShortDescription,
                      LongDescription: form.LongDescription,
                      LoanType: form.LoanType,
                    });
                    if (!response.status) {
                      throw new Error(response.message || "Failed to create product.");
                    }
                  }

                  setModalOpen(false);
                  queryClient.invalidateQueries(["partner-products"]);
                } catch (ex: any) {
                  setError(ex.response?.data?.message || ex.message || "Request failed.");
                } finally {
                  setLoading(false);
                }
              }}
              loading={loading}
              submitLabel={editProduct ? "Save changes" : "Create product"}
              maxWidth="md"
            >
              <Stack spacing={2} sx={{ pt: 1 }}>
                <TextField
                  label="Title"
                  value={form.Title}
                  onChange={(event) => setForm({ ...form, Title: event.target.value })}
                  fullWidth
                  required
                />
                <TextField
                  label="Short description"
                  value={form.ShortDescription}
                  onChange={(event) => setForm({ ...form, ShortDescription: event.target.value })}
                  fullWidth
                  required
                  multiline
                  minRows={2}
                />
                <TextField
                  label="Long description"
                  value={form.LongDescription}
                  onChange={(event) => setForm({ ...form, LongDescription: event.target.value })}
                  fullWidth
                  required
                  multiline
                  minRows={4}
                />
                <FormControl fullWidth>
                  <InputLabel id="loan-type-label">Loan type</InputLabel>
                  <Select
                    labelId="loan-type-label"
                    label="Loan type"
                    value={form.LoanType}
                    onChange={(event) => setForm({ ...form, LoanType: event.target.value as LOAN_PRODUCT })}
                  >
                    {Object.values(LOAN_PRODUCT).map((loanType) => (
                      <MenuItem key={loanType} value={loanType}>
                        {loanProductLabels[loanType]}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                {error ? (
                  <Typography variant="body2" color="error">
                    {error}
                  </Typography>
                ) : null}
              </Stack>
            </AppModal>

            <ConfirmDialog
              open={deleteOpen}
              title="Delete product"
              message={`Delete "${deleteProduct?.Title || "this product"}"? This cannot be undone.`}
              onClose={() => {
                if (!loading) {
                  setDeleteOpen(false);
                }
              }}
              onConfirm={async () => {
                if (!deleteProduct) return;
                setLoading(true);
                try {
                  const response = await bSdk.Products_Delete({ _id: deleteProduct._id });
                  if (!response.status) {
                    throw new Error(response.message || "Failed to delete product.");
                  }
                  setDeleteOpen(false);
                  queryClient.invalidateQueries(["partner-products"]);
                } catch (ex: any) {
                  setError(ex.response?.data?.message || ex.message || "Delete failed.");
                } finally {
                  setLoading(false);
                }
              }}
              loading={loading}
            />
          </PageContainer>
        </PartnerLayout>
      </RoleGuard>
    </AuthGuard>
  );
};

export default PartnerProductsPage;
