import axios from "../../../../constant/axios";
import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { fetchAuthSession } from "@aws-amplify/auth";

// Type definitions for Agent Form
export interface AgentForm {
  id: number;
  name: string;
  company_id: number;
  type: string;
  data: any;
  insurance_company?: string;
  fire_department?: string;
  status?: string;
  updated_by?: string;
  created_at: string;
  updated_at: string;
}

export interface AgentFormsResponse {
  message: string;
  data: AgentForm[];
}

/**
 * Fetch agent forms for a specific company.
 * @param {string} company_id - The ID of the company.
 */

export const useAgentForms = (
  company_id: number,
  page?: number,
  search?: string
) => {
  return useQuery<AgentFormsResponse>({
    queryKey: ["agentforms", company_id, page, search],
    queryFn: async () => {
      //   const session = await fetchAuthSession();
      //   const authToken = session.tokens?.accessToken?.toString();

      const response = await axios.get<AgentFormsResponse>(`/agentforms`, {
        params: {
          page,
          search,
          company_id,
        },
      });
      console.log("The data from GetForms", response.data);
      return response.data;
    },
    enabled: !!company_id, // Prevents execution if company_id is undefined
  });
};

export const useAgentForm = (formId: number) => {
  return useQuery<{ message: string; data: AgentForm }>({
    queryKey: ["agentform", formId],
    queryFn: async () => {
      // const session = await fetchAuthSession();
      // const authToken = session.tokens?.accessToken?.toString();

      const response = await axios.get<{ message: string; data: AgentForm }>(
        `/agentform/${formId}`
      );
      return response.data;
    },
    enabled: !!formId, // Prevents execution if formId is undefined
  });
};
