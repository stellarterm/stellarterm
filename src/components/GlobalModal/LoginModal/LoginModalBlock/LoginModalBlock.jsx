import React from 'react';
import PropTypes from 'prop-types';
import Driver from '../../../../lib/Driver';
import LoginPageBody from '../../../Session/LoginPage/LoginPageBody/LoginPageBody';
import LedgerBody from '../../../Session/LoginPage/LedgerBody/LedgerBody';
import TrezorBody from '../../../Session/LoginPage/TrezorBody/TrezorBody';

export default class LoginModalBlock extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            openTab: 'secret', // 'secret', 'ledger', 'trezor'
        };
    }

    handleChoose(tab) {
        this.setState({ openTab: tab });
    }

    render() {
        const { d, title } = this.props;
        const { openTab } = this.state;
        const isSecret = openTab === 'secret';
        const isLedger = openTab === 'ledger';
        const isTrezor = openTab === 'trezor';
        const viewTitle = title &&
            (<div className="LoginModalBlock_header">
                <span>{title}</span>
            </div>);

        return (
            <div className="LoginModalBlock">
                {viewTitle}
                <div className="LoginModalBlock_menu">
                    <div
                        onClick={() => this.handleChoose('secret')}
                        className={isSecret ? 'LoginModalBlock_menu_item active' : 'LoginModalBlock_menu_item'}>
                        <span>Secret key</span>
                    </div>
                    <div
                        onClick={() => this.handleChoose('ledger')}
                        className={isLedger ? 'LoginModalBlock_menu_item active' : 'LoginModalBlock_menu_item'}>
                        <span>Ledger</span>
                    </div>
                    <div
                        onClick={() => this.handleChoose('trezor')}
                        className={isTrezor ? 'LoginModalBlock_menu_item active' : 'LoginModalBlock_menu_item'}>
                        <span>Trezor</span>
                    </div>
                </div>
                <div className="LoginModalBlock_login_body">
                    {isSecret && <LoginPageBody d={d} modal />}
                    {isLedger && <LedgerBody d={d} modal />}
                    {isTrezor && <TrezorBody d={d} modal />}
                </div>
            </div>
        );
    }
}
LoginModalBlock.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
    title: PropTypes.string,
};
