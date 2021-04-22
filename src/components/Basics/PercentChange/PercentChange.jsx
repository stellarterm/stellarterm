import React from 'react';
import PropTypes from 'prop-types';
import images from '../../../images';

const PercentChange = props => {
    const { withIcon, isHidden, changePercent } = props;

    if (isHidden) {
        return null;
    }

    const isPositive = Number(changePercent) > 0;
    const isNeutral = changePercent === '0.00';

    if (isNeutral) {
        return <span>{changePercent}%</span>;
    }

    return (
        <span className={`PercentChange_${isPositive ? 'positive' : 'negative'}`}>
            {withIcon && (
                <img
                    className="PercentChange_arrow"
                    src={images[isPositive ? 'icon-trade-up' : 'icon-trade-down']}
                    alt=""
                />
            )}
            {changePercent}%
        </span>
    );
};

PercentChange.defaultProps = {
    withIcon: true,
    isHidden: false,
    changePercent: '0.00',
};

PercentChange.propTypes = {
    withIcon: PropTypes.bool,
    isHidden: PropTypes.bool,
    changePercent: PropTypes.string,
};

export default PercentChange;
