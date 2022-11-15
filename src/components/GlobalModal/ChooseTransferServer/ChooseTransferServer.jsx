import React, { useState } from 'react';
import PropTypes from 'prop-types';
import images from '../../../images';
import Driver from '../../../lib/driver/Driver';

const getModalContent = (type, asset) => {
    switch (type) {
        case 'deposit':
            return {
                title: 'Choose Deposit Partner',
                description: `There are several trusted partners that provide ${asset.code} deposit services. Please choose one that works best for you.`,
            };
        case 'withdraw': {
            return {
                title: 'Choose Withdrawal Partner',
                description: `There are several trusted partners that provide ${asset.code} withdrawal services. Please choose one that works best for you.`,
            };
        }
        case 'history': {
            return {
                title: 'History of Deposits and Withdrawals',
                description: `There are several trusted partners that provide ${asset.code} transfer services. Choose the partner you used to deposit or withdraw USDC to view the history of your past transfers.`,
            };
        }
        default: throw Error('Unknown type');
    }
};


const ChooseTransferServer = ({ d, data, submit }) => {
    const [selectedAnchor, setSelectedAnchor] = useState(null);

    const { type, anchors, asset } = data;
    const { title, description } = getModalContent(type, asset);

    const submitAnchor = () => {
        submit.finish({
            domain: selectedAnchor.domain,
            support: selectedAnchor.support,
            isSep24: selectedAnchor.sep24,
        });
    };


    return (
        <div className="ChooseTransferServer">
            <div className="Modal_header">
                <span>{title}</span>
                <img
                    src={images['icon-close']}
                    alt="X"
                    onClick={() => {
                        d.modal.handlers.cancel();
                        window.history.pushState({}, null, '/');
                    }}
                />
            </div>

            <div className="ChooseTransferServer_content">
                <div className="ChooseTransferServer_description">
                    {description}
                </div>

                <div className="ChooseTransferServer_anchors">
                    {anchors.map(anchor =>
                        <div
                            key={anchor.domain}
                            className={`ChooseTransferServer_anchor ${(selectedAnchor && anchor.domain === selectedAnchor.domain) ? 'active' : ''}`}
                            onClick={() => setSelectedAnchor(anchor)}
                        >
                            <img src={anchor.logo} alt="" className="ChooseTransferServer_anchor-logo" />
                            <div className="ChooseTransferServer_anchor-info">
                                <div className="ChooseTransferServer_anchor-title">
                                    {anchor.title}
                                </div>
                                <div className="ChooseTransferServer_anchor-description">
                                    {anchor.description}
                                </div>
                            </div>
                        </div>,
                    )}
                </div>

                <div className="Modal_button-block">
                    <button className="cancel-button" onClick={() => submit.cancel()}>
                        Cancel
                    </button>
                    <button className="s-button" disabled={!selectedAnchor} onClick={() => submitAnchor()}>
                        Continue
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChooseTransferServer;

ChooseTransferServer.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
    submit: PropTypes.objectOf(PropTypes.func),
    data: PropTypes.shape({
        anchors: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any)),
        type: PropTypes.oneOf(['deposit', 'withdraw', 'history']),
        asset: PropTypes.objectOf(PropTypes.any),
    }),
};
