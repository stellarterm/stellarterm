/* eslint-disable react/forbid-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

export default function ExtraInfoBlock(props) {
    const { extra } = props;
    if (_.isEmpty(extra)) { return null; }

    let extraMsg = '';
    if (extra instanceof Array) {
        extraMsg = extra.join('\n');
    } else if (typeof extra === 'string') {
        extraMsg = extra;
    } else if (extra.message) {
        extraMsg = extra.message;
    } else {
        extraMsg = Object
            .entries(extra)
            .map(([key, value]) => `${key}: ${value}`)
            .join('\n');
    }

    return (
        <div className="content_block extra_info">
            <div className="content_title">Extra info</div>
            <div className="content_text">{extraMsg}</div>
        </div>
    );
}

ExtraInfoBlock.propTypes = {
    extra: PropTypes.any.isRequired,
};
