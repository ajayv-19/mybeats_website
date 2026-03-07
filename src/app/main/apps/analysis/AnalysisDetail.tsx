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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Checkbox,
  IconButton,
} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import {
  useAnalysisDetail,
  useCalculateAnalysis,
  useUpdateAnalysisProfile,
} from "../settings/apis/AnalysisApis";
import { useBulkUpsertUnderwriting } from "../settings/apis/UnderwritingApis";
import { toast } from "sonner";

export default function AnalysisDetail() {
  const { fire_department_id } = useParams<{ fire_department_id: string }>();
  const navigate = useNavigate();
  const { data, isLoading, error, refetch } = useAnalysisDetail(
    Number(fire_department_id)
  );
  const calculateAnalysis = useCalculateAnalysis();
  const updateProfile = useUpdateAnalysisProfile();
  const bulkUpsertUnderwriting = useBulkUpsertUnderwriting();

  const [dataEntryDialog, setDataEntryDialog] = useState<{
    open: boolean;
    code: string | null;
    message: string;
  }>({ open: false, code: null, message: "" });

  const [profileForm, setProfileForm] = useState<{
    population: number | "";
    square_miles: number | "";
    fire_calls: number | "";
    ems_calls: number | "";
    safety_committee: boolean;
    hs_officers: number | "";
    motorized_racing_team: boolean;
  }>({
    population: "",
    square_miles: "",
    fire_calls: "",
    ems_calls: "",
    safety_committee: false,
    hs_officers: "",
    motorized_racing_team: false,
  });

  type UnderwritingRowForm = {
    underwriting_year: string;
    vfbl: number | "";
    wc: number | "";
    losses: number | "";
    lae: number | "";
    number_of_claims: number | "";
    company_id?: number;
  };
  const [underwritingRows, setUnderwritingRows] = useState<UnderwritingRowForm[]>([]);

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

  // Loss ratio = Total Loss/LAE / Total Premium (stored as ratio 0-1). Display as percentage.
  const formatPercent = (value: number | null | undefined | string) => {
    if (value === null || value === undefined) return "-";
    const numValue = typeof value === "string" ? parseFloat(value) : value;
    if (isNaN(numValue)) return "-";
    const pct = numValue <= 1 ? numValue * 100 : numValue;
    return `${pct.toFixed(2)}%`;
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
      const code = error?.response?.data?.code;
      const message = error?.response?.data?.message || "Failed to calculate analysis";

      if (error?.response?.status === 400 && (code === "MISSING_5_YEAR_DATA" || code === "MISSING_PROFILE")) {
        if (code === "MISSING_PROFILE") {
          setProfileForm({
            population: profile?.population ?? "",
            square_miles: profile?.square_miles ?? "",
            fire_calls: profile?.fire_calls ?? "",
            ems_calls: profile?.ems_calls ?? "",
            safety_committee: !!profile?.safety_committee,
            hs_officers: profile?.hs_officers ?? "",
            motorized_racing_team: !!profile?.motorized_racing_team,
          });
        }
        if (code === "MISSING_5_YEAR_DATA") {
          const companyId = fire_department?.company_id ?? (underwriting?.[0] as any)?.company_id;
          const existingRows: UnderwritingRowForm[] = (underwriting || []).map((u: any) => ({
            underwriting_year: u.underwriting_year || "",
            vfbl: u.vfbl != null ? Number(u.vfbl) : "",
            wc: u.wc != null ? Number(u.wc) : "",
            losses: u.losses != null ? Number(u.losses) : "",
            lae: u.lae != null ? Number(u.lae) : "",
            number_of_claims: u.number_of_claims != null ? Number(u.number_of_claims) : "",
            ...(companyId != null && { company_id: companyId }),
          }));
          setUnderwritingRows([...existingRows, { underwriting_year: "", vfbl: "", wc: "", losses: "", lae: "", number_of_claims: "", ...(companyId != null && { company_id: companyId }) }]);
        }
        setDataEntryDialog({
          open: true,
          code,
          message: code === "MISSING_5_YEAR_DATA"
            ? "Analysis requires underwriting data for the last 5 years. Please add or complete data (including Losses/LAE) below and try again."
            : (message.includes("Missing:") ? message : "Profile is missing required fields. Please complete the fields below and try again."),
        });
        return;
      }

      toast.error(message);
    }
  };

  const handleCloseDataEntryDialog = () => {
    setDataEntryDialog({ open: false, code: null, message: "" });
  };

  const handleSaveProfile = async () => {
    try {
      // Convert empty strings to null, but preserve 0 and other valid numbers
      const data: any = {
        population: profileForm.population === "" ? null : (typeof profileForm.population === "number" ? profileForm.population : null),
        square_miles: profileForm.square_miles === "" ? null : (typeof profileForm.square_miles === "number" ? profileForm.square_miles : null),
        fire_calls: profileForm.fire_calls === "" ? null : (typeof profileForm.fire_calls === "number" ? profileForm.fire_calls : null),
        ems_calls: profileForm.ems_calls === "" ? null : (typeof profileForm.ems_calls === "number" ? profileForm.ems_calls : null),
        safety_committee: profileForm.safety_committee,
        hs_officers: profileForm.hs_officers === "" ? null : (typeof profileForm.hs_officers === "number" ? profileForm.hs_officers : null),
        motorized_racing_team: profileForm.motorized_racing_team,
      };
      await updateProfile.mutateAsync({
        fire_department_id: Number(fire_department_id),
        data,
      });
      toast.success("Profile updated");
      handleCloseDataEntryDialog();
      refetch();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Failed to update profile");
    }
  };

  const underwritingRowsWithYear = underwritingRows.filter((r) => String(r.underwriting_year ?? "").trim() !== "");
  const duplicateYears = (() => {
    const years = underwritingRowsWithYear.map((r) => String(r.underwriting_year).trim());
    const seen = new Set<string>();
    const dups = new Set<string>();
    years.forEach((y) => {
      if (seen.has(y)) dups.add(y);
      else seen.add(y);
    });
    return dups;
  })();
  const hasDuplicateYears = duplicateYears.size > 0;

  const handleAddUnderwritingRow = () => {
    const companyId = fire_department?.company_id ?? (underwriting?.[0] as any)?.company_id;
    setUnderwritingRows((prev) => [
      ...prev,
      { underwriting_year: "", vfbl: "", wc: "", losses: "", lae: "", number_of_claims: "", ...(companyId != null && { company_id: companyId }) },
    ]);
  };

  const handleRemoveUnderwritingRow = (idx: number) => {
    setUnderwritingRows((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSaveUnderwriting = async () => {
    const filled = underwritingRows.filter((r) => String(r.underwriting_year ?? "").trim() !== "");
    if (filled.length === 0) {
      toast.error("Add at least one row with a year (e.g. 2024-2025).");
      return;
    }
    if (hasDuplicateYears) {
      toast.error("Same year cannot be entered twice. Please remove or change duplicate years.");
      return;
    }
    const rows = filled.map((r) => ({
      underwriting_year: String(r.underwriting_year).trim(),
      vfbl: r.vfbl === "" ? undefined : Number(r.vfbl),
      wc: r.wc === "" ? undefined : Number(r.wc),
      losses: r.losses === "" ? undefined : Number(r.losses),
      lae: r.lae === "" ? undefined : Number(r.lae),
      number_of_claims: r.number_of_claims === "" ? undefined : Number(r.number_of_claims),
      company_id: r.company_id,
    }));
    try {
      await bulkUpsertUnderwriting.mutateAsync({
        fire_department_id: Number(fire_department_id),
        data: { rows },
      });
      toast.success("Underwriting data saved");
      handleCloseDataEntryDialog();
      refetch();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Failed to save underwriting data");
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
    ? fiveYearTotals.totalLossLae / fiveYearTotals.totalPremium
    : 0;

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="h4">
          {fire_department?.fire_department_name || "Fire Department Analysis"}
        </Typography>
        <Button variant="outlined" onClick={() => navigate("/apps/analysis")}>
          Back to List
        </Button>
      </Box>

      {/* Fire Department Information */}
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
                <TableCell sx={{ fontWeight: "bold", bgcolor: "primary.main", color: "primary.contrastText" }}>
                  Year
                </TableCell>
                <TableCell sx={{ fontWeight: "bold", bgcolor: "primary.main", color: "primary.contrastText" }}>
                  Co
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: "bold", bgcolor: "primary.main", color: "primary.contrastText" }}>
                  VFBL
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: "bold", bgcolor: "primary.main", color: "primary.contrastText" }}>
                  WC
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: "bold", bgcolor: "primary.main", color: "primary.contrastText" }}>
                  Total Premium
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: "bold", bgcolor: "primary.main", color: "primary.contrastText" }}>
                  Losses
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: "bold", bgcolor: "primary.main", color: "primary.contrastText" }}>
                  LAE
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: "bold", bgcolor: "primary.main", color: "primary.contrastText" }}>
                  Loss Ratio
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: "bold", bgcolor: "primary.main", color: "primary.contrastText" }}>
                  Points
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: "bold", bgcolor: "primary.main", color: "primary.contrastText" }}>
                  # Claims
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {underwriting && underwriting.length > 0 ? (
                <>
                  {underwriting.map((uw: any, index: number) => {
                    const isCurrentYear = uw.underwriting_year === currentYear;
                    return (
                      <TableRow 
                        key={uw.uw_id}
                        sx={{
                          bgcolor: isCurrentYear ? "#E0FFC2" : (index % 2 === 0 ? "#E0FFC2" : "#FFFFCC"),
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
                        bgcolor: "primary.dark",
                        color: "primary.contrastText",
                        fontWeight: "bold",
                        "& .MuiTableCell-root": {
                          color: "primary.contrastText",
                          fontWeight: "bold",
                        },
                      }}
                    >
                      <TableCell colSpan={2}>5 Yr Totals:</TableCell>
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
        <Paper elevation={2} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Analysis Results ({latestResult.underwriting_year})
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary">
                    Loss Ratio Points
                  </Typography>
                  <Typography variant="h4">
                    {latestResult.loss_ratio_points || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary">
                    Density Points
                  </Typography>
                  <Typography variant="h4">
                    {latestResult.density_points || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary">
                    Call Volume Points
                  </Typography>
                  <Typography variant="h4">
                    {latestResult.call_volume_points || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary">
                    Frequency Points
                  </Typography>
                  <Typography variant="h4">
                    {latestResult.frequency_factor_points || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
            </Grid>
            <Grid item xs={12}>
              <Box
                sx={{
                  p: 2,
                  bgcolor: "primary.main",
                  color: "primary.contrastText",
                  borderRadius: 1,
                }}
              >
                <Typography variant="h5" gutterBottom>
                  Total Points: {latestResult.total_points || 0}
                </Typography>
                <Typography variant="body1">
                  Assigned Company: {latestResult.assignedCompany?.Company_Name || "-"}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Box
                sx={{
                  mt: 2,
                  p: 2,
                  bgcolor: "grey.100",
                  borderRadius: 1,
                  border: "1px solid",
                  borderColor: "grey.300",
                }}
              >
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                  Point Range & Category:
                </Typography>
                <Typography variant="body1">
                  {(() => {
                    const points = Math.min(latestResult.total_points || 0, 31);
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
                    return (
                      <>
                        <strong>26-31 points</strong> → <strong style={{ color: "#1976d2" }}>FPI</strong>
                      </>
                    );
                  })()}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      )}

      <Dialog open={dataEntryDialog.open} onClose={handleCloseDataEntryDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Complete required data</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            {dataEntryDialog.message}
          </Alert>
          {dataEntryDialog.code === "MISSING_PROFILE" && (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField
                label="Population"
                type="number"
                value={profileForm.population}
                onChange={(e) => setProfileForm((p) => ({ ...p, population: e.target.value === "" ? "" : Number(e.target.value) }))}
                fullWidth
              />
              <TextField
                label="Square Miles"
                type="number"
                value={profileForm.square_miles}
                onChange={(e) => setProfileForm((p) => ({ ...p, square_miles: e.target.value === "" ? "" : Number(e.target.value) }))}
                fullWidth
              />
              <TextField
                label="Fire Calls"
                type="number"
                value={profileForm.fire_calls}
                onChange={(e) => setProfileForm((p) => ({ ...p, fire_calls: e.target.value === "" ? "" : Number(e.target.value) }))}
                fullWidth
              />
              <TextField
                label="EMS Calls"
                type="number"
                value={profileForm.ems_calls}
                onChange={(e) => setProfileForm((p) => ({ ...p, ems_calls: e.target.value === "" ? "" : Number(e.target.value) }))}
                fullWidth
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={profileForm.safety_committee}
                    onChange={(e) => setProfileForm((p) => ({ ...p, safety_committee: e.target.checked }))}
                  />
                }
                label="Safety Committee"
              />
              <TextField
                label="HS Officers"
                type="number"
                value={profileForm.hs_officers}
                onChange={(e) => setProfileForm((p) => ({ ...p, hs_officers: e.target.value === "" ? "" : Number(e.target.value) }))}
                fullWidth
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={profileForm.motorized_racing_team}
                    onChange={(e) => setProfileForm((p) => ({ ...p, motorized_racing_team: e.target.checked }))}
                  />
                }
                label="Motorized Racing Team"
              />
            </Stack>
          )}
          {dataEntryDialog.code === "MISSING_5_YEAR_DATA" && (
            <Stack spacing={2} sx={{ mt: 1 }}>
              {hasDuplicateYears && (
                <Alert severity="error">
                  Same year cannot be entered twice. Please use a unique year (e.g. 2024-2025) for each row.
                </Alert>
              )}
              {underwritingRows.map((row, idx) => (
                <Paper
                  key={`uw-row-${idx}`}
                  variant="outlined"
                  sx={{
                    p: 2,
                    borderColor: duplicateYears.has(String(row.underwriting_year).trim()) ? "error.main" : undefined,
                  }}
                >
                  <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={1} sx={{ mb: 1 }}>
                    <TextField
                      label="Year"
                      placeholder="e.g. 2024-2025"
                      size="small"
                      value={row.underwriting_year}
                      onChange={(e) =>
                        setUnderwritingRows((prev) =>
                          prev.map((r, i) => (i === idx ? { ...r, underwriting_year: e.target.value } : r))
                        )
                      }
                      error={duplicateYears.has(String(row.underwriting_year).trim())}
                      sx={{ maxWidth: 160 }}
                    />
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleRemoveUnderwritingRow(idx)}
                      aria-label="Remove row"
                    >
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <TextField
                        label="VFBL"
                        type="number"
                        size="small"
                        value={row.vfbl}
                        onChange={(e) => {
                          const v = e.target.value === "" ? "" : Number(e.target.value);
                          setUnderwritingRows((prev) => prev.map((r, i) => (i === idx ? { ...r, vfbl: v } : r)));
                        }}
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        label="WC"
                        type="number"
                        size="small"
                        value={row.wc}
                        onChange={(e) => {
                          const v = e.target.value === "" ? "" : Number(e.target.value);
                          setUnderwritingRows((prev) => prev.map((r, i) => (i === idx ? { ...r, wc: v } : r)));
                        }}
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        label="Losses"
                        type="number"
                        size="small"
                        value={row.losses}
                        onChange={(e) => {
                          const v = e.target.value === "" ? "" : Number(e.target.value);
                          setUnderwritingRows((prev) => prev.map((r, i) => (i === idx ? { ...r, losses: v } : r)));
                        }}
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        label="LAE"
                        type="number"
                        size="small"
                        value={row.lae}
                        onChange={(e) => {
                          const v = e.target.value === "" ? "" : Number(e.target.value);
                          setUnderwritingRows((prev) => prev.map((r, i) => (i === idx ? { ...r, lae: v } : r)));
                        }}
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        label="# Claims"
                        type="number"
                        size="small"
                        value={row.number_of_claims}
                        onChange={(e) => {
                          const v = e.target.value === "" ? "" : Number(e.target.value);
                          setUnderwritingRows((prev) => prev.map((r, i) => (i === idx ? { ...r, number_of_claims: v } : r)));
                        }}
                        fullWidth
                      />
                    </Grid>
                  </Grid>
                </Paper>
              ))}
              <Button variant="outlined" onClick={handleAddUnderwritingRow} fullWidth>
                Add row
              </Button>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDataEntryDialog}>Cancel</Button>
          <Button
            variant="contained"
            onClick={dataEntryDialog.code === "MISSING_PROFILE" ? handleSaveProfile : handleSaveUnderwriting}
            disabled={
              dataEntryDialog.code === "MISSING_PROFILE"
                ? updateProfile.isPending
                : bulkUpsertUnderwriting.isPending ||
                  (dataEntryDialog.code === "MISSING_5_YEAR_DATA" && (hasDuplicateYears || underwritingRowsWithYear.length === 0))
            }
          >
            {dataEntryDialog.code === "MISSING_PROFILE"
              ? (updateProfile.isPending ? "Saving..." : "Save profile")
              : (bulkUpsertUnderwriting.isPending ? "Saving..." : "Save underwriting data")}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
