/** @format */

/**
 * Internal dependencies
 */
import { withoutPersistence } from 'state/utils';
import { CONCIERGE_INITIAL_REQUEST, CONCIERGE_INITIAL_UPDATE } from 'state/action-types';

export const nextAppointment = withoutPersistence( ( state = null, action ) => {
	switch ( action.type ) {
		case CONCIERGE_INITIAL_REQUEST:
			return null;
		case CONCIERGE_INITIAL_UPDATE:
			return action.initial.nextAppointment;
	}

	return state;
} );

export default nextAppointment;
