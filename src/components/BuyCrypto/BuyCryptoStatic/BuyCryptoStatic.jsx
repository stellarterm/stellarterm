import React from 'react';
import images from '../../../images';

const BuyCryptoStatic = () => (
    <div className="BuyCrypto_static">
        <div className="BuyCrypto_main-advantages">
            <div className="BuyCrypto_advantage">
                <img className="BuyCrypto_advantage-logo" alt="" src={images['icon-circle-success']} />
                <div className="BuyCrypto_advantage-text">
                    <div className="BuyCrypto_advantage-title">Convenient</div>
                    <div className="BuyCrypto_advantage-description">
                        Deposit crypto to your wallet using Visa or MasterCard credit card
                    </div>
                </div>
            </div>

            <div className="BuyCrypto_advantage">
                <img className="BuyCrypto_advantage-logo" alt="" src={images['icon-fastClock']} />
                <div className="BuyCrypto_advantage-text">
                    <div className="BuyCrypto_advantage-title">Fast & Easy</div>
                    <div className="BuyCrypto_advantage-description">
                        Crypto assets reach your wallet in 10-30 minutes on average
                    </div>
                </div>
            </div>

            <div className="BuyCrypto_advantage">
                <img className="BuyCrypto_advantage-logo" alt="" src={images['icon-lock']} />
                <div className="BuyCrypto_advantage-text">
                    <div className="BuyCrypto_advantage-title">Secure</div>
                    <div className="BuyCrypto_advantage-description">
                        Moonpay.io complies with PCI SAQ when storing, processing and transmitting cardholder data
                    </div>
                </div>
            </div>
        </div>

        <div className="BuyCrypto_facts">
            <div className="BuyCrypto_fact">
                <img src={images['icon-tick-small']} alt="" />
                <span>Available in 70+ countries (and selected US states)</span>
            </div>

            <div className="BuyCrypto_fact">
                <img src={images['icon-tick-small']} alt="" />
                <span>Verification typically takes about 30 minutes</span>
            </div>

            <div className="BuyCrypto_fact">
                <img src={images['icon-tick-small']} alt="" />
                <span>Supports most major credit cards, including virtual, prepaid and debit cards</span>
            </div>

            <div className="BuyCrypto_fact">
                <img src={images['icon-tick-small']} alt="" />
                <span>One-time KYC verification (passport, phone number) may be required by the provider</span>
            </div>

            <a
                href="https://support.moonpay.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="BuyCrypto_read-more"
            >
                Read more
                <img src={images['icon-arrow-right-green-small']} alt="" />
            </a>
        </div>
    </div>
);

export default BuyCryptoStatic;
