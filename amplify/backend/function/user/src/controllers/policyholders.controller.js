const db = require("../database");

// Parse CSV File


const PolicyholdersController = {
    policyHolderListUpload: async (req, res) => {

        try {
            console.log(req);
            const { company_id, policyData: records } = req.body
            console.log("records", records);


            // Check record limit
            if (records.length > 200) {
                return res
                    .status(400)
                    .json({ error: "File exceeds 200 records limit" });
            }

            const batch = db.batch();
            const collectionRef = db.collection("insuranceDetails");

            for (const record of records) {
                if (!record.policyId) {
                    return res.status(400).json({ error: "policyId is required" });
                }

                // Ensure uniqueness by policyId
                const docRef = collectionRef.doc(record.policyId);
                const doc = await docRef.get();

                if (!doc.exists) {
                    batch.set(docRef, record);
                }
            }

            await batch.commit();
            res.status(200).json({ message: "Data uploaded successfully" });
        } catch (err) {
            console.error("Error processing CSV:", err);
            res.status(500).json({ error: "Internal Server Error" });
        } finally {
            // Close any resources if needed
            // db.close();
        }
    },
    healthCheck: async (req, res) => {
        try {
            const data = await db.collection("insuranceCompanies").limit(1).get();
            res.status(200).json({ status: "ok", message: "Firestore connected", data });
        } catch (error) {
            res
                .status(500)
                .json({
                    status: "error",
                    message: "Firestore not connected",
                    error: error.message,
                });
        }
    }
};

module.exports = PolicyholdersController;
//changed