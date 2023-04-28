import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import images from '../../../../../images';
import CopyButton from '../../../../Common/CopyButton/CopyButton';

const DestinationBlock = ({ label, destination }) => {
    const [isShorted, setIsShorted] = useState(true);

    const toggle = () => {
        setIsShorted(prev => !prev);
    };

    const viewKey = useMemo(() =>
        (isShorted ? `${destination.slice(0, 6)}...${destination.slice(-6)}` : destination),
    [isShorted],
    );

    return (
        <div className="content_block">
            <div className="content_title">{label}</div>
            <div className="content_text">
                {viewKey}
            </div>
            <div className="Destination_buttons">
                <div className="Destination_button" onClick={() => toggle()}>
                    <img src={images[isShorted ? 'icon-eye-hide' : 'icon-eye']} alt="show-full" />
                </div>
                <div className="Destination_button">
                    <CopyButton text={destination} onlyIcon />
                </div>
            </div>
        </div>
    );
};

export default DestinationBlock;


DestinationBlock.propTypes = {
    label: PropTypes.string.isRequired,
    destination: PropTypes.string.isRequired,
};
