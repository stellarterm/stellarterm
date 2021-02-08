/* eslint-disable camelcase */
import React from 'react';
import _ from 'lodash';
import moment from 'moment';
import PropTypes from 'prop-types';
import images from '../../../../images';
import MemoBlock from '../../Sep24Modal/Common/MemoBlock';
import EstimatedTime from '../../Sep24Modal/Common/EstimatedTime';

export default class TransactionContent extends React.Component {
    static getReadableDate(date) {
        return moment(new Date(date)).format('MMMM D YYYY, HH:mm');
    }

    static getInfoBlock(title, text) {
        return text ? (
            <div className="content_block">
                <div className="content_title">{title}</div>
                <div className="content_text"><span>{text}</span></div>
            </div>
        ) : null;
    }

    renderDepositInfo() {
        const { transaction } = this.props;

        const {
            deposit_memo,
            deposit_memo_type,
        } = transaction;

        return (
            <MemoBlock memo={deposit_memo} memoType={deposit_memo_type} isDeposit />
        );
    }

    renderWithdrawInfo() {
        const { transaction } = this.props;

        const {
            withdraw_memo,
            withdraw_memo_type,
            withdraw_anchor_account,
        } = transaction;

        return (
            <React.Fragment>
                {this.constructor.getInfoBlock('Anchor\'s withdrawal address', withdraw_anchor_account)}

                <MemoBlock memo={withdraw_memo} memoType={withdraw_memo_type} isDeposit={false} />
            </React.Fragment>
        );
    }

    render() {
        const { transaction, isDeposit, asset } = this.props;
        const {
            kind,
            status,
            status_eta,
            message,
            started_at,
            completed_at,
            more_info_url,
            from,
            to,
            amount_in,
            amount_out,
            amount_fee,
        } = transaction;

        const readableStatus = status.replace(/_/g, ' ');
        const startDate = this.constructor.getReadableDate(started_at);
        const completeDate = this.constructor.getReadableDate(completed_at);

        return (
            <div className="transaction_Info">
                {more_info_url && (
                    <div className="more_Info">
                        <a href={more_info_url} target="_blank" rel="nofollow noopener noreferrer">
                            <img title="More info" src={images['icon-info']} alt="i" />
                        </a>
                    </div>
                )}
                {this.constructor.getInfoBlock('Type', kind)}
                {this.constructor.getInfoBlock('Status', readableStatus)}
                {started_at ? this.constructor.getInfoBlock('Started time', startDate) : null}
                {completed_at ? this.constructor.getInfoBlock('Completed at', completeDate) : null}
                {from ? this.constructor.getInfoBlock('Source', from) : null}
                {to ? this.constructor.getInfoBlock('Destination', to) : null}
                {isDeposit ? this.renderDepositInfo() : this.renderWithdrawInfo()}
                {amount_in ? this.constructor.getInfoBlock('Payment amount', `${amount_in} ${asset.code}`) : null}
                {amount_out ? this.constructor.getInfoBlock('Order amount', `${amount_out} ${asset.code}`) : null}
                {this.constructor.getInfoBlock('Details', message)}
                {amount_fee ? this.constructor.getInfoBlock('Fee', `${amount_fee} ${asset.code}`) : null}
                {status_eta ? <EstimatedTime time={status_eta} /> : null}
            </div>
        );
    }
}

TransactionContent.propTypes = {
    isDeposit: PropTypes.bool.isRequired,
    transaction: PropTypes.objectOf(PropTypes.any).isRequired,
    asset: PropTypes.objectOf(PropTypes.any).isRequired,
};
