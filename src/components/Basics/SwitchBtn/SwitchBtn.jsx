import React from 'react';
import PropTypes from 'prop-types';
import images from '../../../images';

const SwitchBtn = props => {
    const { onClickFunc, iconWidth, iconHeight, smallWidth } = props;

    return (
        <div className={`${smallWidth ? 'Switch_Button_small' : 'Switch_Button'}`} onClick={onClickFunc}>
            <img src={images.switch} alt="swap" width={iconWidth} height={iconHeight} />
        </div>
    );
};

SwitchBtn.defaultProps = {
    iconWidth: 20,
    iconHeight: 24,
    smallWidth: false,
};

SwitchBtn.propTypes = {
    onClickFunc: PropTypes.func.isRequired,
    iconWidth: PropTypes.number,
    iconHeight: PropTypes.number,
    smallWidth: PropTypes.bool,
};

export default SwitchBtn;
