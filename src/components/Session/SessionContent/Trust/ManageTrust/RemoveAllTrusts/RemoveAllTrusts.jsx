import React from 'react';
import PropTypes from 'prop-types';
import Driver from '../../../../../../lib/Driver';
import Ellipsis from '../../../../../Common/Ellipsis/Ellipsis';
import images from '../../../../../../images';

export default class RemoveAllTrusts extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            status: 'ready', // Can be: ready, pending, error
        };
    }

    getRemovableAssets() {
        const account = this.props.d.session.account;
        const allBalances = account.getSortedBalances({ hideNative: true });

        return allBalances
            .map((asset) => {
                const { balance, code, issuer } = asset;
                const balanceIsZero = balance === '0.0000000';
                const orderExists = account.isOrderExists(new StellarSdk.Asset(code, issuer));
                const canBeRemoved = balanceIsZero && !orderExists;

                if (canBeRemoved) {
                    return asset;
                }
                return null;
            })
            .filter(asset => asset !== null);
    }

    clickRemoveAll(e) {
        e.preventDefault();
        const assetsToRemove = this.getRemovableAssets();

        this.props.d.session.handlers.removeTrust(assetsToRemove).then(({ status, serverResult }) => {
            if (status !== 'finish') {
                return null;
            }

            this.setState({ status: 'pending' });
            return serverResult
                .then((res) => {
                    console.log('Successfully removed zero balance assets', res);
                    this.setState({ status: 'ready' });
                })
                .catch((err) => {
                    console.log('Errored when removing zero balance assets', err);
                    this.setState({ status: 'error' });
                });
        });
        return null;
    }

    render() {
        const { status } = this.state;
        const assetsToRemove = this.getRemovableAssets();
        const zeroAssetsExists = assetsToRemove.length !== 0;
        let removeAssetsLink;

        if (status === 'ready') {
            removeAssetsLink = (
                <a onClick={e => this.clickRemoveAll(e)}>
                    <img src={images['icon-close']} alt="close" />
                    Remove zero balance assets
                </a>
            );
        } else if (status === 'error') {
            removeAssetsLink = (
                <a onClick={e => this.clickRemoveAll(e)}>
                    <img src={images['icon-close']} alt="close" />
                    Errored when removing zero balance assets
                </a>
            );
        } else if (status === 'pending') {
            removeAssetsLink = (
                <a>
                    Removing zero balance assets
                    <Ellipsis />
                </a>
            );
        }

        return zeroAssetsExists ? removeAssetsLink : null;
    }
}

RemoveAllTrusts.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
};
