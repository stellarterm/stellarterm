import React from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import Driver from '../../../../../lib/Driver';
import Validate from '../../../../../lib/Validate';
import images from '../../../../../images';
import AssetCardSeparateLogo from '../../../../Common/AssetCard/AssetCardSeparateLogo/AssetCardSeparateLogo';

export default class SendAsset extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isOpenList: false,
            selectedSlug: this.props.d.send.choosenSlug,
        };
    }


    onClickAssetDropdown(slug) {
        const { pickAssetToSend } = this.props.d.send;

        this.setState({
            isOpenList: !this.state.isOpenList,
            selectedSlug: slug || this.state.selectedSlug,
        });

        if (slug) {
            pickAssetToSend(slug);
        }
    }


    getAssetsDropdown() {
        const { isOpenList } = this.state;
        const { availableAssets, assetToSend } = this.props.d.send;

        const assetsRow = _.map(availableAssets, (availability, slug) => (
            <div
                className="dropdown_item"
                onClick={() => this.onClickAssetDropdown(slug)}
                key={`${availability.asset.getCode()}-${availability.asset.getIssuer()}`}>
                <AssetCardSeparateLogo
                    d={this.props.d}
                    code={availability.asset.getCode()}
                    issuer={availability.asset.getIssuer()}
                    noIssuer />
            </div>
        ));

        const arrowClassName = `dropdown_arrow ${isOpenList ? 'arrow_reverse' : ''}`;

        return (
            <div className="Send_dropdown">
                <div className="dropdown_selected" onClick={() => this.onClickAssetDropdown()}>
                    <AssetCardSeparateLogo
                        d={this.props.d}
                        code={assetToSend.asset.getCode()}
                        issuer={assetToSend.asset.getIssuer()}
                        noIssuer />
                    <img
                        src={images.dropdown}
                        alt="▼"
                        className={arrowClassName} />
                </div>

                {isOpenList ? <div className="dropdown_list">{assetsRow}</div> : null}
            </div>
        );
    }

    render() {
        const { d } = this.props;
        const { amountToSend, updateAmountValue, getAsset, getMaxAssetSpend } = d.send;
        const { account } = d.session;

        const { asset } = d.send.assetToSend;

        const maxLumenSpend = getMaxAssetSpend();
        const targetBalance = account.getBalance(getAsset());
        const isXlmNative = asset.code === 'XLM' && asset.issuer === undefined;
        const notEnoughBalance = Number(amountToSend) > Number(maxLumenSpend);

        let amountValid = Validate.amount(amountToSend);
        let validationMessage;

        if (amountValid === false) {
            validationMessage = <p>Amount is invalid</p>;
        } else if (asset !== null) {
            const maxAssetSpend = getMaxAssetSpend(targetBalance);
            const notEnoughAsset = Number(amountToSend) > Number(maxAssetSpend);

            if ((isXlmNative && notEnoughBalance) || notEnoughAsset) {
                amountValid = false;
                const maxSpend = isXlmNative ? maxLumenSpend : maxAssetSpend;

                validationMessage = (
                    <span>
                        You may only send up to <strong>{maxSpend} {asset.code}</strong> due to the minimum balance
                        requirements and open orders.<br />
                        For more information, see the <Link to="/account/">minimum balance section</Link>.
                    </span>
                );
            }
        }

        const isDestAcceptAsset = d.send.availableAssets[d.send.choosenSlug].sendable;

        return (
            <div className="Input_flexed_block">
                <div className="Send_input_block">
                    <label htmlFor="inputSendAmount">Amount</label>
                    <input
                        name="inputSendAmount"
                        type="text"
                        value={amountToSend}
                        onChange={e => updateAmountValue(e.target.value)}
                        placeholder="Enter amount" />

                    <div className="field_description">
                        {validationMessage}
                    </div>
                </div>

                <div className="Send_dropdown_block">
                    {isDestAcceptAsset
                        ? <label htmlFor="recipient">Asset</label>
                        : <label htmlFor="recipient">Destination does not accept this asset.</label>
                    }
                    {this.getAssetsDropdown()}

                    {account.getBalance(getAsset()) !== null ? (
                        <div className="asset_balance">Balance:&nbsp;
                            <span className="asset_amount" onClick={() => updateAmountValue(targetBalance)}>{targetBalance}</span>
                        </div>
                    ) : null}
                </div>
            </div>
        );
    }
}

SendAsset.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
};
