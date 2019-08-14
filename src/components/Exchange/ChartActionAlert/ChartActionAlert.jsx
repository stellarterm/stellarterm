import React from 'react';
import PropTypes from 'prop-types';

export default class ChartActionAlert extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            hideAlert: 'initial',
        };
    }

    componentDidMount() {
        this.timeoutShow = setTimeout(() => {
            this.setState({ hideAlert: false });
        }, 300);
        this.timeoutHide = setTimeout(() => {
            this.setState({ hideAlert: true });
        }, 3000);
    }

    componentWillUnmount() {
        clearTimeout(this.timeoutShow);
        clearTimeout(this.timeoutHide);
    }

    render() {
        const alertClassname = `Fullscreen_key_alert ${this.state.hideAlert ? 'keyAlert_hide' : 'keyAlert_visible'}`;

        return (
            <div className={alertClassname}>
                    <div className="keyAlert_cell">
                        {this.props.text}
                    </div>
            </div>
        );
    }
}

ChartActionAlert.propTypes = {
    text: PropTypes.string.isRequired,
};
