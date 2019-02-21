import React from 'react';
import PropTypes from 'prop-types';
import BigNumber from 'bignumber.js';
import Driver from '../lib/Driver';
import OfferMakerOverview from './OfferMakerOverview';

// OfferMaker is an uncontrolled element (from the perspective of its users)
export default class OfferMaker extends React.Component {
    static getErrorType(error) {
        if (!error.data) {
            return `clientError - ${error.message}`;
        }
        if (!error.data.extras || !error.data.exras.result_codes) {
            return `unknownResponse - ${error.message}`;
        }
        if (!error.data.extras.result_codes.operations) {
            return error.data.extras.result_codes.transaction;
        }
        // Common errors:
        // return 'buy_not_authorized'
        // return 'op_low_reserve'
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
            errorMessage: false,
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
            const errorType = this.constructor.getErrorType(error);
            this.setState({
                buttonState: 'ready',
                errorMessage: true,
                errorType,
            });
        }
    }

    renderTableRow(inputType, assetName) {
        return (
            <tr className="OfferMaker__table__row">
                <td className="OfferMaker__table__label">{inputType}</td>
                <td className="OfferMaker__table__input">
                    <label className="OfferMaker__table__input__group" htmlFor={inputType}>
                        <input
                            type="text"
                            name={inputType}
                            className="OfferMaker__table__input__input"
                            value={this.state[inputType]}
                            onChange={e => this.updateState(inputType, e.target.value)}
                            placeholder="" />
                        <div className="OfferMaker__table__input__group__tag">{assetName}</div>
                    </label>
                </td>
            </tr>
        );
    }

    render() {
        if (!this.props.d.orderbook.data.ready) {
            return <div>Loading</div>;
        }
        const isBuy = this.props.side === 'buy';
        const { baseBuying, counterSelling } = this.props.d.orderbook.data;
        const baseAssetName = baseBuying.getCode();
        const counterAssetName = counterSelling.getCode();
        const title = isBuy ?
            `Buy ${baseAssetName} using ${counterAssetName}` :
            `Sell ${baseAssetName} for ${counterAssetName}`;
        const targetAsset = isBuy ? counterSelling : baseBuying;
        return (
            <div>
                <h3 className="island__sub__division__title island__sub__division__title--left">{title}</h3>
                <form onSubmit={e => this.handleSubmit(e)}>
                    <table className="OfferMaker__table">
                        <tbody>
                            {this.renderTableRow('price', counterAssetName)}
                            {this.renderTableRow('amount', baseAssetName)}
                            {this.renderTableRow('total', counterAssetName)}
                        </tbody>
                    </table>

                    <OfferMakerOverview
                        d={this.props.d}
                        targetAsset={targetAsset}
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
};
