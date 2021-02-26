import React, { useState } from 'react';
import PropTypes from 'prop-types';
import images from '../../../images';

const WalletConnectPairingModal = ({ submit, data }) => {
    const { pairings, connect, deletePairing } = data;

    const [currentPairings, setCurrentPairings] = useState(pairings);

    return (
        <div className="WalletConnectPairingModal">
            <div className="Modal_header">
                <span>Log in with WalletConnect</span>
                <img
                    src={images['icon-close']}
                    alt="X"
                    onClick={() => {
                        submit.cancel();
                    }}
                />
            </div>
            <div className="WalletConnectPairingModal_content">
                <div className="WalletConnectPairingModal_title">
                    We noticed you’ve logged in with WalletConnect before.
                    <br />
                    Restore your previous connection or create a new one to log in.
                </div>
                {currentPairings.map((pairing, index) => (
                    <div
                        className="WalletConnectPairingModal_pairing"
                        key={pairing.topic}
                        onClick={() => connect(pairing)}
                    >
                        <img className="WalletConnectPairingModal_pairing-icon" src={pairing.state.metadata.icons[0]} alt="" />
                        <div className="WalletConnectPairingModal_pairing-data">
                            <span className={`WalletConnectPairingModal_pairing-name ${currentPairings.length > 1 && index === 0 ? 'latest' : ''}`}>
                                {pairing.state.metadata.name}
                            </span>
                            <span className="WalletConnectPairingModal_pairing-description">{pairing.state.metadata.description}</span>
                        </div>
                        <div
                            className="WalletConnectPairingModal_pairing-delete"
                            onClick={e => {
                                e.stopPropagation();
                                deletePairing(pairing.topic);
                                setCurrentPairings(currentPairings.filter(pair => pair.topic !== pairing.topic));
                            }}
                        >
                            <img src={images['icon-close']} alt="" />
                        </div>
                    </div>
                ))}

                <div className="WalletConnectPairingModal_new" onClick={() => connect()}>
                    <img src={images['icon-plus-green']} alt="" />
                    <span>NEW CONNECTION</span>
                </div>
            </div>
        </div>
    );
};

export default WalletConnectPairingModal;

WalletConnectPairingModal.propTypes = {
    submit: PropTypes.objectOf(PropTypes.func),
    data: PropTypes.shape({
        pairings: PropTypes.arrayOf(PropTypes.any),
        connect: PropTypes.func,
    }),
};

