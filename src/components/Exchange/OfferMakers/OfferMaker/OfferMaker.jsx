import React from 'react';
import PropTypes from 'prop-types';
import BigNumber from 'bignumber.js';
import * as StellarSdk from 'stellar-sdk';
import Driver from '../../../../lib/Driver';
import OfferMakerOverview from './OfferMakerOverview/OfferMakerOverview';
import ErrorHandler from '../../../../lib/ErrorHandler';
import ReservedPopover from '../../../Common/AppPopover/ReservedPopover';

// OfferMaker is an uncontrolled element (from the perspective of its users)
export default class OfferMaker extends React.Component {
    static getErrorType(error) {
        if (!error || !error.data ||
            !error.data.extras ||
            !error.data.extras.result_codes ||
            !error.data.extras.result_codes.operations) {
            return '';
        }
        return error.data.extras.result_codes.operations[0];
    }

    constructor(props) {
        super(props);
        this.initialized = false;
        this.touchedOffer = Boolean(this.props.existingOffer);

        this.orderbookUnsub = this.props.d.orderbook.event.sub((data) => {
            if (data && data.pickPrice) {
                this.touchedOffer = true;
                this.updateState('price', data.pickPrice);
            } else if (!this.touchedOffer) {
                this.updateState('price', this.getPriceFromOrderbook());
            }
        });
        this.sessionUnsub = this.props.d.session.event.sub((event) => {
            if (this.state.amount && event === 'login') {
                this.updateState('amount', this.state.amount);
            }
            this.forceUpdate();
        });

        this.state = {
            valid: false,
            price: props.existingOffer ? props.existingOffer.price : '', // Most sticky item (since the price is pretty static)
            amount: props.existingOffer ? props.existingOffer.baseAmount : '',

            // Total = price * amount
            total: props.existingOffer ? props.existingOffer.counterAmount : '',
            offerId: props.existingOffer ? props.existingOffer.id : undefined,
            buttonState: 'ready', // ready or pending
            errorMessage: '',
            successMessage: '',
        };

        if (this.props.d.orderbook.data.ready && !this.props.existingOffer) {
            this.state = Object.assign(this.state, this.initialize());
        }
    }

    componentDidMount() {
        this._mounted = true;
    }

    componentDidUpdate(prevProps) {
        if (this.props.existingOffer && prevProps.existingOffer.price !== this.props.existingOffer.price) {
            this.setInitialState();
        }
    }

    componentWillUnmount() {
        this.orderbookUnsub();
        this.sessionUnsub();
        this._mounted = false;
    }

    getPercentButton(isBuy, maxOffer, percent, minValue) {
        const inputType = isBuy ? 'total' : 'amount';
        const value = ((maxOffer * percent) / 100).toFixed(7).toString();
        return (
            <button
                onClick={(e) => {
                    e.preventDefault();
                    this.touchedOffer = true;
                    this.updateState(inputType, value, minValue, inputType, maxOffer);
                }}
                disabled={parseFloat(maxOffer) === 0}
                className={`cancel-button ${this.state[inputType] === value && 'active'}`}>{percent}%</button>
        );
    }

    getPriceFromOrderbook() {
        if (this.props.side === 'buy' && this.props.d.orderbook.data.asks.length > 0) {
            return new BigNumber(this.props.d.orderbook.data.asks[0].price).toString();
            // Get rid of extra 0s
        } else if (this.props.d.orderbook.data.bids.length > 0) {
            // Proptypes validation makes sure this is sell
            return new BigNumber(this.props.d.orderbook.data.bids[0].price).toString();
            // Get rid of extra 0s
        }

        return '0';
    }

    setInitialState() {
        this.setState({
            valid: false,
            price: this.props.existingOffer.price, // Most sticky item (since the price is pretty static)
            amount: this.props.existingOffer.baseAmount,
            total: this.props.existingOffer.counterAmount,
            offerId: this.props.existingOffer.id,
            buttonState: 'ready',
            errorMessage: '',
            successMessage: '',
        });
    }

    initialize() {
        if (this.initialized) {
            return {};
        }
        this.initialized = true;
        const state = {};

        // Initialize price
        state.price = this.getPriceFromOrderbook();

        state.errorType = '';

        return state;
    }

    updateState(item, value, minValue, targetInputType, maxOffer) {
        const state = Object.assign(this.state, {
            // Reset messages
            successMessage: '',
            errorMessage: '',
        });
        state.valid = false;

        const [integerPart, fractionalPart] = value.split('.');

        const roundedValue = (fractionalPart && fractionalPart.length > 7) ?
            `${integerPart}.${fractionalPart.slice(0, 7)}` : value;

        if (item === 'price' || item === 'amount' || item === 'total') {
            state[item] = roundedValue;
        } else {
            throw new Error('Invalid item type');
        }

        try {
            // If there is an error, we will just let the user input change but not the affected inputs
            if (item === 'price' || item === 'amount') {
                const changeValueType = item === 'price' ? 'amount' : 'price';
                state.total = new BigNumber(
                    new BigNumber(roundedValue).times(new BigNumber(state[changeValueType])).toFixed(7),
                ).toString();
            } else if (item === 'total') {
                state.amount = new BigNumber(
                    new BigNumber(roundedValue).dividedBy(new BigNumber(state.price)).toFixed(7),
                ).toString();
            } else {
                throw new Error('Invalid item type');
            }
            const hasInvalidPrecision = (state.price < minValue) || (state.amount < minValue)
                || (state.total < minValue);
            const isInsufficient = parseFloat(state[targetInputType]) > parseFloat(maxOffer);

            state.valid = !hasInvalidPrecision && !isInsufficient;
        } catch (e) {
            // Invalid input somewhere
        }
        if (this._mounted) {
            this.setState(state);
        }
    }

    async handleSubmit(event) {
        event.preventDefault();
        if (this.props.d.session.authType === 'ledger') {
            this.props.d.modal.handlers.cancel();
        }
        const { price, amount, total, offerId } = this.state;
        const handlers = this.props.d.session.handlers;
        const signAndSubmit = await handlers.createOffer(this.props.side, { price, amount, total, offerId });

        if (signAndSubmit.status === 'await_signers') {
            this.props.d.modal.handlers.cancel();
            if (this._mounted) {
                this.setState({
                    amount: '',
                    total: '',
                    valid: false,
                    buttonState: 'ready',
                    successMessage: 'Offer was signed with your key. Add additional signatures and submit to the network.',
                });
            }
        }

        if (signAndSubmit.status !== 'finish') { return; }
        if (this._mounted) {
            this.setState({
                valid: false,
                buttonState: 'pending',
                amount: '',
                total: '',
                successMessage: '',
                errorMessage: '',
            });
        }
        try {
            await signAndSubmit.serverResult;
            this.props.d.modal.handlers.cancel();
            if (this._mounted) {
                this.setState({
                    buttonState: 'ready',
                    successMessage: 'Offer successfully created',
                });
            }
        } catch (error) {
            const errorMessage = ErrorHandler(error);
            const errorType = this.constructor.getErrorType(error.response);
            this.setState({
                buttonState: 'ready',
                errorMessage,
                errorType,
            });
        }
    }

    calculateMaxOffer(targetAsset) {
        const { account } = this.props.d.session;
        const maxLumenSpend = account.maxLumenSpend();

        const targetBalance = targetAsset.isNative() ? maxLumenSpend : account.getBalance(targetAsset);
        const reservedBalance = account.getReservedBalance(targetAsset);

        return parseFloat(targetBalance) > parseFloat(reservedBalance) ? targetBalance - reservedBalance : 0;
    }

    renderTableRow(inputType, assetName, isBuy, maxOffer, login, minValue) {
        const invalidPrecision = this.state[inputType] !== '' && this.state[inputType] < minValue;

        const targetInputType = isBuy ? 'total' : 'amount';
        const isInsufficient = login && (inputType === targetInputType) &&
            parseFloat(this.state[inputType]) > parseFloat(maxOffer);
        let errorMessage;
        if (invalidPrecision) {
            errorMessage = `Minimal amount is ${minValue.toFixed(7)}`;
        }
        if (isInsufficient) {
            errorMessage = `Not enough ${assetName}`;
        }

        return (
            <tr className={`offer_table_row ${invalidPrecision || isInsufficient ? 'invalidValue' : ''}`}>
                <td className="offer_table_label">{inputType}</td>
                <td className="offer_table_input_cell">
                    <label className="offer_input_group" htmlFor={inputType}>
                        <input
                            type="text"
                            name={inputType}
                            maxLength="20"
                            value={this.state[inputType]}
                            onFocus={() => { this.touchedOffer = true; }}
                            onChange={e =>
                                this.updateState(inputType, e.target.value, minValue, targetInputType, maxOffer)}
                            placeholder="" />
                        <div className="offer_input_group_tag">{assetName}</div>
                        <div className="invalidValue_popup">
                            {errorMessage}
                        </div>
                    </label>
                </td>
            </tr>
        );
    }

    renderPercentButtons(isBuy, maxOffer, minValue) {
        return (
            <React.Fragment>
                <tr>
                    <td />
                    <td className="offer_table_buttons">
                        {this.getPercentButton(isBuy, maxOffer, 25, minValue)}
                        {this.getPercentButton(isBuy, maxOffer, 50, minValue)}
                        {this.getPercentButton(isBuy, maxOffer, 75, minValue)}
                        {this.getPercentButton(isBuy, maxOffer, 100, minValue)}
                    </td>
                </tr>
                <tr className="offer_table_buttons-separator">
                    <td /><td /><td /><td /><td />
                </tr>
            </React.Fragment>
        );
    }

    render() {
        if (!this.props.d.orderbook.data.ready) {
            return <div>Loading</div>;
        }
        const login = this.props.d.session.state === 'in';
        const { hasTrustNeeded, existingOffer } = this.props;
        const isBuy = this.props.side === 'buy';
        const { baseBuying, counterSelling } = this.props.d.orderbook.data;
        const baseAssetName = baseBuying.getCode();
        const counterAssetName = counterSelling.getCode();
        const title = isBuy
            ? <span>Buy <b>{baseAssetName}</b></span>
            : <span>Sell <b>{baseAssetName}</b></span>;

        // The smallest asset amount unit is one ten-millionth: 1/10000000 or 0.0000001.
        // https://www.stellar.org/developers/guides/concepts/assets.html#amount-precision-and-representation
        const minValue = 0.0000001;

        const targetAsset = isBuy ? counterSelling : baseBuying;
        // amount of edited offer
        const amountOfEditedOffer =
            (existingOffer && parseFloat(isBuy ? existingOffer.counterAmount : existingOffer.baseAmount)) || 0;

        // balance without amount of open offers
        const maxOffer = login ? this.calculateMaxOffer(targetAsset) : 0;
        const maxOfferView = (Math.floor((maxOffer + amountOfEditedOffer) * 10000000) / 10000000).toFixed(7);
        const inputType = isBuy ? 'total' : 'amount';
        const value = (maxOffer).toFixed(7).toString();

        const availableView = (
            <div className="OfferMaker_container">
                <div
                    className="OfferMaker_balance"
                    onClick={(e) => {
                        e.preventDefault();
                        this.touchedOffer = true;
                        this.updateState(inputType, value, minValue, inputType, maxOffer);
                    }}>

                    <span>Available:</span>
                    <span>{maxOfferView} {targetAsset.code}</span>
                </div>

                <ReservedPopover
                    onlyIcon
                    d={this.props.d}
                    asset={new StellarSdk.Asset(targetAsset.code, targetAsset.issuer)} />
            </div>
        );

        return (
            <div>
                <div className="OfferMaker_title">
                    <h3 className="island__sub__division__title island__sub__division__title--left">{title}</h3>
                    {(login && !hasTrustNeeded) ? availableView : null}
                </div>
                <form onSubmit={e => this.handleSubmit(e)}>
                    <table className="OfferMaker_table">
                        <tbody>
                            {this.renderTableRow('price', counterAssetName, isBuy, maxOfferView, login, minValue)}
                            {this.renderTableRow('amount', baseAssetName, isBuy, maxOfferView, login, minValue)}
                            {this.renderPercentButtons(isBuy, maxOfferView, minValue)}
                            {this.renderTableRow('total', counterAssetName, isBuy, maxOfferView, login, minValue)}
                        </tbody>
                    </table>

                    <OfferMakerOverview
                        d={this.props.d}
                        hasTrustNeeded={this.props.hasTrustNeeded}
                        side={this.props.side}
                        offerState={this.state} />
                </form>
            </div>
        );
    }
}

OfferMaker.propTypes = {
    side: PropTypes.oneOf(['buy', 'sell']).isRequired,
    d: PropTypes.instanceOf(Driver).isRequired,
    hasTrustNeeded: PropTypes.bool,
    existingOffer: PropTypes.objectOf(PropTypes.any),
};
