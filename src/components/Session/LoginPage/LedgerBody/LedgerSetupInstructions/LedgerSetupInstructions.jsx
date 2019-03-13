import React from 'react';
import images from '../../../../../images';

export default () => (
    <div className="LoginPage__paddedBox">
        <h3>Setup instructions</h3>
        <ol>
            <li>Get a Ledger Nano S and connect it to your computer.</li>
            <li>
                Set up your Ledger Nano S by following instructions on the Ledger site:{' '}
                <a
                    href="https://www.ledgerwallet.com/start/ledger-nano-s"
                    target="_blank"
                    rel="nofollow noopener noreferrer">
                    https://www.ledgerwallet.com/start/ledger-nano-s
                </a>
            </li>

            <li>
                Install the{' '}
                <a href="https://www.ledgerwallet.com/apps/manager" target="_blank" rel="nofollow noopener noreferrer">
                    Ledger Manager
                </a>{' '}
                app on your computer:{' '}
                <a href="https://www.ledgerwallet.com/apps/manager" target="_blank" rel="nofollow noopener noreferrer">
                    https://www.ledgerwallet.com/apps/manager
                </a>
            </li>

            <li>
                Inside the Ledger Manager app, go to Applications and install the Stellar app.
                <br />
                <img
                    src={images['ledger-app']}
                    className="img--noSelect"
                    alt="Stellar app installation inside Ledger Manager"
                    width="355"
                    height="77" />
            </li>

            <li>
                On your Ledger device, nagivate to the Stellar app and open the app.
                <br />
                <img
                    src={images['ledger-nano-picture']}
                    className="img--noSelect"
                    alt="Ledger Nano Pic"
                    width="300"
                    height="135" />
            </li>

            <li>
                Inside the app, go to <strong>Settings</strong>, then <strong>Browser support</strong>, then select{' '}
                <strong>yes</strong> and press both buttons.
            </li>
        </ol>
    </div>
);
