import _ from 'lodash';
import directory from 'stellarterm-directory';
import * as StellarSdk from 'stellar-sdk';
import MagicSpoon from '../MagicSpoon';
import Stellarify from '../Stellarify';
import Validate from '../Validate';
import Event from '../Event';
import * as EnvConsts from '../../env-consts';
import ErrorHandler from '../ErrorHandler';
import * as request from '../api/request';
import { getUrlWithParams } from '../api/endpoints';

export default class Send {
    constructor(driver) {
        this.event = new Event();
        this.d = driver;

        this.state = 'setup'; // 'setup' | 'review' | 'pending' | 'error' | 'success'

        this.accountId = '';
        this.targetAccount = null;
        this.destInput = '';
        this.federationAddress = '';

        this.amountToSend = '';
        this.choosenSlug = 'XLM-native';
        this.assetToSend = {};
        this.availableAssets = {};

        this.memoRequired = false;
        this.memoType = 'none'; // 'none' | 'MEMO_ID' |'MEMO_TEXT' | 'MEMO_HASH' | 'MEMO_RETURN'
        this.memoContent = '';

        this.allFieldsValid = false;

        this.getAsset = this.getAsset.bind(this);
        this.resetSendForm = this.resetSendForm.bind(this);
        this.updateMemoType = this.updateMemoType.bind(this);
        this.clickBackToSend = this.clickBackToSend.bind(this);
        this.getMaxAssetSpend = this.getMaxAssetSpend.bind(this);
        this.pickAssetToSend = this.pickAssetToSend.bind(this);
        this.updateMemoContent = this.updateMemoContent.bind(this);
        this.updateDestination = this.updateDestination.bind(this);
        this.updateAmountValue = this.updateAmountValue.bind(this);
        this.clickReviewPayment = this.clickReviewPayment.bind(this);
        this.submitSendTransaction = this.submitSendTransaction.bind(this);
        this.calculateAvailableAssets();
    }

    getAsset() {
        const { asset } = this.assetToSend;
        return new StellarSdk.Asset(asset.code, asset.issuer);
    }

    getMaxAssetSpend(assetBalance) {
        const { account } = this.d.session;
        const openOrdersSum = account.getReservedBalance(this.getAsset());
        return parseFloat(assetBalance) > parseFloat(openOrdersSum) ? (assetBalance - openOrdersSum).toFixed(7) : 0;
    }

    loadTargetAccountDetails() {
        if (!Validate.publicKey(this.accountId).ready) {
            return;
        }

        this.d.Server.loadAccount(this.accountId).then((account) => {
            if (account.id === this.accountId) {
                // Prevent race conditions using this check
                this.targetAccount = account;
                this.calculateAvailableAssets();
                this.event.trigger();
            }

            if (account.home_domain) {
                StellarSdk.StellarTomlResolver.resolve(account.home_domain).then((toml) => {
                    if (!toml.FEDERATION_SERVER) {
                        return;
                    }

                    request.get(`${getUrlWithParams(toml.FEDERATION_SERVER, { q: account.id, type: 'id' })}`, {})
                        .then((res) => {
                            this.federationAddress = res.stellar_address;
                            this.event.trigger();
                        });
                });
            }
        }).catch(() => { });
    }

    fetchSelfAssets() {
        _.each(this.d.session.account.balances, (balance) => {
            const asset = Stellarify.asset(balance);
            const slug = Stellarify.assetToSlug(asset);
            if (asset.isNative()) { return; }

            this.availableAssets[slug] = {
                asset,
                sendable: true,
            };
        });
    }

    calculateAvailableAssets() {
        if (!Validate.publicKey(this.accountId).ready) {
            this.availableAssets[Stellarify.assetToSlug(new StellarSdk.Asset.native())] = {
                asset: new StellarSdk.Asset.native(),
                sendable: true,
            };
            this.assetToSend = this.availableAssets['XLM-native'];
            return;
        }

        const senderTrusts = {};
        const receiverTrusts = {};
        const sendableAssets = {};
        const unSendableAssets = {};

        _.each(this.d.session.account.balances, (balance) => {
            const asset = Stellarify.asset(balance);
            const slug = Stellarify.assetToSlug(asset);
            if (asset.isNative()) {
                return;
            }
            if (asset.issuer === this.targetAccount.accountId()) {
                // Edgecase: Receiver is the issuer of the asset
                // Note: Accounts cant extend trust to themselves, so no further edgecases on this situation
                this.availableAssets[slug] = {
                    asset,
                    sendable: true,
                };
                receiverTrusts[slug] = true;
            } else {
                senderTrusts[slug] = true;
            }
        });

        _.each(this.targetAccount.balances, (balance) => {
            const asset = Stellarify.asset(balance);
            const slug = Stellarify.assetToSlug(asset);
            if (asset.isNative()) {
                return;
            }
            // We don't really care about the usecase of sending to issuer.
            receiverTrusts[slug] = true;
        });

        _.each(this.targetAccount.balances, (balance) => {
            const asset = Stellarify.asset(balance);
            const slug = Stellarify.assetToSlug(asset);
            if (Object.prototype.hasOwnProperty.call(senderTrusts, slug)) {
                sendableAssets[slug] = {
                    asset,
                    sendable: true,
                };
            } else if (asset.getIssuer() === this.d.session.account.accountId()) {
                // Edgecase: Sender is the issuer of the asset
                sendableAssets[slug] = {
                    asset,
                    sendable: true,
                };
            } else {
                // Asset can't be sent.
            }
        });

        // Show stuff the recipient doesn't trust
        _.each(this.d.session.account.balances, (balance) => {
            const asset = Stellarify.asset(balance);
            const slug = Stellarify.assetToSlug(asset);
            if (asset.isNative()) {
                return;
            }
            if (!Object.prototype.hasOwnProperty.call(sendableAssets, slug) &&
                !Object.prototype.hasOwnProperty.call(receiverTrusts, slug)) {
                unSendableAssets[slug] = {
                    asset,
                    sendable: false,
                    reason: 'receiverNoTrust',
                };
            }
        });
        _.each(sendableAssets, (availability, slug) => {
            this.availableAssets[slug] = availability;
        });
        _.each(unSendableAssets, (availability, slug) => {
            this.availableAssets[slug] = availability;
        });
    }

    updateDestination(value) {
        this.destInput = value;
        // Reset the defaults
        this.accountId = '';
        this.federationAddress = '';
        if (this.destInput === '' || (this.memoContentLocked && this.memoRequired)) {
            this.memoType = 'none';
            this.memoContent = '';
        }
        this.memoRequired = false;
        this.memoContentLocked = false;
        this.federationNotFound = false;

        if (Validate.publicKey(this.destInput).ready) {
            this.accountId = this.destInput;
            // Check for memo requirements in the destination
            if (Object.prototype.hasOwnProperty.call(directory.destinations, this.accountId)) {
                const destination = directory.destinations[this.accountId];
                if (destination.requiredMemoType) {
                    this.memoContent = '';
                    this.memoRequired = true;
                    this.memoType = destination.requiredMemoType;
                }
            }
            this.loadTargetAccountDetails();
        } else if (Validate.address(this.destInput).ready) {
            // Prevent race conditions
            const destInput = this.destInput;
            const targetDomain = destInput.split('*')[1];
            const federationDomain = targetDomain === 'stellarterm.com' ? EnvConsts.HOME_DOMAIN : targetDomain;
            StellarSdk.FederationServer.createForDomain(federationDomain)
                .then(federationServer => federationServer.resolveAddress(this.destInput))
                .then((federationRecord) => {
                    if (destInput !== this.destInput) {
                        return;
                    }
                    this.federationAddress = this.destInput;
                    if (!Validate.publicKey(federationRecord.account_id).ready) {
                        throw new Error('Invalid account_id from federation response');
                    }
                    this.accountId = federationRecord.account_id;
                    if (federationRecord.memo_type) {
                        switch (federationRecord.memo_type) {
                        case 'id':
                            this.memoType = 'MEMO_ID';
                            break;
                        case 'text':
                            this.memoType = 'MEMO_TEXT';
                            break;
                        case 'hash':
                            this.memoType = 'MEMO_HASH';
                            break;
                        case 'return':
                            this.memoType = 'MEMO_RETURN';
                            break;
                        default:
                            throw new Error('Invalid memo_type from federation response');
                        }
                        console.log(federationRecord);
                        this.memoRequired = true;
                    }
                    if (federationRecord.memo) {
                        this.memoContent = federationRecord.memo;
                        this.memoContentLocked = true;
                    }
                    this.event.trigger();
                    this.loadTargetAccountDetails();
                })
                .catch((error) => {
                    // stellar.toml does not exist or it does not contain information about federation server.
                    if (destInput !== this.destInput) {
                        return;
                    }
                    console.error(error);
                    this.federationNotFound = true;
                    this.allFieldsValid = this.validateAllFields();
                    this.event.trigger();
                });
        }
        this.allFieldsValid = this.validateAllFields();
        this.event.trigger();
    }

    updateAmountValue(value) {
        const regexp = new RegExp(/^(\d{0,15})([.]\d{1,7})?$/);

        const valueToSet = value;
        const isTheOnlyDot = valueToSet.split('.').length === 2;
        const isAmountValid = valueToSet.slice(-1) === '.' && valueToSet.slice(-2) !== '..' && isTheOnlyDot;

        if (isAmountValid || regexp.test(valueToSet)) {
            this.amountToSend = value;
            this.allFieldsValid = this.validateAllFields();
            this.event.trigger();
        }
    }

    updateMemoType(value) {
        this.memoType = value;
        if (this.memoType === 'none') {
            this.memoContent = '';
        }
        this.allFieldsValid = this.validateAllFields();
        this.event.trigger();
    }

    updateMemoContent(e) {
        this.memoContent = e.target.value;
        this.allFieldsValid = this.validateAllFields();
        this.event.trigger();
    }

    pickAssetToSend(slug) {
        window.history.pushState({}, null, `/account/send?asset=${slug}`);
        if (!Validate.publicKey(this.accountId).ready) {
            this.availableAssets[slug] = {
                asset: Stellarify.parseAssetSlug(slug),
                sendable: true,
            };
        }

        this.assetToSend = this.availableAssets[slug];
        this.choosenSlug = slug;
        this.allFieldsValid = this.validateAllFields();
        this.event.trigger();
    }

    clickReviewPayment() {
        this.state = 'review';
        this.event.trigger();
    }

    clickBackToSend() {
        this.state = 'setup';
        this.event.trigger();
    }

    async submitSendTransaction() {
        try {
            const sendMemo = this.memoType === 'none'
                ? undefined
                : {
                    type: this.memoType,
                    content: this.memoContent,
                };

            const tx = await MagicSpoon.buildTxSendPayment(this.d.Server, this.d.session.account, {
                destination: this.accountId,
                asset: this.assetToSend.asset,
                amount: this.amountToSend,
                memo: sendMemo,
            });
            const bssResult = await this.d.session.handlers.buildSignSubmit(tx);

            if (bssResult.status === 'finish') {
                this.state = 'pending';
                this.event.trigger();
                const result = await bssResult.serverResult;
                this.txId = result.hash;
                this.state = 'success';
            } else if (bssResult.status === 'await_signers') {
                this.state = 'success_signers';
                this.event.trigger();
            }
        } catch (err) {
            this.state = 'error';
            this.errorDetails = ErrorHandler(err, 'payment');
            this.event.trigger();
        }
    }

    validateAllFields() {
        const destinationIsEmpty = this.destInput === '';
        const notValidDestination =
            !Validate.publicKey(this.destInput).ready &&
            !Validate.address(this.destInput).ready;

        const notValidAmount = !Validate.amount(this.amountToSend);
        const notValidMemo = this.memoType !== 'none' && !Validate.memo(this.memoContent, this.memoType).ready;
        const destNoTrustline = !this.availableAssets[this.choosenSlug].sendable;

        const isXlmNative = this.getAsset(this.assetToSend).isNative();
        const targetBalance = this.d.session.account.getBalance(this.getAsset());
        const maxAssetSpend = isXlmNative
            ? this.d.session.account.maxLumenSpend()
            : this.getMaxAssetSpend(targetBalance);
        const notEnoughAsset = Number(this.amountToSend) > Number(maxAssetSpend);

        if (
            destinationIsEmpty ||
            notValidDestination ||
            this.federationNotFound ||
            notValidAmount ||
            notEnoughAsset ||
            notValidMemo ||
            destNoTrustline) {
            return false;
        }

        return true;
    }

    resetSendForm() {
        this.federationAddress = '';
        this.destInput = '';
        this.accountId = '';
        this.amountToSend = '';

        this.memoRequired = false;
        this.memoType = 'none';
        this.memoContent = '';

        this.state = 'setup';
        this.event.trigger();
    }
}
