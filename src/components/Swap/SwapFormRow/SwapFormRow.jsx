import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { Asset } from 'stellar-sdk';
import Input from '../../Common/Input/Input';
import useForceUpdate from '../../../lib/hooks/useForceUpdate';
import { formatNumber, roundAndFormat } from '../../../lib/helpers/Format';
import Driver from '../../../lib/driver/Driver';
import { SESSION_EVENTS, SESSION_STATE } from '../../../lib/constants/sessionConstants';
import SwapAsset from './SwapAsset/SwapAsset';
import SwapAssetsList from './SwapAssetsList/SwapAssetsList';


const SwapFormRow = ({
    d,
    knownAssets,
    myAssets,
    label,
    asset,
    setAsset,
    amount,
    setAmount,
    isDestination,
    disabledInput,
    usdValue,
    priceImpact,
    setIsInsufficient,
    setIsInvalid,
}) => {
    const [isListOpen, setIsListOpen] = useState(false);

    const isLogged = d.session.state === SESSION_STATE.IN;

    const { forceUpdate, updateIndex } = useForceUpdate();

    useEffect(() => {
        const unsub = d.session.event.sub(eventName => {
            if (d.session.state === SESSION_STATE.IN && eventName === SESSION_EVENTS.ACCOUNT_EVENT) {
                forceUpdate();
            }
        });

        return () => unsub();
    }, []);

    const balance = useMemo(() => {
        if (!isLogged || !asset) {
            return null;
        }
        return isDestination ? d.session.account.getBalance(asset) : d.session.account.getAvailableBalance(asset);
    }, [isLogged, asset, d.session.account, updateIndex]);

    const isInsufficientBalance = useMemo(() => {
        if (!isLogged || !amount || isDestination) {
            return false;
        }
        return Number(amount) > Number(balance);
    }, [balance, amount, isLogged]);

    useEffect(() => {
        if (setIsInsufficient) {
            setIsInsufficient(isInsufficientBalance);
        }
    }, [isInsufficientBalance]);

    const isInvalidInput = useMemo(() => Number.isNaN(Number(amount)), [amount]);

    useEffect(() => {
        if (setIsInvalid) {
            setIsInvalid(isInvalidInput);
        }
    }, [isInvalidInput]);

    const errorText = useMemo(() => {
        if (isInvalidInput) {
            return 'Invalid value';
        }

        if (isInsufficientBalance) {
            return `Not enough ${asset.code}`;
        }

        return '';
    }, [isInvalidInput, isInsufficientBalance, asset]);

    const priceImpactRounded = (priceImpact !== null && priceImpact !== undefined) ?
        Number(priceImpact.toFixed(1)) :
        null;

    const priceImpactClassname = `${priceImpactRounded > 0 ? 'positive' : ''}${priceImpactRounded < 0 ? 'negative' : ''}`;

    return (
        <div className={`SwapFormRow ${isDestination ? 'last' : ''}`}>
            {balance !== null && (
                <div className="SwapFormRow_available">
                    {isDestination ?
                        <span>Balance: {formatNumber(Number(balance))} {asset.code}</span> :
                        <span>
                            Available: <span className="SwapFormRow_available-link" onClick={() => setAmount(balance)}>
                                {formatNumber(Number(balance))} {asset.code}
                            </span>
                        </span>
                    }
                </div>
            )}
            <Input
                value={amount}
                onChange={setAmount}
                placeholder="0.0"
                label={label}
                disabled={!asset || disabledInput}
                errorText={errorText}
                invalid={Boolean(errorText)}
                inputType="number"
                postfix={usdValue ?
                    <div className="SwapFormRow_usd">
                        {priceImpactRounded !== null
                            && <span className={priceImpactClassname}>
                                {priceImpactRounded > 0 ? '+' : ''}
                                {priceImpactRounded}%
                            </span>}
                        <span>
                            {usdValue > 1e9 ?
                                '> $1.0B' :
                                `~ $${roundAndFormat(usdValue, true, 1e3)}`
                            }</span>
                    </div> : null
                }
            />

            <SwapAsset asset={asset} d={d} openList={() => setIsListOpen(true)} />

            {isListOpen && (
                <SwapAssetsList
                    d={d}
                    closeList={() => setIsListOpen(false)}
                    setAsset={setAsset}
                    knownAssets={knownAssets}
                    myAssets={myAssets}
                />
            )}
        </div>
    );
};

export default SwapFormRow;

SwapFormRow.propTypes = {
    d: PropTypes.instanceOf(Driver),
    asset: PropTypes.instanceOf(Asset),
    setAsset: PropTypes.func,
    amount: PropTypes.string,
    setAmount: PropTypes.func,
    myAssets: PropTypes.arrayOf(PropTypes.any),
    knownAssets: PropTypes.arrayOf(PropTypes.any),
    label: PropTypes.string,
    isDestination: PropTypes.bool,
    disabledInput: PropTypes.bool,
    usdValue: PropTypes.number,
    priceImpact: PropTypes.number,
    setIsInsufficient: PropTypes.func,
    setIsInvalid: PropTypes.func,
};
