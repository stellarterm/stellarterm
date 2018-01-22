const React = window.React = require('react');
import Generic from './Generic.jsx';

export default function Download() {
  return <Generic title="Download">
    <p>StellarTerm is a web app that runs in the browser. Downloading is <strong>not</strong> necessary to use StellarTerm. In both the web and desktop version, keys are <strong>never</strong> sent to any server and transactions are only signed locally.</p>

    <p>Downloads are for users that prefer a desktop version.</p>
    <table className="Generic__table">
      <tr><td>Platform</td><td>Location</td></tr>
      <tr><td>Mac OSX</td><td><a href="https://github.com/stellarterm/desktop/releases" target="_blank" rel="nofollow noopener noreferrer">https://github.com/stellarterm/desktop/releases</a></td></tr>
      <tr><td>Windows</td><td><a href="https://github.com/stellarterm/desktop/releases" target="_blank" rel="nofollow noopener noreferrer">https://github.com/stellarterm/desktop/releases</a></td></tr>
      <tr><td>Standalone html</td><td><a href="https://github.com/stellarterm/stellarterm.github.io" target="_blank" rel="nofollow noopener noreferrer">https://github.com/stellarterm/stellarterm.github.io</a></td></tr>
    </table>
    <p>Note: Unlike the web version, downloaded versions do <strong>not</strong> autoupdate (this is preferrable to some people). The code to run StellarTerm is self contained in the downloads. It does <strong>not</strong> run a Stellar node or run a Stellar API.</p>
  </Generic>
}
