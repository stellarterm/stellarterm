import React from 'react';
import PropTypes from 'prop-types';
import images from '../../../images';

const BLOCK_TYPES = ['success', 'warning', 'error'];
const BLOCK_ICONS = new Map([
    ['success', 'icon-circle-success'],
    ['warning', 'icon-warning-triangle'],
    ['error', 'icon-circle-fail'],
]);

const InfoBlock = props => {
    const { type, children, inRow, withIcon, onlyTitle, title } = props;
    const blockSize = inRow ? 'InfoRow_base' : 'InfoBlock_base';
    const infoClassName = `${blockSize} Info_${type}`;

    return (
        <div className={infoClassName}>
            {withIcon && <img className="info_icon" src={images[BLOCK_ICONS.get(type)]} alt={`icon-${type}`} />}
            {title && <div className="info_title">{title}</div>}
            {onlyTitle ? null : children}
        </div>
    );
};

InfoBlock.defaultProps = {
    type: 'success',
    children: <span>No children components provided</span>,
    inRow: false,
    withIcon: false,
    onlyTitle: false,
    title: '',
};

InfoBlock.propTypes = {
    children: PropTypes.node.isRequired,
    type: PropTypes.oneOfType(BLOCK_TYPES),
    inRow: PropTypes.bool,
    withIcon: PropTypes.bool,
    onlyTitle: PropTypes.bool,
    title: PropTypes.string,
};

export default InfoBlock;
