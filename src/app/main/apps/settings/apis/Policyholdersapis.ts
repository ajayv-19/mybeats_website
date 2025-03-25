import axios from 'axios';
import { fetchAuthSession } from '@aws-amplify/auth';
import { co } from '@fullcalendar/core/internal-common';

/**
 * Fetch existing policyholders for a specific company.
 * @param {string} company_id - The ID of the company.
 * @returns {Promise<any>} A promise that resolves to the list of policyholders.
 */
export const getPolicyHolders = async (company_id: string) => {
  console.log("company_id", company_id);
  const session = await fetchAuthSession();
  const authToken = session.tokens?.accessToken?.toString();

  const response = await axios.get(
    `https://b89ns5qxe2.execute-api.us-east-1.amazonaws.com/dev/backendapi/getpolicyholders/${company_id}`,
    {
      headers: {
        Authorization: authToken,
      },
    }
  );

  return response;
};

/**
 * Add new policyholders to a specific company.
 * @param {Object} data - The data to be sent to the backend.
 * @param {Array} data.policyData - The list of policyholders to add.
 * @param {string} data.company_id - The company ID.
 * @returns {Promise<any>} A promise that resolves when the data is added.
 */
export const addPolicyHolders = async (data: { policyData: any; company_id: string }) => {
  const session = await fetchAuthSession();
  const authToken = session.tokens?.accessToken?.toString();

  const response = await axios.post(
    'https://b89ns5qxe2.execute-api.us-east-1.amazonaws.com/dev/backendapi/policyholders',
    data,
    {
      headers: {
        Authorization: authToken,
      },
    }
  );

  return response;
};

/**
 * Remove a specific policyholder by their PolicyID.
 * @param {string} policyID - The ID of the policyholder to remove.
 *  @param {string} company_id - The ID of the company to which the policyholder belongs.
 * @returns {Promise<any>} A promise that resolves when the policyholder is removed.
 */
export const deletePolicyHolder = async (company_id: string, policyId: string) => {
  const session = await fetchAuthSession();
  const authToken = session.tokens?.accessToken?.toString();
  console.log("company_id", company_id);
  console.log("policyId", policyId);
try{
  const response = await axios.delete(
    `https://b89ns5qxe2.execute-api.us-east-1.amazonaws.com/dev/backendapi/deletepolicyholder/${company_id}/${policyId}`,
    {
      headers: {
        Authorization: authToken,
      },
    }
  );

  return response;
}catch (error) {
  console.error("Error deleting policyholder:", error);
  throw error;
}
};

/**
 * Update a specific policyholder's details.
 * @param {string} policyID - The ID of the policyholder to update.
 * @param {Object} data - The updated data for the policyholder.
 * @returns {Promise<any>} A promise that resolves when the policyholder is updated.
 */

