import React from 'react';
import PropTypes from 'prop-types';
import BigNumber from 'bignumber.js';
import { Link } from 'react-router-dom';
import AssetCardSeparateLogo from '../../../Common/AssetCard/AssetCardSeparateLogo/AssetCardSeparateLogo';
import Printify from '../../../../lib/helpers/Printify';
import { niceNumDecimals } from '../../../../lib/helpers/Format';
import Driver from '../../../../lib/driver/Driver';
import PercentChange from '../../../Basics/PercentChange/PercentChange';


const TopVolumeAssetList = ({ d, markets, loading }) => {
    if (loading && !markets) {
        return (
            <div className="TopVolume_loader">
                <div className="nk-spinner" />
            </div>
        );
    }

    if (markets && !markets.length) {
        return (
            <div className="TopVolume_empty">
                No markets to display for the selected asset
            </div>
        );
    }

    const { USD_XLM: priceUsdXlm } = d.ticker.data._meta.externalPrices;

    return (
        <div className="TopVolumeAssetList">
            {loading &&
                <div className="TopVolumeAssetList_page-loader">
                    <div className="TopVolume_loader">
                        <div className="nk-spinner" />
                    </div>
                </div>
            }
            {markets.map(({
                close_price: closePrice,
                change_price_percent: changePricePercent,
                base_asset_code: baseCode,
                base_asset_issuer: baseIssuer,
                counter_asset_code: counterCode,
                counter_asset_issuer: counterIssuer,
                counter_native_price: counterPrice,
                base_volume: baseVolume,
                base_native_volume: baseNativeVolume,
            }) => {
                const changes = Number(changePricePercent).toFixed(2);

                const priceUSD = new BigNumber(counterPrice).multipliedBy(priceUsdXlm).toNumber();

                const volumeUSD = new BigNumber(baseNativeVolume).multipliedBy(priceUsdXlm).toNumber();

                return (
                    <Link
                        key={baseCode + baseIssuer + counterCode + counterIssuer}
                        to={`/exchange/${counterCode}-${counterIssuer || 'native'}/${baseCode}-${baseIssuer || 'native'}`}
                        className="TopVolume_row"
                    >

                        <div className="TopVolume_cell">
                            <AssetCardSeparateLogo
                                noIssuer
                                logoSize={30}
                                d={d}
                                code={counterCode}
                                issuer={counterIssuer}
                            />
                        </div>
                        <div className="TopVolume_cell">
                            <AssetCardSeparateLogo
                                noIssuer
                                logoSize={30}
                                d={d}
                                code={baseCode}
                                issuer={baseIssuer}
                            />
                        </div>
                        <div className="TopVolume_cell">
                            <div className="TopVolume_cell-column">
                                <span className="TopVolume_cell-value">
                                    {Printify.lightenZeros(
                                        (closePrice).toString(),
                                        niceNumDecimals(closePrice),
                                        ` ${baseCode}`,
                                    )}
                                </span>
                                <span className="TopVolume_cell-value-usd">
                                    {Boolean(priceUSD) && '$'}
                                    {priceUSD ?
                                        Printify.lightenZeros((priceUSD).toString(),
                                            niceNumDecimals(priceUSD)) : '-'}
                                </span>
                            </div>
                        </div>
                        <div className="TopVolume_cell">
                            <div className="TopVolume_cell-column">
                                <span className="TopVolume_cell-value">
                                    {Printify.lightenZeros(
                                        (baseVolume).toString(),
                                        niceNumDecimals(baseVolume),
                                        ` ${baseCode}`,
                                    )}
                                </span>
                                <span className="TopVolume_cell-value-usd">
                                    {volumeUSD ?
                                        `$${(volumeUSD).toLocaleString('en-US', {
                                            minimumFractionDigits: 0,
                                            maximumFractionDigits: 0,
                                        })}` : '-'}
                                </span>
                            </div>
                        </div>
                        <div className="TopVolume_cell right">
                            <PercentChange changePercent={changes} />
                        </div>
                    </Link>);
            })}
        </div>
    );
};

TopVolumeAssetList.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
    markets: PropTypes.arrayOf(PropTypes.any),
    loading: PropTypes.bool.isRequired,
};

export default TopVolumeAssetList;
