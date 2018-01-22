const React = window.React = require('react');
import Generic from './Generic.jsx';

// Code from https://reactjs.org/docs/error-boundaries.html

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: '',
    };
  }

  componentDidCatch(error, info) {
    // Display fallback UI
    console.error(error);
    this.setState({
      hasError: true,
      error: error.stack.toString(),
      stack: info.componentStack,
    });
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return <Generic title="An unknown error occured">
        <p>An unexpected error happened. If you want to help this error get fixed, please report it to the <a href="https://github.com/irisli/stellarterm/issues" target="_blank" rel="nofollow noopener noreferrer">GitHub issue tracker</a>. DO <strong>NOT</strong> SHARE YOUR PRIVATE KEY WITH ANYONE (begins with an S).</p>
        <p><strong>Your funds are safe</strong> and not affected by this error. This error is just a display error in StellarTerm.</p>
        <pre>
          {this.state.error}{'\n'}
          {this.state.stack}
        </pre>
      </Generic>;
    }
    return this.props.children;
  }
}
3
