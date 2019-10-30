/* eslint-disable no-nested-ternary */
/* eslint-disable react/forbid-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

export default function ExtraInfoBlock(props) {
    const { extra } = props;
    const isArrayMsg = extra instanceof Array;
    const noExtraInfo = extra === '' || _.isEmpty(extra);
    const splittedMsg = isArrayMsg ? extra.map(el => `${el}\n`) : '';

    const isObjectWithFields = !isArrayMsg && !_.has(extra, 'message');
    const splittedObject = Object.keys(extra).map(key => `${key}: ${extra[key]}\n`);
    const isOnlyString = typeof extra === 'string';

    return noExtraInfo ? null : (
        <div className="content_block extra_info">
            <div className="content_title">Extra info:</div>

            {isOnlyString ? (
                <div className="content_text">{extra}</div>
            ) : (
                <div className="content_text">
                    {isObjectWithFields ? splittedObject : isArrayMsg ? splittedMsg : extra.message}
                </div>
            )}
        </div>
    );
}

ExtraInfoBlock.propTypes = {
    extra: PropTypes.any.isRequired,
};
