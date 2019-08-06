import React from 'react';
import PropTypes from 'prop-types';

export default class FullscreenKeyAlert extends React.Component {
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
        }, 4000);
    }

    componentWillUnmount() {
        clearTimeout(this.timeoutShow);
        clearTimeout(this.timeoutHide);
    }

    render() {
        const alertClassname = `Fullscreen_key_alert ${this.state.hideAlert ? 'keyAlert_hide' : 'keyAlert_visible'}`;

        return (
            <div className={alertClassname}>
                {this.props.fullscreenMode ? (
                    <div className="keyAlert_cell">
                        Press <span className="exitKey_border">Esc</span> to exit or{' '}
                        <span className="exitKey_border">F</span> to toggle full screen
                    </div>
                ) : null}
            </div>
        );
    }
}

FullscreenKeyAlert.propTypes = {
    fullscreenMode: PropTypes.bool.isRequired,
};
