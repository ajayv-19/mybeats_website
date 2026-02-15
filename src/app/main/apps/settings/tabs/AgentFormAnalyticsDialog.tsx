import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Divider,
  Grid,
  Paper,
  Chip,
  List,
  ListItem,
  ListItemText,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
} from "@mui/material";
import { AgentForm } from "../apis/AgentFormsapis";

// Mock data for Worksheet
const mockWorksheetData = {
  insuredInfo: {
    insured: "Belgium-Cold Springs Fire District (25)",
    county: "Onondaga",
    customerSince: "2000",
    renewalDate: "12/31/2025",
    valuationDate: "9/29/2025",
    agent: "McNeil & Company, Inc.",
  },
  financialData: [
    {
      year: "2024-2025",
      company: "FPI",
      vfbl: 50894,
      wc: 20355,
      totalPremium: 71249,
      losses: 0,
      lae: 0,
      totalLossLAE: 0,
      lossRatio: 0,
      points: 0,
      claims: 0,
      pr: 1.0,
    },
    {
      year: "2023-2024",
      company: "FPI",
      vfbl: 46925,
      wc: 15130,
      totalPremium: 62055,
      losses: 14030,
      lae: 4000,
      totalLossLAE: 18030,
      lossRatio: 29,
      points: 3,
      claims: 1,
      pr: 0.0,
    },
    {
      year: "2022-2023",
      company: "FPI",
      vfbl: 47183,
      wc: 1936,
      totalPremium: 49119,
      losses: 1162,
      lae: 55,
      totalLossLAE: 1217,
      lossRatio: 2,
      points: 2,
      claims: 2,
      pr: 0.0,
    },
    {
      year: "2021-2022",
      company: "FPI",
      vfbl: 45921,
      wc: 2889,
      totalPremium: 48810,
      losses: 6527,
      lae: 3250,
      totalLossLAE: 9777,
      lossRatio: 20,
      points: 2,
      claims: 1,
      pr: 0.0,
    },
    {
      year: "2020-2021",
      company: "FPI",
      vfbl: 46025,
      wc: 3337,
      totalPremium: 49362,
      losses: 1140,
      lae: 44,
      totalLossLAE: 1184,
      lossRatio: 2,
      points: 2,
      claims: 2,
      pr: 0.0,
    },
    {
      year: "2019-2020",
      company: "FPI",
      vfbl: 50254,
      wc: 3709,
      totalPremium: 53963,
      losses: 0,
      lae: 0,
      totalLossLAE: 0,
      lossRatio: 0,
      points: 0,
      claims: 0,
      pr: 0.0,
    },
  ],
  fiveYearTotals: {
    vfbl: 236308,
    wc: 27001,
    totalPremium: 263309,
    losses: 22859,
    lae: 7349,
    totalLossLAE: 30208,
    lossRatio: 11,
    points: 20,
    claims: 6,
  },
  demographic: {
    population: 9500,
    sqMi: 13.7,
    density: 693,
    fireCalls: 269,
    fireCallsPoints: 3,
    emsCalls: 669,
    totalCalls: 938,
    totalCallsPoints: 3,
  },
  riskFactors: {
    motorizedRacingTeam: { value: 0, points: 0 },
    hsOfficers: { value: 3, points: 3 },
    safetyCommProcedures: { value: 1, points: 1 },
    claimsPer100k: { value: 2.3, points: 2 },
  },
  totalPoints: 30,
  companyAssignment: "FPI",
  classificationTable: [
    { points: "0-14", company: "FDM" },
    { points: "15-25", company: "FDI" },
    { points: "26-31", company: "FPI" },
  ],
};

// Mock data for UW Cover
const mockUwCoverData = {
  insuredInfo: {
    name: "Belgium-Cold Springs Fire District (25)",
    renewalEffective: "12/31/25",
    expiringTotalPremium: 71249,
  },
  modFactors: [
    { year: "Exp. Mod - 2025", factor: 1.17, company: "FPI" },
    { year: "Exp. Mod - 2024", factor: 1.49, company: "FPI" },
    { year: "Exp. Mod - 2023", factor: 1.07, company: "FPI" },
    { year: "Exp. Mod - 2022", factor: 0.87, company: "FPI" },
    { year: "Exp. Mod - 2021", factor: 0.77, company: "FPI" },
    { year: "Exp. Mod - 2020", factor: 0.78, company: "FPI" },
    { year: "Exp. Mod - 2019", factor: 0.81, company: "FPI" },
  ],
  expCalculations: {
    dropping: 0,
    adding: 0,
    difference: 0,
  },
  summary: {
    fiveYearLossRatio: "11%",
    county: "Onondaga",
    renewalCoAssignment: "FPI",
    agent: "McNeil & Company, Inc.",
  },
  notableClaims: [],
  generalComments: `This is a VFBL and WC account with a 5-year loss ratio of 11%. The insured is located in the Town of Lysander, Onondaga County, NY. Population served is approximately 9,500 based on various sources including 2018 Onondaga Planning Agency data, 2025 renewal application, 2024 town assessor rolls, and 2020 census data. The department has no custodial employee. A new community risk reduction specialist has been classified as 7710 - paid firefighter. There is no racing team. The department has health & safety officers and procedures in place. The policy is expiring and renewing with FPI for 2025.`,
  lossControl: {
    lastPhysicalAudit: "",
    preparedBy: "T.Higgins",
    uwManagerApproval: "",
  },
  racingTeam: {
    motorized: "No",
    oldFashioned: "No",
    annuallyCompete: "No",
  },
};

interface AgentFormAnalyticsDialogProps {
  open: boolean;
  onClose: () => void;
  formData: AgentForm["data"] | null;
}

export default function AgentFormAnalyticsDialog({
  open,
  onClose,
  formData,
}: AgentFormAnalyticsDialogProps) {
  if (!formData) {
    return null;
  }

  // Helper function to safely parse numbers
  const parseNumber = (value: any): number => {
    if (typeof value === "number") return value;
    if (typeof value === "string") {
      const parsed = parseFloat(value);
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  };

  // Helper function to check boolean values
  const isTrue = (value: any): boolean => {
    return (
      value === true ||
      value === "true" ||
      value === "1" ||
      value === "on" ||
      value === "yes"
    );
  };

  // --- Analytics Calculations ---

  // 1. Coverage Analysis
  const hasVFBL = isTrue(formData.coverage_vfbl);
  const hasWC = isTrue(formData.coverage_wc);
  const coverageTypes = [];
  if (hasVFBL) coverageTypes.push("VFBL");
  if (hasWC) coverageTypes.push("Workers Compensation");

  // 2. Personnel Summary
  const volunteerCount = parseNumber(formData.vol_ff_count);
  const classA = parseNumber(formData.class_a);
  const classB = parseNumber(formData.class_b);
  const classC = parseNumber(formData.class_c);
  const classD = parseNumber(formData.class_d);

  // 3. Paid Employees Summary
  const paidEmployees = {
    firefighters: parseNumber(formData.emp_ff_num),
    emts: parseNumber(formData.emp_emt_num),
    dispatchers: parseNumber(formData.emp_disp_num),
    clerical: parseNumber(formData.emp_clerical_num),
    janitorial: parseNumber(formData.emp_jan_num),
    mechanics: parseNumber(formData.emp_mech_num),
    inspectors: parseNumber(formData.emp_insp_num),
    other1: parseNumber(formData.emp_other1_num),
    other2: parseNumber(formData.emp_other2_num),
    other3: parseNumber(formData.emp_other3_num),
  };

  const totalPaidEmployees = Object.values(paidEmployees).reduce(
    (sum, count) => sum + count,
    0
  );

  // 4. Payroll Analysis
  const payroll = {
    firefighters: parseNumber(formData.emp_ff_pay),
    emts: parseNumber(formData.emp_emt_pay),
    dispatchers: parseNumber(formData.emp_disp_pay),
    clerical: parseNumber(formData.emp_clerical_pay),
    janitorial: parseNumber(formData.emp_jan_pay),
    mechanics: parseNumber(formData.emp_mech_pay),
    inspectors: parseNumber(formData.emp_insp_pay),
    other1: parseNumber(formData.emp_other1_pay),
    other2: parseNumber(formData.emp_other2_pay),
    other3: parseNumber(formData.emp_other3_pay),
  };

  const totalPayroll = Object.values(payroll).reduce(
    (sum, amount) => sum + amount,
    0
  );
  const avgPayrollPerEmployee =
    totalPaidEmployees > 0 ? totalPayroll / totalPaidEmployees : 0;

  // 5. Operations Analysis
  const vehicleCount = parseNumber(formData.veh_count);
  const fireCalls = parseNumber(formData.fire_calls);
  const emsCalls = parseNumber(formData.ems_calls);
  const totalCalls = fireCalls + emsCalls;

  // 6. Safety & Programs
  const hasSafetyOfficer = isTrue(formData.safety_officer);
  const safetyOfficerCount = parseNumber(formData.safety_officer_count);
  const hasSafetyCommittee = isTrue(formData.safety_committee);
  const hasSafetyProcedures = isTrue(formData.safety_procedures);
  const hasJuniors = isTrue(formData.juniors);
  const hasRacing =
    isTrue(formData.racing_motorized) || isTrue(formData.racing_old);
  const hasAmbulance = isTrue(formData.ambulance);
  const ambulanceCount = parseNumber(formData.ambulance_count);
  const emtCount = parseNumber(formData.emt_count);

  // 7. Geographic Coverage
  const population = parseNumber(formData.population);
  const squareMileage = parseNumber(formData.square_mileage);
  const populationDensity = squareMileage > 0 ? population / squareMileage : 0;

  // 8. Contract Analysis
  const hasOutsideContract = isTrue(formData.contract_outside);
  const assistsOtherFD = isTrue(formData.assist_other_fd);
  const hasMutualAid = isTrue(formData.mutual_aid);

  const formatCurrency = (value: number) => {
    return `$${value.toLocaleString()}`;
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xl" fullWidth>
      <DialogTitle>
        <Typography variant="h5" component="div">
          Fire Department Analytics
        </Typography>
        <Typography variant="subtitle2" color="text.secondary">
          {formData.entity_name || "Fire Department Analysis"}
        </Typography>
      </DialogTitle>

      <DialogContent dividers sx={{ maxHeight: "90vh", overflow: "auto" }}>
        <Box sx={{ mb: 4 }}>
          {/* OLD ANALYTICS SECTIONS - COMMENTED OUT FOR NOW */}
          {/* Coverage Summary */}
          {/* <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            Coverage Requested
          </Typography>
          <Box sx={{ display: "flex", gap: 1, mb: 3 }}>
            {coverageTypes.map((type) => (
              <Chip
                key={type}
                label={type}
                color="primary"
                variant="outlined"
              />
            ))}
            {coverageTypes.length === 0 && (
              <Chip
                label="No Coverage Selected"
                color="default"
                variant="outlined"
              />
            )}
          </Box> */}

          {/* Key Metrics Grid */}
          {/* <Typography variant="h6" gutterBottom>
            Key Metrics
          </Typography>
          <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card elevation={1}>
                <CardContent sx={{ textAlign: "center" }}>
                  <Typography variant="h4" color="primary">
                    {volunteerCount}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Volunteer Firefighters
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card elevation={1}>
                <CardContent sx={{ textAlign: "center" }}>
                  <Typography variant="h4" color="secondary">
                    {totalPaidEmployees}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Paid Employees
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card elevation={1}>
                <CardContent sx={{ textAlign: "center" }}>
                  <Typography variant="h4" color="success.main">
                    {vehicleCount}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Emergency Vehicles
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card elevation={1}>
                <CardContent sx={{ textAlign: "center" }}>
                  <Typography variant="h4" color="info.main">
                    {totalCalls}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Annual Calls
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} /> */}

          {/* Personnel Breakdown */}
          {/* <Typography variant="h6" gutterBottom>
            Personnel Breakdown
          </Typography>
          <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid item xs={12} md={6}>
              <Paper elevation={1} sx={{ p: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Volunteer Classifications
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemText
                      primary="Class A (Interior Structure)"
                      secondary={classA}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Class B (Exterior Structure)"
                      secondary={classB}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Class C (Fire Police Only)"
                      secondary={classC}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Class D (Administrative Only)"
                      secondary={classD}
                    />
                  </ListItem>
                </List>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper elevation={1} sx={{ p: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Paid Employee Breakdown
                </Typography>
                <List dense>
                  {paidEmployees.firefighters > 0 && (
                    <ListItem>
                      <ListItemText
                        primary="Firefighters"
                        secondary={`${paidEmployees.firefighters} employees`}
                      />
                    </ListItem>
                  )}
                  {paidEmployees.emts > 0 && (
                    <ListItem>
                      <ListItemText
                        primary="EMTs"
                        secondary={`${paidEmployees.emts} employees`}
                      />
                    </ListItem>
                  )}
                  {paidEmployees.dispatchers > 0 && (
                    <ListItem>
                      <ListItemText
                        primary="Dispatchers"
                        secondary={`${paidEmployees.dispatchers} employees`}
                      />
                    </ListItem>
                  )}
                  {paidEmployees.mechanics > 0 && (
                    <ListItem>
                      <ListItemText
                        primary="Mechanics"
                        secondary={`${paidEmployees.mechanics} employees`}
                      />
                    </ListItem>
                  )}
                  {paidEmployees.inspectors > 0 && (
                    <ListItem>
                      <ListItemText
                        primary="Building Inspectors"
                        secondary={`${paidEmployees.inspectors} employees`}
                      />
                    </ListItem>
                  )}
                </List>
              </Paper>
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} /> */}

          {/* Financial Analysis */}
          {/* <Typography variant="h6" gutterBottom>
            Financial Analysis
          </Typography>
          <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={4}>
              <Card elevation={1}>
                <CardContent sx={{ textAlign: "center" }}>
                  <Typography variant="h5" color="primary">
                    ${totalPayroll.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Annual Payroll
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Card elevation={1}>
                <CardContent sx={{ textAlign: "center" }}>
                  <Typography variant="h5" color="secondary">
                    ${avgPayrollPerEmployee.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Avg. Payroll per Employee
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Card elevation={1}>
                <CardContent sx={{ textAlign: "center" }}>
                  <Typography variant="h5" color="success.main">
                    {populationDensity.toFixed(1)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Population Density (per sq mi)
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} /> */}

          {/* Operations Analysis */}
          {/* <Typography variant="h6" gutterBottom>
            Operations & Safety
          </Typography>
          <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid item xs={12} md={6}>
              <Paper elevation={1} sx={{ p: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Emergency Services
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemText
                      primary="Fire Calls (Annual)"
                      secondary={fireCalls}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="EMS Calls (Annual)"
                      secondary={emsCalls}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Ambulance Service"
                      secondary={
                        hasAmbulance
                          ? `Yes (${ambulanceCount} ambulances, ${emtCount} EMTs)`
                          : "No"
                      }
                    />
                  </ListItem>
                </List>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper elevation={1} sx={{ p: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Safety & Programs
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemText
                      primary="Safety Officer"
                      secondary={
                        hasSafetyOfficer
                          ? `Yes (${safetyOfficerCount} officers)`
                          : "No"
                      }
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Safety Committee"
                      secondary={hasSafetyCommittee ? "Yes" : "No"}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Safety Procedures"
                      secondary={hasSafetyProcedures ? "Yes" : "No"}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Juniors Program"
                      secondary={hasJuniors ? "Yes" : "No"}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Racing/Drill Team"
                      secondary={hasRacing ? "Yes" : "No"}
                    />
                  </ListItem>
                </List>
              </Paper>
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} /> */}

          {/* Geographic & Coverage Analysis */}
          {/* <Typography variant="h6" gutterBottom>
            Coverage & Geographic Analysis
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Paper elevation={1} sx={{ p: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Service Area
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemText
                      primary="Population Served"
                      secondary={population.toLocaleString()}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Square Mileage"
                      secondary={`${squareMileage} sq mi`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Main Location"
                      secondary={formData.main_location || "Not specified"}
                    />
                  </ListItem>
                </List>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper elevation={1} sx={{ p: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  External Services
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemText
                      primary="Outside Contracts"
                      secondary={hasOutsideContract ? "Yes" : "No"}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Assists Other Fire Departments"
                      secondary={assistsOtherFD ? "Yes" : "No"}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Mutual Aid"
                      secondary={hasMutualAid ? "Yes" : "No"}
                    />
                  </ListItem>
                </List>
              </Paper>
            </Grid>
          </Grid>

          <Divider sx={{ my: 4 }} /> */}

          {/* ========== WORKSHEET SECTION ========== */}
          <Typography variant="h5" gutterBottom sx={{ mt: 4, mb: 2 }}>
            Underwriting Analysis Worksheet
          </Typography>

          {/* Insured Information */}
          <Paper
            elevation={2}
            sx={{ p: 3, mb: 3, bgcolor: "background.paper" }}
          >
            <Typography variant="h6" gutterBottom>
              Insured Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="body2" color="text.secondary">
                  Insured
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {mockWorksheetData.insuredInfo.insured}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="body2" color="text.secondary">
                  County
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {mockWorksheetData.insuredInfo.county}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="body2" color="text.secondary">
                  Customer Since
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {mockWorksheetData.insuredInfo.customerSince}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="body2" color="text.secondary">
                  Renewal Date
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {mockWorksheetData.insuredInfo.renewalDate}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="body2" color="text.secondary">
                  Valuation Date
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {mockWorksheetData.insuredInfo.valuationDate}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="body2" color="text.secondary">
                  Agent
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {mockWorksheetData.insuredInfo.agent}
                </Typography>
              </Grid>
            </Grid>
          </Paper>

          {/* Financial Performance Data Table */}
          <Paper elevation={2} sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ p: 2, pb: 1 }}>
              Financial Performance Data (FPI Data)
            </Typography>
            <TableContainer>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell
                      sx={{
                        bgcolor: "primary.light",
                        color: "white",
                        fontWeight: "bold",
                      }}
                    >
                      Year
                    </TableCell>
                    <TableCell
                      sx={{
                        bgcolor: "primary.light",
                        color: "white",
                        fontWeight: "bold",
                      }}
                    >
                      Co
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{
                        bgcolor: "primary.light",
                        color: "white",
                        fontWeight: "bold",
                      }}
                    >
                      VFBL
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{
                        bgcolor: "primary.light",
                        color: "white",
                        fontWeight: "bold",
                      }}
                    >
                      WC
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{
                        bgcolor: "primary.light",
                        color: "white",
                        fontWeight: "bold",
                      }}
                    >
                      Total Premium
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{
                        bgcolor: "primary.light",
                        color: "white",
                        fontWeight: "bold",
                      }}
                    >
                      Losses
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{
                        bgcolor: "primary.light",
                        color: "white",
                        fontWeight: "bold",
                      }}
                    >
                      LAE
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{
                        bgcolor: "primary.light",
                        color: "white",
                        fontWeight: "bold",
                      }}
                    >
                      Total Loss/LAE
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{
                        bgcolor: "primary.light",
                        color: "white",
                        fontWeight: "bold",
                      }}
                    >
                      Loss Ratio
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{
                        bgcolor: "primary.light",
                        color: "white",
                        fontWeight: "bold",
                      }}
                    >
                      POINTS
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{
                        bgcolor: "primary.light",
                        color: "white",
                        fontWeight: "bold",
                      }}
                    >
                      # Of Claims
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{
                        bgcolor: "primary.light",
                        color: "white",
                        fontWeight: "bold",
                      }}
                    >
                      P/R
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {mockWorksheetData.financialData.map((row, index) => (
                    <TableRow key={index} hover>
                      <TableCell>{row.year}</TableCell>
                      <TableCell>{row.company}</TableCell>
                      <TableCell align="right">
                        {formatCurrency(row.vfbl)}
                      </TableCell>
                      <TableCell align="right">
                        {formatCurrency(row.wc)}
                      </TableCell>
                      <TableCell align="right">
                        {formatCurrency(row.totalPremium)}
                      </TableCell>
                      <TableCell align="right">
                        {formatCurrency(row.losses)}
                      </TableCell>
                      <TableCell align="right">
                        {formatCurrency(row.lae)}
                      </TableCell>
                      <TableCell align="right">
                        {formatCurrency(row.totalLossLAE)}
                      </TableCell>
                      <TableCell align="right">{row.lossRatio}%</TableCell>
                      <TableCell align="right">{row.points}</TableCell>
                      <TableCell align="right">{row.claims}</TableCell>
                      <TableCell align="right">{row.pr.toFixed(3)}</TableCell>
                    </TableRow>
                  ))}
                  {/* 5 Year Totals Row */}
                  <TableRow sx={{ bgcolor: "grey.100", fontWeight: "bold" }}>
                    <TableCell colSpan={2} sx={{ fontWeight: "bold" }}>
                      5 Yr Totals
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: "bold" }}>
                      {formatCurrency(mockWorksheetData.fiveYearTotals.vfbl)}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: "bold" }}>
                      {formatCurrency(mockWorksheetData.fiveYearTotals.wc)}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: "bold" }}>
                      {formatCurrency(
                        mockWorksheetData.fiveYearTotals.totalPremium
                      )}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: "bold" }}>
                      {formatCurrency(mockWorksheetData.fiveYearTotals.losses)}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: "bold" }}>
                      {formatCurrency(mockWorksheetData.fiveYearTotals.lae)}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: "bold" }}>
                      {formatCurrency(
                        mockWorksheetData.fiveYearTotals.totalLossLAE
                      )}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: "bold" }}>
                      {mockWorksheetData.fiveYearTotals.lossRatio}%
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: "bold" }}>
                      {mockWorksheetData.fiveYearTotals.points}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: "bold" }}>
                      {mockWorksheetData.fiveYearTotals.claims}
                    </TableCell>
                    <TableCell align="right"></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          {/* Demographic and Call Data */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} md={6}>
              <Paper elevation={2} sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Demographic Data
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Population
                    </Typography>
                    <Typography variant="h6">
                      {mockWorksheetData.demographic.population.toLocaleString()}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Sq Mi
                    </Typography>
                    <Typography variant="h6">
                      {mockWorksheetData.demographic.sqMi}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Density
                    </Typography>
                    <Typography variant="h6">
                      {mockWorksheetData.demographic.density}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper elevation={2} sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Call Data
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Fire Calls
                    </Typography>
                    <Typography variant="h6">
                      {mockWorksheetData.demographic.fireCalls} (Points:{" "}
                      {mockWorksheetData.demographic.fireCallsPoints})
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      EMS Calls
                    </Typography>
                    <Typography variant="h6">
                      {mockWorksheetData.demographic.emsCalls}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Total Calls
                    </Typography>
                    <Typography variant="h6">
                      {mockWorksheetData.demographic.totalCalls} (Points:{" "}
                      {mockWorksheetData.demographic.totalCallsPoints})
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>

          {/* Risk Factors and Scoring */}
          <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Risk Factors and Scoring
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="body2" color="text.secondary">
                  Motorized Racing Team (Y=1,N=0)
                </Typography>
                <Typography variant="body1">
                  {mockWorksheetData.riskFactors.motorizedRacingTeam.value}{" "}
                  (Points:{" "}
                  {mockWorksheetData.riskFactors.motorizedRacingTeam.points})
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="body2" color="text.secondary">
                  # of H&S Officers
                </Typography>
                <Typography variant="body1">
                  {mockWorksheetData.riskFactors.hsOfficers.value} (Points:{" "}
                  {mockWorksheetData.riskFactors.hsOfficers.points})
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="body2" color="text.secondary">
                  Safety Comm / Procedures (Y=1,N=0)
                </Typography>
                <Typography variant="body1">
                  {mockWorksheetData.riskFactors.safetyCommProcedures.value}{" "}
                  (Points:{" "}
                  {mockWorksheetData.riskFactors.safetyCommProcedures.points})
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="body2" color="text.secondary">
                  Claims per 100k of Premium
                </Typography>
                <Typography variant="body1">
                  {mockWorksheetData.riskFactors.claimsPer100k.value} (Points:{" "}
                  {mockWorksheetData.riskFactors.claimsPer100k.points})
                </Typography>
              </Grid>
            </Grid>
          </Paper>

          {/* Summary and Assignment */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} md={6}>
              <Paper elevation={2} sx={{ p: 2, bgcolor: "warning.light" }}>
                <Typography variant="body2" color="text.secondary">
                  Total Points
                </Typography>
                <Typography variant="h4" fontWeight="bold">
                  {mockWorksheetData.totalPoints}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper elevation={2} sx={{ p: 2, bgcolor: "warning.light" }}>
                <Typography variant="body2" color="text.secondary">
                  Company Assignment
                </Typography>
                <Typography variant="h4" fontWeight="bold">
                  {mockWorksheetData.companyAssignment}
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          {/* Classification Table */}
          <Paper elevation={2} sx={{ mb: 4, maxWidth: 300 }}>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: "error.main" }}>
                    <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                      Pts
                    </TableCell>
                    <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                      Co
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {mockWorksheetData.classificationTable.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell>{row.points}</TableCell>
                      <TableCell>{row.company}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          <Divider sx={{ my: 4 }} />

          {/* ========== UW COVER SECTION ========== */}
          <Typography variant="h5" gutterBottom sx={{ mt: 4, mb: 2 }}>
            Underwriting Analysis
          </Typography>

          {/* UW Insured Information */}
          <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Insured Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Box
                  sx={{
                    bgcolor: "primary.dark",
                    color: "white",
                    p: 1,
                    mb: 1,
                    borderRadius: 1,
                  }}
                >
                  <Typography variant="body2">Name of Insured:</Typography>
                </Box>
                <Box sx={{ bgcolor: "warning.light", p: 1, borderRadius: 1 }}>
                  <Typography variant="body1">
                    {mockUwCoverData.insuredInfo.name}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box
                  sx={{
                    bgcolor: "primary.dark",
                    color: "white",
                    p: 1,
                    mb: 1,
                    borderRadius: 1,
                  }}
                >
                  <Typography variant="body2">Renewal Effective:</Typography>
                </Box>
                <Box sx={{ bgcolor: "warning.light", p: 1, borderRadius: 1 }}>
                  <Typography variant="body1">
                    {mockUwCoverData.insuredInfo.renewalEffective}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box
                  sx={{
                    bgcolor: "primary.dark",
                    color: "white",
                    p: 1,
                    mb: 1,
                    borderRadius: 1,
                  }}
                >
                  <Typography variant="body2">
                    Expiring Total Premium:
                  </Typography>
                </Box>
                <Box sx={{ bgcolor: "warning.light", p: 1, borderRadius: 1 }}>
                  <Typography variant="body1">
                    {formatCurrency(
                      mockUwCoverData.insuredInfo.expiringTotalPremium
                    )}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>

          {/* U/W Year & Mod. Factor Table */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} md={8}>
              <Paper elevation={2}>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: "success.light" }}>
                        <TableCell sx={{ fontWeight: "bold" }}>
                          U/W Year
                        </TableCell>
                        <TableCell
                          sx={{ bgcolor: "warning.light", fontWeight: "bold" }}
                        >
                          Mod. Factor
                        </TableCell>
                        <TableCell sx={{ fontWeight: "bold" }}>Co.</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {mockUwCoverData.modFactors.map((row, index) => (
                        <TableRow key={index}>
                          <TableCell>{row.year}</TableCell>
                          <TableCell sx={{ bgcolor: "warning.light" }}>
                            {row.factor}
                          </TableCell>
                          <TableCell>{row.company}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper elevation={2} sx={{ p: 2 }}>
                <Typography
                  variant="subtitle2"
                  gutterBottom
                  sx={{
                    bgcolor: "brown.700",
                    color: "white",
                    p: 1,
                    borderRadius: 1,
                    mb: 1,
                  }}
                >
                  EXP Calculations 3Yr Totals
                </Typography>
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <Box
                      sx={{
                        bgcolor: "error.light",
                        p: 1,
                        borderRadius: 1,
                        textAlign: "center",
                      }}
                    >
                      <Typography variant="body2" fontWeight="bold">
                        Dropping
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        bgcolor: "info.light",
                        p: 1,
                        borderRadius: 1,
                        textAlign: "center",
                        mt: 1,
                      }}
                    >
                      <Typography variant="h6">
                        {formatCurrency(
                          mockUwCoverData.expCalculations.dropping
                        )}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box
                      sx={{
                        bgcolor: "error.light",
                        p: 1,
                        borderRadius: 1,
                        textAlign: "center",
                      }}
                    >
                      <Typography variant="body2" fontWeight="bold">
                        Adding
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        bgcolor: "info.light",
                        p: 1,
                        borderRadius: 1,
                        textAlign: "center",
                        mt: 1,
                      }}
                    >
                      <Typography variant="h6">
                        {formatCurrency(mockUwCoverData.expCalculations.adding)}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <Box
                      sx={{
                        bgcolor: "info.light",
                        p: 1,
                        borderRadius: 1,
                        display: "flex",
                        justifyContent: "space-between",
                        mt: 1,
                      }}
                    >
                      <Typography variant="body2" fontWeight="bold">
                        Difference
                      </Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {formatCurrency(
                          mockUwCoverData.expCalculations.difference
                        )}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>

          {/* Summary Data Points */}
          <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="body2" color="text.secondary">
                  5 year Loss Ratio:
                </Typography>
                <Typography variant="h6">
                  {mockUwCoverData.summary.fiveYearLossRatio}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="body2" color="text.secondary">
                  County:
                </Typography>
                <Box
                  sx={{
                    bgcolor: "warning.light",
                    p: 1,
                    borderRadius: 1,
                    display: "inline-block",
                    minWidth: 120,
                  }}
                >
                  <Typography variant="body1" fontWeight="medium">
                    {mockUwCoverData.summary.county}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="body2" color="text.secondary">
                  Renewal Co Assignment:
                </Typography>
                <Box
                  sx={{
                    bgcolor: "primary.dark",
                    color: "white",
                    p: 1,
                    borderRadius: 1,
                    display: "inline-block",
                    minWidth: 120,
                  }}
                >
                  <Typography variant="body1" fontWeight="medium">
                    {mockUwCoverData.summary.renewalCoAssignment}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="body2" color="text.secondary">
                  Agent:
                </Typography>
                <Box
                  sx={{
                    bgcolor: "primary.dark",
                    color: "white",
                    p: 1,
                    borderRadius: 1,
                    display: "inline-block",
                    minWidth: 200,
                  }}
                >
                  <Typography variant="body1" fontWeight="medium">
                    {mockUwCoverData.summary.agent}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>

          {/* Notable Claims Table */}
          <Paper elevation={2} sx={{ mb: 3 }}>
            <Typography
              variant="h6"
              gutterBottom
              sx={{ p: 2, pb: 1, bgcolor: "primary.dark", color: "white" }}
            >
              Notable Claims:
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: "success.light" }}>
                    <TableCell sx={{ fontWeight: "bold" }}>Claim#</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>DOL</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>
                      Description
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: "bold" }}>
                      Incurred
                    </TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Location</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {mockUwCoverData.notableClaims.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                        <Typography variant="body2" color="text.secondary">
                          No notable claims recorded
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    mockUwCoverData.notableClaims.map((claim, index) => (
                      <TableRow key={index}>
                        <TableCell>{claim.claimNumber}</TableCell>
                        <TableCell>{claim.dol}</TableCell>
                        <TableCell>{claim.status}</TableCell>
                        <TableCell>{claim.description}</TableCell>
                        <TableCell align="right">
                          {formatCurrency(claim.incurred)}
                        </TableCell>
                        <TableCell>{claim.location}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          {/* General Comments */}
          <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              General Comments
            </Typography>
            <TextField
              multiline
              fullWidth
              rows={6}
              value={mockUwCoverData.generalComments}
              variant="outlined"
              InputProps={{
                readOnly: true,
              }}
              sx={{ bgcolor: "background.paper" }}
            />
          </Paper>

          {/* Loss Control Information and Racing Team */}
          <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid item xs={12} md={6}>
              <Paper elevation={2} sx={{ p: 2 }}>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{
                    bgcolor: "primary.dark",
                    color: "white",
                    p: 1,
                    borderRadius: 1,
                  }}
                >
                  Loss Control Information
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Last Physical Audit:
                    </Typography>
                    <Box
                      sx={{
                        bgcolor: "warning.light",
                        p: 1,
                        borderRadius: 1,
                        minHeight: 32,
                      }}
                    >
                      <Typography variant="body1">
                        {mockUwCoverData.lossControl.lastPhysicalAudit || "N/A"}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Prepared By:
                    </Typography>
                    <Box
                      sx={{
                        bgcolor: "warning.light",
                        p: 1,
                        borderRadius: 1,
                        minHeight: 32,
                      }}
                    >
                      <Typography variant="body1">
                        {mockUwCoverData.lossControl.preparedBy}
                      </Typography>
                    </Box>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      UW Manager Approval:
                    </Typography>
                    <Box
                      sx={{
                        bgcolor: "warning.light",
                        p: 1,
                        borderRadius: 1,
                        minHeight: 32,
                      }}
                    >
                      <Typography variant="body1">
                        {mockUwCoverData.lossControl.uwManagerApproval || "N/A"}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper elevation={2} sx={{ p: 2 }}>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{
                    bgcolor: "primary.dark",
                    color: "white",
                    p: 1,
                    borderRadius: 1,
                  }}
                >
                  Racing Team
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          mb: 1,
                        }}
                      >
                        <Typography variant="body2" fontWeight="medium">
                          Motorized:
                        </Typography>
                        <Box
                          sx={{
                            bgcolor: "success.light",
                            px: 2,
                            py: 0.5,
                            borderRadius: 1,
                          }}
                        >
                          <Typography variant="body1">
                            {mockUwCoverData.racingTeam.motorized}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                    <Grid item xs={12}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          mb: 1,
                        }}
                      >
                        <Typography variant="body2" fontWeight="medium">
                          Old-Fashioned:
                        </Typography>
                        <Box
                          sx={{
                            bgcolor: "success.light",
                            px: 2,
                            py: 0.5,
                            borderRadius: 1,
                          }}
                        >
                          <Typography variant="body1">
                            {mockUwCoverData.racingTeam.oldFashioned}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                    <Grid item xs={12}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <Typography variant="body2" fontWeight="medium">
                          Annually Compete:
                        </Typography>
                        <Box
                          sx={{
                            bgcolor: "success.light",
                            px: 2,
                            py: 0.5,
                            borderRadius: 1,
                          }}
                        >
                          <Typography variant="body1">
                            {mockUwCoverData.racingTeam.annuallyCompete}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} variant="contained">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
