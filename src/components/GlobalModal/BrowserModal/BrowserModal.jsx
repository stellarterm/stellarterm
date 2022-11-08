/* eslint-disable max-len */
import React from 'react';
import PropTypes from 'prop-types';
import images from '../../../images';
import Driver from '../../../lib/driver/Driver';
import { getBrowserName } from '../../../lib/helpers/BrowserSupport';

export default class BrowserModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            dontShow: localStorage.getItem('hide-browser-popup') === 'true',
        };
    }

    onClickDontShow() {
        this.setState({ dontShow: !this.state.dontShow });
    }

    onClickCloseButton() {
        localStorage.setItem('hide-browser-popup', this.state.dontShow);
        this.props.d.modal.handlers.cancel();
    }

    render() {
        return (
            <div className="BrowserModal">
                <div className="Modal_header">
                    <span>
                        Outdated browser
                    </span>
                    <img
                        src={images['icon-close']}
                        alt="X"
                        onClick={() => { this.onClickCloseButton(); }}
                    />
                </div>

                <div className="BrowserModal_content">
                    <img src={images['icon-warning-big']} alt="warning" />

                    <p className="browser_title">
                        It looks like your {getBrowserName()} is outdated.
                    </p>

                    <p className="browser_description">
                        We have determined that you may be using a web browser version that is not supported by StellarTerm.
                        An outdated browser version may prevent you from accessing certain features.
                        Consider updating to the most recent version of your browser or try a different modern browser for the optimal experience.
                    </p>

                    <div className="browser_footer">
                        <div className="checkbox_block" onClick={() => this.onClickDontShow()}>
                            <input
                                type="checkbox"
                                onChange={() => this.onClickDontShow()}
                                checked={this.state.dontShow}
                            />
                            <span>Don{'\''}t show this message again</span>
                        </div>

                        <button
                            className="s-button"
                            onClick={() => { this.onClickCloseButton(); }}
                        >
                            I Understand
                        </button>
                    </div>
                </div>
            </div>
        );
    }
}

BrowserModal.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
    submit: PropTypes.objectOf(PropTypes.func),
};
