/**
 * External dependencies
 */
import React, { Fragment } from 'react';
import { translate } from 'i18n-calypso';

// Jetpack products constants
export const PRODUCT_JETPACK_BACKUP = 'jetpack_backup';
export const PRODUCT_JETPACK_BACKUP_DAILY = 'jetpack_backup_daily';
export const PRODUCT_JETPACK_BACKUP_REALTIME = 'jetpack_backup_realtime';
export const PRODUCT_JETPACK_BACKUP_DAILY_MONTHLY = 'jetpack_backup_daily_monthly';
export const PRODUCT_JETPACK_BACKUP_REALTIME_MONTHLY = 'jetpack_backup_realtime_monthly';

export const JETPACK_BACKUP_PRODUCTS_YEARLY = [
	PRODUCT_JETPACK_BACKUP_DAILY,
	PRODUCT_JETPACK_BACKUP_REALTIME,
];
export const JETPACK_BACKUP_PRODUCTS_MONTHLY = [
	PRODUCT_JETPACK_BACKUP_DAILY_MONTHLY,
	PRODUCT_JETPACK_BACKUP_REALTIME_MONTHLY,
];
export const JETPACK_BACKUP_PRODUCTS = [
	...JETPACK_BACKUP_PRODUCTS_YEARLY,
	...JETPACK_BACKUP_PRODUCTS_MONTHLY,
];

export const JETPACK_BACKUP_PRODUCT_SHORT_NAMES = {
	[ PRODUCT_JETPACK_BACKUP_DAILY ]: translate( 'Daily Backups' ),
	[ PRODUCT_JETPACK_BACKUP_DAILY_MONTHLY ]: translate( 'Daily Backups' ),
	[ PRODUCT_JETPACK_BACKUP_REALTIME ]: translate( 'Real-Time Backups' ),
	[ PRODUCT_JETPACK_BACKUP_REALTIME_MONTHLY ]: translate( 'Real-Time Backups' ),
};
export const JETPACK_BACKUP_PRODUCT_DAILY_DISPLAY_NAME = (
	<Fragment>
		{ translate( 'Jetpack Backup {{em}}Daily{{/em}}', {
			components: {
				em: <em />,
			},
		} ) }
	</Fragment>
);
export const JETPACK_BACKUP_PRODUCT_REALTIME_DISPLAY_NAME = (
	<Fragment>
		{ translate( 'Jetpack Backup {{em}}Real-Time{{/em}}', {
			components: {
				em: <em />,
			},
		} ) }
	</Fragment>
);
export const JETPACK_BACKUP_PRODUCT_DISPLAY_NAMES = {
	[ PRODUCT_JETPACK_BACKUP_DAILY ]: JETPACK_BACKUP_PRODUCT_DAILY_DISPLAY_NAME,
	[ PRODUCT_JETPACK_BACKUP_DAILY_MONTHLY ]: JETPACK_BACKUP_PRODUCT_DAILY_DISPLAY_NAME,
	[ PRODUCT_JETPACK_BACKUP_REALTIME ]: JETPACK_BACKUP_PRODUCT_REALTIME_DISPLAY_NAME,
	[ PRODUCT_JETPACK_BACKUP_REALTIME_MONTHLY ]: JETPACK_BACKUP_PRODUCT_REALTIME_DISPLAY_NAME,
};

export const PRODUCT_JETPACK_BACKUP_DESCRIPTION = (
	<p>
		{ translate(
			'Always-on backups ensure you never lose your site. Choose from real-time or daily backups. {{a}}Which one do I need?{{/a}}',
			{
				components: {
					a: (
						<a
							href="https://jetpack.com/upgrade/backup/"
							target="_blank"
							rel="noopener noreferrer"
						/>
					),
				},
			}
		) }
	</p>
);
export const PRODUCT_JETPACK_BACKUP_DAILY_DESCRIPTION = (
	<p>
		{ translate(
			'{{strong}}Looking for more?{{/strong}} With Real-time backups, we save as you edit and you’ll get unlimited backup archives.',
			{
				components: {
					strong: <strong />,
				},
			}
		) }
	</p>
);
export const PRODUCT_JETPACK_BACKUP_REALTIME_DESCRIPTION = (
	<p>
		{ translate(
			'Always-on backups ensure you never lose your site. Your changes are saved as you edit and you have unlimited backup archives.'
		) }
	</p>
);

export const JETPACK_BACKUP_PRODUCT_DESCRIPTIONS = {
	[ PRODUCT_JETPACK_BACKUP_DAILY ]: PRODUCT_JETPACK_BACKUP_DAILY_DESCRIPTION,
	[ PRODUCT_JETPACK_BACKUP_DAILY_MONTHLY ]: PRODUCT_JETPACK_BACKUP_DAILY_DESCRIPTION,
	[ PRODUCT_JETPACK_BACKUP_REALTIME ]: PRODUCT_JETPACK_BACKUP_REALTIME_DESCRIPTION,
	[ PRODUCT_JETPACK_BACKUP_REALTIME_MONTHLY ]: PRODUCT_JETPACK_BACKUP_REALTIME_DESCRIPTION,
};

export const JETPACK_PRODUCT_PRICE_MATRIX = {
	[ PRODUCT_JETPACK_BACKUP_DAILY ]: {
		relatedProduct: PRODUCT_JETPACK_BACKUP_DAILY_MONTHLY,
		ratio: 12,
	},
	[ PRODUCT_JETPACK_BACKUP_REALTIME ]: {
		relatedProduct: PRODUCT_JETPACK_BACKUP_REALTIME_MONTHLY,
		ratio: 12,
	},
};

export const JETPACK_PRODUCTS = [
	{
		title: translate( 'Jetpack Backup' ),
		description: PRODUCT_JETPACK_BACKUP_DESCRIPTION,
		id: PRODUCT_JETPACK_BACKUP,
		options: {
			yearly: JETPACK_BACKUP_PRODUCTS_YEARLY,
			monthly: JETPACK_BACKUP_PRODUCTS_MONTHLY,
		},
		optionShortNames: {
			...JETPACK_BACKUP_PRODUCT_SHORT_NAMES,
		},
		optionDisplayNames: {
			...JETPACK_BACKUP_PRODUCT_DISPLAY_NAMES,
		},
		optionDescriptions: {
			...JETPACK_BACKUP_PRODUCT_DESCRIPTIONS,
		},
		optionsLabel: translate( 'Backup Options' ),
	},
];
