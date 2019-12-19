import React from 'react';
import PropTypes from 'prop-types';
import Generic from '../Generic/Generic';
import CopyButton from '../CopyButton/CopyButton';
import images from '../../../images';

export default class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: '',
        };
    }

    componentDidCatch(error, info) {
        console.error(error);
        this.setState({
            hasError: true,
            error: error.stack.toString(),
            stack: info.componentStack,
        });
    }

    render() {
        if (!this.state.hasError) {
            return <div>{this.props.children}</div>;
        }

        const errorText = `URL: ${window.location.href} <br \/>User agent: ${window.navigator.userAgent} \n
            ${this.state.error} \n ${this.state.stack}`;

        return (
            <div className="Error_boundary">
                <Generic>
                    <div className="Error_boundary_title">
                        <img src={images['icon-warning-big']} alt="warning" />
                        <h1>An unknown error occurred</h1>
                        <p>
                            Don’t worry <strong>your funds are safe</strong> and not affected by this error.
                            This error is just a display error in StellarTerm, and is not your fault.
                        </p>
                    </div>
                    <div className="Error_content">
                        <p>
                            If you want to help this error get fixed,{' '}
                            please report it to the GitHub issue tracker adding:
                        </p>

                        <ul className="Error_steps_list">
                            <li>The steps that led to this error</li>
                            <li>Your account ID (G…)</li>
                            <li>The error code is listed below</li>
                        </ul>

                        <p className="secretKey_warning">
                            <img src={images['icon-error-triangle']} alt="key-warning" />
                            <span>Don’t share your private key with anyone (begins with an S)</span>
                        </p>

                        <div className="issue_btns_container">
                            <a
                                className="issue_btn"
                                href="https://github.com/stellarterm/stellarterm/issues"
                                target="_blank"
                                rel="nofollow noopener noreferrer">
                                Report an issue
                            </a>
                            <CopyButton text={errorText} btnText={'COPY ERROR TEXT'} />
                        </div>

                        <pre>
                            <strong>Url</strong>: {window.location.href}<br />
                            <strong>User agent</strong>: {window.navigator.userAgent}<br />
                            {this.state.error}
                            {'\n'}
                            {this.state.stack}
                        </pre>
                    </div>

                </Generic>
            </div>
        );
    }
}

ErrorBoundary.propTypes = {
    children: PropTypes.oneOfType([PropTypes.element, PropTypes.arrayOf(PropTypes.element)]).isRequired,
};
