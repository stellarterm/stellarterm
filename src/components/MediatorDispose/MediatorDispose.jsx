import React, { useState } from 'react';
import PropTypes from 'prop-types';
import * as StellarSdk from '@stellar/stellar-sdk';
import Driver from '../../lib/driver/Driver';
import Input from '../Common/Input/Input';
import CopyButton from '../Common/CopyButton/CopyButton';

function convertToStellarAsset(asset) {
    if (asset instanceof StellarSdk.Asset) { return asset; }
    if (asset === 'xlm' || asset === 'XLM' || asset.asset_type === 'native') { return StellarSdk.Asset.native(); }
    if (asset.asset_type) { return new StellarSdk.Asset(asset.asset_code, asset.asset_issuer); }
    const [code, issuer] = asset.includes('-') ?
        asset.split('-') :
        asset.split(':');
    return new StellarSdk.Asset(code, issuer);
}


const MediatorDispose = ({ d }) => {
    const [user, setUser] = useState('');
    const [mediator, setMediator] = useState('');
    const [pending, setPending] = useState(false);
    const [xdr, setXdr] = useState(null);

    const generateDisposeXDR = async () => {
        if (!StellarSdk.StrKey.isValidEd25519PublicKey(user)) {
            d.toastService.error('Invalid user account');
            return;
        }

        if (!StellarSdk.StrKey.isValidEd25519PublicKey(mediator)) {
            d.toastService.error('Invalid mediator account');
            return;
        }

        setPending(true);

        const mediatorAccount = await d.Server.loadAccount(mediator);

        if (!mediatorAccount.signers.find(s => s.key === user)) {
            d.toastService.error(`${mediator} is not a mediator account for ${user}`);
        }

        const ops = [];

        for (const balance of mediatorAccount.balances) {
            if (balance.asset_type === 'native') {
                continue; // skip XLM trustline - merge will handle the transfer
            }

            const asset = convertToStellarAsset(balance);
            // transfer remaining balance to the source account
            if (balance.balance > 0) {
                ops.push(StellarSdk.Operation.payment({
                    source: mediator,
                    asset,
                    destination: user,
                    amount: balance.balance,
                }));
            }
            // remove trustline
            ops.push(StellarSdk.Operation.changeTrust({
                source: mediator,
                asset,
                limit: '0',
            }));
        }

        // merge
        ops.push(StellarSdk.Operation.accountMerge({
            source: mediator,
            destination: user,
        }));

        const userAccount = await d.Server.loadAccount(user);

        const builder = new StellarSdk.TransactionBuilder(userAccount, {
            fee: '100000',
            networkPassphrase: StellarSdk.Networks.PUBLIC,
        }).setTimeout(StellarSdk.TimeoutInfinite);

        for (const op of ops) {
            builder.addOperation(op);
        }

        const tx = builder.build();

        setXdr(tx.toEnvelope().toXDR('base64'));

        setPending(false);
    };

    return (
        <div className="island Swap_container" style={{ display: 'flex', flexDirection: 'column', gap: 30 }}>
            <div className="Swap_header">
                <div className="Swap_title">
                    Generate dispose XDR
                </div>
            </div>
            <Input label="User account" value={user} onChange={setUser} />
            <Input label="Mediator account" value={mediator} onChange={setMediator} />

            <button className="s-button" disabled={!user || !mediator} onClick={() => generateDisposeXDR()}>GENERATE {pending && <div className="nk-spinner" />}</button>

            {xdr && <div>
                <textarea style={{ width: '100%' }} rows={10}>{xdr}</textarea>
                <CopyButton text={xdr} />
            </div>}
        </div>
    );
};

export default MediatorDispose;


MediatorDispose.propTypes = {
    d: PropTypes.instanceOf(Driver),
};
