import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Grid,
  Card,
  CardContent,
  Divider,
  Alert,
  CircularProgress,
  Stack,
} from "@mui/material";
import {
  useAnalysisDetail,
  useCalculateAnalysis,
} from "../settings/apis/AnalysisApis";
import { toast } from "sonner";

export default function AnalysisDetail() {
  const { fire_department_id } = useParams<{ fire_department_id: string }>();
  const navigate = useNavigate();
  const { data, isLoading, error, refetch } = useAnalysisDetail(
    Number(fire_department_id)
  );
  const calculateAnalysis = useCalculateAnalysis();

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !data?.data) {
    return (
      <Box p={4}>
        <Alert severity="error">
          Error loading analysis detail. Please try again.
        </Alert>
      </Box>
    );
  }

  const { fire_department, profile, underwriting, results, policies } =
    data.data;

  // Get current year (most recent underwriting year)
  const currentYear = underwriting && underwriting.length > 0 
    ? underwriting[0].underwriting_year 
    : null;

  // Get current year's underwriting data
  const currentYearData = underwriting?.find(
    (uw: any) => uw.underwriting_year === currentYear
  );

  const formatCurrency = (value: number | null | undefined | string) => {
    if (value === null || value === undefined) return "-";
    const numValue = typeof value === "string" ? parseFloat(value) : value;
    if (isNaN(numValue)) return "-";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numValue);
  };

  const formatPercent = (value: number | null | undefined | string) => {
    if (value === null || value === undefined) return "-";
    const numValue = typeof value === "string" ? parseFloat(value) : value;
    if (isNaN(numValue)) return "-";
    return `${numValue.toFixed(2)}%`;
  };

  const handleCalculate = async () => {
    if (!currentYear) {
      toast.error("No current year data available");
      return;
    }

    try {
      await calculateAnalysis.mutateAsync({
        fire_department_id: Number(fire_department_id),
        data: { underwriting_year: currentYear },
      });
      toast.success("Analysis calculated successfully");
      refetch();
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Failed to calculate analysis"
      );
    }
  };

  // Get latest result (for current year)
  const latestResult = results && results.length > 0 
    ? results.find((r: any) => r.underwriting_year === currentYear) || results[0]
    : null;

  // Calculate 5-year totals
  const fiveYearTotals = underwriting && underwriting.length > 0
    ? {
        vfbl: underwriting.reduce((sum: number, uw: any) => sum + (parseFloat(uw.vfbl) || 0), 0),
        wc: underwriting.reduce((sum: number, uw: any) => sum + (parseFloat(uw.wc) || 0), 0),
        totalPremium: underwriting.reduce((sum: number, uw: any) => sum + (parseFloat(uw.total_premium) || 0), 0),
        losses: underwriting.reduce((sum: number, uw: any) => sum + (parseFloat(uw.losses) || 0), 0),
        lae: underwriting.reduce((sum: number, uw: any) => sum + (parseFloat(uw.lae) || 0), 0),
        totalLossLae: underwriting.reduce((sum: number, uw: any) => sum + (parseFloat(uw.losses) || 0) + (parseFloat(uw.lae) || 0), 0),
        claims: underwriting.reduce((sum: number, uw: any) => sum + (parseInt(uw.number_of_claims) || 0), 0),
        points: underwriting.reduce((sum: number, uw: any) => sum + (parseInt(uw.points) || 0), 0),
      }
    : null;

  const fiveYearLossRatio = fiveYearTotals && fiveYearTotals.totalPremium > 0
    ? (fiveYearTotals.totalLossLae / fiveYearTotals.totalPremium) * 100
    : 0;

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          {fire_department?.fire_department_name || "Fire Department Analysis"}
        </Typography>
        <Button variant="outlined" onClick={() => navigate("/apps/analysis")}>
          Back to List
        </Button>
      </Stack>

      {/* Fire Department Info */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Fire Department Information
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="body2" color="text.secondary">
              County
            </Typography>
            <Typography variant="body1" fontWeight="medium">
              {fire_department?.county || "-"}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="body2" color="text.secondary">
              State
            </Typography>
            <Typography variant="body1" fontWeight="medium">
              {fire_department?.state || "-"}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="body2" color="text.secondary">
              Customer Since
            </Typography>
            <Typography variant="body1" fontWeight="medium">
              {(profile?.customer_since ?? fire_department?.customer_since)
                ? new Date(
                    (profile?.customer_since ?? fire_department?.customer_since) as string
                  ).toLocaleDateString()
                : "-"}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="body2" color="text.secondary">
              Agent
            </Typography>
            <Typography variant="body1" fontWeight="medium">
              {(profile?.agent ?? fire_department?.agent) || "-"}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Profile Data */}
      {profile && (
        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Current Profile Data
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="body2" color="text.secondary">
                Population
              </Typography>
              <Typography variant="h6">
                {profile.population?.toLocaleString() || "-"}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="body2" color="text.secondary">
                Square Miles
              </Typography>
              <Typography variant="h6">{profile.square_miles || "-"}</Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="body2" color="text.secondary">
                Fire Calls
              </Typography>
              <Typography variant="h6">{profile.fire_calls || "-"}</Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="body2" color="text.secondary">
                EMS Calls
              </Typography>
              <Typography variant="h6">{profile.ems_calls || "-"}</Typography>
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Underwriting History */}
      <Paper elevation={2} sx={{ mb: 3 }}>
        <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Underwriting History (5 Years)</Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={handleCalculate}
              disabled={!currentYear || calculateAnalysis.isPending}
            >
              {calculateAnalysis.isPending ? "Calculating..." : "Calculate Analysis"}
            </Button>
          </Stack>
          {currentYear && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Analysis will be calculated for current year: {currentYear}
            </Typography>
          )}
        </Box>
        <TableContainer>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold", bgcolor: "#f5f5f5" }}>
                  Year
                </TableCell>
                <TableCell sx={{ fontWeight: "bold", bgcolor: "#f5f5f5" }}>
                  Co
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: "bold", bgcolor: "#f5f5f5" }}>
                  VFBL
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: "bold", bgcolor: "#f5f5f5" }}>
                  WC
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: "bold", bgcolor: "#f5f5f5" }}>
                  Total Premium
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: "bold", bgcolor: "#f5f5f5" }}>
                  Losses
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: "bold", bgcolor: "#f5f5f5" }}>
                  LAE
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: "bold", bgcolor: "#f5f5f5" }}>
                  Loss Ratio
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: "bold", bgcolor: "#f5f5f5" }}>
                  Points
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: "bold", bgcolor: "#f5f5f5" }}>
                  # Claims
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {underwriting && underwriting.length > 0 ? (
                <>
                  {underwriting.map((uw: any) => {
                    const isCurrentYear = uw.underwriting_year === currentYear;
                    return (
                      <TableRow 
                        key={uw.uw_id}
                        sx={{
                          bgcolor: isCurrentYear ? "#e8f5e9" : "transparent",
                        }}
                      >
                        <TableCell>{uw.underwriting_year}</TableCell>
                        <TableCell>
                          {uw.company?.Company_Name || "-"}
                        </TableCell>
                        <TableCell align="right">{formatCurrency(uw.vfbl)}</TableCell>
                        <TableCell align="right">{formatCurrency(uw.wc)}</TableCell>
                        <TableCell align="right">
                          {formatCurrency(uw.total_premium)}
                        </TableCell>
                        <TableCell align="right">{formatCurrency(uw.losses)}</TableCell>
                        <TableCell align="right">{formatCurrency(uw.lae)}</TableCell>
                        <TableCell align="right">
                          {formatPercent(uw.loss_ratio)}
                        </TableCell>
                        <TableCell align="right">
                          {isCurrentYear ? (uw.points || "-") : "-"}
                        </TableCell>
                        <TableCell align="right">{uw.number_of_claims || "-"}</TableCell>
                      </TableRow>
                    );
                  })}
                  {/* 5 Year Totals Row */}
                  {fiveYearTotals && (
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
                        {formatCurrency(fiveYearTotals.vfbl)}
                      </TableCell>
                      <TableCell align="right">
                        {formatCurrency(fiveYearTotals.wc)}
                      </TableCell>
                      <TableCell align="right">
                        {formatCurrency(fiveYearTotals.totalPremium)}
                      </TableCell>
                      <TableCell align="right">
                        {formatCurrency(fiveYearTotals.losses)}
                      </TableCell>
                      <TableCell align="right">
                        {formatCurrency(fiveYearTotals.lae)}
                      </TableCell>
                      <TableCell align="right">
                        {formatPercent(fiveYearLossRatio)}
                      </TableCell>
                      <TableCell align="right">
                        {fiveYearTotals.points || "-"}
                      </TableCell>
                      <TableCell align="right">
                        {fiveYearTotals.claims}
                      </TableCell>
                    </TableRow>
                  )}
                </>
              ) : (
                <TableRow>
                  <TableCell colSpan={10} align="center">
                    No underwriting data available
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Analysis Results */}
      {latestResult && (
        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Analysis Results ({latestResult.underwriting_year})
          </Typography>
          
          {/* Points Breakdown */}
          <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: "bold" }}>
            Points Calculation (Detailed)
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="body2" color="text.secondary">
                    Loss Ratio Points
                  </Typography>
                  <Typography variant="h5">
                    {latestResult.loss_ratio_points || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="body2" color="text.secondary">
                    Density Points
                  </Typography>
                  <Typography variant="h5">
                    {latestResult.density_points || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="body2" color="text.secondary">
                    Call Volume Points
                  </Typography>
                  <Typography variant="h5">
                    {latestResult.call_volume_points || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="body2" color="text.secondary">
                    Frequency Points
                  </Typography>
                  <Typography variant="h5">
                    {latestResult.frequency_factor_points || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="body2" color="text.secondary">
                    Safety Points
                  </Typography>
                  <Typography variant="h5">
                    {latestResult.safety_points || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="body2" color="text.secondary">
                    H&S Officers Points
                  </Typography>
                  <Typography variant="h5">
                    {latestResult.hso_points || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="body2" color="text.secondary">
                    Racing Penalty
                  </Typography>
                  <Typography variant="h5">
                    {latestResult.racing_penalty || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ bgcolor: "warning.light" }}>
                <CardContent>
                  <Typography variant="body2" color="text.secondary">
                    Total Points
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {Math.min(latestResult.total_points || 0, 31)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          
          <Divider sx={{ my: 2 }} />
          
          {/* Point Range & Category */}
          <Box>
            <Box 
              sx={{ 
                mt: 2, 
                p: 2, 
                bgcolor: "grey.100", 
                borderRadius: 1,
                border: "1px solid",
                borderColor: "grey.300"
              }}
            >
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                Point Range & Category:
              </Typography>
              <Typography variant="body1">
                {(() => {
                  // Cap points at 31 (safety check for old data)
                  const points = Math.min(latestResult.total_points || 0, 31);
                  // Ensure points are within valid range (0-31)
                  const validPoints = Math.max(0, Math.min(31, points));
                  
                  if (validPoints >= 0 && validPoints <= 14) {
                    return (
                      <>
                        <strong>0-14 points</strong> → <strong style={{ color: "#1976d2" }}>FDM</strong>
                      </>
                    );
                  }
                  if (validPoints >= 15 && validPoints <= 25) {
                    return (
                      <>
                        <strong>15-25 points</strong> → <strong style={{ color: "#1976d2" }}>FDI</strong>
                      </>
                    );
                  }
                  // Default to FPI for 26-31 range or any edge cases
                  return (
                    <>
                      <strong>26-31 points</strong> → <strong style={{ color: "#1976d2" }}>FPI</strong>
                    </>
                  );
                })()}
              </Typography>
            </Box>
          </Box>
        </Paper>
      )}
    </Box>
  );
}

