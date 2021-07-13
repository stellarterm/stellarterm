import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Driver from '../../../../../../lib/Driver';
import Printify from '../../../../../../lib/Printify';
import { get24hChangePercent } from '../../../../../../lib/Format';
import PercentChange from '../../../../../Basics/PercentChange/PercentChange';
import AssetCardMain from '../../../../../Common/AssetCard/AssetCardMain/AssetCardMain';
import AssetActionButtons from '../AssetActionButtons';
import processBalances from './processBalances';


export default function BalancesTable({ d }) {
    const [balancesList, setBalancesList] = useState(null);

    useEffect(() => {
        processBalances(d).then(balances => {
            setBalancesList(balances);
        });
    }, []);


    if (!balancesList || !d.ticker.ready) {
        return (
            <div className="directory-loader">
                <div className="nk-spinner" />
            </div>
        );
    }

    const [lumen, ...assets] = balancesList;

    const sortedAssets = assets.sort((a, b) =>
        (parseFloat(b.balanceUSD === undefined ? -1 : b.balanceUSD) -
            parseFloat(a.balanceUSD === undefined ? -1 : a.balanceUSD))
        || parseFloat(b.balance) - parseFloat(a.balance),
    );


    const balanceRows = [lumen, ...sortedAssets].map(asset => {
        const { code, issuer, balance } = asset;

        const isNoUSDBalanceData = asset.balanceUSD === undefined;
        const balanceUSD = isNoUSDBalanceData ? null : `$${asset.balanceUSD}`;

        return (
            <tr className="BalancesTable__row" key={code + issuer}>
                <td className="BalancesTable__row__item BalancesTable__row__item--assetCard">
                    <AssetCardMain code={code} issuer={issuer} d={d} />
                </td>
                <td className="BalancesTable__row__item BalancesTable__row__item--amount">
                    {Printify.lightenZeros(balance)}
                </td>
                <td className="BalancesTable__row__item BalancesTable__row__item--amount">{balanceUSD}</td>
                <td className="BalancesTable__row__item BalancesTable__row__item--amount">
                    <PercentChange changePercent={get24hChangePercent(asset, d.ticker)} isHidden={isNoUSDBalanceData} />
                </td>
                <td>
                    <AssetActionButtons d={d} asset={asset} onlyIcons />
                </td>
            </tr>
        );
    });

    const TABLE_HEADERS = ['Asset', 'Balance', 'Value (USD)', 'Change (24h)'];

    const tableHeader = (
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
            {tableHeader}
            <tbody>{balanceRows}</tbody>
        </table>
    );
}

BalancesTable.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
};
