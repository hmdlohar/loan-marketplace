import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { DOCUMENT_TYPE } from "commonlib";

export default function SavedDocumentPicker(props: {
  documentType: DOCUMENT_TYPE;
  label: string;
  savedDoc: any | null;
  attachedDoc: any | null;
  uploading: boolean;
  onUseSaved: () => void;
  onUpload: (file: File) => void;
}) {
  const isAttached = !!props.attachedDoc;

  return (
    <Card>
      <CardContent>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ sm: "center" }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle1" fontWeight={600}>
              {props.label}
            </Typography>
            <Chip
              size="small"
              label={isAttached ? "Attached" : "Pending"}
              color={isAttached ? "success" : "warning"}
              sx={{ mt: 1 }}
            />
            {props.attachedDoc?.Name ? (
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                {props.attachedDoc.Name}
              </Typography>
            ) : null}
          </Box>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
            {props.savedDoc && !isAttached ? (
              <Button variant="outlined" color="secondary" onClick={props.onUseSaved} disabled={props.uploading}>
                Use saved
              </Button>
            ) : null}
            <Button
              variant="outlined"
              component="label"
              startIcon={<CloudUploadOutlinedIcon />}
              disabled={props.uploading}
            >
              {props.uploading ? "Uploading..." : props.savedDoc ? "Upload new" : "Upload"}
              <input
                hidden
                type="file"
                accept="image/*,application/pdf"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (!file) {
                    return;
                  }
                  props.onUpload(file);
                  event.target.value = "";
                }}
              />
            </Button>
          </Stack>
        </Stack>
        {props.savedDoc && !isAttached ? (
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1.5 }}>
            <CheckCircleOutlineIcon fontSize="small" color="success" />
            <Typography variant="caption" color="text.secondary">
              Saved document available — reuse to skip re-upload
            </Typography>
          </Stack>
        ) : null}
      </CardContent>
    </Card>
  );
}
