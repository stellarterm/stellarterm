import React from 'react';
import PropTypes from 'prop-types';
import QRCode from 'qrcode.react';
import createStellarIdenticon from 'stellar-identicon-js';
import clickToSelect from '../../../lib/clickToSelect';
import CopyButton from '../../Common/CopyButton/CopyButton';

export default function AccountIdBlock(props) {
    const { accountID } = props;
    const identicon = createStellarIdenticon(accountID).toDataURL();
    return (
        <div className="AccountIdBlock">
            <div className="AccountIdBlock_qrcode">
                <QRCode value={accountID} size={77} renderAs="svg" />
            </div>
            <div className="AccountIdBlock_main">
                <div className="AccountIdBlock_content">
                    <p>Your Wallet Account ID</p>
                    <div className="AccountIdBlock_id">
                        <div className="AccountIdBlock_identicon">
                            <img src={identicon} alt={accountID} />
                        </div>
                        <strong onClick={clickToSelect}>{accountID}</strong>
                    </div>
                </div>
                <CopyButton text={accountID} />
            </div>
        </div>
    );
}
AccountIdBlock.propTypes = {
    accountID: PropTypes.string.isRequired,
};
