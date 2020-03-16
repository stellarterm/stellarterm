import React from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import Driver from '../../../../../lib/Driver';
import Validate from '../../../../../lib/Validate';
import images from '../../../../../images';
import AssetCardSeparateLogo from '../../../../Common/AssetCard/AssetCardSeparateLogo/AssetCardSeparateLogo';
import AppPopover from '../../../../Common/AppPopover/AppPopover';

export default class SendAsset extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isOpenList: false,
            errorMsg: this.getErrorMessage(),
            selectedSlug: this.props.d.send.choosenSlug,
        };

        this.handleClickOutside = (e) => {
            if (this.node.contains(e.target)) { return; }
            this.setState({ isOpenList: false });
        };
    }

    componentDidMount() {
        document.addEventListener('mousedown', this.handleClickOutside, false);
    }

    componentWillUnmount() {
        document.removeEventListener('mousedown', this.handleClickOutside, false);
    }

    onChangeAmount(e) {
        this.setState({ errorMsg: null });
        this.props.d.send.updateAmountValue(e.target.value);
    }

    onFocusLeave() {
        this.setState({ errorMsg: this.getErrorMessage() });
    }

    onClickAvailable(amount) {
        this.props.d.send.updateAmountValue(amount);
        this.setState({ errorMsg: this.getErrorMessage() });
    }

    onClickAssetDropdown(slug) {
        const { pickAssetToSend, choosenSlug } = this.props.d.send;

        if (slug && slug !== choosenSlug) {
            window.history.pushState({}, null, `/account/send?asset=${slug}`);
            pickAssetToSend(slug);
        }

        this.setState({
            isOpenList: !this.state.isOpenList,
            errorMsg: this.getErrorMessage(),
            selectedSlug: slug || this.state.selectedSlug,
        });
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
            <div
                className="Send_dropdown"
                ref={(node) => { this.node = node; }} >
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

    getErrorMessage() {
        const { amountToSend, assetToSend } = this.props.d.send;
        const maxAssetSpend = this.getMaxAssetSpend().toFixed(7);
        const amountValid = Validate.amount(amountToSend);

        if (amountValid === false) {
            return 'Amount is invalid';
        } else if (Number(amountToSend) > Number(maxAssetSpend)) {
            return `Not enough ${assetToSend.asset.code}`;
        }
        return null;
    }

    getMaxAssetSpend() {
        const { d } = this.props;
        const { getAsset } = d.send;
        const { asset } = d.send.assetToSend;
        const { account } = d.session;

        const currentAsset = getAsset();
        const isXlmNative = asset.isNative();
        const targetBalance = isXlmNative ? account.maxLumenSpend() : account.getBalance(currentAsset);
        const reservedBalance = account.getReservedBalance(currentAsset);

        return parseFloat(targetBalance) > parseFloat(reservedBalance) ?
            (targetBalance - reservedBalance) : 0;
    }

    getReservedMessage() {
        const { d } = this.props;
        const { asset } = d.send.assetToSend;
        const { account } = d.session;

        const currentAsset = d.send.getAsset();
        const targetBalance = account.getBalance(currentAsset);
        if (parseFloat(targetBalance) === 0) { return null; }

        const isXlmNative = asset.isNative();
        const reserveData = account.explainReserve();
        const { totalReservedXLM, reserveItems } = reserveData;
        const reservedAmount = isXlmNative ? totalReservedXLM : account.getReservedBalance(currentAsset);
        const isNoTrustline = reservedAmount === null;

        if (isNoTrustline) { return null; }

        const reservedRows = reserveItems.map(({ reserveType, typeCount, reservedXLM }) => (
            <div className="reserved_item" key={`${reserveType}-${typeCount}`}>
                <span>
                    {reserveType} {typeCount === 0 ? '' : `(${typeCount})`}
                </span>
                <span>{reservedXLM} XLM</span>
            </div>
        ));

        return (
            <React.Fragment>
                <AppPopover
                    content={
                        isXlmNative ? (
                            <div className="reserve_table">
                                <div className="reserved_item reserved_item_bold">
                                    <span>Reserved</span>
                                    <span>{reservedAmount} XLM</span>
                                </div>
                                {reservedRows}
                                <Link to="/account#reserved" className="reserved_link">
                                    More information
                                    <img className="icon_arrow" src={images['icon-arrow-right']} alt="arrow" />
                                </Link>
                            </div>
                        ) : (
                            <React.Fragment>
                                <p><strong>{reservedAmount} {asset.code}</strong> reserved in active offers</p>
                                <Link to="/account/activity/" className="reserved_link">
                                    More information
                                    <img className="icon_arrow" src={images['icon-arrow-right']} alt="arrow" />
                                </Link>
                            </React.Fragment>
                        )
                    } />
                <div>{reservedAmount} {asset.code} are reserved in your wallet by Stellar network</div>
            </React.Fragment>
        );
    }

    render() {
        const { d } = this.props;
        const { errorMsg } = this.state;
        const { amountToSend, getAsset, availableAssets, choosenSlug } = d.send;
        const { account } = d.session;
        const currentAsset = getAsset();
        const maxAssetSpend = this.getMaxAssetSpend().toFixed(7);

        const isDestAcceptAsset = availableAssets[choosenSlug].sendable;

        return (
            <div className="Input_flexed_block">
                <div className="Send_input_block">
                    <label htmlFor="inputSendAmount">Amount</label>
                    {errorMsg ? (
                        <div className="invalidValue_popup">
                            {errorMsg}
                        </div>
                    ) : null}

                    <input
                        type="text"
                        name="inputSendAmount"
                        placeholder="Enter amount"
                        value={amountToSend}
                        onChange={e => this.onChangeAmount(e)}
                        onBlur={() => this.onFocusLeave()} />

                    <div className="field_description">
                        {this.getReservedMessage()}
                    </div>
                </div>

                <div className="Send_dropdown_block">
                    {isDestAcceptAsset ? (
                        <label htmlFor="asset">Asset</label>
                    ) : (
                        <React.Fragment>
                            <label htmlFor="asset">Asset</label>
                            <div className="invalidValue_popup">
                                Recipient does not accept this asset
                            </div>
                        </React.Fragment>
                    )}

                    {this.getAssetsDropdown()}

                    {account.getBalance(currentAsset) !== null ? (
                        <div className="asset_balance">Available:&nbsp;
                            <span className="asset_amount" onClick={() => this.onClickAvailable(maxAssetSpend)}>
                                {maxAssetSpend}
                            </span>
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
