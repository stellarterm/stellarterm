import React from 'react';
import images from '../../../../../images';

export default () => (
    <div className="LoginPage_instructions">
        <p className="LoginPage__title">Setup instructions</p>
        <ol>
            <li>
                Get a Trezor device and connect it to your computer.
                <div className="LoginPage_instructions-image">
                    <img src={images['trezor-picture']} alt="trezor" width="250" />
                </div>
            </li>
            <li>
                Set up your Trezor device by following{' '}
                <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href="https://wiki.trezor.io/Getting_started_in_5_steps"
                >
                    instructions
                </a>
                {' '}on the Trezor website.
            </li>
            <li>
                Open{' '}
                <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href="https://trezor.io/trezor-suite"
                >
                    Trezor Suite
                </a>
                {' '}on your computer, or use Trezor Suite in the browser when prompted.
                StellarTerm connects to your device through Trezor Suite.
            </li>
            <li>
                Return to StellarTerm and log in with your Trezor device.
            </li>
            <li className="without-order-number">
                Additional info about Trezor, you can find on the{' '}
                <a
                    href="https://trezor.io/"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    official Trezor website
                </a>
                .
            </li>
        </ol>
    </div>
);
