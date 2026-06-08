import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import OtpLoginPanel from "../login/OtpLoginPanel";

export default function OtpLoginModal(props: {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  return (
    <Dialog open={props.open} onClose={props.onClose} fullWidth maxWidth="xs">
      <DialogContent sx={{ p: 3 }}>
        <OtpLoginPanel compact onSuccess={props.onSuccess} />
      </DialogContent>
    </Dialog>
  );
}
