import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import * as StellarSdk from '@stellar/stellar-sdk';
import BigNumber from 'bignumber.js';
import processBalances from '../Session/SessionContent/SessionAccount/AccountView/BalancesTable/processBalances';
import NotFound from '../NotFound/NotFound';
import images from '../../images';
import InfoBlock from '../Common/InfoBlock/InfoBlock';
import useDebounce from '../../lib/hooks/useDebounce';
import Stellarify from '../../lib/helpers/Stellarify';
import Driver from '../../lib/driver/Driver';
import { AUTH_TYPE, SESSION_EVENTS, SESSION_STATE } from '../../lib/constants/sessionConstants';
import { formatNumber, roundAndFormat } from '../../lib/helpers/Format';
import {
    getSlippageValue,
    getSmartSwapVersionValue,
} from '../GlobalModal/SwapModals/SwapSettings/SwapSettings';
import { USDC, XLM } from '../../lib/constants/assets';
import SwapFormRow from './SwapFormRow/SwapFormRow';
import { MEDIATOR_FEE_RESERVE, SMART_SWAP_VERSION } from '../../lib/driver/driverInstances/Swap';


const SWAP_EQUAL_ASSETS_ERROR = 'Swap of equal assets is unavailable.';
const SWAP_NO_PATH_ERROR = 'There are no exchange paths for the selected pairs.';


const Swap = ({ d }) => {
    const [knownAssets, setKnownAssets] = useState([]);
    const [myAssets, setMyAssets] = useState([]);
    const [isWrongURL, setIsWrongURL] = useState(false);

    const [source, setSource] = useState(null);
    const [sourcePriceUSD, setSourcePriceUSD] = useState(null);
    const [destination, setDestination] = useState(null);
    const [destinationPriceUSD, setDestinationPriceUSD] = useState(null);
    const [sourceAmount, setSourceAmount] = useState('');
    const [path, setPath] = useState(null);
    const [destinationAmount, setDestinationAmount] = useState('');
    const [isSend, setIsSend] = useState(true);
    const [pending, setPending] = useState(false);
    const [smartSwapVersion, setSmartSwapVersion] = useState(getSmartSwapVersionValue());

    const [isInsufficientSourceBalance, setIsInsufficientSourceBalance] = useState(false);
    const [isInvalidSourceAmount, setIsInvalidSourceAmount] = useState(false);
    const [isInvalidDestinationAmount, setIsInvalidDestinationAmount] = useState(false);

    const [isPriceReverted, setIsPriceReverted] = useState(false);

    const [errorText, setErrorText] = useState('');
    const [isEqualAssets, setIsEqualAssets] = useState(false);

    const [isHidden, setIsHidden] = useState(document.hidden);

    const history = useHistory();
    const location = useLocation();

    const onVisibilityChange = () => {
        setIsHidden(document.hidden);
    };

    useEffect(() => {
        document.addEventListener('visibilitychange', onVisibilityChange);

        return () => document.removeEventListener('visibilitychange', onVisibilityChange);
    }, []);

    useEffect(() => () => d.swap.unlistenToBestPath(), []);

    const updateBalances = () => {
        processBalances(d).then(res => {
            setMyAssets(res);
        });
    };

    useEffect(() => {
        const { pathname } = location;

        const [, , sourcePath, destinationPath] = pathname.split('/');

        if (!sourcePath || !destinationPath) {
            // default state
            history.replace(`/swap/${Stellarify.assetToSlug(XLM)}/${Stellarify.assetToSlug(USDC)}`);
            return;
        }

        try {
            const sourceAsset = Stellarify.parseAssetSlug(sourcePath);
            const destinationAsset = destinationPath ? Stellarify.parseAssetSlug(destinationPath) : null;

            setSource(sourceAsset);
            setDestination(destinationAsset);
            setIsWrongURL(false);
        } catch (e) {
            setIsWrongURL(true);
        }
    }, [location]);

    const debouncedSourceAmount = useDebounce(sourceAmount, 700);
    const debouncedDestinationAmount = useDebounce(destinationAmount, 700);

    useEffect(() => {
        if (d.session.state === SESSION_STATE.IN) {
            updateBalances();
        }
    }, []);

    useEffect(() => {
        const unsub = d.session.event.sub(eventName => {
            if (d.session.state === SESSION_STATE.IN && eventName === SESSION_EVENTS.ACCOUNT_EVENT) {
                updateBalances();
            }
        });

        return () => unsub();
    });

    useEffect(() => {
        if (!source || !destination) {
            return;
        }

        d.swap.getUsdPrices(source, destination).then(([priceSource, priceDest]) => {
            setSourcePriceUSD(priceSource);
            setDestinationPriceUSD(priceDest);
        });
    }, [source, destination]);

    useEffect(() => {
        const { assets } = d.ticker.data;

        setKnownAssets(assets);
    }, [knownAssets]);

    const setSourceAsset = asset => {
        const slug = Stellarify.assetToSlug(new StellarSdk.Asset(asset.code, asset.issuer));

        const { pathname } = location;
        const [, , , destinationPath] = pathname.split('/');

        history.push(destinationPath ? `/swap/${slug}/${destinationPath}` : `/swap/${slug}/`);
    };

    const setDestinationAsset = asset => {
        const slug = Stellarify.assetToSlug(new StellarSdk.Asset(asset.code, asset.issuer));

        const { pathname } = location;
        const [, , sourcePath] = pathname.split('/');

        history.push(`/swap/${sourcePath}/${slug}`);
    };

    const handleSetSourceAmount = amount => {
        setIsSend(true);
        setDestinationAmount('');
        setPath(null);
        setSourceAmount(amount);
    };

    const handleSetDestinationAmount = amount => {
        setIsSend(false);
        setSourceAmount('');
        setPath(null);
        setDestinationAmount(amount);
    };

    useEffect(() => {
        if (!destination || isSend) {
            setDestinationAmount('');
        }
        if (!isSend) {
            setSourceAmount('');
        }
        setPath(null);
    }, [source, destination]);

    const revertAssets = () => {
        const { pathname } = location;
        const [, , sourcePath, destinationPath] = pathname.split('/');

        if (!sourcePath || !destinationPath) {
            return;
        }
        setSourceAmount('');
        setDestinationAmount('');
        setPath(null);
        history.push(`/swap/${destinationPath}/${sourcePath}`);
    };

    useEffect(() => {
        if (source && destination && source.equals(destination)) {
            setErrorText(SWAP_EQUAL_ASSETS_ERROR);
            setIsEqualAssets(true);
            return;
        }

        setIsEqualAssets(false);
        setErrorText('');
    }, [source, sourceAmount, destination, destinationAmount]);

    const price = useMemo(() => {
        if (!sourceAmount || !destinationAmount || !destination) {
            return null;
        }

        const priceValue = isPriceReverted ?
            new BigNumber(sourceAmount).div(new BigNumber(destinationAmount)).toFixed(7) :
            new BigNumber(destinationAmount).div(new BigNumber(sourceAmount)).toFixed(7);

        return isPriceReverted ?
            `1 ${destination.code} = ${formatNumber(priceValue)} ${source.code}` :
            `1 ${source.code} = ${formatNumber(priceValue)} ${destination.code}`;
    }, [sourceAmount, destinationAmount, isPriceReverted, source, destination]);

    const sourceAmountUSD = useMemo(() => {
        if (!debouncedSourceAmount || !sourcePriceUSD || !sourceAmount || !Number(sourceAmount)) {
            return null;
        }
        return new BigNumber(debouncedSourceAmount)
            .times(new BigNumber(sourcePriceUSD.toString()))
            .toNumber();
    }, [debouncedSourceAmount, sourcePriceUSD]);

    const destinationAmountUSD = useMemo(() => {
        if (
            !destination ||
            !debouncedDestinationAmount ||
            !destinationPriceUSD ||
            !destinationAmount ||
            !Number(destinationAmount)
        ) {
            return null;
        }
        return new BigNumber(debouncedDestinationAmount)
            .times(new BigNumber(destinationPriceUSD.toString()))
            .toNumber();
    }, [debouncedDestinationAmount, destinationPriceUSD, destination]);


    const priceImpact = useMemo(() => {
        if (!sourceAmountUSD || !destinationAmountUSD) {
            return null;
        }

        return new BigNumber(destinationAmountUSD.toString())
            .div(new BigNumber(sourceAmountUSD.toString()))
            .minus(1)
            .times(100)
            .toNumber();
    }, [sourceAmountUSD, destinationAmountUSD]);

    const openSavings = () => {
        d.modal.handlers.activate('SwapSavings', path);
    };

    const savings = useMemo(() => {
        if (!path || !path.isSmartRouting || !Number(path.profit)) {
            return null;
        }

        return (
            <div className="Swap_savings" onClick={() => openSavings()}>
                Savings {roundAndFormat(path.profit)} {path.type === 'send' ? destination.code : source.code}
                <img src={images['icon-info-white']} alt="" />
            </div>
        );
    }, [path]);

    const getSendPath = useCallback(() => {
        if (!destination) {
            return;
        }
        setPending(true);

        d.swap.listenToBestPath({
            source,
            destination,
            amount: debouncedSourceAmount,
            sourcePriceUSD,
            destinationPriceUSD,
            smartSwapVersion,
            isSend: true,
            slippage: Number(getSlippageValue()) / 100,
            callback: res => {
                setPending(false);
                if (!res) {
                    setErrorText(SWAP_NO_PATH_ERROR);
                    return;
                }

                setDestinationAmount(res.optimized_sum);
                setPath(res);
            },
            errorCallback: error => {
                setErrorText(error && !error.toString().startsWith('[object') ? error.toString() : SWAP_NO_PATH_ERROR);
                setPending(false);
            },
        });
    }, [source, destination, debouncedSourceAmount, smartSwapVersion]);

    const getReceivePath = useCallback(() => {
        if (!destination) {
            return;
        }
        setPending(true);

        d.swap.listenToBestPath({
            source,
            destination,
            amount: debouncedDestinationAmount,
            destinationPriceUSD,
            sourcePriceUSD,
            smartSwapVersion,
            isSend: false,
            callback: res => {
                setPending(false);

                if (!res) {
                    setErrorText(SWAP_NO_PATH_ERROR);
                    return;
                }

                setSourceAmount(res.optimized_sum);
                setPath(res);
            },
            errorCallback: error => {
                setErrorText(error && !error.toString().startsWith('[object') ? error.toString() : SWAP_NO_PATH_ERROR);
                setPending(false);
            },
        });
    }, [source, destination, debouncedDestinationAmount, smartSwapVersion]);


    useEffect(() => {
        if (!isSend || !Number(debouncedSourceAmount) || !destination || !Number(sourceAmount) || isHidden) {
            return;
        }
        getSendPath();
    }, [debouncedSourceAmount, isSend, source, destination, smartSwapVersion, isHidden]);

    useEffect(() => {
        if (isSend || !Number(debouncedDestinationAmount) || !Number(destinationAmount) || isHidden) {
            return;
        }
        getReceivePath();
    }, [debouncedDestinationAmount, isSend, source, destination, smartSwapVersion, isHidden]);

    useEffect(() => {
        if (isHidden) {
            d.swap.unlistenToBestPath();
        }
    }, [isHidden]);

    useEffect(() => {
        if (d.modal.modalName === 'SwapConfirm' && d.modal.active) {
            d.modal.handlers.updateData({
                source,
                sourceAmount,
                sourceAmountUSD,
                destination,
                destinationAmount,
                destinationAmountUSD,
                path,
                priceImpact,
                isSend,
                smartSwapVersion,
            });
        }
    }, [
        source,
        sourceAmount,
        sourceAmountUSD,
        destination,
        destinationAmount,
        destinationAmountUSD,
        path,
        priceImpact,
        isSend,
        d.modal.modalName,
        d.modal.active,
        smartSwapVersion,
    ]);

    useEffect(() => {
        if (d.modal.modalName === 'SwapSavings' && d.modal.active) {
            d.modal.handlers.updateData(path);
        }
    }, [path]);

    const togglePrice = () => {
        setIsPriceReverted(prevState => !prevState);
    };

    const openSettings = () => {
        d.modal.handlers.activate('SwapSettings').then(() => {
            setSmartSwapVersion(getSmartSwapVersionValue());
        });
    };

    const isMediatorNeeded = smartSwapVersion === SMART_SWAP_VERSION.V2
        && d.session.state === SESSION_STATE.IN
        && d.session.authType !== AUTH_TYPE.SECRET;


    const mediatorCost = useMemo(() => {
        if (d.session.state !== SESSION_STATE.IN || !source || !destination) {
            return 0;
        }
        const subentries = 1 + d.session.account.signers.length
            + [source, destination].filter(a => !a.isNative()).length;

        return MEDIATOR_FEE_RESERVE + (0.5 * subentries);
    }, [source, destination, d.session.state]);

    const isInsufficientXLM = d.session.state === SESSION_STATE.IN ?
        mediatorCost > d.session.account.getAvailableBalance(StellarSdk.Asset.native()) :
        false;

    const onSubmit = async () => {
        const { status } = await d.modal.handlers.activate('SwapConfirm', {
            source,
            sourceAmount,
            sourceAmountUSD,
            destination,
            destinationAmount,
            destinationAmountUSD,
            path,
            priceImpact,
            smartSwapVersion,
            isSend,
        });

        if (status === 'finish') {
            // reset amounts
            setSourceAmount('');
            setDestinationAmount('');
            setPath(null);
        }
    };

    const getSwapButton = () => {
        if (d.session.state === SESSION_STATE.OUT) {
            return <button className="s-button" onClick={() => d.modal.handlers.activate('LoginModal')}>Login</button>;
        }
        if (!destination) {
            return <button className="s-button" disabled>Select an asset</button>;
        }
        if (isInsufficientXLM) {
            return <button className="s-button" disabled>Insufficient XLM Balance</button>;
        }
        if (!sourceAmount && !destinationAmount) {
            return <button className="s-button" disabled>Enter an amount</button>;
        }
        if (isInsufficientSourceBalance) {
            return <button className="s-button" disabled>Insufficient {source.code} Balance</button>;
        }
        if (isInvalidSourceAmount || isInvalidDestinationAmount) {
            return <button className="s-button" disabled>Invalid value</button>;
        }
        return (
            <button
                className="s-button"
                disabled={(!destinationAmount || !sourceAmount) || pending || isEqualAssets}
                onClick={() => onSubmit()}
            >
                Swap {source.code} to {destination.code}
                {pending && <div className="nk-spinner" />}
            </button>
        );
    };


    if (isWrongURL) {
        return <NotFound pageName="swap" />;
    }

    return (
        <div className="island Swap_container">
            <div className="Swap_header">
                <div className="Swap_title">
                    Swap assets
                </div>
                <img
                    src={images['icons-settings']}
                    alt="settings"
                    onClick={() => openSettings()}
                    className="Swap_settings"
                />
            </div>

            <div className="Swap_form">
                <SwapFormRow
                    d={d}
                    knownAssets={knownAssets}
                    myAssets={myAssets}
                    label={isSend ? 'From' : 'From (estimated)'}
                    asset={source}
                    setAsset={setSourceAsset}
                    amount={sourceAmount}
                    setAmount={handleSetSourceAmount}
                    disabledInput={isEqualAssets}
                    usdValue={sourceAmountUSD}
                    setIsInsufficient={setIsInsufficientSourceBalance}
                    setIsInvalid={setIsInvalidSourceAmount}
                    savings={(path && path.type === 'receive') ? savings : null}
                    mediatorCost={mediatorCost}
                />

                <div className="Swap_switch" onClick={() => revertAssets()}>
                    <img src={images['icons-switch-green']} alt="" />
                </div>

                <SwapFormRow
                    d={d}
                    knownAssets={knownAssets}
                    myAssets={myAssets}
                    label={isSend ? 'To (estimated)' : 'To'}
                    asset={destination}
                    setAsset={setDestinationAsset}
                    amount={destinationAmount}
                    setAmount={handleSetDestinationAmount}
                    disabledInput={isEqualAssets}
                    usdValue={destinationAmountUSD}
                    priceImpact={priceImpact}
                    isDestination
                    setIsInvalid={setIsInvalidDestinationAmount}
                    savings={(path && path.type === 'send') ? savings : null}
                />

                {price &&
                    <div className="Swap_price" onClick={() => togglePrice()}>
                        {price}
                        <img src={images.switch} alt="" />
                    </div>
                }
            </div>

            {(Boolean(errorText) || isInsufficientXLM) &&
                <InfoBlock
                    type={'warning'}
                    withIcon
                    onlyTitle
                    extraSmallInRow
                    title={
                        isInsufficientXLM ?
                            'Not enough XLM to perform a smart swap.' :
                            errorText
                    }
                />
            }

            {getSwapButton()}

            {isMediatorNeeded &&
                <div className="Swap_mediator">
                    Smart Swap needs <b>{mediatorCost} XLM</b>, which <b>will be returned</b> to your
                    <br />
                    account (minus fees) after the swap.
                </div>
            }
        </div>
    );
};

export default Swap;

Swap.propTypes = {
    d: PropTypes.instanceOf(Driver),
};
