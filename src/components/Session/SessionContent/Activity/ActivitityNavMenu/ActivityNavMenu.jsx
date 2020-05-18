import React from 'react';
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';


export default function ActivityNavMenu(props) {
    const { hasOpenOffers } = props;
    return (
        <div className="ActivityNavMenu">
            <NavLink
                exact
                to="/account/activity/"
                className="ActivityNavMenu_item"
                activeClassName="is-current">
                    Active orders
                {hasOpenOffers && <div className="green_dot" />}
            </NavLink>

            <NavLink
                to="/account/activity/trade/"
                className="ActivityNavMenu_item"
                activeClassName="is-current">Trades</NavLink>

            <NavLink
                to="/account/activity/payments/"
                className="ActivityNavMenu_item"
                activeClassName="is-current">Payments</NavLink>

            <NavLink
                to="/account/activity/signers/"
                className="ActivityNavMenu_item"
                activeClassName="is-current">Signers</NavLink>

            <NavLink
                to="/account/activity/trustlines/"
                className="ActivityNavMenu_item"
                activeClassName="is-current">Trustlines</NavLink>

        </div>
    );
}
ActivityNavMenu.propTypes = {
    hasOpenOffers: PropTypes.bool,
};
