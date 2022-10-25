import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

const prepareNumberValue = value =>
    value.replace(/[,.]+/g, '.').replace(/^\.$/, '0.');

const getIsValidNumberString = (value, rank = 7) =>
    new RegExp(`^\\d*\\.{0,1}\\d{0,${rank}}$`).test(value);

const Input = forwardRef(
    ({
        onChange,
        value,
        label,
        invalid,
        errorText,
        prefix,
        postfix,
        bottomBoxy,
        inputType,
        ...props
    }, ref) => {
        const id = _.uniqueId();

        const onInputChange = ({ target }) => {
            const type = inputType || 'text';

            if (type !== 'text' && type !== 'number') {
                throw new Error(`Unknown input type: ${type}`);
            }
            if (type === 'text') {
                onChange(target.value);
            }

            const newValue = prepareNumberValue(target.value);

            if (!getIsValidNumberString(newValue)) {
                return;
            }

            onChange(newValue);
        };

        return (
            <div className="Input_wrapper">
                {Boolean(label) && (
                    <label htmlFor={id}>
                        {label}
                    </label>
                )}
                <div className="Input_input">
                    {Boolean(prefix) && (
                        <div className="Input_prefix">
                            {prefix}
                        </div>
                    )}
                    <input
                        ref={ref}
                        id={id}
                        className={`Input ${invalid ? 'invalid' : ''} ${prefix ? 'withPrefix' : ''} ${bottomBoxy ? 'bottomBoxy' : ''} ${postfix ? 'withPostfix' : ''}`}
                        value={value}
                        onChange={onInputChange}
                        {...props}
                    />
                    {Boolean(postfix) && (
                        <div className="Input_postfix">
                            {postfix}
                        </div>
                    )}
                    {Boolean(errorText) && (
                        <div className="Input_error-tooltip">
                            {errorText}
                        </div>
                    )}
                </div>
            </div>
        );
    });

export default Input;

Input.propTypes = {
    label: PropTypes.string,
    invalid: PropTypes.bool,
    errorText: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    value: PropTypes.string.isRequired,
    prefix: PropTypes.element,
    postfix: PropTypes.element,
    bottomBoxy: PropTypes.bool,
    inputType: PropTypes.oneOf(['text', 'number']),
};
