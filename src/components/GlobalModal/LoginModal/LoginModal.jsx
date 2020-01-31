import React from 'react';
import PropTypes from 'prop-types';
import { Redirect } from 'react-router-dom';
import Driver from '../../../lib/Driver';
import LoginModalBlock from './LoginModalBlock/LoginModalBlock';
import images from './../../../images';
import Ellipsis from '../../Common/Ellipsis/Ellipsis';
import SecretPhraseModalBlock from './SecretPhraseModalBlock/SecretPhraseModalBlock';
import Sep7Handler from '../../HomePage/Sep7Handler/Sep7Handler';


export default class LoginModal extends React.Component {
    constructor(props) {
        super(props);
        this.listenId = this.props.d.session.event.listen(() => {
            this.forceUpdate();
        });
    }

    componentWillUnmount() {
        this.props.d.session.event.unlisten(this.listenId);
    }

    getLoginContent() {
        const { d, submit } = this.props;
        const { state } = d.session;

        switch (state) {
        case 'in':
            setTimeout(() => {
                submit.cancel();
                Sep7Handler(this.props.d);
            }, 100);
            break;
        case 'unfunded':
            d.modal.handlers.cancel();
            return (
                <Redirect to={'/account/'} />
            );
        case 'out':
            return (<LoginModalBlock d={d} title={'Please log in to manage Stellar account'} />);
        case 'loading':
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
                        }} />
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
