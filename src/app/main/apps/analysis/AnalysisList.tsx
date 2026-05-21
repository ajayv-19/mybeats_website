import React, { useMemo, useState } from "react";
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
  Stack,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
} from "@mui/material";
import { Link } from "react-router-dom";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useAnalysisList } from "../settings/apis/AnalysisApis";

export default function AnalysisList() {
  const [company_id] = useState<number>(496);
  const [filterSearch, setFilterSearch] = useState("");
  const [filterState, setFilterState] = useState("all");

  const { data, isLoading, error } = useAnalysisList(company_id);

  const fireDepartments = data?.data || [];

  const states = useMemo(() => {
    const set = new Set<string>();
    fireDepartments.forEach((fd) => {
      if (fd.state) set.add(fd.state);
    });
    return Array.from(set).sort();
  }, [fireDepartments]);

  const filteredDepartments = useMemo(() => {
    const q = filterSearch.trim().toLowerCase();
    return fireDepartments.filter((fd) => {
      if (filterState !== "all" && (fd.state || "") !== filterState) return false;
      if (!q) return true;
      const id = String(fd.fire_department_id ?? "");
      const name = (fd.fire_department_name || "").toLowerCase();
      const county = (fd.county || "").toLowerCase();
      return id.includes(q) || name.includes(q) || county.includes(q);
    });
  }, [fireDepartments, filterSearch, filterState]);

  return (
    <div className="flex flex-col flex-1 min-h-0 p-24">
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
            placeholder="Name, county, or ID"
            value={filterSearch}
            onChange={(e) => setFilterSearch(e.target.value)}
            sx={{ minWidth: { xs: "100%", sm: 220 } }}
          />
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel id="analysis-filter-state">State</InputLabel>
            <Select
              labelId="analysis-filter-state"
              label="State"
              value={filterState}
              onChange={(e) => setFilterState(e.target.value)}
            >
              <MenuItem value="all">All</MenuItem>
              {states.map((st) => (
                <MenuItem key={st} value={st}>
                  {st}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            variant="contained"
            color="secondary"
            size="small"
            className="rounded px-8 py-4 min-h-0 h-auto min-w-0"
            onClick={() => {
              setFilterSearch("");
              setFilterState("all");
            }}
          >
            Clear filters
          </Button>
          <Typography variant="body2" color="text.secondary" sx={{ ml: { sm: "auto" } }}>
            Showing {filteredDepartments.length} of {fireDepartments.length}
          </Typography>
        </Stack>
      </Paper>

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          Error loading analysis list.
        </Typography>
      )}

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
              <TableCell style={{ fontWeight: "bold", backgroundColor: "#f5f5f5" }}>
                ID
              </TableCell>
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
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : filteredDepartments.length > 0 ? (
              filteredDepartments.map((fd) => (
                <TableRow key={fd.fire_department_id}>
                  <TableCell>{fd.fire_department_id}</TableCell>
                  <TableCell>{fd.fire_department_name}</TableCell>
                  <TableCell>{fd.county || "-"}</TableCell>
                  <TableCell>{fd.state || "-"}</TableCell>
                  <TableCell>
                    <Tooltip title="View Analysis">
                      <Link
                        to={`/apps/analysis/${fd.fire_department_id}?company_id=${company_id}`}
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
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={5}
                  align="center"
                  style={{ color: "#999", fontSize: "1rem" }}
                >
                  {fireDepartments.length === 0
                    ? "No fire departments found."
                    : "No fire departments match the current filters."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}
