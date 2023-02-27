import React, { useCallback, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import * as StellarSdk from 'stellar-sdk';
import Driver from '../../../lib/driver/Driver';
import Pagination from '../../Common/Pagination/Pagination';
import { getWithCancel } from '../../../lib/api/request';
import { TOP_MARKETS_API } from '../../../env-consts';
import { getUrlWithParams } from '../../../lib/api/endpoints';
import TopVolumeAssetList from './TopVolumeAssetList/TopVolumeAssetList';
import SortIcon from './SortIcon/SortIcon';


const PAGE_SIZE = 30;

const SortFields = {
    base: 'base',
    counter: 'counter',
    price: 'price',
    volume: 'volume',
    change: 'change',
};

const SortDirections = {
    up: 'up',
    down: 'down',
};

const SortFieldAliases = {
    [SortFields.counter]: 'base_asset_code',
    [SortFields.base]: 'counter_asset_code',
    [SortFields.price]: 'counter_native_price',
    [SortFields.volume]: 'base_native_volume',
    [SortFields.change]: 'change_price_percent',
};

const getAssetString = asset => (asset.isNative() ? 'native' : `${asset.code}:${asset.issuer}`);

const TopVolumeAssets = ({ d, baseAsset, tableRef }) => {
    const [page, setPage] = useState(1);
    const [base, setBase] = useState(baseAsset);
    const [markets, setMarkets] = useState(null);
    const [count, setCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [sort, setSort] = useState(SortFields.volume);
    const [sortDirection, setSortDirection] = useState(SortDirections.down);


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


        const ordering = `${sortDirection === SortDirections.up ? '' : '-'}${SortFieldAliases[sort]}`;

        requestFn(getUrlWithParams(endpoint, { page, page_size: PAGE_SIZE, ordering }))
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
    }, [base, page, sort, sortDirection]);


    const changeSort = useCallback(sortField => {
        setPage(1);
        if (sortField === sort) {
            setSortDirection(sortDirection === SortDirections.down ? SortDirections.up : SortDirections.down);
            return;
        }

        setSort(sortField);
        setSortDirection(SortDirections.up);
    }, [sort, sortDirection]);

    const getHeaderCell = useCallback((title, sortField) => (
        <div className="TopVolume_cell" onClick={() => changeSort(sortField)}>
            <span>{title}</span>
            <SortIcon
                sortAlias={sortField}
                currentSort={sort}
                direction={sortDirection}
            />
        </div>
    ), [sort, sortDirection, changeSort]);

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
                {getHeaderCell('Base asset', SortFields.base)}
                {getHeaderCell('Counter asset', SortFields.counter)}
                {getHeaderCell('Price', SortFields.price)}
                {getHeaderCell('Volume (24h)', SortFields.volume)}
                {getHeaderCell('Change (24h)', SortFields.change)}
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
