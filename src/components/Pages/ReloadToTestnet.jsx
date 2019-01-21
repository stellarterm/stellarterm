import React from 'react';
import Generic from '../Generic';
import Loading from '../Loading';

export default () => (
    <Generic title="Please refresh the page to switch to testnet">
        <Loading darker>Please refresh the page to switch to testnet.</Loading>
    </Generic>
);
