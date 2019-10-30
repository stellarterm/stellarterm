import React from 'react';
import PropTypes from 'prop-types';
import Driver from '../../../lib/Driver';
import LoginModalBlock from './LoginModalBlock/LoginModalBlock';
import images from './../../../images';
import Ellipsis from '../../Common/Ellipsis/Ellipsis';


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
            setTimeout(() => submit.cancel(), 100);
            break;
        case 'unfunded':
            return (
                    <div className="AccountModalBlock_unfunded">
                        To use your Stellar account, you must activate it by sending at least 5
                        lumens (XLM) to your account.
                        You can buy lumens (XLM) from an exchange and send them to your address.
                    </div>
            );
        case 'out':
            return (<LoginModalBlock d={d} />);
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
        const { submit } = this.props;
        const content = this.getLoginContent();

        return (
            <div className="LoginModal">
                <div className="Modal_header">
                    <span>Login</span>
                    <img
                        src={images['icon-close']}
                        alt="X"
                        onClick={() => {
                            submit.cancel();
                        }} />
                </div>
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
