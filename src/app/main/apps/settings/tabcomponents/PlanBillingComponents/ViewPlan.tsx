import { Button } from "@mui/material";
import { Check } from '@mui/icons-material'
import { Typography } from '@mui/material'
import { Paper } from "@mui/material";
import React from 'react'
import { useSelector } from 'react-redux'
import { fetchAccountDetails, selectAccount } from "src/app/features/account/accountSlice";

const ViewPlan = ({ handleEdit }) => {
    const { user, company, plan, subscription, isactive } = useSelector(selectAccount);


    return (
        <div className="mt-32 grid w-full gap-16 sm:grid-cols-2">
            <Paper
                sx={{
                    "&.selected": {
                        border: (theme) => `3px solid ${theme.palette.secondary.main}`,
                        boxShadow: (theme) => theme.shadows[6],
                    },
                    transition: "all 0.3s ease-in-out",
                    "&:hover": {
                        transform: "scale(1.02)",
                        boxShadow: (theme) => theme.shadows[8],
                    },
                }}
                className="flex flex-1 cursor-pointer flex-col items-start justify-start rounded-md p-24 border-3 border-transparent relative"
                key={plan?.id} // ✅ Key should also be based on `id`
            >
                {/* Top Right Edit Button */}
                <div className="absolute right-0 top-0 mr-12 mt-12">
                    <Button
                        variant="contained"
                        color="secondary"
                        onClick={() => handleEdit()} // Replace with your edit handler function
                    >
                        Edit
                    </Button>
                </div>


                {/* Plan Name */}
                <Typography
                    className="font-semibold uppercase"
                    variant="h6"
                    gutterBottom
                >
                    {plan?.name}
                </Typography>


                {/* Plan Description */}
                <Typography
                    className="mb-4"
                    color="text.secondary"
                    variant="body2"
                    gutterBottom
                >
                    {plan?.description}
                </Typography>


                {/* Current Plan Label */}
                {/* <div className="text-sm font-bold text-green-600 mb-8">
       Current Plan
     </div> */}


                {/* Paid Amount */}
                <Typography
                    className="mb-4 flex items-center"
                    color="text.secondary"
                    variant="body2"
                >
                    <label className="text-sm font-medium">Current Plan Amount:</label>
                    <span className="ml-4 font-bold text-primary">
                        ${subscription?.amount || 0} / month
                    </span>
                </Typography>




                {/* Policy Holder Count */}
                <Typography
                    className="mb-4 flex items-center"
                    color="text.secondary"
                    variant="body2"
                >
                    <label className="text-sm font-medium">Number of Policyholders:</label>
                    <span className="ml-4 font-bold text-primary">
                        {company?.policyholder_count || 0}
                    </span>


                </Typography>


                {/* Policy Expiry Date */}
                <Typography
                    className="mb-4 flex items-center"
                    color="text.secondary"
                    variant="body2"
                >
                    <label className="text-sm font-medium">Next pay date:</label>
                    <span className="ml-4 font-bold text-primary">
                        {new Date(subscription?.bill_end).toLocaleDateString() || ""}
                    </span>
                </Typography>




                {/* Pricing */}
                <div className="flex items-end mt-8 text-lg">
                    <Typography variant="h6" className="font-bold">
                        {plan?.pricing.toLocaleString("en-US", {
                            style: "currency",
                            currency: "USD",
                        })}
                    </Typography>
                    <Typography color="text.secondary" variant="body2" className="ml-2">
                        / policyholder
                    </Typography>
                </div>


                {/* Feature Description */}
                <div className="mt-32">
                    {plan?.feature_description.split("\n").map((point, index) => (
                        <div className="flex gap-4 items-start" key={index}>
                            <Check className="text-green-500" />
                            <Typography variant="body2" color="text.secondary">
                                {point}
                            </Typography>
                        </div>
                    ))}
                </div>
            </Paper>
        </div>
    )
}

export default ViewPlan
