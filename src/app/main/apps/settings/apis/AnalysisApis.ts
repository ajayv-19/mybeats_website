import axios from "../../../../constant/axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Type definitions
/** List endpoint returns FD identity + company context only; detail loads on View. */
export interface FireDepartmentListItem {
  fire_department_id: number;
  fire_department_name: string;
  county?: string;
  state?: string;
  company_id?: number;
  company?: {
    id: number;
    Company_Name: string;
  };
}

export interface AnalysisListResponse {
  message: string;
  data: FireDepartmentListItem[];
}

export interface UnderwritingResult {
  uw_result_id?: number;
  fire_department_id: number;
  underwriting_year: string;
  /** Writing carrier for this result row (matches underwriting row company). */
  company_id?: number | null;
  /** FDM / FDI / FPI from calculation. */
  category?: string | null;
  loss_ratio_points?: number;
  density_points?: number;
  call_volume_points?: number;
  frequency_factor_points?: number;
  safety_points?: number;
  hso_points?: number;
  racing_penalty?: number;
  /** Profile penalty snapshot at calculation (integer points; negative reduces score). */
  management_practice_penalty?: number | null;
  adjustments?: number;
  total_points?: number;
  assigned_company_id?: number;
  created_at?: string;
  assignedCompany?: {
    id: number;
    Company_Name: string;
  };
  company?: {
    id: number;
    Company_Name: string;
  };
}

export interface Policy {
  policy_id?: number;
  fire_department_id: number;
  underwriting_year: string;
  /** Writing / subscribed company (same as underwriting.company_id). */
  company_id?: number | null;
  assigned_company_id?: number;
  policy_value?: number;
  policy_number?: string;
  effective_date?: string;
  expiry_date?: string;
  created_at?: string;
  updated_at?: string;
  assignedCompany?: {
    id: number;
    Company_Name: string;
  };
  company?: {
    id: number;
    Company_Name: string;
  };
}

export interface AnalysisDetail {
  fire_department: any;
  /** Subscribed company this view is scoped to (matches fire_department_profile.company_id / underwriting.company_id). */
  analysis_company_id?: number;
  /** Most recent underwriting_year returned for that company (not calendar "current" until a row exists). */
  latest_underwriting_year?: string | null;
  profile: any;
  underwriting: any[];
  results: UnderwritingResult[];
  policies: Policy[];
  forms: any[];
}

export interface AnalysisDetailResponse {
  message: string;
  data: AnalysisDetail;
}

export interface CalculateAnalysisRequest {
  underwriting_year: string;
  company_id: number;
}

export interface CalculateAnalysisResponse {
  message: string;
  data: {
    result: UnderwritingResult;
    underwriting: any;
    policy: Policy;
  };
}

/**
 * Get analysis list for a company
 */
export const useAnalysisList = (company_id: number) => {
  return useQuery<AnalysisListResponse>({
    queryKey: ["analysis", "list", company_id],
    queryFn: async () => {
      const response = await axios.get<AnalysisListResponse>(`/analysis/list`, {
        params: { company_id },
      });
      return response.data;
    },
    enabled: !!company_id,
  });
};

/**
 * Get analysis detail for a fire department and subscribed company
 */
export const useAnalysisDetail = (
  fire_department_id: number,
  company_id: number
) => {
  return useQuery<AnalysisDetailResponse>({
    queryKey: ["analysis", "detail", fire_department_id, company_id],
    queryFn: async () => {
      const response = await axios.get<AnalysisDetailResponse>(
        `/analysis/${fire_department_id}`,
        { params: { company_id } }
      );
      return response.data;
    },
    enabled: !!fire_department_id && !!company_id,
  });
};

/**
 * Calculate analysis for a fire department and year
 */
export const useCalculateAnalysis = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      fire_department_id,
      data,
    }: {
      fire_department_id: number;
      data: CalculateAnalysisRequest;
    }) => {
      const response = await axios.post<CalculateAnalysisResponse>(
        `/analysis/${fire_department_id}/calculate`,
        data,
      );
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [
          "analysis",
          "detail",
          variables.fire_department_id,
          variables.data.company_id,
        ],
      });
      queryClient.invalidateQueries({
        queryKey: ["analysis", "list"],
      });
    },
  });
};

export interface VerifyPopulationResponse {
  message: string;
  data: {
    population_verified: number | null;
    source: string | null;
    name: string | null;
    year: number | null;
  };
}

/**
 * Cross-verify the carrier-stored population against the US Census Bureau
 * ACS5 county population. Persists the value to
 * `fire_department_profile.population_verified` server-side.
 */
export const useVerifyPopulation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      fire_department_id,
      company_id,
    }: {
      fire_department_id: number;
      company_id: number;
    }) => {
      const response = await axios.post<VerifyPopulationResponse>(
        `/analysis/${fire_department_id}/verify-population`,
        {},
        { params: { company_id } },
      );
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [
          "analysis",
          "detail",
          variables.fire_department_id,
          variables.company_id,
        ],
      });
    },
  });
};

export interface UpdateProfileRequest {
  population?: number | null;
  square_miles?: number | null;
  fire_calls?: number | null;
  ems_calls?: number | null;
  safety_committee?: boolean | null;
  hs_officers?: number | null;
  motorized_racing_team?: boolean | null;
  /** Motorized races per year (form field racing_motorized_count). */
  motorized_racing_team_count?: number | null;
  /** Points adjustment (integer); use negative for cooperation / management penalties. */
  management_practice_penalty?: number | null;
  customer_since?: string | null;
  agent?: string | null;
}

/**
 * Update fire department profile (for manual entry from analysis page)
 */
export const useUpdateAnalysisProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      fire_department_id,
      company_id,
      data,
    }: {
      fire_department_id: number;
      company_id: number;
      data: UpdateProfileRequest;
    }) => {
      const response = await axios.put(
        `/analysis/${fire_department_id}/profile`,
        data,
        { params: { company_id } }
      );
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [
          "analysis",
          "detail",
          variables.fire_department_id,
          variables.company_id,
        ],
      });
      queryClient.invalidateQueries({
        queryKey: ["analysis", "list"],
      });
    },
  });
};
