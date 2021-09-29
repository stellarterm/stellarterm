import React from 'react';
import PropTypes from 'prop-types';
import { Redirect } from 'react-router-dom';
import Driver from '../../../lib/Driver';
import LoginModalBlock from './LoginModalBlock/LoginModalBlock';
import images from './../../../images';
import Ellipsis from '../../Common/Ellipsis/Ellipsis';
import SecretPhraseModalBlock from './SecretPhraseModalBlock/SecretPhraseModalBlock';
import Sep7Handler from '../../HomePage/Sep7Handler/Sep7Handler';
import { SESSION_EVENTS, SESSION_STATE } from '../../../lib/constants';


export default class LoginModal extends React.Component {
    constructor(props) {
        super(props);
        this.unsub = this.props.d.session.event.sub(eventName => {
            if (eventName === SESSION_EVENTS.LOGIN_EVENT) {
                this.forceUpdate();
            }
        });
    }

    componentWillUnmount() {
        this.unsub();
    }

    getLoginContent() {
        const { d, submit } = this.props;
        const { state } = d.session;

        switch (state) {
            case SESSION_STATE.IN:
                submit.cancel();
                Sep7Handler(this.props.d);
                break;
            case SESSION_STATE.UNFUNDED:
                d.modal.handlers.cancel();
                return (
                    <Redirect to={'/account/'} />
                );
            case SESSION_STATE.OUT:
                return (<LoginModalBlock d={d} title={'Log in to manage Stellar account'} />);
            case SESSION_STATE.LOADING:
                return (
                    <div className="AccountModalBlock_loading">
                    Contacting network and loading account<Ellipsis />
                    </div>
                );
            default:
                break;
        }
        return null;
    }

    render() {
        const { submit, d } = this.props;
        const content = this.getLoginContent();

        return (
            <div className="LoginModal">
                <div className="Modal_header">
                    <span>Access your account</span>
                    <img
                        src={images['icon-close']}
                        alt="X"
                        onClick={() => {
                            submit.cancel();
                            Sep7Handler(this.props.d);
                        }}
                    />
                </div>
                <SecretPhraseModalBlock d={d} />
                <div className="LoginModal_content">
                    {content}
                </div>
            </div>
        );
    }
}
LoginModal.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
    submit: PropTypes.objectOf(PropTypes.func),
};
