import React from 'react';
import PropTypes from 'prop-types';
import QRCode from 'qrcode.react';
import CopyButton from '../../CopyButton';
import clickToSelect from '../../../lib/clickToSelect';


export default function AccountIdBlock(props) {
    const { accountID } = props;
    return (
        <div className="AccountIdBlock">
            <div className="AccountIdBlock_qrcode">
                <QRCode value={accountID} size={104} renderAs="svg" />
            </div>
            <div className="AccountIdBlock_main">
                <div className="AccountIdBlock_content">
                    <p>Your Wallet Account ID</p>
                    <strong onClick={clickToSelect}>{accountID}</strong>
                </div>
                <CopyButton text={accountID} />
            </div>
        </div>
    );
}
AccountIdBlock.propTypes = {
    accountID: PropTypes.string.isRequired,
};
