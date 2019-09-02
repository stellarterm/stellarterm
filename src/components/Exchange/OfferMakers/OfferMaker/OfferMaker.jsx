import React from 'react';
import PropTypes from 'prop-types';
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
                disabled={maxOffer === 0}
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
    updateState(item, value) {
        const state = Object.assign(this.state, {
            // Reset messages
            successMessage: '',
            errorMessage: false,
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

            // TODO: truer valid
            state.valid = true;
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
            errorMessage: false,
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

    renderTableRow(inputType, assetName) {
        return (
            <tr className="offer_table_row">
                <td className="offer_table_label">{inputType}</td>
                <td className="offer_table_input_cell">
                    <label className="offer_input_group" htmlFor={inputType}>
                        <input
                            type="text"
                            name={inputType}
                            maxLength="20"
                            value={this.state[inputType]}
                            onChange={e => this.updateState(inputType, e.target.value)}
                            placeholder="" />
                        <div className="offer_input_group_tag">{assetName}</div>
                    </label>
                </td>
            </tr>
        );
    }

    renderPercentButtons(isBuy, maxOffer) {
        return (
            <tr>
                <td />
                <td className="offer_table_buttons">
                    {this.getPercentButton(isBuy, maxOffer, 25)}
                    {this.getPercentButton(isBuy, maxOffer, 50)}
                    {this.getPercentButton(isBuy, maxOffer, 75)}
                    {this.getPercentButton(isBuy, maxOffer, 100)}
                </td>
            </tr>
        );
    }

    render() {
        if (!this.props.d.orderbook.data.ready) {
            return <div>Loading</div>;
        }
        const login = this.props.d.session.state === 'in';
        const isBuy = this.props.side === 'buy';
        const { baseBuying, counterSelling } = this.props.d.orderbook.data;
        const baseAssetName = baseBuying.getCode();
        const counterAssetName = counterSelling.getCode();
        const title = isBuy
            ? `Buy ${baseAssetName} using ${counterAssetName}`
            : `Sell ${baseAssetName} for ${counterAssetName}`;
        const targetAsset = isBuy ? counterSelling : baseBuying;
        const maxOffer = login ? this.calculateMaxOffer(targetAsset) : 0;

        return (
            <div>
                <h3 className="island__sub__division__title island__sub__division__title--left">{title}</h3>
                <form onSubmit={e => this.handleSubmit(e)}>
                    <table className="OfferMaker_table">
                        <tbody>
                            {this.renderTableRow('price', counterAssetName)}
                            {this.renderTableRow('amount', baseAssetName)}
                            {this.renderPercentButtons(isBuy, maxOffer)}
                            {this.renderTableRow('total', counterAssetName)}
                        </tbody>
                    </table>

                    <OfferMakerOverview
                        d={this.props.d}
                        targetAsset={targetAsset}
                        side={this.props.side}
                        offerState={this.state}
                        maxOffer={maxOffer}
                        updateInputData={(type, value) => this.updateState(type, value)} />
                </form>
            </div>
        );
    }
}

OfferMaker.propTypes = {
    side: PropTypes.oneOf(['buy', 'sell']).isRequired,
    d: PropTypes.instanceOf(Driver).isRequired,
};
