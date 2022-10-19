/* eslint-disable camelcase */
import React, { useEffect, useState } from 'react';
import StellarSdk from 'stellar-sdk';
import { AutoSizer, InfiniteLoader, List } from 'react-virtualized';
import PropTypes from 'prop-types';
import { formatDate, ROW_HEIGHT, SCROLL_WIDTH, TABLE_MAX_HEIGHT } from '../Activity';
import AssetCardInRow from '../../../../Common/AssetCard/AssetCardInRow/AssetCardInRow';
import images from '../../../../../images';
import useForceUpdate from '../../../../../lib/hooks/useForceUpdate';
import { PAYMENTS_EVENTS } from '../../../../../lib/driver/driverInstances/Payments';
import Printify from '../../../../../lib/helpers/Printify';
import Driver from '../../../../../lib/driver/Driver';


const SWAP_TYPES = ['path_payment_strict_send', 'path_payment_strict_receive'];


const filterSwapHistory = history => history.filter(({ type, from, to }) => SWAP_TYPES.includes(type) && from === to);

const ActivitySwapHistory = ({ d }) => {
    const [history, setHistory] = useState(d.payments.paymentsHistory);

    const { forceUpdate } = useForceUpdate();

    useEffect(() => {
        const unsubPayments = d.payments.event.sub(event => {
            if (event.type === PAYMENTS_EVENTS.NEXT_PAYMENTS_REQUEST &&
                !filterSwapHistory(event.newItems).length
            ) {
                d.payments.loadMorePaymentsHistory();
            }

            setHistory(d.payments.paymentsHistory);
            forceUpdate();
        });

        if (!d.payments.paymentsHistory.length) {
            d.payments.getPaymentsHistory();
        }

        return () => unsubPayments();
    }, []);

    const { loading } = d.payments;

    const swapHistory = filterSwapHistory(history);

    const listHeight = ROW_HEIGHT * swapHistory.length;
    const maxHeight = Math.min(listHeight, TABLE_MAX_HEIGHT);
    const withScroll = listHeight > TABLE_MAX_HEIGHT;

    const getRow = (item, key, style, isTestnet) => {
        const {
            created_at,
            source_asset_type,
            source_asset_code,
            source_asset_issuer,
            source_amount,
            asset_type,
            asset_code,
            asset_issuer,
            amount,
            transaction_hash,
        } = item;

        const { time, date } = formatDate(created_at);

        const sourceAsset = source_asset_type === 'native' ? StellarSdk.Asset.native() : new StellarSdk.Asset(source_asset_code, source_asset_issuer);
        const destAsset = asset_type === 'native' ? StellarSdk.Asset.native() : new StellarSdk.Asset(asset_code, asset_issuer);

        return (
            <div key={key} style={style} className="Activity-table-row">
                <div className="Activity-table-cell">{date} {time}</div>
                <div className="Activity-table-cell flex5">
                    <AssetCardInRow d={d} code={sourceAsset.code} issuer={sourceAsset.issuer} />
                </div>
                <div className="Activity-table-cell flex5">
                    <AssetCardInRow d={d} code={destAsset.code} issuer={destAsset.issuer} />
                </div>
                <div className="Activity-table-cell">{Printify.lightenZeros(source_amount, undefined, ` ${sourceAsset.code}`)}</div>
                <div className="Activity-table-cell">{Printify.lightenZeros(amount, undefined, ` ${destAsset.code}`)}</div>
                <div className="Activity-table_actions Activity-table-cell flex1">
                    <a
                        href={`https://stellar.expert/explorer/${isTestnet ? 'testnet' : 'public'}/tx/${transaction_hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <img title="StellarExpert" src={images['icon-info']} alt="i" />
                    </a>
                </div>
            </div>
        );
    };


    return (
        <div className="Activity_wrap">
            <div className="Activity_header">
                <span>
                    Swap history
                    {loading &&
                        <span className="nk-spinner-small-black">
                            <div className="nk-spinner" />
                        </span>
                    }
                </span>
            </div>
            <div className="Activity-table">
                <div className="Activity-table-row head" style={{ marginRight: withScroll ? SCROLL_WIDTH : 0 }}>
                    <div className="Activity-table-cell">Date/Time</div>
                    <div className="Activity-table-cell flex5">From</div>
                    <div className="Activity-table-cell flex5">To</div>
                    <div className="Activity-table-cell" />
                    <div className="Activity-table-cell" />
                    <div className="Activity-table-cell Activity-table_actions flex1" />
                </div>
                <div style={{ height: maxHeight }} className="Activity-table-body">
                    <AutoSizer>
                        {({ height, width }) => (
                            <InfiniteLoader
                                isRowLoaded={() => {}}
                                rowCount={swapHistory.length}
                                loadMoreRows={e => {
                                    if (e.stopIndex + 40 > swapHistory.length) {
                                        d.payments.loadMorePaymentsHistory();
                                    }
                                }}
                            >
                                {({ onRowsRendered, registerChild }) => (
                                    <List
                                        width={width}
                                        height={height}
                                        onRowsRendered={onRowsRendered}
                                        ref={registerChild}
                                        rowHeight={ROW_HEIGHT}
                                        rowCount={swapHistory.length}
                                        rowRenderer={
                                            ({ key, index, style }) =>
                                                getRow(
                                                    swapHistory[index],
                                                    key,
                                                    style,
                                                    d.Server.isTestnet,
                                                )
                                        }
                                    />
                                )}
                            </InfiniteLoader>
                        )}
                    </AutoSizer>
                </div>
            </div>
        </div>
    );
};

export default ActivitySwapHistory;

ActivitySwapHistory.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
};
