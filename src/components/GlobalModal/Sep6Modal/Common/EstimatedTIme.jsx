import React from 'react';
import PropTypes from 'prop-types';

export default function EstimatedTime(props) {
    const { time, kycTime, isDeposit } = props;
    const actionText = isDeposit ? 'deposit' : 'withdrawal';
    const noTimeInfo = time === undefined;
    const waitTimeInMins = Math.ceil(time / 60);
    let timeString;

    if (noTimeInfo) {
        timeString = '-';
    } else if (time < 60) {
        timeString = 'Less than one minute';
    } else if (waitTimeInMins === 1) {
        timeString = '1 minute';
    } else if (waitTimeInMins > 1) {
        timeString = `${waitTimeInMins} minutes`;
    }

    const timeTitle = `Estimated ${kycTime ? 'KYC request pending' : actionText} time`;

    return (
        <div className="content_block">
            <div className="content_title">{timeTitle}</div>
            <div className="content_text">{timeString}</div>
        </div>
    );
}

EstimatedTime.propTypes = {
    time: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    kycTime: PropTypes.bool,
    isDeposit: PropTypes.bool,
};
