import React from 'react';
import PropTypes from 'prop-types';

export default function EstimatedTime(props) {
    const { time } = props;
    const waitTimeInMins = Math.ceil(time / 60);
    let timeString;

    if (time < 60) {
        timeString = 'Less than one minute';
    } else if (waitTimeInMins === 1) {
        timeString = '1 minute';
    } else if (waitTimeInMins > 1) {
        timeString = `${waitTimeInMins} minutes`;
    }

    return time ? (
        <div className="content_block">
            <div className="content_title">Estimated time</div>
            <div className="content_text">{timeString}</div>
        </div>
    ) : null;
}

EstimatedTime.propTypes = {
    time: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
};
