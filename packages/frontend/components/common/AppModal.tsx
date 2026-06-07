import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";

export default function AppModal(props: {
  open: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  onSubmit?: () => void;
  submitLabel?: string;
  loading?: boolean;
  maxWidth?: "xs" | "sm" | "md" | "lg";
}) {
  const maxWidth = props.maxWidth || "sm";

  return (
    <Dialog open={props.open} onClose={props.onClose} fullWidth maxWidth={maxWidth}>
      <DialogTitle>{props.title}</DialogTitle>
      <DialogContent dividers>{props.children}</DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={props.onClose} disabled={props.loading}>
          Cancel
        </Button>
        {props.onSubmit ? (
          <Button variant="contained" onClick={props.onSubmit} disabled={props.loading}>
            {props.submitLabel || "Save"}
          </Button>
        ) : null}
      </DialogActions>
    </Dialog>
  );
}
