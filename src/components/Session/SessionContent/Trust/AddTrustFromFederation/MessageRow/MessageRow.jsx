import React from 'react';
import PropTypes from 'prop-types';

export default function MessageRow(props) {
    const { isError, children } = props;
    const rowClassName = `row__message${isError ? ' row__message--error' : ''}`;

    return (
        <div className="row">
            <div className={rowClassName}>{children}</div>
        </div>
    );
}

MessageRow.propTypes = {
    children: PropTypes.oneOfType([PropTypes.element, PropTypes.arrayOf(PropTypes.element)]).isRequired,
    isError: PropTypes.bool,
};
