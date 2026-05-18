import React, { useEffect, useMemo, useState } from "react";
import { useAgentForms } from "../apis/AgentFormsapis";
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  Box,
  CircularProgress,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
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

  /** Table filters (client-side; list is already limited to application_status = Submitted from API). */
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterSearch, setFilterSearch] = useState<string>("");

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
    const submittedOnly = rawData.filter((form: any) => {
      const s = String(form?.application_status ?? "").trim().toLowerCase();
      return s === "submitted";
    });
    const sortedData = sortData(submittedOnly, sortConfig.key, sortConfig.direction);

    setState((prevState) => ({
      ...prevState,
      loading: agentForms.isLoading,
      agentForms: sortedData,
      error: agentForms.error,
    }));
  }, [agentForms.data, agentForms.isLoading, agentForms.error, sortConfig]);

  const filteredForms = useMemo(() => {
    return (state.agentForms as any[]).filter((form: any) => {
      if (filterStatus !== "all" && String(form.status || "") !== filterStatus) {
        return false;
      }
      const t = String(form.type || "").toLowerCase();
      if (filterType === "initial" && t !== "initial") return false;
      if (filterType === "renewal" && t !== "renewal") return false;
      const q = filterSearch.trim().toLowerCase();
      if (q) {
        const idStr = String(form.id ?? "");
        const fd = String(form.fire_department || "").toLowerCase();
        if (!idStr.includes(q) && !fd.includes(q)) return false;
      }
      return true;
    });
  }, [state.agentForms, filterStatus, filterType, filterSearch]);

  // Handler for opening Losses/LAE dialog (carrier: only after status = Approved)
  const handleOpenLossesLaeDialog = async (form: any) => {
    if (form.status !== "Approved") {
      toast.info(
        "Losses and LAE can be entered after the application is approved on the Analysis page."
      );
      return;
    }
    try {
      // Get fire department ID
      const fdResponse = await axios.get(`/agentform/${form.id}/fire-department-id`);
      const fireDepartmentId = fdResponse.data.data.fire_department_id;

      // Use the form's underwriting year (set when form was approved), not current calendar year.
      // This ensures we update the same underwriting row that was created on approval.
      let underwritingYear = form.year;
      if (!underwritingYear) {
        // Fallback: get year from underwriting history (row that has this form_id)
        try {
          const uwResponse = await axios.get(`/underwriting/${fireDepartmentId}/history`);
          const rowForForm = uwResponse.data.data.find(
            (row: any) =>
              row.company_id === form.company_id &&
              (form.id ? row.form_id === form.id : true)
          );
          if (rowForForm?.underwriting_year) {
            underwritingYear = rowForForm.underwriting_year;
          }
        } catch (err) {
          console.error("Error fetching underwriting history for year:", err);
        }
      }
      if (!underwritingYear) {
        const currentYear = new Date().getFullYear();
        underwritingYear = `${currentYear}-${currentYear + 1}`;
      }

      // Get current losses/LAE for this form's underwriting row
      let currentLosses = "";
      let currentLae = "";
      try {
        const uwResponse = await axios.get(`/underwriting/${fireDepartmentId}/history`);
        const currentRow = uwResponse.data.data.find(
          (row: any) =>
            row.underwriting_year === underwritingYear &&
            row.company_id === form.company_id &&
            (form.id ? row.form_id === form.id : true)
        );
        if (currentRow) {
          currentLosses = currentRow.losses ?? "";
          currentLae = currentRow.lae ?? "";
        }
      } catch (err) {
        console.error("Error fetching current underwriting:", err);
      }

      setLossesLaeDialog({
        open: true,
        form: form,
        fireDepartmentId: fireDepartmentId,
        currentYear: underwritingYear,
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
    <div className="flex flex-col flex-1 min-h-0 p-24">
      <div className="flex items-center mb-16 relative shrink-0">
        <h2 className="text-lg font-bold flex-1 text-center">
          Application Forms
        </h2>
      </div>

      <Paper
        elevation={0}
        variant="outlined"
        className="mb-16 shrink-0"
        sx={{ p: 2, borderRadius: 1 }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          alignItems={{ xs: "stretch", sm: "center" }}
          flexWrap="wrap"
          useFlexGap
        >
          <TextField
            size="small"
            label="Search"
            placeholder="ID or fire department"
            value={filterSearch}
            onChange={(e) => setFilterSearch(e.target.value)}
            sx={{ minWidth: { xs: "100%", sm: 220 } }}
          />
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel id="agent-forms-filter-status">Status</InputLabel>
            <Select
              labelId="agent-forms-filter-status"
              label="Status"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="Approved">Approved</MenuItem>
              <MenuItem value="Pending">Pending</MenuItem>
              <MenuItem value="Rejected">Rejected</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel id="agent-forms-filter-type">Type</InputLabel>
            <Select
              labelId="agent-forms-filter-type"
              label="Type"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="initial">Initial</MenuItem>
              <MenuItem value="renewal">Renewal</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="contained"
            color="secondary"
            size="small"
            className="rounded px-8 py-4 min-h-0 h-auto min-w-0"
            onClick={() => {
              setFilterStatus("all");
              setFilterType("all");
              setFilterSearch("");
            }}
          >
            Clear filters
          </Button>
          <Typography variant="body2" color="text.secondary" sx={{ ml: { sm: "auto" } }}>
            Showing {filteredForms.length} of {state.agentForms.length}
          </Typography>
        </Stack>
      </Paper>

      <TableContainer
        component={Paper}
        className="flex-1 min-h-0 w-full"
        sx={{
          maxHeight: "calc(100vh - 300px)",
          overflowY: "auto",
        }}
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
            ) : filteredForms.length > 0 ? (
              filteredForms.map((form) => (
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
                      <Tooltip title="Open the form, use View Analytics, run Calculate Analysis, then Approve or Reject on the analysis page.">
                        <Chip
                          size="small"
                          label={form.status || "Pending"}
                          color={
                            form.status === "Approved"
                              ? "success"
                              : form.status === "Rejected"
                                ? "error"
                                : "warning"
                          }
                          variant="outlined"
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
                      <Tooltip
                        title={
                          form.status === "Approved"
                            ? "Enter Losses/LAE"
                            : "Available after the form is approved on the Analysis page"
                        }
                      >
                        <span>
                          <Button
                            size="small"
                            variant="outlined"
                            disabled={form.status !== "Approved"}
                            startIcon={
                              <EditIcon
                                color={form.status === "Approved" ? "primary" : "disabled"}
                              />
                            }
                            onClick={() => handleOpenLossesLaeDialog(form)}
                            sx={{
                              border: "none",
                              minWidth: "auto",
                              padding: "4px",
                            }}
                          />
                        </span>
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
                  {state.agentForms.length === 0
                    ? "No forms found."
                    : "No forms match the current filters."}
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
