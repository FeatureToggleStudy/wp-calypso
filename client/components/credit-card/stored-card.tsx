/**
 * External dependencies
 */
import React, { FunctionComponent } from 'react';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { useLocalizedMoment } from 'components/localized-moment';

/**
 * Style dependencies
 */
import './stored-card.scss';

const getCreditCardSummary = (
	translate: ReturnType< typeof useTranslate >,
	type: string,
	digits?: Props[ 'lastDigits' ]
) => {
	let displayType: string;
	switch ( type && type.toLocaleLowerCase() ) {
		case 'american express':
		case 'amex':
			displayType = translate( 'American Express' );
			break;

		case 'diners':
			displayType = translate( 'Diners Club' );
			break;

		case 'discover':
			displayType = translate( 'Discover' );
			break;

		case 'jcb':
			displayType = translate( 'JCB' );
			break;

		case 'mastercard':
			displayType = translate( 'Mastercard' );
			break;

		case 'unionpay':
			displayType = translate( 'UnionPay' );
			break;

		case 'visa':
			displayType = translate( 'VISA' );
			break;

		default:
			displayType = type;
	}

	if ( ! digits ) {
		return displayType;
	}

	return translate( '%(displayType)s ****%(digits)s', {
		args: { displayType, digits },
	} );
};

interface Props {
	lastDigits?: string;
	cardType: string;
	name: string;
	expiry?: string;
}

const StoredCard: FunctionComponent< Props > = ( { lastDigits, cardType, name, expiry } ) => {
	const translate = useTranslate();
	const moment = useLocalizedMoment();

	// The use of `MM/YY` should not be localized as it is an ISO standard across credit card forms: https://en.wikipedia.org/wiki/ISO/IEC_7813
	const expirationDate = expiry ? moment( expiry, moment.ISO_8601, true ).format( 'MM/YY' ) : null;

	const type = cardType && cardType.toLocaleLowerCase();
	const cardClasses = classNames( 'credit-card__stored-card', {
		'is-amex': type === 'amex' || type === 'american express',
		'is-diners': type === 'diners',
		'is-discover': type === 'discover',
		'is-jcb': type === 'jcb',
		'is-mastercard': type === 'mastercard',
		'is-unionpay': type === 'unionpay',
		'is-visa': type === 'visa',
	} );

	return (
		<div className={ cardClasses }>
			<span className="credit-card__stored-card-number">
				{ getCreditCardSummary( translate, cardType, lastDigits ) }
			</span>
			<span className="credit-card__stored-card-name">{ name }</span>
			<span className="credit-card__stored-card-expiration-date">
				{ expirationDate &&
					translate( 'Expires %(date)s', {
						args: { date: expirationDate },
						context: 'date is of the form MM/YY',
					} ) }
			</span>
		</div>
	);
};

export default StoredCard;
