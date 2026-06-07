import Box from "@mui/material/Box";
import { DataGrid, GridColDef, GridPaginationModel } from "@mui/x-data-grid";

export default function AppDataTable(props: {
  rows: any[];
  columns: GridColDef[];
  loading?: boolean;
  rowCount?: number;
  paginationModel?: GridPaginationModel;
  onPaginationModelChange?: (model: GridPaginationModel) => void;
  pageSizeOptions?: number[];
  getRowId?: (row: any) => string;
}) {
  const pageSizeOptions = props.pageSizeOptions || [10, 20, 50];
  const getRowId = props.getRowId || ((row: any) => row._id);

  return (
    <Box sx={{ width: "100%" }}>
      <DataGrid
        rows={props.rows}
        columns={props.columns}
        loading={props.loading}
        getRowId={getRowId}
        autoHeight
        disableRowSelectionOnClick
        pageSizeOptions={pageSizeOptions}
        paginationMode={props.rowCount !== undefined ? "server" : "client"}
        rowCount={props.rowCount}
        paginationModel={props.paginationModel}
        onPaginationModelChange={props.onPaginationModelChange}
        initialState={{
          pagination: {
            paginationModel: { page: 0, pageSize: 20 },
          },
        }}
        sx={{
          border: 1,
          borderColor: "divider",
          borderRadius: 1,
          bgcolor: "background.paper",
          "& .MuiDataGrid-columnHeaders": {
            bgcolor: "action.hover",
          },
        }}
      />
    </Box>
  );
}
