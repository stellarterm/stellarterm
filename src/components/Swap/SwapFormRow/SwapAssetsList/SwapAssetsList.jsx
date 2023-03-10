import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import * as StellarSdk from 'stellar-sdk';
import Debounce from 'awesome-debounce-promise';
import Input from '../../../Common/Input/Input';
import images from '../../../../images';
import useOnClickOutside from '../../../../lib/hooks/useClickOutside';
import AssetCardSeparateLogo from '../../../Common/AssetCard/AssetCardSeparateLogo/AssetCardSeparateLogo';
import useOnKeyDown from '../../../../lib/hooks/useOnKeyDown';
import { CACHED_ASSETS_ALIAS, getAssetString } from '../../../../lib/driver/driverInstances/Session';
import { formatNumber } from '../../../../lib/helpers/Format';
import Driver from '../../../../lib/driver/Driver';
import Printify from '../../../../lib/helpers/Printify';


const DEBOUNCE_TIME = 700;
const resolveAnchor = Debounce(StellarSdk.StellarTomlResolver.resolve, DEBOUNCE_TIME);
// eslint-disable-next-line no-useless-escape,max-len
const pattern = /^(([a-zA-Z]{1})|([a-zA-Z]{1}[a-zA-Z]{1})|([a-zA-Z]{1}[0-9]{1})|([0-9]{1}[a-zA-Z]{1})|([a-zA-Z0-9][a-zA-Z0-9-_]{1,61}[a-zA-Z0-9]))\.([a-zA-Z]{2,6}|[a-zA-Z0-9-]{2,30}\.[a-zA-Z]{2,3})$/;
const regexp = new RegExp(pattern);

const SwapAssetsList = ({ d, closeList, setAsset, myAssets, knownAssets }) => {
    const [searchText, setSearchText] = useState('');
    const [filteredMyAssets, setFilteredMyAssets] = useState(myAssets);
    const [filteredKnownAsset, setFilteredKnownAssets] = useState(knownAssets);
    const [filteredSearchAssets, setFilteredSearchAssets] = useState([]);

    const [loading, setLoading] = useState(false);

    const [activeIndex, setActiveIndex] = useState(0);

    const ref = useRef(null);
    const inputRef = useRef(null);

    const chooseAsset = asset => {
        setAsset(asset);
        closeList();
    };

    useOnClickOutside(ref, () => closeList());

    useOnKeyDown({
        onEnter: () => {
            chooseAsset([...filteredMyAssets, ...filteredKnownAsset, ...filteredSearchAssets][activeIndex]);
        },
        onEscape: () => {
            closeList();
        },
        onArrowDown: () => {
            const totalLength = filteredMyAssets.length + filteredKnownAsset.length + filteredSearchAssets.length;

            setActiveIndex(prev => (prev + 1 >= totalLength ? 0 : prev + 1));
        },
        onArrowUp: () => {
            const totalLength = filteredMyAssets.length + filteredKnownAsset.length + filteredSearchAssets.length;

            setActiveIndex(prev => (prev - 1 < 0 ? totalLength - 1 : prev - 1));
        },
    }, [activeIndex, filteredMyAssets, filteredKnownAsset, filteredSearchAssets]);

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, []);

    useEffect(() => {
        const [element] = document.getElementsByClassName('SwapAssetsList_asset-row active');
        element.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }, [activeIndex]);

    const myAssetsSet = useMemo(() => {
        if (!myAssets) {
            return new Set();
        }
        const set = new Set();
        myAssets.forEach(({ code, issuer }) => {
            set.add(`${code}-${issuer}`);
        });
        return set;
    }, [myAssets]);

    const knownAssetsSet = useMemo(() => {
        if (!knownAssets) {
            return new Set();
        }
        const set = new Set();
        knownAssets.forEach(({ code, issuer }) => {
            set.add(`${code}-${issuer}`);
        });
        return set;
    }, [knownAssets]);

    const assetsData = new Map(JSON.parse(localStorage.getItem(CACHED_ASSETS_ALIAS) || '[]'));

    useEffect(() => {
        const filteredBySearch = myAssets
            .filter(asset => {
                if (asset.code.toLowerCase().includes(searchText.toLowerCase())) {
                    return true;
                }

                const assetData = assetsData.get(getAssetString(asset));
                const domain = assetData && assetData.home_domain;

                return domain && domain.toLowerCase().includes(searchText.toLowerCase());
            });

        setFilteredMyAssets(filteredBySearch);
    }, [searchText, myAssets]);

    useEffect(() => {
        const knownWithoutMy = myAssets ? knownAssets.filter(({ code, issuer }) => !myAssetsSet.has(`${code}-${issuer}`)) : knownAssets;

        const filteredBySearch = knownWithoutMy.filter(({ code, domain }) =>
            (code.toLowerCase().includes(searchText.toLowerCase()) ||
                domain.toLowerCase().includes(searchText.toLowerCase())
            ));

        setFilteredKnownAssets(filteredBySearch);
    }, [searchText, myAssets]);

    const searchAssetsByDomain = useCallback(async () => {
        setLoading(true);

        try {
            const resolved = await resolveAnchor(searchText);
            setLoading(false);

            if (!resolved.CURRENCIES) {
                return;
            }

            const filteredCurrencies = resolved.CURRENCIES.filter(({ code, issuer }) => {
                const assetString = `${code}-${issuer}`;
                return !myAssetsSet.has(assetString) && !knownAssetsSet.has(assetString);
            });

            setFilteredSearchAssets(filteredCurrencies);
        } catch (e) {
            setLoading(false);
        }
    }, [searchText]);

    useEffect(() => {
        setFilteredSearchAssets([]);
        if (regexp.test(searchText)) {
            searchAssetsByDomain();
        }
    }, [searchText]);

    return (
        <div className="SwapAssetsList" ref={ref}>
            <Input
                ref={inputRef}
                value={searchText}
                onChange={setSearchText}
                prefix={
                    <img src={images['icon-search']} alt="" className="SwapAssetsList_search" />
                }
                postfix={
                    loading ? <div className="nk-spinner-small-black"><div className="nk-spinner" /></div> :
                        <img src={images['icon-close']} alt="" onClick={closeList} className="SwapAssetsList_close" />
                }
                placeholder="Type asset name or home domain"
                bottomBoxy
            />
            <div className="SwapAssetsList_assets">
                {!filteredMyAssets.length && !filteredKnownAsset.length && !filteredSearchAssets.length && (
                    <div className="SwapAssetsList_asset-row">
                        Assets not found.
                    </div>
                )}
                {Boolean(filteredMyAssets.length) && (
                    <React.Fragment>
                        <div className="SwapAssetsList_section-title">
                            MY ASSETS
                        </div>
                        {filteredMyAssets.map((asset, index) => (
                            <div
                                className={`SwapAssetsList_asset-row ${activeIndex === index ? 'active' : ''}`}
                                key={asset.code + asset.issuer}
                                onClick={() => chooseAsset(asset)}
                                onMouseEnter={() => {
                                    setActiveIndex(index);
                                }}
                            >
                                <AssetCardSeparateLogo
                                    d={d}
                                    code={asset.code}
                                    issuer={asset.issuer}
                                    circle
                                    logoSize={17}
                                    noIssuer
                                    inRow
                                />
                                <div className="SwapAssetsList_asset-amount">
                                    {formatNumber(asset.balance)} {asset.code}
                                    {Boolean(asset.balanceUSD) &&
                                        <span className="SwapAssetsList_asset-usd">
                                            ~ ${Printify.lightenZeros(asset.balanceUSD.toString(), 2)}
                                        </span>
                                    }
                                </div>
                            </div>
                        ))}
                    </React.Fragment>
                )}
                {Boolean(filteredKnownAsset.length) && (
                    <React.Fragment>
                        <div className="SwapAssetsList_section-title">
                            KNOWN ASSETS
                        </div>
                        {filteredKnownAsset.map((asset, index) => (
                            <div
                                className={`SwapAssetsList_asset-row ${activeIndex === (index + filteredMyAssets.length) ? 'active' : ''}`}
                                key={asset.code + asset.issuer}
                                onClick={() => chooseAsset(asset)}
                                onMouseEnter={() => {
                                    setActiveIndex(index + filteredMyAssets.length);
                                }}
                            >
                                <AssetCardSeparateLogo
                                    d={d}
                                    code={asset.code}
                                    issuer={asset.issuer}
                                    circle
                                    logoSize={17}
                                    noIssuer
                                    inRow
                                />
                            </div>
                        ))}
                    </React.Fragment>
                )}
                {Boolean(filteredSearchAssets.length) && (
                    <React.Fragment>
                        <div className="SwapAssetsList_section-title">
                            OTHER
                        </div>
                        {filteredSearchAssets.map((asset, index) => (
                            <div
                                className={`SwapAssetsList_asset-row ${activeIndex === (index + filteredMyAssets.length + filteredKnownAsset.length) ? 'active' : ''}`}
                                key={asset.code + asset.issuer}
                                onClick={() => chooseAsset(asset)}
                                onMouseEnter={() => {
                                    setActiveIndex(index + filteredMyAssets.length + filteredKnownAsset.length);
                                }}
                            >
                                <AssetCardSeparateLogo
                                    d={d}
                                    code={asset.code}
                                    issuer={asset.issuer}
                                    circle
                                    logoSize={17}
                                    noIssuer
                                    inRow
                                />
                            </div>
                        ))}
                    </React.Fragment>
                )}
            </div>
        </div>
    );
};

export default SwapAssetsList;


SwapAssetsList.propTypes = {
    d: PropTypes.instanceOf(Driver),
    closeList: PropTypes.func,
    setAsset: PropTypes.func,
    myAssets: PropTypes.arrayOf(PropTypes.any),
    knownAssets: PropTypes.arrayOf(PropTypes.any),
};
