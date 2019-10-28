/**
 * External dependencies
 */
import React from 'react';

import { renderDisplayValueMarkdown } from '../../lib/render';

export function PlanItem( { plan, onDeleteItem, onChangePlanLength } ) {
	const changePlanLength = planLength => onChangePlanLength( plan, planLength );
	const deleteItem = () => onDeleteItem( plan );
	return (
		<React.Fragment>
			<div>
				<span>
					<div>{ plan.label }</div>
					{ plan.subLabel && <div>{ plan.subLabel }</div> }
				</span>
				<span>{ renderDisplayValueMarkdown( plan.amount.displayValue ) }</span>
				<button onClick={ deleteItem }>Delete</button>
			</div>
			<PlanLengthSelector onChange={ changePlanLength } />
		</React.Fragment>
	);
}

export function DomainItem( { item, onDeleteItem } ) {
	const deleteItem = () => onDeleteItem( item );
	return (
		<div>
			<span>
				<div>{ item.label }</div>
				{ item.subLabel && <div>{ item.subLabel }</div> }
			</span>
			<span>{ renderDisplayValueMarkdown( item.amount.displayValue ) }</span>
			<button onClick={ deleteItem }>Delete</button>
		</div>
	);
}

function PlanLengthSelector() {
	return <span>TODO</span>;
}
