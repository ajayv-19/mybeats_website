import axios from "../../../../constant/axios";
import { useQuery } from "@tanstack/react-query";

// Type definitions for Company
export interface Company {
  id: number;
  Company_Name: string;
  address?: string;
  domain: string;
  phone_number?: string;
  website?: string;
  primary_user_id: number;
  is_subscribed: boolean;
}

export interface CompanyResponse {
  company: Company;
}

/**
 * Fetch company details by company ID.
 * @param {number} company_id - The ID of the company.
 */
export const useCompany = (company_id: number) => {
  return useQuery<CompanyResponse>({
    queryKey: ["company", company_id],
    queryFn: async () => {
      const response = await axios.get<CompanyResponse>(`/company/${company_id}`);
      return response.data;
    },
    enabled: !!company_id, // Prevents execution if company_id is undefined
  });
};

export const sendMembersEmail = async (email: string) => {
  //const response = await axios.get<CompanyResponse>(`/company/${company_id}`);
  return null;
}