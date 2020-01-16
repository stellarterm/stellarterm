import React from 'react';
import PropTypes from 'prop-types';
import images from '../../../images';

export default function HiddenDescription(props) {
    const { content } = props;

    return (
        <div className="InfoHover_block">
            <img src={images['icon-info']} alt="i" />
            <div className="HiddenDescription_popup">
                {content}
            </div>
        </div>
    );
}

HiddenDescription.propTypes = {
    content: PropTypes.oneOfType([
        PropTypes.arrayOf(PropTypes.node),
        PropTypes.node,
    ]).isRequired,
};
