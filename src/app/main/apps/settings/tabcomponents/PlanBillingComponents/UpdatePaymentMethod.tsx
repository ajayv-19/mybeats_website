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
            console.log('Submitting payment method update...');
            console.log({ paymentType, clientSecret, stripe, elements });
            // return setLoading(false);
            let result = await stripe.confirmSetup({
                elements,
                confirmParams: {
                    // return_url: window.location.href,
                    return_url: `${window.location.origin}/apps/settings/team`,
                },
                clientSecret,
            });

            if (result.error) {
                console.error('Error confirming setup:', result.error);
                setMessage(result.error.message);
                setLoading(false);
                return;
            }
            console.log('Payment method updated successfully:', result);
            const paymentMethodId = 1;

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
            console.error('Error updating payment method:', err);
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
            <div className="p-2 border rounded">
                <PaymentElement />
            </div>

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