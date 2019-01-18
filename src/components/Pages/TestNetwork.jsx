import React from 'react';
import Generic from '../Generic.jsx';

export default () => (
    <Generic title="Test network">
        You are running on the
        <a href="https://www.stellar.org/developers/guides/concepts/test-net.html" target="_blank" rel="nofollow noopener noreferrer">
            Stellar test network</a>.
        This network is for development purposes only and the test network may be occasionally reset.

        <br />

        To create a test account on the test network, use the
        <a href="https://www.stellar.org/laboratory/#account-creator?network=test" target="_blank" rel="nofollow noopener noreferrer">
            Friendbot to get some test lumens</a>.
    </Generic>
);
