import React from 'react';
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';
import Driver from '../../../../lib/Driver';

export default function SessionAccountMenu(props) {
    const { account } = props.d.session;
    const qtyOpenOffers = account && Object.values(account.offers).length;
    return (
        <div className="subNavBackClipper">
            <div className="so-back subNavBack">
                <div className="so-chunk subNav">
                    {props.onlyLogoutNav ? <nav className="subNav__nav" /> :
                        <nav className="subNav__nav">
                            <NavLink
                                className="subNav__nav__item"
                                exact
                                to="/account/"
                                activeClassName="is-current">Balances</NavLink>
                            <NavLink
                                className="subNav__nav__item"
                                to="/account/send"
                                activeClassName="is-current">Send</NavLink>
                            <NavLink
                                className="subNav__nav__item"
                                to="/account/addTrust/"
                                activeClassName="is-current">Accept assets</NavLink>
                            <NavLink
                                className="subNav__nav__item"
                                to="/account/multisig/"
                                activeClassName="is-current">Multisig</NavLink>
                            <NavLink
                                className="subNav__nav__item"
                                to="/account/activity/"
                                activeClassName="is-current">
                                    Activity
                                {!!qtyOpenOffers && <sup>{qtyOpenOffers}</sup>}
                            </NavLink>
                        </nav>
                    }
                    <nav className="subNav__nav">
                        <div
                            className="subNav__nav__item"
                            onClick={() => { this.props.d.session.handlers.logout(); }}>
                            <span>Log out</span>
                        </div>
                    </nav>
                </div>
            </div>
        </div>
    );
}

SessionAccountMenu.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
    onlyLogoutNav: PropTypes.bool,
};
