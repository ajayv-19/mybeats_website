import React, { useEffect } from 'react';
import { useState } from 'react';
import { useAgentForms } from '../apis/AgentFormsapis';
import {
    TableContainer,
    Table,
} from '@mui/material';
import { Link } from 'react-router-dom';
import { fetchAuthSession } from "@aws-amplify/auth";

export default function AgentFormsTab() {
    const [state, setState] = useState({
        mounted: false,
        agentForms: [],
        loading: true,
        error: null,
        company_id: 496,
        page: 1,
        search: '',
        user: null
    });

    useEffect(() => {
        setState((prevState) => ({
            ...prevState,
            mounted: true
        }));
        fetchAuthSession().then((session) => {
            const user = session;
            console.log('AgentFormsTab user:', user);
        });
    }, []);

    const agentForms = useAgentForms(state.company_id, state.page, state.search);
    useEffect(() => {
        setState((prevState) => ({
            ...prevState,
            loading: agentForms.isLoading,
            agentForms: agentForms.data?.data || [],
            error: agentForms.error
        }));
    }, [agentForms.data]);

    //console.log('AgentFormsTab state:', state, agentForms);
    return (
        <div className="flex flex-col flex-1 p-24">
            <TableContainer className="flex-1">
                <Table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Created At</th>
                            <th>Updated At</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {state.agentForms.map((form) => (
                            <tr key={form.id}>
                                <td>{form.id}</td>
                                <td>{form.name}</td>
                                <td>{new Date(form.created_at).toLocaleDateString()}</td>
                                <td>{new Date(form.updated_at).toLocaleDateString()}</td>
                                <td>
                                    <Link to={`/apps/settings/agent-form/${form.id}`} target='__blank' >
                                        <button className="btn btn-primary">
                                            View Details
                                        </button>
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </TableContainer>
        </div>
    );
}