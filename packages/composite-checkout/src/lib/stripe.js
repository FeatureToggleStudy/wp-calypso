/**
 * External dependencies
 */
import React, { useEffect, useState, useContext, createContext } from 'react';
import { injectStripe, StripeProvider, Elements } from 'react-stripe-elements';

/**
 * Internal dependencies
 */
import { usePaymentData } from '../public-api';

const StripeContext = createContext();

/**
 * An error for display by the payment form
 *
 * On top of the standard `message` string property, this error will include
 * the `code` property.
 *
 * This object also includes a `messagesByField` property which can be used to
 * find which error was for which input field.
 *
 * @param {string} code - The error code
 * @param {object} messagesByField - An object whose keys are input field names and whose values are arrays of error strings for that field
 */
function StripeValidationError( code, messagesByField ) {
	const fields = Object.keys( messagesByField );
	const firstMessage = fields.length ? messagesByField[ fields[ 0 ] ] : code;
	this.message = firstMessage;
	this.code = code;
	this.messagesByField = messagesByField;
}
StripeValidationError.prototype = new Error();
export { StripeValidationError };

/**
 * An error related to a Stripe PaymentMethod
 *
 * The object will include the original stripe error in the stripeError prop.
 *
 * @param {object} stripeError - The original Stripe error object
 */
function StripePaymentMethodError( stripeError ) {
	this.stripeError = stripeError;
	this.message = stripeError.message;
}
StripePaymentMethodError.prototype = new Error();
export { StripePaymentMethodError };

/**
 * Create a Stripe PaymentMethod using Stripe Elements
 *
 * paymentDetails should include data not gathered by Stripe Elements. For
 * example, `name` (string), `address` (object with `country` [string] and
 * `postal_code` [string]).
 *
 * On success, the Promise will be resolved with an object that contains the
 * PaymentMethod token in the `id` field.
 *
 * If there is an error, it will include a `message` field which can be used to
 * display the error. It will also include a `type` and possibly other fields
 * depending on the type. For example, validation errors should be type
 * `validation_error` and have a `code` property which might be something like
 * `incomplete_cvc`.
 *
 * @param {object} stripe The stripe object with payment data included
 * @param {object} paymentDetails The `billing_details` field of the `createPaymentMethod()` request
 * @return {Promise} Promise that will be resolved or rejected
 */
export async function createStripePaymentMethod( stripe, paymentDetails ) {
	const { paymentMethod, error } = await stripe.createPaymentMethod( 'card', {
		billing_details: paymentDetails,
	} );
	if ( error ) {
		// Note that this is a promise rejection
		if ( error.type === 'validation_error' ) {
			throw new StripeValidationError(
				error.code,
				getValidationErrorsFromStripeError( error ) || {}
			);
		}
		throw new Error( error.message );
	}
	return paymentMethod;
}

/**
 * Confirm any PaymentIntent from Stripe response and carry out 3DS or
 * other next_actions if they are required.
 *
 * If there is an error, it will include a `message` field which can be used to
 * display the error. It will also include a `type` and possibly other fields
 * depending on the type.
 *
 * @param {object} stripeConfiguration The data from the Stripe Configuration endpoint
 * @param {string} paymentIntentClientSecret The client secret of the PaymentIntent
 * @return {Promise} Promise that will be resolved or rejected
 */
export async function confirmStripePaymentIntent( stripeConfiguration, paymentIntentClientSecret ) {
	// Setup a stripe instance that is disconnected from our Elements
	// Otherwise, we'll create another paymentMethod, which we don't want
	const standAloneStripe = window.Stripe( stripeConfiguration.public_key );

	const { paymentIntent, error } = await standAloneStripe.handleCardPayment(
		paymentIntentClientSecret,
		{}
	);
	if ( error ) {
		// Note that this is a promise rejection
		throw new StripePaymentMethodError( error );
	}

	return paymentIntent;
}

/**
 * Extract validation errors from a Stripe error
 *
 * Returns null if validation errors cannot be found.
 *
 * @param {object} error An error returned by a Stripe function like createPaymentMethod
 * @return {object | null} An object keyed by input field name whose values are arrays of error strings for that field
 */
function getValidationErrorsFromStripeError( error ) {
	if ( error.type !== 'validation_error' || ! error.code ) {
		return null;
	}
	switch ( error.code ) {
		case 'incomplete_number':
		case 'invalid_number':
			return {
				card_number: [ error.message ],
			};
		case 'incomplete_cvc':
		case 'invalid_cvc':
			return {
				card_cvc: [ error.message ],
			};
		case 'incomplete_expiry':
		case 'invalid_expiry':
			return {
				card_expiry: [ error.message ],
			};
	}
	return null;
}

/**
 * React custom Hook for loading stripeJs
 *
 * This is internal. You probably actually want the useStripe hook.
 *
 * Its parameter is the value returned by useStripeConfiguration
 *
 * @param {object} stripeConfiguration An object containing { public_key, js_url }
 * @return {object} { stripeJs, isStripeLoading }
 */
function useStripeJs( stripeConfiguration ) {
	const [ stripeJs, setStripeJs ] = useState( null );
	const [ isStripeLoading, setStripeLoading ] = useState( true );
	const [ stripeLoadingError, setStripeLoadingError ] = useState();
	useEffect( () => {
		let isSubscribed = true;
		async function loadAndInitStripe() {
			if ( ! stripeConfiguration ) {
				return;
			}
			if ( window.Stripe ) {
				setStripeLoading( false );
				if ( ! stripeJs ) {
					setStripeLoadingError();
					setStripeJs( window.Stripe( stripeConfiguration.public_key ) );
				}
				return;
			}
			await loadScriptAsync( stripeConfiguration.js_url );
			isSubscribed && setStripeLoading( false );
			isSubscribed && setStripeLoadingError();
			isSubscribed && setStripeJs( window.Stripe( stripeConfiguration.public_key ) );
		}

		loadAndInitStripe().catch( error => {
			isSubscribed && setStripeLoading( false );
			isSubscribed && setStripeLoadingError( error );
		} );

		return () => ( isSubscribed = false );
	}, [ stripeConfiguration, stripeJs ] );
	return { stripeJs, isStripeLoading, stripeLoadingError };
}

function loadScriptAsync( url ) {
	return new Promise( ( resolve, reject ) => {
		const scriptTag = document.createElement( 'script' );
		scriptTag.type = 'text/javascript';
		scriptTag.src = url;
		scriptTag.onload = resolve;
		scriptTag.onerror = reject;
		document.body.appendChild( scriptTag );
	} );
}

/**
 * React custom Hook for loading the Stripe Configuration
 *
 * This is internal. You probably actually want the useStripe hook.
 *
 * Returns an object with two properties: `stripeConfiguration`, and
 * `forceReload`.
 *
 * `stripeConfiguration` is an object as returned by the stripe configuration
 * endpoint, possibly including a Setup Intent if one was requested (via
 * `needs_intent`).
 *
 * If there is a stripe error, it may be necessary to reload the configuration
 * since (for example) a Setup Intent may need to be recreated. You can force
 * the configuration to reload by calling `forceReload()`.
 *
 * @param {object} requestArgs (optional) Can include `country` or `needs_intent`
 * @return {object} See above
 */
function useStripeConfiguration( requestArgs ) {
	const [ currentAttempt, setAttempt ] = useState( 1 );
	const [ paymentData, dispatch ] = usePaymentData();
	useEffect( () => {
		dispatch( { type: 'STRIPE_CONFIGURATION_FETCH', payload: requestArgs || {} } );
	}, [ requestArgs, currentAttempt, dispatch ] );
	const forceReload = () => setAttempt( currentAttempt + 1 );
	const stripeConfiguration = paymentData.stripeConfiguration || null;
	return { stripeConfiguration, forceReload };
}

function StripeHookProviderInnerWrapper( { stripe, stripeData, children } ) {
	const updatedStripeData = { ...stripeData, stripe };
	return <StripeContext.Provider value={ updatedStripeData }>{ children }</StripeContext.Provider>;
}
const StripeInjectedWrapper = injectStripe( StripeHookProviderInnerWrapper );

/**
 * Custom Provider to access Stripe.js
 *
 * First you must wrap a parent component in this Provider. Then you can call
 * `useStripe()` in any sub-component to get access to the stripe variables and
 * functions. See `useStripe` for more details.
 *
 * This has one optional prop, `configurationArgs`, which is an object that
 * will be used when fetching the stripe configuration.
 *
 * @return {object} React element
 */
export function StripeHookProvider( { children, configurationArgs } ) {
	const { stripeConfiguration, forceReload } = useStripeConfiguration( configurationArgs );
	const { stripeJs, isStripeLoading, stripeLoadingError } = useStripeJs( stripeConfiguration );

	const stripeData = {
		stripe: null, // This must be set inside the injected component
		stripeConfiguration,
		isStripeLoading,
		stripeLoadingError,
		forceReload,
	};

	return (
		<StripeProvider stripe={ stripeJs }>
			<Elements>
				<StripeInjectedWrapper stripeData={ stripeData }>{ children }</StripeInjectedWrapper>
			</Elements>
		</StripeProvider>
	);
}

/**
 * Custom hook to access Stripe.js
 *
 * First you must wrap a parent component in `StripeHookProvider`. Then you can
 * call this hook in any sub-component to get access to the stripe variables
 * and functions.
 *
 * This returns an object with the following properties:
 *
 * - stripe: the instance of the stripe library
 * - stripeConfiguration: the object containing the data returned by the wpcom stripe configuration endpoint
 * - isStripeLoading: a boolean that is true if stripe is currently being loaded
 * - stripeLoadingError: an optional object that will be set if there is an error loading stripe
 * - forceReload: a function that can be called to force the stripe configuration to reload
 *
 * @return {object} See above
 */
export function useStripe() {
	const stripeData = useContext( StripeContext );
	return (
		stripeData || {
			stripe: null,
			stripeConfiguration: null,
			isStripeLoading: false,
			stripeLoadingError: null,
			forceReload: () => {},
		}
	);
}
