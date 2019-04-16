import React from 'react';
import PropTypes from 'prop-types';

const images = require('../images');

export default class CopyButton extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            copyPopup: false,
        };
    }
    showPopup() {
        this.setState({ copyPopup: true });
        setTimeout(() => this.setState({ copyPopup: false }), 2000);
    }
    copyTx(tx) {
        window.navigator.clipboard.writeText(tx);
        this.showPopup();
    }

    render() {
        const copyPopupClassName = this.state.copyPopup ? '' : 'noDisplay';
        return (
            <div className="CopyButton" onClick={() => this.copyTx(this.props.text)}>
                <div className={`CopyButton__popup ${copyPopupClassName}`}>Copied to clipboard</div>
                <img src={images['icon-copy']} alt="copy" width="24" height="24" />
                <span>COPY</span>
            </div>
        );
    }
}
CopyButton.propTypes = {
    text: PropTypes.string.isRequired,
};
