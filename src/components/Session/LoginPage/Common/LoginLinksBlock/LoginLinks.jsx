import React from 'react';
import PropTypes from 'prop-types';
import LoginLink from './LoginLink/LoginLink';

const LoginLinks = ({ narrow }) => (
    <div className={`LoginLinks ${narrow ? 'narrow' : ''}`}>
        <div className="LoginLinks_title">Connect your wallet</div>
        <div className="LoginLinks_description">Log in with one of the supported wallet providers</div>

        <div className="LoginLinks_links">
            <LoginLink wallet={'lobstr'} />
            <LoginLink wallet={'walletConnect'} />
            <LoginLink wallet={'freighter'} />
            <LoginLink wallet={'ledger'} />
            <LoginLink wallet={'trezor'} />
        </div>
    </div>
);
LoginLinks.propTypes = {
    narrow: PropTypes.bool,
};

export default LoginLinks;
