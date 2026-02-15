import axios from "../../../../constant/axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Type definitions
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
  latest_profile?: any;
  latest_underwriting_year?: string;
  latest_policy?: any;
}

export interface AnalysisListResponse {
  message: string;
  data: FireDepartmentListItem[];
}

export interface UnderwritingResult {
  uw_result_id?: number;
  fire_department_id: number;
  underwriting_year: string;
  loss_ratio_points?: number;
  density_points?: number;
  call_volume_points?: number;
  frequency_factor_points?: number;
  safety_points?: number;
  hso_points?: number;
  racing_penalty?: number;
  adjustments?: number;
  total_points?: number;
  assigned_company_id?: number;
  created_at?: string;
  assignedCompany?: {
    id: number;
    Company_Name: string;
  };
}

export interface Policy {
  policy_id?: number;
  fire_department_id: number;
  underwriting_year: string;
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
}

export interface AnalysisDetail {
  fire_department: any;
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
 * Get analysis detail for a fire department
 */
export const useAnalysisDetail = (fire_department_id: number) => {
  return useQuery<AnalysisDetailResponse>({
    queryKey: ["analysis", "detail", fire_department_id],
    queryFn: async () => {
      const response = await axios.get<AnalysisDetailResponse>(
        `/analysis/${fire_department_id}`
      );
      return response.data;
    },
    enabled: !!fire_department_id,
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
        data
      );
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["analysis", "detail", variables.fire_department_id],
      });
      queryClient.invalidateQueries({
        queryKey: ["analysis", "list"],
      });
    },
  });
};



