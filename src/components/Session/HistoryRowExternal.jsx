import React from 'react';
import PropTypes from 'prop-types';

export default function HistoryRowExternal(props) {
    return (
        <React.Fragment>
            <div className="HistoryView__external">
                View in external website:&nbsp;
                <a
                    href={`https://stellar.expert/explorer/tx/${props.hash}`}
                    target="_blank"
                    rel="nofollow noopener noreferrer">
                    stellar.expert
                </a>
                &nbsp;
                <a
                    href={`https://horizon.stellar.org/transactions/${props.hash}`}
                    target="_blank"
                    rel="nofollow noopener noreferrer">
                    Horizon
                </a>
            </div>
            <div className="HistoryView__external">
                Transaction ID: <strong>{props.hash}</strong>
            </div>
        </React.Fragment>
    );
}

HistoryRowExternal.propTypes = {
    hash: PropTypes.string.isRequired,
};
