import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import Driver from '../../../../../../lib/Driver';
import Printify from '../../../../../../lib/Printify';
import AssetCardMain from '../../../../../Common/AssetCard/AssetCardMain/AssetCardMain';
import AssetActionButtons from '../AssetActionButtons';

export default function BalancesTable(props) {
    const account = props.d.session.account;
    // getSortedBalances from MagicSpoon.Account
    // Then generating USD balance and trade-link
    const unlistedAssets = [];
    const listedAssets = account
        .getSortedBalances()
        .map((balance) => {
            const tickerAsset = _.find(props.d.ticker.data.assets, {
                code: balance.code,
                issuer: balance.issuer,
            });
            let tradeLink;

            if (props.d.ticker.ready && tickerAsset) {
                if (tickerAsset.price_USD === undefined) {
                    tickerAsset.price_USD = 0;
                }

                const balanceUSD = (balance.balance * tickerAsset.price_USD).toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                });
                Object.assign(balance, { balanceUSD });

                if (tickerAsset.slug !== 'XLM-native') {
                    tradeLink = `/exchange/${tickerAsset.topTradePairSlug}`;
                }
                Object.assign(balance, { tradeLink });
            } else if (props.d.ticker.ready && !tickerAsset) {
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

    const balanceRows = allBalances.map((asset) => {
        const { code, issuer, balance } = asset;
        const balanceUSD = asset.balanceUSD !== undefined ? `$${asset.balanceUSD}` : null;

        return (
            <tr className="BalancesTable__row" key={code + issuer}>
                <td className="BalancesTable__row__item BalancesTable__row__item--assetCard">
                    <AssetCardMain code={code} issuer={issuer} d={props.d} />
                </td>
                <td className="BalancesTable__row__item BalancesTable__row__item--amount">
                    {Printify.lightenZeros(balance)}
                </td>
                <td className="BalancesTable__row__item BalancesTable__row__item--amount">{balanceUSD}</td>
                <td>
                    <AssetActionButtons d={props.d} asset={asset} onlyIcons />
                </td>
            </tr>
        );
    });

    return (
        <table className="BalancesTable">
            <thead>
                <tr className="BalancesTable__head">
                    <td
                        className="BalancesTable__head__cell
                        BalancesTable__row__item--heading BalancesTable__head__asset">
                        Asset
                    </td>
                    <td
                        className="BalancesTable__head__cell
                        BalancesTable__row__item--heading BalancesTable__head__amount">
                        Balance
                    </td>
                    <td
                        className="BalancesTable__head__cell
                        BalancesTable__row__item--heading BalancesTable__head__amount">
                        Value (USD)
                    </td>
                    <td
                        className="BalancesTable__head__cell
                        BalancesTable__row__item--heading BalancesTable__head__amount" />
                </tr>
            </thead>
            <tbody>{balanceRows}</tbody>
        </table>
    );
}

BalancesTable.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
};
