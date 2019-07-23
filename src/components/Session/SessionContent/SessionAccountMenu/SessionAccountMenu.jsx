import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import Driver from '../../../../lib/Driver';

export default class SessionAccountMenu extends React.Component {
    static createMenuTab(url, text) {
        const isCurrentTab = window.location.pathname === url ? ' is-current' : '';

        return (
            <Link className={`subNav__nav__item${isCurrentTab}`} to={url}>
                <span>{text}</span>
            </Link>
        );
    }

    render() {
        return (
            <div className="subNavBackClipper">
                <div className="so-back subNavBack">
                    <div className="so-chunk subNav">
                        {this.props.onlyLogoutNav ? <nav className="subNav__nav" /> :
                            <nav className="subNav__nav">
                                {this.constructor.createMenuTab('/account/', 'Balances')}
                                {this.constructor.createMenuTab('/account/send/', 'Send')}
                                {this.constructor.createMenuTab('/account/addTrust/', 'Accept assets')}
                                {this.constructor.createMenuTab('/account/multisig/', 'Multisig')}
                                {this.constructor.createMenuTab('/account/history/', 'History')}
                            </nav>
                        }
                        <nav className="subNav__nav">
                            <Link
                                className="subNav__nav__item"
                                to="/account/"
                                onClick={() => { this.props.d.session.handlers.logout(); }}>
                                <span>Log out</span>
                            </Link>
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
