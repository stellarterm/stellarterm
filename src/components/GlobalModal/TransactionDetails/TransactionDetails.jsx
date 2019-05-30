import React from 'react';
import PropTypes from 'prop-types';
import BigNumber from 'bignumber.js';
import OperationsMap from './OperationsMap';
import AssetCard2 from '../../Common/AssetCard2/AssetCard2';
import Printify from '../../../lib/Printify';

export default class TransactionDetails extends React.Component {
    static generateTableRow(label, content) {
        return (
            <div key={`${label}_key`} className="Details_row">
                <div className="Details_row_label">{label}</div>
                <div className="Details_row_content">{content}</div>
            </div>
        );
    }

    static getOperationAttr(op) {
        return Object.keys(op)
            .map((attr) => {
                const value = op[attr];

                let AttrObj = {
                    key: attr,
                    name: attr,
                };

                if (value === undefined) {
                    return AttrObj;
                }

                if (value.code !== undefined) {
                    AttrObj.display = <AssetCard2 code={value.code} issuer={value.issuer} inRow />;
                } else if (typeof value === 'string') {
                    AttrObj.display = value;
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
                    op.type === 'manageOffer' && op.amount === '0' &&
                    (attr === 'selling' || attr === 'buying' || attr === 'amount' || attr === 'price')
                ) { AttrObj = null; }
                return AttrObj;
            })
            .filter(attr => attr !== null);
    }

    static getOperationLabel(op) {
        switch (op.type) {
        case 'changeTrust':
            return op.limit === '0' ? 'Remove Asset' : 'Accept Asset';
        case 'manageOffer':
            return op.amount === '0' ? 'Delete Offer' : 'Manage Offer';
        default:
            break;
        }
        return OperationsMap[op.type].label;
    }

    getOperations() {
        const { tx } = this.props;
        return tx.operations.map((op) => {
            const attributes = this.constructor.getOperationAttr(op);
            const label = this.constructor.getOperationLabel(op);
            const attributesUi = attributes.map(attribute => (
                <div className="Inline_content" key={attribute.key}>
                    <div className="Inline_value">{attribute.display}</div>
                    {attribute.name ? <span className="Inline_attr">{attribute.name}</span> : null}
                </div>
            ));

            // Temp solution for hide big json data when setting Federation
            if (label === 'Manage Data') {
                return null;
            }
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

        const networkFeeString = `${new BigNumber(tx.fee).dividedBy(10000000).toString()} XLM`;

        return (
            <div className="TransactionDetails">
                {this.constructor.generateTableRow('Source', tx.source)}
                {this.constructor.generateTableRow('Sequence', tx.sequence)}
                {this.getOperations()}
                {this.constructor.generateTableRow('Network Fee', networkFeeString)}
                {this.constructor.generateTableRow('Memo', this.getMemo())}
            </div>
        );
    }
}

TransactionDetails.propTypes = {
    // TODO: Valid proptype
    tx: PropTypes.objectOf(PropTypes.any).isRequired,
};
