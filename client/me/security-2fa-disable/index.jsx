/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import FormButton from 'components/forms/form-button';
import FormSectionHeading from 'components/forms/form-section-heading';
import Security2faStatus from 'me/security-2fa-status';
import Security2faCodePrompt from 'me/security-2fa-code-prompt';
import { recordGoogleEvent } from 'state/analytics/actions';
import { successNotice } from 'state/notices/actions';
import { localizeUrl } from 'lib/i18n-utils';

/**
 * Style dependencies
 */
import './style.scss';

class Security2faDisable extends Component {
	static propTypes = {
		onFinished: PropTypes.func.isRequired,
		userSettings: PropTypes.object.isRequired,
		translate: PropTypes.func,
		recordGoogleEvent: PropTypes.func,
		successNotice: PropTypes.func,
	};

	constructor() {
		super( ...arguments );
		this.state = {
			showingCodePrompt: false,
		};
	}

	onRevealCodePrompt = () => {
		this.props.recordGoogleEvent( 'Me', 'Clicked On Disable Two-Step Authentication Button' );
		this.setState( { showingCodePrompt: true } );
	};

	onCancelCodePrompt = () => {
		this.setState( { showingCodePrompt: false } );
	};

	onCodePromptSuccess = () => {
		const { onFinished, translate } = this.props;
		this.setState( { showingCodePrompt: false } );
		this.props.successNotice( translate( 'Successfully disabled Two-Step Authentication.' ), {
			duration: 4000,
		} );
		onFinished();
	};

	renderVerificationCodeMeansMessage() {
		const { userSettings, translate } = this.props;
		if ( userSettings.settings.two_step_sms_enabled ) {
			return (
				<div>
					<p>
						{ translate(
							"You've enabled Two-Step Authentication. " +
								'While enabled, logging in to WordPress.com ' +
								'requires you to enter a unique passcode, sent via text message, ' +
								'in addition to your username and password.'
						) }
					</p>

					<p>
						{ translate(
							"You're all set to receive authentication codes at " +
								'{{strong}}%(smsNumber)s{{/strong}}. ' +
								'Want to switch to a different number? No problem! ' +
								"You'll need to disable Two-Step Authentication, " +
								'then complete the setup process again on another device.',
							{
								components: {
									strong: <strong />,
								},
								args: {
									smsNumber: userSettings.getSetting( 'two_step_sms_phone_number' ),
								},
							}
						) }
					</p>
				</div>
			);
		}

		return (
			<div>
				<p>
					{ translate(
						"You've enabled Two-Step Authentication on your account — smart move! " +
							"When you log in to WordPress.com, you'll need to enter your " +
							'username and password, as well as a unique passcode generated ' +
							'by an app on your mobile device.'
					) }
				</p>
				<p>
					{ translate(
						'Switching to a new device? ' +
							'{{changephonelink}}Follow these steps{{/changephonelink}} ' +
							'to avoid losing access to your account.',
						{
							components: {
								changephonelink: (
									<a
										href={ localizeUrl(
											'https://en.support.wordpress.com/security/two-step-authentication/#moving-to-a-new-device'
										) }
										target="_blank"
										rel="noopener noreferrer"
									/>
								),
							},
						}
					) }
				</p>
			</div>
		);
	}

	renderCodePromptToggle() {
		const { translate, userSettings } = this.props;
		if ( this.state.showingCodePrompt ) {
			return (
				<div className="security-2fa-disable__prompt">
					<FormSectionHeading>
						{ translate( 'Disable Two-Step Authentication' ) }
					</FormSectionHeading>
					<p>
						{ translate(
							'You are about to disable Two-Step Authentication. ' +
								'This means we will no longer ask for your authentication ' +
								'code when you sign into your {{strong}}%(userlogin)s{{/strong}} account.',
							{
								components: {
									strong: <strong />,
								},
								args: {
									userlogin: userSettings.settings.user_login,
								},
							}
						) }
					</p>
					<p>
						{ translate(
							'This will also disable your Application Passwords, ' +
								'though you can access them again if you ever re-enable ' +
								'Two-Step Authentication. If you decide to re-enable ' +
								"Two-Step Authentication, keep in mind you'll need to " +
								'generate new backup codes.'
						) }
					</p>
					<p>
						{ translate(
							'To verify that you wish to disable Two-Step Authentication, ' +
								'enter the verification code from your device or a backup code, ' +
								'and click "Disable Two-Step."'
						) }
					</p>
					<Security2faCodePrompt
						action="disable-two-step"
						onCancel={ this.onCancelCodePrompt }
						onSuccess={ this.onCodePromptSuccess }
						requestSMSOnMount={ userSettings.settings.two_step_sms_enabled }
						userSettings={ userSettings }
					/>
				</div>
			);
		}

		return (
			<FormButton isPrimary={ false } scary onClick={ this.onRevealCodePrompt }>
				{ translate( 'Disable Two-Step Authentication' ) }
			</FormButton>
		);
	}

	render() {
		return (
			<div>
				{ this.renderVerificationCodeMeansMessage() }
				<Security2faStatus twoStepEnabled={ this.props.userSettings.settings.two_step_enabled } />
				{ this.renderCodePromptToggle() }
			</div>
		);
	}
}

export default connect(
	null,
	{
		successNotice,
		recordGoogleEvent,
	},
	null,
	{ pure: false }
)( localize( Security2faDisable ) );
