import React from 'react';
import { Typography } from '@mui/material';
export const UpdateModel = ({ data }) => {
    const { user, company, plan, subscription, isactive, control, plans } = data;
    const currentPlan = plans.find((plan) => plan.id === control?._formValues.plan_id);
    const addedCount = control?._formValues?.policyholder_count - company?.policyholder_count;
    const nextPricing = control?._formValues?.policyholderCount * currentPlan?.pricing;
    console.log({ control, plan, subscription, currentPlan }, "plan_id:", control?.plan_id);
    return (
        <div className="flex flex-col gap-32">
            <Typography>
                Are you sure you want to update your subscription?
            </Typography>
            <Typography>
                You will be charged {currentPlan?.pricing} for the next billing cycle.
                From next billing cycle, you will be charged {nextPricing} for the next billing cycle.
            </Typography>
        </div>
    );
}

export const CancelModel = ({ data }) => {
    const { user, company, plan, subscription, isactive } = data;
    return (
        <div className="flex flex-col gap-32">
            <Typography variant="h6" className="font-bold">
                Cancel Model
            </Typography>
            <Typography>
                Are you sure you want to cancel your subscription?
            </Typography>
        </div>
    );
}

export const SubscribModel = ({ data }) => {
    const { user, company, plan, subscription, isactive } = data;
    return (
        <div className="flex flex-col gap-32">
            <Typography variant="h6" className="font-bold">
                Subscribe Model
            </Typography>
            <Typography>
                Are you sure you want to subscribe to this plan?
            </Typography>
        </div>
    );
}

export default {
    "update": UpdateModel,
    "cancel": CancelModel,
    "next": SubscribModel
}