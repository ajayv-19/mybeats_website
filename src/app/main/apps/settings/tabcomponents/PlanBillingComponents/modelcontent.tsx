import React from 'react';
import { Typography, Card, CardContent, Divider } from '@mui/material';

export const UpdateModel = ({ data }) => {
    const { user, company, plan, subscription, isactive, control, plans } = data;
    const currentPlan = plans.find((plan) => plan.id === control?._formValues.plan_id);
    console.log(currentPlan, "currentPlan");
    const addedCount = control?._formValues?.policyholderCount - company?.policyholder_count;
    const nextPricing = control?._formValues?.policyholderCount * currentPlan?.pricing;
    console.log(control?._formValues?.policyholderCount, "control?._formValues?.policyholder_count");
    return (
        <Card elevation={3} className="p-24">
            <CardContent>
                <Typography variant="h5" className="font-bold mb-16" color="primary">
                    Update Subscription
                </Typography>
                <Typography variant="body1" className="mb-16">
                    Are you sure you want to update your subscription?
                </Typography>
                <Divider className="mb-16" />
                <Typography variant="body2" className="mb-8">
                    <strong>Current Plan:</strong> {currentPlan?.name || "N/A"}
                </Typography>
                <Typography variant="body2" className="mb-8">
                    <strong>Policyholder Count:</strong> {control?._formValues?.policyholderCount || 0}
                </Typography>
                <Typography variant="body2" className="mb-8">
                    <strong>Added Policyholders:</strong> {addedCount > 0 ? addedCount : 0}
                </Typography>
                <Typography variant="body2" className="mb-8">
                    <strong>Current Pricing:</strong> ${currentPlan?.pricing || 0} per policyholder
                </Typography>
                <Typography variant="body2">
                    <strong>Total Next Billing Cycle Pricing:</strong> ${nextPricing || 0}
                </Typography>
            </CardContent>
        </Card>
    );
};

export const CancelModel = ({ data }) => {
    const { user, company, plan, subscription, isactive } = data;

    return (
        <Card elevation={3} className="p-24">
            <CardContent>
                <Typography variant="h5" className="font-bold mb-16" color="error">
                    Cancel Subscription
                </Typography>
                <Typography variant="body1" className="mb-16">
                    Are you sure you want to cancel your subscription?
                </Typography>
                <Divider className="mb-16" />
                <Typography variant="body2" className="mb-8">
                    <strong>Current Plan:</strong> {plan?.name || "N/A"}
                </Typography>
                <Typography variant="body2" className="mb-8">
                    <strong>Policyholder Count:</strong> {company?.policyholder_count || 0}
                </Typography>
                <Typography variant="body2">
                    <strong>Subscription Status:</strong> {subscription?.status || "N/A"}
                </Typography>
            </CardContent>
        </Card>
    );
};

export const SubscribModel = ({ data }) => {
    const { user, company, plan, subscription, isactive, control, plans } = data;
    const selectedPlan = plans.find((plan) => plan.id === control?._formValues.plan_id);
    const totalPricing = control?._formValues?.policyholderCount * selectedPlan?.pricing;

    return (
        <Card elevation={3} className="p-24">
            <CardContent>
                <Typography variant="h5" className="font-bold mb-16" color="secondary">
                    Subscribe to Plan
                </Typography>
                <Typography variant="body1" className="mb-16">
                    Are you sure you want to subscribe to the <strong>{selectedPlan?.name || "N/A"}</strong> plan?
                </Typography>
                <Divider className="mb-16" />
                <Typography variant="body2" className="mb-8">
                    <strong>Policyholder Count:</strong> {control?._formValues?.policyholderCount || 0}
                </Typography>
                <Typography variant="body2" className="mb-8">
                    <strong>Pricing per Policyholder:</strong> ${selectedPlan?.pricing || 0}
                </Typography>
                <Typography variant="body2">
                    <strong>Total Pricing for Next Billing Cycle:</strong> ${totalPricing || 0}
                </Typography>
            </CardContent>
        </Card>
    );
};

export default {
    update: UpdateModel,
    cancel: CancelModel,
    next: SubscribModel,
};