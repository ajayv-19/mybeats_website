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
} from "@mui/material";
import { Link } from "react-router-dom";
import { fetchAuthSession } from "@aws-amplify/auth";
import AgentFormAnalyticsDialog from "./AgentFormAnalyticsDialog";
import AgentFormChatBox from "./AgentFormChatBox";
import AgentFormMessageDialog from "./AgentFormMessageDialog";

// Icons
import VisibilityIcon from "@mui/icons-material/Visibility";
import AnalyticsIcon from "@mui/icons-material/Analytics";
import InfoIcon from "@mui/icons-material/Info";
import CheckIcon from "@mui/icons-material/Check";
import CancelIcon from "@mui/icons-material/Cancel";
import MessageIcon from "@mui/icons-material/Message";
import { toast } from "sonner";

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

  // Analytics dialog state
  const [analyticsDialog, setAnalyticsDialog] = useState({
    open: false,
    formData: null,
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

  // Update state when agent forms data changes
  useEffect(() => {
    setState((prevState) => ({
      ...prevState,
      loading: agentForms.isLoading,
      agentForms: agentForms.data?.data || [],
      error: agentForms.error,
    }));
  }, [agentForms.data, agentForms.isLoading, agentForms.error]);

  // Handler for opening analytics dialog
  const handleOpenAnalytics = (formData: any) => {
    setAnalyticsDialog({
      open: true,
      formData: formData,
    });
  };

  // Handler for closing analytics dialog
  const handleCloseAnalytics = () => {
    setAnalyticsDialog({
      open: false,
      formData: null,
    });
  };

  const handleUpdateAgentFormStatus = (formId: number, status: any) => {
    callUpdateAgentFormStatus(formId, status).then((response) => {
      console.log("Response from update agent form status", response);
      if (response.status === 200) {
        toast.success("Agent form status updated successfully");
        // Refresh the data after successful update
        agentForms.refetch();
      } else {
        toast.error("Failed to update agent form status");
      }
    });
  };

  // Handler for approve action
  const handleApprove = (formId: number) => {
    handleUpdateAgentFormStatus(formId, "Approved");
  };

  // Handler for reject action
  const handleReject = (formId: number) => {
    handleUpdateAgentFormStatus(formId, "Rejected");
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

  return (
    <div className="flex flex-col flex-1 p-24">
      <div className="flex justify-between items-center mb-16">
        <h2 className="text-lg font-bold">Agent Forms</h2>
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
                Status
              </TableCell>
              <TableCell
                style={{ fontWeight: "bold", backgroundColor: "#f5f5f5" }}
              >
                Updated By
              </TableCell>
              <TableCell
                style={{ fontWeight: "bold", backgroundColor: "#f5f5f5" }}
              >
                Submitted At
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
                <TableCell colSpan={7} align="center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : state.agentForms.length > 0 ? (
              state.agentForms.map((form) => (
                <TableRow key={form.id}>
                  <TableCell>{form.id}</TableCell>
                  <TableCell>{form.fire_department || "-"}</TableCell>
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
                    </Stack>
                  </TableCell>
                  <TableCell>{form.updated_by || "-"}</TableCell>
                  <TableCell>
                    {new Date(form.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1} alignItems="center">
                      {["Pending", "Rejected"].includes(form.status) && (
                        <>
                          <Tooltip title="Approve">
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<CheckIcon />}
                              onClick={() => handleApprove(form.id)}
                              sx={{
                                border: "none",
                                minWidth: "auto",
                                padding: "4px",
                                color: "green",
                                "&:hover": {
                                  backgroundColor: "rgba(76, 175, 80, 0.1)",
                                },
                              }}
                            />
                          </Tooltip>
                        </>
                      )}

                      {["Pending", "Approved"].includes(form.status) && (
                        <>
                          <Tooltip title="Reject">
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<CancelIcon />}
                              onClick={() => handleReject(form.id)}
                              sx={{
                                border: "none",
                                minWidth: "auto",
                                padding: "4px",
                                color: "red",
                                "&:hover": {
                                  backgroundColor: "rgba(244, 67, 54, 0.1)",
                                },
                              }}
                            />
                          </Tooltip>
                        </>
                      )}
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Tooltip title="View Form">
                        <Link to={`/apps/agent-forms/form/${form.id}`}>
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
                      <Tooltip title="View Analytics">
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<AnalyticsIcon color="primary" />}
                          onClick={() => handleOpenAnalytics(form.data)}
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
                  colSpan={7}
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

      {/* Analytics Dialog */}
      <AgentFormAnalyticsDialog
        open={analyticsDialog.open}
        onClose={handleCloseAnalytics}
        formData={analyticsDialog.formData}
      />

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
