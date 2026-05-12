import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useAgentForm } from "../apis/AgentFormsapis";
import { BASE_URL } from "../../../../constant/baseurl";
import { Button } from "@mui/material";
import { useQueryClient } from "@tanstack/react-query";

/** Message type the carrier sends to the broker iframe so it can populate the form. Broker form.html/renewal.html should listen: window.addEventListener('message', (e) => { if (e.data?.type === 'CARRIER_FORM_DATA') { ... apply e.data.data ... } }); */
const CARRIER_FORM_DATA_TYPE = "CARRIER_FORM_DATA";

function MultiPageForm(props) {
  const { companyId, formId, formType, formRecord } = props;
  const [iframeKey, setIframeKey] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // initial → form.html, renewal → renewal.html (per FormData.type)
  const formFileName =
    (formType || "").toLowerCase() === "renewal" ? "renewal.html" : "form.html";

  const brokerDomain =
    window.location.hostname === "localhost"
      ? "http://localhost:5173/"
      : "https://broker.mybeatshealth.com/";

  const brokerOrigin =
    typeof window !== "undefined" ? new URL(brokerDomain).origin : "";

  // Include carrier API base so broker renewal.html can call GET /agentform/:formId (same as form.html)
  const docurl = `${brokerDomain}agent_forms/${companyId}/${formFileName}?company_id=${companyId}&editFormId=${formId}&isReadOnly=true&isHideButtons=true&carrierApiBase=${encodeURIComponent(BASE_URL)}`;

  // Force iframe reload when formId or formType changes
  useEffect(() => {
    setIframeKey((prev) => prev + 1);
  }, [formId, formType]);

  // Send form data to iframe so broker can populate (renewal.html often doesn't call API; postMessage + retries so listener can attach late)
  const sendFormDataToIframe = () => {
    if (!formRecord || !iframeRef.current?.contentWindow || !brokerOrigin)
      return;
    try {
      iframeRef.current.contentWindow.postMessage(
        { type: CARRIER_FORM_DATA_TYPE, data: formRecord },
        brokerOrigin,
      );
    } catch (e) {
      console.warn("postMessage to broker iframe failed", e);
    }
  };

  const handleIframeLoad = () => {
    sendFormDataToIframe();
    window.setTimeout(sendFormDataToIframe, 100);
    window.setTimeout(sendFormDataToIframe, 500);
  };

  return (
    <div className="max-w-full h-screen flex flex-col">
      <div className="flex-1 overflow-auto" style={{ minHeight: 0 }}>
        <iframe
          ref={iframeRef}
          key={iframeKey}
          className="w-full h-full border-0"
          src={docurl}
          title={`Form ${formId}`}
          onLoad={handleIframeLoad}
          onError={() => console.error("Iframe failed to load")}
        />
      </div>
    </div>
  );
}

export default function AgentFormsDetails() {
  const { formId } = useParams();
  const queryClient = useQueryClient();
  const {
    data: agentForm,
    isLoading,
    error,
    refetch,
  } = useAgentForm(Number(formId));

  console.log("AgentFormsDetails agentForm:", agentForm, isLoading, error);

  const formPages = isLoading ? [] : agentForm?.data?.data || [];
  const companyId = agentForm?.data?.company_id;
  const formType = agentForm?.data?.type; // "initial" | "renewal" for form/renewal.html

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
    const errorMessage =
      (error as any)?.response?.data?.message ||
      (error as any)?.message ||
      "Unknown error";
    const isConnectionError =
      errorMessage.includes("temporarily unavailable") ||
      errorMessage.includes("Connection pool") ||
      errorMessage.includes("too many connections");

    return (
      <div className="flex flex-col flex-1 p-24">
        <div className="text-red-600">
          <h2 className="text-xl font-bold mb-2">Error Loading Form</h2>
          <p className="mb-4">{errorMessage}</p>
          {isConnectionError && (
            <p className="text-sm text-gray-600">
              The database is temporarily busy. The page will automatically
              retry, or you can refresh.
            </p>
          )}
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              queryClient.invalidateQueries({
                queryKey: ["agentform", Number(formId)],
              });
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

      <div className="flex-1 overflow-auto">
        {formPages.length > 0 ? (
          <MultiPageForm
            formsData={formPages}
            companyId={companyId}
            formId={formId}
            formType={formType}
            formRecord={agentForm?.data}
          />
        ) : (
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-500">No form data available.</p>
          </div>
        )}
      </div>
    </div>
  );
}
