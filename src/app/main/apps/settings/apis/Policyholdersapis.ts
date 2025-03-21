// services/policyHolderService.js

// Dummy data to simulate existing policyholders
let policyHolders = [
    { PolicyID: "POL12345", Department: "Finance" },
    { PolicyID: "POL67890", Department: "HR" },
  ];
  
  /**
   * Fetch existing policyholders (simulates an API call)
   * @returns {Promise<{data: Array}>} A promise that resolves to the list of policyholders
   */
  export const fetchPolicyHolders = () => {
    return new Promise<{ data: Array<{ PolicyID: string; Department: string }> }>((resolve) => {
      setTimeout(() => {
        resolve({ data: policyHolders });
      }, 500); // Simulate a delay
    });
  };
  
  /**
   * Add new policyholders (simulates an API call)
   * @param {Array<{ PolicyID: string; Department: string }>} newPolicyHolders - The list of new policyholders to add
   * @returns {Promise<void>} A promise that resolves when the data is added
   */
  export const addPolicyHolders = (newPolicyHolders: Array<{ PolicyID: string; Department: string }>) => {
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        try {
          // Add new policyholders to the existing list
          policyHolders = [...policyHolders, ...newPolicyHolders];
          resolve();
        } catch (error) {
          reject(new Error("Failed to add policyholders"));
        }
      }, 500); // Simulate a delay
    });
  };