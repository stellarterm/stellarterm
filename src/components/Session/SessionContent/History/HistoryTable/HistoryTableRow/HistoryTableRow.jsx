import React from 'react';
import PropTypes from 'prop-types';
import AssetCard2 from '../../../../../Common/AssetCard2/AssetCard2';
import HistoryRowExternal from './HistoryRowExternal/HistoryRowExternal';
import { getHistoryRowsData, checkDataType } from './HistoryRowsData';

export default class HistoryTableRow extends React.Component {
    static getDomainForUnknownAsset(code, issuer) {
        const unknownAssetsData = JSON.parse(localStorage.getItem('unknownAssetsData')) || [];
        const assetData = unknownAssetsData.find(assetLocalItem => (
            assetLocalItem.code === code && assetLocalItem.issuer === issuer
        ));

        if (!assetData) {
            return 'unknown';
        }

        return (assetData.currency && assetData.currency.host) || assetData.host;
    }

    static getHistoryRowAssetCard(code, issuer, domain) {
        const isUnknown = domain === 'unknown';
        const viewDomain = isUnknown ? this.getDomainForUnknownAsset(code, issuer) : domain;
        return (
            <span className="HistoryView__asset">
                {code}-{viewDomain}
                <div className="HistoryView__asset__card">
                    <AssetCard2 code={code} issuer={issuer} />
                </div>
            </span>
        );
    }

    render() {
        const { data, type } = this.props;
        const { category } = data;
        const dataType = checkDataType(type, category);
        const historyRows = dataType ? getHistoryRowsData(dataType, data) : [];

        const history = historyRows.attributes.map((row) => {
            const {
                header,
                value,
                isAsset,
                asset_code: code = 'XLM',
                asset_issuer: issuer = null,
                domain,
            } = row;

            const assetCard = isAsset ? HistoryTableRow.getHistoryRowAssetCard(code, issuer, domain) : null;
            return (
                <div key={`${header}${value}`} className="HistoryView__card__line">
                    <span className="HistoryView__card__container__header">{header} </span> {value}
                    {assetCard}
                </div>
            );
        });

        return (
            <div className="HistoryView__card">
                <div className="HistoryView__card__container">
                    <h3 className="HistoryView__card__container__title">{historyRows.title}</h3>

                    {history}
                    <HistoryRowExternal hash={data.transaction_hash} />
                </div>
            </div>
        );
    }
}

HistoryTableRow.propTypes = {
    data: PropTypes.instanceOf(Object).isRequired,
    type: PropTypes.string.isRequired,
};
