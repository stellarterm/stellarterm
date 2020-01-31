import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import images from './../../../../../images';


export default function LedgerLoginLink(props) {
    const { narrow } = props;
    return (
        <Link to="/ledger/" className={`LedgerLoginLink ${narrow ? 'narrow' : ''}`}>
            <div className="LedgerLoginLink_wrap">
                <div className="LedgerLoginLink_logo">
                    <img src={images['ledger-logo-main']} alt="ledger" />
                </div>
                <div className="LedgerLoginLink_description">
                    <span className="LedgerLoginLink_description-title">Log in with Ledger</span>
                    <span>Use StellarTerm to access your account on Ledger device</span>
                </div>
            </div>
            <img src={images['icon-arrow-right-green-small']} alt=">" />
        </Link>
    );
}
LedgerLoginLink.propTypes = {
    narrow: PropTypes.bool,
};
