/** @format */
/**
 * External dependencies
 */
import { getLocaleSlug } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import {
	addLocaleToPath,
	getLanguage,
	getLocaleFromPath,
	isDefaultLocale,
	removeLocaleFromPath,
	isLocaleVariant,
	localizeUrl,
	canBeTranslated,
	getPathParts,
	filterLanguageRevisions,
} from 'lib/i18n-utils';

jest.mock( 'config', () => key => {
	if ( 'i18n_default_locale_slug' === key ) {
		return 'en';
	}

	if ( 'support_site_locales' === key ) {
		return [ 'en', 'es', 'de', 'ja', 'pt-br' ];
	}

	if ( 'forum_locales' === key ) {
		return [ 'en', 'es', 'de', 'ja', 'pt-br', 'th' ];
	}

	if ( 'magnificent_non_en_locales' === key ) {
		return [
			'es',
			'pt-br',
			'de',
			'fr',
			'he',
			'ja',
			'it',
			'nl',
			'ru',
			'tr',
			'id',
			'zh-cn',
			'zh-tw',
			'ko',
			'ar',
		];
	}

	if ( 'jetpack_com_locales' === key ) {
		return [
			'en',
			'ar',
			'de',
			'es',
			'fr',
			'he',
			'id',
			'it',
			'ja',
			'ko',
			'nl',
			'pt-br',
			'ro',
			'ru',
			'sv',
			'tr',
			'zh-cn',
			'zh-tw',
		];
	}
} );

jest.mock( 'i18n-calypso', () => ( {
	getLocaleSlug: jest.fn( () => 'en' ),
} ) );

describe( 'utils', () => {
	describe( '#isDefaultLocale', () => {
		test( 'should return false when a non-default locale provided', () => {
			expect( isDefaultLocale( 'fr' ) ).toEqual( false );
		} );

		test( 'should return true when a default locale provided', () => {
			expect( isDefaultLocale( 'en' ) ).toEqual( true );
		} );
	} );

	describe( '#addLocaleToPath', () => {
		test( 'adds a locale to the path', () => {
			expect( addLocaleToPath( '/start/flow/step', 'fr' ) ).toEqual( '/start/flow/step/fr' );
		} );

		test( 'adds a locale to the path, replacing any previous locale', () => {
			expect( addLocaleToPath( '/start/flow/step/de', 'fr' ) ).toEqual( '/start/flow/step/fr' );
		} );

		test( 'adds a locale to the path, keeping query string intact', () => {
			expect( addLocaleToPath( '/start/flow/step?foo=bar', 'fr' ) ).toEqual(
				'/start/flow/step/fr?foo=bar'
			);
		} );
	} );

	describe( '#removeLocaleFromPath', () => {
		test( 'should remove the :lang part of the URL', () => {
			expect( removeLocaleFromPath( '/start/fr' ) ).toEqual( '/start' );
			expect( removeLocaleFromPath( '/start/flow/fr' ) ).toEqual( '/start/flow' );
			expect( removeLocaleFromPath( '/start/flow/step' ) ).toEqual( '/start/flow/step' );
		} );

		test( 'should remove the :lang part of the URL, keeping any query string', () => {
			expect( removeLocaleFromPath( '/log-in/pl?foo=bar' ) ).toEqual( '/log-in?foo=bar' );
			expect( removeLocaleFromPath( '/start/flow/step/fr?foo=bar' ) ).toEqual(
				'/start/flow/step?foo=bar'
			);
		} );

		test( 'should not change the URL if no lang is present', () => {
			expect( removeLocaleFromPath( '/log-in' ) ).toEqual( '/log-in' );
			expect( removeLocaleFromPath( '/start/flow/step?foo=bar' ) ).toEqual(
				'/start/flow/step?foo=bar'
			);
		} );

		test( 'should not remove the :flow part of the URL', () => {
			expect( removeLocaleFromPath( '/start' ) ).toEqual( '/start' );
			expect( removeLocaleFromPath( '/start/flow' ) ).toEqual( '/start/flow' );
		} );

		test( 'should not remove the :step part of the URL', () => {
			expect( removeLocaleFromPath( '/start/flow/step' ) ).toEqual( '/start/flow/step' );
		} );

		test( 'should not remove keys from an invite', () => {
			expect( removeLocaleFromPath( '/accept-invite/site.wordpress.com/123456/es' ) ).toEqual(
				'/accept-invite/site.wordpress.com/123456'
			);
			expect(
				removeLocaleFromPath( '/accept-invite/site.wordpress.com/123456/123456/123456/es' )
			).toEqual( '/accept-invite/site.wordpress.com/123456/123456/123456' );
		} );
	} );

	describe( '#getLocaleFromPath', () => {
		test( 'should return undefined when no locale at end of path', () => {
			expect( getLocaleFromPath( '/start' ) ).toBeUndefined();
		} );

		test( 'should return locale string when at end of path', () => {
			expect( getLocaleFromPath( '/start/es' ) ).toEqual( 'es' );
			expect(
				getLocaleFromPath( '/accept-invite/site.wordpress.com/123456/123456/123456/es' )
			).toEqual( 'es' );
		} );

		test( 'should correctly handle paths with query string', () => {
			expect( getLocaleFromPath( '/start/es?query=string' ) ).toEqual( 'es' );
		} );
	} );

	describe( '#getLanguage', () => {
		test( 'should return a language', () => {
			expect( getLanguage( 'ja' ).langSlug ).toEqual( 'ja' );
		} );

		test( 'should return a language with a country code', () => {
			expect( getLanguage( 'pt-br' ).langSlug ).toEqual( 'pt-br' );
		} );

		test( 'should fall back to the language code when a country code is not available', () => {
			expect( getLanguage( 'fr-zz' ).langSlug ).toEqual( 'fr' );
		} );

		test( 'should return undefined when no arguments are given', () => {
			//note that removeLocaleFromPath is dependant on getLanguage returning undefined in this case.
			expect( getLanguage() ).toBeUndefined();
		} );

		test( 'should return undefined when the locale is invalid', () => {
			//note that removeLocaleFromPath is dependant on getLanguage returning undefined in this case.
			expect( getLanguage( 'zz' ) ).toBeUndefined();
		} );

		test( 'should return undefined when we lookup random words', () => {
			expect( getLanguage( 'themes' ) ).toBeUndefined();
			expect( getLanguage( 'log-in' ) ).toBeUndefined();
		} );

		test( 'should return a language with a three letter country code', () => {
			expect( getLanguage( 'ast' ).langSlug ).toEqual( 'ast' );
		} );

		test( 'should return the variant', () => {
			expect( getLanguage( 'de_formal' ).langSlug ).toEqual( 'de_formal' );
		} );

		test( 'should return the parent slug since the given variant does not exist', () => {
			expect( getLanguage( 'fr_formal' ).langSlug ).toEqual( 'fr' );
		} );
	} );

	describe( '#isLocaleVariant', () => {
		test( 'should return false by default', () => {
			expect( isLocaleVariant( 'lol' ) ).toEqual( false );
			expect( isLocaleVariant() ).toEqual( false );
		} );

		test( 'should detect a locale variant', () => {
			expect( isLocaleVariant( 'de_formal' ) ).toEqual( true );
		} );

		test( 'should detect a root language', () => {
			expect( isLocaleVariant( 'de' ) ).toEqual( false );
		} );
	} );

	describe( '#canBeTranslated', () => {
		test( 'should return true by default', () => {
			expect( canBeTranslated() ).toEqual( true );
		} );

		test( 'should return false for elements in the exception list', () => {
			expect( canBeTranslated( 'en' ) ).toEqual( false );
			expect( canBeTranslated( 'sr_latin' ) ).toEqual( false );
		} );

		test( 'should return true for languages not in the exception list', () => {
			expect( canBeTranslated( 'de' ) ).toEqual( true );
		} );
	} );

	describe( '#localizeUrl', () => {
		test( 'should not change URL for `en`', () => {
			[
				'https://wordpress.com/',
				'https://de.wordpress.com/',
				'https://wordpress.com/start',
				'https://wordpress.com/wp-login.php?action=lostpassword',
			].forEach( fullUrl => {
				getLocaleSlug.mockImplementationOnce( () => 'en' );
				expect( localizeUrl( fullUrl ) ).toEqual( fullUrl );
			} );
		} );

		test( 'should not change relative URLs', () => {
			[ '/me/account', '/settings' ].forEach( fullUrl => {
				getLocaleSlug.mockImplementationOnce( () => 'en' );
				expect( localizeUrl( fullUrl ) ).toEqual( fullUrl );
				getLocaleSlug.mockImplementationOnce( () => 'fr' );
				expect( localizeUrl( fullUrl ) ).toEqual( fullUrl );
			} );
		} );

		test( 'handles invalid URLs', () => {
			[ undefined, null, [], {}, { href: 'https://test' }, 'not-a-url', () => {} ].forEach(
				fullUrl => {
					getLocaleSlug.mockImplementationOnce( () => 'en' );
					expect( localizeUrl( fullUrl ) ).toEqual( fullUrl );
					getLocaleSlug(); // make sure to consume it.
					getLocaleSlug.mockImplementationOnce( () => 'en' );
					expect( localizeUrl( fullUrl, 'fr' ) ).toEqual( fullUrl );
					getLocaleSlug(); // make sure to consume it.
					getLocaleSlug.mockImplementationOnce( () => 'fr' );
					expect( localizeUrl( fullUrl ) ).toEqual( fullUrl );
					getLocaleSlug(); // make sure to consume it.
				}
			);
		} );

		test( 'trailing slash variations', () => {
			getLocaleSlug.mockImplementationOnce( () => 'de' );
			expect( localizeUrl( 'https://automattic.com/cookies/' ) ).toEqual(
				'https://automattic.com/de/cookies/'
			);
			getLocaleSlug.mockImplementationOnce( () => 'de' );
			expect( localizeUrl( 'https://automattic.com/cookies' ) ).toEqual(
				'https://automattic.com/de/cookies/'
			);
		} );

		test( 'overriding locale', () => {
			getLocaleSlug.mockImplementationOnce( () => 'ru' );
			expect( localizeUrl( 'https://automattic.com/cookies/', 'de' ) ).toEqual(
				'https://automattic.com/de/cookies/'
			);
			getLocaleSlug(); // make sure to consume it.

			getLocaleSlug.mockImplementationOnce( () => 'en' );
			expect( localizeUrl( 'https://automattic.com/cookies', 'fr' ) ).toEqual(
				'https://automattic.com/fr/cookies/'
			);
			getLocaleSlug(); // make sure to consume it.

			// Finally make sure that no overriding has stuck and it uses the getLocaleSlug() when no override is specified.
			getLocaleSlug.mockImplementationOnce( () => 'ru' );
			expect( localizeUrl( 'https://automattic.com/cookies/' ) ).toEqual(
				'https://automattic.com/cookies/'
			);
			getLocaleSlug(); // make sure to consume it.

			getLocaleSlug.mockImplementationOnce( () => 'de' );
			expect( localizeUrl( 'https://automattic.com/cookies/' ) ).toEqual(
				'https://automattic.com/de/cookies/'
			);
			getLocaleSlug(); // make sure to consume it.
		} );

		test( 'logged-out homepage', () => {
			getLocaleSlug.mockImplementationOnce( () => 'en' );
			expect( localizeUrl( 'https://wordpress.com/' ) ).toEqual( 'https://wordpress.com/' );
			getLocaleSlug.mockImplementationOnce( () => 'de' );
			expect( localizeUrl( 'https://wordpress.com/' ) ).toEqual( 'https://de.wordpress.com/' );
			getLocaleSlug.mockImplementationOnce( () => 'pt-br' );
			expect( localizeUrl( 'https://wordpress.com/' ) ).toEqual( 'https://br.wordpress.com/' );
			getLocaleSlug.mockImplementationOnce( () => 'pl' );
			expect( localizeUrl( 'https://wordpress.com/' ) ).toEqual( 'https://wordpress.com/' );
			getLocaleSlug.mockImplementationOnce( () => 'en' );
			expect( localizeUrl( 'https://en.wordpress.com/' ) ).toEqual( 'https://wordpress.com/' );
		} );

		test( 'blog url', () => {
			getLocaleSlug.mockImplementationOnce( () => 'en' );
			expect( localizeUrl( 'https://en.blog.wordpress.com/' ) ).toEqual(
				'https://en.blog.wordpress.com/'
			);
			getLocaleSlug.mockImplementationOnce( () => 'de' );
			expect( localizeUrl( 'https://en.blog.wordpress.com/' ) ).toEqual(
				'https://en.blog.wordpress.com/'
			);
			getLocaleSlug.mockImplementationOnce( () => 'pt-br' );
			expect( localizeUrl( 'https://en.blog.wordpress.com/' ) ).toEqual(
				'https://br.blog.wordpress.com/'
			);
			getLocaleSlug.mockImplementationOnce( () => 'pl' );
			expect( localizeUrl( 'https://en.blog.wordpress.com/' ) ).toEqual(
				'https://en.blog.wordpress.com/'
			);
		} );

		test( 'support url', () => {
			getLocaleSlug.mockImplementationOnce( () => 'en' );
			expect( localizeUrl( 'https://en.support.wordpress.com/' ) ).toEqual(
				'https://en.support.wordpress.com/'
			);
			getLocaleSlug.mockImplementationOnce( () => 'de' );
			expect( localizeUrl( 'https://en.support.wordpress.com/' ) ).toEqual(
				'https://de.support.wordpress.com/'
			);
			getLocaleSlug.mockImplementationOnce( () => 'pt-br' );
			expect( localizeUrl( 'https://en.support.wordpress.com/' ) ).toEqual(
				'https://br.support.wordpress.com/'
			);
			getLocaleSlug.mockImplementationOnce( () => 'pl' );
			expect( localizeUrl( 'https://en.support.wordpress.com/' ) ).toEqual(
				'https://en.support.wordpress.com/'
			);
		} );

		test( 'forums url', () => {
			getLocaleSlug.mockImplementationOnce( () => 'en' );
			expect( localizeUrl( 'https://en.forums.wordpress.com/' ) ).toEqual(
				'https://en.forums.wordpress.com/'
			);
			getLocaleSlug.mockImplementationOnce( () => 'de' );
			expect( localizeUrl( 'https://en.forums.wordpress.com/' ) ).toEqual(
				'https://de.forums.wordpress.com/'
			);
			getLocaleSlug.mockImplementationOnce( () => 'pt-br' );
			expect( localizeUrl( 'https://en.forums.wordpress.com/' ) ).toEqual(
				'https://br.forums.wordpress.com/'
			);
			getLocaleSlug.mockImplementationOnce( () => 'th' );
			expect( localizeUrl( 'https://en.forums.wordpress.com/' ) ).toEqual(
				'https://th.forums.wordpress.com/'
			);
			getLocaleSlug.mockImplementationOnce( () => 'pl' );
			expect( localizeUrl( 'https://en.forums.wordpress.com/' ) ).toEqual(
				'https://en.forums.wordpress.com/'
			);
		} );

		test( 'privacy policy', () => {
			getLocaleSlug.mockImplementationOnce( () => 'en' );
			expect( localizeUrl( 'https://automattic.com/privacy/' ) ).toEqual(
				'https://automattic.com/privacy/'
			);
			getLocaleSlug.mockImplementationOnce( () => 'de' );
			expect( localizeUrl( 'https://automattic.com/privacy/' ) ).toEqual(
				'https://automattic.com/de/privacy/'
			);
			getLocaleSlug.mockImplementationOnce( () => 'pl' );
			expect( localizeUrl( 'https://automattic.com/privacy/' ) ).toEqual(
				'https://automattic.com/privacy/'
			);
		} );

		test( 'cookie policy', () => {
			getLocaleSlug.mockImplementationOnce( () => 'en' );
			expect( localizeUrl( 'https://automattic.com/cookies/' ) ).toEqual(
				'https://automattic.com/cookies/'
			);
			getLocaleSlug.mockImplementationOnce( () => 'de' );
			expect( localizeUrl( 'https://automattic.com/cookies/' ) ).toEqual(
				'https://automattic.com/de/cookies/'
			);
			getLocaleSlug.mockImplementationOnce( () => 'pl' );
			expect( localizeUrl( 'https://automattic.com/cookies/' ) ).toEqual(
				'https://automattic.com/cookies/'
			);
		} );

		test( 'tos', () => {
			getLocaleSlug.mockImplementationOnce( () => 'en' );
			expect( localizeUrl( 'https://wordpress.com/tos/' ) ).toEqual( 'https://wordpress.com/tos/' );
			getLocaleSlug.mockImplementationOnce( () => 'de' );
			expect( localizeUrl( 'https://wordpress.com/tos/' ) ).toEqual(
				'https://de.wordpress.com/tos/'
			);
			getLocaleSlug.mockImplementationOnce( () => 'pl' );
			expect( localizeUrl( 'https://wordpress.com/tos/' ) ).toEqual( 'https://wordpress.com/tos/' );
			getLocaleSlug.mockImplementationOnce( () => 'th' );
			expect( localizeUrl( 'https://wordpress.com/tos/' ) ).toEqual( 'https://wordpress.com/tos/' );
		} );

		test( 'jetpack', () => {
			getLocaleSlug.mockImplementationOnce( () => 'en' );
			expect( localizeUrl( 'https://jetpack.com/features/comparison/' ) ).toEqual(
				'https://jetpack.com/features/comparison/'
			);
			getLocaleSlug.mockImplementationOnce( () => 'de' );
			expect( localizeUrl( 'https://jetpack.com/features/comparison/' ) ).toEqual(
				'https://de.jetpack.com/features/comparison/'
			);
			getLocaleSlug.mockImplementationOnce( () => 'pt-br' );
			expect( localizeUrl( 'https://jetpack.com/features/comparison/' ) ).toEqual(
				'https://br.jetpack.com/features/comparison/'
			);
			getLocaleSlug.mockImplementationOnce( () => 'zh-tw' );
			expect( localizeUrl( 'https://jetpack.com/features/comparison/' ) ).toEqual(
				'https://zh-tw.jetpack.com/features/comparison/'
			);
			getLocaleSlug.mockImplementationOnce( () => 'pl' );
			expect( localizeUrl( 'https://jetpack.com/features/comparison/' ) ).toEqual(
				'https://jetpack.com/features/comparison/'
			);
		} );

		test( 'WordPress.com URLs', () => {
			getLocaleSlug.mockImplementationOnce( () => 'en' );
			expect( localizeUrl( 'https://wordpress.com/wp-login.php?action=lostpassword' ) ).toEqual(
				'https://wordpress.com/wp-login.php?action=lostpassword'
			);
			getLocaleSlug.mockImplementationOnce( () => 'de' );
			expect( localizeUrl( 'https://wordpress.com/wp-login.php?action=lostpassword' ) ).toEqual(
				'https://de.wordpress.com/wp-login.php?action=lostpassword'
			);
		} );
	} );

	describe( '#getPathParts', () => {
		test( 'should split path', () => {
			expect( getPathParts( '/show/me/the/money' ) ).toEqual( [
				'',
				'show',
				'me',
				'the',
				'money',
			] );
		} );
		test( 'should split path and remove trailing slash', () => {
			expect( getPathParts( '/show/me/the/money/' ) ).toEqual( [
				'',
				'show',
				'me',
				'the',
				'money',
			] );
		} );
	} );
	describe( 'filterLanguageRevisions()', () => {
		const valid = {
			en: 123,
			ja: 456,
		};

		test( 'should leave a valid object as it is', () => {
			expect( filterLanguageRevisions( valid ) ).toEqual( valid );
		} );

		test( 'should filter out unexpected keys.', () => {
			const invalid = {
				hahahaha: 999,
				...valid,
			};

			expect( filterLanguageRevisions( invalid ) ).toEqual( valid );
		} );

		test( 'should filter out unexpected values.', () => {
			const invalid = {
				es: 'to crash or not to crash, that is the problem.',
				...valid,
			};

			expect( filterLanguageRevisions( invalid ) ).toEqual( valid );
		} );
	} );
} );
