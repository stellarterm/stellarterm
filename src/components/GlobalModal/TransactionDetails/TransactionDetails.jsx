import React from 'react';
import PropTypes from 'prop-types';
import OperationsMap from './OperationsMap';
import AssetCardInRow from '../../Common/AssetCard/AssetCardInRow/AssetCardInRow';
import Printify from '../../../lib/Printify';
import Driver from '../../../lib/Driver';

export default class TransactionDetails extends React.Component {
    static generateTableRow(label, content) {
        return (
            <div key={`${label}_key`} className="Details_row">
                <div className="Details_row_label">{label}</div>
                <div className="Details_row_content">{content}</div>
            </div>
        );
    }

    static getOperationAttr(op, d) {
        return Object.keys(op)
            .map((attr) => {
                const value = op[attr];

                let AttrObj = {
                    key: attr,
                    name: attr,
                };

                if (value === undefined) {
                    return null;
                }

                if (value.code !== undefined) {
                    AttrObj.display = <AssetCardInRow code={value.code} issuer={value.issuer} d={d} />;
                } else if (typeof value === 'string') {
                    AttrObj.display = value;
                } else if (attr === 'signer') {
                    AttrObj.display = this.getSignerCard(value);
                } else {
                    AttrObj.display = <pre>{JSON.stringify(value, null, 2)}</pre>;
                }

                if (attr === 'price') {
                    AttrObj.display = Printify.lightenZeros(Number(AttrObj.display).toFixed(7));
                } else if (attr === 'type' || attr === 'limit') {
                    AttrObj = null;
                } else if (attr === 'line' || attr === 'asset' || attr === 'destination') {
                    AttrObj.name = null;
                }

                if (
                    (op.type === 'manageOffer' || op.type === 'manageSellOffer') && op.amount === '0' &&
                    (attr === 'selling' || attr === 'buying' || attr === 'amount' || attr === 'price')
                ) { AttrObj = null; }

                if (
                    op.type === 'manageBuyOffer' && op.buyAmount === '0' &&
                    (attr === 'selling' || attr === 'buying' || attr === 'buyAmount' || attr === 'price')
                ) { AttrObj = null; }

                return AttrObj;
            })
            .filter(attr => attr !== null);
    }

    static getSignerCard(signer) {
        return (
            <div>
                <div className="SignerData_item">
                    <div className="SignerData_title">key:</div>
                    <div className="SignerData_key">{signer.ed25519PublicKey}</div>
                </div>
                <div className="SignerData_item">
                    <div className="SignerData_title">weight:</div>
                    <div className="SignerData_content">{signer.weight}</div>
                </div>
            </div>
        );
    }

    static getOperationLabel(op) {
        switch (op.type) {
        case 'changeTrust':
            return parseFloat(op.limit) === 0 ? 'Remove Asset' : 'Accept Asset';
        case 'manageOffer':
            return parseFloat(op.amount) === 0 ? 'Delete Offer' : 'Manage Offer';
        case 'manageBuyOffer':
            return parseFloat(op.buyAmount) === 0 ? 'Delete Offer' : 'Manage Offer';
        case 'manageSellOffer':
            return parseFloat(op.amount) === 0 ? 'Delete Offer' : 'Manage Offer';
        default:
            break;
        }
        return OperationsMap[op.type].label;
    }

    getOperations() {
        const { tx, d } = this.props;
        return tx.operations.map((op) => {
            const attributes = this.constructor.getOperationAttr(op, d);
            const label = this.constructor.getOperationLabel(op);
            const isDeleteOffer = label === 'Delete Offer';
            const isManageData = label === 'Manage Data';

            const attributesUi = isManageData ? op.name : attributes.map((attribute) => {
                const hideDeleteItems = attribute.name === 'amount' || attribute.name === 'price';

                return isDeleteOffer && hideDeleteItems ? null : (
                    <div className="Inline_content" key={attribute.key}>
                        <div className="Inline_value">{attribute.display}</div>
                        {attribute.name ? <span className="Inline_attr">{attribute.name}</span> : null}
                    </div>
                );
            });

            return this.constructor.generateTableRow(label, attributesUi);
        });
    }

    getMemo() {
        const { tx } = this.props;

        return tx.memo._type === 'none' ? (
            <span className="Content_light">No memo</span>
        ) : (
            <React.Fragment>
                <p className="Inline_title">{tx.memo._type}</p>
                <div className="Inline_content">{tx.memo._value}</div>
            </React.Fragment>
        );
    }

    render() {
        const { tx } = this.props;
        const isPayment = !!tx.operations.find(op => op.type === 'payment');

        return (
            <div className="TransactionDetails">
                {this.constructor.generateTableRow('Source', tx.source)}
                {this.constructor.generateTableRow('Sequence', tx.sequence)}
                {this.getOperations()}
                {isPayment && this.constructor.generateTableRow('Memo', this.getMemo())}
            </div>
        );
    }
}

TransactionDetails.propTypes = {
    // TODO: Valid proptype
    d: PropTypes.instanceOf(Driver),
    tx: PropTypes.objectOf(PropTypes.any).isRequired,
};
