import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import * as StellarSdk from 'stellar-sdk';
import Driver from '../../../lib/driver/Driver';
import Pagination from '../../Common/Pagination/Pagination';
import { getWithCancel } from '../../../lib/api/request';
import { TOP_MARKETS_API } from '../../../env-consts';
import { getUrlWithParams } from '../../../lib/api/endpoints';
import TopVolumeAssetList from './TopVolumeAssetList/TopVolumeAssetList';


const PAGE_SIZE = 30;

const getAssetString = asset => (asset.isNative() ? 'native' : `${asset.code}:${asset.issuer}`);

const TopVolumeAssets = ({ d, baseAsset, tableRef }) => {
    const [page, setPage] = useState(1);
    const [base, setBase] = useState(baseAsset);
    const [markets, setMarkets] = useState(null);
    const [count, setCount] = useState(0);
    const [loading, setLoading] = useState(true);


    const canceller = useRef(null);

    const requestFn = url => {
        const { request, cancel } = getWithCancel(url);

        canceller.current = cancel;

        return request;
    };


    useEffect(() => {
        setBase(baseAsset);
        setPage(1);
        setMarkets(null);
        setLoading(true);
    }, [baseAsset]);

    useEffect(() => {
        if (tableRef) {
            tableRef.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [page]);


    useEffect(() => {
        setLoading(true);
        if (canceller.current) {
            canceller.current();
        }
        const endpoint = `${TOP_MARKETS_API}${
            baseAsset ?
                `assets/${getAssetString(baseAsset)}/markets/` :
                'markets/'}`;


        requestFn(getUrlWithParams(endpoint, { page, page_size: PAGE_SIZE }))
            .then(res => {
                setMarkets(res.results);
                setCount(res.count);
                setLoading(false);
            }).catch(error => {
                if (error.name === 'AbortError') {
                    return;
                }
                setLoading(false);
            });
    }, [base, page]);

    if (!loading && !markets) {
        return (
            <div className="TopVolume">
                <div className="TopVolume_empty error">
                    Error loading data for {baseAsset ? baseAsset.code : 'this asset'}
                </div>
            </div>
        );
    }

    return (
        <div className="TopVolume">
            <div className="TopVolume_header">
                <div className="TopVolume_cell withoutSort">
                    <span>Base asset</span>
                </div>
                <div className="TopVolume_cell withoutSort">
                    <span>Counter asset</span>
                </div>
                <div className="TopVolume_cell withoutSort">
                    <span>Price</span>
                </div>
                <div className="TopVolume_cell withoutSort">
                    <span>Volume (24h)</span>
                </div>
                <div className="TopVolume_cell withoutSort right">
                    <span>Change (24h)</span>
                </div>
            </div>

            <TopVolumeAssetList
                d={d}
                markets={markets}
                loading={loading}
            />
            <Pagination
                pageSize={PAGE_SIZE}
                currentPage={page}
                totalCount={count}
                itemName="markets"
                onPageChange={setPage}
            />
        </div>
    );
};

TopVolumeAssets.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
    baseAsset: PropTypes.instanceOf(StellarSdk.Asset),
    tableRef: PropTypes.objectOf(PropTypes.any),
};

export default TopVolumeAssets;
