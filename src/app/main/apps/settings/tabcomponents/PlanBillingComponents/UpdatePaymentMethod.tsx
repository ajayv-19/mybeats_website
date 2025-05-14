import React, { useState, useEffect } from 'react';
import {
    useStripe,
    useElements,
    CardElement,
    PaymentElement,
} from '@stripe/react-stripe-js';
import { useSelector } from 'react-redux';
import { selectAccount } from "src/app/features/account/accountSlice";
import axios from 'axios';
import { fetchAuthSession } from "@aws-amplify/auth";

function UpdatePaymentMethodForm(props) {
    const { subscription, customer, stripePromise, clientSecret } = props;
    const stripe = useStripe();
    const elements = useElements();
    const { user } = useSelector(selectAccount);
    const email = user?.email;

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState('');
    const [paymentType, setPaymentType] = useState('card');
    const customerId = customer?.id;

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!stripe || !elements || !email) {
            setMessage('Stripe is not ready or email is missing.');
            return;
        }

        setLoading(true);
        setMessage('');

        try {

            let result;
            if (paymentType === 'card') {
                result = await stripe.confirmCardSetup(clientSecret, {
                    payment_method: {
                        card: elements.getElement(CardElement),
                        billing_details: { email },
                    },
                });
            } else {
                result = await stripe.confirmSetup({
                    elements,
                    confirmParams: {
                        return_url: window.location.href,
                    },
                    clientSecret,
                });
            }

            if (result.error) {
                setMessage(result.error.message);
                setLoading(false);
                return;
            }

            const paymentMethodId =
                result.setupIntent?.payment_method || result.paymentMethod?.id;

            const subscriptionId = subscription.sub_id; // Replace with actual

            const updateResponse = await axios.post('/update-payment-method', {
                customerId,
                paymentMethodId,
                subscriptionId,
            });

            if (updateResponse.status === 200) {
                setMessage('Payment method updated successfully.');
            } else {
                setMessage(updateResponse.data.error || 'Failed to update payment method.');
            }
        } catch (err) {
            // Error already handled in handleSetupIntent
        }

        setLoading(false);
    };

    if (loading) {
        return <div className="text-center">Loading...</div>;
    }

    if (error) {
        return (
            <div className="text-red-600 text-center">
                {message}
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-md max-w-md mx-auto">
            <div>
                <label className="block font-medium mb-1">Choose Payment Method:</label>
                <select
                    value={paymentType}
                    onChange={(e) => setPaymentType(e.target.value)}
                    className="w-full border p-2 rounded"
                >
                    <option value="card">Card</option>
                    <option value="bank">Bank</option>
                </select>
            </div>


            {paymentType === 'card' && (
                <div className="p-2 border rounded">
                    <CardElement options={{ hidePostalCode: true }} />
                </div>
            )}

            {paymentType === 'bank' && (
                <div className="p-2 border rounded">
                    <PaymentElement />
                </div>
            )}

            <button
                type="submit"
                disabled={loading || !stripe || !email}
                className="w-full bg-blue-600 text-white py-2 rounded disabled:opacity-50"
            >
                {loading ? 'Updating...' : 'Update Payment Method'}
            </button>

            {message && <div className="mt-2 text-sm text-red-600">{message}</div>}
        </form>
    );
}

export default UpdatePaymentMethodForm;