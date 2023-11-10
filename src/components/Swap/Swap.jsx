import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import StellarSdk from 'stellar-sdk';
import BigNumber from 'bignumber.js';
import processBalances from '../Session/SessionContent/SessionAccount/AccountView/BalancesTable/processBalances';
import NotFound from '../NotFound/NotFound';
import useUpdateInterval from '../../lib/hooks/useUpdateInterval';
import images from '../../images';
import InfoBlock from '../Common/InfoBlock/InfoBlock';
import useDebounce from '../../lib/hooks/useDebounce';
import Stellarify from '../../lib/helpers/Stellarify';
import Driver from '../../lib/driver/Driver';
import { SESSION_EVENTS, SESSION_STATE } from '../../lib/constants/sessionConstants';
import { formatNumber, roundAndFormat } from '../../lib/helpers/Format';
import SwapFormRow from './SwapFormRow/SwapFormRow';


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

    const [isInsufficientSourceBalance, setIsInsufficientSourceBalance] = useState(false);
    const [isInvalidSourceAmount, setIsInvalidSourceAmount] = useState(false);
    const [isInvalidDestinationAmount, setIsInvalidDestinationAmount] = useState(false);

    const [isPriceReverted, setIsPriceReverted] = useState(false);

    const [errorText, setErrorText] = useState('');
    const [isEqualAssets, setIsEqualAssets] = useState(false);

    const history = useHistory();
    const location = useLocation();

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
            history.replace('/swap/XLM-native/USDC-www.centre.io');
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
        if (!path || !path.isSmartRouting) {
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

        d.swap.getBestSendPath({
            source,
            destination,
            sourceAmount: debouncedSourceAmount,
            sourcePriceUSD,
            destinationPriceUSD,
        }).then(res => {
            setPending(false);
            if (!res) {
                setErrorText(SWAP_NO_PATH_ERROR);
                return;
            }

            setDestinationAmount(res.optimized_sum);
            setPath(res);
        }).catch(() => {
            setErrorText(SWAP_NO_PATH_ERROR);
        });
    }, [source, destination, debouncedSourceAmount]);

    const getReceivePath = useCallback(() => {
        if (!destination) {
            return;
        }
        setPending(true);

        d.swap.getBestReceivePath({
            source,
            destination,
            destinationAmount: debouncedDestinationAmount,
            destinationPriceUSD,
            sourcePriceUSD,
        }).then(res => {
            setPending(false);

            if (!res) {
                setErrorText(SWAP_NO_PATH_ERROR);
                return;
            }

            setSourceAmount(res.optimized_sum);
            setPath(res);
        }).catch(() => {
            setErrorText(SWAP_NO_PATH_ERROR);
        });
    }, [source, destination, debouncedDestinationAmount]);


    useEffect(() => {
        if (!isSend || !Number(debouncedSourceAmount) || !destination || !Number(sourceAmount)) {
            return;
        }
        getSendPath();
    }, [debouncedSourceAmount, isSend, source, destination]);

    useEffect(() => {
        if (isSend || !Number(debouncedDestinationAmount) || !Number(destinationAmount)) {
            return;
        }
        getReceivePath();
    }, [debouncedDestinationAmount, isSend, source, destination]);

    const updateIndex = useUpdateInterval(15000, [sourceAmount, destinationAmount]);

    useEffect(() => {
        if (!Number(sourceAmount) || !Number(destinationAmount)) {
            return;
        }

        if (isSend) {
            getSendPath();
        } else {
            getReceivePath();
        }
    }, [updateIndex]);

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
        d.modal.handlers.activate('SwapSettings');
    };

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
            isSend,
        });

        if (status === 'finish') {
            // reset amounts
            setSourceAmount('');
            setDestinationAmount('');
        }
    };

    const getSwapButton = () => {
        if (d.session.state === SESSION_STATE.OUT) {
            return <button className="s-button" onClick={() => d.modal.handlers.activate('LoginModal')}>Login</button>;
        }
        if (!destination) {
            return <button className="s-button" disabled>Select an asset</button>;
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
                    savings={savings}
                />

                {price &&
                    <div className="Swap_price" onClick={() => togglePrice()}>
                        {price}
                        <img src={images.switch} alt="" />
                    </div>
                }
            </div>

            {Boolean(errorText) &&
                <InfoBlock type={'warning'} withIcon onlyTitle smallInRow title={errorText} />
            }

            {getSwapButton()}
        </div>
    );
};

export default Swap;

Swap.propTypes = {
    d: PropTypes.instanceOf(Driver),
};
