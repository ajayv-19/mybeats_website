import React, { useState } from 'react';
import {
    useStripe,
    useElements,
    PaymentElement,
} from '@stripe/react-stripe-js';
import { useSelector } from 'react-redux';
import { selectAccount } from 'src/app/features/account/accountSlice';
import axios from 'src/app/constant/axios';
import { toast } from 'sonner';

function UpdatePaymentMethodForm(props) {
    const { subscription, customer, clientSecret } = props;
    const stripe = useStripe();
    const elements = useElements();
    const { user } = useSelector(selectAccount);
    const email = user?.email;

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();
        setMessage('');

        if (!stripe || !elements || !email) {
            setMessage('Stripe is not ready or email is missing.');
            return;
        }

        setLoading(true);

        try {
            const { error: submitError } = await elements.submit();
            if (submitError) {
                setMessage(submitError.message);
                setLoading(false);
                return;
            }

            const result: any = await stripe.confirmSetup({
                elements,
                confirmParams: {
                    return_url: `${window.location.origin}/apps/settings/team`,
                },
                clientSecret,
                redirect: 'if_required',
            });
            console.log('Stripe result:', result);
            if (result.error) {
                setMessage(result.error.message);
                setLoading(false);
                return;
            }

            const paymentMethodId = result.setupIntent?.payment_method;
            if (!paymentMethodId) {
                setMessage('Failed to retrieve payment method.');
                setLoading(false);
                return;
            }

            const subscriptionId = subscription.sub_id;
            const customerId = customer?.id;

            console.log('Payment Method ID:', paymentMethodId);
            const updateResponse = await axios.post('https://b89ns5qxe2.execute-api.us-east-1.amazonaws.com/dev/backendapi/update-payment-methods', {
                customerId,
                paymentMethodId,
                subscriptionId,
            });

            if (updateResponse?.data?.success) {
                toast.success('Payment method updated successfully.');
                setTimeout(() => {
                    window.location.href = `${window.location.origin}/apps/settings/team`;
                }, 1000);
                setMessage('');
            } else {
                setMessage(updateResponse?.data?.error || 'Failed to update payment method.');
            }
        } catch (err) {
            console.error('Error updating payment method:', err);
            setMessage('Unexpected error occurred.');
        }

        setLoading(false);
    };

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

            {message && (
                <div className="mt-2 text-sm text-red-600 text-center">{message}</div>
            )}
        </form>
    );
}

export default UpdatePaymentMethodForm;