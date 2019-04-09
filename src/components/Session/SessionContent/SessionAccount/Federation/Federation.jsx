import React from 'react';
import PropTypes from 'prop-types';
import images from '../../../../../images';
import FederationInpit from './FederationInput/FederationInput';
import CopyButton from '../../../../CopyButton';
import Driver from '../../../../../lib/Driver';
import Ellipsis from '../../../../Ellipsis';

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
                        <FederationInpit
                            address={address}
                            onUpdate={inputValue => this.updateInputValue(inputValue)}
                            onKeyPressed={keyCode => this.onKeyPressed(keyCode)} />
                    </div>
                    <div className="Account_alert_right">{this.getControlButtons()}</div>
                </div>
            );
        } else if (fedExists && !isEditing) {
            content = (
                <div className={alertClass}>
                    <div className="Account_alert_left">
                        <p>Your federation address</p>
                        <strong onClick={() => this.handleEditToggle()}>{`${address}*stellarterm.com`}</strong>
                    </div>

                    <div className="Account_alert_right">
                        <div className="CopyButton" onClick={() => this.handleEditToggle()}>
                            <img src={images['icon-edit']} alt="edit" width="24" height="24" />
                            <span>EDIT</span>
                        </div>
                        <CopyButton text={`${address}*stellarterm.com`} />
                    </div>
                </div>
            );
        } else if (!fedExists && !isEditing) {
            content = (
                <div className={alertClass}>
                    <div className="Account_alert_left">
                        <p className="no_federation_text">
                            Setup a short memorable payment alias under a stellarterm.com domain
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
        const { userFederation } = this.props.d.session;

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
            .catch((e) => {
                this.setState({
                    fedError: e.data !== undefined ? e.data.name : 'Federation error occured! Please try later.',
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
                    You can set an alias for your StellarTerm account and use it instead of your public key to receive
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
