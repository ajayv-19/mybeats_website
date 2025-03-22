
import axios from 'axios';
import { fetchAuthSession } from '@aws-amplify/auth';
// services/policyHolderService.js

const session = await fetchAuthSession();
	const authToken = session.tokens?.accessToken?.toString();

// Dummy data to simulate existing policyholders
let policyHolders = [
    { PolicyID: "POL12345", Employer: "Finance" },
    { PolicyID: "POL67890", Employer: "HR" },
  ];
  
  /**
   * Fetch existing policyholders (simulates an API call)
   * @returns {Promise<{data: Array}>} A promise that resolves to the list of policyholders
   */
  export const fetchPolicyHolders = () => {
    return new Promise<{ data: Array<{ PolicyID: string; Employer: string }> }>((resolve) => {
      setTimeout(() => {
        resolve({ data: policyHolders });
      }, 500); // Simulate a delay
    });
  };
  
export const addPolicyHolders = (data: {policyData: any, companyId: string})=> {
return axios.post('https://b89ns5qxe2.execute-api.us-east-1.amazonaws.com/dev/backendapi/policyholders', data,
  {headers: {
    Authorization: authToken
  }}
)
}