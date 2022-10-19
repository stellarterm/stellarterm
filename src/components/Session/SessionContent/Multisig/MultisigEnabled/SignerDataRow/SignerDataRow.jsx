import React from 'react';
import PropTypes from 'prop-types';
import createStellarIdenticon from 'stellar-identicon-js';
import CopyButton from './../../../../../Common/CopyButton/CopyButton';
import Driver from '../../../../../../lib/driver/Driver';

const images = require('../../../../../../images');


export default function SignerDataRow(props) {
    const { signer } = props;
    const { isCustomConfig } = props.d.multisig;
    const canvas = createStellarIdenticon(signer.key);
    const renderedIcon = canvas.toDataURL();

    return (
        <div className="SignerDataRow">
            <div className="SignerDataRow_type">{signer.name}</div>
            <div className="SignerDataRow_key">
                <div className="SignerDataRow_icon">
                    <img src={renderedIcon} alt="id" />
                </div>
                {signer.shortKey}
            </div>
            <div className="SignerDataRow_weight">{signer.weight}</div>
            <div className="SignerDataRow_buttons">
                {(signer.canRemove && !isCustomConfig) ?
                    <div
                        className="SignerDataRow_buttons-remove"
                        onClick={() => props.d.modal.handlers.activate('multisigDisableModal', signer)}
                    >
                        <img src={images['icon-close-green']} alt="X" />
                        <span>remove</span>
                    </div>
                    : <div />
                }
                <CopyButton text={signer.key} />
            </div>
        </div>
    );
}
SignerDataRow.propTypes = {
    signer: PropTypes.shape({
        key: PropTypes.string,
        weight: PropTypes.number,
        name: PropTypes.string,
    }),
    d: PropTypes.instanceOf(Driver).isRequired,
};
