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
        const { text, btnText, onlyIcon } = this.props;
        const copyPopupVisibilityClass = this.state.copyPopup ? '' : 'noDisplay';
        const copyPopupPositionClass = onlyIcon ? 'onlyIcon' : '';
        const copyBtnText = btnText || 'COPY';

        return (
            <div className="CopyButton" onClick={() => this.copyTx(text)}>
                <div className={`CopyButton__popup ${copyPopupVisibilityClass} ${copyPopupPositionClass}`}>
                    Copied to clipboard
                </div>
                <img src={images['icon-copy']} alt="copy" width="24" height="24" />
                {!onlyIcon && <span>{copyBtnText}</span>}
            </div>
        );
    }
}
CopyButton.propTypes = {
    text: PropTypes.string.isRequired,
    btnText: PropTypes.string,
    onlyIcon: PropTypes.bool,
};
