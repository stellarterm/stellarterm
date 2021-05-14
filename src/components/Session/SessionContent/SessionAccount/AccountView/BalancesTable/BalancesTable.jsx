import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import Driver from '../../../../../../lib/Driver';
import Printify from '../../../../../../lib/Printify';
import { get24hChangePercent } from '../../../../../../lib/Format';
import PercentChange from '../../../../../Basics/PercentChange/PercentChange';
import AssetCardMain from '../../../../../Common/AssetCard/AssetCardMain/AssetCardMain';
import AssetActionButtons from '../AssetActionButtons';

export default function BalancesTable(props) {
    const TABLE_HEADERS = ['Asset', 'Balance', 'Value (USD)', 'Change (24h)'];

    const { d } = props;
    const account = d.session.account;
    // getSortedBalances from MagicSpoon.Account
    // Then generating USD balance and trade-link
    const unlistedAssets = [];
    const listedAssets = account
        .getSortedBalances()
        .map(balance => {
            const tickerAsset = _.find(d.ticker.data.assets, {
                code: balance.code,
                issuer: balance.issuer,
            });
            let tradeLink;

            if (d.ticker.ready && tickerAsset) {
                if (tickerAsset.price_USD === undefined) {
                    tickerAsset.price_USD = 0;
                }

                const balanceUSD = (balance.balance * tickerAsset.price_USD).toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                });

                if (tickerAsset.slug !== 'XLM-native') {
                    tradeLink = `/exchange/${tickerAsset.topTradePairSlug}`;
                }

                Object.assign(balance, {
                    tradeLink,
                    balanceUSD,
                    change24h_USD: tickerAsset.change24h_USD,
                    id: tickerAsset.id,
                });
            } else if (d.ticker.ready && !tickerAsset) {
                unlistedAssets.push(balance);
                tradeLink = `/exchange/${balance.code}-${balance.issuer}/XLM-native`;
                Object.assign(balance, { tradeLink });
                return null;
            }
            return balance;
        })
        .filter(asset => asset !== null);

    const sortedByUSD = _.sortBy(listedAssets, o => parseFloat(o.balanceUSD));
    const sortedByBalance = _.sortBy(unlistedAssets, o => parseFloat(o.balance));
    const allBalances = sortedByBalance.concat(sortedByUSD).reverse();

    const balanceRows = allBalances.map(asset => {
        const { id, code, issuer, balance } = asset;
        const isNoUSDBalanceData = asset.balanceUSD === undefined;
        const balanceUSD = isNoUSDBalanceData ? null : `$${asset.balanceUSD}`;

        return (
            <tr className="BalancesTable__row" key={id}>
                <td className="BalancesTable__row__item BalancesTable__row__item--assetCard">
                    <AssetCardMain code={code} issuer={issuer} d={props.d} />
                </td>
                <td className="BalancesTable__row__item BalancesTable__row__item--amount">
                    {Printify.lightenZeros(balance)}
                </td>
                <td className="BalancesTable__row__item BalancesTable__row__item--amount">{balanceUSD}</td>
                <td className="BalancesTable__row__item BalancesTable__row__item--amount">
                    <PercentChange changePercent={get24hChangePercent(asset, d.ticker)} isHidden={isNoUSDBalanceData} />
                </td>
                <td>
                    <AssetActionButtons d={props.d} asset={asset} onlyIcons />
                </td>
            </tr>
        );
    });

    const renderTableHeaders = () => (
        <thead>
            <tr className="BalancesTable__head">
                {TABLE_HEADERS.map(headerName => (
                    <td
                        className="BalancesTable__head__cell BalancesTable__row__item--heading BalancesTable__head__asset"
                        key={headerName}
                    >
                        {headerName}
                    </td>
                ))}
            </tr>
        </thead>
    );

    return (
        <table className="BalancesTable">
            {renderTableHeaders()}
            <tbody>{balanceRows}</tbody>
        </table>
    );
}

BalancesTable.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
};
