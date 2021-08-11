import React from 'react';
import PropTypes from 'prop-types';
import images from '../../../images';

export default function AppPopover(props) {
    const { content, hoverArea } = props;

    return (
        <div className="InfoHover_block">
            {hoverArea || <img src={images['icon-info']} alt="i" />}
            <div className="App_popover">
                {content}
            </div>
        </div>
    );
}

AppPopover.propTypes = {
    content: PropTypes.oneOfType([
        PropTypes.arrayOf(PropTypes.node),
        PropTypes.node,
    ]).isRequired,
    hoverArea: PropTypes.oneOfType([
        PropTypes.arrayOf(PropTypes.node),
        PropTypes.node,
    ]),
};
