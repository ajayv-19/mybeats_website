import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAgentForm } from '../apis/AgentFormsapis';
import filedsMapping from './_data/fileds_mapping';

function MultiPageForm(props) {
    const { formsData, companyId } = props;
    const [currentPage, setCurrentPage] = useState(0);
    const currentForm = formsData[currentPage];
    const items = Object.entries(currentForm.data || {});
    const mappedLabels = filedsMapping[companyId] || {};

    return (
        <div className="p-4 max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">{currentForm.title}</h1>
            <form className="space-y-4">
                {items.map(([key, value], idx) => (
                    <div key={idx} className="grid grid-cols-2 gap-2">
                        <label className="font-semibold mb-1">{mappedLabels[key] || key}</label>
                        <input
                            type="text"
                            value={value + ''}
                            readOnly
                            className="p-2 border rounded-md"
                        />
                    </div>
                ))}
            </form>
            <div className="flex justify-between mt-6">
                <button
                    onClick={() => setCurrentPage(p => Math.max(p - 1, 0))}
                    disabled={currentPage === 0}
                    className="px-4 py-2 rounded bg-gray-300 disabled:opacity-50"
                >
                    Previous
                </button>
                <button
                    onClick={() => setCurrentPage(p => Math.min(p + 1, formsData.length - 1))}
                    disabled={currentPage === formsData.length - 1}
                    className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50"
                >
                    Next
                </button>
            </div>
        </div>
    );
}


export default function AgentFormsDetails() {
    const formId = useParams().formId;
    const { data: agentForm, isLoading } = useAgentForm(Number(formId));
    console.log('AgentFormsDetails agentForm:', agentForm, isLoading);
    const formPages = isLoading ? [] : agentForm?.data?.data || [];
    const companyId = agentForm?.data?.company_id;
    return (
        <div className="flex flex-col flex-1 p-24">
            <h2 className="text-2xl font-bold mb-4">Agent Form Details</h2>
            <p className="mb-4">This is where the details of the selected agent form will be displayed.</p>
            {isLoading ? (
                <p>Loading...</p>
            ) : (
                <div>
                    {formPages.length > 0 ? (
                        <MultiPageForm formsData={formPages} companyId={companyId} />
                    ) : (
                        <p>No form data available.</p>
                    )}
                </div>
            )}
        </div>
    );
}