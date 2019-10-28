/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import Checkout from '../checkout';
import { useCheckoutLineItems } from './cart-manager';
import { UpSellCoupon } from './upsell';
import { OrderReview, OrderReviewCollapsed } from './order-review';

// These are used only for non-redirect payment methods
const onSuccess = () => console.log( 'Payment succeeded!' );
const onFailure = error => console.error( 'There was a problem with your payment', error );

// These are used only for redirect payment methods
const successRedirectUrl = window.location.href;
const failureRedirectUrl = window.location.href;

// This is the parent component which would be included on a host page
export default function WPCOMCheckout() {
	const { itemsWithTax, total, deleteItem, changePlanLength } = useCheckoutLineItems();

	// Some parts of the checkout can be customized
	const ReviewContent = () => (
		<OrderReview onDeleteItem={ deleteItem } onChangePlanLength={ changePlanLength } />
	);

	return (
		<Checkout
			locale={ 'US' }
			items={ itemsWithTax }
			total={ total }
			onSuccess={ onSuccess }
			onFailure={ onFailure }
			successRedirectUrl={ successRedirectUrl }
			failureRedirectUrl={ failureRedirectUrl }
			ReviewContent={ ReviewContent }
			paymentData={ { foo: null } }
			dispatchPaymentAction={ () => {
				return;
			} }
		/>
	);
}
