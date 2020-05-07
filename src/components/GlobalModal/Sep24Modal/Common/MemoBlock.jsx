import React from 'react';
import PropTypes from 'prop-types';

export default function MemoBlock(props) {
    const { memo, memoType, isDeposit } = props;

    const transactionType = isDeposit ? 'Deposit' : 'Withdraw';
    return (
        <React.Fragment>
            {memo ? (
                <div className="content_block">
                    <div className="content_title">{transactionType} memo</div>
                    <div className="content_text">{memo}</div>
                </div>
            ) : null}

            {memoType ? (
                <div className="content_block">
                    <div className="content_title">{transactionType} memo type</div>
                    <div className="content_text"><span>{memoType}</span></div>
                </div>
            ) : null}
        </React.Fragment>
    );
}

MemoBlock.propTypes = {
    memo: PropTypes.string,
    memoType: PropTypes.string,
    isDeposit: PropTypes.bool,
};
