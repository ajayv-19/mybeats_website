import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Box, Button, Typography } from "@mui/material";
import { useQueryClient } from "@tanstack/react-query";
import { useAgentForm } from "../apis/AgentFormsapis";
import { BASE_URL } from "../../../../constant/baseurl";

/** Message type the carrier sends to the broker iframe so it can populate the form. Broker form.html/renewal.html should listen: window.addEventListener('message', (e) => { if (e.data?.type === 'CARRIER_FORM_DATA') { ... apply e.data.data ... } }); */
const CARRIER_FORM_DATA_TYPE = "CARRIER_FORM_DATA";

/** Broker posts this after each page change; carrier unlocks View Analytics when isLastPage is true (once, then stays visible). */
const BROKER_FORM_PAGE_TYPE = "BROKER_FORM_PAGE";

function MultiPageForm(props: {
  companyId: number;
  formId: string | undefined;
  formType: string | undefined;
  formRecord: unknown;
  parentOrigin: string;
}) {
  const { companyId, formId, formType, formRecord, parentOrigin } = props;
  const [iframeKey, setIframeKey] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const formFileName =
    (formType || "").toLowerCase() === "renewal" ? "renewal.html" : "form.html";

  const brokerDomain =
    window.location.hostname === "localhost"
      ? "http://localhost:5173/"
      : "https://broker.mybeatshealth.com/";

  const brokerOrigin =
    typeof window !== "undefined" ? new URL(brokerDomain).origin : "";

  const docurl = `${brokerDomain}agent_forms/${companyId}/${formFileName}?company_id=${companyId}&editFormId=${formId}&isReadOnly=true&isHideButtons=true&carrierApiBase=${encodeURIComponent(
    BASE_URL
  )}&parentOrigin=${encodeURIComponent(parentOrigin)}`;

  useEffect(() => {
    setIframeKey((prev) => prev + 1);
  }, [formId, formType]);

  const sendFormDataToIframe = () => {
    if (!formRecord || !iframeRef.current?.contentWindow || !brokerOrigin) return;
    try {
      iframeRef.current.contentWindow.postMessage(
        { type: CARRIER_FORM_DATA_TYPE, data: formRecord },
        brokerOrigin
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
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();

  const parentOrigin = typeof window !== "undefined" ? window.location.origin : "";

  const brokerOriginConfigured = useMemo(() => {
    const brokerDomain =
      typeof window !== "undefined" && window.location.hostname === "localhost"
        ? "http://localhost:5173/"
        : "https://broker.mybeatshealth.com/";
    try {
      return new URL(brokerDomain).origin;
    } catch {
      return "";
    }
  }, []);

  /**
   * Latched true the first time the user reaches the last iframe page (page 4).
   * Stays true if they navigate back to earlier pages.
   */
  const [analyticsUnlocked, setAnalyticsUnlocked] = useState(false);

  useEffect(() => {
    setAnalyticsUnlocked(false);
  }, [formId]);

  const onFormPageMessage = useCallback(
    (e: MessageEvent) => {
      const allowed =
        e.origin === parentOrigin ||
        (!!brokerOriginConfigured && e.origin === brokerOriginConfigured);
      if (!allowed) return;
      if (e.data?.type !== BROKER_FORM_PAGE_TYPE) return;
      if (e.data.isLastPage === true) {
        setAnalyticsUnlocked(true);
      }
    },
    [parentOrigin, brokerOriginConfigured]
  );

  useEffect(() => {
    window.addEventListener("message", onFormPageMessage);
    return () => window.removeEventListener("message", onFormPageMessage);
  }, [onFormPageMessage]);

  const {
    data: agentPayload,
    isLoading,
    error,
    refetch,
  } = useAgentForm(Number(formId));

  const formRecord = agentPayload?.data;
  const formPages = Array.isArray(formRecord?.data) ? formRecord.data : [];
  const companyIdFromUrl = searchParams.get("company_id");
  const rawCompanyId = formRecord?.company_id;
  const companyId =
    (typeof rawCompanyId === "number" && Number.isFinite(rawCompanyId) ? rawCompanyId : undefined) ??
    (companyIdFromUrl != null && companyIdFromUrl !== ""
      ? Number.parseInt(companyIdFromUrl, 10)
      : undefined);

  const rawFdId = formRecord?.fire_department_id as number | string | null | undefined;
  const fireDepartmentId =
    typeof rawFdId === "number" && Number.isFinite(rawFdId)
      ? rawFdId
      : typeof rawFdId === "string" && rawFdId.trim() !== "" && !Number.isNaN(Number(rawFdId))
        ? Number.parseInt(String(rawFdId), 10)
        : undefined;

  const canNavigateToAnalysis =
    typeof fireDepartmentId === "number" &&
    Number.isFinite(fireDepartmentId) &&
    fireDepartmentId > 0 &&
    typeof companyId === "number" &&
    Number.isFinite(companyId);

  const goToAnalysis = () => {
    if (!canNavigateToAnalysis) return;
    navigate(`/apps/analysis/${fireDepartmentId}?company_id=${companyId}`);
  };

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
      (error as { response?: { data?: { message?: string } }; message?: string })?.response?.data
        ?.message ||
      (error as { message?: string })?.message ||
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
              The database is temporarily busy. The page will automatically retry, or you can refresh.
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
          <div className="flex-1" />
          <h2 className="text-2xl font-bold text-center flex-1">Application Form #{formId}</h2>
          <div className="flex-1 flex justify-end">
            <Button variant="contained" color="primary" onClick={() => window.history.back()}>
              Back
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden" style={{ minHeight: 0 }}>
        {formPages.length > 0 && companyId != null && Number.isFinite(companyId) ? (
          <>
            <div className="flex-1 overflow-hidden" style={{ minHeight: 0 }}>
              <MultiPageForm
                companyId={companyId}
                formId={formId}
                formType={formRecord?.type}
                formRecord={formRecord}
                parentOrigin={parentOrigin}
              />
            </div>
            {analyticsUnlocked && (
              <Box
                sx={{
                  flexShrink: 0,
                  borderTop: 1,
                  borderColor: "divider",
                  px: 2,
                  py: 1.5,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: 1,
                  bgcolor: "background.paper",
                }}
              >
                <Typography variant="caption" color="text.secondary">
                  {canNavigateToAnalysis
                    ? "Opens analysis for this form's linked fire department and subscribed company (from Form_Data)."
                    : "This form has no fire_department_id yet; link a fire department (e.g. after approval) to open analysis."}
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  disabled={!canNavigateToAnalysis}
                  onClick={goToAnalysis}
                >
                  View Analytics
                </Button>
              </Box>
            )}
          </>
        ) : (
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-500">No form data available.</p>
          </div>
        )}
      </div>
    </div>
  );
}
