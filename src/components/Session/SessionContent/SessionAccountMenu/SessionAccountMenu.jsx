import React from 'react';
import PropTypes from 'prop-types';
import Driver from '../../../../lib/Driver';

export default class SessionAccountMenu extends React.Component {
    static createMenuTab(url, text) {
        const isCurrentTab = window.location.hash === url ? ' is-current' : '';

        return (
            <a className={`subNav__nav__item${isCurrentTab}`} href={url}>
                <span>{text}</span>
            </a>
        );
    }

    render() {
        return (
            <div className="subNavBackClipper">
                <div className="so-back subNavBack">
                    <div className="so-chunk subNav">
                        <nav className="subNav__nav">
                            {this.constructor.createMenuTab('#account', 'Balances')}
                            {this.constructor.createMenuTab('#account/send', 'Send')}
                            {this.constructor.createMenuTab('#account/addTrust', 'Accept assets')}
                            {this.constructor.createMenuTab('#account/multisig', 'Multisig')}
                            {this.constructor.createMenuTab('#account/history', 'History')}
                        </nav>
                        <nav className="subNav__nav">
                            <a
                                className="subNav__nav__item"
                                href="#account"
                                onClick={() => { this.props.d.session.handlers.logout(); }}>
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
};
