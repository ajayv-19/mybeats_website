import React, { useState } from "react";
import {
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Button,
  Tooltip,
  CircularProgress,
  Box,
} from "@mui/material";
import { Link } from "react-router-dom";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useAnalysisList } from "../settings/apis/AnalysisApis";

export default function AnalysisList() {
  const [company_id, setCompany_id] = useState<number>(496); // Default, should come from auth/context

  // TODO: Get company_id from auth context or user session
  // For now using default value

  const { data, isLoading, error } = useAnalysisList(company_id);

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={4}>
        <p className="text-red-600">Error loading analysis list.</p>
      </Box>
    );
  }

  const fireDepartments = data?.data || [];

  return (
    <div className="flex flex-col flex-1 p-24">
      <div className="flex items-center mb-16 relative">
        <h2 className="text-lg font-bold flex-1 text-center">
          Fire Department Analysis
        </h2>
      </div>

      <TableContainer component={Paper} className="flex-1" style={{ maxHeight: "600px", overflowY: "auto" }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell style={{ fontWeight: "bold", backgroundColor: "#f5f5f5" }}>
                Fire Department
              </TableCell>
              <TableCell style={{ fontWeight: "bold", backgroundColor: "#f5f5f5" }}>
                County
              </TableCell>
              <TableCell style={{ fontWeight: "bold", backgroundColor: "#f5f5f5" }}>
                State
              </TableCell>
              <TableCell style={{ fontWeight: "bold", backgroundColor: "#f5f5f5" }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {fireDepartments.length > 0 ? (
              fireDepartments.map((fd) => (
                <TableRow key={fd.fire_department_id}>
                  <TableCell>{fd.fire_department_name}</TableCell>
                  <TableCell>{fd.county || "-"}</TableCell>
                  <TableCell>{fd.state || "-"}</TableCell>
                  <TableCell>
                    <Tooltip title="View Analysis">
                      <Link to={`/apps/analysis/${fd.fire_department_id}?company_id=${company_id}`}>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<VisibilityIcon color="primary" />}
                          sx={{
                            border: "none",
                            minWidth: "auto",
                            padding: "4px",
                          }}
                        >
                          View
                        </Button>
                      </Link>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} align="center" style={{ color: "#999", fontSize: "1rem" }}>
                  No fire departments found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}

