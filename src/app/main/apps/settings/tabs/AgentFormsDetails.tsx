import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAgentForm } from '../apis/AgentFormsapis';
import filedsMapping from './_data/fileds_mapping';
import axios from 'axios';

function MultiPageForm(props) {
    const { formsData, companyId, formId } = props;
    const [currentPage, setCurrentPage] = useState(0);
    const [iframeKey, setIframeKey] = useState(0);

    const currentForm = formsData[currentPage];
    const items = Object.entries(currentForm.data || {});
    const mappedLabels = filedsMapping[companyId] || {};

    // Change this to your production domain when ready
    // const brokerDomain = "https://broker.mybeatshealth.com/"
    const brokerDomain = "http://localhost:5173/"

    // Updated URL with proper parameters
    const docurl = `${brokerDomain}agent_forms/${companyId}/form.html?editFormId=${formId}&isReadOnly=true&isHideButtons=true`;

    // Force iframe reload when formId changes
    useEffect(() => {
        setIframeKey(prev => prev + 1);
    }, [formId]);

    console.log({ formsData, companyId, docurl }, "formdata, companyid, and iframe url");

    return (
        <div className='max-w-full h-screen flex'>

            {/* Iframe Panel */}
            <div className='flex-1'>
                <iframe
                    key={iframeKey}
                    className='w-full h-full border-0'
                    src={docurl}
                    title={`Form ${formId}`}
                    onLoad={() => console.log('Iframe loaded successfully')}
                    onError={() => console.error('Iframe failed to load')}
                />
            </div>
        </div>
    );
}

export default function AgentFormsDetails() {
    const { formId } = useParams();
    const { data: agentForm, isLoading, error } = useAgentForm(Number(formId));

    console.log('AgentFormsDetails agentForm:', agentForm, isLoading, error);

    const formPages = isLoading ? [] : agentForm?.data?.data || [];
    const companyId = agentForm?.data?.company_id;

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
        return (
            <div className="flex flex-col flex-1 p-24">
                <div className="text-red-600">
                    <h2 className="text-xl font-bold mb-2">Error Loading Form</h2>
                    <p>Unable to load form data. Please try again later.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col flex-1">
            <div className="p-6 border-b">
                <h2 className="text-2xl font-bold">Agent Form Details</h2>
                <p className="text-gray-600 mt-1">Form ID: {formId} | Company ID: {companyId}</p>
            </div>

            <div className="flex-1">
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
            </div>
        </div>
    );
}