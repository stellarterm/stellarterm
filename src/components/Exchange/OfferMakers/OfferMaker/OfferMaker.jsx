import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import BigNumber from 'bignumber.js';
import Driver from '../../../../lib/Driver';
import OfferMakerOverview from './OfferMakerOverview/OfferMakerOverview';
import ErrorHandler from '../../../../lib/ErrorHandler';

// OfferMaker is an uncontrolled element (from the perspective of its users)
export default class OfferMaker extends React.Component {
    static getErrorType(error) {
        if (!error.data ||
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

        this.orderbookUnsub = this.props.d.orderbook.event.sub((data) => {
            if (data && data.pickPrice) {
                this.updateState('price', data.pickPrice);
            }
        });
        this.sessionUnsub = this.props.d.session.event.sub(() => {
            this.forceUpdate();
        });

        this.state = {
            valid: false,
            price: '', // Most sticky item (since the price is pretty static)
            amount: '',

            // Total = price * amount
            total: '',
            buttonState: 'ready', // ready or pending
            errorMessage: '',
            successMessage: '',
        };

        if (this.props.d.orderbook.data.ready) {
            this.state = Object.assign(this.state, this.initialize());
        }
    }

    componentWillUnmount() {
        this.orderbookUnsub();
        this.sessionUnsub();
    }

    getPercentButton(isBuy, maxOffer, percent) {
        const inputType = isBuy ? 'total' : 'amount';
        const value = ((maxOffer * percent) / 100).toFixed(7).toString();
        return (
            <button
                onClick={(e) => {
                    e.preventDefault();
                    this.updateState(inputType, value);
                }}
                disabled={parseFloat(maxOffer) === 0}
                className={`cancel-button ${this.state[inputType] === value && 'active'}`}>{percent}%</button>
        );
    }

    initialize() {
        if (!this.initialized) {
            this.initialized = true;
            const state = {};

            // Initialize price
            if (this.props.side === 'buy' && this.props.d.orderbook.data.bids.length > 0) {
                state.price = new BigNumber(this.props.d.orderbook.data.bids[0].price).toString();
                // Get rid of extra 0s
            } else if (this.props.d.orderbook.data.asks.length > 0) {
                // Proptypes validation makes sure this is sell
                state.price = new BigNumber(this.props.d.orderbook.data.asks[0].price).toString();
                // Get rid of extra 0s
            }

            state.errorType = '';

            return state;
        }
        return {};
    }

    // TODO: Limit the number of digits after the decimal that can be input
    updateState(item, value, minValue, targetInputType, maxOffer) {
        const state = Object.assign(this.state, {
            // Reset messages
            successMessage: '',
            errorMessage: '',
        });
        state.valid = false;
        if (item === 'price' || item === 'amount' || item === 'total') {
            state[item] = value;
        } else {
            throw new Error('Invalid item type');
        }

        try {
            // If there is an error, we will just let the user input change but not the affected inputs
            if (item === 'price' || item === 'amount') {
                const changeValueType = item === 'price' ? 'amount' : 'price';
                state.total = new BigNumber(
                    new BigNumber(value).times(new BigNumber(state[changeValueType])).toFixed(7),
                ).toString();
            } else if (item === 'total') {
                state.amount = new BigNumber(
                    new BigNumber(value).dividedBy(new BigNumber(state.price)).toFixed(7),
                ).toString();
            } else {
                throw new Error('Invalid item type');
            }
            const hasInvalidPrecision = (state.price < minValue) || (state.amount < minValue)
                || (state.total < minValue);
            const isInsufficient = state[targetInputType] > maxOffer;

            state.valid = !hasInvalidPrecision && !isInsufficient;
        } catch (e) {
            // Invalid input somewhere
        }
        this.setState(state);
    }

    async handleSubmit(event) {
        event.preventDefault();

        const { price, amount, total } = this.state;
        const handlers = this.props.d.session.handlers;
        const signAndSubmit = await handlers.createOffer(this.props.side, { price, amount, total });

        if (signAndSubmit.status === 'await_signers') {
            this.setState({
                amount: '',
                total: '',
                valid: false,
                buttonState: 'ready',
                successMessage: 'Offer was signed with your key. Add additional signatures and submit to the network.',
            });
        }

        if (signAndSubmit.status !== 'finish') { return; }

        this.setState({
            valid: false,
            buttonState: 'pending',
            amount: '',
            total: '',
            successMessage: '',
            errorMessage: '',
        });

        try {
            await signAndSubmit.serverResult;
            this.setState({
                buttonState: 'ready',
                successMessage: 'Offer successfully created',
            });
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

    renderTableRow(inputType, assetName, isBuy, maxOffer, login) {
        // The smallest asset amount unit is one ten-millionth: 1/10000000 or 0.0000001.
        // https://www.stellar.org/developers/guides/concepts/assets.html#amount-precision-and-representation
        const minValue = 0.0000001;

        const invalidPrecision = this.state[inputType] !== '' && this.state[inputType] < minValue;

        const targetInputType = isBuy ? 'total' : 'amount';
        const isInsufficient = login && (inputType === targetInputType) && this.state[inputType] > maxOffer;
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

    renderPercentButtons(isBuy, maxOffer) {
        return (
            <React.Fragment>
                <tr>
                    <td />
                    <td className="offer_table_buttons">
                        {this.getPercentButton(isBuy, maxOffer, 25)}
                        {this.getPercentButton(isBuy, maxOffer, 50)}
                        {this.getPercentButton(isBuy, maxOffer, 75)}
                        {this.getPercentButton(isBuy, maxOffer, 100)}
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
        const { hasTrustNeeded } = this.props;
        const isBuy = this.props.side === 'buy';
        const { baseBuying, counterSelling } = this.props.d.orderbook.data;
        const baseAssetName = baseBuying.getCode();
        const counterAssetName = counterSelling.getCode();
        const title = isBuy
            ? <span>Buy <b>{baseAssetName}</b></span>
            : <span>Sell <b>{baseAssetName}</b></span>;

        const targetAsset = isBuy ? counterSelling : baseBuying;
        const maxOffer = login ? this.calculateMaxOffer(targetAsset) : 0;
        const maxOfferView = (Math.floor((maxOffer) * 10000000) / 10000000).toFixed(7);


        return (
            <div>
                <div className="OfferMaker_title">
                    <h3 className="island__sub__division__title island__sub__division__title--left">{title}</h3>
                    {(login && !hasTrustNeeded) &&
                        <Link to="/account/" className="OfferMaker_balance">
                            <span>Available: </span>
                            <span>{maxOfferView} {targetAsset.code}</span>
                        </Link>
                    }
                </div>
                <form onSubmit={e => this.handleSubmit(e)}>
                    <table className="OfferMaker_table">
                        <tbody>
                            {this.renderTableRow('price', counterAssetName)}
                            {this.renderTableRow('amount', baseAssetName, isBuy, maxOffer, login)}
                            {this.renderPercentButtons(isBuy, maxOfferView)}
                            {this.renderTableRow('total', counterAssetName, isBuy, maxOffer, login)}
                        </tbody>
                    </table>

                    <OfferMakerOverview
                        d={this.props.d}
                        targetAsset={targetAsset}
                        hasTrustNeeded={this.props.hasTrustNeeded}
                        side={this.props.side}
                        offerState={this.state}
                        maxOffer={maxOffer} />
                </form>
            </div>
        );
    }
}

OfferMaker.propTypes = {
    side: PropTypes.oneOf(['buy', 'sell']).isRequired,
    d: PropTypes.instanceOf(Driver).isRequired,
    hasTrustNeeded: PropTypes.bool,
};
