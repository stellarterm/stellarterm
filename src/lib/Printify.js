import React from 'react';
import BigNumber from 'bignumber.js';
import _ from 'lodash';

const Printify = {
    lightenZeros(number, numDecimals) {
        if (!_.isString(number)) {
            console.error(`lightenZeros only takes in strings. Got type: ${typeof number}`);
            return <span className="lightenZeros">{number}</span>;
        }

        const rawNum = numDecimals !== undefined ? new BigNumber(number).toFixed(numDecimals) : number;

        const wholeAmount = rawNum.replace(/\..*/, '');
        const remaining = rawNum.slice(wholeAmount.length);
        const emph = remaining.replace(/\.?0+$/, '');
        const unemphMatch = remaining.match(/\.?0+$/);

        const localedAmountSpan = Number(wholeAmount).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
        const unemphSpan = unemphMatch !== null ? <span className="lightenZeros__unemph">{unemphMatch[0]}</span> : null;

        // Formats a number into a react element with 0s unemphasized
        return (
            <span className="lightenZeros">
                {localedAmountSpan}
                {emph}
                {unemphSpan}
            </span>
        );
    },
    lighten(input) {
        if (!_.isString(input)) {
            throw new Error('lighten only takes in strings');
        }

        return (
            <span className="lightenZeros">
                <span className="lightenZeros__unemph">{input}</span>
            </span>
        );
    },
};

export default Printify;
