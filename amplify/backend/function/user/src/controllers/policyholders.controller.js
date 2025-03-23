const db = require("../database");

const PolicyholdersController = {
    policyHolderListUpload: async (req, res) => {
        try {
            const { company_id, company_name, policyData: records } = req.body;
            console.log("company_id:", company_id);


            if (!company_id) {
                return res.status(400).json({ error: "company_id is required" });
            }

            if (records.length > 200) {
                return res
                    .status(400)
                    .json({ error: "File exceeds 200 records limit" });
            }

            const companyRef = db.collection("insuranceCompanies").doc(company_id.toString());
            const companyDoc = await companyRef.get();

            // If company document does not exist, create it
            if (!companyDoc.exists) {
                await companyRef.set({
                    name: company_name || "Unknown Company",
                    createdAt: new Date()
                });
            }

            const batch = db.batch();
            const existingPolicyIds = [];

            for (const record of records) {
                const policyId = record.PolicyID;

                if (!policyId) {
                    return res.status(400).json({ error: "PolicyID is required in each record" });
                }

                const policyRef = companyRef.collection("policyHolders").doc(policyId);
                const policyDoc = await policyRef.get();

                if (!policyDoc.exists) {
                    batch.set(policyRef, record); // Add to batch only if it doesn't exist
                } else {
                    existingPolicyIds.push(policyId); // Track duplicates
                }
            }

            await batch.commit();

            res.status(200).json({
                message: "Data uploaded successfully",
                skippedDuplicates: existingPolicyIds
            });

        } catch (err) {
            console.error("Error processing CSV:", err);
            res.status(500).json({ error: "Internal Server Error" });
        }
    },

    healthCheck: async (req, res) => {
        try {
            const data = await db.collection("insuranceCompanies").limit(1).get();
            res.status(200).json({ status: "ok", message: "Firestore connected", data });
        } catch (error) {
            res.status(500).json({
                status: "error",
                message: "Firestore not connected",
                error: error.message,
            });
        }
    },
    getPolicyHoldersByCompanyId: async (req, res) => {
        try {
            const { company_id } = req.params;

            if (!company_id) {
                return res.status(400).json({ error: "company_id is required in path parameters" });
            }

            const companyRef = db.collection("insuranceCompanies").doc(company_id);
            const companyDoc = await companyRef.get();

            if (!companyDoc.exists) {
                return res.status(404).json({ error: "Company not found" });
            }

            const policySnapshot = await companyRef.collection("policyHolders").get();

            const policyHolders = [];
            policySnapshot.forEach(doc => {
                policyHolders.push({ id: doc.id, ...doc.data() });
            });

            return res.status(200).json({ policyHolders });

        } catch (err) {
            console.error("Error fetching policyholders:", err);
            return res.status(500).json({ error: "Internal Server Error" });
        }
    }


};

module.exports = PolicyholdersController;
