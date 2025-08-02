import axios from '../../../../constant/axios';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { fetchAuthSession } from '@aws-amplify/auth';

/**
 * Fetch agent forms for a specific company.
 * @param {string} company_id - The ID of the company.
 */

export const useAgentForms = (company_id: number, page?: number, search?: string) => {
  return useQuery({
    queryKey: ['agentforms', company_id, page, search],
    queryFn: async () => {
    //   const session = await fetchAuthSession();
    //   const authToken = session.tokens?.accessToken?.toString();

      const response = await axios.get(
        `/agentforms`,
        {
          params: { 
            page, search, company_id 
        },
        }
      );
      keepPreviousData: true;
      console.log("The data from GetForms", response.data);
      return response.data;
    },
    enabled: !!company_id, // Prevents execution if company_id is undefined
  });
}

export const useAgentForm = (formId: number) => {
    return useQuery({
        queryKey: ['agentform', formId],
        queryFn: async () => {
        // const session = await fetchAuthSession();
        // const authToken = session.tokens?.accessToken?.toString();
    
        const response = await axios.get(`/agentform/${formId}`);
        return response.data;
        },
        enabled: !!formId, // Prevents execution if formId is undefined
    });
}