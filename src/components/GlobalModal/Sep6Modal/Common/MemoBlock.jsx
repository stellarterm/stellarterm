import React from 'react';
import PropTypes from 'prop-types';

export default function MemoBlock(props) {
    const { memo, memoType } = props;
    const isNoMemo = memo === '';

    return isNoMemo ? null : (
        <div className="content_block">
            <div className="content_title">Memo</div>
            <div className="content_text">{memo}</div>
        </div>
    );
}

MemoBlock.propTypes = {
    memo: PropTypes.string.isRequired,
    memoType: PropTypes.string.isRequired,
};
