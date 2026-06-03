import React, { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { toast } from "sonner";
import { callUpdateAgentFormStatus } from "../settings/apis/AgentFormsapis";

type Props = {
  formId: number;
  formStatus: string | null | undefined;
  applicationStatus: string | null | undefined;
  renewalYear: string | null;
  hasAnalysisResult: boolean;
  renewalVfbl: number | null;
  renewalWc: number | null;
  onSuccess: () => void;
};

export default function ApplicationApprovalBar({
  formId,
  formStatus,
  applicationStatus,
  renewalYear,
  hasAnalysisResult,
  renewalVfbl,
  renewalWc,
  onSuccess,
}: Props) {
  const [approveOpen, setApproveOpen] = useState(false);
  const [premiumChoice, setPremiumChoice] = useState<"keep" | "update">("keep");
  const [vfbl, setVfbl] = useState("");
  const [wc, setWc] = useState("");
  const [busy, setBusy] = useState(false);

  const isSubmitted = String(applicationStatus ?? "").trim() === "Submitted";
  const isApproved = formStatus === "Approved";
  const isRejected = formStatus === "Rejected";
  const canAct = isSubmitted && !isApproved && !isRejected && hasAnalysisResult;

  const openApproveDialog = () => {
    setPremiumChoice("keep");
    setVfbl(renewalVfbl != null ? String(renewalVfbl) : "");
    setWc(renewalWc != null ? String(renewalWc) : "");
    setApproveOpen(true);
  };

  const handleReject = async () => {
    if (!window.confirm("Reject this submitted application?")) return;
    setBusy(true);
    try {
      await callUpdateAgentFormStatus(formId, "Rejected");
      toast.success("Application rejected");
      onSuccess();
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Failed to reject application";
      toast.error(message);
    } finally {
      setBusy(false);
    }
  };

  const handleApprove = async () => {
    setBusy(true);
    try {
      const payload =
        premiumChoice === "keep"
          ? { keep_premiums: true }
          : {
              keep_premiums: false,
              vfbl: Number.parseFloat(vfbl),
              wc: Number.parseFloat(wc),
            };

      if (premiumChoice === "update") {
        if (!Number.isFinite(payload.vfbl!) || !Number.isFinite(payload.wc!)) {
          toast.error("Enter valid VFBL and WC amounts");
          setBusy(false);
          return;
        }
      }

      await callUpdateAgentFormStatus(formId, "Approved", payload);
      toast.success("Application approved");
      setApproveOpen(false);
      onSuccess();
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Failed to approve application";
      toast.error(message);
    } finally {
      setBusy(false);
    }
  };

  if (!isSubmitted && !isApproved && !isRejected) {
    return null;
  }

  return (
    <Box sx={{ px: 2, pb: 2, pt: 1, borderTop: 1, borderColor: "divider" }}>
      <Typography variant="subtitle1" fontWeight={600} gutterBottom>
        Application decision ({renewalYear ?? "renewal year"})
      </Typography>

      {isApproved && (
        <Alert severity="success">This application is approved.</Alert>
      )}
      {isRejected && (
        <Alert severity="error">This application was rejected.</Alert>
      )}

      {isSubmitted && !isApproved && !isRejected && (
        <>
          {!hasAnalysisResult && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              Run <strong>Calculate Analysis</strong> above before you can
              approve or reject.
            </Alert>
          )}
          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Button
              variant="contained"
              color="success"
              disabled={!canAct || busy}
              onClick={openApproveDialog}
            >
              Approve application
            </Button>
            <Button
              variant="outlined"
              color="error"
              disabled={!canAct || busy}
              onClick={handleReject}
            >
              Reject
            </Button>
          </Stack>
        </>
      )}

      <Dialog
        open={approveOpen}
        onClose={() => !busy && setApproveOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Approve application</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Premiums for <strong>{renewalYear}</strong> were loaded when the
            broker marked the form Submitted. Choose whether to keep those
            amounts or override them on the renewal underwriting row (used in
            future analytics).
          </Typography>
          <RadioGroup
            value={premiumChoice}
            onChange={(e) =>
              setPremiumChoice(e.target.value as "keep" | "update")
            }
          >
            <FormControlLabel
              value="keep"
              control={<Radio />}
              label={
                renewalVfbl != null && renewalWc != null
                  ? `Keep application premiums (VFBL ${renewalVfbl.toLocaleString()}, WC ${renewalWc.toLocaleString()})`
                  : "Keep application premiums (from form)"
              }
            />
            <FormControlLabel
              value="update"
              control={<Radio />}
              label="Update renewal premiums"
            />
          </RadioGroup>
          {premiumChoice === "update" && (
            <Stack spacing={2} sx={{ mt: 2 }}>
              <TextField
                label="VFBL annual premium"
                type="number"
                fullWidth
                value={vfbl}
                onChange={(e) => setVfbl(e.target.value)}
              />
              <TextField
                label="WC annual premium"
                type="number"
                fullWidth
                value={wc}
                onChange={(e) => setWc(e.target.value)}
              />
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApproveOpen(false)} disabled={busy}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={handleApprove}
            disabled={busy}
          >
            Confirm approve
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
