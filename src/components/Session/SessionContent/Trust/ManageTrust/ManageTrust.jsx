import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import AssetCard2 from '../../../../AssetCard2';
import Driver from '../../../../../lib/Driver';
import RemoveTrustLink from './RemoveTrustLink/RemoveTrustLink';

export default function ManageTrust(props) {
    const account = props.d.session.account;
    const allBalances = account.getSortedBalances({ hideNative: true }); // From MagicSpoon.Account
    const sortedBalances = _.orderBy(allBalances, ['code'], ['asc']);

    const assetRows = sortedBalances.map(balance => (
        <tr className="BalancesTable__row" key={balance.code + balance.issuer}>
            <td className="BalancesTable__row__item BalancesTable__row__item--assetCard">
                <AssetCard2 code={balance.code} issuer={balance.issuer} />
            </td>
            <td className="ManageCurrentTrust__row__item">
                <RemoveTrustLink balance={balance} d={props.d} />
            </td>
        </tr>
    ));

    const nothingAccepted = assetRows.length === 0;

    return (
        <div className="island">
            <div className="island__header">Assets you accept</div>
            <div className="island__paddedContent">
                To receive assets on the Stellar network, you must first {'"accept"'} the asset.
            </div>
            <div className="island__separator" />
            <table className="ManageCurrentTrust">
                <thead>
                    <tr className="ManageCurrentTrust__head">
                        <td className="ManageCurrentTrust__head__asset">Asset</td>
                        <td className="ManageCurrentTrust__head__cell">Manage</td>
                    </tr>
                </thead>
                <tbody>
                    {nothingAccepted ? (
                        <tr className="BalancesTable__row">
                            <td className="BalancesTable__row__none" colSpan="2">
                                You currently don{"'"}t accept any assets.
                            </td>
                        </tr>
                    ) : (assetRows)}
                </tbody>
            </table>
        </div>
    );
}

ManageTrust.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
};
