import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import Autocomplete from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import Divider from "@mui/material/Divider";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import IconButton from "@mui/material/IconButton";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { GridColDef, GridPaginationModel } from "@mui/x-data-grid";
import type { NextPage } from "next";
import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "react-query";
import { FormFieldDefinition, LOAN_PRODUCT, USER_ROLE } from "commonlib";
import AppDataTable from "../../../components/common/AppDataTable";
import AppModal from "../../../components/common/AppModal";
import ConfirmDialog from "../../../components/common/ConfirmDialog";
import PageContainer from "../../../components/common/PageContainer";
import AuthGuard from "../../../guards/AuthGuard";
import RoleGuard from "../../../guards/RoleGuard";
import PartnerLayout from "../../../layouts/partner/PartnerLayout";
import { bSdk } from "../../../services/BackendSDKService";
import { getFileProxyUrl } from "../../../services/fileProxyUtil";

type BankOption = {
  _id: string;
  Name: string;
  LogoPath?: string;
};

type ProductRow = {
  _id: string;
  Title: string;
  Slug: string;
  LoanType: string;
  ShortDescription: string;
  KeyBenefits?: string[];
  BankID: string;
  FormFields?: FormFieldDefinition[];
  ModifiedAt?: string;
};

type ProductForm = {
  Title: string;
  ShortDescription: string;
  KeyBenefitsText: string;
  LoanType: LOAN_PRODUCT;
  BankID: string;
  FormFields: FormFieldDefinition[];
};

const loanProductLabels: Record<string, string> = {
  [LOAN_PRODUCT.HOME_LOAN]: "Home Loan",
  [LOAN_PRODUCT.LAP]: "Loan Against Property",
  [LOAN_PRODUCT.PERSONAL_LOAN]: "Personal Loan",
  [LOAN_PRODUCT.WORKING_CAPITAL]: "Working Capital",
  [LOAN_PRODUCT.CREDIT_CARD]: "Credit Card",
};

const fieldTypeOptions = ["text", "email", "mobile", "number", "date", "select", "radio", "checkbox"];

const emptyForm: ProductForm = {
  Title: "",
  ShortDescription: "",
  KeyBenefitsText: "",
  LoanType: LOAN_PRODUCT.PERSONAL_LOAN,
  BankID: "",
  FormFields: [],
};

function keyBenefitsToText(benefits?: string[]) {
  return (benefits || []).join("\n");
}

function textToKeyBenefits(text: string) {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function emptyAdditionalField(): FormFieldDefinition {
  return {
    Key: "",
    Label: "",
    Type: "text",
    Section: "",
    Required: false,
  };
}

const PartnerProductsPage: NextPage = () => {
  const queryClient = useQueryClient();
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 20 });
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<ProductRow | null>(null);
  const [deleteProduct, setDeleteProduct] = useState<ProductRow | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [bankSearch, setBankSearch] = useState("");

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

  const banksQuery = useQuery(
    ["banks-autocomplete", bankSearch],
    async () => {
      const response = await bSdk.Banks_List({
        page: 1,
        pageSize: 100,
        search: bankSearch || undefined,
      });
      if (!response.status) {
        throw new Error(response.message || "Failed to load banks.");
      }
      return response.data?.items || [];
    },
    { keepPreviousData: true }
  );

  const bankMap = useMemo(() => {
    const map = new Map<string, BankOption>();
    (banksQuery.data || []).forEach((bank: BankOption) => map.set(bank._id, bank));
    (productsQuery.data?.items || []).forEach((product: ProductRow) => {
      if (product.BankID && !map.has(product.BankID)) {
        map.set(product.BankID, { _id: product.BankID, Name: product.BankID });
      }
    });
    return map;
  }, [banksQuery.data, productsQuery.data?.items]);

  const selectedBank = form.BankID ? bankMap.get(form.BankID) || null : null;

  const columns: GridColDef[] = [
    { field: "Title", headerName: "Title", flex: 1, minWidth: 180 },
    { field: "Slug", headerName: "Slug", width: 180 },
    {
      field: "BankID",
      headerName: "Bank",
      width: 220,
      sortable: false,
      renderCell: (params) => {
        const bank = bankMap.get(params.value as string);
        if (!bank) {
          return (params.value as string) || "—";
        }
        return (
          <Stack direction="row" alignItems="center" spacing={1}>
            {bank.LogoPath ? (
              <Box
                component="img"
                src={getFileProxyUrl(bank.LogoPath)}
                alt=""
                sx={{ width: 28, height: 28, objectFit: "contain", flexShrink: 0 }}
              />
            ) : null}
            <Typography variant="body2" noWrap>
              {bank.Name}
            </Typography>
          </Stack>
        );
      },
    },
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
                KeyBenefitsText: keyBenefitsToText(row.KeyBenefits),
                LoanType: row.LoanType as LOAN_PRODUCT,
                BankID: row.BankID,
                FormFields: row.FormFields || [],
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

  async function submitProduct() {
    setLoading(true);
    setError("");
    try {
      const payload = {
        _id: editProduct?._id,
        Title: form.Title,
        ShortDescription: form.ShortDescription,
        KeyBenefits: textToKeyBenefits(form.KeyBenefitsText),
        LoanType: form.LoanType,
        BankID: form.BankID,
        FormFields: form.FormFields.filter((field) => field.Key && field.Label),
      };

      const response = await bSdk.Products_Save(payload);
      if (!response.status) {
        throw new Error(response.message || "Failed to save product.");
      }

      setModalOpen(false);
      queryClient.invalidateQueries(["partner-products"]);
    } catch (ex: any) {
      setError(ex.response?.data?.message || ex.message || "Request failed.");
    } finally {
      setLoading(false);
    }
  }

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
              onSubmit={submitProduct}
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
                  label="Headline (short description)"
                  value={form.ShortDescription}
                  onChange={(event) => setForm({ ...form, ShortDescription: event.target.value })}
                  fullWidth
                  required
                />
                <TextField
                  label="Key benefits (one per line)"
                  value={form.KeyBenefitsText}
                  onChange={(event) => setForm({ ...form, KeyBenefitsText: event.target.value })}
                  fullWidth
                  multiline
                  minRows={3}
                  placeholder={"Zero Paperwork\nInstant Loan Approval"}
                />
                <Autocomplete
                  options={(banksQuery.data || []) as BankOption[]}
                  getOptionLabel={(option) => option.Name}
                  isOptionEqualToValue={(option, value) => option._id === value._id}
                  value={selectedBank}
                  onChange={(_, value) => setForm({ ...form, BankID: value?._id || "" })}
                  onInputChange={(_, value) => setBankSearch(value)}
                  loading={banksQuery.isLoading}
                  renderOption={(props, option) => {
                    const { key, ...optionProps } = props;
                    return (
                      <Box
                        component="li"
                        key={key}
                        {...optionProps}
                        sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
                      >
                        <Box
                          sx={{
                            width: 32,
                            height: 32,
                            flexShrink: 0,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {option.LogoPath ? (
                            <Box
                              component="img"
                              src={getFileProxyUrl(option.LogoPath)}
                              alt=""
                              sx={{ maxWidth: 32, maxHeight: 32, objectFit: "contain" }}
                            />
                          ) : (
                            <Box sx={{ width: 32, height: 32, bgcolor: "action.hover", borderRadius: 1 }} />
                          )}
                        </Box>
                        {option.Name}
                      </Box>
                    );
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Bank"
                      required
                      placeholder="Search bank..."
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                          <>
                            {selectedBank?.LogoPath ? (
                              <Box
                                component="img"
                                src={getFileProxyUrl(selectedBank.LogoPath)}
                                alt=""
                                sx={{ width: 24, height: 24, objectFit: "contain", ml: 0.5, mr: 0.5 }}
                              />
                            ) : null}
                            {params.InputProps.startAdornment}
                          </>
                        ),
                      }}
                    />
                  )}
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

                <Divider />
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="subtitle2">Additional form fields</Typography>
                  <Button
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={() =>
                      setForm({ ...form, FormFields: [...form.FormFields, emptyAdditionalField()] })
                    }
                  >
                    Add field
                  </Button>
                </Stack>
                <Typography variant="caption" color="text.secondary">
                  Standard fields for the selected loan type are included automatically. Add only product-specific fields here.
                </Typography>

                {form.FormFields.map((field, index) => (
                  <Stack key={index} spacing={1.5} sx={{ p: 2, border: 1, borderColor: "divider", borderRadius: 1 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2" fontWeight={600}>
                        Field {index + 1}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() =>
                          setForm({
                            ...form,
                            FormFields: form.FormFields.filter((_, fieldIndex) => fieldIndex !== index),
                          })
                        }
                      >
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                      <TextField
                        label="Key"
                        value={field.Key}
                        onChange={(event) => {
                          const next = [...form.FormFields];
                          next[index] = { ...field, Key: event.target.value };
                          setForm({ ...form, FormFields: next });
                        }}
                        fullWidth
                        required
                      />
                      <TextField
                        label="Label"
                        value={field.Label}
                        onChange={(event) => {
                          const next = [...form.FormFields];
                          next[index] = { ...field, Label: event.target.value };
                          setForm({ ...form, FormFields: next });
                        }}
                        fullWidth
                        required
                      />
                    </Stack>
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                      <FormControl fullWidth>
                        <InputLabel id={`field-type-${index}`}>Type</InputLabel>
                        <Select
                          labelId={`field-type-${index}`}
                          label="Type"
                          value={field.Type}
                          onChange={(event) => {
                            const next = [...form.FormFields];
                            next[index] = { ...field, Type: event.target.value };
                            setForm({ ...form, FormFields: next });
                          }}
                        >
                          {fieldTypeOptions.map((type) => (
                            <MenuItem key={type} value={type}>
                              {type}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      <TextField
                        label="Section"
                        value={field.Section || ""}
                        onChange={(event) => {
                          const next = [...form.FormFields];
                          next[index] = { ...field, Section: event.target.value };
                          setForm({ ...form, FormFields: next });
                        }}
                        fullWidth
                      />
                    </Stack>
                    <TextField
                      label="Options (comma-separated, for select/radio)"
                      value={(field.Options || []).join(", ")}
                      onChange={(event) => {
                        const next = [...form.FormFields];
                        next[index] = {
                          ...field,
                          Options: event.target.value
                            .split(",")
                            .map((option) => option.trim())
                            .filter(Boolean),
                        };
                        setForm({ ...form, FormFields: next });
                      }}
                      fullWidth
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={field.Required}
                          onChange={(event) => {
                            const next = [...form.FormFields];
                            next[index] = { ...field, Required: event.target.checked };
                            setForm({ ...form, FormFields: next });
                          }}
                        />
                      }
                      label="Required"
                    />
                  </Stack>
                ))}

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
