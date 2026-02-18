import React, { useEffect, useState } from "react";
import {
  useAgentForms,
  callUpdateAgentFormStatus,
} from "../apis/AgentFormsapis";
import {
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Button,
  Chip,
  Stack,
  Tooltip,
  Switch,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  Box,
  CircularProgress,
  InputAdornment,
} from "@mui/material";
import { Link } from "react-router-dom";
import { fetchAuthSession } from "@aws-amplify/auth";
import AgentFormChatBox from "./AgentFormChatBox";
import AgentFormMessageDialog from "./AgentFormMessageDialog";

// Icons
import VisibilityIcon from "@mui/icons-material/Visibility";
import InfoIcon from "@mui/icons-material/Info";
import MessageIcon from "@mui/icons-material/Message";
import EditIcon from "@mui/icons-material/Edit";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import WarningIcon from "@mui/icons-material/Warning";
import { toast } from "sonner";
import axios from "../../../../constant/axios";
import { useUpdateCarrierInput } from "../apis/UnderwritingApis";

export default function AgentFormsTab() {
  const [state, setState] = useState({
    mounted: false,
    agentForms: [],
    loading: true,
    error: null,
    company_id: 496,
    user: null,
    chatBox: {
      open: false,
      selectedForm: null,
    },
  });

  // Losses/LAE input dialog state
  const [lossesLaeDialog, setLossesLaeDialog] = useState({
    open: false,
    form: null,
    fireDepartmentId: null,
    currentYear: "",
    losses: "",
    lae: "",
    loading: false,
  });

  // Sort state
  const [sortConfig, setSortConfig] = useState({
    key: "created_at",
    direction: "desc", // 'asc' or 'desc'
  });

  // Fetch user session on mount
  useEffect(() => {
    setState((prevState) => ({
      ...prevState,
      mounted: true,
    }));
    fetchAuthSession()
      .then((session) => {
        const user = session;
        console.log("AgentFormsTab user:", user);
        setState((prevState) => ({
          ...prevState,
          user,
        }));
      })
      .catch((error) => {
        console.error("Error fetching user session:", error);
      });
  }, []);

  // Fetch agent forms using the custom hook
  const agentForms = useAgentForms(state.company_id, 1);

  // Sort function
  const sortData = (data: any[], key: string, direction: string) => {
    return [...data].sort((a, b) => {
      if (key === "created_at") {
        const dateA = new Date(a[key]);
        const dateB = new Date(b[key]);
        return direction === "asc"
          ? dateA.getTime() - dateB.getTime()
          : dateB.getTime() - dateA.getTime();
      }
      return 0;
    });
  };

  // Update state when agent forms data changes
  useEffect(() => {
    const rawData = agentForms.data?.data || [];
    const sortedData = sortData(rawData, sortConfig.key, sortConfig.direction);

    setState((prevState) => ({
      ...prevState,
      loading: agentForms.isLoading,
      agentForms: sortedData,
      error: agentForms.error,
    }));
  }, [agentForms.data, agentForms.isLoading, agentForms.error, sortConfig]);

  // Handler for opening Losses/LAE dialog
  const handleOpenLossesLaeDialog = async (form: any) => {
    try {
      // Get fire department ID
      const fdResponse = await axios.get(`/agentform/${form.id}/fire-department-id`);
      const fireDepartmentId = fdResponse.data.data.fire_department_id;
      
      // Get current year
      const currentYear = new Date().getFullYear();
      const currentYearStr = `${currentYear}-${currentYear + 1}`;
      
      // Get current underwriting data for this year, matching on company_id and form_id
      let currentLosses = "";
      let currentLae = "";
      try {
        const uwResponse = await axios.get(`/underwriting/${fireDepartmentId}/history`);
        // Find the row matching company_id and form_id (if available) for the current year
        const currentRow = uwResponse.data.data.find(
          (row: any) => 
            row.underwriting_year === currentYearStr &&
            row.company_id === form.company_id &&
            (form.id ? row.form_id === form.id : true) // Match form_id if available
        );
        if (currentRow) {
          currentLosses = currentRow.losses || "";
          currentLae = currentRow.lae || "";
        }
      } catch (err) {
        console.error("Error fetching current underwriting:", err);
      }
      
      setLossesLaeDialog({
        open: true,
        form: form,
        fireDepartmentId: fireDepartmentId,
        currentYear: currentYearStr,
        losses: currentLosses,
        lae: currentLae,
        loading: false,
      });
    } catch (error: any) {
      console.error("Error opening Losses/LAE dialog:", error);
      toast.error(
        error?.response?.data?.message || "Failed to load fire department information"
      );
    }
  };

  // Handler for closing Losses/LAE dialog
  const handleCloseLossesLaeDialog = () => {
    setLossesLaeDialog({
      open: false,
      form: null,
      fireDepartmentId: null,
      currentYear: "",
      losses: "",
      lae: "",
      loading: false,
    });
  };

  // Handler for saving Losses/LAE
  const handleSaveLossesLae = async () => {
    if (!lossesLaeDialog.fireDepartmentId || !lossesLaeDialog.currentYear) {
      toast.error("Missing required information");
      return;
    }

    if (!lossesLaeDialog.form?.company_id) {
      toast.error("Missing company_id. Cannot update Losses/LAE.");
      return;
    }

    setLossesLaeDialog((prev) => ({ ...prev, loading: true }));

    try {
      await axios.put(
        `/underwriting/${lossesLaeDialog.fireDepartmentId}/${lossesLaeDialog.currentYear}/carrier-input`,
        {
          losses: lossesLaeDialog.losses ? parseFloat(lossesLaeDialog.losses) : null,
          lae: lossesLaeDialog.lae ? parseFloat(lossesLaeDialog.lae) : null,
          company_id: lossesLaeDialog.form.company_id,
          form_id: lossesLaeDialog.form.id, // Include form_id for precise matching
        }
      );

      toast.success("Losses and LAE saved. Total Loss/LAE and Loss Ratio updated.");
      agentForms.refetch();
      handleCloseLossesLaeDialog();
    } catch (error: any) {
      console.error("Error saving Losses/LAE:", error);
      toast.error(
        error?.response?.data?.message || "Failed to save Losses and LAE"
      );
    } finally {
      setLossesLaeDialog((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleUpdateAgentFormStatus = (formId: number, status: any) => {
    callUpdateAgentFormStatus(formId, status)
      .then((response) => {
        if (response.status === 200) {
          toast.success("Agent form status updated successfully");
          agentForms.refetch();
        } else {
          toast.warning(response.data?.message || "Failed to update agent form status");
        }
      })
      .catch(() => {
        // Error toast/warning is shown by axios interceptor (400 → warning, others → error)
      });
  };

  // Handler for opening chat box
  const handleOpenChatBox = (formData: any) => {
    setState((prevState) => ({
      ...prevState,
      chatBox: {
        open: true,
        selectedForm: formData,
      },
    }));
  };

  // Handler for closing chat box
  const handleCloseChatBox = () => {
    setState((prevState) => ({
      ...prevState,
      chatBox: {
        open: false,
        selectedForm: null,
      },
    }));
  };

  // Handler for sorting
  const handleSort = (key: string) => {
    setSortConfig((prevConfig) => ({
      key,
      direction:
        prevConfig.key === key && prevConfig.direction === "desc"
          ? "asc"
          : "desc",
    }));
  };

  return (
    <div className="flex flex-col flex-1 p-24">
      <div className="flex items-center mb-16 relative">
        <h2 className="text-lg font-bold flex-1 text-center">
          Application Forms
        </h2>
      </div>

      <TableContainer
        component={Paper}
        className="flex-1"
        style={{
          maxHeight: "500px",
          overflowY: "auto",
        }} // Ensure scrolling is applied to the body
      >
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell
                style={{ fontWeight: "bold", backgroundColor: "#f5f5f5" }}
              >
                ID
              </TableCell>
              <TableCell
                style={{ fontWeight: "bold", backgroundColor: "#f5f5f5" }}
              >
                Fire Department
              </TableCell>
              <TableCell
                style={{ fontWeight: "bold", backgroundColor: "#f5f5f5" }}
              >
                Type
              </TableCell>
              <TableCell
                style={{ fontWeight: "bold", backgroundColor: "#f5f5f5" }}
              >
                Status
              </TableCell>
              <TableCell
                style={{ fontWeight: "bold", backgroundColor: "#f5f5f5" }}
              >
                Updated By
              </TableCell>
              <TableCell
                style={{
                  fontWeight: "bold",
                  backgroundColor: "#f5f5f5",
                  cursor: "pointer",
                  userSelect: "none",
                }}
                onClick={() => handleSort("created_at")}
              >
                <Stack direction="row" alignItems="center" spacing={1}>
                  <span>Submitted On</span>
                  {sortConfig.key === "created_at" &&
                    (sortConfig.direction === "desc" ? (
                      <ArrowDownwardIcon fontSize="small" />
                    ) : (
                      <ArrowUpwardIcon fontSize="small" />
                    ))}
                </Stack>
              </TableCell>
              <TableCell
                style={{ fontWeight: "bold", backgroundColor: "#f5f5f5" }}
              >
                Approve
              </TableCell>
              <TableCell
                style={{ fontWeight: "bold", backgroundColor: "#f5f5f5" }}
              >
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {state.loading ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : state.agentForms.length > 0 ? (
              state.agentForms.map((form) => (
                <TableRow key={form.id}>
                  <TableCell>{form.id}</TableCell>
                  <TableCell>{form.fire_department || "-"}</TableCell>
                  <TableCell>
                    {form.type === "renewal"
                      ? "Renewal"
                      : form.type === "initial"
                        ? "Initial"
                        : form.type || "Initial"}
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Chip
                        label={
                          form.status === "Approved"
                            ? "Approved"
                            : form.status === "Rejected"
                              ? "Rejected"
                              : form.status === "Pending"
                                ? "Pending"
                                : "Unknown"
                        }
                        size="small"
                        color={
                          form.status === "Approved"
                            ? "success"
                            : form.status === "Rejected"
                              ? "error"
                              : form.status === "Pending"
                                ? "warning"
                                : "default"
                        }
                        variant="outlined"
                      />
                      {form.status === "Approved" && (
                        <Tooltip title="Enter Losses/LAE for this approved form">
                          <WarningIcon
                            color="warning"
                            fontSize="small"
                            sx={{
                              cursor: "pointer",
                              "&:hover": { opacity: 0.7 },
                            }}
                            onClick={() => handleOpenLossesLaeDialog(form)}
                          />
                        </Tooltip>
                      )}
                    </Stack>
                  </TableCell>
                  <TableCell>{form.updated_by || "-"}</TableCell>
                  <TableCell>
                    {new Date(form.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Tooltip
                        title={
                          form.status === "Pending"
                            ? "Click to approve"
                            : form.status === "Approved"
                              ? "Approved forms cannot be rejected (data already stored in database)"
                              : "Click to set pending"
                        }
                      >
                        <FormControlLabel
                          control={
                            <Switch
                              checked={form.status === "Approved"}
                              onChange={(event) => {
                                // Prevent rejecting approved forms (data already stored in database)
                                if (form.status === "Approved") {
                                  toast.warning("Approved forms cannot be rejected. Data has already been stored in the database.");
                                  return;
                                }
                                
                                let newStatus;
                                if (form.status === "Pending") {
                                  newStatus = "Approved";
                                } else if (form.status === "Rejected") {
                                  newStatus = "Pending";
                                } else {
                                  newStatus = "Pending";
                                }
                                handleUpdateAgentFormStatus(form.id, newStatus);
                              }}
                              disabled={form.status === "Approved"}
                              color="success"
                              size="small"
                            />
                          }
                          label={form.status}
                          labelPlacement="end"
                          sx={{
                            margin: 0,
                            "& .MuiFormControlLabel-label": {
                              fontSize: "0.75rem",
                              color:
                                form.status === "Approved"
                                  ? "green"
                                  : form.status === "Rejected"
                                    ? "red"
                                    : "orange",
                              fontWeight: "bold",
                            },
                          }}
                        />
                      </Tooltip>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Tooltip title="View Form">
                        <Link
                          to={
                            (form.type || "").toLowerCase() === "renewal"
                              ? `/apps/agent-forms/renewal/${form.id}`
                              : `/apps/agent-forms/form/${form.id}`
                          }
                        >
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<VisibilityIcon color="primary" />}
                            sx={{
                              border: "none",
                              minWidth: "auto",
                              padding: "4px",
                            }}
                          />
                        </Link>
                      </Tooltip>
                      <Tooltip title="Enter Losses/LAE">
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<EditIcon color="primary" />}
                          onClick={() => handleOpenLossesLaeDialog(form)}
                          sx={{
                            border: "none",
                            minWidth: "auto",
                            padding: "4px",
                          }}
                        />
                      </Tooltip>
                      <Tooltip title="Request Information">
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={
                            <>
                              <MessageIcon color="primary" />
                              {form.unreads > 0 ? (
                                <span
                                  className="!text-xs rounded-full bg-blue-500 text-white px-2 py-1"
                                  style={{
                                    transform: "translateY(-10px)",
                                  }}
                                >
                                  {form.unreads}
                                </span>
                              ) : (
                                ""
                              )}
                            </>
                          }
                          onClick={() => handleOpenChatBox(form)}
                          sx={{
                            border: "none",
                            minWidth: "auto",
                            padding: "4px",
                          }}
                        />
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={8}
                  align="center"
                  style={{ color: "#999", fontSize: "1rem" }}
                >
                  No forms found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Losses/LAE Input Dialog */}
      <Dialog
        open={lossesLaeDialog.open}
        onClose={handleCloseLossesLaeDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6">
            Enter Losses and LAE
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {lossesLaeDialog.form?.fire_department || "Fire Department"} - {lossesLaeDialog.currentYear}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Losses"
              type="number"
              value={lossesLaeDialog.losses}
              onChange={(e) =>
                setLossesLaeDialog((prev) => ({
                  ...prev,
                  losses: e.target.value,
                }))
              }
              margin="normal"
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
              }}
              helperText="Enter total losses for this year"
            />
            <TextField
              fullWidth
              label="LAE (Loss Adjustment Expense)"
              type="number"
              value={lossesLaeDialog.lae}
              onChange={(e) =>
                setLossesLaeDialog((prev) => ({
                  ...prev,
                  lae: e.target.value,
                }))
              }
              margin="normal"
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
              }}
              helperText="Enter LAE for this year"
            />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              <strong>Note:</strong> These values are for the current underwriting year ({lossesLaeDialog.currentYear}).
              Total Loss/LAE and Loss Ratio will be calculated automatically.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseLossesLaeDialog} disabled={lossesLaeDialog.loading}>
            Cancel
          </Button>
          <Button
            onClick={handleSaveLossesLae}
            variant="contained"
            color="primary"
            disabled={lossesLaeDialog.loading}
            startIcon={lossesLaeDialog.loading ? <CircularProgress size={16} /> : null}
          >
            {lossesLaeDialog.loading ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* <AgentFormChatBox
        open={state.chatBox.open}
        onClose={handleCloseChatBox}
        formData={state.chatBox.selectedForm}
        loogedInUser={state.user}
      ></AgentFormChatBox> */}

      <AgentFormMessageDialog
        open={state.chatBox.open}
        onClose={handleCloseChatBox}
        formData={state.chatBox.selectedForm}
        loogedInUser={state.user}
      ></AgentFormMessageDialog>
    </div>
  );
}
