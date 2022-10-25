import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';


export default class ActivityNavMenu extends React.Component {
    static getMenuItem(link, title, hasActiveItems) {
        const isCurrentTab = window.location.pathname === link ? ' is-current' : '';
        return (
            <Link className={`ActivityNavMenu_item${isCurrentTab}`} to={link}>
                <span>{title}</span>
                {hasActiveItems && <div className="green_dot" />}
            </Link>
        );
    }
    render() {
        const { hasOpenOffers } = this.props;
        return (
            <div className="ActivityNavMenu">
                {this.constructor.getMenuItem('/account/activity/', 'Active orders', hasOpenOffers)}
                {this.constructor.getMenuItem('/account/activity/trade/', 'Trades')}
                {this.constructor.getMenuItem('/account/activity/payments/', 'Payments')}
                {this.constructor.getMenuItem('/account/activity/swap/', 'Swap')}
                {this.constructor.getMenuItem('/account/activity/signers/', 'Signers')}
                {this.constructor.getMenuItem('/account/activity/trustlines/', 'Trustlines')}
            </div>
        );
    }
}
ActivityNavMenu.propTypes = {
    hasOpenOffers: PropTypes.bool,
};
