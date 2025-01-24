import { PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import axios from 'axios';
import React from 'react';

interface CheckoutFormProps {
	clientSecret: string;
}

function CheckoutForm({ clientSecret }): React.FC<CheckoutFormProps> {
  const stripe = useStripe();
  const elements = useElements();

	const handleSubmit = async (event) => {
		event.preventDefault();

		if (elements == null || stripe == null) {
			return;
		}

		// Trigger form validation and wallet collection
		const { error: submitError } = await elements.submit();

    console.log("submit error", submitError);

		const { error } = await stripe.confirmPayment({
			// `Elements` instance that was used to create the Payment Element
			elements,
			clientSecret,
			confirmParams: {
				return_url: `${window.location.origin}/success`
			}
		});

		await axios.post("url/success", )

		if (error) {
			// This point will only be reached if there is an immediate error when
			// confirming the payment. Show error to your customer (for example, payment
			// details incomplete)
      console.log("error confirm payment", error);
		} else {
			// Your customer will be redirected to your `return_url`. For some payment
			// methods like iDEAL, your customer will be redirected to an intermediate
			// site first to authorize the payment, then redirected to the `return_url`.
		}
	};

	return (
		<form onSubmit={handleSubmit}>
			<PaymentElement />
			<button>Submit</button>
		</form>
	);
}

export default CheckoutForm;
