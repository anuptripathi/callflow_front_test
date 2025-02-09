// components/NodeConfigPanel.tsx
"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
} from "@mui/material";

interface NodeConfigPanelProps {
  node: any;
  onSave: (updatedData: any) => void;
  onClose: () => void;
}

const NodeConfigPanel: React.FC<NodeConfigPanelProps> = ({
  node,
  onSave,
  onClose,
}) => {
  const [params, setParams] = useState<string>(
    JSON.stringify(node.data.params || {}, null, 2)
  );
  const [onSuccess, setOnSuccess] = useState<string>(
    JSON.stringify(node.data.onSuccess || [], null, 2)
  );
  const [onFailure, setOnFailure] = useState<string>(
    JSON.stringify(node.data.onFailure || [], null, 2)
  );

  const handleSave = () => {
    let paramsObj, successBranch, failureBranch;
    try {
      paramsObj = JSON.parse(params);
    } catch (err) {
      alert("Invalid JSON in Parameters");
      return;
    }
    try {
      successBranch = JSON.parse(onSuccess);
    } catch (err) {
      alert("Invalid JSON in On Success Branch");
      return;
    }
    try {
      failureBranch = JSON.parse(onFailure);
    } catch (err) {
      alert("Invalid JSON in On Failure Branch");
      return;
    }
    onSave({
      params: paramsObj,
      onSuccess: successBranch,
      onFailure: failureBranch,
    });
  };

  return (
    <Dialog open onClose={onClose}>
      <DialogTitle>Configure "{node.data.verb.toUpperCase()}" Step</DialogTitle>
      <DialogContent>
        <Typography variant="subtitle1">Parameters (JSON):</Typography>
        <TextField
          label="Parameters"
          fullWidth
          margin="normal"
          multiline
          minRows={3}
          value={params}
          onChange={(e) => setParams(e.target.value)}
        />
        <Typography variant="subtitle1">
          On Success Branch (JSON array):
        </Typography>
        <TextField
          label="On Success Branch"
          fullWidth
          margin="normal"
          multiline
          minRows={3}
          placeholder='e.g., [{"verb": "dial", "params": {"target": "PJSIP/200"}}]'
          value={onSuccess}
          onChange={(e) => setOnSuccess(e.target.value)}
        />
        <Typography variant="subtitle1">
          On Failure Branch (JSON array):
        </Typography>
        <TextField
          label="On Failure Branch"
          fullWidth
          margin="normal"
          multiline
          minRows={3}
          placeholder='e.g., [{"verb": "hangup", "params": {}}]'
          value={onFailure}
          onChange={(e) => setOnFailure(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained" color="primary">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NodeConfigPanel;
