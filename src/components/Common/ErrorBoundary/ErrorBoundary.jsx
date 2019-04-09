import React from 'react';
import PropTypes from 'prop-types';
import Generic from '../Generic/Generic';

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

        return (
            <Generic title="An unknown error occured">
                <div className="Error_text_block">
                    An unexpected error happened. If you want to help this error get fixed, please report it to the{' '}
                    <a
                        href="https://github.com/stellarterm/stellarterm/issues"
                        target="_blank"
                        rel="nofollow noopener noreferrer">
                        GitHub issue tracker
                    </a><br />
                    Include a screenshot in the issue (you may blur out account ID and other details). <br />
                    <strong>DO NOT</strong> SHARE YOUR PRIVATE KEY WITH ANYONE (begins with an S).
                </div>

                <div className="Error_text_block">
                    Please include in your report:
                    <ul className="Error_steps_list">
                        <li><strong>How to create this error</strong></li>
                        <li><strong>Account ID</strong>: G...</li>
                        <li><strong>Screenshot</strong></li>
                    </ul>
                </div>

                <div className="Error_text_block">
                    <strong>Your funds are safe</strong> and not affected by this error. This error is just a
                    display error in StellarTerm, and is not your fault.
                </div>

                <pre>
                    <strong>Url</strong>: {window.location.href}<br />
                    <strong>User agent</strong>: {window.navigator.userAgent}<br />
                    {this.state.error}
                    {'\n'}
                    {this.state.stack}
                </pre>
            </Generic>
        );
    }
}

ErrorBoundary.propTypes = {
    children: PropTypes.oneOfType([PropTypes.element, PropTypes.arrayOf(PropTypes.element)]).isRequired,
};
