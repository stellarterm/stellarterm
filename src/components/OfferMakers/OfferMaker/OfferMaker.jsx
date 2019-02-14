import React from 'react';
import PropTypes from 'prop-types';
import BigNumber from 'bignumber.js';
import Driver from '../../../lib/Driver';
import OfferMakerOverview from './OfferMakerOverview/OfferMakerOverview';
import OfferMakerSubmit from './OfferMakerSubmit/OfferMakerSubmit';
import OfferMakerBalanceChecker from './OfferMakerBalanceChecker/OfferMakerBalanceChecker';


// OfferMakers is an uncontrolled element (from the perspective of its users)
export default class OfferMaker extends React.Component {
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

        this.handleSubmit = (e) => {
            // TODO: Hook up with driver
            e.preventDefault();
            props.d.session.handlers
                .createOffer(props.side, {
                    price: this.state.price,
                    amount: this.state.amount,
                    total: this.state.total,
                })
                .then((signAndSubmitResult) => {
                    if (signAndSubmitResult.status === 'finish') {
                        this.setState({
                            valid: false,
                            buttonState: 'pending',
                            amount: '',
                            total: '',
                            successMessage: '',
                            errorMessage: false,
                        });

                        signAndSubmitResult.serverResult
                            .then(() => {
                                this.setState({
                                    buttonState: 'ready',
                                    successMessage: 'Offer successfully created',
                                });
                            })
                            .catch((result) => {
                                let errorType;
                                try {
                                    if (result.data === undefined) {
                                        errorType = `clientError - ${result.message}`;
                                    } else if (result.data && result.data.extras) {
                                        if (result.data.extras.result_codes.operations === undefined) {
                                            errorType = result.data.extras.result_codes.transaction;
                                        } else {
                                            // Common errors:
                                            // errorType = 'buy_not_authorized'
                                            // errorType = 'op_low_reserve'
                                            errorType = result.data.extras.result_codes.operations[0];
                                        }
                                    } else {
                                        errorType = `unknownResponse - ${e.message}`;
                                    }
                                } catch (error) {
                                    console.error(error);
                                    errorType = `unknownResponse - ${e.message}`;
                                }

                                this.setState({
                                    buttonState: 'ready',
                                    errorMessage: true,
                                    errorType,
                                });
                            });
                    }
                });
        };
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
            if (item === 'price') {
                state.total = new BigNumber(
                    new BigNumber(value).times(new BigNumber(state.amount)).toFixed(7),
                ).toString();
            } else if (item === 'amount') {
                state.total = new BigNumber(
                   new BigNumber(value).times(new BigNumber(state.price)).toFixed(7),
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

    renderTableRow(key, asset) {
        return (
            <tr className="OfferMaker__table__row">
                <td className="OfferMaker__table__label">{key}</td>
                <td className="OfferMaker__table__input">
                    <label className="OfferMaker__table__input__group" htmlFor={key}>
                        <input
                            type="text"
                            name={key}
                            className="OfferMaker__table__input__input"
                            value={this.state[key]}
                            onChange={e => this.updateState(key, e.target.value)}
                            placeholder="" />
                        <div className="OfferMaker__table__input__group__tag">{asset}</div>
                    </label>
                </td>
            </tr>
        );
    }

    render() {
        if (!this.props.d.orderbook.data.ready) {
            return <div>Loading</div>;
        }

        const baseAssetName = this.props.d.orderbook.data.baseBuying.getCode();
        const counterAssetName = this.props.d.orderbook.data.counterSelling.getCode();

        let title = `Buy ${baseAssetName} using ${counterAssetName}`;
        if (this.props.side === 'sell') {
            title = `Sell ${baseAssetName} for ${counterAssetName}`;
        }

        const { balance, code, insufficient, trustNeeded } =
            OfferMakerBalanceChecker(this.props.d, this.props.side, this.state.total, this.state.amount);

        return (
            <div>
                <h3 className="island__sub__division__title island__sub__division__title--left">{title}</h3>
                <form onSubmit={this.handleSubmit}>
                    <table className="OfferMaker__table">
                        <tbody>
                            {this.renderTableRow('price', counterAssetName)}
                            {this.renderTableRow('amount', baseAssetName)}
                            {this.renderTableRow('total', counterAssetName)}
                        </tbody>
                    </table>

                    <OfferMakerOverview
                        d={this.props.d}
                        side={this.props.side}
                        valid={this.state.valid}
                        total={this.state.total}
                        amount={this.state.amount}
                        errorType={this.state.errorType}
                        errorMessage={this.state.errorMessage}
                        successMessage={this.state.successMessage}
                        insufficient={insufficient}
                        trustNeeded={trustNeeded}
                        balance={balance}
                        assetName={code} />

                    <OfferMakerSubmit
                        d={this.props.d}
                        side={this.props.side}
                        buttonState={this.state.buttonState}
                        valid={this.state.valid}
                        assetName={baseAssetName}
                        trustNeeded={trustNeeded}
                        insufficient={insufficient} />

                </form>
            </div>
        );
    }
}

OfferMaker.propTypes = {
    side: PropTypes.oneOf(['buy', 'sell']).isRequired,
    d: PropTypes.instanceOf(Driver).isRequired,
};
