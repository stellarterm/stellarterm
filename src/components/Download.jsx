const React = window.React = require('react');
import Generic from './Generic.jsx';

export default function Download() {
  return <Generic title="Download">
    <p>StellarTerm is a web app that runs in the browser. Downloading is <strong>not required</strong> to use StellarTerm. In both the web and desktop version, keys are <strong>never</strong> sent to any server and transactions are only signed locally. Downloads are for users that prefer a desktop version.</p>
    <p>Unlike the web version, downloaded versions do not auto-update (this is preferrable to some people). Also, the web version will receive updates sooner than the desktop versions do. The code to run StellarTerm is self contained in the downloads, though it does not run a Stellar node or run a Stellar API.</p>
    <div className="Generic__divider"></div>
    <h2>StellarTerm Desktop Client Download</h2>
    <br />
    <table className="Generic__table">
      <tr><td>Platform</td><td>Location</td></tr>
      <tr><td>Mac OSX</td><td><a href="https://github.com/stellarterm/stellarterm-desktop-client/releases" target="_blank" rel="nofollow noopener noreferrer">https://github.com/stellarterm/stellarterm-desktop-client/releases</a></td></tr>
      <tr><td>Windows</td><td><a href="https://github.com/stellarterm/stellarterm-desktop-client/releases" target="_blank" rel="nofollow noopener noreferrer">https://github.com/stellarterm/stellarterm-desktop-client/releases</a></td></tr>
      <tr><td>Standalone html</td><td><a href="https://github.com/stellarterm/stellarterm.github.io" target="_blank" rel="nofollow noopener noreferrer">https://github.com/stellarterm/stellarterm.github.io</a></td></tr>
    </table>
  </Generic>
}
