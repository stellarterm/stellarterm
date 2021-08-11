import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import images from '../../../../../images';
import Driver from '../../../../../lib/Driver';

const NewClaimableBalancesBanner = ({ d }) => (
    <div className="NewClaimableBalancesBanner">
        <img src={images.claim} alt="" />

        <div className="NewClaimableBalancesBanner_content">
            <div className="NewClaimableBalancesBanner_title">New pending payment</div>
            <div className="NewClaimableBalancesBanner_description">
                    You have a new pending payment. Accept this payment manually to receive your tokens.
            </div>
        </div>
        <div className="NewClaimableBalancesBanner_buttons">
            <button className="cancel-button" onClick={() => d.claimableBalances.hideBanner()}>Not now</button>
            <Link to="./pending-payments/">
                <button onClick={() => d.claimableBalances.hideBanner()} className="s-button">View payments</button>
            </Link>
        </div>
    </div>
);
export default NewClaimableBalancesBanner;

NewClaimableBalancesBanner.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
};
