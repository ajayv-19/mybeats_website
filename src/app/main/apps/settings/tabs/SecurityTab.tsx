import React, { useState, useEffect } from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from "@mui/material";
import Papa from "papaparse";
import { addPolicyHolders, getPolicyHolders } from "../apis/Policyholdersapis"; // Replace with actual API service
import { useSelector } from "react-redux";
import { selectAccount } from "src/app/features/account/accountSlice";

function PolicyHolders() {
  const [existingPolicyHolders, setExistingPolicyHolders] = useState([]); // State for existing rows
  const [csvData, setCsvData] = useState([]); // State for parsed CSV data
  const [isDialogOpen, setIsDialogOpen] = useState(false); // State for dialog visibility
  const [isSubmitting, setIsSubmitting] = useState(false); // State for submit button loading
  const [uploadError, setUploadError] = useState(""); // State for upload error messages

  const requiredHeaders = ["PolicyID", "Employer"]; // Required headers for validation
  const accountData = useSelector(selectAccount) as unknown as {
    company: {
      id: any;
    };
  };

  // Fetch existing policyholders by company
  const fetchPolicyByCompany = async () => {
    try {
      const response = await getPolicyHolders(accountData?.company?.id); // Fetch existing policyholders from the backend
      console.log("Fetched Policyholders:", response);
      setExistingPolicyHolders(response.data.policyHolders || []);
    } catch (error) {
      console.error("Error fetching policyholders:", error);
    }
  };

  useEffect(() => {
    fetchPolicyByCompany();
  }, []);

  // Handle CSV file upload
  const handleFileUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true, // Treat the first row as headers
      skipEmptyLines: true,
      complete: (result) => {
        const headers = Object.keys(result.data[0] || {}).map((header) =>
          header.trim().toLowerCase()
        );
        console.log("Extracted Headers:", headers);
        const isValid = requiredHeaders.every((header) =>
          headers.includes(header.toLowerCase())
        );
        console.log("Validation Result:", isValid);
        if (!isValid) {
          setUploadError(
            "The format of this CSV file is not compatible. Please provide PolicyIDs and the Employers of policyholders using the template provided."
          );
          setCsvData([]); // Clear any previously uploaded data
        } else {
          setUploadError(""); // Clear any previous errors
          setCsvData(result.data); // Store parsed data
        }
      },
      error: (error) => {
        console.error("Error parsing CSV:", error);
        setUploadError("Failed to parse CSV file. Please check the file format.");
      },
    });
  };

  // Handle submitting CSV data to the backend
  const handleSubmit = async () => {
    if (csvData.length === 0) {
      alert("No data to submit. Please upload a valid CSV file.");
      return;
    }

    setIsSubmitting(true);
    try {
      const data = {
        policyData: csvData,
        company_id: accountData?.company?.id,
      };

      const response = await addPolicyHolders(data);
      console.log("Add PolicyHolders Response:", response);

      if (response.status === 200) {
        alert("Policy holders added successfully!");
        setCsvData([]); // Clear the uploaded data
        await fetchPolicyByCompany(); // Refresh the existing policyholders
        setIsDialogOpen(false); // Close the dialog
      } else {
        alert("Failed to add policyholders. Please try again.");
      }
    } catch (error) {
      console.error("Error adding policyholders:", error);
      alert("Failed to add policyholders. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle closing the dialog
  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setUploadError(""); // Reset the error message
    setCsvData([]); // Clear any previously uploaded data
  };

  // Handle downloading the CSV template
  const handleDownloadTemplate = () => {
    const templateData = [
      ["PolicyID", "Employer"], // Example headers
    ];
    const csvContent = Papa.unparse(templateData);
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "policyholders_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      {/* Download Template */}
      <div className="mb-16">
        <Typography variant="body1">
          Download the template below and provide PolicyIDs and the Employers of policyholders
        </Typography>
        <Button
          variant="contained"
          size="small"
          color="secondary"
          className="mt-4 m-6 z-10 rounded p-0 text-md min-h-0  w-auto min-w-0 px-8 py-4 h-40"
          classes={{ startIcon: "mr-4" }}
          onClick={handleDownloadTemplate}
        >
          Download CSV Template
        </Button>
      </div>

      {/* Add Policy Holders */}
      <div className="mb-16">
        <Button
          variant="contained"
          size="small"
          color="secondary"
          className="mt-4 m-6 z-10 rounded p-0 text-md min-h-0  w-auto min-w-0 px-8 py-4 h-40"
          classes={{ startIcon: "mr-4" }}
          onClick={() => setIsDialogOpen(true)}
        >
          Add Policy Holders
        </Button>
      </div>

      {/* Dialog for Uploading CSV */}
      <Dialog
        open={isDialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Upload Policyholders Information </DialogTitle>
        <DialogContent>
          <input type="file" accept=".csv" onChange={handleFileUpload} />
          {uploadError && (
            <Typography color="error" className="mt-8">
              {uploadError}
            </Typography>
          )}
          {csvData.length > 0 && (
            <TableContainer component={Paper} className="mt-16">
              <Table>
                <TableHead>
                  <TableRow>
                    {Object.keys(csvData[0]).map((key) => (
                      <TableCell key={key}>{key}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {csvData.map((row, index) => (
                    <TableRow key={index}>
                      {Object.values(row).map((value, i) => (
                        <TableCell key={i}>{String(value)}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            size="small"
            color="secondary"
            className="mt-4 m-6 z-10 rounded p-0 text-md min-h-0  w-auto min-w-0 px-8 py-4 h-40"
            classes={{ startIcon: "mr-4" }}
            onClick={handleCloseDialog}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            size="small"
            color="secondary"
            className="mt-4 m-6 z-10 rounded p-0 text-md min-h-0  w-auto min-w-0 px-8 py-4 h-40"
            classes={{ startIcon: "mr-4" }}
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Existing Policy Holders Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>PolicyID</TableCell>
              <TableCell>Employer</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {existingPolicyHolders.length > 0 ? (
              existingPolicyHolders.map((holder, index) => (
                <TableRow key={index}>
                  <TableCell>{holder["PolicyID"]}</TableCell>
                  <TableCell>{holder.Employer}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={2} align="center">
                  No policy holders found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}

export default PolicyHolders;