import React from 'react';
import PropTypes from 'prop-types';
import images from '../../../images';

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
        const { text, btnText } = this.props;
        const copyPopupClassName = this.state.copyPopup ? '' : 'noDisplay';
        const copyBtnText = btnText || 'COPY';

        return (
            <div className="CopyButton" onClick={() => this.copyTx(text)}>
                <div className={`CopyButton__popup ${copyPopupClassName}`}>Copied to clipboard</div>
                <img src={images['icon-copy']} alt="copy" width="24" height="24" />
                <span>{copyBtnText}</span>
            </div>
        );
    }
}
CopyButton.propTypes = {
    text: PropTypes.string.isRequired,
    btnText: PropTypes.string,
};
