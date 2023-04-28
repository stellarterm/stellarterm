/* eslint-disable camelcase */
import React from 'react';
import moment from 'moment';
import PropTypes from 'prop-types';
import images from '../../../../images';
import MemoBlock from '../../Sep24Modal/Common/MemoBlock';
import EstimatedTime from '../../Sep24Modal/Common/EstimatedTime';
import { formatNumber } from '../../../../lib/helpers/Format';
import { hasIdInCache, mapStatus } from '../../../../lib/constants/sep24Constants';
import DestinationBlock from './DestinationBlock/DestinationBlock';

export default class TransactionContent extends React.Component {
    static getReadableDate(date) {
        return moment(new Date(date)).format('MMMM D YYYY, HH:mm');
    }

    static getInfoBlock(title, text, config) {
        const { withoutCapitalize, bold } = config || {};


        return text ? (
            <div className="content_block">
                <div className="content_title">{title}</div>
                <div className="content_text">
                    <span className={`${withoutCapitalize ? '' : 'capitalized'} ${bold ? 'bold' : ''}`}>
                        {text}
                    </span>
                </div>
            </div>
        ) : null;
    }

    static getAssetCode(specifiedAssetField, anchoredAsset) {
        if (!specifiedAssetField) {
            return anchoredAsset.code;
        }

        const [, assetCode] = specifiedAssetField.split(':');

        return assetCode;
    }

    constructor(props) {
        super(props);

        this.state = {
            showDetails: false,
        };
    }

    renderDepositInfo() {
        const { transaction } = this.props;

        const {
            deposit_memo,
            deposit_memo_type,
        } = transaction;

        if (!deposit_memo) {
            return null;
        }

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
                <DestinationBlock destination={withdraw_anchor_account} label="Anchor's withdrawal address" />

                {withdraw_memo ?
                    <MemoBlock memo={withdraw_memo} memoType={withdraw_memo_type} isDeposit={false} /> :
                    null
                }
            </React.Fragment>
        );
    }

    render() {
        const { transaction, isDeposit, asset } = this.props;

        const {
            status,
            status_eta,
            message,
            started_at,
            completed_at,
            more_info_url,
            from,
            to,
            amount_in,
            amount_in_asset,
            amount_out,
            amount_out_asset,
            amount_fee,
            amount_fee_asset,
            id,
            external_transaction_id,
            stellar_transaction_id,
        } = transaction;

        const { showDetails } = this.state;

        const startDate = this.constructor.getReadableDate(started_at);
        const completeDate = this.constructor.getReadableDate(completed_at);

        const wasFunded = transaction && hasIdInCache(transaction.id) && transaction.status === 'pending_user_transfer_start';

        return (
            <div className="transaction_Info">
                {more_info_url && (
                    <div className="more_Info">
                        <a href={more_info_url} target="_blank" rel="nofollow noopener noreferrer">
                            more info
                            <img title="More info" src={images['icon-info']} alt="i" />
                        </a>
                    </div>
                )}
                {this.constructor.getInfoBlock('Status', mapStatus(wasFunded ? 'await_anchor' : status, isDeposit))}
                {to ? <DestinationBlock label="Destination" destination={to} /> : null}
                {amount_in ? this.constructor.getInfoBlock(
                    `Amount you ${isDeposit ? 'deposit' : 'withdraw'}`,
                    `${formatNumber(amount_in)} ${this.constructor.getAssetCode(amount_in_asset, asset)}`,
                    { bold: true }) :
                    null
                }
                {amount_fee ? this.constructor.getInfoBlock('Fees', `${formatNumber(amount_fee)} ${this.constructor.getAssetCode(amount_fee_asset, asset)}`) : null}
                {amount_out ? this.constructor.getInfoBlock(
                    'Amount you receive',
                    `${formatNumber(amount_out)} ${this.constructor.getAssetCode(amount_out_asset, asset)}`,
                    { bold: true }) :
                    null
                }

                {showDetails ? (
                    <div className="otherDetails">
                        {isDeposit ? this.renderDepositInfo() : this.renderWithdrawInfo()}
                        {id ? this.constructor.getInfoBlock('Transaction ID', id, { withoutCapitalize: true }) : null}
                        {stellar_transaction_id ? this.constructor.getInfoBlock('Stellar transaction ID', stellar_transaction_id, { withoutCapitalize: true }) : null}
                        {external_transaction_id ? this.constructor.getInfoBlock('External transaction ID', external_transaction_id, { withoutCapitalize: true }) : null}
                        {this.constructor.getInfoBlock('Details', message)}
                        {from ? <DestinationBlock label="Source" destination={from} /> : null}
                        {started_at ? this.constructor.getInfoBlock('Started at', startDate) : null}
                        {completed_at ? this.constructor.getInfoBlock('Completed at', completeDate) : null}
                        {status_eta ? <EstimatedTime time={status_eta} /> : null}
                    </div>
                ) : (
                    <div className="ShowMore" onClick={() => this.setState({ showDetails: true })}>
                        Show other details
                    </div>
                )}
            </div>
        );
    }
}

TransactionContent.propTypes = {
    isDeposit: PropTypes.bool.isRequired,
    transaction: PropTypes.objectOf(PropTypes.any).isRequired,
    asset: PropTypes.objectOf(PropTypes.any).isRequired,
};
