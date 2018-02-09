const React = window.React = require('react');

export default class Header extends React.Component {
  constructor(props) {
    super(props);
  }
  componentWillUnmount() {
  }
  render() {
    let networkBar;
    if (!this.props.network.isDefault) {
      networkBar = <div className="so-back HeaderNetworkBarBack">
        <div className="so-chunk">
          <div className="HeaderNetworkBar">
            <span>Horizon url: <strong>{this.props.network.horizonUrl}</strong></span>
            <span>Network passphrase: <strong>{this.props.network.networkPassphrase}</strong></span>
          </div>
        </div>
      </div>
    }
    return <div className="HeaderBackBack">
      {networkBar}
      <div className="so-back HeaderBack">
        <div className="so-chunk Header">
          <nav className="Header__nav">
            <a className="Header__nav__item Header__nav__item--logo" href="#">StellarTerm</a>
            <a className={'Header__nav__item Header__nav__item--link' + (this.props.urlParts[0] === 'exchange' ? ' is-current' : '')} href="#exchange">Exchange</a>
            <a className={'Header__nav__item Header__nav__item--link' + (this.props.urlParts[0] === 'markets' ? ' is-current' : '')} href="#markets">Markets</a>
            <a className={'Header__nav__item Header__nav__item--link' + (this.props.urlParts[0] === 'account' ? ' is-current' : '')} href="#account">Account</a>
            <a className={'Header__nav__item Header__nav__item--link' + (this.props.urlParts[0] === 'download' ? ' is-current' : '')} href="#download">Download</a>
          </nav>
          <span className="Header__version">v{window.stBuildInfo.version}</span>
        </div>
      </div>
    </div>
  }
}

