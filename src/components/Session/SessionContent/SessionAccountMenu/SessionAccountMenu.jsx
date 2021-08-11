import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import Driver from '../../../../lib/Driver';

export default class SessionAccountMenu extends React.Component {
    static createMenuTab(url, text, active) {
        const currentAccountUrlPart = window.location.pathname.split('/')[2];
        const accountUrlPart = url.split('/')[2];
        const isCurrentTab = currentAccountUrlPart === accountUrlPart ? ' is-current' : '';

        return (
            <Link className={`subNav__nav__item${isCurrentTab}`} to={url}>
                <span>{text}</span>
                {!!active && <sup>{active}</sup>}
            </Link>
        );
    }

    componentDidMount() {
        this.unlisten = this.props.d.claimableBalances.event.sub(() => {
            this.forceUpdate();
        });
    }

    componentWillUnmount() {
        this.unlisten();
    }

    render() {
        const { d } = this.props;
        const { account, state } = d.session;
        const openOffersCount = state === 'in' && Object.values(account.offers).length;

        const { pendingClaimableBalancesCount } = d.claimableBalances;

        return (
            <div className="subNavBackClipper">
                <div className="so-back subNavBack">
                    <div className="so-chunk subNav">
                        {this.props.onlyLogoutNav ? <nav className="subNav__nav" /> :
                            <nav className="subNav__nav">
                                {this.constructor.createMenuTab('/account/', 'Balances')}
                                {this.constructor.createMenuTab('/account/send', 'Send')}
                                {this.constructor.createMenuTab('/account/addTrust/', 'Accept assets')}
                                {this.constructor.createMenuTab('/account/multisig/', 'Multisig')}
                                {this.constructor.createMenuTab(
                                    '/account/activity/',
                                    'Activity',
                                    openOffersCount)
                                }
                                {this.constructor.createMenuTab(
                                    '/account/pending-payments/',
                                    'Pending payments',
                                    pendingClaimableBalancesCount)
                                }
                                {this.constructor.createMenuTab('/account/settings/', 'Settings')}
                            </nav>
                        }
                        <nav className="subNav__nav">
                            <a
                                className="subNav__nav__item"
                                onClick={() => { this.props.d.session.handlers.logout(); }}
                            >
                                <span>Log out</span>
                            </a>
                        </nav>
                    </div>
                </div>
            </div>
        );
    }
}

SessionAccountMenu.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
    onlyLogoutNav: PropTypes.bool,
};
