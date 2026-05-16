import axios from "../../../../constant/axios";
import { uploadData } from "@aws-amplify/storage";
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
  /** Set when the form is linked to a fire department (used for analysis deep links). */
  fire_department_id?: number | null;
  status?: string;
  /** Broker workflow: list shows rows with Submitted only (see GET /agentforms). */
  application_status?: string | null;
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
    retry: 2, // Retry failed requests 2 times
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
  });
};

export const callUpdateAgentFormStatus = (formId: number, status: any) => {
  return axios.post(`/agentform/approveOrReject`, {
    id: formId,
    application_status: status,
  });
};

export const sendAgentFormMessage = (
  formId: number,
  message: string,
  senderId: number,
  receiverId: number,
  type: string = "text"
) => {
  return axios.post(`/agentform/${formId}/sendMessage`, {
    id: formId,
    message: message,
    type: type,
    sender_id: senderId,
    receiver_id: receiverId,
  });
};

export const markReadAgentFormMessage = (formId: number, msgIds: number[]) => {
  return axios.post(`/agentform/${formId}/markAsRead`, {
    msgIds: msgIds.join(","),
  });
};

export const useAgentFormMessages = (formId: number) => {
  return useQuery<{ message: string; data: any[] }>({
    queryKey: ["agentformmessages", formId],
    queryFn: async () => {
      const response = await axios.get<{ message: string; data: any[] }>(
        `/agentform/${formId}/getMessages`
      );
      return response.data;
    },
    enabled: !!formId,
    refetchOnWindowFocus: true, // Refetch when window regains focus
    refetchInterval: 5000, // Refetch every 5 seconds to get new messages
  });
};

// Document Attachments API
export interface DocumentAttachment {
  id: number;
  form_id: number;
  link: string;
  created_at: string;
  updated_at: string;
}

export interface AttachmentsResponse {
  message: string;
  data: DocumentAttachment[];
}

/**
 * Get document attachments for a form
 */
export const useFormAttachments = (formId: number) => {
  return useQuery<AttachmentsResponse>({
    queryKey: ["formattachments", formId],
    queryFn: async () => {
      console.log(`[useFormAttachments] Fetching attachments for formId: ${formId}`);
      const response = await axios.get<AttachmentsResponse>(
        `/agentform/${formId}/attachments`
      );
      console.log(`[useFormAttachments] Response for formId ${formId}:`, response.data);
      return response.data;
    },
    enabled: !!formId,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes to prevent unnecessary refetches
    refetchOnWindowFocus: false, // Prevent refetch on window focus to avoid duplicate calls
    retry: 1, // Only retry once on failure
  });
};
