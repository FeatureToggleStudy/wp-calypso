/**
 * Translate a cart object as returned by the WPCOM cart endpoint to
 * the format required by the composite checkout component.
 *
 * @param {object} serverCart Cart object returned by the WPCOM cart endpoint
 *
 * @return {object}
 *   { items:
 *     [ { label: string
 *       , sublabel: string
 *       , type: string
 *       , amount:
 *         { currency: string
 *         , value: int
 *         , displayValue: string
 *         }
 *       }
 *     ]
 *   , total:
 *     { currency: string
 *     , value: int
 *     , displayValue: string
 *     }
 *   }
 */
export function translateWpcomCartToCheckoutCart( serverCart ) {
	const {
		products,
		total_tax_integer,
		total_tax_display,
		total_cost_integer,
		total_cost_display,
		currency,
		allowed_payment_methods,
	} = serverCart;

	const taxLineItem = {
		label: 'Tax',
		type: 'tax', // TODO: does this need to be localized, e.g. tax-us?
		amount: {
			currency: currency,
			value: total_tax_integer,
			displayValue: total_tax_display,
		},
	};

	return {
		items: [ ...products.map( translateWpcomCartItemToCheckoutCartItem ), taxLineItem ],
		total: {
			currency: currency,
			value: total_cost_integer,
			displayValue: total_cost_display,
		},
		allowedPaymentMethods: allowed_payment_methods
			.map( translateWpcomPaymentMethodToCartPaymentMethod )
			.filter( Boolean ),
	};
}

/**
 * Convert a backend cart item to a checkout cart item
 *
 * @param {object} serverItem Cart item object as provided by the backend
 * @return {object}
 *   { label: string
 *   , sublabel: string
 *   , type: string
 *   , amount:
 *     { currency: string
 *     , value: int
 *     , displayValue: string
 *     }
 *   }
 *
 */
function translateWpcomCartItemToCheckoutCartItem( serverItem ) {
	const {
		product_name,
		product_slug,
		currency,
		item_subtotal_integer,
		item_subtotal_display,
		is_domain_registration,
		meta,
	} = serverItem;

	const sublabel = is_domain_registration ? meta : null;

	return {
		label: product_name,
		sublabel: sublabel,
		type: product_slug,
		amount: {
			currency: currency,
			value: item_subtotal_integer,
			displayValue: item_subtotal_display,
		},
	};
}

/**
 * Convert a WPCOM payment method class name to a checkout payment method slug
 *
 * @param {string} paymentMethod WPCOM payment method class name
 * @returns {string} Payment method slug accepted by the checkout component
 */
function translateWpcomPaymentMethodToCartPaymentMethod( paymentMethod ) {
	// TODO: complete this list, and use the correct slugs
	switch ( paymentMethod ) {
		case 'WPCOM_Billing_Stripe_Payment_Method':
			return 'card';
		case 'WPCOM_Billing_Ebanx':
			return 'ebanx';
		case 'WPCOM_Billing_Web_Payment':
			return 'apple-pay';
	}
}
