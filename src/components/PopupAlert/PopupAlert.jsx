import React from 'react';
import PropTypes from 'prop-types';
import Driver from '../../lib/Driver';
import images from '../../images';
import Printify from '../../lib/Printify';

const MAX_ALERTS_LENGTH = 3;

export default class PopupAlert extends React.Component {
    static getOperationIcon(index) {
        return index === 0 ? (
            <img src={images['icon-circle-success']} alt="Ok-icon" />
        ) : (
            <img src={images['icon-circle-success-gray']} alt="Ok-icon" />
        );
    }

    static getPopupOperation(op, animateBody, icon) {
        const animateBodyClass = animateBody ? 'popup-body-show' : 'popup-body-noAnim';

        if (op.type === 'account_credited') {
            const assetCode = op.asset_type === 'native' ? 'XLM' : op.asset_code;

            return (
                <div className={`popup-body ${animateBodyClass}`}>
                    <div className="popup-icon-cell">{icon}</div>
                    <div className="popup-content-cell">
                        <div className="popup-title">Account credited</div>
                        <div className="popup-text">
                            <div>Recieved:</div>
                            <div>
                                {Printify.lightenZeros(op.amount)} <span>{assetCode}</span>
                            </div>
                        </div>
                    </div>
                </div>
            );
        } else if (op.type === 'trade') {
            const tradePrice = (op.sold_amount / op.bought_amount).toFixed(7);
            const boughtCode = op.bought_asset_type === 'native' ? 'XLM' : op.bought_asset_code;
            const soldCode = op.sold_asset_type === 'native' ? 'XLM' : op.sold_asset_code;

            return (
                <div className={`popup-body ${animateBodyClass}`} key={`${op.id}-${op.offer_id}`}>
                    <div className="popup-icon-cell">{icon}</div>
                    <div className="popup-content-cell">
                        <div className="popup-title">Traded</div>
                        <div className="popup-text">
                            <div>Buy:</div>
                            <div>
                                {Printify.lightenZeros(op.bought_amount)}
                                <span> {boughtCode}</span>
                            </div>
                        </div>
                        <div className="popup-text">
                            <div>Sold:</div>
                            <div>
                                {Printify.lightenZeros(op.sold_amount)}
                                <span> {soldCode}</span>
                            </div>
                        </div>
                        <div className="popup-text-bold">
                            <div>Price:</div>
                            <div>{tradePrice}</div>
                        </div>
                    </div>
                </div>
            );
        }
        return null;
    }

    constructor(props) {
        super(props);

        this.listenId = this.props.d.history.eventNewOp.listen(() => {
            this.setState({ isVisible: true });
        });

        this.state = {
            isVisible: false,
        };
    }

    componentWillUnmount() {
        this.props.d.history.event.unlisten(this.listenId);
    }

    getPopupContent() {
        const operations = this.props.d.history.lastOperations;
        const isAnyNewOperation = operations !== undefined && operations.length !== 0;
        const needAnimateBody = isAnyNewOperation && operations.length > 0 && operations.length <= MAX_ALERTS_LENGTH;

        if (operations.length > MAX_ALERTS_LENGTH) {
            operations.pop();
        }

        return operations
            .map((op, index) => {
                const iconForElement = this.constructor.getOperationIcon(index);
                return this.constructor.getPopupOperation(op, needAnimateBody, iconForElement);
            })
            .filter(op => op !== null);
    }

    closePopupClick() {
        this.setState({ isVisible: false });
        setTimeout(() => {
            this.props.d.history.lastOperations = [];
        }, 500);
    }

    render() {
        const { isVisible } = this.state;

        return (
            <div className={`PopupAlert ${isVisible ? 'popup-show' : ''}`}>
                <img src={images['icon-close']} alt="X" className="icon-close" onClick={() => this.closePopupClick()} />
                {this.getPopupContent()}
            </div>
        );
    }
}

PopupAlert.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
};
