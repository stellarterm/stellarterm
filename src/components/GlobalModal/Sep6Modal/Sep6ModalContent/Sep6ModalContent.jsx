/* eslint-disable camelcase */
import React from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import images from '../../../../images';
import Driver from '../../../../lib/Driver';
import Sep6ModalFooter from '../Common/Sep6ModalFooter/Sep6ModalFooter';
import Sep6Form from './Sep6Form/Sep6Form';
import { getTransferServer, getTransferServerInfo, sep6Request } from '../../../../lib/Sep6Utils';
import { getUrlWithParams } from '../../../../lib/api/endpoints';
import ErrorHandler from '../../../../lib/ErrorHandler';

import FeeBlock from '../Common/FeeBlock';
import ExtraInfoBlock from '../Common/ExtraInfoBlock';
import EstimatedTime from '../Common/EstimatedTIme';
import MinMaxAmount from '../Common/MinMaxAmount';
import KycFrame from './KycFrame/KycFrame';

const kycStatusTypes = new Set(['denied', 'pending']);

export default class Sep6ModalContent extends React.Component {
    constructor(props) {
        super(props);

        this.assetInfo = {};
        this.jwtToken = this.props.jwtToken;
        this.TRANSFER_SERVER = null;
        this.WEB_AUTH_URL = null;

        this.state = {
            isLoading: true,
            assetDisabled: false,
            reqErrorMsg: null,
            isFormError: false,
            response: {},
            requestParams: {
                asset_code: this.props.asset.code,
                account: this.props.d.session.account.accountId(),
            },
        };
    }

    componentDidMount() {
        const { asset, isDeposit } = this.props;

        getTransferServer(asset.domain)
            .then(({ TRANSFER_SERVER, WEB_AUTH_URL }) => {
                this.TRANSFER_SERVER = TRANSFER_SERVER;
                this.WEB_AUTH_URL = WEB_AUTH_URL;
            })
            .then(() => getTransferServerInfo(this.TRANSFER_SERVER))
            .then(transferInfo => (isDeposit ? transferInfo.deposit : transferInfo.withdraw))
            .then((info) => {
                const transferAssetInfo = info[asset.code];
                this.assetInfo = transferAssetInfo;

                if (!transferAssetInfo.enabled) {
                    this.setState({
                        assetDisabled: true,
                        reqErrorMsg: `This anchor has temporarily disabled ${asset.code} ${
                            isDeposit ? 'deposits' : 'withdrawals'
                        }.`,
                    });
                } else if (transferAssetInfo.authentication_required) {
                    return this.checkForJwt(transferAssetInfo);
                }

                return this.getSep6Request(transferAssetInfo);
            })
            .then((res) => {
                this.setState({
                    isLoading: false,
                    response: res,
                    reqErrorMsg: res.error || res.errors || this.state.reqErrorMsg,
                });
            })
            .catch(() => {
                this.setState({
                    isLoading: false,
                    reqErrorMsg: `Failed to obtain ${isDeposit ? 'deposit' : 'withdraw'} details for this asset!`,
                });
            });
    }

    onUpdateFooterRes(res) {
        this.setState({ response: res });
    }

    onUpdateForm(params, isError) {
        this.setState({ requestParams: params, isFormError: isError, reqErrorMsg: null });
    }

    getSep6Request(transferAssetInfo) {
        const { isDeposit } = this.props;
        const { requestParams } = this.state;
        const noFieldsProvided = (!_.has(this.assetInfo, 'fields') || _.isEmpty(this.assetInfo.fields));

        return isDeposit && noFieldsProvided
            ? sep6Request(this.TRANSFER_SERVER, isDeposit, this.jwtToken, requestParams)
            : transferAssetInfo;
    }

    getMainInfo() {
        const { response } = this.state;
        const { d, asset, isDeposit } = this.props;

        const showMainInfo =
            !kycStatusTypes.has(response.status) &&
            response.type !== 'interactive_customer_info_needed' &&
            response.type !== 'customer_info_status';
        const depositFieldsProvided = _.has(this.assetInfo, 'fields') && !_.isEmpty(this.assetInfo.fields);

        return showMainInfo ? (
            <React.Fragment>
                {isDeposit && !depositFieldsProvided ? (
                    <React.Fragment>
                        <div className="content_block">
                            <div className="content_title">Deposit address or instructions</div>
                            <div className="content_text">{response.how || 'No instructions'}</div>
                        </div>

                        <FeeBlock
                            feeFixed={parseFloat(response.fee_fixed) || 0}
                            feePercent={parseFloat(response.fee_percent) || 0}
                            assetCode={asset.code} />

                        <EstimatedTime time={response.eta || ''} isDeposit={isDeposit} />

                        <MinMaxAmount
                            minLimit={response.min_amount || ''}
                            maxLimit={response.max_amount || ''}
                            assetCode={asset.code}
                            isDeposit />

                        <ExtraInfoBlock
                            extra={
                                _.has(response, 'extra_info') && response.extra_info !== null ? response.extra_info : ''
                            } />
                    </React.Fragment>
                ) : (
                    <Sep6Form
                        d={d}
                        asset={asset}
                        isDeposit={isDeposit}
                        assetInfo={this.assetInfo}
                        min={parseFloat(this.assetInfo.min_amount) || ''}
                        max={parseFloat(this.assetInfo.max_amount) || ''}
                        feeFixed={parseFloat(this.assetInfo.fee_fixed) || 0}
                        feePercent={parseFloat(this.assetInfo.fee_percent) || 0}
                        onUpdateForm={(params, isError) => this.onUpdateForm(params, isError)} />
                )}
            </React.Fragment>
        ) : null;
    }

    getContentFooter() {
        const { reqErrorMsg, isFormError, isLoading } = this.state;
        const { d, asset, isDeposit } = this.props;
        const isAnyError = reqErrorMsg !== null;

        return (
            <Sep6ModalFooter
                d={d}
                asset={asset}
                needConfirm={false}
                isDeposit={isDeposit}
                isLoading={isLoading}
                emptyDeposit={_.isEmpty(this.assetInfo.fields)}
                isAnyError={isFormError || isAnyError}
                requestParams={this.state.requestParams}
                withdrawRequest={() => this.withdrawRequest()}
                onUpdateFooterRes={res => this.onUpdateFooterRes(res)} />
        );
    }

    checkForJwt(transferAssetInfo) {
        const { d, asset, isDeposit } = this.props;
        const { requestParams } = this.state;

        const params = { account: requestParams.account };
        const jwtEndpointUrl = getUrlWithParams(this.WEB_AUTH_URL, params);
        const isLedgerJwtNeeded = d.session.authType === 'ledger' && this.jwtToken === null;

        if (isLedgerJwtNeeded) {
            d.modal.handlers.finish();

            return d.session.handlers.getJwtToken(jwtEndpointUrl).then((token) => {
                d.modal.nextModalName = 'Sep6Modal';
                d.modal.nextModalData = {
                    isDeposit,
                    asset,
                    jwtToken: token,
                };
                return null;
            });
        }

        if (this.jwtToken === null) {
            return d.session.handlers.getJwtToken(jwtEndpointUrl).then((token) => {
                this.jwtToken = token;
                return this.getSep6Request(transferAssetInfo);
            });
        }

        return this.getSep6Request(transferAssetInfo);
    }

    withdrawRequest() {
        const { requestParams } = this.state;
        const { isDeposit } = this.props;

        return sep6Request(this.TRANSFER_SERVER, isDeposit, this.jwtToken, requestParams)
            .then((res) => {
                this.setState({
                    isLoading: false,
                    response: res,
                    reqErrorMsg: res.error || res.errors || this.state.reqErrorMsg,
                });

                return res;
            })
            .catch((e) => {
                this.setState({ isLoading: false, reqErrorMsg: ErrorHandler(e) });
            });
    }

    render() {
        const { reqErrorMsg, isLoading, response, assetDisabled } = this.state;
        const isAnyError = reqErrorMsg !== null;

        if ((_.isEmpty(response) || assetDisabled) && !isLoading) {
            return (
                <React.Fragment>
                    <div className="content_error">
                        <div className="sep6_requestError">
                            <img src={images['icon-circle-fail']} alt="fail" />
                            <span>{reqErrorMsg}</span>
                        </div>
                    </div>
                    {this.getContentFooter()}
                </React.Fragment>
            );
        }

        return (
            <React.Fragment>
                {isAnyError ? (
                    <div className="content_error">
                        <div className="sep6_requestError">
                            <img src={images['icon-circle-fail']} alt="fail" />
                            <span>{reqErrorMsg}</span>
                        </div>
                    </div>
                ) : null}

                <div className="content_main">
                    {isLoading ? (
                        <div className="loader_container">
                            <div className="nk-spinner" />
                        </div>
                    ) : (
                        <React.Fragment>
                            <KycFrame
                                time={response.eta || ''}
                                kycUrl={response.url || ''}
                                status={response.status || ''}
                                sizes={response.dimensions || ''}
                                moreInfo={response.more_info_url || ''} />

                            {this.getMainInfo()}
                        </React.Fragment>
                    )}
                </div>

                {this.getContentFooter()}
            </React.Fragment>
        );
    }
}

Sep6ModalContent.propTypes = {
    jwtToken: PropTypes.string,
    isDeposit: PropTypes.bool.isRequired,
    d: PropTypes.instanceOf(Driver).isRequired,
    asset: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.string, PropTypes.bool])).isRequired,
};
