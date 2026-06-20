import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CloseIcon from "@mui/icons-material/Close";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Collapse from "@mui/material/Collapse";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useTheme } from "@mui/material/styles";
import { DOCUMENT_TYPE } from "commonlib";
import { useEffect, useState } from "react";
import {
  getAuthenticatedFileUrl,
  isImageDocumentName,
  isPdfDocumentName,
} from "../../services/fileProxyUtil";

function getParsedDocumentDisplayName(doc: any) {
  const parsedData = doc.ParsedData;
  if (parsedData && typeof parsedData === "object") {
    const firstName = String(parsedData.firstName || parsedData.first_name || "").trim();
    const lastName = String(parsedData.lastName || parsedData.last_name || "").trim();
    const fullName = `${firstName} ${lastName}`.trim();
    if (fullName) {
      return fullName;
    }

    const accountHolderName = String(parsedData.accountHolderName || parsedData.account_holder_name || "").trim();
    if (accountHolderName) {
      return accountHolderName;
    }

    const businessName = String(parsedData.businessName || parsedData.business_name || "").trim();
    if (businessName) {
      return businessName;
    }

    const ownerName = String(parsedData.ownerName || parsedData.owner_name || "").trim();
    if (ownerName) {
      return ownerName;
    }

    const panNumber = String(parsedData.panNumber || parsedData.pan_number || "").trim();
    if (panNumber) {
      return panNumber;
    }
  }

  return doc.Name || "Saved document";
}

function formatDocumentDate(value?: string) {
  if (!value) {
    return "";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return date.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

function isDocumentImage(doc: any) {
  return isImageDocumentName(doc.Name) || isImageDocumentName(doc.Path);
}

function isDocumentPdf(doc: any) {
  return isPdfDocumentName(doc.Name) || isPdfDocumentName(doc.Path);
}

function PreviewEyeButton(props: { disabled?: boolean; onOpen: () => void }) {
  return (
    <IconButton
      size="small"
      aria-label="View document"
      disabled={props.disabled}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        props.onOpen();
      }}
      sx={{
        position: "absolute",
        top: 6,
        right: 6,
        bgcolor: "background.paper",
        boxShadow: 1,
        zIndex: 1,
        "&:hover": {
          bgcolor: "background.paper",
        },
      }}
    >
      <VisibilityOutlinedIcon fontSize="small" />
    </IconButton>
  );
}

function DocumentPreviewModal(props: { doc: any | null; onClose: () => void }) {
  if (!props.doc) {
    return null;
  }

  const fileUrl = getAuthenticatedFileUrl(props.doc.Path);
  const displayName = getParsedDocumentDisplayName(props.doc);
  const isImage = isDocumentImage(props.doc);
  const isPdf = isDocumentPdf(props.doc);

  return (
    <Dialog fullScreen open={!!props.doc} onClose={props.onClose}>
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1,
          py: 1.5,
        }}
      >
        <Typography variant="h6" component="span" noWrap sx={{ flex: 1 }}>
          {displayName}
        </Typography>
        <IconButton aria-label="Close preview" onClick={props.onClose} edge="end">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent
        sx={{
          p: 0,
          display: "flex",
          flexDirection: "column",
          flex: 1,
          overflow: "hidden",
        }}
      >
        {!fileUrl ? (
          <Box sx={{ p: 3 }}>
            <Typography color="text.secondary">Document preview is not available.</Typography>
          </Box>
        ) : isImage ? (
          <Box
            sx={{
              flex: 1,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              overflow: "auto",
              bgcolor: "action.hover",
              p: 2,
            }}
          >
            <Box
              component="img"
              key={fileUrl}
              src={fileUrl}
              alt={displayName}
              sx={{
                display: "block",
                maxWidth: "100%",
                maxHeight: "100%",
                objectFit: "contain",
              }}
            />
          </Box>
        ) : isPdf ? (
          <Box
            component="iframe"
            src={fileUrl}
            title={displayName}
            sx={{
              flex: 1,
              width: "100%",
              minHeight: 0,
              border: 0,
              bgcolor: "action.hover",
            }}
          />
        ) : (
          <Stack spacing={2} alignItems="center" justifyContent="center" sx={{ flex: 1, py: 4 }}>
            <DescriptionOutlinedIcon sx={{ fontSize: 56 }} color="action" />
            <Typography color="text.secondary">{props.doc.Name || "Document file"}</Typography>
            <Button variant="outlined" href={fileUrl} target="_blank" rel="noopener noreferrer">
              Open document
            </Button>
          </Stack>
        )}
      </DialogContent>
    </Dialog>
  );
}

function DocumentThumbnail(props: {
  doc: any;
  alt: string;
  height: number;
  maxWidth?: number | string;
  onOpenPreview: () => void;
  disabled?: boolean;
}) {
  const theme = useTheme();
  const fileUrl = getAuthenticatedFileUrl(props.doc.Path);
  const isImage = isDocumentImage(props.doc);

  return (
    <Box
      sx={{
        position: "relative",
        mt: 2,
        borderRadius: 1,
        overflow: "hidden",
        border: 1,
        borderColor: "divider",
        maxWidth: props.maxWidth || 220,
      }}
    >
      <PreviewEyeButton disabled={props.disabled || !fileUrl} onOpen={props.onOpenPreview} />
      {isImage && fileUrl ? (
        <Box
          component="img"
          key={fileUrl}
          src={fileUrl}
          alt={props.alt}
          sx={{ display: "block", width: "100%", height: props.height, objectFit: "cover" }}
        />
      ) : (
        <Box
          sx={{
            height: props.height,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "action.hover",
            ...theme.applyStyles("dark", {
              bgcolor: "action.selected",
            }),
          }}
        >
          <DescriptionOutlinedIcon color="action" sx={{ fontSize: 40 }} />
        </Box>
      )}
    </Box>
  );
}

function DocumentPreview(props: {
  doc: any;
  selected: boolean;
  onSelect: () => void;
  onOpenPreview: () => void;
  disabled: boolean;
}) {
  const theme = useTheme();
  const fileUrl = getAuthenticatedFileUrl(props.doc.Path);
  const isImage = isDocumentImage(props.doc);
  const displayName = getParsedDocumentDisplayName(props.doc);

  return (
    <Card
      variant="outlined"
      sx={{
        borderColor: props.selected ? "secondary.main" : "divider",
        borderWidth: props.selected ? 2 : 1,
        bgcolor: props.selected ? "action.selected" : "background.paper",
      }}
    >
      <CardActionArea onClick={props.onSelect} disabled={props.disabled}>
        <Box
          sx={{
            position: "relative",
            height: 120,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            bgcolor: "action.hover",
            ...theme.applyStyles("dark", {
              bgcolor: "action.selected",
            }),
          }}
        >
          <PreviewEyeButton disabled={props.disabled || !fileUrl} onOpen={props.onOpenPreview} />
          {isImage && fileUrl ? (
            <Box
              component="img"
              src={fileUrl}
              alt={displayName}
              sx={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <Stack alignItems="center" spacing={0.5} sx={{ px: 2, textAlign: "center" }}>
              <DescriptionOutlinedIcon color="action" sx={{ fontSize: 40 }} />
              <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: "100%" }}>
                {displayName}
              </Typography>
            </Stack>
          )}
        </Box>
        <CardContent sx={{ py: 1.25, "&:last-child": { pb: 1.25 } }}>
          <Typography variant="caption" color="text.secondary" display="block" noWrap>
            {displayName}
          </Typography>
          {formatDocumentDate(props.doc.ModifiedAt || props.doc.CreatedAt) ? (
            <Typography variant="caption" color="text.disabled" display="block">
              {formatDocumentDate(props.doc.ModifiedAt || props.doc.CreatedAt)}
            </Typography>
          ) : null}
          {props.selected ? (
            <Chip size="small" color="secondary" label="Selected" sx={{ mt: 0.75 }} />
          ) : null}
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

export default function SavedDocumentPicker(props: {
  documentType: DOCUMENT_TYPE;
  label: string;
  savedDocs: any[];
  attachedDoc: any | null;
  uploading: boolean;
  onUseSaved: (documentId: string) => void;
  onUpload: (file: File) => void;
}) {
  const [showExisting, setShowExisting] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<any | null>(null);
  const isAttached = !!props.attachedDoc;
  const hasSavedDocs = props.savedDocs.length > 0;
  const attachedDisplayName = props.attachedDoc ? getParsedDocumentDisplayName(props.attachedDoc) : "";

  useEffect(() => {
    setPreviewDoc(null);
  }, [props.attachedDoc?._id]);

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
            {props.attachedDoc ? (
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                {attachedDisplayName}
              </Typography>
            ) : null}
          </Box>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
            {hasSavedDocs ? (
              <Button
                variant="outlined"
                color="secondary"
                onClick={() => setShowExisting((open) => !open)}
                disabled={props.uploading}
              >
                {showExisting ? "Hide existing" : "Choose from existing"}
              </Button>
            ) : null}
            <Button
              variant="outlined"
              component="label"
              startIcon={<CloudUploadOutlinedIcon />}
              disabled={props.uploading}
            >
              {props.uploading ? "Uploading..." : hasSavedDocs || isAttached ? "Upload new" : "Upload"}
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

        {isAttached && props.attachedDoc?.Path ? (
          <DocumentThumbnail
            key={props.attachedDoc._id || props.attachedDoc.Path}
            doc={props.attachedDoc}
            alt={attachedDisplayName || props.label}
            height={140}
            disabled={props.uploading}
            onOpenPreview={() => setPreviewDoc(props.attachedDoc)}
          />
        ) : null}

        <Collapse in={showExisting && hasSavedDocs}>
          <Stack spacing={1.5} sx={{ mt: 2 }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <CheckCircleOutlineIcon fontSize="small" color="success" />
              <Typography variant="body2" color="text.secondary">
                Select a previously uploaded {props.label.toLowerCase()} to reuse it on this application.
              </Typography>
            </Stack>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "repeat(2, minmax(0, 1fr))", sm: "repeat(3, minmax(0, 1fr))" },
                gap: 1.5,
              }}
            >
              {props.savedDocs.map((savedDoc) => (
                <DocumentPreview
                  key={savedDoc._id}
                  doc={savedDoc}
                  selected={props.attachedDoc?._id === savedDoc._id}
                  disabled={props.uploading}
                  onOpenPreview={() => setPreviewDoc(savedDoc)}
                  onSelect={() => {
                    if (!savedDoc._id) {
                      return;
                    }
                    setShowExisting(false);
                    props.onUseSaved(savedDoc._id);
                  }}
                />
              ))}
            </Box>
          </Stack>
        </Collapse>

        <DocumentPreviewModal doc={previewDoc} onClose={() => setPreviewDoc(null)} />
      </CardContent>
    </Card>
  );
}
