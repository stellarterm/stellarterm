import React from 'react';
import PropTypes from 'prop-types';
import CopyButton from './../../../../../Common/CopyButton/CopyButton';
import Ellipsis from './../../../../../Common/Ellipsis/Ellipsis';
import Driver from '../../../../../../lib/Driver';

const images = require('../../../../../../images');


export default class SignerDataRow extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            keyName: '',
            canRemove: false,
        };
    }

    componentDidMount() {
        this.checkSigner(this.props.signer);
    }

    checkSigner({ key }) {
        const { handlers } = this.props.d.session;

        if (key === handlers.getSignerMarker('lobstrVault')) {
            this.setState({ keyName: 'Stellar Vault marker key' });
            return;
        }

        if (key === handlers.getSignerMarker('stellarGuard')) {
            this.setState({ keyName: 'Stellar Guard marker key' });
            return;
        }

        if (key === this.props.d.session.account.account_id) {
            this.setState({ keyName: 'Your account key' });
            return;
        }

        handlers.isLobstrVaultKey(key).then(
            (res) => {
                const isVault = res[0].exists;
                if (!isVault) {
                    this.props.noVault();
                }

                this.setState({
                    keyName: isVault ? 'Stellar Vault signer key' : 'Signer key',
                    canRemove: true,
                });
            },
        );
    }

    removeSigner() {
        this.props.d.modal.handlers.activate('multisigDisableModal', this.props.signer.key);
    }

    render() {
        if (!this.state.keyName) {
            return (
                <div>
                    <span>
                        Load signer data <Ellipsis />
                    </span>
                </div>
            );
        }

        const { signer } = this.props;
        const signerKey = `${signer.key.substr(0, 18)}...${signer.key.substr(38, 18)}`;

        return (
            <div className="SignerDataRow">
                <div className="SignerDataRow_type">{this.state.keyName}</div>
                <div className="SignerDataRow_key">{signerKey}</div>
                <div className="SignerDataRow_weight">{signer.weight}</div>
                <div className="SignerDataRow_buttons">
                    {this.state.canRemove ?
                        <div className="SignerDataRow_buttons-remove" onClick={() => this.removeSigner()}>
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

}
SignerDataRow.propTypes = {
    signer: PropTypes.shape({
        key: PropTypes.string,
        weight: PropTypes.number,
    }),
    d: PropTypes.instanceOf(Driver).isRequired,
    noVault: PropTypes.func,
};
