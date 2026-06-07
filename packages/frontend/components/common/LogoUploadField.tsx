import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useRef, useState } from "react";

export default function LogoUploadField(props: {
  label?: string;
  previewUrl?: string;
  onUpload: (file: File) => Promise<void>;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState(props.previewUrl || "");

  return (
    <Stack spacing={1.5}>
      <Typography variant="subtitle2">{props.label || "Partner logo"}</Typography>
      {preview ? (
        <Box
          component="img"
          src={preview}
          alt="Partner logo preview"
          sx={{ width: 72, height: 72, objectFit: "contain", borderRadius: 1, border: 1, borderColor: "divider" }}
        />
      ) : null}
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/svg+xml"
        hidden
        onChange={async (event) => {
          const file = event.target.files?.[0];
          if (!file) return;

          setError("");
          setUploading(true);
          try {
            await props.onUpload(file);
            setPreview(URL.createObjectURL(file));
          } catch (ex: any) {
            setError(ex.message || "Failed to upload logo.");
          } finally {
            setUploading(false);
            if (inputRef.current) {
              inputRef.current.value = "";
            }
          }
        }}
      />
      <Button
        variant="outlined"
        startIcon={<CloudUploadOutlinedIcon />}
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
      >
        {uploading ? "Uploading..." : "Upload logo"}
      </Button>
      {error ? (
        <Typography variant="caption" color="error">
          {error}
        </Typography>
      ) : null}
    </Stack>
  );
}
