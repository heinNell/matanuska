import React from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from "@mui/material";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (name: string, radius: number) => void;
  loading?: boolean;
}

export const GeofenceModal: React.FC<Props> = ({ open, onClose, onSubmit, loading }) => {
  const [name, setName] = React.useState("");
  const [radius, setRadius] = React.useState(500);

  // Optional: Reset when opened/closed
  React.useEffect(() => {
    if (open) { setName(""); setRadius(500); }
  }, [open]);

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Create Geofence</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          label="Geofence Name"
          value={name}
          onChange={e => setName(e.target.value)}
          margin="dense"
        />
        <TextField
          fullWidth
          label="Radius (meters)"
          type="number"
          value={radius}
          onChange={e => setRadius(Number(e.target.value))}
          margin="dense"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>Cancel</Button>
        <Button
          onClick={() => onSubmit(name, radius)}
          disabled={!name || !radius || loading}
          variant="contained"
        >
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default GeofenceModal;
