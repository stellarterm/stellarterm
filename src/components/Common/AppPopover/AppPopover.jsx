import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import images from '../../../images';

export default function AppPopover(props) {
    const popoverRef = useRef(null);
    const [xPosition, setXPosition] = useState('right');
    const [yPosition, setYPosition] = useState('bottom');

    useEffect(() => {
        if (!popoverRef.current) {
            return;
        }
        const { right, bottom } = popoverRef.current.getBoundingClientRect();

        if (right > window.innerWidth) {
            setXPosition('left');
        }
        if (bottom > window.innerHeight) {
            setYPosition('top');
        }
    }, [popoverRef]);

    const { content, hoverArea } = props;

    return (
        <div className="InfoHover_block">
            {hoverArea || <img src={images['icon-info']} alt="i" />}
            <div className={`App_popover ${xPosition} ${yPosition}`} ref={popoverRef}>
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
