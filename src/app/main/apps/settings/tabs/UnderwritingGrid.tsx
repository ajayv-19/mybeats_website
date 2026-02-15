import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Stack,
} from "@mui/material";
import {
  useUnderwritingHistory,
  useUpdateCarrierInput,
  useBulkUpsertUnderwriting,
  UnderwritingRow,
} from "../apis/UnderwritingApis";
import { toast } from "sonner";

interface UnderwritingGridProps {
  fire_department_id: number;
  company_id?: number;
}

export default function UnderwritingGrid({
  fire_department_id,
  company_id,
}: UnderwritingGridProps) {
  const { data, isLoading, error, refetch } = useUnderwritingHistory(
    fire_department_id
  );
  const updateCarrierInput = useUpdateCarrierInput();
  const bulkUpsert = useBulkUpsertUnderwriting();

  const [editingRows, setEditingRows] = useState<{
    [key: string]: Partial<UnderwritingRow>;
  }>({});
  const [hasChanges, setHasChanges] = useState(false);

  // Initialize editing rows from data
  useEffect(() => {
    if (data?.data) {
      const initialRows: { [key: string]: Partial<UnderwritingRow> } = {};
      data.data.forEach((row) => {
        initialRows[row.underwriting_year] = {
          vfbl: row.vfbl,
          wc: row.wc,
          losses: row.losses,
          lae: row.lae,
          number_of_claims: row.number_of_claims,
          company_id: row.company_id,
        };
      });
      setEditingRows(initialRows);
    }
  }, [data]);

  // Generate last 5 years
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => {
    const year = currentYear - i;
    return `${year}-${year + 1}`;
  });

  const handleFieldChange = (
    year: string,
    field: keyof UnderwritingRow,
    value: number | string | undefined
  ) => {
    setEditingRows((prev) => ({
      ...prev,
      [year]: {
        ...prev[year],
        [field]: value === "" ? undefined : value,
      },
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      // Prepare rows for bulk upsert
      const rows = years.map((year) => {
        const row = editingRows[year] || {};
        return {
          underwriting_year: year,
          vfbl: row.vfbl,
          wc: row.wc,
          losses: row.losses,
          lae: row.lae,
          number_of_claims: row.number_of_claims,
          company_id: row.company_id || company_id,
        };
      });

      await bulkUpsert.mutateAsync({
        fire_department_id,
        data: { rows },
      });

      toast.success("Underwriting data saved successfully");
      setHasChanges(false);
      refetch();
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Failed to save underwriting data"
      );
    }
  };

  const formatCurrency = (value: number | null | undefined) => {
    if (value === null || value === undefined) return "-";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercent = (value: number | null | undefined) => {
    if (value === null || value === undefined) return "-";
    return `${value.toFixed(0)}%`;
  };

  const formatDecimal = (value: number | null | undefined, decimals: number = 3) => {
    if (value === null || value === undefined) return "-";
    return value.toFixed(decimals);
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error">
        Error loading underwriting data. Please try again.
      </Alert>
    );
  }

  const existingRows = data?.data || [];
  const existingRowsMap = new Map(
    existingRows.map((row) => [row.underwriting_year, row])
  );

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Underwriting Data (Last 5 Years)</Typography>
        {hasChanges && (
          <Button
            variant="contained"
            color="primary"
            onClick={handleSave}
            disabled={bulkUpsert.isPending}
          >
            {bulkUpsert.isPending ? "Saving..." : "Save Changes"}
          </Button>
        )}
      </Stack>

      <TableContainer component={Paper}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell
                sx={{
                  fontWeight: "bold",
                  bgcolor: "#1e3a8a",
                  color: "white",
                  borderRight: "1px solid rgba(255,255,255,0.2)",
                }}
              >
                Co
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: "bold",
                  bgcolor: "#1e3a8a",
                  color: "white",
                  borderRight: "1px solid rgba(255,255,255,0.2)",
                }}
              >
                Year
              </TableCell>
              <TableCell
                align="right"
                sx={{
                  fontWeight: "bold",
                  bgcolor: "#1e3a8a",
                  color: "white",
                  borderRight: "1px solid rgba(255,255,255,0.2)",
                }}
              >
                VFBL
              </TableCell>
              <TableCell
                align="right"
                sx={{
                  fontWeight: "bold",
                  bgcolor: "#1e3a8a",
                  color: "white",
                  borderRight: "1px solid rgba(255,255,255,0.2)",
                }}
              >
                WC
              </TableCell>
              <TableCell
                align="right"
                sx={{
                  fontWeight: "bold",
                  bgcolor: "#1e3a8a",
                  color: "white",
                  borderRight: "1px solid rgba(255,255,255,0.2)",
                }}
              >
                Total Premium
              </TableCell>
              <TableCell
                align="right"
                sx={{
                  fontWeight: "bold",
                  bgcolor: "#1e3a8a",
                  color: "white",
                  borderRight: "1px solid rgba(255,255,255,0.2)",
                }}
              >
                Losses
              </TableCell>
              <TableCell
                align="right"
                sx={{
                  fontWeight: "bold",
                  bgcolor: "#1e3a8a",
                  color: "white",
                  borderRight: "1px solid rgba(255,255,255,0.2)",
                }}
              >
                LAE
              </TableCell>
              <TableCell
                align="right"
                sx={{
                  fontWeight: "bold",
                  bgcolor: "#1e3a8a",
                  color: "white",
                  borderRight: "1px solid rgba(255,255,255,0.2)",
                }}
              >
                Total Loss/LAE
              </TableCell>
              <TableCell
                align="right"
                sx={{
                  fontWeight: "bold",
                  bgcolor: "#1e3a8a",
                  color: "white",
                  borderRight: "1px solid rgba(255,255,255,0.2)",
                }}
              >
                Loss ratio
              </TableCell>
              <TableCell
                align="right"
                sx={{
                  fontWeight: "bold",
                  bgcolor: "#1e3a8a",
                  color: "white",
                  borderRight: "1px solid rgba(255,255,255,0.2)",
                }}
              >
                POINTS
              </TableCell>
              <TableCell
                align="right"
                sx={{
                  fontWeight: "bold",
                  bgcolor: "#1e3a8a",
                  color: "white",
                  borderRight: "1px solid rgba(255,255,255,0.2)",
                }}
              >
                # Of Claims
              </TableCell>
              <TableCell
                align="right"
                sx={{
                  fontWeight: "bold",
                  bgcolor: "#1e3a8a",
                  color: "white",
                }}
              >
                P/R
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {years.map((year, index) => {
              const existingRow = existingRowsMap.get(year);
              const editingRow = editingRows[year] || {};
              const row = { ...existingRow, ...editingRow };

              // Calculate derived values
              const vfbl = row.vfbl || 0;
              const wc = row.wc || 0;
              const totalPremium = vfbl + wc;
              const losses = row.losses || 0;
              const lae = row.lae || 0;
              const totalLossLae = losses + lae;
              const lossRatio =
                totalPremium > 0 ? (totalLossLae / totalPremium) * 100 : 0;

              // Alternate row colors (first row light green, others white/yellow)
              const rowBgColor =
                index === 0
                  ? "#e8f5e9"
                  : index % 2 === 1
                  ? "#fff"
                  : "#fffef0";

              return (
                <TableRow
                  key={year}
                  hover
                  sx={{
                    bgcolor: rowBgColor,
                    "&:hover": { bgcolor: "#f0f0f0" },
                  }}
                >
                  <TableCell>
                    {row.company?.Company_Name || "-"}
                  </TableCell>
                  <TableCell>{year}</TableCell>
                  <TableCell align="right">
                    <TextField
                      type="number"
                      size="small"
                      value={row.vfbl || ""}
                      onChange={(e) =>
                        handleFieldChange(
                          year,
                          "vfbl",
                          e.target.value ? parseFloat(e.target.value) : undefined
                        )
                      }
                      sx={{ width: 120 }}
                      inputProps={{ style: { textAlign: "right" } }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <TextField
                      type="number"
                      size="small"
                      value={row.wc || ""}
                      onChange={(e) =>
                        handleFieldChange(
                          year,
                          "wc",
                          e.target.value ? parseFloat(e.target.value) : undefined
                        )
                      }
                      sx={{ width: 120 }}
                      inputProps={{ style: { textAlign: "right" } }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    {formatCurrency(totalPremium)}
                  </TableCell>
                  <TableCell align="right">
                    <TextField
                      type="number"
                      size="small"
                      value={row.losses || ""}
                      onChange={(e) =>
                        handleFieldChange(
                          year,
                          "losses",
                          e.target.value ? parseFloat(e.target.value) : undefined
                        )
                      }
                      sx={{ width: 120 }}
                      inputProps={{ style: { textAlign: "right" } }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <TextField
                      type="number"
                      size="small"
                      value={row.lae || ""}
                      onChange={(e) =>
                        handleFieldChange(
                          year,
                          "lae",
                          e.target.value ? parseFloat(e.target.value) : undefined
                        )
                      }
                      sx={{ width: 120 }}
                      inputProps={{ style: { textAlign: "right" } }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    {totalLossLae > 0 ? formatCurrency(totalLossLae) : "-"}
                  </TableCell>
                  <TableCell align="right">
                    {formatPercent(lossRatio)}
                  </TableCell>
                  <TableCell align="right">
                    {row.points !== null && row.points !== undefined
                      ? row.points
                      : "-"}
                  </TableCell>
                  <TableCell align="right">
                    <TextField
                      type="number"
                      size="small"
                      value={row.number_of_claims || ""}
                      onChange={(e) =>
                        handleFieldChange(
                          year,
                          "number_of_claims",
                          e.target.value ? parseInt(e.target.value) : undefined
                        )
                      }
                      sx={{ width: 80 }}
                      inputProps={{ style: { textAlign: "right" } }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    {row.pr_factor !== null && row.pr_factor !== undefined
                      ? formatDecimal(row.pr_factor)
                      : "-"}
                  </TableCell>
                </TableRow>
              );
            })}
            {/* 5 Yr Totals Row */}
            <TableRow
              sx={{
                bgcolor: "#1e3a8a",
                color: "white",
                fontWeight: "bold",
                "& .MuiTableCell-root": {
                  color: "white",
                  fontWeight: "bold",
                },
              }}
            >
              <TableCell>5 Yr Totals:</TableCell>
              <TableCell></TableCell>
              <TableCell align="right">
                {formatCurrency(
                  years.reduce((sum, year) => {
                    const row = existingRowsMap.get(year) || editingRows[year] || {};
                    return sum + (row.vfbl || 0);
                  }, 0)
                )}
              </TableCell>
              <TableCell align="right">
                {formatCurrency(
                  years.reduce((sum, year) => {
                    const row = existingRowsMap.get(year) || editingRows[year] || {};
                    return sum + (row.wc || 0);
                  }, 0)
                )}
              </TableCell>
              <TableCell align="right">
                {formatCurrency(
                  years.reduce((sum, year) => {
                    const row = existingRowsMap.get(year) || editingRows[year] || {};
                    return sum + (row.vfbl || 0) + (row.wc || 0);
                  }, 0)
                )}
              </TableCell>
              <TableCell align="right">
                {formatCurrency(
                  years.reduce((sum, year) => {
                    const row = existingRowsMap.get(year) || editingRows[year] || {};
                    return sum + (row.losses || 0);
                  }, 0)
                )}
              </TableCell>
              <TableCell align="right">
                {formatCurrency(
                  years.reduce((sum, year) => {
                    const row = existingRowsMap.get(year) || editingRows[year] || {};
                    return sum + (row.lae || 0);
                  }, 0)
                )}
              </TableCell>
              <TableCell align="right">
                {formatCurrency(
                  years.reduce((sum, year) => {
                    const row = existingRowsMap.get(year) || editingRows[year] || {};
                    return sum + (row.losses || 0) + (row.lae || 0);
                  }, 0)
                )}
              </TableCell>
              <TableCell align="right">
                {(() => {
                  const totalPremium = years.reduce((sum, year) => {
                    const row = existingRowsMap.get(year) || editingRows[year] || {};
                    return sum + (row.vfbl || 0) + (row.wc || 0);
                  }, 0);
                  const totalLossLae = years.reduce((sum, year) => {
                    const row = existingRowsMap.get(year) || editingRows[year] || {};
                    return sum + (row.losses || 0) + (row.lae || 0);
                  }, 0);
                  const lossRatio =
                    totalPremium > 0 ? (totalLossLae / totalPremium) * 100 : 0;
                  return formatPercent(lossRatio);
                })()}
              </TableCell>
              <TableCell align="right">
                {years.reduce((sum, year) => {
                  const row = existingRowsMap.get(year) || editingRows[year] || {};
                  return sum + (row.points || 0);
                }, 0) || "-"}
              </TableCell>
              <TableCell align="right">
                {years.reduce((sum, year) => {
                  const row = existingRowsMap.get(year) || editingRows[year] || {};
                  return sum + (row.number_of_claims || 0);
                }, 0)}
              </TableCell>
              <TableCell align="right">calc</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      <Alert severity="info" sx={{ mt: 2 }}>
        <Typography variant="body2">
          <strong>Note:</strong> Losses and LAE are carrier-entered fields. VFBL,
          WC, and # of Claims may be synced from broker portal. Derived values
          (Total Premium, Total Loss/LAE, Loss Ratio) are calculated
          automatically.
        </Typography>
      </Alert>
    </Box>
  );
}

