/** @format */
/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import CompactCard from 'components/card/compact';
import ContactDisplay from './contact-display';
import Property from 'my-sites/domains/domain-management/edit/card/property';
import SectionHeader from 'components/section-header';
import { PUBLIC_VS_PRIVATE } from 'lib/url/support';
import FormToggle from 'components/forms/form-toggle';
import Gridicon from 'components/gridicon';
import {
	enableDomainPrivacy,
	disableDomainPrivacy,
	discloseDomainContactInfo,
	redactDomainContactInfo,
} from 'state/sites/domains/actions';
import { isUpdatingDomainPrivacy } from 'state/sites/domains/selectors';

class ContactsPrivacyCard extends React.Component {
	static propTypes = {
		privateDomain: PropTypes.bool.isRequired,
		privacyAvailable: PropTypes.bool.isRequired,
		selectedDomainName: PropTypes.string.isRequired,
		selectedSite: PropTypes.oneOfType( [ PropTypes.object, PropTypes.bool ] ).isRequired,
		contactInfoDisclosureAvailable: PropTypes.bool.isRequired,
		contactInfoDisclosed: PropTypes.bool.isRequired,
		isPendingIcannVerification: PropTypes.bool.isRequired,
	};

	togglePrivacy = () => {
		const { selectedSite, privateDomain, selectedDomainName: name } = this.props;

		if ( privateDomain ) {
			this.props.disableDomainPrivacy( selectedSite.ID, name );
		} else {
			this.props.enableDomainPrivacy( selectedSite.ID, name );
		}
	};

	toggleContactInfo = () => {
		const { selectedSite, contactInfoDisclosed, selectedDomainName: name } = this.props;

		if ( contactInfoDisclosed ) {
			this.props.redactDomainContactInfo( selectedSite.ID, name );
		} else {
			this.props.discloseDomainContactInfo( selectedSite.ID, name );
		}
	};

	getPrivacyProtection() {
		const { privateDomain, privacyAvailable } = this.props;
		const { translate, isUpdatingPrivacy } = this.props;

		if ( ! privacyAvailable ) {
			return false;
		}

		return (
			<Property label={ translate( 'Privacy Protection' ) }>
				{
					<FormToggle
						wrapperClassName="edit__privacy-protection-toggle"
						checked={ privateDomain }
						toggling={ isUpdatingPrivacy }
						disabled={ isUpdatingPrivacy }
						onChange={ this.togglePrivacy }
					/>
				}
			</Property>
		);
	}

	getContactInfoDisclosed() {
		const {
			translate,
			isUpdatingPrivacy,
			privateDomain,
			privacyAvailable,
			contactInfoDisclosureAvailable,
			contactInfoDisclosed,
			isPendingIcannVerification,
		} = this.props;

		if ( ! privacyAvailable || ! contactInfoDisclosureAvailable || privateDomain ) {
			return false;
		}

		const contactVerificationNotice = isPendingIcannVerification ? (
			<div class="edit__disclose-contact-information-warning">
				<Gridicon icon="info-outline" size={ 18 } />
				<p>
					{ translate(
						'You need to verify the contact information for the domain before you can disclose it publicly.'
					) }
				</p>
			</div>
		) : null;

		return (
			<div>
				<Property label={ translate( 'Display my contact information in public WHOIS' ) }>
					<FormToggle
						wrapperClassName="edit__disclose-contact-information"
						checked={ contactInfoDisclosed }
						toggling={ isUpdatingPrivacy }
						disabled={ isUpdatingPrivacy || isPendingIcannVerification }
						onChange={ this.toggleContactInfo }
					/>
				</Property>
				{ contactVerificationNotice }
			</div>
		);
	}

	render() {
		const { translate, selectedDomainName } = this.props;

		return (
			<div>
				<SectionHeader label={ translate( 'Domain Contacts' ) } />

				<CompactCard className="contacts-privacy__card">
					{ this.getPrivacyProtection() }

					{ this.getContactInfoDisclosed() }

					<ContactDisplay selectedDomainName={ selectedDomainName } />

					<p className="contacts-privacy__settings-explanation">
						{ translate(
							'Domain owners are required to provide correct contact information. ' +
								'{{a}}Learn more{{/a}} about private registration and GDPR protection.',
							{
								components: {
									a: <a href={ PUBLIC_VS_PRIVATE } target="_blank" rel="noopener noreferrer" />,
								},
							}
						) }
					</p>
				</CompactCard>
			</div>
		);
	}
}

export default connect(
	( state, ownProps ) => ( {
		isUpdatingPrivacy: isUpdatingDomainPrivacy(
			state,
			ownProps.selectedSite.ID,
			ownProps.selectedDomainName
		),
	} ),
	{
		enableDomainPrivacy,
		disableDomainPrivacy,
		discloseDomainContactInfo,
		redactDomainContactInfo,
	}
)( localize( ContactsPrivacyCard ) );
