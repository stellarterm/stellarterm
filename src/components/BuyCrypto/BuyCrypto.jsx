import React from 'react';
import BuyCryptoStatic from './BuyCryptoStatic/BuyCryptoStatic';


const BuyCrypto = () => (
    <div className="BuyCrypto_wrapper">
        <div className="BuyCrypto_main">
            <div className="BuyCrypto_main-text-block">
                <div className="BuyCrypto_title">
                    Buy crypto assets <br /> with VISA or Mastercard
                </div>
                <div className="BuyCrypto_description">
                    With StellarTerm, you can easily buy Lumens, Bitcoin, Ethereum, Ripple
                    and other cryptocurrencies using US Dollars or Euro
                </div>
            </div>
            <div className="BuyCrypto_form" />
        </div>

        <BuyCryptoStatic />
    </div>
);

export default BuyCrypto;
