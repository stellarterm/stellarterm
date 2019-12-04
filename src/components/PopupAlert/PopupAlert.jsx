import React from 'react';
import PropTypes from 'prop-types';
import Driver from '../../lib/Driver';
import images from '../../images';
import Printify from '../../lib/Printify';

const actionTypes = new Map([
    ['account_inflation_destination_updated', 'Inflation destination set'],
    ['signer_created', 'Signer added'],
    ['signer_updated', 'Signer updated'],
    ['signer_removed', 'Signer removed'],
    ['account_credited', 'Payment received'],
    ['account_debited', 'Payment sent'],
    ['trustline_created', 'Trustline created'],
    ['trustline_removed', 'Trustline removed'],
    ['trade', 'Trade completed'],
]);

export default class PopupAlert extends React.Component {
    static getPaymentBody(op, titleText) {
        const assetCode = op.asset_type === 'native' ? 'XLM' : op.asset_code;

        return (
            <React.Fragment>
                <div className="popup-title">{titleText}</div>
                <div className="popup-text">
                    <div>Amount:</div>
                    <div>
                        {Printify.lightenZeros(op.amount)}{' '}
                        <span>{assetCode}</span>
                    </div>
                </div>
            </React.Fragment>
        );
    }

    static getTradeBody(op, titleText) {
        const tradePrice = (op.sold_amount / op.bought_amount).toFixed(7);
        const boughtCode = op.bought_asset_type === 'native' ? 'XLM' : op.bought_asset_code;
        const soldCode = op.sold_asset_type === 'native' ? 'XLM' : op.sold_asset_code;

        return (
            <React.Fragment>
                <div className="popup-title">{titleText}</div>
                <div className="popup-text">
                    <div>Bought:</div>
                    <div>{Printify.lightenZeros(op.bought_amount)}<span> {boughtCode}</span></div>
                </div>
                <div className="popup-text">
                    <div>Sold:</div>
                    <div>{Printify.lightenZeros(op.sold_amount)}<span> {soldCode}</span></div>
                </div>
                <div className="popup-text-bold">
                    <div>Price:</div>
                    <div>{tradePrice}</div>
                </div>
            </React.Fragment>
        );
    }

    static getTruslineBody(op, titleText) {
        return (
            <React.Fragment>
                <div className="popup-title">{titleText}</div>
                <div className="popup-text">
                    <div>Asset:</div>
                    <div>{op.asset_code}</div>
                </div>
            </React.Fragment>
        );
    }

    static getMultisigBody(op, titleText) {
        return (
            <React.Fragment>
                <div className="popup-title">Multisignature</div>
                <div className="popup-text">
                    <div>{titleText}</div>
                </div>
            </React.Fragment>
        );
    }

    constructor(props) {
        super(props);

        this.listenId = this.props.d.history.event.listen(() => {
            clearTimeout(this.timeout);
            this.setState({ isVisible: true });
        });

        this.state = {
            isVisible: false,
        };
    }

    componentWillUnmount() {
        this.props.d.history.event.unlisten(this.listenId);
    }

    hidePopup() {
        this.setState({ isVisible: false });
        setTimeout(() => {
            this.props.d.history.cleanSessionHistory();
        }, 500);
    }


    getPopupTemplate(op) {
        if (!actionTypes.has(op.type)) { return null; }

        const titleText = actionTypes.get(op.type);
        let key = op.id;
        let opBody;

        switch (op.type) {
        case 'trade':
            key = `${op.id}-${op.offer_id}`;
            opBody = this.constructor.getTradeBody(op, titleText);
            break;
        case 'account_inflation_destination_updated':
            opBody = <div className="popup-title">{titleText}</div>;
            break;
        case 'account_credited' || 'account_debited':
            opBody = this.constructor.getPaymentBody(op, titleText);
            break;
        case 'trustline_created' || 'trustline_removed':
            opBody = this.constructor.getTruslineBody(op, titleText);
            break;
        case 'signer_created' || 'signer_removed' || 'signer_updated':
            opBody = this.constructor.getMultisigBody(op, titleText);
            break;
        default:
            return null;
        }

        return (
            <div className="popup-body" key={key}>
                <div className="popup-icon-cell">
                    <img src={images['icon-circle-success']} alt="Ok-icon" />
                </div>
                <div className="popup-content-cell">{opBody}</div>
            </div>
        );
    }

    render() {
        const { isVisible } = this.state;

        if (isVisible) {
            this.timeout = setTimeout(() => this.hidePopup(), 30000);
        }

        const allOperations = this.props.d.history.popupHistory.map(
            operation => this.getPopupTemplate(operation),
        ).filter(operation => operation !== null);

        return (
            <div className={`PopupAlert ${isVisible ? 'popup-show' : ''}`}>
                <img src={images['icon-close']} alt="X" className="icon-close" onClick={() => this.hidePopup()} />
                {allOperations}
            </div>
        );
    }
}

PopupAlert.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
};
