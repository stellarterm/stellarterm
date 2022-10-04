import React from 'react';
import PropTypes from 'prop-types';
import images from '../../../images';

const BLOCK_TYPES = ['success', 'warning', 'error'];
const BLOCK_ICONS = new Map([
    ['success', '24-icon-success-circle'],
    ['warning', '24-icon-warning-triangle'],
    ['error', '24-icon-error-circle'],
]);

const InfoBlock = props => {
    const { type, children, withIcon, onlyTitle, title, smallInRow } = props;
    const infoClassName = `InfoBlock_base Info_${type} ${smallInRow ? 'InfoBlock_smallInRow' : ''}`;

    return (
        <div className={infoClassName}>
            <div className="title_wrapper">
                {withIcon && <img className="info_icon" src={images[BLOCK_ICONS.get(type)]} alt={`icon-${type}`} />}
                <div className="info_title">{title}</div>
            </div>
            {onlyTitle ? null : children}
        </div>
    );
};

InfoBlock.defaultProps = {
    withIcon: false,
    onlyTitle: false,
    smallInRow: false,
    type: 'success',
    children: <span>No children provided. Use onlyTitle prop or provide children elements.</span>,
    title: 'Default title',
};

InfoBlock.propTypes = {
    withIcon: PropTypes.bool,
    onlyTitle: PropTypes.bool,
    smallInRow: PropTypes.bool,
    children: PropTypes.node.isRequired,
    type: PropTypes.oneOf(BLOCK_TYPES),
    title: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
};

export default InfoBlock;
