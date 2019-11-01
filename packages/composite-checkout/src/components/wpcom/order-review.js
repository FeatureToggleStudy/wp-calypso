/**
 * External dependencies
 */
import React from 'react';

import { PlanItem, DomainItem } from './items';
import {
	OrderReviewSection,
	OrderReviewLineItems,
	OrderReviewTotal,
} from '../order-review-line-items';

/**
 * Internal dependencies
 */
import { useLineItems } from '../../public-api';

export function OrderReview( { onDeleteItem, onChangePlanLength } ) {
	const [ items, total ] = useLineItems();
	const planItems = items.filter( item => item.type === 'plan' );
	const domainItems = items.filter( item => item.type === 'domain' );
	const taxItems = items.filter( item => item.type === 'tax' );
	const miscItems = items.filter( item => ! [ 'plan', 'domain', 'tax' ].includes( item.type ) );

	return (
		<React.Fragment>
			<OrderReviewSection>
				{ planItems.map( plan => (
					<PlanItem
						key={ plan.id }
						plan={ plan }
						onDeleteItem={ onDeleteItem }
						onChangePlanLength={ onChangePlanLength }
					/>
				) ) }
				<OrderReviewLineItems items={ miscItems } />
			</OrderReviewSection>
			<OrderReviewSection>
				{ domainItems.map( item => (
					<DomainItem key={ item.id } item={ item } onDeleteItem={ onDeleteItem } />
				) ) }
			</OrderReviewSection>
			<OrderReviewSection>
				<OrderReviewLineItems items={ taxItems } />
				<OrderReviewTotal total={ total } />
			</OrderReviewSection>
		</React.Fragment>
	);
}

export function OrderReviewCollapsed() {
	const [ items, total ] = useLineItems();
	const planItems = items.filter( item => item.type === 'plan' );
	const domainItems = items.filter( item => item.type === 'domain' );
	const miscItems = items.filter( item => ! [ 'plan', 'domain', 'tax' ].includes( item.type ) );

	return (
		<React.Fragment>
			<OrderReviewLineItems collapsed items={ planItems } />
			<OrderReviewLineItems collapsed items={ miscItems } />
			<OrderReviewLineItems collapsed items={ domainItems } />
			<OrderReviewTotal collapsed total={ total } />
		</React.Fragment>
	);
}
