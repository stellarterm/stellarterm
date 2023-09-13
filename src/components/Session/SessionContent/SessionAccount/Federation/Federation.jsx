import React from 'react';
import PropTypes from 'prop-types';
import images from '../../../../../images';
import Driver from '../../../../../lib/driver/Driver';
import Ellipsis from '../../../../Common/Ellipsis/Ellipsis';
import CopyButton from '../../../../Common/CopyButton/CopyButton';
import { SESSION_EVENTS, UNSUPPORTED_JWT_AUTH_TYPES } from '../../../../../lib/constants/sessionConstants';
import FederationInput from './FederationInput/FederationInput';

export const MIN_FED_LENGTH = 4;
export const CODE_ENTER = 13;
export const CODE_ESC = 27;

export default class Federation extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isEditing: false,
            fedError: null,
            address: this.props.d.session.userFederation,
            reqIsResolved: true,
        };

        this.unsub = this.props.d.session.event.sub((eventName, session) => {
            if (eventName === SESSION_EVENTS.FEDERATION_SEARCH_EVENT) {
                this.setState({
                    address: session.userFederation,
                });
            }
        });
    }

    componentWillUnmount() {
        this.unsub();
    }

    onKeyPressed(keyCode) {
        const isNewAddress = this.state.address !== this.props.d.session.userFederation;
        switch (keyCode) {
            case CODE_ENTER:
                if (isNewAddress) {
                    this.handleBtnSave();
                }
                break;
            case CODE_ESC:
                this.handleEditToggle();
                break;
            default:
                break;
        }
        return null;
    }

    getControlButtons() {
        const { reqIsResolved, address, fedError } = this.state;
        const { userFederation } = this.props.d.session;
        const disableSaveButton =
            address.length < MIN_FED_LENGTH || address === userFederation || fedError !== null || !reqIsResolved;

        return !reqIsResolved ? (
            <button className="s-button" onClick={() => this.handleBtnSave()} disabled={disableSaveButton}>
                Saving
                <Ellipsis />
            </button>
        ) : (
            <React.Fragment>
                <button className="b_transparent" onClick={() => this.handleEditToggle()}>
                    Cancel
                </button>
                <button className="s-button" onClick={() => this.handleBtnSave()} disabled={disableSaveButton}>
                    Save
                </button>
            </React.Fragment>
        );
    }

    getContent() {
        const { isEditing, address } = this.state;
        const alertClass = `Account_alert ${isEditing ? 'alert_isEditing' : ''}`;
        const fedExists = address !== '';
        let content;

        if (isEditing) {
            content = (
                <div className={alertClass}>
                    <div className="Account_alert_left">
                        <p>New federation address</p>
                        <FederationInput
                            address={address}
                            onUpdate={inputValue => this.updateInputValue(inputValue)}
                            onKeyPressed={keyCode => this.onKeyPressed(keyCode)}
                        />
                    </div>
                    <div className="Account_alert_right">{this.getControlButtons()}</div>
                </div>
            );
        } else if (fedExists && !isEditing) {
            content = (
                <div className={alertClass}>
                    <div className="Account_alert_left">
                        <p>Your federation address</p>
                        <strong onClick={() => this.handleEditToggle()}>{`${address}*zingypay.com`}</strong>
                    </div>

                    <div className="Account_alert_right">
                        <div className="CopyButton" onClick={() => this.handleEditToggle()}>
                            <img src={images['icon-edit']} alt="edit" width="24" height="24" />
                            <span>EDIT</span>
                        </div>
                        <CopyButton text={`${address}*zingypay.com`} />
                    </div>
                </div>
            );
        } else if (!fedExists && !isEditing) {
            content = (
                <div className={alertClass}>
                    <div className="Account_alert_left">
                        <p className="no_federation_text">
                            Get a short memorable payment address for your wallet
                            with Zingy Trader federation
                        </p>
                    </div>

                    <div className="Account_alert_right">
                        <button className="s-button" onClick={() => this.handleEditToggle()}>
                            Enable
                        </button>
                    </div>
                </div>
            );
        }

        return content;
    }

    getErrorBlock() {
        const { fedError } = this.state;

        return fedError !== null ? (
            <p className="Federation_warning">
                <span>
                    <img src={images['icon-error-triangle']} alt="Error" />
                </span>
                <span>{fedError}</span>
            </p>
        ) : null;
    }

    updateInputValue(inputValue) {
        this.setState({
            address: inputValue,
            fedError: null,
        });
    }

    handleEditToggle() {
        const { userFederation, authType } = this.props.d.session;
        const isJWTUnsupported = UNSUPPORTED_JWT_AUTH_TYPES.has(authType);

        if (isJWTUnsupported) {
            this.props.d.toastService.error(
                'Edit not available',
                `Federation changes are not available with ${UNSUPPORTED_JWT_AUTH_TYPES.get(authType)} at the moment`,
            );
            return;
        }


        this.setState({
            isEditing: !this.state.isEditing,
            address: userFederation,
            fedError: null,
        });
    }

    handleBtnSave() {
        const { handlers } = this.props.d.session;
        this.setState({
            reqIsResolved: false,
        });
        handlers
            .setFederation(this.state.address)
            .then(() => {
                const { userFederation } = this.props.d.session;

                this.setState({
                    isEditing: this.state.fedError !== null,
                    address: userFederation,
                    reqIsResolved: true,
                });
            })
            .catch(e => {
                this.setState({
                    fedError: (e.data && e.data.name)
                        ? e.data.name :
                        'Federation error occurred! Please try later.',
                    reqIsResolved: true,
                });
            });
    }

    render() {
        const errorBlock = this.getErrorBlock();
        const content = this.getContent();

        return (
            <div className="Federations_block">
                {content}

                {errorBlock}

                <p className="AccountView_text">
                    You can set an alias for your Zingy Trader account and use it instead of your public key to receive
                    payments on Stellar.
                    <br />
                    Share this address with people so they can send you tokens.
                </p>
            </div>
        );
    }
}

Federation.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
};
