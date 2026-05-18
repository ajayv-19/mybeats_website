import React, { useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
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
  FormControl,
  FormControlLabel,
  FormLabel,
  InputLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  Checkbox,
  IconButton,
  Tooltip,
} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import {
  useAnalysisDetail,
  useCalculateAnalysis,
  useUpdateAnalysisProfile,
  useVerifyPopulation,
} from "../settings/apis/AnalysisApis";
import { useBulkUpsertUnderwriting } from "../settings/apis/UnderwritingApis";
import { useAgentForm } from "../settings/apis/AgentFormsapis";
import ApplicationApprovalBar from "./ApplicationApprovalBar";
import { toast } from "sonner";

function formatProfileDensity(profile: any): string {
  if (!profile) return "-";
  const stored = profile.density;
  if (stored != null && stored !== "" && Number.isFinite(Number(stored))) {
    return Math.round(Number(stored)).toLocaleString();
  }
  const pop = Number(profile.population);
  const sq = Number(profile.square_miles);
  if (Number.isFinite(pop) && Number.isFinite(sq) && sq > 0) {
    return Math.round(pop / sq).toLocaleString();
  }
  return "-";
}

function formatProfileTotalCalls(profile: any): string {
  if (!profile) return "-";
  const stored = profile.total_calls;
  if (stored != null && stored !== "" && stored !== undefined) {
    return String(stored);
  }
  const f = profile.fire_calls;
  const e = profile.ems_calls;
  const hasF = f !== null && f !== undefined && f !== "";
  const hasE = e !== null && e !== undefined && e !== "";
  if (hasF || hasE) {
    return String((Number(f) || 0) + (Number(e) || 0));
  }
  return "-";
}

function getProfileDensityNumeric(profile: any): number | null {
  if (!profile) return null;
  if (profile.density != null && profile.density !== "") {
    const n = Number(profile.density);
    if (Number.isFinite(n)) return n;
  }
  const pop = Number(profile.population);
  const sq = Number(profile.square_miles);
  if (Number.isFinite(pop) && Number.isFinite(sq) && sq > 0) return Math.round(pop / sq);
  return null;
}

function getProfileTotalCallsNumeric(profile: any): number | null {
  if (!profile) return null;
  if (profile.total_calls != null && profile.total_calls !== "") {
    const n = Number(profile.total_calls);
    if (Number.isFinite(n)) return n;
  }
  const hasF =
    profile.fire_calls !== null &&
    profile.fire_calls !== undefined &&
    profile.fire_calls !== "";
  const hasE =
    profile.ems_calls !== null && profile.ems_calls !== undefined && profile.ems_calls !== "";
  if (hasF || hasE) return (Number(profile.fire_calls) || 0) + (Number(profile.ems_calls) || 0);
  return null;
}

/** Five periods immediately before `targetYear` (worksheet 5-yr totals), same ordering as backend. */
function getPriorFiveUnderwritingRows(underwriting: any[], targetYear: string): any[] | null {
  if (!underwriting?.length || !targetYear) return null;
  const asc = [...underwriting].sort((a, b) =>
    String(a.underwriting_year).localeCompare(String(b.underwriting_year))
  );
  const idx = asc.findIndex((r) => String(r.underwriting_year) === String(targetYear));
  if (idx < 5) return null;
  return asc.slice(idx - 5, idx);
}

function hasNumericForUwCalc(v: any): boolean {
  return v !== null && v !== undefined && v !== "" && !Number.isNaN(Number(v));
}

/** Human-readable gaps for a row that fails underwriting completeness (matches underwritingRowCompleteForCalc).
 * `isRenewal: true` skips premium/losses/LAE/loss-ratio checks because the
 * renewal row is not part of the 5-year aggregates the calculation uses; it
 * only needs a year to act as a key for results / policy / category.
 */
function describeUnderwritingRowCalcGaps(
  row: any,
  opts?: { requireCategory?: boolean; isRenewal?: boolean }
): string[] {
  const gaps: string[] = [];
  if (!row?.underwriting_year || String(row.underwriting_year).trim() === "") {
    gaps.push("underwriting year");
    return gaps;
  }

  if (!opts?.isRenewal) {
    const prem =
      (Number(row.vfbl) || 0) + (Number(row.wc) || 0) || (Number(row.total_premium) || 0);
    if (!(prem > 0)) gaps.push("premium (VFBL + WC or total premium > 0)");

    if (!hasNumericForUwCalc(row.losses)) gaps.push("Losses");
    if (!hasNumericForUwCalc(row.lae)) gaps.push("LAE");

    let totalLossLae: number;
    if (row.total_loss_lae !== null && row.total_loss_lae !== undefined && row.total_loss_lae !== "") {
      totalLossLae = Number(row.total_loss_lae);
    } else {
      totalLossLae = Number(row.losses || 0) + Number(row.lae || 0);
    }
    if (!Number.isFinite(totalLossLae)) gaps.push("total loss/LAE (valid number)");

    let lossRatioPct: number | null = null;
    if (row.loss_ratio !== null && row.loss_ratio !== undefined && row.loss_ratio !== "") {
      const raw = Number(String(row.loss_ratio).replace(/%/g, "").trim());
      if (Number.isFinite(raw)) {
        lossRatioPct = raw <= 1 && raw >= 0 ? raw * 100 : raw;
      }
    } else if (prem > 0) {
      lossRatioPct = (totalLossLae / prem) * 100;
    }
    if (lossRatioPct === null || !Number.isFinite(lossRatioPct)) {
      gaps.push("loss ratio (enter a value or ensure premium + losses/LAE allow calculation)");
    }
  }

  if (opts?.requireCategory) {
    const category = String(row?.type ?? row?.category ?? "").trim();
    if (!category) gaps.push("Category (FDM / FDI / FPI)");
  }

  return gaps;
}

/**
 * Next older underwriting period from a "YYYY-YYYY" label (e.g. 2022-2021 → 2021-2020).
 * Returns "" if the string does not match the expected pattern.
 */
function suggestPriorYearUnderwritingYear(fromYearLabel: string): string {
  const trimmed = String(fromYearLabel ?? "").trim();
  if (!trimmed) return "";
  const m = trimmed.match(/^(\d{4})\s*-\s*(\d{4})$/);
  if (!m) return "";
  const a = parseInt(m[1], 10);
  const b = parseInt(m[2], 10);
  if (!Number.isFinite(a) || !Number.isFinite(b)) return "";
  return `${a - 1}-${b - 1}`;
}

function lastNonEmptyUnderwritingYear(rows: { underwriting_year?: string }[]): string {
  for (let i = rows.length - 1; i >= 0; i--) {
    const y = String(rows[i]?.underwriting_year ?? "").trim();
    if (y) return y;
  }
  return "";
}

/** Map API profile to tri-state safety for the form (do not coerce null to false). */
function profileSafetyCommitteeFromApi(profile: any): boolean | null {
  if (profile?.safety_committee === true) return true;
  if (profile?.safety_committee === false) return false;
  return null;
}

/** Per-row assigned pool from underwriting (model `type` / DB category). */
function underwritingRowCategoryLabel(uw: any): string {
  const v = uw?.type ?? uw?.category;
  if (v == null || String(v).trim() === "") return "-";
  return String(v).trim();
}

function aggregatePriorFiveUnderwritingRows(rows: any[]) {
  let vfbl = 0;
  let wc = 0;
  let totalPremium = 0;
  let losses = 0;
  let lae = 0;
  let totalLossLae = 0;
  let claims = 0;
  for (const uw of rows) {
    vfbl += parseFloat(uw.vfbl) || 0;
    wc += parseFloat(uw.wc) || 0;
    const tp = parseFloat(uw.total_premium);
    const prem =
      Number.isFinite(tp) && tp > 0 ? tp : (parseFloat(uw.vfbl) || 0) + (parseFloat(uw.wc) || 0);
    totalPremium += prem;
    losses += parseFloat(uw.losses) || 0;
    lae += parseFloat(uw.lae) || 0;
    const stored = uw?.total_loss_lae;
    if (stored !== null && stored !== undefined && stored !== "") {
      totalLossLae += parseFloat(stored) || 0;
    } else {
      totalLossLae += (parseFloat(uw.losses) || 0) + (parseFloat(uw.lae) || 0);
    }
    claims += parseInt(String(uw.number_of_claims ?? 0), 10) || 0;
  }
  return { vfbl, wc, totalPremium, losses, lae, totalLossLae, claims };
}

export default function AnalysisDetail() {
  const { fire_department_id } = useParams<{ fire_department_id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const analysisCompanyId = Number(searchParams.get("company_id"));
  const companyIdValid =
    Number.isFinite(analysisCompanyId) && analysisCompanyId > 0;

  const formIdParam = searchParams.get("form_id");
  const linkedFormId = formIdParam ? Number.parseInt(formIdParam, 10) : NaN;
  const linkedFormIdValid = Number.isFinite(linkedFormId) && linkedFormId > 0;
  const { data: linkedFormPayload, refetch: refetchLinkedForm } = useAgentForm(
    linkedFormIdValid ? linkedFormId : 0
  );

  const { data, isLoading, error, refetch } = useAnalysisDetail(
    Number(fire_department_id),
    analysisCompanyId
  );
  const calculateAnalysis = useCalculateAnalysis();
  const updateProfile = useUpdateAnalysisProfile();
  const bulkUpsertUnderwriting = useBulkUpsertUnderwriting();
  const verifyPopulation = useVerifyPopulation();

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
    safety_committee: boolean | null;
    hs_officers: number | "";
    motorized_racing_team: boolean;
    motorized_racing_team_count: number | "";
    management_practice_penalty: number | "";
  }>({
    population: "",
    square_miles: "",
    fire_calls: "",
    ems_calls: "",
    safety_committee: null,
    hs_officers: "",
    motorized_racing_team: false,
    motorized_racing_team_count: "",
    management_practice_penalty: "",
  });

  type UnderwritingRowForm = {
    underwriting_year: string;
    vfbl: number | "";
    wc: number | "";
    losses: number | "";
    lae: number | "";
    number_of_claims: number | "";
    /** FDM | FDI | FPI | "" */
    category: string;
    company_id?: number;
  };
  const [underwritingRows, setUnderwritingRows] = useState<UnderwritingRowForm[]>([]);

  if (!companyIdValid) {
    return (
      <Box p={4}>
        <Alert severity="warning" sx={{ mb: 2 }}>
          Missing or invalid <code>company_id</code>. Open this page from the analysis list, or add{" "}
          <code>?company_id=</code> to the URL (subscribed company for this fire department).
        </Alert>
        <Button variant="outlined" onClick={() => navigate("/apps/analysis")}>
          Back to list
        </Button>
      </Box>
    );
  }

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

  /** Prefer DB `total_loss_lae`; otherwise Losses + LAE (matches bulk-upsert / carrier-input). */
  const formatTotalLossLaeCell = (uw: any) => {
    const stored = uw?.total_loss_lae;
    if (stored !== null && stored !== undefined && stored !== "") {
      const n = typeof stored === "string" ? parseFloat(stored) : Number(stored);
      if (!Number.isNaN(n)) return formatCurrency(n);
    }
    const losses =
      uw?.losses !== null && uw?.losses !== undefined && uw?.losses !== ""
        ? parseFloat(uw.losses)
        : NaN;
    const lae =
      uw?.lae !== null && uw?.lae !== undefined && uw?.lae !== ""
        ? parseFloat(uw.lae)
        : NaN;
    if (Number.isNaN(losses) && Number.isNaN(lae)) return "-";
    return formatCurrency((Number.isNaN(losses) ? 0 : losses) + (Number.isNaN(lae) ? 0 : lae));
  };

  const handleCalculate = async () => {
    if (!currentYear) {
      toast.error("No current year data available");
      return;
    }

    try {
      await calculateAnalysis.mutateAsync({
        fire_department_id: Number(fire_department_id),
        data: {
          underwriting_year: currentYear,
          company_id: analysisCompanyId,
        },
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
            safety_committee: profileSafetyCommitteeFromApi(profile),
            hs_officers: profile?.hs_officers ?? "",
            motorized_racing_team: !!profile?.motorized_racing_team,
            motorized_racing_team_count:
              profile?.motorized_racing_team_count != null
                ? Number(profile.motorized_racing_team_count)
                : "",
            management_practice_penalty:
              profile?.management_practice_penalty != null && profile?.management_practice_penalty !== ""
                ? Number(profile.management_practice_penalty)
                : "",
          });
        }
        if (code === "MISSING_5_YEAR_DATA") {
          const existingRows: UnderwritingRowForm[] = (underwriting || []).map((u: any) => ({
            underwriting_year: u.underwriting_year || "",
            vfbl: u.vfbl != null ? Number(u.vfbl) : "",
            wc: u.wc != null ? Number(u.wc) : "",
            losses: u.losses != null ? Number(u.losses) : "",
            lae: u.lae != null ? Number(u.lae) : "",
            number_of_claims: u.number_of_claims != null ? Number(u.number_of_claims) : "",
            category: (u.type ?? u.category ?? "") as string,
            company_id: analysisCompanyId,
          }));
          const suggestedYear = suggestPriorYearUnderwritingYear(
            lastNonEmptyUnderwritingYear(existingRows)
          );
          setUnderwritingRows([
            ...existingRows,
            {
              underwriting_year: suggestedYear,
              vfbl: "",
              wc: "",
              losses: "",
              lae: "",
              number_of_claims: "",
              category: "",
              company_id: analysisCompanyId,
            },
          ]);
        }
        setDataEntryDialog({
          open: true,
          code,
          message: code === "MISSING_5_YEAR_DATA"
            ? "Analysis needs the latest renewal year plus five prior years (worksheet 5-yr totals). Add or complete data (including Losses/LAE) below and try again."
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

  const handleOpenProfileDialog = () => {
    setProfileForm({
      population: profile?.population ?? "",
      square_miles: profile?.square_miles ?? "",
      fire_calls: profile?.fire_calls ?? "",
      ems_calls: profile?.ems_calls ?? "",
      safety_committee: profileSafetyCommitteeFromApi(profile),
      hs_officers: profile?.hs_officers ?? "",
      motorized_racing_team: !!profile?.motorized_racing_team,
      motorized_racing_team_count:
        profile?.motorized_racing_team_count != null
          ? Number(profile.motorized_racing_team_count)
          : "",
      management_practice_penalty:
        profile?.management_practice_penalty != null && profile?.management_practice_penalty !== ""
          ? Number(profile.management_practice_penalty)
          : "",
    });
    setDataEntryDialog({
      open: true,
      code: "MISSING_PROFILE",
      message: "Update profile metrics and save to sync the database.",
    });
  };

  const handleOpenUnderwritingDialog = () => {
    const existingRows: UnderwritingRowForm[] = (underwriting || []).map((u: any) => ({
      underwriting_year: u.underwriting_year || "",
      vfbl: u.vfbl != null ? Number(u.vfbl) : "",
      wc: u.wc != null ? Number(u.wc) : "",
      losses: u.losses != null ? Number(u.losses) : "",
      lae: u.lae != null ? Number(u.lae) : "",
      number_of_claims: u.number_of_claims != null ? Number(u.number_of_claims) : "",
      category: (u.type ?? u.category ?? "") as string,
      company_id: analysisCompanyId,
    }));
    setUnderwritingRows(
      existingRows.length > 0
        ? existingRows
        : [
            {
              underwriting_year: "",
              vfbl: "",
              wc: "",
              losses: "",
              lae: "",
              number_of_claims: "",
              category: "",
              company_id: analysisCompanyId,
            },
          ]
    );
    setDataEntryDialog({
      open: true,
      code: "MISSING_5_YEAR_DATA",
      message: "Update underwriting history and save to sync the database.",
    });
  };

  const handleSaveProfile = async () => {
    try {
      const data: any = {
        population: profileForm.population === "" ? null : (typeof profileForm.population === "number" ? profileForm.population : null),
        square_miles: profileForm.square_miles === "" ? null : (typeof profileForm.square_miles === "number" ? profileForm.square_miles : null),
        fire_calls: profileForm.fire_calls === "" ? null : (typeof profileForm.fire_calls === "number" ? profileForm.fire_calls : null),
        ems_calls: profileForm.ems_calls === "" ? null : (typeof profileForm.ems_calls === "number" ? profileForm.ems_calls : null),
        safety_committee: profileForm.safety_committee,
        hs_officers:
          profileForm.hs_officers === ""
            ? null
            : typeof profileForm.hs_officers === "number"
              ? profileForm.hs_officers
              : null,
        motorized_racing_team: profileForm.motorized_racing_team,
        motorized_racing_team_count:
          profileForm.motorized_racing_team_count === ""
            ? null
            : typeof profileForm.motorized_racing_team_count === "number"
              ? profileForm.motorized_racing_team_count
              : null,
        management_practice_penalty:
          profileForm.management_practice_penalty === ""
            ? null
            : typeof profileForm.management_practice_penalty === "number"
              ? profileForm.management_practice_penalty
              : null,
      };
      await updateProfile.mutateAsync({
        fire_department_id: Number(fire_department_id),
        company_id: analysisCompanyId,
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
    setUnderwritingRows((prev) => {
      const suggested = suggestPriorYearUnderwritingYear(lastNonEmptyUnderwritingYear(prev));
      return [
        ...prev,
        {
          underwriting_year: suggested,
          vfbl: "",
          wc: "",
          losses: "",
          lae: "",
          number_of_claims: "",
          category: "",
          company_id: analysisCompanyId,
        },
      ];
    });
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
      category: r.category === "" ? null : r.category,
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

  // Current view should show calculated output for current underwriting year only.
  // Do not fallback to older-year results.
  const latestResult =
    results && results.length > 0
      ? results.find((r: any) => r.underwriting_year === currentYear) || null
      : null;

  const priorFiveForTotals =
    underwriting && currentYear ? getPriorFiveUnderwritingRows(underwriting, currentYear) : null;
  const fiveYearTotals =
    priorFiveForTotals && priorFiveForTotals.length === 5
      ? aggregatePriorFiveUnderwritingRows(priorFiveForTotals)
      : null;

  const fiveYearLossRatio =
    fiveYearTotals && fiveYearTotals.totalPremium > 0
      ? fiveYearTotals.totalLossLae / fiveYearTotals.totalPremium
      : 0;

  const calcLossRatioPct =
    fiveYearTotals && fiveYearTotals.totalPremium > 0
      ? (fiveYearTotals.totalLossLae / fiveYearTotals.totalPremium) * 100
      : null;
  const calcDensity = getProfileDensityNumeric(profile);
  const calcTotalCalls = getProfileTotalCallsNumeric(profile);
  const calcClaimsPer100k =
    fiveYearTotals && fiveYearTotals.totalPremium > 0
      ? (fiveYearTotals.claims / fiveYearTotals.totalPremium) * 100000
      : null;

  /** Numeric field present (0 is valid). */
  const hasNumeric = (v: any) =>
    v !== null && v !== undefined && v !== "" && !Number.isNaN(Number(v));

  /** One underwriting row for calculation completeness.
   * `isRenewal: true` only requires `underwriting_year` to be set — the renewal
   * row is excluded from the 5-year aggregates, so premium/losses/LAE/loss-ratio
   * are not required (and category is optional too). The row exists purely so
   * we have a year key to attach results / policy / category to after the calc.
   */
  const underwritingRowCompleteForCalc = (
    row: any,
    opts?: { requireCategory?: boolean; isRenewal?: boolean }
  ) => {
    if (!row?.underwriting_year || String(row.underwriting_year).trim() === "") return false;

    if (!opts?.isRenewal) {
      const prem =
        (Number(row.vfbl) || 0) + (Number(row.wc) || 0) ||
        (Number(row.total_premium) || 0);
      if (!(prem > 0)) return false;

      if (!hasNumeric(row.losses)) return false;
      if (!hasNumeric(row.lae)) return false;

      let totalLossLae: number;
      if (row.total_loss_lae !== null && row.total_loss_lae !== undefined && row.total_loss_lae !== "") {
        totalLossLae = Number(row.total_loss_lae);
      } else {
        totalLossLae = Number(row.losses || 0) + Number(row.lae || 0);
      }
      if (!Number.isFinite(totalLossLae)) return false;

      let lossRatioPct: number | null = null;
      if (row.loss_ratio !== null && row.loss_ratio !== undefined && row.loss_ratio !== "") {
        const raw = Number(String(row.loss_ratio).replace(/%/g, "").trim());
        if (Number.isFinite(raw)) {
          lossRatioPct = raw <= 1 && raw >= 0 ? raw * 100 : raw;
        }
      } else if (prem > 0) {
        lossRatioPct = (totalLossLae / prem) * 100;
      }
      if (lossRatioPct === null || !Number.isFinite(lossRatioPct)) return false;
    }

    if (opts?.requireCategory && !String(row?.type ?? row?.category ?? "").trim()) return false;

    return true;
  };

  /** Community / exposure + call activity (insured header fields like Agent are NOT required). */
  const getMissingProfileForCalc = (): string[] => {
    const missing: string[] = [];
    if (!profile) {
      missing.push("Fire department profile (Edit profile)");
      return missing;
    }

    if (profile.safety_committee !== true && profile.safety_committee !== false) {
      missing.push("Safety Committee / Procedures (Yes or No)");
    }
    if (profile.motorized_racing_team === null || profile.motorized_racing_team === undefined) {
      missing.push("Motorized Racing Team");
    }

    if (!hasNumeric(profile.population)) missing.push("Population");
    if (!hasNumeric(profile.square_miles) || Number(profile.square_miles) <= 0) {
      missing.push("Square Miles (> 0, for density)");
    }
    if (!hasNumeric(profile.fire_calls)) missing.push("Fire Calls");
    if (!hasNumeric(profile.ems_calls)) missing.push("EMS Calls");
    if (!hasNumeric(profile.hs_officers)) missing.push("# of H&S Officers (0 if none)");

    const sqMi = Number(profile.square_miles);
    const pop = Number(profile.population);
    if (hasNumeric(profile.square_miles) && sqMi > 0 && hasNumeric(profile.population)) {
      const density = pop / sqMi;
      if (!Number.isFinite(density)) missing.push("Density (population ÷ sq mi)");
    }

    return missing;
  };

  const missingProfileFields = getMissingProfileForCalc();

  const priorFiveForCalc =
    underwriting && currentYear ? getPriorFiveUnderwritingRows(underwriting, currentYear) : null;
  const hasPriorFiveYearWindow = priorFiveForCalc !== null && priorFiveForCalc.length === 5;
  const missingUnderwritingData =
    hasPriorFiveYearWindow && currentYearData
      ? priorFiveForCalc!.some(
          (row: any) => !underwritingRowCompleteForCalc(row, { requireCategory: true })
        ) ||
        !underwritingRowCompleteForCalc(currentYearData, {
          requireCategory: false,
          isRenewal: true,
        })
      : true;

  const canCalculateAnalysis =
    !!currentYear &&
    missingProfileFields.length === 0 &&
    hasPriorFiveYearWindow &&
    !missingUnderwritingData;

  const calculateDisabledTooltipContent =
    !canCalculateAnalysis ? (
      <Box component="div" sx={{ maxWidth: 400, py: 0.25 }}>
        <Typography variant="caption" component="div" fontWeight={700} sx={{ mb: 0.75, display: "block" }}>
          Complete the following to enable Calculate Analysis:
        </Typography>
        {!currentYear && (
          <Typography variant="caption" component="div" color="inherit" sx={{ display: "block", mb: 0.75 }}>
            • <strong>Underwriting:</strong> add at least one year (Edit underwriting).
          </Typography>
        )}
        {missingProfileFields.length > 0 && (
          <Box sx={{ mb: 0.75 }}>
            <Typography variant="caption" component="div" fontWeight={600} sx={{ display: "block", mb: 0.25 }}>
              Profile (Edit profile)
            </Typography>
            <Box component="ul" sx={{ m: 0, pl: 2.25, mb: 0 }}>
              {missingProfileFields.map((label) => (
                <Typography
                  key={label}
                  variant="caption"
                  component="li"
                  color="inherit"
                  sx={{ display: "list-item", pl: 0.25 }}
                >
                  {label}
                </Typography>
              ))}
            </Box>
          </Box>
        )}
        {currentYear && !hasPriorFiveYearWindow && (
          <Typography variant="caption" component="div" color="inherit" sx={{ display: "block", mb: 0.75 }}>
            • <strong>Underwriting years:</strong> need the latest renewal row plus five periods immediately before
            it (six rows total, contiguous). You currently have {underwriting?.length ?? 0} row(s). Add older years
            if needed (Edit underwriting).
          </Typography>
        )}
        {hasPriorFiveYearWindow && currentYearData && missingUnderwritingData && priorFiveForCalc && (
          <Box>
            <Typography variant="caption" component="div" fontWeight={600} sx={{ display: "block", mb: 0.25 }}>
              Underwriting rows (Edit) — missing or invalid
            </Typography>
            <Typography variant="caption" component="div" color="inherit" sx={{ display: "block", mb: 0.35, opacity: 0.9 }}>
              # Claims is optional. The latest year only needs an underwriting year — premium / Losses / LAE / loss
              ratio / Category are all optional on it. The five prior years still require premium, Losses, LAE, a
              derivable loss ratio, and Category (used in the 5-year totals).
            </Typography>
            <Box component="ul" sx={{ m: 0, pl: 2.25, mb: 0 }}>
              {[...priorFiveForCalc, currentYearData].map((row: any) => {
                const y = String(row.underwriting_year);
                const latest = y === String(currentYear);
                const gaps = describeUnderwritingRowCalcGaps(row, {
                  requireCategory: !latest,
                  isRenewal: latest,
                });
                if (gaps.length === 0) return null;
                return (
                  <Typography
                    key={y}
                    variant="caption"
                    component="li"
                    color="inherit"
                    sx={{ display: "list-item", pl: 0.25 }}
                  >
                    <strong>{y}</strong>
                    {latest ? " (latest year)" : ""}: {gaps.join("; ")}
                  </Typography>
                );
              })}
            </Box>
          </Box>
        )}
      </Box>
    ) : (
      ""
    );

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
        <Typography variant="h6" sx={{ mb: 2 }}>
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

      {/* Profile Data — compact grid */}
      {profile && (
        <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.25 }}>
            <Typography variant="subtitle1" fontWeight={600}>
              Current Profile Data
            </Typography>
            <Button variant="contained" color="primary" size="small" onClick={handleOpenProfileDialog}>
              Edit
            </Button>
          </Stack>

          <Grid container spacing={1} columnSpacing={{ xs: 1, sm: 2 }}>
            <Grid item xs={12}>
              <Typography
                variant="caption"
                color="primary"
                fontWeight={700}
                sx={{ display: "block", lineHeight: 1.2, letterSpacing: 0.3 }}
              >
                Demographics &amp; area
              </Typography>
            </Grid>
            <Grid item xs={12} sm={8} md={4}>
              <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.2, display: "block" }}>
                Population
              </Typography>
              <Stack direction="row" alignItems="center" spacing={1.25} sx={{ flexWrap: "wrap" }}>
                <Typography variant="body2" fontWeight={600}>
                  {profile.population?.toLocaleString() || "-"}
                </Typography>

                {(() => {
                  const verified = profile?.population_verified;
                  const hasVerified = verified != null && verified !== "" && Number.isFinite(Number(verified));
                  const stored = Number(profile?.population);
                  const hasStored = Number.isFinite(stored) && stored > 0;
                  const diffPct =
                    hasVerified && hasStored
                      ? ((Number(verified) - stored) / stored) * 100
                      : null;
                  const matches = diffPct != null && Math.abs(diffPct) < 1;

                  return (
                    <>
                      {hasVerified && (
                        <Tooltip
                          title="Latest county population from the US Census Bureau (ACS 5-year, B01003_001E). Use the Update button to copy this value into Population."
                          arrow
                        >
                          <Box
                            sx={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 0.75,
                              px: 1,
                              py: 0.25,
                              borderRadius: 1,
                              bgcolor: matches ? "rgba(46,125,50,0.08)" : "rgba(237,108,2,0.08)",
                              border: 1,
                              borderColor: matches ? "success.light" : "warning.light",
                            }}
                          >
                            <Typography
                              variant="caption"
                              sx={{ color: "text.secondary", lineHeight: 1.2 }}
                            >
                              Census:
                            </Typography>
                            <Typography
                              variant="caption"
                              fontWeight={700}
                              sx={{ lineHeight: 1.2 }}
                            >
                              {Number(verified).toLocaleString()}
                            </Typography>
                            {diffPct != null && (
                              <Typography
                                variant="caption"
                                sx={{
                                  lineHeight: 1.2,
                                  color: matches ? "success.dark" : "warning.dark",
                                  fontWeight: 600,
                                }}
                              >
                                ({diffPct >= 0 ? "+" : ""}
                                {diffPct.toFixed(diffPct > -10 && diffPct < 10 ? 1 : 0)}%)
                              </Typography>
                            )}
                          </Box>
                        </Tooltip>
                      )}

                      <Tooltip
                        title={
                          hasVerified
                            ? "Re-fetch the latest US Census Bureau county population (ACS 5-year)."
                            : "Look up the official county population from the US Census Bureau (ACS 5-year) using this fire department's state and county."
                        }
                        arrow
                      >
                        <span>
                          <Button
                            size="small"
                            variant="outlined"
                            disabled={
                              verifyPopulation.isPending ||
                              !fire_department?.state ||
                              !fire_department?.county
                            }
                            onClick={() => {
                              verifyPopulation.mutate(
                                {
                                  fire_department_id: Number(fire_department_id),
                                  company_id: analysisCompanyId,
                                },
                                {
                                  onSuccess: (resp) => {
                                    if (resp?.data?.population_verified != null) {
                                      toast.success(
                                        `Census: ${Number(
                                          resp.data.population_verified
                                        ).toLocaleString()} (${resp.data.source})`
                                      );
                                    } else {
                                      toast.info(
                                        resp?.message ||
                                          "No matching US county found in Census ACS5."
                                      );
                                    }
                                  },
                                  onError: (err: any) => {
                                    toast.error(
                                      err?.response?.data?.message ||
                                        err?.message ||
                                        "Failed to verify population from Census API"
                                    );
                                  },
                                }
                              );
                            }}
                          >
                            {verifyPopulation.isPending
                              ? "Verifying…"
                              : hasVerified
                              ? "Refresh"
                              : "Verify with Census"}
                          </Button>
                        </span>
                      </Tooltip>

                      {hasVerified && (
                        <Tooltip
                          title="Copy the Census value into Population and save."
                          arrow
                        >
                          <span>
                            <Button
                              size="small"
                              variant="contained"
                              color="primary"
                              disabled={
                                updateProfile.isPending || Number(verified) === stored
                              }
                              onClick={() => {
                                updateProfile.mutate(
                                  {
                                    fire_department_id: Number(fire_department_id),
                                    company_id: analysisCompanyId,
                                    data: { population: Number(verified) },
                                  },
                                  {
                                    onSuccess: () =>
                                      toast.success("Population updated from Census value"),
                                    onError: (err: any) =>
                                      toast.error(
                                        err?.response?.data?.message ||
                                          err?.message ||
                                          "Failed to update population"
                                      ),
                                  }
                                );
                              }}
                            >
                              Use Census value
                            </Button>
                          </span>
                        </Tooltip>
                      )}
                    </>
                  );
                })()}
              </Stack>
            </Grid>
            <Grid item xs={6} sm={4} md={2}>
              <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.2, display: "block" }}>
                Square Miles
              </Typography>
              <Typography variant="body2" fontWeight={600}>{profile.square_miles || "-"}</Typography>
            </Grid>
            <Grid item xs={6} sm={4} md={2}>
              <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.2, display: "block" }}>
                Density (pop ÷ sq mi)
              </Typography>
              <Typography variant="body2" fontWeight={600}>{formatProfileDensity(profile)}</Typography>
            </Grid>

            <Grid item xs={12} sx={{ mt: 0.5 }}>
              <Typography
                variant="caption"
                color="primary"
                fontWeight={700}
                sx={{ display: "block", lineHeight: 1.2, letterSpacing: 0.3 }}
              >
                Call volume
              </Typography>
            </Grid>
            <Grid item xs={6} sm={4} md={2}>
              <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.2, display: "block" }}>
                Fire Calls
              </Typography>
              <Typography variant="body2" fontWeight={600}>{profile.fire_calls || "-"}</Typography>
            </Grid>
            <Grid item xs={6} sm={4} md={2}>
              <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.2, display: "block" }}>
                EMS Calls
              </Typography>
              <Typography variant="body2" fontWeight={600}>{profile.ems_calls || "-"}</Typography>
            </Grid>
            <Grid item xs={6} sm={4} md={2}>
              <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.2, display: "block" }}>
                Total Calls
              </Typography>
              <Typography variant="body2" fontWeight={600}>{formatProfileTotalCalls(profile)}</Typography>
            </Grid>

            <Grid item xs={12} sx={{ mt: 0.5 }}>
              <Typography
                variant="caption"
                color="primary"
                fontWeight={700}
                sx={{ display: "block", lineHeight: 1.2, letterSpacing: 0.3 }}
              >
                Motorized racing
              </Typography>
            </Grid>
            <Grid item xs={6} sm={4} md={2}>
              <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.2, display: "block" }}>
                Racing Team
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {profile.motorized_racing_team === true
                  ? "Yes"
                  : profile.motorized_racing_team === false
                    ? "No"
                    : "-"}
              </Typography>
            </Grid>
            <Grid item xs={6} sm={4} md={2}>
              <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.2, display: "block" }}>
                Races / year
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {profile.motorized_racing_team_count != null && profile.motorized_racing_team_count !== ""
                  ? profile.motorized_racing_team_count
                  : "-"}
              </Typography>
            </Grid>

            <Grid item xs={12} sx={{ mt: 0.5 }}>
              <Typography
                variant="caption"
                color="primary"
                fontWeight={700}
                sx={{ display: "block", lineHeight: 1.2, letterSpacing: 0.3 }}
              >
                Safety &amp; adjustments
              </Typography>
            </Grid>
            <Grid item xs={6} sm={4} md={2}>
              <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.2, display: "block" }}>
                H&amp;S Officers
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {profile.hs_officers != null && profile.hs_officers !== "" ? profile.hs_officers : "-"}
              </Typography>
            </Grid>
            <Grid item xs={6} sm={4} md={2}>
              <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.2, display: "block" }}>
                Safety comm.
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {profile.safety_committee === true
                  ? "Yes"
                  : profile.safety_committee === false
                    ? "No"
                    : "-"}
              </Typography>
            </Grid>
            <Grid item xs={6} sm={4} md={4}>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ lineHeight: 1.2, display: "block" }}
                title="Negative values penalize. Blank defaults to 0 in analysis."
              >
                Mgmt. / cooperation penalty (pts)
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {profile.management_practice_penalty != null && profile.management_practice_penalty !== ""
                  ? `${profile.management_practice_penalty}`
                  : "—"}
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Underwriting History */}
      <Paper elevation={2} sx={{ mb: 3 }}>
        <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ gap: 1, flexWrap: "wrap" }}>
            <Typography variant="h6">Underwriting History (5 Years)</Typography>
            <Stack direction="row" spacing={1}>
              <Button variant="contained" color="primary" size="small" onClick={handleOpenUnderwritingDialog}>
                Edit
              </Button>
              {canCalculateAnalysis ? (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleCalculate}
                  disabled={calculateAnalysis.isPending}
                >
                  {calculateAnalysis.isPending ? "Calculating..." : "Calculate Analysis"}
                </Button>
              ) : (
                <Tooltip
                  title={calculateDisabledTooltipContent}
                  arrow
                  enterDelay={200}
                  componentsProps={{
                    tooltip: {
                      sx: {
                        maxWidth: 440,
                        bgcolor: "grey.900",
                        "& .MuiTypography-root": { color: "common.white" },
                      },
                    },
                  }}
                >
                  <span>
                    <Button variant="outlined" color="primary" disabled>
                      Calculate Analysis
                    </Button>
                  </span>
                </Tooltip>
              )}
            </Stack>
          </Stack>
          {currentYear && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Latest underwriting year on file for this company: <strong>{currentYear}</strong>. Calculate
              Analysis uses this year until you add a newer year row (Edit underwriting).
            </Typography>
          )}
          {!currentYear && (
            <Typography variant="body2" color="warning.main" sx={{ mt: 1 }}>
              No underwriting rows for this company yet. Use Edit to add years.
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
                  Category
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
                  Total Loss/LAE
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
                        <TableCell>{underwritingRowCategoryLabel(uw)}</TableCell>
                        <TableCell align="right">{formatCurrency(uw.vfbl)}</TableCell>
                        <TableCell align="right">{formatCurrency(uw.wc)}</TableCell>
                        <TableCell align="right">
                          {formatCurrency(uw.total_premium)}
                        </TableCell>
                        <TableCell align="right">{formatCurrency(uw.losses)}</TableCell>
                        <TableCell align="right">{formatCurrency(uw.lae)}</TableCell>
                        <TableCell align="right">{formatTotalLossLaeCell(uw)}</TableCell>
                        <TableCell align="right">
                          {formatPercent(uw.loss_ratio)}
                        </TableCell>
                        <TableCell align="right">-</TableCell>
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
                      <TableCell colSpan={2}>
                        5 Yr Totals{currentYear ? ` (before ${currentYear})` : ""}:
                      </TableCell>
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
                        {formatCurrency(fiveYearTotals.totalLossLae)}
                      </TableCell>
                      <TableCell align="right">
                        {formatPercent(fiveYearLossRatio)}
                      </TableCell>
                      <TableCell align="right">
                        {latestResult &&
                        latestResult.underwriting_year === currentYear &&
                        latestResult.loss_ratio_points != null
                          ? latestResult.loss_ratio_points
                          : "-"}
                      </TableCell>
                      <TableCell align="right">
                        {fiveYearTotals.claims}
                      </TableCell>
                    </TableRow>
                  )}
                </>
              ) : (
                <TableRow>
                  <TableCell colSpan={11} align="center">
                    No underwriting data available
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <Typography variant="caption" color="text.secondary" sx={{ display: "block", px: 2, py: 1.5 }}>
          5 Yr Totals sums the <strong>five underwriting periods immediately before</strong> the latest year
          (same as the worksheet). <strong>Calculate Analysis</strong> uses this row for loss ratio points and
          for claims per $100k premium (total claims ÷ total premium × 100,000).           Individual year rows do not
          store or show points (like the worksheet). Only the 5 Yr Totals row shows{" "}
          <strong>loss-ratio points</strong> from the last calculation when it matches the latest year. The{" "}
          <strong>Category</strong> column is stored per year on each underwriting row (FDM / FDI / FPI); set it
          in <strong>Edit</strong> or it is written on the latest year when you run <strong>Calculate Analysis</strong>.
        </Typography>

        {latestResult && (
          <Box
            sx={{
              px: 2,
              pb: 3,
              pt: 2,
              borderTop: 1,
              borderColor: "divider",
              bgcolor: "grey.50",
            }}
          >
            <Typography variant="h6" gutterBottom>
              Analysis calculation ({latestResult.underwriting_year})
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              After you run <strong>Calculate Analysis</strong>, this section shows how points were built from
              the <strong>5-yr totals</strong> row (loss ratio and frequency), the fire department profile, and
              the management penalty, then the total and assigned category (FDM / FDI / FPI).
            </Typography>

            <Box component="ul" sx={{ pl: 2.5, mb: 2, mt: 0 }}>
              <Typography component="li" variant="body2" sx={{ mb: 0.75 }}>
                <strong>Loss ratio points</strong> ({latestResult.loss_ratio_points ?? 0}):{" "}
                {calcLossRatioPct != null ? (
                  <>
                    combined loss ratio over the <strong>five years before</strong> the renewal year{" "}
                    <strong>{calcLossRatioPct.toFixed(2)}%</strong> (total loss + LAE ÷ total premium on that
                    5-yr row), looked up in the loss-ratio points table.
                  </>
                ) : (
                  "Inputs not available for narrative."
                )}
              </Typography>
              <Typography component="li" variant="body2" sx={{ mb: 0.75 }}>
                <strong>Density points</strong> ({latestResult.density_points ?? 0}):{" "}
                {calcDensity != null ? (
                  <>
                    density <strong>{calcDensity.toLocaleString()}</strong> (rounded population ÷ square miles on
                    profile), looked up in the density points table.
                  </>
                ) : (
                  "—"
                )}
              </Typography>
              <Typography component="li" variant="body2" sx={{ mb: 0.75 }}>
                <strong>Call volume points</strong> ({latestResult.call_volume_points ?? 0}):{" "}
                {calcTotalCalls != null ? (
                  <>
                    <strong>{calcTotalCalls.toLocaleString()}</strong> total calls (fire + EMS on profile), looked
                    up in the call-volume table.
                  </>
                ) : (
                  "—"
                )}
              </Typography>
              <Typography component="li" variant="body2" sx={{ mb: 0.75 }}>
                <strong>Frequency points</strong> ({latestResult.frequency_factor_points ?? 0}):{" "}
                {calcClaimsPer100k != null ? (
                  <>
                    claims per $100k premium <strong>{calcClaimsPer100k.toFixed(2)}</strong> (total # claims ÷
                    total premium × 100,000 on the 5-yr totals row), looked up in the frequency table.
                  </>
                ) : (
                  "—"
                )}
              </Typography>
              <Typography component="li" variant="body2" sx={{ mb: 0.75 }}>
                <strong>Safety / H&amp;S / racing</strong>: safety +1 if Yes, −2 if No (unset in profile keeps
                Calculate disabled); H&amp;S officers +1 if count is greater than zero, −2 if zero (blank keeps
                Calculate disabled); motorized racing −2 if the team is present (checkbox or race count), 0 if
                not.
              </Typography>
              <Typography component="li" variant="body2">
                <strong>Cooperation / management penalty</strong>:{" "}
                {latestResult.management_practice_penalty != null &&
                latestResult.management_practice_penalty !== 0
                  ? `${latestResult.management_practice_penalty} point(s) from profile at calculation time`
                  : "none recorded for this run (0)"}
                . If the sum of all point lines would exceed <strong>31</strong>, the total is capped at{" "}
                <strong>31</strong>; category is then based on that capped total (the <strong>26–31</strong> band is{" "}
                <strong>FPI</strong>).
              </Typography>
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary">
                      Loss ratio points
                    </Typography>
                    <Typography variant="h4">{latestResult.loss_ratio_points ?? 0}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary">
                      Density points
                    </Typography>
                    <Typography variant="h4">{latestResult.density_points ?? 0}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary">
                      Call volume points
                    </Typography>
                    <Typography variant="h4">{latestResult.call_volume_points ?? 0}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary">
                      Frequency points
                    </Typography>
                    <Typography variant="h4">{latestResult.frequency_factor_points ?? 0}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary">
                      Safety committee
                    </Typography>
                    <Typography variant="h4">{latestResult.safety_points ?? 0}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary">
                      H&amp;S officers
                    </Typography>
                    <Typography variant="h4">{latestResult.hso_points ?? 0}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary">
                      Racing penalty
                    </Typography>
                    <Typography variant="h4">{latestResult.racing_penalty ?? 0}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary">
                      Mgmt. / cooperation (profile)
                    </Typography>
                    <Typography variant="h4">{latestResult.management_practice_penalty ?? 0}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Divider sx={{ my: 2 }} />

            <Grid container spacing={2}>
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
                    Total points: {latestResult.total_points ?? 0}
                  </Typography>
                  <Typography variant="h6" sx={{ mt: 1 }}>
                    Final category:{" "}
                    <strong>{latestResult.category || "—"}</strong>
                    {latestResult.category === "FDM" && " (0–14 points band)"}
                    {latestResult.category === "FDI" && " (15–25 points band)"}
                    {latestResult.category === "FPI" && " (26–31 points band)"}
                  </Typography>
                  <Typography variant="body1" sx={{ mt: 1 }}>
                    Assigned company: {latestResult.assignedCompany?.Company_Name || "—"}
                  </Typography>
                  {latestResult.company?.Company_Name && (
                    <Typography variant="body2" sx={{ mt: 0.5, opacity: 0.9 }}>
                      Writing company: {latestResult.company.Company_Name}
                    </Typography>
                  )}
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Box
                  sx={{
                    p: 2,
                    bgcolor: "grey.100",
                    borderRadius: 1,
                    border: "1px solid",
                    borderColor: "grey.300",
                  }}
                >
                  <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                    Category scale
                  </Typography>
                  <Typography variant="body2" component="div">
                    <strong>0–14</strong> points → <strong>FDM</strong>
                    <br />
                    <strong>15–25</strong> points → <strong>FDI</strong>
                    <br />
                    <strong>26–31</strong> points → <strong>FPI</strong>
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>
        )}

        {linkedFormIdValid && linkedFormPayload?.data && (
          <ApplicationApprovalBar
            formId={linkedFormId}
            formStatus={linkedFormPayload.data.status}
            applicationStatus={linkedFormPayload.data.application_status}
            renewalYear={currentYear}
            hasAnalysisResult={!!latestResult}
            renewalVfbl={
              currentYearData?.vfbl != null && currentYearData?.vfbl !== ""
                ? Number(currentYearData.vfbl)
                : null
            }
            renewalWc={
              currentYearData?.wc != null && currentYearData?.wc !== ""
                ? Number(currentYearData.wc)
                : null
            }
            onSuccess={() => {
              refetch();
              refetchLinkedForm();
            }}
          />
        )}
      </Paper>

      <Dialog open={dataEntryDialog.open} onClose={handleCloseDataEntryDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {dataEntryDialog.code === "MISSING_PROFILE"
            ? "Edit Fire Department Profile"
            : "Edit Underwriting History"}
        </DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            {dataEntryDialog.message}
          </Alert>
          {dataEntryDialog.code === "MISSING_PROFILE" && (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Typography variant="overline" color="primary" sx={{ lineHeight: 1.2 }}>
                Demographics &amp; area
              </Typography>
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

              <Divider />
              <Typography variant="overline" color="primary" sx={{ lineHeight: 1.2 }}>
                Call volume
              </Typography>
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

              <Divider />
              <Typography variant="overline" color="primary" sx={{ lineHeight: 1.2 }}>
                Motorized racing
              </Typography>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={profileForm.motorized_racing_team}
                    onChange={(e) => setProfileForm((p) => ({ ...p, motorized_racing_team: e.target.checked }))}
                  />
                }
                label="Motorized Racing Team"
              />
              <TextField
                label="Motorized races per year"
                type="number"
                value={profileForm.motorized_racing_team_count}
                onChange={(e) =>
                  setProfileForm((p) => ({
                    ...p,
                    motorized_racing_team_count: e.target.value === "" ? "" : Number(e.target.value),
                  }))
                }
                fullWidth
                helperText="Application field “Motorized Races Per Year”. When set, analysis uses one penalty point per race."
              />

              <Divider />
              <Typography variant="overline" color="primary" sx={{ lineHeight: 1.2 }}>
                Safety &amp; underwriting adjustments
              </Typography>
              <TextField
                label="# of H&S Officers"
                type="number"
                value={profileForm.hs_officers}
                onChange={(e) => setProfileForm((p) => ({ ...p, hs_officers: e.target.value === "" ? "" : Number(e.target.value) }))}
                fullWidth
                helperText="Required for analysis. Enter 0 if there are no H&S officers (−2 points)."
              />
              <FormControl component="fieldset" variant="standard" sx={{ width: "100%" }}>
                <FormLabel component="legend">Safety comm. / procedures</FormLabel>
                <RadioGroup
                  row
                  value={
                    profileForm.safety_committee === null
                      ? ""
                      : profileForm.safety_committee
                        ? "yes"
                        : "no"
                  }
                  onChange={(e) => {
                    const v = e.target.value;
                    setProfileForm((p) => ({
                      ...p,
                      safety_committee: v === "yes" ? true : v === "no" ? false : null,
                    }));
                  }}
                >
                  <FormControlLabel value="yes" control={<Radio size="small" />} label="Yes (+1)" />
                  <FormControlLabel value="no" control={<Radio size="small" />} label="No (−2)" />
                </RadioGroup>
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
                  Required to run Calculate Analysis. Leave unset only if you have not decided yet (analysis
                  stays disabled).
                </Typography>
              </FormControl>
              <TextField
                label="Penalty — cooperation / management practices"
                type="number"
                value={profileForm.management_practice_penalty}
                onChange={(e) =>
                  setProfileForm((p) => ({
                    ...p,
                    management_practice_penalty: e.target.value === "" ? "" : Number(e.target.value),
                  }))
                }
                fullWidth
                helperText="Integer points added to the analysis total. Use negative values for penalties (e.g. lack of cooperation or losses suggesting poor management)."
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
              <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                New rows use the next older period from the row above (e.g. <strong>2022-2021</strong> →{" "}
                <strong>2021-2020</strong>). Tab out of Year to fill the row below if it is still empty.
              </Typography>
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
                      onBlur={() => {
                        const suggested = suggestPriorYearUnderwritingYear(String(row.underwriting_year ?? ""));
                        if (!suggested) return;
                        setUnderwritingRows((prev) => {
                          if (idx >= prev.length - 1) return prev;
                          const nextRow = prev[idx + 1];
                          if (String(nextRow?.underwriting_year ?? "").trim() !== "") return prev;
                          return prev.map((r, i) =>
                            i === idx + 1 ? { ...r, underwriting_year: suggested } : r
                          );
                        });
                      }}
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
                    <Grid item xs={12}>
                      <FormControl fullWidth size="small">
                        <InputLabel id={`uw-category-${idx}`}>Category (FDM / FDI / FPI)</InputLabel>
                        <Select
                          labelId={`uw-category-${idx}`}
                          label="Category (FDM / FDI / FPI)"
                          value={row.category || ""}
                          onChange={(e) => {
                            const v = e.target.value as string;
                            setUnderwritingRows((prev) =>
                              prev.map((r, i) => (i === idx ? { ...r, category: v } : r))
                            );
                          }}
                        >
                          <MenuItem value="">
                            <em>Not set</em>
                          </MenuItem>
                          <MenuItem value="FDM">FDM</MenuItem>
                          <MenuItem value="FDI">FDI</MenuItem>
                          <MenuItem value="FPI">FPI</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                </Paper>
              ))}
              <Button variant="contained" color="primary" onClick={handleAddUnderwritingRow} fullWidth>
                Add row
              </Button>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDataEntryDialog}>Cancel</Button>
          <Button
            variant="contained"
            color="primary"
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
