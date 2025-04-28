const db = require("../database"); // Firestore database
const { Company } = require("../models"); // PostgreSQL models

class PolicyholdersController {
    setupRoutes(app) {
        app.post("/policyholders", this.policyHolderListUpload.bind(this));
        app.get("/getpolicyholders/:company_id", this.getPolicyHoldersByCompanyId.bind(this));
        app.delete("/deletepolicyholder/:company_id/:policyId", this.deletePolicyHolder.bind(this));
    }

    async policyHolderListUpload(req, res) {
        try {
            const { company_id, policyData: records } = req.body;

            if (!company_id) {
                return res.status(400).json({ error: "company_id is required" });
            }

            const company = await Company.findByPk(company_id);
            if (!company) {
                return res.status(404).json({ error: "Company not found" });
            }

            const { domain, Company_Name: company_name, policyholder_count } = company;

            if (!domain) {
                return res.status(400).json({ error: "Domain not found for the company" });
            }

            const companyRef = db.collection("insuranceCompanies").doc(domain);
            const companyDoc = await companyRef.get();

            if (!companyDoc.exists) {
                await companyRef.set({
                    name: company_name || "Unknown Company",
                    createdAt: new Date(),
                });
            }

            // Fetch all existing policyholders
            const policyHoldersRef = companyRef.collection("policyHolders");
            const existingPolicySnapshot = await policyHoldersRef.get();
            const existingPolicyIds = new Set();
            existingPolicySnapshot.forEach((doc) => {
                existingPolicyIds.add(doc.id);
            });

            const existingCount = existingPolicyIds.size;

            // Classify uploaded records
            const newRecords = [];
            const duplicateRecords = [];

            for (const record of records) {
                const policyId = record.PolicyID;

                if (!policyId) {
                    return res.status(400).json({ error: "PolicyID is required in each record" });
                }

                if (existingPolicyIds.has(policyId)) {
                    duplicateRecords.push(record); // Existing record
                } else {
                    newRecords.push(record); // New record
                }
            }

            const totalUnique = existingCount + newRecords.length;

            // Case 1: Total unique exceeds the limit
            if (totalUnique > policyholder_count) {
                return res.status(400).json({
                    error: `Upload exceeds the allowed limit of ${policyholder_count} unique records.`,
                    existingCount,
                    newRecordsAttempted: newRecords.length,
                    totalUnique,
                });
            }

            // Case 2: All records are duplicates
            if (newRecords.length === 0) {
                return res.status(200).json({
                    message: "All uploaded records already exist. No new records were added.",
                    existingCount,
                    skippedDuplicates: duplicateRecords.length,
                });
            }

            // Case 3: Total unique is within the limit
            const batch = db.batch();

            // Add new records to the batch
            for (const record of newRecords) {
                const policyRef = policyHoldersRef.doc(record.PolicyID);
                batch.set(policyRef, record);
            }

            // Replace existing records in the batch
            for (const record of duplicateRecords) {
                const policyRef = policyHoldersRef.doc(record.PolicyID);
                batch.set(policyRef, record); // Replace existing record
            }

            await batch.commit();

            res.status(200).json({
                message: "Data uploaded successfully",
                uploadedCount: newRecords.length,
                replacedCount: duplicateRecords.length,
                totalUnique,
            });
        } catch (err) {
            console.error("Error processing policyholder upload:", err);
            res.status(500).json({ error: "Internal Server Error", details: err.message });
        }
    }





    // async policyHolderListUpload(req, res) {
    //     try {
    //         const { company_id, policyData: records } = req.body;
    //         console.log("company_id:", company_id);

    //         if (!company_id) {
    //             return res.status(400).json({ error: "company_id is required" });
    //         }

    //         // Fetch company details from PostgreSQL
    //         const company = await Company.findByPk(company_id);
    //         if (!company) {
    //             return res.status(404).json({ error: "Company not found for the Id" });
    //         }

    //         const { domain, Company_Name: company_name, policyholder_count } = company;

    //         if (!domain) {
    //             return res.status(400).json({ error: "Domain not found for the company" });
    //         }

    //         console.log("Domain:", domain);
    //         console.log("Policyholder Count Limit:", policyholder_count);

    //         // Check if the number of records exceeds the policyholder_count limit
    //         if (records.length > policyholder_count) {
    //             return res.status(400).json({
    //                 error: `File exceeds the allowed limit of ${policyholder_count} records for this company.`,
    //             });
    //         }

    //         // Use the domain to interact with Firestore
    //         const companyRef = db.collection("insuranceCompanies").doc(domain);
    //         const companyDoc = await companyRef.get();

    //         // If company document does not exist, create it
    //         if (!companyDoc.exists) {
    //             await companyRef.set({
    //                 name: company_name || "Unknown Company",
    //                 createdAt: new Date(),
    //             });
    //         }

    //         const batch = db.batch();
    //         const existingPolicyIds = [];

    //         for (const record of records) {
    //             const policyId = record.PolicyID;

    //             if (!policyId) {
    //                 return res.status(400).json({ error: "PolicyID is required in each record" });
    //             }

    //             const policyRef = companyRef.collection("policyHolders").doc(policyId);
    //             const policyDoc = await policyRef.get();

    //             if (!policyDoc.exists) {
    //                 batch.set(policyRef, record); // Add to batch only if it doesn't exist
    //             } else {
    //                 existingPolicyIds.push(policyId); // Track duplicates
    //             }
    //         }

    //         await batch.commit();

    //         res.status(200).json({
    //             message: "Data uploaded successfully",
    //             skippedDuplicates: existingPolicyIds,
    //         });
    //     } catch (err) {
    //         console.error("Error processing policyholder upload:", err);
    //         res.status(500).json({ error: "Internal Server Error" });
    //     }
    // }

    // async getPolicyHoldersByCompanyId(req, res) {
    //     try {
    //         const { company_id } = req.params;

    //         if (!company_id) {
    //             return res.status(400).json({ error: "company_id is required in path parameters" });
    //         }

    //         // Fetch company details from PostgreSQL
    //         const company = await Company.findByPk(company_id);
    //         if (!company) {
    //             return res.status(404).json({ error: "Company not found" });
    //         }

    //         const { domain } = company;

    //         if (!domain) {
    //             return res.status(400).json({ error: "Domain not found for the company" });
    //         }

    //         console.log("Domain:", domain);

    //         // Use the domain to fetch policyholders from Firestore
    //         const companyRef = db.collection("insuranceCompanies").doc(domain);
    //         const companyDoc = await companyRef.get();

    //         if (!companyDoc.exists) {
    //             return res.status(404).json({ error: "Company not found in Firestore" });
    //         }

    //         const policySnapshot = await companyRef.collection("policyHolders").get();

    //         const policyHolders = [];
    //         policySnapshot.forEach((doc) => {
    //             policyHolders.push({ id: doc.id, ...doc.data() });
    //         });

    //         return res.status(200).json({ policyHolders });
    //     } catch (err) {
    //         console.error("Error fetching policyholders:", err);
    //         return res.status(500).json({ error: "Internal Server Error" });
    //     }
    // }


    /////////////////////////


    async getPolicyHoldersByCompanyId(req, res) {
        try {
            const { company_id } = req.params;
            const { page = 1, limit = 10, search = "" } = req.query; // Default values for pagination and search

            if (!company_id) {
                return res.status(400).json({ error: "company_id is required in path parameters" });
            }

            // Fetch company details from PostgreSQL
            const company = await Company.findByPk(company_id);
            if (!company) {
                return res.status(404).json({ error: "Company not found" });
            }

            const { domain } = company;

            if (!domain) {
                return res.status(400).json({ error: "Domain not found for the company" });
            }

            console.log("Domain:", domain);

            // Use the domain to fetch policyholders from Firestore
            const companyRef = db.collection("insuranceCompanies").doc(domain);
            const companyDoc = await companyRef.get();

            if (!companyDoc.exists) {
                return res.status(200).json({
                    total: 0,
                    page: parseInt(page, 10),
                    limit: parseInt(limit, 10),
                    policyHolders: [],
                });
            }

            const policyHoldersRef = companyRef.collection("policyHolders");

            // Fetch all policyholders
            const policySnapshot = await policyHoldersRef.get();

            let policyHolders = [];
            policySnapshot.forEach((doc) => {
                policyHolders.push({ id: doc.id, ...doc.data() });
            });

            // Apply search filter
            if (search) {
                const searchLower = search.toLowerCase();
                policyHolders = policyHolders.filter(
                    (holder) =>
                        holder.PolicyID?.toLowerCase().includes(searchLower) ||
                        holder.Employer?.toLowerCase().includes(searchLower)
                );
            }

            // Apply pagination
            const total = policyHolders.length; // Total number of filtered results
            const startIndex = page * limit; // Adjusted for 0-based indexing
            const endIndex = startIndex + parseInt(limit, 10);
            const paginatedPolicyHolders = policyHolders.slice(startIndex, endIndex);

            return res.status(200).json({
                total,
                page: parseInt(page, 10),
                limit: parseInt(limit, 10),
                policyHolders: paginatedPolicyHolders,
            });
        } catch (err) {
            console.error("Error fetching policyholders:", err);
            return res.status(500).json({ error: "Internal Server Error" });
        }
    }



    async deletePolicyHolder(req, res) {
        try {
            const { company_id, policyId } = req.params;

            if (!company_id || !policyId) {
                return res.status(400).json({ error: "company_id and policyId are required in path parameters" });
            }

            // Fetch company details from PostgreSQL
            const company = await Company.findByPk(company_id);
            if (!company) {
                return res.status(404).json({ error: "Company not found" });
            }

            const { domain } = company;

            if (!domain) {
                return res.status(400).json({ error: "Domain not found for the company" });
            }

            console.log("Domain:", domain);

            // Use the domain to locate the policyholder in Firestore
            const companyRef = db.collection("insuranceCompanies").doc(domain);
            const policyRef = companyRef.collection("policyHolders").doc(policyId);

            // Check if the policyholder exists
            const policyDoc = await policyRef.get();
            if (!policyDoc.exists) {
                return res.status(404).json({ error: "Policyholder not found" });
            }

            // Delete the policyholder
            await policyRef.delete();

            res.status(200).json({ message: "Policyholder deleted successfully" });
        } catch (err) {
            console.error("Error deleting policyholder:", err);
            res.status(500).json({ error: "Internal Server Error" });
        }
    }
}

module.exports = new PolicyholdersController();