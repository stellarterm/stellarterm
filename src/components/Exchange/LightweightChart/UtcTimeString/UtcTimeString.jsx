import React from 'react';
import moment from 'moment';

export default class UtcTimeString extends React.Component {
    static getUtcString(date) {
        const utcTime = moment(date).format('HH:mm:ss');
        const utcTimeZone = moment(date).utcOffset() / 60;
        const utcTimeZoneString = utcTimeZone > 0 ? `+${utcTimeZone}` : utcTimeZone;

        return `${utcTime} (UTC${utcTimeZoneString})`;
    }

    constructor(props) {
        super(props);

        this.state = {
            timeString: this.constructor.getUtcString(new Date()),
        };
    }

    componentDidMount() {
        this.tickUTCInterval = setInterval(() => {
            this.setState({ timeString: this.constructor.getUtcString(new Date()) });
        }, 1000);
    }

    componentWillUnmount() {
        clearInterval(this.tickUTCInterval);
    }

    render() {
        return <div className="utc_Time">{this.state.timeString}</div>;
    }
}
