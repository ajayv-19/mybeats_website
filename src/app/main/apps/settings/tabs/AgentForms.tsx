import React, { useEffect, useState } from "react";
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
} from "@mui/material";
import { Link } from "react-router-dom";
import { fetchAuthSession } from "@aws-amplify/auth";

// Icons
import VisibilityIcon from "@mui/icons-material/Visibility";
import AnalyticsIcon from "@mui/icons-material/Analytics";
import InfoIcon from "@mui/icons-material/Info";

export default function AgentFormsTab() {
  const [state, setState] = useState({
    mounted: false,
    agentForms: [],
    loading: true,
    error: null,
    company_id: 496,
    user: null,
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
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {state.loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
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
                          form.status === "Active"
                            ? "Active"
                            : form.status === "InActive"
                              ? "InActive"
                              : form.status === "Suspended"
                                ? "Suspended"
                                : "Unknown"
                        }
                        size="small"
                        color={
                          form.status === "Active"
                            ? "success"
                            : form.status === "InActive"
                              ? "default"
                              : form.status === "Suspended"
                                ? "error"
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
                      <Tooltip title="View Form">
                        <Link
                          to={`/apps/agent-forms/form/${form.id}`}
                          target="__blank"
                        >
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<VisibilityIcon />}
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
                          startIcon={<AnalyticsIcon />}
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
                          startIcon={<InfoIcon />}
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
                  colSpan={6}
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
    </div>
  );
}
