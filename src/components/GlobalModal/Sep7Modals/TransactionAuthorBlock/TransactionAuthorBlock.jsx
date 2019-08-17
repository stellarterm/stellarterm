import React from 'react';
import PropTypes from 'prop-types';

const images = require('./../../../../images');


export default function TransactionAuthorBlock(props) {
    const { domain } = props;
    if (domain === undefined) {
        return (
            <div className="TransactionAuthorBlock">
                <div className="TransactionAuthorBlock_header">
                    <span>Transaction author:</span>
                    <div className="TransactionAuthorBlock_author">
                        <img src={images['icon-spy']} alt="spy" />
                        <span>Unknown</span>
                    </div>
                </div>
                <div className="TransactionAuthorBlock_attention">
                    Origin domain is not provided for this transaction signature request.
                    This transaction is potentially harmful to your account and may be a scam.
                    Be extra careful and sign the transaction only if you are 100% confident in its source and its nature.
                </div>
            </div>
        );
    }
    return (
        <div className="TransactionAuthorBlock">
            <div className="TransactionAuthorBlock_header">
                <span>Transaction author:</span>
                <span>{domain}</span>
            </div>
            <div className="TransactionAuthorBlock_content">
                This transaction signature request originates from a third-party source.
                Please carefully review the details before signing the transaction.
            </div>
        </div>
    );
}
TransactionAuthorBlock.propTypes = {
    domain: PropTypes.string,
};
