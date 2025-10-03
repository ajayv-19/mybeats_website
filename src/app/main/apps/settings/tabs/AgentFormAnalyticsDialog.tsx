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
} from "@mui/material";
import { AgentForm } from "../apis/AgentFormsapis";

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

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Typography variant="h5" component="div">
          Fire Department Analytics
        </Typography>
        <Typography variant="subtitle2" color="text.secondary">
          {formData.entity_name || "Fire Department Analysis"}
        </Typography>
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ mb: 4 }}>
          {/* Coverage Summary */}
          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
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
          </Box>

          {/* Key Metrics Grid */}
          <Typography variant="h6" gutterBottom>
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

          <Divider sx={{ my: 3 }} />

          {/* Personnel Breakdown */}
          <Typography variant="h6" gutterBottom>
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

          <Divider sx={{ my: 3 }} />

          {/* Financial Analysis */}
          <Typography variant="h6" gutterBottom>
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

          <Divider sx={{ my: 3 }} />

          {/* Operations Analysis */}
          <Typography variant="h6" gutterBottom>
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

          <Divider sx={{ my: 3 }} />

          {/* Geographic & Coverage Analysis */}
          <Typography variant="h6" gutterBottom>
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
