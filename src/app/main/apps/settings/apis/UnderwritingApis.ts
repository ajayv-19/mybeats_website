import axios from "../../../../constant/axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Type definitions
export interface UnderwritingRow {
  uw_id?: number;
  fire_department_id: number;
  company_id?: number;
  underwriting_year: string;
  vfbl?: number;
  wc?: number;
  total_premium?: number;
  losses?: number;
  lae?: number;
  total_loss_lae?: number;
  loss_ratio?: number;
  points?: number;
  /** Assigned pool FDM / FDI / FPI (Sequelize attribute `type`, DB column category). */
  type?: string | null;
  category?: string | null;
  number_of_claims?: number;
  pr_factor?: number;
  created_at?: string;
  updated_at?: string;
  company?: {
    id: number;
    Company_Name: string;
  };
}

export interface UnderwritingHistoryResponse {
  message: string;
  data: UnderwritingRow[];
}

export interface CarrierInputRequest {
  losses?: number;
  lae?: number;
  company_id?: number;
}

export interface BulkUpsertRequest {
  rows: Array<{
    underwriting_year: string;
    vfbl?: number;
    wc?: number;
    losses?: number;
    lae?: number;
    number_of_claims?: number;
    company_id?: number;
    /** FDM | FDI | FPI | null to clear */
    category?: string | null;
  }>;
}

/**
 * Get underwriting history for a fire department
 */
export const useUnderwritingHistory = (fire_department_id: number) => {
  return useQuery<UnderwritingHistoryResponse>({
    queryKey: ["underwriting", "history", fire_department_id],
    queryFn: async () => {
      const response = await axios.get<UnderwritingHistoryResponse>(
        `/underwriting/${fire_department_id}/history`
      );
      return response.data;
    },
    enabled: !!fire_department_id,
  });
};

/**
 * Update carrier input (losses, lae) for a specific year
 */
export const useUpdateCarrierInput = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      fire_department_id,
      underwriting_year,
      data,
    }: {
      fire_department_id: number;
      underwriting_year: string;
      data: CarrierInputRequest;
    }) => {
      const response = await axios.put(
        `/underwriting/${fire_department_id}/${underwriting_year}/carrier-input`,
        data
      );
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["underwriting", "history", variables.fire_department_id],
      });
    },
  });
};

/**
 * Bulk upsert underwriting rows (for 5-year grid)
 */
export const useBulkUpsertUnderwriting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      fire_department_id,
      data,
    }: {
      fire_department_id: number;
      data: BulkUpsertRequest;
    }) => {
      const response = await axios.put(
        `/underwriting/${fire_department_id}/bulk-upsert`,
        data
      );
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["underwriting", "history", variables.fire_department_id],
      });
    },
  });
};



