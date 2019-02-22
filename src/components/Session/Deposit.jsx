import React from 'react';
import PropTypes from 'prop-types';
import DepositCurrency from './Deposit/DepositCurrency';
import DepositAnchors from './Deposit/DepositAnchors';
import Driver from '../../lib/Driver';

export default class Deposit extends React.Component {
    static getNoTrustLines() {
        return (
            <div className="Deposit__content">
                You haven{"'"}t trusted any assets. Click here to{' '}
                <a href="#account/addTrust">create your first trust line</a>.
            </div>
        );
    }

    constructor(props) {
        super(props);
        this.state = {
            selectedAsset: null,
        };
    }

    render() {
        const allAssets = this.props.d.session.account.getSortedBalances({ hideNative: true });
        // From MagicSpoon.Account
        const isNoAssets = allAssets.length === 0;
        const d = this.props.d;

        const currencyPicker = isNoAssets ? (
            this.constructor.getNoTrustLines()
        ) : (
            <div className="Deposit__dropdown s-inputGroup__item S-flexItem-noFlex">
                <DepositCurrency
                    d={d}
                    allAssets={allAssets}
                    selectedAsset={this.state.selectedAsset || allAssets[0].code}
                    onCurrencyChange={newAsset => this.setState({ selectedAsset: newAsset })} />
            </div>
        );

        const anchors = isNoAssets ? (
            this.constructor.getNoTrustLines()
        ) : (
            <DepositAnchors d={d} selectedAssetCode={this.state.selectedAsset || allAssets[0].code} />
        );

        return (
            <div>
                <div className="so-back islandBack islandBack--t">
                    <div className="island">
                        <div className="island__header">Pick a currency for the deposit</div>
                        <div className="Deposit__content">
                            If you want to deposit or withdraw funds, either in fiat or from other blockchains, you may
                            use an anchor service to do so.
                            <br />
                            You{"'"}ll find a selection of currencies in the tabs below. Start by choosing a currency to
                            deposit.
                        </div>
                        {currencyPicker}
                    </div>
                </div>

                <div className="so-back islandBack">
                    <div className="island">
                        <div className="island__header">Anchors accepting deposits</div>
                        {anchors}
                    </div>
                </div>
            </div>
        );
    }
}

Deposit.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
};
