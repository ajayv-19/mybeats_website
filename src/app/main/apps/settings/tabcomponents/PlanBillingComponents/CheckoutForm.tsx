import { Button } from '@mui/material';
import { PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { ReactElement } from 'react';

interface CheckoutFormProps {
	clientSecret: string;
}

function CheckoutForm({ clientSecret }: CheckoutFormProps): ReactElement {
	const stripe = useStripe();
	const elements = useElements();

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		if (elements == null || stripe == null) {
			return;
		}

		// Trigger form validation and wallet collection
		const { error: submitError } = await elements.submit();

		if (submitError) console.error(submitError);

		const { error } = await stripe.confirmPayment({
			// `Elements` instance that was used to create the Payment Element
			elements,
			clientSecret,
			confirmParams: {
				return_url: `${window.location.origin}/apps/settings/account`
			}
		});

		if (error) {
			console.error('Something went wrong when paying', error);
		}
	};

	return (
		<form onSubmit={handleSubmit}>
			<PaymentElement />

			<div className="mt-32">
				<Button
					variant="contained"
					color="secondary"
					type="submit"
				>
					Submit
				</Button>
			</div>
		</form>
	);
}

export default CheckoutForm;
