import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Driver from '../../../../../../lib/driver/Driver';
import { formatNumber, get24hChangePercent } from '../../../../../../lib/helpers/Format';
import PercentChange from '../../../../../Basics/PercentChange/PercentChange';
import AssetCardMain from '../../../../../Common/AssetCard/AssetCardMain/AssetCardMain';
import { SESSION_EVENTS, SESSION_STATE } from '../../../../../../lib/constants/sessionConstants';
import AssetActionButtons from '../AssetActionButtons';
import processBalances from './processBalances';


export default function BalancesTable(props) {
    const { d } = props;
    const [balancesList, setBalancesList] = useState(null);

    const updateBalances = () => {
        processBalances(d).then(balances => {
            setBalancesList(balances);
        });
    };

    useEffect(() => {
        updateBalances();
    }, []);

    useEffect(() => {
        const unsub = d.session.event.sub(eventName => {
            if (d.session.state === SESSION_STATE.IN && eventName === SESSION_EVENTS.ACCOUNT_EVENT) {
                updateBalances();
            }
        });

        return () => unsub();
    });


    if (!balancesList || !d.ticker.ready) {
        return (
            <div className="directory-loader">
                <div className="nk-spinner" />
            </div>
        );
    }

    const balanceRows = balancesList.map(asset => {
        const { code, issuer, balance } = asset;

        const isNoUSDBalanceData = asset.balanceUSD === undefined;
        const balanceUsdView = isNoUSDBalanceData ?
            null :
            <span>${formatNumber(asset.balanceUSD.toFixed(2))}</span>;

        return (
            <tr className="BalancesTable__row" key={code + issuer}>
                <td className="BalancesTable__row__item BalancesTable__row__item--assetCard">
                    <AssetCardMain code={code} issuer={issuer} d={d} />
                </td>
                <td className="BalancesTable__row__item BalancesTable__row__item--amount">
                    {formatNumber(balance)}
                </td>
                <td className="BalancesTable__row__item BalancesTable__row__item--amount">
                    {balanceUsdView}
                </td>
                <td className="BalancesTable__row__item BalancesTable__row__item--amount">
                    <PercentChange changePercent={get24hChangePercent(asset, d.ticker)} isHidden={isNoUSDBalanceData} />
                </td>
                <td>
                    <AssetActionButtons d={d} asset={asset} onlyIcons {...props} />
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
