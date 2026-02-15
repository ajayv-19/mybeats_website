import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAgentForm } from "../apis/AgentFormsapis";
import filedsMapping from "./_data/fileds_mapping";
import axios from "../../../../constant/axios";
import { Box, Tabs, Tab, Paper, Button } from "@mui/material";
import UnderwritingGrid from "./UnderwritingGrid";
import { useQueryClient } from "@tanstack/react-query";

function MultiPageForm(props) {
  const { formsData, companyId, formId } = props;
  const [currentPage, setCurrentPage] = useState(0);
  const [iframeKey, setIframeKey] = useState(0);

  const currentForm = formsData[currentPage];
  const items = Object.entries(currentForm.data || {});
  const mappedLabels = filedsMapping[companyId] || {};

  // Change this to your production domain when ready
  // const brokerDomain = "https://broker.mybeatshealth.com/"
  const brokerDomain =
    window.location.hostname === "localhost"
      ? "http://localhost:5173/"
      : "https://broker.mybeatshealth.com/";

  // Updated URL with proper parameters
  const docurl = `${brokerDomain}agent_forms/${companyId}/form.html?company_id=${companyId}&editFormId=${formId}&isReadOnly=true&isHideButtons=true`;

  // Force iframe reload when formId changes
  useEffect(() => {
    setIframeKey((prev) => prev + 1);
  }, [formId]);

  console.log(
    { formsData, companyId, docurl },
    "formdata, companyid, and iframe url"
  );

  return (
    <div className="max-w-full h-screen flex">
      {/* Iframe Panel */}
      <div className="flex-1">
        <iframe
          key={iframeKey}
          className="w-full h-full border-0"
          src={docurl}
          title={`Form ${formId}`}
          onLoad={() => console.log("Iframe loaded successfully")}
          onError={() => console.error("Iframe failed to load")}
        />
      </div>
    </div>
  );
}

export default function AgentFormsDetails() {
  const { formId } = useParams();
  const queryClient = useQueryClient();
  const { data: agentForm, isLoading, error, refetch } = useAgentForm(Number(formId));
  const [currentTab, setCurrentTab] = useState(0);
  const [fireDepartmentId, setFireDepartmentId] = useState<number | null>(null);

  console.log("AgentFormsDetails agentForm:", agentForm, isLoading, error);

  const formPages = isLoading ? [] : agentForm?.data?.data || [];
  const companyId = agentForm?.data?.company_id;

  // Fetch fire department ID
  useEffect(() => {
    if (formId && !fireDepartmentId) {
      axios
        .get(`/agentform/${formId}/fire-department-id`)
        .then((response) => {
          setFireDepartmentId(response.data.data.fire_department_id);
        })
        .catch((error) => {
          console.error("Error fetching fire department ID:", error);
          // If fire department doesn't exist yet, that's okay - we'll handle it
        });
    }
  }, [formId, fireDepartmentId]);

  if (isLoading) {
    return (
      <div className="flex flex-col flex-1 p-24">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading form data...</div>
        </div>
      </div>
    );
  }

  if (error) {
    const errorMessage = (error as any)?.response?.data?.message || (error as any)?.message || "Unknown error";
    const isConnectionError = errorMessage.includes("temporarily unavailable") || 
                             errorMessage.includes("Connection pool") ||
                             errorMessage.includes("too many connections");
    
    return (
      <div className="flex flex-col flex-1 p-24">
        <div className="text-red-600">
          <h2 className="text-xl font-bold mb-2">Error Loading Form</h2>
          <p className="mb-4">{errorMessage}</p>
          {isConnectionError && (
            <p className="text-sm text-gray-600">
              The database is temporarily busy. The page will automatically retry, or you can refresh.
            </p>
          )}
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              queryClient.invalidateQueries({ queryKey: ["agentform", Number(formId)] });
              refetch();
            }}
            sx={{ mt: 2 }}
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1">
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <div className="flex-1"></div>
          <h2 className="text-2xl font-bold text-center flex-1">
            Application Form #{formId}
          </h2>
          <div className="flex-1 flex justify-end">
            <Button
              variant="contained"
              color="primary"
              onClick={() => window.history.back()}
            >
              Back
            </Button>
          </div>
        </div>
      </div>

      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          value={currentTab}
          onChange={(_, newValue) => setCurrentTab(newValue)}
        >
          <Tab label="Form View" />
          <Tab label="Underwriting Data" />
        </Tabs>
      </Box>

      <div className="flex-1 overflow-auto">
        {currentTab === 0 && (
          <>
            {formPages.length > 0 ? (
              <MultiPageForm
                formsData={formPages}
                companyId={companyId}
                formId={formId}
              />
            ) : (
              <div className="flex items-center justify-center h-64">
                <p className="text-gray-500">No form data available.</p>
              </div>
            )}
          </>
        )}

        {currentTab === 1 && (
          <>
            {fireDepartmentId ? (
              <UnderwritingGrid
                fire_department_id={fireDepartmentId}
                company_id={companyId}
              />
            ) : (
              <Box sx={{ p: 4, textAlign: "center" }}>
                <p className="text-gray-500">
                  Loading fire department information...
                </p>
              </Box>
            )}
          </>
        )}
      </div>
    </div>
  );
}
