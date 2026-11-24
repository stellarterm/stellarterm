import React from 'react';
import PropTypes from 'prop-types';
import Driver from '../../../../lib/driver/Driver';
import LoginPageBody from '../../../Session/LoginPage/LoginPageBody/LoginPageBody';
import LedgerBody from '../../../Session/LoginPage/LedgerBody/LedgerBody';
import TrezorBody from '../../../Session/LoginPage/TrezorBody/TrezorBody';
import VarialBody from '../../../Session/LoginPage/VarialBody/VarialBody';
import WalletConnectBody from '../../../Session/LoginPage/WalletConnectBody/WalletConnectBody';
import LobstrExtensionBody from '../../../Session/LoginPage/LobstrExtensionBody/LobstrExtensionBody';

const TABS = {
    SECRET: 'secret',
    LEDGER: 'ledger',
    TREZOR: 'trezor',
    VARIAL: 'varial',
    WALLET_CONNECT: 'wallet-connect',
    LOBSTR: 'lobstr',
};

export default class LoginModalBlock extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            openTab: TABS.SECRET,
        };
    }

    getTabClassName(tab) {
        return `LoginModalBlock_menu_item ${this.isActiveTab(tab) ? 'active' : ''}`;
    }

    getActiveTab(tab) {
        const { d } = this.props;

        switch (tab) {
            case TABS.SECRET: {
                return <LoginPageBody d={d} modal />;
            }
            case TABS.LOBSTR: {
                return <LobstrExtensionBody d={d} modal />;
            }
            case TABS.WALLET_CONNECT: {
                return <WalletConnectBody d={d} modal />;
            }
            case TABS.LEDGER: {
                return <LedgerBody d={d} modal />;
            }
            case TABS.TREZOR: {
                return <TrezorBody d={d} modal />;
            }
            case TABS.VARIAL: {
                return <VarialBody d={d} modal />;
            }
            default: throw new Error('Unknown tab name');
        }
    }

    isActiveTab(tab) {
        return this.state.openTab === tab;
    }

    handleChoose(tab) {
        this.setState({ openTab: tab });
    }


    render() {
        const { title } = this.props;
        const { openTab } = this.state;
        const viewTitle = title &&
            (<div className="LoginModalBlock_header">
                <span>{title}</span>
            </div>);

        return (
            <div className="LoginModalBlock">
                {viewTitle}
                <div className="LoginModalBlock_menu">
                    <div
                        onClick={() => this.handleChoose(TABS.SECRET)}
                        className={this.getTabClassName(TABS.SECRET)}
                    >
                        <span>Secret key</span>
                    </div>
                    <div
                        onClick={() => this.handleChoose(TABS.LOBSTR)}
                        className={this.getTabClassName(TABS.LOBSTR)}
                    >
                        <span>LOBSTR wallet</span>
                    </div>
                    <div
                        onClick={() => this.handleChoose(TABS.WALLET_CONNECT)}
                        className={this.getTabClassName(TABS.WALLET_CONNECT)}
                    >
                        <span>WalletConnect</span>
                    </div>
                    <div
                        onClick={() => this.handleChoose(TABS.VARIAL)}
                        className={this.getTabClassName(TABS.VARIAL)}
                    >
                        <span>Varial</span>
                    </div>
                    <div
                        onClick={() => this.handleChoose(TABS.LEDGER)}
                        className={this.getTabClassName(TABS.LEDGER)}
                    >
                        <span>Ledger</span>
                    </div>
                    <div
                        onClick={() => this.handleChoose(TABS.TREZOR)}
                        className={this.getTabClassName(TABS.TREZOR)}
                    >
                        <span>Trezor</span>
                    </div>
                </div>
                <div className="LoginModalBlock_login_body">
                    {this.getActiveTab(openTab)}
                </div>
            </div>
        );
    }
}
LoginModalBlock.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
    title: PropTypes.string,
};
