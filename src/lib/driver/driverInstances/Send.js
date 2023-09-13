import _ from 'lodash';
import * as StellarSdk from 'stellar-sdk';
import directory from 'stellarterm-directory';
import Stellarify from '../../helpers/Stellarify';
import Validate from '../../helpers/Validate';
import Event from '../../helpers/Event';
import * as EnvConsts from '../../../env-consts';
import ErrorHandler from '../../helpers/ErrorHandler';
import * as request from '../../api/request';
import { getUrlWithParams } from '../../api/endpoints';
import { TX_STATUS } from '../../constants/sessionConstants';

export default class Send {
    constructor(driver) {
        this.event = new Event();
        this.d = driver;

        this.state = 'setup'; // 'setup' | 'review' | 'pending' | 'error' | 'success'

        this.accountId = '';
        this.targetAccount = null;
        this.destInput = '';
        this.destinationName = '';
        this.requestIsPending = false;
        this.federationAddress = '';

        this.amountToSend = '';
        this.choosenSlug = 'XLM-native';
        this.assetToSend = {};
        this.availableAssets = {};

        this.sep29MemoRequired = false;
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
        if (!Validate.publicKey(this.accountId).ready && !Validate.muxedKey(this.accountId).ready) {
            return;
        }

        // This is made for case, when config sep29 request is pending, its block sending without memo
        this.requestIsPending = true;
        this.allFieldsValid = this.validateAllFields();
        this.event.trigger();

        this.d.Server.loadAccount(this.accountId).then(account => {
            if (account.id === this.accountId) {
                // Prevent race conditions using this check
                this.targetAccount = account;
                this.calculateAvailableAssets();
                this.event.trigger();
            }

            if (account.home_domain && this.federationAddress === '') {
                StellarSdk.StellarTomlResolver.resolve(account.home_domain).then(toml => {
                    if (!toml.FEDERATION_SERVER) {
                        return account;
                    }

                    request.get(`${getUrlWithParams(toml.FEDERATION_SERVER, { q: account.id, type: 'id' })}`, {})
                        .then(res => {
                            this.federationAddress = res.stellar_address;
                            this.event.trigger();
                        });
                });
            }

            return account;
        }).then(account => {
            const memoFlag = account.data_attr['config.memo_required'];
            // Sep0029 check for required memo
            if (memoFlag && new Buffer(memoFlag, 'base64').toString() === '1') {
                this.sep29MemoRequired = true;
            }

            this.requestIsPending = false;
            this.allFieldsValid = this.validateAllFields();
            this.event.trigger();
        }).catch(() => {
            this.requestIsPending = false;
            this.sep29MemoRequired = false;
            this.allFieldsValid = this.validateAllFields();
            this.event.trigger();
        });
    }

    fetchSelfAssets() {
        const isEnteredValidAddress = Validate.publicKey(this.destInput).ready ||
            Validate.address(this.destInput).ready || Validate.muxedKey(this.destInput).ready;

        if (isEnteredValidAddress) {
            this.loadTargetAccountDetails();
            return;
        }

        this.d.session.account.balances.forEach(({ asset_code: assetCode, asset_issuer: assetIssuer }) => {
            if (!assetIssuer) {
                return;
            }

            const asset = new StellarSdk.Asset(assetCode, assetIssuer);
            const slug = Stellarify.assetToSlug(asset);

            this.availableAssets[slug] = {
                asset,
                sendable: true,
            };
        });
    }

    calculateAvailableAssets() {
        if (!Validate.publicKey(this.accountId).ready && !Validate.muxedKey(this.accountId).ready) {
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

        this.d.session.account.balances.forEach(({ asset_code: assetCode, asset_issuer: assetIssuer }) => {
            if (!assetIssuer) {
                return;
            }
            const asset = new StellarSdk.Asset(assetCode, assetIssuer);
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

        this.targetAccount.balances.forEach(({ asset_code: assetCode, asset_issuer: assetIssuer }) => {
            if (!assetIssuer) {
                return;
            }
            const asset = new StellarSdk.Asset(assetCode, assetIssuer);
            const slug = Stellarify.assetToSlug(asset);
            if (asset.isNative()) {
                return;
            }
            // We don't really care about the usecase of sending to issuer.
            receiverTrusts[slug] = true;
        });

        this.targetAccount.balances.forEach(({ asset_code: assetCode, asset_issuer: assetIssuer }) => {
            if (!assetIssuer) {
                return;
            }
            const asset = new StellarSdk.Asset(assetCode, assetIssuer);
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
        this.d.session.account.balances.forEach(balance => {
            if (!balance.asset_issuer) {
                return;
            }
            const asset = Stellarify.asset(balance);
            const slug = Stellarify.assetToSlug(asset);

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
        this.destinationName = '';
        this.federationAddress = '';

        if ((this.memoContent === '' && this.destInput === '') || (this.memoContentLocked && this.memoRequired)) {
            this.memoType = 'none';
            this.memoContent = '';
        }
        this.memoRequired = false;
        this.sep29MemoRequired = false;
        this.memoContentLocked = false;
        this.federationNotFound = false;
        this.requestIsPending = false;

        if (Validate.publicKey(this.destInput).ready || Validate.muxedKey(this.destInput).ready) {
            this.accountId = Validate.publicKey(this.destInput).ready
                ? this.destInput
                : StellarSdk.MuxedAccount.fromAddress(this.destInput, '0').baseAccount().accountId();
            // Check for memo requirements in the destination
            if (Object.prototype.hasOwnProperty.call(directory.destinations, this.accountId)) {
                const destination = directory.destinations[this.accountId];
                this.destinationName = `[${destination.name}]`;

                if (destination.requiredMemoType) {
                    this.memoContent = '';
                    this.memoRequired = !this.destInput.startsWith('M');
                    this.memoType = this.destInput.startsWith('M') ? 'none' : destination.requiredMemoType;
                }
            }
            this.loadTargetAccountDetails();
        } else if (Validate.address(this.destInput).ready) {
            // Prevent race conditions
            const destInput = this.destInput;
            const targetDomain = destInput.split('*')[1];
            const federationDomain = targetDomain === 'zingypay.com' ? EnvConsts.HOME_DOMAIN : targetDomain;
            this.requestIsPending = true;

            StellarSdk.FederationServer.createForDomain(federationDomain)
                .then(federationServer => federationServer.resolveAddress(this.destInput))
                .then(federationRecord => {
                    if (destInput !== this.destInput) {
                        return;
                    }
                    this.federationAddress = federationRecord.stellar_address;
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
                        this.memoRequired = true;
                    }
                    if (federationRecord.memo) {
                        this.memoContent = federationRecord.memo;
                        this.memoContentLocked = true;
                    }

                    this.requestIsPending = false;
                    this.allFieldsValid = this.validateAllFields();
                    this.loadTargetAccountDetails();
                    this.event.trigger();
                })
                .catch(error => {
                    // stellar.toml does not exist or it does not contain information about federation server.
                    if (destInput !== this.destInput) {
                        return;
                    }
                    console.error(error);
                    this.federationNotFound = true;
                    this.requestIsPending = false;
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

    updateMemoContent({ target }) {
        const { value } = target;
        if (value.length && this.memoType === 'none') {
            this.memoType = 'MEMO_TEXT';
        }
        if (!value.length) {
            this.memoType = 'none';
        }
        this.memoContent = value;
        this.allFieldsValid = this.validateAllFields();
        this.event.trigger();
    }

    pickAssetToSend(slug) {
        if (!Validate.publicKey(this.accountId).ready && !Validate.muxedKey(this.accountId).ready) {
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
            const isMuxed = Validate.muxedKey(this.destInput).ready;

            const bssResult = await this.d.session.handlers.send(
                {
                    destination: isMuxed ? this.destInput : this.accountId,
                    asset: this.assetToSend.asset,
                    amount: this.amountToSend,
                    withMuxing: isMuxed,
                },
                sendMemo,
            );

            if (bssResult.status === TX_STATUS.FINISH) {
                this.state = 'pending';
                this.event.trigger();
                const result = await bssResult.serverResult;
                this.txId = result.hash;
                this.state = 'success';
            } else if (bssResult.status === TX_STATUS.AWAIT_SIGNERS) {
                this.state = 'success_signers';
                this.event.trigger();
            } else if (bssResult.status === TX_STATUS.SENT_TO_WALLET_CONNECT) {
                this.resetSendForm();
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
            !Validate.muxedKey(this.destInput).ready &&
            !Validate.address(this.destInput).ready;


        const notValidAmount = !Validate.amount(this.amountToSend);
        const notValidMemoType = this.memoType === 'none' && (this.memoRequired || this.sep29MemoRequired);
        const notValidMemoContent = this.memoType !== 'none' && !Validate.memo(this.memoContent, this.memoType).ready;
        const destNoTrustline = !this.availableAssets[this.choosenSlug].sendable;

        const isXlmNative = this.getAsset(this.assetToSend).isNative();
        const targetBalance = this.d.session.account.getBalance(this.getAsset());
        const maxAssetSpend = isXlmNative
            ? this.d.session.account.maxLumenSpend()
            : this.getMaxAssetSpend(targetBalance);
        const notEnoughAsset = Number(this.amountToSend) > Number(maxAssetSpend);

        return !(destinationIsEmpty ||
            notValidDestination ||
            this.requestIsPending ||
            this.federationNotFound ||
            notValidAmount ||
            notEnoughAsset ||
            notValidMemoType ||
            notValidMemoContent ||
            destNoTrustline);
    }

    resetSendForm() {
        this.federationAddress = '';
        this.destInput = '';
        this.accountId = '';
        this.amountToSend = '';
        this.destinationName = '';

        this.memoRequired = false;
        this.sep29MemoRequired = false;
        this.memoType = 'none';
        this.memoContent = '';

        this.state = 'setup';
        this.event.trigger();
    }
}
