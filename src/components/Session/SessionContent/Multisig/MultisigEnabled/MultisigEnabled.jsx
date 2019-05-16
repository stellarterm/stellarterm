import React from 'react';
import PropTypes from 'prop-types';
import SignerDataRow from './SignerDataRow/SignerDataRow';
import Driver from '../../../../../lib/Driver';
import Ellipsis from './../../../../Common/Ellipsis/Ellipsis';

const images = require('../../../../../images');


export default class MultisigEnabled extends React.Component {
    static getShortKey(key) {
        return `${key.substr(0, 18)}...${key.substr(38, 18)}`;
    }

    constructor(props) {
        super(props);
        this.state = {
            signersData: undefined,
            onlyVaultSigners: undefined,
        };
    }

    componentDidMount() {
        this.getSignersData();
    }

    componentDidUpdate() {
        if (this.state.signersData && (this.props.d.session.account.signers.length !== this.state.signersData.length)) {
            this.getSignersData();
        }
    }

    getSigners() {
        const { signersData } = this.state;

        if (signersData === undefined) {
            return (
                <div className="SignerDataRow">
                    <span>LOADING<Ellipsis /></span>
                </div>
            );
        }

        return signersData.map(signer => (
            <SignerDataRow
                key={signer.key}
                signer={signer}
                d={this.props.d} />
        ));
    }

    getKnownKeyData(key) {
        const { session } = this.props.d;
        const knownKeys = {
            [session.handlers.getSignerMarker('lobstrVault')]: {
                type: 'Stellar Vault marker key',
                noVault: false,
                canRemove: false,
                imageName: 'sign-vault',
                title: 'LOBSTR Vault',
            },
            [session.handlers.getSignerMarker('stellarGuard')]: {
                type: 'Stellar Guard marker key',
                noVault: true,
                canRemove: false,
                imageName: 'sign-stellarguard',
                title: 'StellarGuard',
            },
            [session.account.account_id]: {
                type: 'Your account key',
                noVault: false,
                canRemove: false,
            },
        };
        if (!knownKeys[key]) {
            return null;
        }

        return knownKeys[key];
    }

    getSignersData() {
        const { signers } = this.props.d.session.account;
        const { handlers } = this.props.d.session;

        const promises = signers
            .sort((a, b) => a.key.localeCompare(b.key))
            .map(({ key, weight }) => {
                const shortKey = this.constructor.getShortKey(key);
                const signerData = { key, weight, shortKey };

                const knownKey = this.getKnownKeyData(key);

                if (knownKey) {
                    return Promise.resolve(Object.assign(signerData, knownKey));
                }

                return handlers.isLobstrVaultKey(key)
                    .then(([res]) => {
                        const noVault = !res.exists;
                        const signerCheckedData = {
                            noVault,
                            type: !noVault ? 'Stellar Vault signer key' : 'Signer key',
                            canRemove: true,
                        };

                        return Object.assign(signerData, signerCheckedData);
                    })
                    .catch(() => {
                        const signerDefaultData = {
                            type: 'Signer key',
                            canRemove: true,
                            noVault: true,
                        };

                        return Object.assign(signerData, signerDefaultData);
                    });
            });

        Promise.all(promises).then((signersData) => {
            const onlyVaultSigners = signersData.every(signer => !signer.noVault);
            this.setState({ signersData, onlyVaultSigners });
        });
    }

    getMultisigData() {
        const { signers } = this.props.d.session.account;

        let imageName = 'sign-unknown';
        let title = 'unknown signer';

        signers.forEach((signer) => {
            const knownData = this.getKnownKeyData(signer.key);
            if (knownData && knownData.type !== 'Your account key') {
                imageName = knownData.imageName;
                title = knownData.title;
            }
        });

        return (
            <div className="MultisigEnabled-header-content">
                <div className="MultisigEnabled-header-logo">
                    <img src={images[imageName]} alt={title} />
                </div>
                <div className="MultisigEnabled-header-text">
                    <h1>Multisignature enabled</h1>
                    <span>
                        Account protected by {title}.
                    </span>
                </div>
            </div>
        );
    }

    getRequiredSignersData() {
        const { signers } = this.props.d.session.account;

        if (signers.length < 4 || !this.state.onlyVaultSigners) {
            return null;
        }
        const requiredSigner = this.props.d.session.account.thresholds.low_threshold / 10;

        return (
            <div className="MultisigEnabled-header-required-signers">
                <span>
                    {requiredSigner} of {signers.length - 1} signers required to sign transactions.
                    (Your account + {requiredSigner - 1} co-signer)
                </span>
                <div
                    className="CopyButton"
                    onClick={() => this.props.d.modal.handlers.activate('multisigSetRequiredSigners')}>
                    <img src={images['icon-edit']} alt="edit" />
                    <span>EDIT</span>
                </div>
            </div>
        );
    }

    addNewSigner() {
        this.props.d.modal.handlers.activate('multisigEnableStep2', this.props.d);
    }

    render() {
        return (
            <div className="MultisigEnabled">
                <div className="MultisigEnabled-header">
                    <div className="MultisigEnabled-header-wrap">
                        {this.getMultisigData()}
                        <a
                            className="MultisigEnabled-header-wrap-info"
                            href="https://lobstr.zendesk.com/hc/en-us/categories/360001534333-LOBSTR-Vault"
                            rel="noopener noreferrer"
                            target="_blank">
                            <img src={images['icon-info']} alt="i" />
                        </a>
                    </div>

                    {this.getRequiredSignersData()}
                </div>
                <div className="MultisigEnabled-signers-block">
                    <div className="MultisigEnabled-signers-header">
                        <span>Account</span>
                        <span>Public key</span>
                        <span>Weight</span>
                    </div>
                    {this.getSigners()}

                    {this.state.onlyVaultSigners &&
                        <button className="s-button" onClick={() => this.addNewSigner()}>Add signer</button>}
                </div>
            </div>
        );
    }
}
MultisigEnabled.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
};
