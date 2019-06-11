import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import Driver from '../../../../../lib/Driver';
import AssetCard2 from '../../../../Common/AssetCard2/AssetCard2';
import RemoveTrustLink from './RemoveTrustLink/RemoveTrustLink';
import RemoveAllTrusts from './RemoveAllTrusts/RemoveAllTrusts';

export default class ManageTrust extends React.Component {
    getAcceptedAssets() {
        const account = this.props.d.session.account;
        const allBalances = account.getSortedBalances({ hideNative: true }); // From MagicSpoon.Account
        const sortedBalances = _.orderBy(allBalances, ['code'], ['asc']);

        return sortedBalances.map((asset) => {
            const { code, issuer } = asset;

            return (
                <tr className="BalancesTable__row" key={code + issuer}>
                    <td className="BalancesTable__row__item BalancesTable__row__item--assetCard">
                        <AssetCard2 code={code} issuer={issuer} />
                    </td>
                    <td className="BalancesTable__row__item">
                        <RemoveTrustLink asset={asset} d={this.props.d} />
                    </td>
                </tr>
            );
        });
    }

    render() {
        const assetRows = this.getAcceptedAssets();
        const nothingAccepted = assetRows.length === 0;

        return (
            <div className="island">
                <div className="island__header">Assets you accept</div>
                <div className="island__paddedContent Remove_all_assets">
                    <span>To receive assets on the Stellar network, you must first {'"accept"'} the asset.</span>
                    <RemoveAllTrusts d={this.props.d} />
                </div>
                <div className="island__separator" />
                <table className="ManageTrust_table">
                    <thead>
                        <tr>
                            <td className="table_head_asset">Asset</td>
                            <td className="table_head_cell">Manage</td>
                        </tr>
                    </thead>
                    <tbody>
                        {nothingAccepted ? (
                            <tr className="BalancesTable__row">
                                <td className="BalancesTable__row__none" colSpan="2">
                                    You currently don{"'"}t accept any assets.
                                </td>
                            </tr>
                        ) : (
                            assetRows
                        )}
                    </tbody>
                </table>
            </div>
        );
    }
}

ManageTrust.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
};
