import React, { useState, useEffect } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  TextField,
  IconButton,
} from "@mui/material";
import Papa from "papaparse";
import DeleteIcon from "@mui/icons-material/Delete"; // Import Delete Icon// Replace with actual API service
import { useSelector } from "react-redux";
import { selectAccount } from "src/app/features/account/accountSlice";
import { toast } from "sonner"; // Toast library
import FuseLoading from "@fuse/core/FuseLoading"; // Loading spinner
import {
  useAddPolicyHolders,
  useDeletePolicyHolder,
  usePolicyHolders,
  useUpdatePolicyHolder,
} from "../apis/Policyholdersapis";

function PolicyHolders() {
  const [filteredPolicyHolders, setFilteredPolicyHolders] = useState([]); // State for filtered rows
  const [csvData, setCsvData] = useState<any>([]); // State for parsed CSV data
  const [isDialogOpen, setIsDialogOpen] = useState(false); // State for dialog visibility
  const [uploadError, setUploadError] = useState(""); // State for upload error messages
  const [loading, setLoading] = useState(false); // State for loading spinner
  const [searchQuery, setSearchQuery] = useState(""); // State for search query
  const [page, setPage] = useState(0); // State for pagination page (0-based for Material-UI)
  const rowsPerPage = 10; // Number of rows per page
  const [searchInput, setSearchInput] = useState(""); // State for search input field
  const requiredHeaders = ["PolicyID", "Employer"]; // Required headers for validation
  const accountData = useSelector(selectAccount) as unknown as {
    company: {
      id: any;
      policyholder_count: number;
    };
  };

  const {
    data: existingPolicyHolders,
    isPending,
    isError,
  } = usePolicyHolders(accountData?.company?.id, page, searchQuery); // Fetch policyholders using custom hook
  const {
    mutate: policyDeleteMutation,
    isPending: isDeletePending,
    isError: isDeleteError,
  } = useDeletePolicyHolder();
  const {
    mutate: updatePolicyHolderMutation,
    isPending: isUpdatePolicyPending,
    isError: isUpdatePolicyError,
  } = useUpdatePolicyHolder();
  const { mutate: addPolicyHolders, isSuccess, isPending: isSubmitting } =
    useAddPolicyHolders();
  console.log("-->", existingPolicyHolders?.policyHolders);
  console.log("-->", existingPolicyHolders);

  useEffect(()=>{
setIsDialogOpen(false)
setCsvData([])
  },[isSuccess])

  const handleSearchInputChange = (event) => {
    setSearchInput(event.target.value); // Update the input field value
  };

  // Handle search button click
  const handleSearch = () => {
    setSearchQuery(searchInput); // Update the actual search query
    // Reset to the first page
  };

  // Handle pagination change
  const handleChangePage = (event, newPage) => {
    setPage(newPage); // Keep it 0-based for Material-UI
  };

  const handleDelete = (policyId) => {
    policyDeleteMutation({
      company_id: accountData?.company?.id,
      policyId: policyId,
    });
  };

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
        setUploadError(
          "Failed to parse CSV file. Please check the file format."
        );
      },
    });
  };

  // Handle submitting CSV data to the backend
  const handleSubmit = () => {
    if (csvData.length === 0) {
      toast.error("No data to submit. Please upload a valid CSV file.");
      return;
    }

    toast("Uploading data... This might take a few minutes."); // Notify user about upload time
    const data = {
      policyData: csvData,
      company_id: accountData?.company?.id,
    };
    console.log("Data to be submitted:", data);

    addPolicyHolders(data);
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

  console.log("--", filteredPolicyHolders);

  return (
    <div>

        <>
          {/* Download Template */}
          <div className="mb-16">
            <Typography variant="body1">
              Download the template below and provide PolicyIDs and the
              Employers of policyholders
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
              Add Policyholders
            </Button>
          </div>

          {/* Dialog for Uploading CSV */}
          <Dialog
            open={isDialogOpen}
            onClose={handleCloseDialog}
            maxWidth="md"
            fullWidth
          >
            <DialogTitle>Upload Unique IDs of Policyholders </DialogTitle>
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

          {/* Search Bar */}
          <div className="mb-16" style={{ display: "flex", gap: "10px" }}>
            <TextField
              label="Search by Unique ID or Employer"
              variant="outlined"
              size="small"
              fullWidth
              value={searchInput}
              onChange={handleSearchInputChange} // Update input field value
            />
            <Button
              variant="contained"
              color="secondary"
              onClick={handleSearch} // Trigger search on button click
            >
              Search
            </Button>
          </div>

          {/* Existing Policy Holders Table */}
         {isPending ? <FuseLoading/> : 
         <>
         <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>PolicyID</TableCell>
                  <TableCell>Employer</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {existingPolicyHolders?.policyHolders.length > 0 ? (
                  existingPolicyHolders?.policyHolders.map((holder, index) => (
                    <TableRow key={index}>
                      <TableCell>{holder.PolicyID}</TableCell>
                      <TableCell>{holder.Employer}</TableCell>
                      <TableCell>
                        <IconButton
                          color="secondary"
                          size="small"
                          onClick={() => handleDelete(holder.PolicyID)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} align="center">
                      No policy holders found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

       
          <TablePagination
            component="div"
            count={existingPolicyHolders?.total || 0}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            rowsPerPageOptions={[]} // Remove "Rows per page" dropdown
            labelRowsPerPage="" // Hide "Rows per page" label
          />
          </>
          }
        </>
      
    </div>
  );
}

export default PolicyHolders;
