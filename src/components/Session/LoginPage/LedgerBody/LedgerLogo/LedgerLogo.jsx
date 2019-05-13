import React from 'react';
import images from '../../../../../images';

export default () => (
    <div className="LoginBox__ledgerNanoHeader">
        <img
            src={images['ledger-logo']}
            className="img--noSelect"
            alt="Ledger Logo"
            width="300"
            height="80" />
        <img
            src={images['ledger-nano-s-buttons']}
            className="img--noSelect"
            alt="Ledger Nano S"
            width="382"
            height="100" />
    </div>
);
